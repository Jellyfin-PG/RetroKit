import type {
  CoreCapabilities,
  CoreOptionDefinition,
  GameLoadOptions,
} from '../core/types';
import { BaseCoreBridge } from './BaseCoreBridge';
import type { AdapterContext } from './ICoreAdapter';

/**
 * Pico8Adapter bridges the official Lexaloffle PICO-8 standalone web player
 * to RetroKit. It runs cartridges (.p8 and .p8.png) with official Lexaloffle
 * compatibility without relying on the alpha retro8 libretro core.
 */
export class Pico8Adapter extends BaseCoreBridge {
  public readonly id = 'pico8';
  public readonly name = 'PICO-8 (Official Lexaloffle)';
  public readonly system = 'pico8';
  public readonly capabilities: CoreCapabilities = {
    saveStates: false,
    sram: true,
    cheats: false,
    coreOptions: true,
    multiDisc: false,
    shaders: false,
    rewind: false,
    variableSpeed: false,
    maxPlayers: 8,
    pointer: true,
  };

  private static readonly BUTTON_LEFT = 0x01;
  private static readonly BUTTON_RIGHT = 0x02;
  private static readonly BUTTON_UP = 0x04;
  private static readonly BUTTON_DOWN = 0x08;
  private static readonly BUTTON_O = 0x10;
  private static readonly BUTTON_X = 0x20;
  private static readonly BUTTON_MENU = 0x40;

  private static readonly RETROPAD_TO_PICO8: Record<number, number> = {
    0: Pico8Adapter.BUTTON_O, // RETROPAD_B
    1: Pico8Adapter.BUTTON_X, // RETROPAD_X
    2: Pico8Adapter.BUTTON_MENU, // RETROPAD_SELECT
    3: Pico8Adapter.BUTTON_MENU, // RETROPAD_START
    4: Pico8Adapter.BUTTON_UP, // RETROPAD_UP
    5: Pico8Adapter.BUTTON_DOWN, // RETROPAD_DOWN
    6: Pico8Adapter.BUTTON_LEFT, // RETROPAD_LEFT
    7: Pico8Adapter.BUTTON_RIGHT, // RETROPAD_RIGHT
    8: Pico8Adapter.BUTTON_X, // RETROPAD_A
    9: Pico8Adapter.BUTTON_O, // RETROPAD_Y
  };

  private _scriptElement: HTMLScriptElement | null = null;
  private _isRuntimeReady = false;
  private _lastFrameNumber = 0;
  private _lastFpsCalcTime = 0;
  private _currentFps = 0;

  public override async init(context: AdapterContext): Promise<void> {
    await super.init(context);
    this._ensureGlobalButtons();
  }

  public async loadGame(
    rom: ArrayBuffer | Blob | string | Uint8Array,
    options?: GameLoadOptions,
  ): Promise<void> {
    const fileName = options?.fileName || 'cart.p8.png';
    const isPng = fileName.toLowerCase().endsWith('.png');
    const isP8 = fileName.toLowerCase().endsWith('.p8');
    const normalizedCartName = isPng || isP8 ? fileName : `${fileName}.p8.png`;
    const dataUrl = await this._convertToDataUrl(rom, fileName);

    await this._instantiatePico8Runtime(dataUrl, normalizedCartName);

    const win = this._getGlobalWindow();
    win.p8_dropped_cart = dataUrl;
    win.p8_dropped_cart_name = normalizedCartName;
    win.codo_command = 9;

    let attempts = 0;
    await new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        attempts++;
        if (win.codo_command === 0 || attempts > 20) {
          clearInterval(interval);
          resolve();
        }
      }, 50);
    });

    this.start();
  }

  public override start(): void {
    super.start();
    const win = this._getGlobalWindow();
    if (win.Module?.pico8SetPaused) {
      try {
        win.Module.pico8SetPaused(false);
      } catch (_) {}
    } else if (win.codo_command === 0) {
      win.codo_command = 5;
      win.codo_command_p = 0;
    }
  }

  public override pause(): void {
    super.pause();
    const win = this._getGlobalWindow();
    if (win.Module?.pico8SetPaused) {
      try {
        win.Module.pico8SetPaused(true);
      } catch (_) {}
    } else if (win.codo_command === 0) {
      win.codo_command = 5;
      win.codo_command_p = 1;
    }
  }

  public override resume(): void {
    super.resume();
    const win = this._getGlobalWindow();
    if (win.Module?.pico8SetPaused) {
      try {
        win.Module.pico8SetPaused(false);
      } catch (_) {}
    } else if (win.codo_command === 0) {
      win.codo_command = 5;
      win.codo_command_p = 0;
    }
  }

  public override async stop(): Promise<void> {
    this.pause();
    await super.stop();
  }

  public override async restart(): Promise<void> {
    const win = this._getGlobalWindow();
    if (win.Module?.pico8Reset) {
      try {
        win.Module.pico8Reset();
      } catch (_) {}
    } else {
      win.codo_command = 1;
    }
  }

  public override async destroy(): Promise<void> {
    await this.stop();
    if (this._scriptElement && this._scriptElement.parentNode) {
      this._scriptElement.parentNode.removeChild(this._scriptElement);
      this._scriptElement = null;
    }
    this._isRuntimeReady = false;
    await super.destroy();
  }

  public rawSendButton(
    player: number,
    buttonId: number,
    pressed: boolean,
  ): void {
    if (player < 0 || player >= 8) return;
    const mask = Pico8Adapter.RETROPAD_TO_PICO8[buttonId];
    if (!mask) return;

    this._ensureGlobalButtons();
    const win = this._getGlobalWindow();
    if (pressed) {
      win.pico8_buttons[player] |= mask;
    } else {
      win.pico8_buttons[player] &= ~mask;
    }
  }

  public rawSendAxis(player: number, axisId: number, value: number): void {
    const deadzone = 0.5;
    if (axisId === 0) {
      if (value > deadzone) {
        this.rawSendButton(player, 7, true);
        this.rawSendButton(player, 6, false);
      } else if (value < -deadzone) {
        this.rawSendButton(player, 6, true);
        this.rawSendButton(player, 7, false);
      } else {
        this.rawSendButton(player, 6, false);
        this.rawSendButton(player, 7, false);
      }
    } else if (axisId === 1) {
      if (value > deadzone) {
        this.rawSendButton(player, 5, true);
        this.rawSendButton(player, 4, false);
      } else if (value < -deadzone) {
        this.rawSendButton(player, 4, true);
        this.rawSendButton(player, 5, false);
      } else {
        this.rawSendButton(player, 4, false);
        this.rawSendButton(player, 5, false);
      }
    }
  }

  public override rawGetFps(): number {
    const win = this._getGlobalWindow();
    const currentFrame = win.pico8_state?.frame_number || 0;
    const now = performance.now();
    const deltaMs = now - this._lastFpsCalcTime;

    if (deltaMs >= 1000) {
      const frameDelta = currentFrame - this._lastFrameNumber;
      this._currentFps = (frameDelta * 1000) / deltaMs;
      this._lastFrameNumber = currentFrame;
      this._lastFpsCalcTime = now;
    }

    return Math.max(0, Math.round(this._currentFps));
  }

  public override async rawGetSram(): Promise<Record<
    string,
    Uint8Array
  > | null> {
    const win = this._getGlobalWindow();
    if (!win.Module?.FS) return null;

    const fs = win.Module.FS;
    const result: Record<string, Uint8Array> = {};

    const dirsToCheck = ['/user_data/cdata', '/user_data/cstore'];
    for (const dir of dirsToCheck) {
      try {
        if (fs.analyzePath(dir).exists) {
          const files: string[] = fs.readdir(dir);
          for (const file of files) {
            if (file === '.' || file === '..') continue;
            const fullPath = `${dir}/${file}`;
            try {
              const data = fs.readFile(fullPath);
              result[`${dir}/${file}`] = new Uint8Array(data);
            } catch (_) {}
          }
        }
      } catch (_) {}
    }

    return Object.keys(result).length > 0 ? result : null;
  }

  public override async rawSetSram(
    data: Uint8Array | Record<string, Uint8Array>,
  ): Promise<boolean> {
    const win = this._getGlobalWindow();
    if (!win.Module?.FS) return false;
    if (data instanceof Uint8Array) return false;

    const fs = win.Module.FS;
    for (const [filePath, content] of Object.entries(data)) {
      try {
        const lastSlash = filePath.lastIndexOf('/');
        if (lastSlash > 0) {
          const dir = filePath.slice(0, lastSlash);
          this._ensureDirectoryExists(fs, dir);
        }
        fs.writeFile(filePath, content);
      } catch (_) {}
    }

    return true;
  }

  public override rawGetOptions(): CoreOptionDefinition[] {
    return [];
  }

  private _getGlobalWindow(): any {
    return typeof window !== 'undefined'
      ? (window as any)
      : (globalThis as any);
  }

  private _ensureGlobalButtons(): void {
    const win = this._getGlobalWindow();
    if (!win.pico8_buttons || !Array.isArray(win.pico8_buttons)) {
      win.pico8_buttons = [0, 0, 0, 0, 0, 0, 0, 0];
    }
    if (!win.pico8_state) {
      win.pico8_state = {};
    }
  }

  private _ensureDirectoryExists(fs: any, dirPath: string): void {
    const parts = dirPath.split('/').filter(Boolean);
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

  private async _convertToDataUrl(
    rom: ArrayBuffer | Blob | string | Uint8Array,
    fileName: string,
  ): Promise<string> {
    const isPng = fileName.toLowerCase().endsWith('.png');
    const mimeType = isPng ? 'image/png' : 'application/octet-stream';

    if (typeof rom === 'string') {
      if (rom.startsWith('data:')) {
        return rom;
      }
      if (rom.includes('pico-8 cartridge')) {
        return this._blobToDataUrl(
          new Blob([rom], { type: 'text/plain;charset=utf-8' }),
        );
      }
      const resp = await fetch(rom, { headers: this.context?.fetchHeaders });
      if (!resp.ok) {
        throw new Error(`[Pico8Adapter] Failed to fetch cartridge from ${rom}`);
      }
      const blob = await resp.blob();
      return this._blobToDataUrl(
        new Blob([await blob.arrayBuffer()], { type: mimeType }),
      );
    }

    if (rom instanceof Blob) {
      const type = rom.type || mimeType;
      return this._blobToDataUrl(new Blob([await rom.arrayBuffer()], { type }));
    }

    if (rom instanceof Uint8Array) {
      const copy = rom.buffer.slice(
        rom.byteOffset,
        rom.byteOffset + rom.byteLength,
      ) as ArrayBuffer;
      return this._blobToDataUrl(new Blob([copy], { type: mimeType }));
    }

    return this._blobToDataUrl(new Blob([rom], { type: mimeType }));
  }

  private _blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () =>
        reject(new Error('[Pico8Adapter] Failed reading cartridge blob.'));
      reader.readAsDataURL(blob);
    });
  }

  private async _instantiatePico8Runtime(
    dataUrl: string,
    cartName: string,
  ): Promise<void> {
    const win = this._getGlobalWindow();
    const canvas = this.context?.canvas;
    if (canvas) {
      canvas.style.imageRendering = 'pixelated';
      canvas.width = 128;
      canvas.height = 128;
    }

    if (this.context?.audioContext) {
      win.pico8_audio_context = this.context.audioContext;
    }

    if (this._isRuntimeReady && win.Module) {
      if (canvas) {
        win.Module.canvas = canvas;
      }
      return;
    }

    win.p8_dropped_cart = dataUrl;
    win.p8_dropped_cart_name = cartName;
    win.codo_command = 9;

    const baseUrl = this.context?.assetBaseUrl?.includes('pico8')
      ? this.context.assetBaseUrl
      : '/pico8';
    const scriptUrl = baseUrl.endsWith('.js')
      ? baseUrl
      : `${baseUrl.replace(/\/$/, '')}/pico8.js`;

    const resp = await fetch(scriptUrl, {
      headers: this.context?.fetchHeaders,
    });
    if (!resp.ok) {
      throw new Error(
        `[Pico8Adapter] Failed to fetch PICO-8 script from ${scriptUrl}`,
      );
    }
    const code = await resp.text();

    return new Promise<void>((resolve) => {
      let resolved = false;
      const doResolve = () => {
        if (!resolved) {
          resolved = true;
          this._isRuntimeReady = true;
          resolve();
        }
      };

      win.on_module_load = () => {
        doResolve();
      };

      win.Module = {
        canvas,
        print: (text: string) => {
          this.context?.onLog?.(text, 'info');
        },
        printErr: (text: string) => {
          this.context?.onLog?.(text, 'error');
        },
        onRuntimeInitialized: () => {
          setTimeout(doResolve, 100);
        },
      };

      const script = document.createElement('script');
      script.textContent = code;
      this._scriptElement = script;
      document.head.appendChild(script);

      setTimeout(() => {
        doResolve();
      }, 3000);
    });
  }
}
