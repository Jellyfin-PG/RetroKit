import { CoreRegistry } from '../core/CoreRegistry';
import type {
  CoreCapabilities,
  CoreOptionDefinition,
  GameLoadOptions,
} from '../core/types';
import { BaseCoreBridge } from './BaseCoreBridge';
import type { AdapterContext } from './ICoreAdapter';

/**
 * LibretroAdapter manages Emscripten-compiled Libretro cores from both
 * EmulatorJS data bundles and web.libretro.com (including retro8 for PICO-8).
 */
export class LibretroAdapter extends BaseCoreBridge {
  public readonly id: string;
  public readonly name: string;
  public readonly system: string;
  public readonly capabilities: CoreCapabilities;

  private _module: any = null;
  private _romData: Uint8Array | null = null;
  private _romPath = '/home/web_user/retroarch/userdata/content/rom.bin';
  private _sramPath = '/home/web_user/retroarch/userdata/saves/rom.srm';
  private _fps = 60;
  private _coreOptionsMap: Record<string, string> = {};
  private _additionalFiles: Array<{ name: string; data: Uint8Array }> = [];
  private _started = false;
  private _pendingBios = new Map<string, Uint8Array>();
  private _isFastForward = false;
  private _isSlowMotion = false;

  constructor(
    id: string,
    name: string,
    system: string,
    capabilities: CoreCapabilities,
  ) {
    super();
    this.id = id;
    this.name = name;
    this.system = system;
    this.capabilities = capabilities;
  }

  public async init(context: AdapterContext): Promise<void> {
    await super.init(context);
  }

  public async loadGame(
    rom: ArrayBuffer | Blob | string | Uint8Array,
    options?: GameLoadOptions,
  ): Promise<void> {
    if (typeof rom === 'string') {
      const resp = await fetch(rom, { headers: this.context?.fetchHeaders });
      if (!resp.ok)
        throw new Error(
          `[LibretroAdapter] Failed to fetch ROM from URL: ${rom}`,
        );
      const buf = await resp.arrayBuffer();
      this._romData = new Uint8Array(buf);
    } else if (rom instanceof Blob) {
      const buf = await rom.arrayBuffer();
      this._romData = new Uint8Array(buf);
    } else if (rom instanceof Uint8Array) {
      this._romData = rom;
    } else {
      this._romData = new Uint8Array(rom);
    }

    let safeName = options?.fileName || 'rom.bin';
    // When booting PICO-8 carts on retro8, RetroArch's web frontend attempts to intercept
    // files ending in .png as static images instead of passing them to the core.
    // Map .p8.png and .png files to .p8 in the virtual filesystem so retro8 receives the content directly.
    if (
      (this.id === 'retro8' || this.system === 'pico8') &&
      safeName.toLowerCase().endsWith('.png')
    ) {
      safeName = safeName
        .replace(/\.p8\.png$/i, '.p8')
        .replace(/\.png$/i, '.p8');
    }

    this._romPath = `/home/web_user/retroarch/userdata/content/${safeName}`;
    const baseName = safeName.replace(/\.[^.]+$/, '');
    this._sramPath = `/home/web_user/retroarch/userdata/saves/${baseName}.srm`;

    this._additionalFiles = [];
    if (options?.additionalFiles) {
      for (const f of options.additionalFiles) {
        let bytes: Uint8Array;
        if (f.data instanceof Uint8Array) {
          bytes = f.data;
        } else if (f.data instanceof ArrayBuffer) {
          bytes = new Uint8Array(f.data);
        } else if (f.data instanceof Blob) {
          const buf = await f.data.arrayBuffer();
          bytes = new Uint8Array(buf);
        } else {
          bytes = new Uint8Array(f.data);
        }
        this._additionalFiles.push({ name: f.name, data: bytes });
      }
    }

    await this._instantiateCoreModule();

    if (options?.initialSram && options.initialSram instanceof Uint8Array) {
      await this.rawSetSram(options.initialSram);
    }

    this.start();
  }

  public override start(): void {
    super.start();
    if (!this._module) return;

    if (!this._started) {
      this._started = true;
      if (typeof this._module.callMain === 'function') {
        try {
          const args = this._module.arguments || [
            '-v',
            this._romPath,
            '-c',
            '/home/web_user/retroarch/userdata/retroarch.cfg',
          ];
          this._module.callMain(args);
        } catch (err: any) {
          if (err && err.name !== 'ExitStatus') {
            console.error('[LibretroAdapter] Error starting callMain:', err);
          } else if (err?.status && err.status !== 0) {
            console.error(
              `[LibretroAdapter] Core exited with code ${err.status}`,
            );
          }
        }
      }
    } else {
      this.resume();
    }
  }

  public override pause(): void {
    super.pause();
    if (this._module) {
      if (typeof this._module.pauseMainLoop === 'function') {
        this._module.pauseMainLoop();
      } else if (typeof this._module.EmscriptenSendCommand === 'function') {
        this._module.EmscriptenSendCommand('PAUSE_TOGGLE');
      }
    }
  }

  public override resume(): void {
    super.resume();
    if (!this._started) {
      this.start();
      return;
    }
    if (this._module) {
      if (typeof this._module.resumeMainLoop === 'function') {
        this._module.resumeMainLoop();
      } else if (typeof this._module.EmscriptenSendCommand === 'function') {
        this._module.EmscriptenSendCommand('PAUSE_TOGGLE');
      }
    }
  }

  public override async stop(): Promise<void> {
    await super.stop();
    if (this._module && typeof this._module.pauseMainLoop === 'function') {
      this._module.pauseMainLoop();
    }
    await this.rawFlushSram();
  }

  public override async restart(): Promise<void> {
    if (!this._module) return;
    if (typeof this._module.EmscriptenSendCommand === 'function') {
      this._module.EmscriptenSendCommand('RESET');
    } else {
      this._dispatchKeyboardFallback(100, true);
      setTimeout(() => this._dispatchKeyboardFallback(100, false), 50);
    }
    if (this.isPausedInternal) {
      this.resume();
    }
  }

  public override async destroy(): Promise<void> {
    await super.destroy();
    if (this._module) {
      if (typeof this._module.pauseMainLoop === 'function') {
        try {
          this._module.pauseMainLoop();
        } catch (_) {}
      }
      if (this._module.PThread?.terminateAllThreads) {
        try {
          this._module.PThread.terminateAllThreads();
        } catch (_) {}
      }
      if (typeof this._module.abort === 'function') {
        try {
          this._module.abort();
        } catch (_) {}
      }
      this._module = null;
    }
    this._romData = null;
    this._started = false;
  }

  // --- Save States ---
  public override async rawSaveState(_slot = 0): Promise<Uint8Array | null> {
    if (!this._module) return null;

    // Check if this core is running under EmulatorJS gameManager
    if (
      this._module.gameManager &&
      typeof this._module.gameManager.getState === 'function'
    ) {
      const state = this._module.gameManager.getState();
      return state ? new Uint8Array(state) : null;
    }

    // Try direct Libretro C-binding serialization
    if (
      typeof this._module._retro_serialize === 'function' &&
      typeof this._module._retro_serialize_size === 'function'
    ) {
      const size = this._module._retro_serialize_size();
      if (size > 0) {
        const ptr = this._module._malloc(size);
        const success = this._module._retro_serialize(ptr, size);
        if (success) {
          const result = new Uint8Array(
            this._module.HEAPU8.buffer,
            ptr,
            size,
          ).slice();
          this._module._free(ptr);
          return result;
        }
        this._module._free(ptr);
      }
    }

    // RetroArch Web WASM: dispatch command and read the state snapshot from virtual FS
    if (this._module.FS) {
      const statesDir = '/home/web_user/retroarch/userdata/states';
      const contentDir = '/home/web_user/retroarch/userdata/content';
      this._ensureDirectories(this._module.FS, statesDir);
      this._ensureDirectories(this._module.FS, contentDir);

      // Clean existing state files so we know the next read is fresh
      const oldFiles = this._findStateFiles(this._module.FS);
      for (const item of oldFiles) {
        try {
          this._module.FS.unlink(item.path);
        } catch (_) {}
      }

      // Trigger save state using standard RetroArch command
      if (
        typeof this._module.EmscriptenSendCommand === 'function' ||
        typeof this._module.ccall === 'function'
      ) {
        this._sendCommand('SAVE_STATE');
      } else {
        // Fallback to keyboard hotkey only if command interface is not exposed
        this._dispatchKeyboardFallback(101, true); // F2
        await new Promise((resolve) => setTimeout(resolve, 60));
        this._dispatchKeyboardFallback(101, false);
      }

      // Poll until RetroArch writes the new state file (up to 2000ms)
      for (let attempt = 0; attempt < 40; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        const found = this._findStateFiles(this._module.FS);
        if (found.length > 0) {
          this.context?.onLog?.(
            `[LibretroAdapter] Captured state snapshot: ${found[0].path} (${found[0].data.byteLength} bytes)`,
            'info',
          );
          return found[0].data;
        }
      }
      this.context?.onLog?.(
        `[LibretroAdapter] Save state polling timed out. No state file in FS.`,
        'warn',
      );
    }

    return null;
  }

  public override async rawLoadState(
    data: Uint8Array,
    slot = 0,
  ): Promise<boolean> {
    if (!this._module) return false;

    // EmulatorJS gameManager loadState
    if (
      this._module.gameManager &&
      typeof this._module.gameManager.loadState === 'function'
    ) {
      this._module.gameManager.loadState(data);
      return true;
    }

    // Direct Libretro C-binding deserialization
    if (typeof this._module._retro_unserialize === 'function') {
      const ptr = this._module._malloc(data.byteLength);
      this._module.HEAPU8.set(data, ptr);
      const success = this._module._retro_unserialize(ptr, data.byteLength);
      this._module._free(ptr);
      return !!success;
    }

    // RetroArch Web: write state snapshot to virtual FS then dispatch LOAD_STATE
    if (this._module.FS) {
      const statesDir = '/home/web_user/retroarch/userdata/states';
      const contentDir = '/home/web_user/retroarch/userdata/content';
      try {
        this._ensureDirectories(this._module.FS, statesDir);
        this._ensureDirectories(this._module.FS, contentDir);
        const fileName = this._romPath.split('/').pop() || 'rom.bin';
        const baseName = fileName.replace(/\.[^.]+$/, '');
        const baseNames = new Set<string>([baseName]);

        // If ROM is a ZIP archive, RetroArch derives the state filename from the inner ROM filename
        const innerZipName = this._extractZipFirstEntryName(this._romData);
        if (innerZipName) {
          const innerClean = innerZipName.split('/').pop() || innerZipName;
          const innerBase = innerClean.replace(/\.[^.]+$/, '');
          if (innerBase) baseNames.add(innerBase);
        }

        for (const name of baseNames) {
          // Write snapshot to states directory
          this._module.FS.writeFile(`${statesDir}/${name}.state`, data);
          this._module.FS.writeFile(`${statesDir}/${name}.state.auto`, data);
          this._module.FS.writeFile(`${statesDir}/${name}.state0`, data);
          this._module.FS.writeFile(`${statesDir}/${name}.state1`, data);
          if (slot > 1) {
            this._module.FS.writeFile(
              `${statesDir}/${name}.state${slot}`,
              data,
            );
          }

          // Write snapshot to content directory (RetroArch default fallback)
          this._module.FS.writeFile(`${contentDir}/${name}.state`, data);
          this._module.FS.writeFile(`${contentDir}/${name}.state.auto`, data);
          this._module.FS.writeFile(`${contentDir}/${name}.state0`, data);
          this._module.FS.writeFile(`${contentDir}/${name}.state1`, data);
          if (slot > 1) {
            this._module.FS.writeFile(
              `${contentDir}/${name}.state${slot}`,
              data,
            );
          }
        }

        // Also overwrite any existing state file discovered anywhere in FS
        const existing = this._findStateFiles(this._module.FS);
        for (const item of existing) {
          try {
            this._module.FS.writeFile(item.path, data);
          } catch (_) {}
        }

        // Trigger load state using standard RetroArch command (with F4 fallback if command interface is unavailable)
        if (!this._sendCommand('LOAD_STATE')) {
          this._dispatchKeyboardFallback(102, true); // F4
          await new Promise((r) => setTimeout(r, 60));
          this._dispatchKeyboardFallback(102, false);
        }

        this.context?.onLog?.(
          `[LibretroAdapter] Injected state data into FS and triggered LOAD_STATE`,
          'info',
        );
        return true;
      } catch (err) {
        console.warn('[LibretroAdapter] Error injecting state into FS:', err);
      }
    }

    return false;
  }

  // --- In-Game Battery SRAM ---
  public override async rawGetSram(): Promise<Uint8Array | null> {
    if (!this._module) return null;

    if (
      this._module.gameManager &&
      typeof this._module.gameManager.getSaveFile === 'function'
    ) {
      const raw = this._module.gameManager.getSaveFile();
      return raw ? new Uint8Array(raw) : null;
    }

    if (this._module.FS && this._sramPath) {
      try {
        if (this._module.FS.analyzePath(this._sramPath).exists) {
          const fileData = this._module.FS.readFile(this._sramPath);
          return new Uint8Array(fileData);
        }
      } catch (_) {}
    }

    return null;
  }

  public override async rawSetSram(
    data: Uint8Array | Record<string, Uint8Array>,
  ): Promise<boolean> {
    if (!this._module || !(data instanceof Uint8Array)) return false;

    if (this._module.FS) {
      try {
        const dir = this._sramPath.substring(
          0,
          this._sramPath.lastIndexOf('/'),
        );
        this._ensureDirectories(this._module.FS, dir);
        this._module.FS.writeFile(this._sramPath, data);

        if (
          this._module.gameManager &&
          typeof this._module.gameManager.loadSaveFiles === 'function'
        ) {
          this._module.gameManager.loadSaveFiles();
        }
        return true;
      } catch (e) {
        console.warn(
          '[LibretroAdapter] Failed to write SRAM to virtual FS:',
          e,
        );
      }
    }

    return false;
  }

  public override async rawFlushSram(): Promise<void> {
    if (
      this._module?.gameManager &&
      typeof this._module.gameManager.saveSaveFiles === 'function'
    ) {
      try {
        this._module.gameManager.saveSaveFiles();
      } catch (_) {}
    }
  }

  public override getSramPath(): string {
    return this._sramPath;
  }

  // --- BIOS / System Firmware ---
  public override async rawSetBios(
    name: string,
    data: Uint8Array,
  ): Promise<void> {
    const cleanName = name.replace(/^.*[\\/]/, '');
    this._pendingBios.set(cleanName, data);
    const sysDir = '/home/web_user/retroarch/userdata/system';
    if (this._module?.FS) {
      this._ensureDirectories(this._module.FS, sysDir);
      this._module.FS.writeFile(`${sysDir}/${cleanName}`, data);
      this.context?.onLog?.(
        `[LibretroAdapter] Injected BIOS: ${cleanName} (${data.byteLength} bytes)`,
        'info',
      );
    }
  }

  // --- Memory Inspection (RetroAchievements / RAM) ---
  public override rawReadMemory(
    address: number,
    length: number,
  ): Uint8Array | null {
    if (!this._module) return null;
    try {
      if (typeof this._module._retro_get_memory_data === 'function') {
        const ptr = this._module._retro_get_memory_data(0); // RETRO_MEMORY_SYSTEM_RAM = 0
        const totalSize =
          typeof this._module._retro_get_memory_size === 'function'
            ? this._module._retro_get_memory_size(0)
            : 0;
        if (
          ptr &&
          totalSize > 0 &&
          address + length <= totalSize &&
          this._module.HEAPU8
        ) {
          return new Uint8Array(
            this._module.HEAPU8.buffer,
            ptr + address,
            length,
          ).slice();
        }
      }
    } catch (_) {}
    return null;
  }

  public override rawGetMemorySize(): number {
    if (!this._module) return 0;
    try {
      if (typeof this._module._retro_get_memory_size === 'function') {
        return this._module._retro_get_memory_size(0);
      }
    } catch (_) {}
    return 0;
  }

  // --- Core Options ---
  public override rawGetOptions(): CoreOptionDefinition[] {
    if (
      this._module?.gameManager &&
      typeof this._module.gameManager.getCoreOptions === 'function'
    ) {
      const raw = this._module.gameManager.getCoreOptions();
      if (typeof raw === 'string') {
        return this._parseCoreOptionsString(raw);
      }
    }

    // RetroArch Web WASM writes active core options to retroarch-core-options.cfg in FS
    if (this._module?.FS) {
      const cfgPaths = [
        '/home/web_user/retroarch/userdata/retroarch-core-options.cfg',
        '/home/web_user/retroarch/userdata/config/retroarch-core-options.cfg',
      ];
      for (const p of cfgPaths) {
        try {
          if (this._module.FS.analyzePath(p).exists) {
            const text = this._module.FS.readFile(p, { encoding: 'utf8' });
            const parsed = this._parseRetroArchCoreOptionsCfg(text);
            if (parsed.length > 0) return parsed;
          }
        } catch (_) {}
      }
    }
    return [];
  }

  public override rawSetOption(key: string, value: string): void {
    this._coreOptionsMap[key] = value;
    if (
      this._module?.gameManager &&
      typeof this._module.gameManager.setVariable === 'function'
    ) {
      try {
        this._module.gameManager.setVariable(key, value);
      } catch (_) {}
    }

    if (this._module?.FS) {
      const cfgPaths = [
        '/home/web_user/retroarch/userdata/retroarch-core-options.cfg',
        '/home/web_user/retroarch/userdata/config/retroarch-core-options.cfg',
      ];
      let wrote = false;
      for (const cfgPath of cfgPaths) {
        const isPrimary = cfgPath.endsWith(
          'userdata/retroarch-core-options.cfg',
        );
        try {
          if (!isPrimary && !this._module.FS.analyzePath(cfgPath).exists) {
            continue;
          }
          let lines: string[] = [];
          if (this._module.FS.analyzePath(cfgPath).exists) {
            const text: string = this._module.FS.readFile(cfgPath, {
              encoding: 'utf8',
            });
            lines = text.split('\n');
          }
          let updated = false;
          const newLine = `${key} = "${value}"`;
          lines = lines.map((line) => {
            if (
              line.trim().startsWith(`${key} `) ||
              line.trim().startsWith(`${key}=`)
            ) {
              updated = true;
              return newLine;
            }
            return line;
          });
          if (!updated) lines.push(newLine);
          this._module.FS.writeFile(cfgPath, lines.join('\n'));
          wrote = true;
        } catch (_) {}
      }

      if (wrote && typeof this._module._cmd_reload_config === 'function') {
        try {
          this._module._cmd_reload_config();
        } catch (_) {}
      }
    }
  }

  private _parseRetroArchCoreOptionsCfg(raw: string): CoreOptionDefinition[] {
    const results: CoreOptionDefinition[] = [];
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx <= 0) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed
        .slice(eqIdx + 1)
        .trim()
        .replace(/^"|"$/g, '');
      const choicesSet = new Set<string>([val]);
      if (val === 'enabled' || val === 'disabled') {
        choicesSet.add('enabled');
        choicesSet.add('disabled');
      } else if (val === 'true' || val === 'false') {
        choicesSet.add('true');
        choicesSet.add('false');
      } else if (val === 'ON' || val === 'OFF') {
        choicesSet.add('ON');
        choicesSet.add('OFF');
      }
      const choices = Array.from(choicesSet).map((c) => ({
        value: c,
        label: c,
      }));
      results.push({
        id: key,
        label: key.replace(/^[^_]+_/, '').replace(/_/g, ' '),
        type: 'enum',
        choices,
        defaultValue: val,
        currentValue: this._coreOptionsMap[key] ?? val,
      });
    }
    return results;
  }

  // --- Cheats ---
  public override rawSetCheat(
    index: number,
    enabled: boolean,
    code: string,
  ): void {
    if (this._module && typeof this._module.cheatChanged === 'function') {
      try {
        this._module.cheatChanged(enabled, code, index);
      } catch (_) {}
    }
  }

  public override rawResetCheats(): void {
    if (this._module && typeof this._module._retro_cheat_reset === 'function') {
      try {
        this._module._retro_cheat_reset();
      } catch (_) {}
    }
  }

  // --- Multi-Disc ---
  public override rawGetDiscCount(): number {
    return 1;
  }

  public override async rawChangeDisc(index: number): Promise<boolean> {
    if (
      this._module?.gameManager &&
      typeof this._module.gameManager.loadDisc === 'function'
    ) {
      try {
        this._module.gameManager.loadDisc(index);
        return true;
      } catch (_) {}
    }
    return false;
  }

  // --- Input ---
  public override rawSendButton(
    player: number,
    buttonId: number,
    pressed: boolean,
  ): void {
    if (
      this._module?.gamepad &&
      typeof this._module.gamepad.sendButton === 'function'
    ) {
      this._module.gamepad.sendButton(player, buttonId, pressed);
    } else if (
      this._module?.gameManager &&
      typeof this._module.gameManager.simulateInput === 'function'
    ) {
      this._module.gameManager.simulateInput(player, buttonId, pressed ? 1 : 0);
    } else if (this._module?.simulateGamepadButton) {
      this._module.simulateGamepadButton(player, buttonId, pressed);
    } else {
      // Direct DOM KeyboardEvent fallback for RetroArch Web Player
      this._dispatchKeyboardFallback(buttonId, pressed);
    }
  }

  private _sendCommand(cmd: string): boolean {
    if (!this._module) return false;
    try {
      if (typeof this._module.EmscriptenSendCommand === 'function') {
        this._module.EmscriptenSendCommand(cmd);
        return true;
      } else if (typeof this._module.ccall === 'function') {
        this._module.ccall('EmscriptenSendCommand', null, ['string'], [cmd]);
        return true;
      }
    } catch (e) {
      console.warn('[LibretroAdapter] _sendCommand failed for:', cmd, e);
    }
    return false;
  }

  private _isDispatchingFallback = false;

  private _dispatchKeyboardFallback(buttonId: number, pressed: boolean): void {
    if (this._isDispatchingFallback) return;
    this._isDispatchingFallback = true;

    try {
      const keyMap: Record<
        number,
        { key: string; code: string; keyCode: number }
      > = {
        4: { key: 'ArrowUp', code: 'ArrowUp', keyCode: 38 },
        5: { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40 },
        6: { key: 'ArrowLeft', code: 'ArrowLeft', keyCode: 37 },
        7: { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39 },
        0: { key: 'z', code: 'KeyZ', keyCode: 90 }, // B button
        8: { key: 'x', code: 'KeyX', keyCode: 88 }, // A button
        1: { key: 'a', code: 'KeyA', keyCode: 65 }, // Y button
        9: { key: 's', code: 'KeyS', keyCode: 83 }, // X button
        2: { key: 'Shift', code: 'ShiftRight', keyCode: 16 }, // Select
        3: { key: 'Enter', code: 'Enter', keyCode: 13 }, // Start
        10: { key: 'q', code: 'KeyQ', keyCode: 81 }, // L
        11: { key: 'w', code: 'KeyW', keyCode: 87 }, // R
        100: { key: 'h', code: 'KeyH', keyCode: 72 }, // Reset
        101: { key: 'F2', code: 'F2', keyCode: 113 }, // Save State
        102: { key: 'F4', code: 'F4', keyCode: 115 }, // Load State
      };

      const def = keyMap[buttonId];
      if (def) {
        const type = pressed ? 'keydown' : 'keyup';
        const event = new KeyboardEvent(type, {
          key: def.key,
          code: def.code,
          keyCode: def.keyCode,
          which: def.keyCode,
          bubbles: false,
          cancelable: true,
        });
        (event as any)._isRetroKitSynthetic = true;

        if (this.context?.canvas) {
          this.context.canvas.dispatchEvent(event);
        }
      }
    } finally {
      this._isDispatchingFallback = false;
    }
  }

  public override rawSendAxis(
    player: number,
    axisId: number,
    value: number,
  ): void {
    if (
      this._module?.gamepad &&
      typeof this._module.gamepad.sendAxis === 'function'
    ) {
      this._module.gamepad.sendAxis(player, axisId, value);
    } else if (
      this._module?.gameManager &&
      typeof this._module.gameManager.simulateInput === 'function'
    ) {
      const deadzone = 0.05;
      const absVal = Math.abs(value);
      const intVal = absVal > deadzone ? Math.round(absVal * 32767) : 0;

      // Map standard axis ID to EmulatorJS analog direction IDs
      if (axisId === 0) {
        // L_STICK_X
        this._module.gameManager.simulateInput(
          player,
          16,
          value > deadzone ? intVal : 0,
        ); // RIGHT
        this._module.gameManager.simulateInput(
          player,
          17,
          value < -deadzone ? intVal : 0,
        ); // LEFT
      } else if (axisId === 1) {
        // L_STICK_Y
        this._module.gameManager.simulateInput(
          player,
          18,
          value > deadzone ? intVal : 0,
        ); // DOWN
        this._module.gameManager.simulateInput(
          player,
          19,
          value < -deadzone ? intVal : 0,
        ); // UP
      } else if (axisId === 2) {
        // R_STICK_X
        this._module.gameManager.simulateInput(
          player,
          20,
          value > deadzone ? intVal : 0,
        ); // RIGHT
        this._module.gameManager.simulateInput(
          player,
          21,
          value < -deadzone ? intVal : 0,
        ); // LEFT
      } else if (axisId === 3) {
        // R_STICK_Y
        this._module.gameManager.simulateInput(
          player,
          22,
          value > deadzone ? intVal : 0,
        ); // DOWN
        this._module.gameManager.simulateInput(
          player,
          23,
          value < -deadzone ? intVal : 0,
        ); // UP
      }
    }
  }

  public override rawGetFps(): number {
    return this._fps;
  }

  public override rawSetSpeed(ratio: number): void {
    const wantFf = ratio > 1.05;
    const wantSlow = ratio > 0 && ratio < 0.95;

    if (wantFf !== this._isFastForward) {
      this._isFastForward = wantFf;
      this._sendCommand('FAST_FORWARD');
    }
    if (wantSlow !== this._isSlowMotion) {
      this._isSlowMotion = wantSlow;
      this._sendCommand('SLOWMOTION');
    }
  }

  private _extractZipFirstEntryName(data: Uint8Array | null): string | null {
    if (!data || data.byteLength < 34) return null;
    // ZIP local file header signature: PK\x03\x04
    if (
      data[0] !== 0x50 ||
      data[1] !== 0x4b ||
      data[2] !== 0x03 ||
      data[3] !== 0x04
    ) {
      return null;
    }
    const nameLen = data[26] | (data[27] << 8);
    if (nameLen <= 0 || 30 + nameLen > data.byteLength) return null;
    try {
      return new TextDecoder().decode(data.subarray(30, 30 + nameLen));
    } catch (_) {
      return null;
    }
  }

  private async _instantiateCoreModule(): Promise<void> {
    const baseUrl = this.context?.assetBaseUrl || '';
    const coreScriptUrl = `${baseUrl.replace(/\/$/, '')}/${this.id}_libretro.js`;
    const corePath = `/home/web_user/retroarch/cores/${this.id}_libretro.core`;
    const cfgPath = '/home/web_user/retroarch/userdata/retroarch.cfg';

    if (this.context?.canvas && !this.context.canvas.id) {
      this.context.canvas.id = 'canvas';
    }

    const isDebug = !!this.context?.debug;
    const coreArgs = isDebug
      ? ['-v', '-c', cfgPath, this._romPath]
      : ['-c', cfgPath, this._romPath];

    const isWebGL2Needed = !!CoreRegistry.getCore(this.id)?.needsWebGL2;

    const moduleOverrides: any = {
      canvas: this.context?.canvas,
      webglContextAttributes: {
        preserveDrawingBuffer: true,
        antialias: false,
        powerPreference: 'high-performance',
        majorVersion: isWebGL2Needed ? 2 : 1,
        minorVersion: 0,
      },
      noInitialRun: true,
      arguments: coreArgs,
      corePath,
      locateFile: (path: string, prefix: string) => {
        if (baseUrl) {
          return `${baseUrl.replace(/\/$/, '')}/${path}`;
        }
        return (prefix || '') + path;
      },
      ENV: {
        LIBRARY_PATH: corePath,
      },
      preRun: [
        (mod: any) => {
          if (mod.ENV) {
            mod.ENV.LIBRARY_PATH = corePath;
          }
          if (mod.FS) {
            this._ensureDirectories(mod.FS, '/home');
            this._ensureDirectories(mod.FS, '/home/web_user');
            this._ensureDirectories(mod.FS, '/home/web_user/retroarch');
            this._ensureDirectories(mod.FS, '/home/web_user/retroarch/cores');
            this._ensureDirectories(
              mod.FS,
              '/home/web_user/retroarch/userdata',
            );
            this._ensureDirectories(
              mod.FS,
              '/home/web_user/retroarch/userdata/content',
            );
            this._ensureDirectories(
              mod.FS,
              '/home/web_user/retroarch/userdata/saves',
            );
            this._ensureDirectories(
              mod.FS,
              '/home/web_user/retroarch/userdata/states',
            );
            this._ensureDirectories(
              mod.FS,
              '/home/web_user/retroarch/userdata/system',
            );

            // Fake core file required by RetroArch Emscripten frontend
            try {
              mod.FS.writeFile(corePath, new Uint8Array());
            } catch (_) {}

            // Flush any BIOS files registered before module instantiation
            for (const [biosName, biosData] of this._pendingBios.entries()) {
              try {
                mod.FS.writeFile(
                  `/home/web_user/retroarch/userdata/system/${biosName}`,
                  biosData,
                );
                this.context?.onLog?.(
                  `[LibretroAdapter] Flushed queued BIOS: ${biosName} (${biosData.byteLength} bytes)`,
                  'info',
                );
              } catch (e) {
                console.warn(
                  '[LibretroAdapter] Failed to flush queued BIOS:',
                  biosName,
                  e,
                );
              }
            }

            // Optimized default retroarch.cfg
            const minimalCfg = [
              'video_driver = "gl"',
              'audio_driver = "rwebaudio"',
              'input_driver = "rwebinput"',
              'video_vsync = "false"',
              'video_smooth = "false"',
              'video_threaded = "false"',
              'video_shared_context = "true"',
              'video_hard_sync = "false"',
              'video_frame_delay = "0"',
              'audio_latency = "64"',
              'audio_sync = "true"',
              'fastforward_ratio = "3.0"',
              'slowmotion_ratio = "3.0"',
              'savefile_directory = "/home/web_user/retroarch/userdata/saves"',
              'savestate_directory = "/home/web_user/retroarch/userdata/states"',
              'sort_savestates_enable = "false"',
              'sort_savestates_by_content_enable = "false"',
              'savestates_in_content_dir = "false"',
              'state_slot = "0"',
              'system_directory = "/home/web_user/retroarch/userdata/system"',
              'content_directory = "/home/web_user/retroarch/userdata/content"',
              'rgui_browser_directory = "/home/web_user/retroarch/userdata/content"',
              'input_enable_hotkey = "nul"',
              'input_enable_hotkey_btn = "nul"',
              'input_enable_hotkey_axis = "nul"',
              'input_save_state = "f2"',
              'input_load_state = "f4"',
              'input_reset = "h"',
              'network_cmd_enable = "true"',
              'stdin_cmd_enable = "false"',
              '',
            ].join('\n');

            const ra = this.context?.retroAchievements;
            let finalCfg = minimalCfg;
            if (ra && ra.username) {
              finalCfg += [
                'cheevos_enable = "true"',
                `cheevos_username = "${ra.username}"`,
                `cheevos_token = "${ra.token || ''}"`,
                `cheevos_password = "${ra.token || ''}"`,
                `cheevos_hardcore_mode_enable = "${ra.hardcore ? 'true' : 'false'}"`,
                'cheevos_badges_enable = "true"',
                'cheevos_visibility_summary = "true"',
                'cheevos_visibility_unlock = "true"',
                'cheevos_visibility_mastery = "true"',
                '',
              ].join('\n');
            }

            try {
              mod.FS.writeFile(cfgPath, finalCfg);
            } catch (_) {}

            // Write ROM data into virtual FS
            if (this._romData) {
              try {
                mod.FS.writeFile(this._romPath, this._romData);
              } catch (e) {
                console.error(
                  '[LibretroAdapter] Error writing ROM to virtual FS:',
                  e,
                );
              }
            }

            // Write any companion files (.bin tracks for a .cue, multi-disc files)
            for (const extra of this._additionalFiles) {
              try {
                const extraPath = `/home/web_user/retroarch/userdata/content/${extra.name}`;
                mod.FS.writeFile(extraPath, extra.data);
              } catch (e) {
                console.warn(
                  '[LibretroAdapter] Error writing companion file:',
                  extra.name,
                  e,
                );
              }
            }
          }
        },
      ],
      stdin: () => null,
      print: (text: string) => {
        if (isDebug) console.log(`[${this.id}]`, text);
        this.context?.onLog?.(text, 'info');
      },
      printErr: (text: string) => {
        if (isDebug) console.error(`[${this.id} Err]`, text);
        this.context?.onLog?.(text, 'error');
      },
    };

    // Dynamically import core ES module
    try {
      const moduleExport = await import(/* @vite-ignore */ coreScriptUrl);
      const factory =
        moduleExport.default || moduleExport[this.id] || moduleExport;
      if (typeof factory !== 'function') {
        throw new Error(
          `Core script at "${coreScriptUrl}" did not provide a callable factory function.`,
        );
      }
      this._module = await factory(moduleOverrides);
    } catch (err: any) {
      // If direct CDN import was attempted and failed due to CORS, attempt the local Vite proxy
      if (
        coreScriptUrl.startsWith('http') &&
        !coreScriptUrl.includes('/libretro-cores/')
      ) {
        const fallbackUrl = `/libretro-cores/${this.id}_libretro.js`;
        try {
          const fallbackExport = await import(/* @vite-ignore */ fallbackUrl);
          const fallbackFactory =
            fallbackExport.default || fallbackExport[this.id] || fallbackExport;
          if (typeof fallbackFactory === 'function') {
            moduleOverrides.locateFile = (path: string) =>
              `/libretro-cores/${path}`;
            this._module = await fallbackFactory(moduleOverrides);
            return;
          }
        } catch (fallbackErr: any) {
          console.error(
            `[LibretroAdapter] Proxy fallback failed:`,
            fallbackErr,
          );
        }
      }
      const msg = `Failed to load WASM core from "${coreScriptUrl}": ${err?.message || err}`;
      console.error('[LibretroAdapter]', msg, err);
      this.context?.onLog?.(msg, 'error');
      throw new Error(msg);
    }
  }

  private _findStateFiles(fs: any): { path: string; data: Uint8Array }[] {
    const results: { path: string; data: Uint8Array }[] = [];
    const visited = new Set<string>();

    const walk = (dir: string) => {
      if (visited.has(dir)) return;
      visited.add(dir);
      try {
        if (!fs.analyzePath(dir).exists) return;
        const entries = fs
          .readdir(dir)
          .filter((e: string) => e !== '.' && e !== '..');
        for (const entry of entries) {
          const fullPath = dir === '/' ? `/${entry}` : `${dir}/${entry}`;
          try {
            const stat = fs.stat(fullPath);
            const isDir = fs.isDir
              ? fs.isDir(stat.mode)
              : (stat.mode & 0x4000) !== 0;
            if (isDir) {
              if (fullPath !== '/dev' && fullPath !== '/proc') {
                walk(fullPath);
              }
            } else {
              if (entry.includes('.state') || entry.endsWith('.state')) {
                const data = fs.readFile(fullPath);
                if (data && data.length > 0) {
                  results.push({ path: fullPath, data: new Uint8Array(data) });
                }
              }
            }
          } catch (_) {}
        }
      } catch (_) {}
    };

    walk('/home/web_user/retroarch');
    return results;
  }

  private _ensureDirectories(fs: any, path: string): void {
    const parts = path.split('/').filter(Boolean);
    let curr = '';
    for (const part of parts) {
      curr += `/${part}`;
      try {
        if (!fs.analyzePath(curr).exists) {
          fs.mkdir(curr);
        }
      } catch (_) {}
    }
  }

  private _parseCoreOptionsString(raw: string): CoreOptionDefinition[] {
    const results: CoreOptionDefinition[] = [];
    const lines = raw.split('\n');

    for (const line of lines) {
      if (!line.trim()) continue;
      const parts = line.split(/;\s*/);
      if (parts.length < 2) continue;

      const [key, curr] = parts[0].split('|');
      const choices = parts[1]
        .split('|')
        .map((c) => ({ value: c.trim(), label: c.trim() }));

      if (key) {
        results.push({
          id: key.trim(),
          label: key
            .trim()
            .replace(/^[^_]+_/, '')
            .replace(/_/g, ' '),
          type: 'enum',
          choices,
          defaultValue: choices[0]?.value || '',
          currentValue: curr?.trim() || choices[0]?.value || '',
        });
      }
    }
    return results;
  }
}
