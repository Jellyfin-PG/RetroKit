import type {
  CoreCapabilities,
  CoreOptionDefinition,
  GameLoadOptions,
} from '../core/types';
import { BaseCoreBridge } from './BaseCoreBridge';
import type { AdapterContext } from './ICoreAdapter';

interface KeyMapInfo {
  code: string;
  key: string;
  keyCode: number;
}

class DiscImageDevice {
  private module: any;
  private doneFlag = false;
  private file: Blob | File | null = null;

  constructor(mod: any) {
    this.module = mod;
  }

  public read(destPtr: number, position: number, length: number): void {
    if (!this.file) return;
    this.doneFlag = false;
    this.file
      .slice(position, position + length)
      .arrayBuffer()
      .then((buf) => {
        this.module.HEAPU8.set(new Uint8Array(buf), destPtr);
        this.doneFlag = true;
      })
      .catch((err) => {
        console.error('[PlayAdapter] Error reading disc chunk:', err);
        this.doneFlag = true;
      });
  }

  public getFileSize(): number {
    return this.file ? this.file.size : 0;
  }

  public isDone(): boolean {
    return this.doneFlag;
  }

  public setFile(file: Blob | File): void {
    this.file = file;
  }
}

/**
 * PlayAdapter handles the Play! PS2 WebAssembly core.
 * Features chunked DiscImageDevice streaming, multithreaded workers,
 * dual analog sticks, and /work/mc0 memory card synchronization.
 */
export class PlayAdapter extends BaseCoreBridge {
  public readonly id = 'play';
  public readonly name = 'PlayStation 2 (Play!)';
  public readonly system = 'ps2';
  public readonly capabilities: CoreCapabilities = {
    saveStates: false,
    sram: true,
    cheats: true,
    coreOptions: true,
    multiDisc: true,
    shaders: false,
    rewind: false,
    variableSpeed: true,
    maxPlayers: 2,
    pointer: false,
  };

  private _playModule: any = null;
  private _romBlob: Blob | null = null;
  private _mcMemory = new Map<string, Uint8Array>();

  private readonly PS2_KEY_MAP: Record<number, KeyMapInfo> = {
    0: { code: 'KeyZ', key: 'z', keyCode: 90 }, // CROSS
    8: { code: 'KeyX', key: 'x', keyCode: 88 }, // CIRCLE
    1: { code: 'KeyA', key: 'a', keyCode: 65 }, // SQUARE
    9: { code: 'KeyS', key: 's', keyCode: 83 }, // TRIANGLE
    2: { code: 'Backspace', key: 'Backspace', keyCode: 8 }, // SELECT
    3: { code: 'Enter', key: 'Enter', keyCode: 13 }, // START
    4: { code: 'ArrowUp', key: 'ArrowUp', keyCode: 38 }, // UP
    5: { code: 'ArrowDown', key: 'ArrowDown', keyCode: 40 }, // DOWN
    6: { code: 'ArrowLeft', key: 'ArrowLeft', keyCode: 37 }, // LEFT
    7: { code: 'ArrowRight', key: 'ArrowRight', keyCode: 39 }, // RIGHT
    10: { code: 'Key1', key: '1', keyCode: 49 }, // L1
    12: { code: 'Key2', key: '2', keyCode: 50 }, // L2
    14: { code: 'Key3', key: '3', keyCode: 51 }, // L3
    11: { code: 'Key8', key: '8', keyCode: 56 }, // R1
    13: { code: 'Key9', key: '9', keyCode: 57 }, // R2
    15: { code: 'Key0', key: '0', keyCode: 48 }, // R3
    16: { code: 'KeyH', key: 'h', keyCode: 72 }, // L_STICK_RIGHT
    17: { code: 'KeyF', key: 'f', keyCode: 70 }, // L_STICK_LEFT
    18: { code: 'KeyG', key: 'g', keyCode: 71 }, // L_STICK_DOWN
    19: { code: 'KeyT', key: 't', keyCode: 84 }, // L_STICK_UP
    20: { code: 'KeyL', key: 'l', keyCode: 76 }, // R_STICK_RIGHT
    21: { code: 'KeyJ', key: 'j', keyCode: 74 }, // R_STICK_LEFT
    22: { code: 'KeyK', key: 'k', keyCode: 75 }, // R_STICK_DOWN
    23: { code: 'KeyI', key: 'i', keyCode: 73 }, // R_STICK_UP
  };

  public getRomBlob(): Blob | null {
    return this._romBlob;
  }

  public async init(context: AdapterContext): Promise<void> {
    await super.init(context);
  }

  public async loadGame(
    rom: ArrayBuffer | Blob | string | Uint8Array,
    options?: GameLoadOptions,
  ): Promise<void> {
    const fileName = options?.fileName || 'game.iso';

    if (typeof rom === 'string') {
      const resp = await fetch(rom, { headers: this.context?.fetchHeaders });
      if (!resp.ok) {
        throw new Error(`[PlayAdapter] Failed to fetch PS2 ROM from ${rom}`);
      }
      this._romBlob = await resp.blob();
    } else if (rom instanceof Blob) {
      this._romBlob = rom;
    } else if (rom instanceof Uint8Array) {
      this._romBlob = new Blob([rom.buffer as ArrayBuffer]);
    } else {
      this._romBlob = new Blob([rom]);
    }

    await this._instantiatePlayRuntime();

    if (!this._playModule) {
      throw new Error('[PlayAdapter] Play! runtime failed to initialize.');
    }

    if (typeof window !== 'undefined') {
      (window as any).PlayModule = this._playModule;
      (window as any).Module = this._playModule;
    }

    this._playModule.discImageDevice = new DiscImageDevice(this._playModule);

    if (
      options?.initialSram &&
      typeof options.initialSram === 'object' &&
      !(options.initialSram instanceof Uint8Array)
    ) {
      await this.rawSetSram(options.initialSram);
    }

    // Two-phase VM init required by Play! WebAssembly (GS pthread + EE mailbox)
    if (typeof this._playModule.ccall === 'function') {
      try {
        this._playModule.ccall('initVm', '', [], []);
      } catch (_) {}
    } else if (typeof this._playModule._initVm === 'function') {
      try {
        this._playModule._initVm();
      } catch (_) {}
    }

    if (typeof this._playModule.getVmInitState === 'function') {
      const t0 = Date.now();
      for (;;) {
        const st = this._playModule.getVmInitState();
        if (st === 2) break;
        if (st === 1 && typeof this._playModule.ccall === 'function') {
          try {
            this._playModule.ccall('initVmPhase2', '', [], []);
          } catch (_) {}
          continue;
        }
        if (Date.now() - t0 > 60000) {
          console.error('[PlayAdapter] Play! VM init timeout');
          break;
        }
        await new Promise((r) => setTimeout(r, 10));
      }
    }

    if (fileName.toLowerCase().endsWith('.elf')) {
      const buf = await this._romBlob.arrayBuffer();
      const bytes = new Uint8Array(buf);
      const stream = this._playModule.FS.open(fileName, 'w+');
      this._playModule.FS.write(stream, bytes, 0, bytes.length, 0);
      this._playModule.FS.close(stream);
      if (typeof this._playModule.bootElf === 'function') {
        this._playModule.bootElf(fileName);
      }
    } else {
      this._playModule.discImageDevice.setFile(this._romBlob);
      if (typeof this._playModule.bootDiscImage === 'function') {
        this._playModule.bootDiscImage(fileName);
      } else if (typeof this._playModule._bootDiscImage === 'function') {
        this._playModule._bootDiscImage(fileName);
      }
    }

    this.start();
  }

  public override start(): void {
    super.start();
    if (
      this._playModule &&
      typeof this._playModule.resumeMainLoop === 'function'
    ) {
      try {
        this._playModule.resumeMainLoop();
      } catch (_) {}
    }
  }

  public override pause(): void {
    super.pause();
    if (
      this._playModule &&
      typeof this._playModule.pauseMainLoop === 'function'
    ) {
      try {
        this._playModule.pauseMainLoop();
      } catch (_) {}
    }
  }

  public override resume(): void {
    super.resume();
    if (
      this._playModule &&
      typeof this._playModule.resumeMainLoop === 'function'
    ) {
      try {
        this._playModule.resumeMainLoop();
      } catch (_) {}
    }
  }

  public override async stop(): Promise<void> {
    await super.stop();
    if (
      this._playModule &&
      typeof this._playModule.pauseMainLoop === 'function'
    ) {
      try {
        this._playModule.pauseMainLoop();
      } catch (_) {}
    }
  }

  public override async destroy(): Promise<void> {
    await super.destroy();
    if (this.context?.canvas && this.context.canvas.id === 'outputCanvas') {
      this.context.canvas.id = 'retrokit-canvas';
    }
    if (this._playModule) {
      if (typeof this._playModule.pauseMainLoop === 'function') {
        try {
          this._playModule.pauseMainLoop();
        } catch (_) {}
      }
      if (typeof this._playModule.abort === 'function') {
        try {
          this._playModule.abort();
        } catch (_) {}
      }
      this._playModule = null;
    }
    this._romBlob = null;
    this._mcMemory.clear();
  }

  // --- Memory Cards (mc0 / mc1) ---
  public override async rawGetSram(): Promise<Record<
    string,
    Uint8Array
  > | null> {
    if (!this._playModule || !this._playModule.FS) return null;

    const fs = this._playModule.FS;
    const result: Record<string, Uint8Array> = {};

    const mcDir = '/work/mc0';
    try {
      if (fs.analyzePath(mcDir).exists) {
        const files: string[] = fs.readdir(mcDir);
        for (const file of files) {
          if (file === '.' || file === '..') continue;
          const fullPath = `${mcDir}/${file}`;
          try {
            const data = fs.readFile(fullPath);
            result[file] = new Uint8Array(data);
          } catch (_) {}
        }
      }
    } catch (_) {}

    return Object.keys(result).length > 0 ? result : null;
  }

  public override async rawSetSram(
    data: Uint8Array | Record<string, Uint8Array>,
  ): Promise<boolean> {
    if (!this._playModule || !this._playModule.FS) return false;
    if (data instanceof Uint8Array) return false;

    const fs = this._playModule.FS;
    const mcDir = '/work/mc0';
    try {
      if (!fs.analyzePath(mcDir).exists) {
        fs.mkdir('/work');
        fs.mkdir(mcDir);
      }

      for (const [fileName, fileData] of Object.entries(data)) {
        fs.writeFile(`${mcDir}/${fileName}`, fileData);
      }
      return true;
    } catch (e) {
      console.warn('[PlayAdapter] Failed to restore memory card:', e);
      return false;
    }
  }

  public override async rawFlushSram(): Promise<void> {
    const sram = await this.rawGetSram();
    if (sram && this.context?.onSramDirty) {
      this.context.onSramDirty(sram);
    }
  }

  public override getSramPath(): string {
    return '/work/mc0';
  }

  // --- Core Options ---
  public override rawGetOptions(): CoreOptionDefinition[] {
    return [
      {
        id: 'widescreen',
        label: 'Widescreen (16:9)',
        type: 'boolean',
        choices: [
          { value: 'true', label: 'Enabled' },
          { value: 'false', label: 'Disabled' },
        ],
        defaultValue: 'false',
        currentValue: 'false',
      },
      {
        id: 'fastboot',
        label: 'Fast Boot (Skip BIOS)',
        type: 'boolean',
        choices: [
          { value: 'true', label: 'Enabled' },
          { value: 'false', label: 'Disabled' },
        ],
        defaultValue: 'true',
        currentValue: 'true',
      },
    ];
  }

  public override rawSetOption(key: string, value: string): void {
    if (this._playModule && typeof this._playModule.setOption === 'function') {
      try {
        this._playModule.setOption(key, value);
      } catch (_) {}
    }
  }

  // --- Input ---
  public override rawSendButton(
    _player: number,
    buttonId: number,
    pressed: boolean,
  ): void {
    if (this._playModule?.sendGamepadButton) {
      this._playModule.sendGamepadButton(buttonId, pressed);
      return;
    }

    const key = this.PS2_KEY_MAP[buttonId];
    if (key) {
      this._simulateCanvasKey(key, pressed);
    }
  }

  public override rawSendAxis(
    _player: number,
    axisId: number,
    value: number,
  ): void {
    if (this._playModule?.sendGamepadAxis) {
      this._playModule.sendGamepadAxis(axisId, value);
      return;
    }

    const deadzone = 0.2;
    if (axisId === 0) {
      this._simulateCanvasKey(this.PS2_KEY_MAP[16], value > deadzone);
      this._simulateCanvasKey(this.PS2_KEY_MAP[17], value < -deadzone);
    } else if (axisId === 1) {
      this._simulateCanvasKey(this.PS2_KEY_MAP[18], value > deadzone);
      this._simulateCanvasKey(this.PS2_KEY_MAP[19], value < -deadzone);
    } else if (axisId === 2) {
      this._simulateCanvasKey(this.PS2_KEY_MAP[20], value > deadzone);
      this._simulateCanvasKey(this.PS2_KEY_MAP[21], value < -deadzone);
    } else if (axisId === 3) {
      this._simulateCanvasKey(this.PS2_KEY_MAP[22], value > deadzone);
      this._simulateCanvasKey(this.PS2_KEY_MAP[23], value < -deadzone);
    }
  }

  private _simulateCanvasKey(info: KeyMapInfo, pressed: boolean): void {
    const canvas = this.context?.canvas;
    if (!canvas) return;

    const eventType = pressed ? 'keydown' : 'keyup';
    const evt = new KeyboardEvent(eventType, {
      code: info.code,
      key: info.key,
      keyCode: info.keyCode,
      which: info.keyCode,
      charCode: info.keyCode,
      bubbles: false,
      cancelable: true,
    });

    try {
      Object.defineProperty(evt, 'code', {
        get: () => info.code,
        configurable: true,
      });
      Object.defineProperty(evt, 'keyCode', {
        get: () => info.keyCode,
        configurable: true,
      });
      Object.defineProperty(evt, 'which', {
        get: () => info.keyCode,
        configurable: true,
      });
    } catch (_) {}

    (evt as any)._isRetroKitSynthetic = true;
    canvas.dispatchEvent(evt);
  }

  private async _instantiatePlayRuntime(): Promise<void> {
    const configured =
      this.context?.assetPaths?.play || this.context?.assetBaseUrl;
    const baseUrl =
      configured && !configured.includes('libretro') && configured !== '/cores'
        ? configured
        : '/play-cores';
    const playJsUrl = `${baseUrl.replace(/\/$/, '')}/Play.js`;

    // Play! WebAssembly core hardcodes #outputCanvas as its WebGL2 rendering target at 640x448
    if (this.context?.canvas) {
      this.context.canvas.id = 'outputCanvas';
      this.context.canvas.width = 640;
      this.context.canvas.height = 448;
    }

    const moduleOverrides: any = {
      canvas: this.context?.canvas,
      mainScriptUrlOrBlob: playJsUrl,
      locateFile: (path: string) => `${baseUrl.replace(/\/$/, '')}/${path}`,
      preRun: [
        (mod: any) => {
          if (mod.FS) {
            try {
              mod.FS.mkdir('/work');
            } catch (_) {}
            try {
              mod.FS.mkdir('/work/mc0');
            } catch (_) {}
          }
        },
      ],
      print: (text: string) => {
        if (this.context?.debug) console.log('[Play!]', text);
        this.context?.onLog?.(text, 'info');
      },
      printErr: (text: string) => {
        if (this.context?.debug) console.error('[Play! Err]', text);
        this.context?.onLog?.(text, 'error');
      },
    };

    try {
      const moduleExport = await import(/* @vite-ignore */ playJsUrl);
      const factory = moduleExport.default || moduleExport.Play || moduleExport;
      const mod = await factory(moduleOverrides);
      try {
        mod.FS.mkdir('/work');
      } catch (_) {}
      this._playModule = mod;
    } catch (err: any) {
      const msg = `Failed to load Play! PS2 runtime from "${playJsUrl}": ${err?.message || err}`;
      console.error('[PlayAdapter]', msg, err);
      this.context?.onLog?.(msg, 'error');
      throw new Error(msg);
    }
  }
}
