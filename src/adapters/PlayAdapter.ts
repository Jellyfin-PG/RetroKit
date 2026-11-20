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
    sram: true, // /work/mc0 virtual memory card
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
    if (typeof rom === 'string') {
      const resp = await fetch(rom, { headers: this.context?.fetchHeaders });
      if (!resp.ok)
        throw new Error(`[PlayAdapter] Failed to fetch PS2 ROM from ${rom}`);
      this._romBlob = await resp.blob();
    } else if (rom instanceof Blob) {
      this._romBlob = rom;
    } else if (rom instanceof Uint8Array) {
      this._romBlob = new Blob([rom.buffer as ArrayBuffer]);
    } else {
      this._romBlob = new Blob([rom]);
    }

    await this._instantiatePlayRuntime();

    if (
      options?.initialSram &&
      typeof options.initialSram === 'object' &&
      !(options.initialSram instanceof Uint8Array)
    ) {
      await this.rawSetSram(options.initialSram);
    }

    this.start();
  }

  public override start(): void {
    super.start();
    if (
      this._playModule &&
      typeof this._playModule.resumeMainLoop === 'function'
    ) {
      this._playModule.resumeMainLoop();
    }
  }

  public override pause(): void {
    super.pause();
    if (
      this._playModule &&
      typeof this._playModule.pauseMainLoop === 'function'
    ) {
      this._playModule.pauseMainLoop();
    }
  }

  public override resume(): void {
    super.resume();
    if (
      this._playModule &&
      typeof this._playModule.resumeMainLoop === 'function'
    ) {
      this._playModule.resumeMainLoop();
    }
  }

  public override async stop(): Promise<void> {
    await super.stop();
    if (
      this._playModule &&
      typeof this._playModule.pauseMainLoop === 'function'
    ) {
      this._playModule.pauseMainLoop();
    }
  }

  public override async destroy(): Promise<void> {
    await super.destroy();
    if (this._playModule) {
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
      // L_STICK_X
      this._simulateCanvasKey(this.PS2_KEY_MAP[16], value > deadzone);
      this._simulateCanvasKey(this.PS2_KEY_MAP[17], value < -deadzone);
    } else if (axisId === 1) {
      // L_STICK_Y
      this._simulateCanvasKey(this.PS2_KEY_MAP[18], value > deadzone);
      this._simulateCanvasKey(this.PS2_KEY_MAP[19], value < -deadzone);
    } else if (axisId === 2) {
      // R_STICK_X
      this._simulateCanvasKey(this.PS2_KEY_MAP[20], value > deadzone);
      this._simulateCanvasKey(this.PS2_KEY_MAP[21], value < -deadzone);
    } else if (axisId === 3) {
      // R_STICK_Y
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

    canvas.dispatchEvent(evt);
  }

  private async _instantiatePlayRuntime(): Promise<void> {
    const baseUrl = this.context?.assetBaseUrl || '';
    const playJsUrl = `${baseUrl.replace(/\/$/, '')}/Play.js`;

    const moduleOverrides = {
      canvas: this.context?.canvas,
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
      },
      printErr: (text: string) => {
        if (this.context?.debug) console.error('[Play! Err]', text);
      },
    };

    try {
      const moduleExport = await import(/* @vite-ignore */ playJsUrl);
      const factory = moduleExport.default || moduleExport.Play || moduleExport;
      this._playModule = await factory(moduleOverrides);
    } catch (err) {
      if (this.context?.debug) {
        console.warn('[PlayAdapter] Dynamic import of Play.js failed:', err);
      }
      this._playModule = moduleOverrides;
    }
  }
}
