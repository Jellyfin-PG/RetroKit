import type {
  CoreCapabilities,
  CoreOptionDefinition,
  GameLoadOptions,
} from '../core/types';
import { ArchiveExtractor } from '../utils/ArchiveExtractor';
import { BaseCoreBridge } from './BaseCoreBridge';
import type { AdapterContext } from './ICoreAdapter';

/**
 * Configuration schema for specialized EmulatorJS cores such as PPSSPP and Azahar.
 */
interface CorePackageConfig {
  channel: 'stable' | 'nightly';
  bundleName: string;
  jsName: string;
  wasmName: string;
  assetsUrl?: string;
  needsWebGL2: boolean;
  needsThreads: boolean;
}

const CORE_CONFIGS: Record<string, CorePackageConfig> = {
  ppsspp: {
    channel: 'stable',
    bundleName: 'ppsspp-thread-wasm.data',
    jsName: 'ppsspp_libretro.js',
    wasmName: 'ppsspp_libretro.wasm',
    assetsUrl: 'https://cdn.emulatorjs.org/stable/data/cores/ppsspp-assets.zip',
    needsWebGL2: true,
    needsThreads: true,
  },
  azahar: {
    channel: 'nightly',
    bundleName: 'azahar-thread-wasm.data',
    jsName: 'azahar_libretro.js',
    wasmName: 'azahar_libretro.wasm',
    needsWebGL2: true,
    needsThreads: true,
  },
  desmume: {
    channel: 'stable',
    bundleName: 'desmume-wasm.data',
    jsName: 'desmume_libretro.js',
    wasmName: 'desmume_libretro.wasm',
    needsWebGL2: true,
    needsThreads: false,
  },
  melonds: {
    channel: 'stable',
    bundleName: 'melonds-wasm.data',
    jsName: 'melonds_libretro.js',
    wasmName: 'melonds_libretro.wasm',
    needsWebGL2: true,
    needsThreads: false,
  },
};

/**
 * Cache storage in memory for decompressed core binaries and assets
 * so subsequent launches of the same core start instantly without re-downloading.
 */
const MEMORY_CACHE = new Map<string, { js: Uint8Array; wasm: Uint8Array }>();
let PPSSPP_ASSETS_CACHE: Record<string, Uint8Array> | null = null;

/**
 * EmulatorJSAdapter manages standalone Emscripten Libretro cores provided by
 * the EmulatorJS ecosystem (such as PPSSPP for PSP and Azahar for Nintendo 3DS).
 *
 * It transparently unpacks compressed .data 7z bundles, injects required assets,
 * sets up WebGL2 context attributes, and initializes multi-threaded pthread environments.
 */
export class EmulatorJSAdapter extends BaseCoreBridge {
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
  private _blobUrlsToRevoke: string[] = [];
  private _scriptElement: HTMLScriptElement | null = null;

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
      if (!resp.ok) {
        throw new Error(
          `[EmulatorJSAdapter] Failed to fetch ROM from URL: ${rom}`,
        );
      }
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

    const safeName = options?.fileName || 'rom.bin';
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
          const safeName = this._romPath.split('/').pop() || 'rom.bin';
          const isDebug = !!this.context?.debug;
          const args = isDebug ? ['-v', `/${safeName}`] : [`/${safeName}`];
          this._module.callMain(args);
          if (typeof this._module.resumeMainLoop === 'function') {
            this._module.resumeMainLoop();
          }
        } catch (err: any) {
          if (err && err.name !== 'ExitStatus') {
            console.error('[EmulatorJSAdapter] Error starting core:', err);
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
    if (this._module) {
      if (typeof this._module.EmscriptenSendCommand === 'function') {
        this._module.EmscriptenSendCommand('RESET');
      } else {
        this._dispatchKeyboardFallback(100, true);
        setTimeout(() => this._dispatchKeyboardFallback(100, false), 50);
      }
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

    if (this._scriptElement?.parentNode) {
      this._scriptElement.parentNode.removeChild(this._scriptElement);
      this._scriptElement = null;
    }

    if (typeof window !== 'undefined' && (window as any).EJS_Runtime) {
      try {
        delete (window as any).EJS_Runtime;
      } catch (_) {}
    }

    for (const url of this._blobUrlsToRevoke) {
      try {
        URL.revokeObjectURL(url);
      } catch (_) {}
    }
    this._blobUrlsToRevoke = [];

    this._romData = null;
    this._started = false;
  }

  // --- Save States ---
  public override async rawSaveState(slot = 0): Promise<Uint8Array | null> {
    if (!this._module) return null;

    if (
      this._module.gameManager &&
      typeof this._module.gameManager.getState === 'function'
    ) {
      const state = this._module.gameManager.getState();
      return state ? new Uint8Array(state) : null;
    }

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

    if (this._module.FS) {
      const statesDir = '/home/web_user/retroarch/userdata/states';
      const contentDir = '/home/web_user/retroarch/userdata/content';
      this._ensureDirectories(this._module.FS, statesDir);
      this._ensureDirectories(this._module.FS, contentDir);

      const oldFiles = this._findStateFiles(this._module.FS);
      for (const item of oldFiles) {
        try {
          this._module.FS.unlink(item.path);
        } catch (_) {}
      }

      const cmd = slot > 0 ? `SAVE_STATE_SLOT ${slot}` : 'SAVE_STATE';
      this._sendCommand(cmd);

      for (let attempt = 0; attempt < 40; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        const found = this._findStateFiles(this._module.FS);
        if (found.length > 0) {
          return found[0].data;
        }
      }
    }

    return null;
  }

  public override async rawLoadState(
    data: Uint8Array,
    slot = 0,
  ): Promise<boolean> {
    if (!this._module) return false;

    if (
      this._module.gameManager &&
      typeof this._module.gameManager.loadState === 'function'
    ) {
      this._module.gameManager.loadState(data);
      return true;
    }

    if (typeof this._module._retro_unserialize === 'function') {
      const ptr = this._module._malloc(data.byteLength);
      this._module.HEAPU8.set(data, ptr);
      const success = this._module._retro_unserialize(ptr, data.byteLength);
      this._module._free(ptr);
      return !!success;
    }

    if (this._module.FS) {
      const statesDir = '/home/web_user/retroarch/userdata/states';
      const contentDir = '/home/web_user/retroarch/userdata/content';
      this._ensureDirectories(this._module.FS, statesDir);
      this._ensureDirectories(this._module.FS, contentDir);

      const fileName = this._romPath.split('/').pop() || 'rom.bin';
      const baseName = fileName.replace(/\.[^.]+$/, '');

      this._module.FS.writeFile(`${statesDir}/${baseName}.state`, data);
      this._module.FS.writeFile(`${statesDir}/${baseName}.state.auto`, data);
      this._module.FS.writeFile(`${statesDir}/${baseName}.state0`, data);
      this._module.FS.writeFile(`${statesDir}/${baseName}.state1`, data);
      if (slot > 1) {
        this._module.FS.writeFile(
          `${statesDir}/${baseName}.state${slot}`,
          data,
        );
      }

      this._module.FS.writeFile(`${contentDir}/${baseName}.state`, data);
      this._module.FS.writeFile(`${contentDir}/${baseName}.state.auto`, data);
      this._module.FS.writeFile(`${contentDir}/${baseName}.state0`, data);
      this._module.FS.writeFile(`${contentDir}/${baseName}.state1`, data);

      const cmd = slot > 0 ? `LOAD_STATE_SLOT ${slot}` : 'LOAD_STATE';
      this._sendCommand(cmd);
      return true;
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
          '[EmulatorJSAdapter] Failed to write SRAM to virtual FS:',
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
    const sysDir = '/home/web_user/retroarch/userdata/system';
    if (this._module?.FS) {
      this._ensureDirectories(this._module.FS, sysDir);
      this._module.FS.writeFile(`${sysDir}/${cleanName}`, data);
      this.context?.onLog?.(
        `[EmulatorJSAdapter] Injected BIOS: ${cleanName} (${data.byteLength} bytes)`,
        'info',
      );
    }
  }

  // --- Memory Inspection ---
  public override rawReadMemory(
    address: number,
    length: number,
  ): Uint8Array | null {
    if (!this._module) return null;
    try {
      if (typeof this._module._retro_get_memory_data === 'function') {
        const ptr = this._module._retro_get_memory_data(0);
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

  // --- Input Handling ---
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
      this._dispatchKeyboardFallback(buttonId, pressed);
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

      if (axisId === 0) {
        // Left stick X
        this._module.gameManager.simulateInput(
          player,
          16,
          value > deadzone ? intVal : 0,
        );
        this._module.gameManager.simulateInput(
          player,
          17,
          value < -deadzone ? intVal : 0,
        );
      } else if (axisId === 1) {
        // Left stick Y
        this._module.gameManager.simulateInput(
          player,
          18,
          value > deadzone ? intVal : 0,
        );
        this._module.gameManager.simulateInput(
          player,
          19,
          value < -deadzone ? intVal : 0,
        );
      } else if (axisId === 2) {
        // Right stick X
        this._module.gameManager.simulateInput(
          player,
          20,
          value > deadzone ? intVal : 0,
        );
        this._module.gameManager.simulateInput(
          player,
          21,
          value < -deadzone ? intVal : 0,
        );
      } else if (axisId === 3) {
        // Right stick Y
        this._module.gameManager.simulateInput(
          player,
          22,
          value > deadzone ? intVal : 0,
        );
        this._module.gameManager.simulateInput(
          player,
          23,
          value < -deadzone ? intVal : 0,
        );
      }
    }
  }

  /**
   * Dispatches pointer events for touchscreens (such as the Nintendo 3DS bottom screen).
   */
  public rawSendPointer(
    x: number,
    y: number,
    pressed: boolean,
    _player = 0,
  ): void {
    const canvas = this.context?.canvas;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = rect.left + x * rect.width;
    const clientY = rect.top + y * rect.height;

    const eventType = pressed ? 'pointerdown' : 'pointerup';
    const pointerEv = new PointerEvent(eventType, {
      clientX,
      clientY,
      bubbles: true,
      cancelable: true,
      pointerType: 'touch',
      isPrimary: true,
      button: 0,
      buttons: pressed ? 1 : 0,
    });
    canvas.dispatchEvent(pointerEv);
  }

  public override rawGetFps(): number {
    return this._fps;
  }

  /**
   * Downloads and unpacks the core binaries, prepares the Emscripten runtime module,
   * injects assets, and boots the virtual environment.
   */
  private async _instantiateCoreModule(): Promise<void> {
    const cfg = CORE_CONFIGS[this.id];
    if (!cfg) {
      throw new Error(
        `[EmulatorJSAdapter] Unknown EmulatorJS core configuration for ID "${this.id}"`,
      );
    }

    this.context?.onLog?.(
      `[EmulatorJSAdapter] Initializing ${this.name} (${this.id})...`,
      'info',
    );

    if (cfg.needsThreads && typeof SharedArrayBuffer === 'undefined') {
      const msg = `[EmulatorJSAdapter] Core "${this.id}" requires multi-threading (SharedArrayBuffer), but cross-origin isolation is not active. Ensure COOP: same-origin and COEP: require-corp headers are served.`;
      console.warn(msg);
      this.context?.onLog?.(msg, 'error');
    }

    if (this._scriptElement?.parentNode) {
      this._scriptElement.parentNode.removeChild(this._scriptElement);
      this._scriptElement = null;
    }
    const win =
      typeof window !== 'undefined' ? (window as any) : (globalThis as any);
    delete win.EJS_Runtime;

    // Retrieve core binaries (from memory cache or network)
    const { jsBytes, wasmBytes } = await this._acquireCoreBinaries(cfg);

    // PPSSPP requires extracted firmware assets (fonts, audio, shaders)
    let ppssppAssets: Record<string, Uint8Array> | null = null;
    if (this.id === 'ppsspp') {
      ppssppAssets = await this._acquirePpssppAssets(cfg);
    }

    const jsBlob = new Blob([jsBytes as unknown as BlobPart], {
      type: 'application/javascript',
    });
    const wasmBlob = new Blob([wasmBytes as unknown as BlobPart], {
      type: 'application/wasm',
    });

    const jsBlobUrl = URL.createObjectURL(jsBlob);
    const wasmBlobUrl = URL.createObjectURL(wasmBlob);
    this._blobUrlsToRevoke.push(jsBlobUrl, wasmBlobUrl);

    if (this.context?.canvas && !this.context.canvas.id) {
      this.context.canvas.id = 'canvas';
    }

    const isDebug = !!this.context?.debug;
    const cfgPath = '/home/web_user/retroarch/userdata/retroarch.cfg';
    const altCfgPath = '/home/web_user/.config/retroarch/retroarch.cfg';

    const moduleOverrides: any = {
      canvas: this.context?.canvas,
      webglContextAttributes: {
        preserveDrawingBuffer: true,
        antialias: false,
        powerPreference: 'high-performance',
      },
      noInitialRun: true,
      arguments: [],
      mainScriptUrlOrBlob: jsBlobUrl,
      locateFile: (path: string) => {
        if (path.endsWith('.wasm')) {
          return wasmBlobUrl;
        }
        return undefined;
      },
      callbacks: {
        setupCoreSettingFile: () => {},
      },
      preRun: [
        (mod: any) => {
          if (mod.FS) {
            this._ensureDirectories(mod.FS, '/home');
            this._ensureDirectories(mod.FS, '/home/web_user');
            this._ensureDirectories(mod.FS, '/home/web_user/.config');
            this._ensureDirectories(mod.FS, '/home/web_user/.config/retroarch');
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

            // Injected PPSSPP assets
            if (ppssppAssets) {
              this._injectPpssppAssets(mod.FS, ppssppAssets);
            }

            // Minimal default retroarch.cfg
            const minimalCfg = [
              'video_driver = "gl"',
              'audio_driver = "rwebaudio"',
              'input_driver = "rwebinput"',
              'video_vsync = "false"',
              'video_smooth = "false"',
              'video_threaded = "true"',
              'video_hard_sync = "false"',
              'video_frame_delay = "0"',
              'audio_latency = "64"',
              'audio_sync = "true"',
              'savefile_directory = "/home/web_user/retroarch/userdata/saves"',
              'savestate_directory = "/home/web_user/retroarch/userdata/states"',
              'system_directory = "/home/web_user/retroarch/userdata/system"',
              'content_directory = "/home/web_user/retroarch/userdata/content"',
              'input_enable_hotkey = "nul"',
              'input_save_state = "f2"',
              'input_load_state = "f4"',
              'input_reset = "h"',
              'network_cmd_enable = "true"',
              'stdin_cmd_enable = "false"',
              '',
            ].join('\n');

            try {
              mod.FS.writeFile(cfgPath, minimalCfg);
              mod.FS.writeFile(altCfgPath, minimalCfg);
            } catch (_) {}

            // Write ROM into both content directory and root path
            if (this._romData) {
              try {
                mod.FS.writeFile(this._romPath, this._romData);
                const safeName = this._romPath.split('/').pop() || 'rom.bin';
                mod.FS.writeFile(`/${safeName}`, this._romData);
              } catch (e) {
                console.error(
                  '[EmulatorJSAdapter] Error writing ROM to virtual FS:',
                  e,
                );
              }
            }

            // Write companion files
            for (const extra of this._additionalFiles) {
              try {
                mod.FS.writeFile(
                  `/home/web_user/retroarch/userdata/content/${extra.name}`,
                  extra.data,
                );
                mod.FS.writeFile(`/${extra.name}`, extra.data);
              } catch (e) {
                console.warn(
                  '[EmulatorJSAdapter] Error writing companion file:',
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

    // Load the runtime script tag
    await this._loadScriptTag(jsBlobUrl);

    const runtimeFactory = (window as any).EJS_Runtime;
    if (typeof runtimeFactory !== 'function') {
      throw new Error(
        `[EmulatorJSAdapter] Core runtime script did not export window.EJS_Runtime.`,
      );
    }

    this._module = await runtimeFactory(moduleOverrides);
    this.context?.onLog?.(
      `[EmulatorJSAdapter] ${this.name} runtime instantiated successfully.`,
      'info',
    );
  }

  /**
   * Fetches or decompresses the core's .js harness and .wasm binary.
   */
  private async _acquireCoreBinaries(cfg: CorePackageConfig): Promise<{
    jsBytes: Uint8Array;
    wasmBytes: Uint8Array;
  }> {
    const cached = MEMORY_CACHE.get(this.id);
    if (cached) {
      return { jsBytes: cached.js, wasmBytes: cached.wasm };
    }

    // Try fetching unpacked files if assetBaseUrl is configured
    const baseUrl = this.context?.assetBaseUrl;
    if (baseUrl) {
      const cleanBase = baseUrl.replace(/\/$/, '');
      const jsUrl = `${cleanBase}/${cfg.jsName}`;
      const wasmUrl = `${cleanBase}/${cfg.wasmName}`;

      try {
        const [jsRes, wasmRes] = await Promise.all([
          fetch(jsUrl),
          fetch(wasmUrl),
        ]);
        if (jsRes.ok && wasmRes.ok) {
          const [jsBuf, wasmBuf] = await Promise.all([
            jsRes.arrayBuffer(),
            wasmRes.arrayBuffer(),
          ]);
          const js = new Uint8Array(jsBuf);
          const wasm = new Uint8Array(wasmBuf);
          MEMORY_CACHE.set(this.id, { js, wasm });
          return { jsBytes: js, wasmBytes: wasm };
        }
      } catch (_) {
        // Fall back to .data package
      }
    }

    // Download the .data 7z archive from local proxy or CDN
    const primaryUrl = `/emulatorjs-cores/${cfg.channel}/data/cores/${cfg.bundleName}`;
    const fallbackUrl = `https://cdn.emulatorjs.org/${cfg.channel}/data/cores/${cfg.bundleName}`;

    this.context?.onLog?.(
      `[EmulatorJSAdapter] Downloading core archive: ${cfg.bundleName}...`,
      'info',
    );

    let bundleData: Uint8Array | null = null;
    try {
      const res = await fetch(primaryUrl);
      if (res.ok) {
        bundleData = new Uint8Array(await res.arrayBuffer());
      }
    } catch (_) {
      // Fall back to direct CDN
    }

    if (!bundleData) {
      const fallbackRes = await fetch(fallbackUrl);
      if (!fallbackRes.ok) {
        throw new Error(
          `[EmulatorJSAdapter] Failed to download core package from "${fallbackUrl}" (status: ${fallbackRes.status})`,
        );
      }
      bundleData = new Uint8Array(await fallbackRes.arrayBuffer());
    }

    this.context?.onLog?.(
      `[EmulatorJSAdapter] Unpacking ${cfg.bundleName} (7z)...`,
      'info',
    );

    const unpacked = await ArchiveExtractor.decompress(
      bundleData,
      '7z',
      (pct) => {
        this.context?.onLog?.(
          `[EmulatorJSAdapter] Unpacking core: ${pct}%`,
          'info',
        );
      },
    );

    const js = unpacked[cfg.jsName];
    const wasm = unpacked[cfg.wasmName];

    if (!js || !wasm) {
      throw new Error(
        `[EmulatorJSAdapter] Archive "${cfg.bundleName}" is missing required files: ${cfg.jsName} or ${cfg.wasmName}`,
      );
    }

    MEMORY_CACHE.set(this.id, { js, wasm });
    return { jsBytes: js, wasmBytes: wasm };
  }

  /**
   * Downloads and unpacks firmware assets required by PPSSPP.
   */
  private async _acquirePpssppAssets(
    cfg: CorePackageConfig,
  ): Promise<Record<string, Uint8Array>> {
    if (PPSSPP_ASSETS_CACHE) {
      return PPSSPP_ASSETS_CACHE;
    }

    const primaryUrl = '/emulatorjs-cores/stable/data/cores/ppsspp-assets.zip';
    const fallbackUrl = cfg.assetsUrl || primaryUrl;

    this.context?.onLog?.(
      `[EmulatorJSAdapter] Downloading PPSSPP asset package...`,
      'info',
    );

    let zipData: Uint8Array | null = null;
    try {
      const res = await fetch(primaryUrl);
      if (res.ok) {
        zipData = new Uint8Array(await res.arrayBuffer());
      }
    } catch (_) {}

    if (!zipData) {
      const fallbackRes = await fetch(fallbackUrl);
      if (!fallbackRes.ok) {
        throw new Error(
          `[EmulatorJSAdapter] Failed to download PPSSPP assets from "${fallbackUrl}"`,
        );
      }
      zipData = new Uint8Array(await fallbackRes.arrayBuffer());
    }

    this.context?.onLog?.(
      `[EmulatorJSAdapter] Unpacking PPSSPP system assets (ZIP)...`,
      'info',
    );

    const unpacked = await ArchiveExtractor.decompress(
      zipData,
      'zip',
      (pct) => {
        this.context?.onLog?.(
          `[EmulatorJSAdapter] Unpacking assets: ${pct}%`,
          'info',
        );
      },
    );

    PPSSPP_ASSETS_CACHE = unpacked;
    return unpacked;
  }

  /**
   * Injects extracted PPSSPP files into the virtual filesystem.
   */
  private _injectPpssppAssets(
    fs: any,
    assets: Record<string, Uint8Array>,
  ): void {
    this._ensureDirectories(fs, '/PPSSPP');
    this._ensureDirectories(
      fs,
      '/home/web_user/retroarch/userdata/system/PPSSPP',
    );

    for (const [relativePath, data] of Object.entries(assets)) {
      if (relativePath.endsWith('/')) {
        this._ensureDirectories(fs, `/PPSSPP/${relativePath}`);
        this._ensureDirectories(
          fs,
          `/home/web_user/retroarch/userdata/system/PPSSPP/${relativePath}`,
        );
        continue;
      }

      const normalized = relativePath.replace(/\\/g, '/');
      const target1 = `/PPSSPP/${normalized}`;
      const target2 = `/home/web_user/retroarch/userdata/system/PPSSPP/${normalized}`;

      const parentDir1 = target1.substring(0, target1.lastIndexOf('/'));
      const parentDir2 = target2.substring(0, target2.lastIndexOf('/'));

      this._ensureDirectories(fs, parentDir1);
      this._ensureDirectories(fs, parentDir2);

      try {
        fs.writeFile(target1, data);
        fs.writeFile(target2, data);
      } catch (_) {}
    }
  }

  /**
   * Appends a script element to the DOM and resolves when loaded.
   */
  private _loadScriptTag(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this._scriptElement?.parentNode) {
        this._scriptElement.parentNode.removeChild(this._scriptElement);
        this._scriptElement = null;
      }
      const win =
        typeof window !== 'undefined' ? (window as any) : (globalThis as any);
      delete win.EJS_Runtime;

      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(
          new Error(
            `[EmulatorJSAdapter] Failed to load core script from ${url}`,
          ),
        );
      this._scriptElement = script;
      document.head.appendChild(script);
    });
  }

  private _ensureDirectories(fs: any, path: string): void {
    const parts = path.split('/').filter((p) => p.length > 0);
    let current = '';
    for (const part of parts) {
      current += `/${part}`;
      try {
        if (!fs.analyzePath(current).exists) {
          fs.mkdir(current);
        }
      } catch (_) {}
    }
  }

  private _sendCommand(cmd: string): void {
    if (!this._module) return;
    try {
      if (typeof this._module.EmscriptenSendCommand === 'function') {
        this._module.EmscriptenSendCommand(cmd);
      } else if (typeof this._module.ccall === 'function') {
        this._module.ccall('EmscriptenSendCommand', null, ['string'], [cmd]);
      }
    } catch (_) {}
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
        0: { key: 'z', code: 'KeyZ', keyCode: 90 }, // Circle / B
        8: { key: 'x', code: 'KeyX', keyCode: 88 }, // Cross / A
        1: { key: 'a', code: 'KeyA', keyCode: 65 }, // Square / Y
        9: { key: 's', code: 'KeyS', keyCode: 83 }, // Triangle / X
        2: { key: 'Shift', code: 'ShiftRight', keyCode: 16 }, // Select
        3: { key: 'Enter', code: 'Enter', keyCode: 13 }, // Start
        10: { key: 'q', code: 'KeyQ', keyCode: 81 }, // L trigger
        11: { key: 'w', code: 'KeyW', keyCode: 87 }, // R trigger
        100: { key: 'h', code: 'KeyH', keyCode: 72 }, // Reset
        101: { key: 'F2', code: 'F2', keyCode: 113 }, // Save State
        102: { key: 'F4', code: 'F4', keyCode: 115 }, // Load State
      };

      const def = keyMap[buttonId];
      if (def && this.context?.canvas) {
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
        this.context.canvas.dispatchEvent(event);
      }
    } finally {
      this._isDispatchingFallback = false;
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
            } else if (
              fullPath.includes('.state') ||
              fullPath.endsWith('.sav') ||
              fullPath.endsWith('.nv')
            ) {
              results.push({
                path: fullPath,
                data: new Uint8Array(fs.readFile(fullPath)),
              });
            }
          } catch (_) {}
        }
      } catch (_) {}
    };

    walk('/home/web_user/retroarch/userdata/states');
    walk('/home/web_user/retroarch/userdata/content');
    return results;
  }
}
