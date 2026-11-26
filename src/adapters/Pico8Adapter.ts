import type {
  CoreCapabilities,
  CoreOptionDefinition,
  GameLoadOptions,
} from '../core/types';
import { BaseCoreBridge } from './BaseCoreBridge';
import type { AdapterContext } from './ICoreAdapter';

/**
 * Pico8Adapter bridges the official Lexaloffle PICO-8 standalone web runtime
 * to RetroKit using the proven architecture from JellyEmu.
 *
 * It boots cartridges (.p8 and .p8.png) via Module.arguments and Module.readAsync,
 * providing 100% native Lexaloffle PICO-8 compatibility for both binary PNG carts
 * and plaintext .p8 carts without syntax errors or drop timing failures.
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
    0: Pico8Adapter.BUTTON_O, // RETROPAD_B -> O (Z)
    1: Pico8Adapter.BUTTON_X, // RETROPAD_X -> X (X)
    2: Pico8Adapter.BUTTON_MENU, // RETROPAD_SELECT -> Menu (Enter)
    3: Pico8Adapter.BUTTON_MENU, // RETROPAD_START -> Menu (Enter)
    4: Pico8Adapter.BUTTON_UP, // RETROPAD_UP
    5: Pico8Adapter.BUTTON_DOWN, // RETROPAD_DOWN
    6: Pico8Adapter.BUTTON_LEFT, // RETROPAD_LEFT
    7: Pico8Adapter.BUTTON_RIGHT, // RETROPAD_RIGHT
    8: Pico8Adapter.BUTTON_X, // RETROPAD_A -> X
    9: Pico8Adapter.BUTTON_O, // RETROPAD_Y -> O
  };

  private _scriptElement: HTMLScriptElement | null = null;
  private _textareaElement: HTMLTextAreaElement | null = null;
  private _createdBlobUrls: string[] = [];
  private _currentCartName = 'cart.p8.png';
  private _lastFrameNumber = 0;
  private _lastFpsCalcTime = 0;
  private _currentFps = 0;
  private _isReady = false;

  public get isReady(): boolean {
    return this._isReady;
  }

  public override async init(context: AdapterContext): Promise<void> {
    await super.init(context);
    this._ensureDOMTextarea();
    this._ensureGlobalState();
  }

  public async loadGame(
    rom: ArrayBuffer | Blob | string | Uint8Array,
    options?: GameLoadOptions,
  ): Promise<void> {
    const fileName = options?.fileName || 'cart.p8.png';
    this._currentCartName = fileName;
    const isPng =
      fileName.toLowerCase().endsWith('.png') ||
      (rom instanceof Uint8Array && this._isPngSignature(rom));

    const romBytes = await this._getRomBytes(rom);
    const cartBuffer = romBytes.buffer.slice(
      romBytes.byteOffset,
      romBytes.byteOffset + romBytes.byteLength,
    ) as ArrayBuffer;

    let cartUrl: string;
    if (
      typeof rom === 'string' &&
      (rom.startsWith('/') ||
        rom.startsWith('http://') ||
        rom.startsWith('https://'))
    ) {
      cartUrl = rom;
    } else {
      const mimeType = isPng ? 'image/png' : 'text/plain;charset=utf-8';
      const blob = new Blob([cartBuffer], { type: mimeType });
      cartUrl = URL.createObjectURL(blob);
      this._createdBlobUrls.push(cartUrl);
    }

    await this._bootPico8(cartUrl, fileName, cartBuffer);
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
    if (this._textareaElement && this._textareaElement.parentNode) {
      this._textareaElement.parentNode.removeChild(this._textareaElement);
      this._textareaElement = null;
    }
    for (const url of this._createdBlobUrls) {
      try {
        URL.revokeObjectURL(url);
      } catch (_) {}
    }
    this._createdBlobUrls = [];

    const win = this._getGlobalWindow();
    delete win.Module;
    delete win._cartdat;
    delete win._cartname;
    delete win._cdpos;
    win.pico8_buttons = [0, 0, 0, 0, 0, 0, 0, 0];
    win.pico8_state = {};
    win.codo_command = 0;
    this._isReady = false;
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

    this._ensureGlobalState();
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

  public override async rawGetSram(): Promise<
    Uint8Array | Record<string, Uint8Array> | null
  > {
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
              result[fullPath] = new Uint8Array(data);
            } catch (_) {}
          }
        }
      } catch (_) {}
    }

    const keys = Object.keys(result);
    if (keys.length === 0) {
      // PICO-8 uses a fixed 256-byte (64 numbers * 4 bytes) persistent data table.
      // If the cart hasn't written to /user_data/cdata yet, provide a fresh 256-byte table.
      return new Uint8Array(256);
    }
    if (keys.length === 1) {
      return result[keys[0]];
    }
    return result;
  }

  public override async rawSetSram(
    data: Uint8Array | Record<string, Uint8Array>,
  ): Promise<boolean> {
    const win = this._getGlobalWindow();
    if (!win.Module?.FS) return false;

    const fs = win.Module.FS;

    if (data instanceof Uint8Array) {
      let targetPath: string | null = null;
      try {
        if (fs.analyzePath('/user_data/cdata').exists) {
          const files: string[] = fs.readdir('/user_data/cdata');
          for (const file of files) {
            if (file.endsWith('.pdat')) {
              targetPath = `/user_data/cdata/${file}`;
              break;
            }
          }
        }
      } catch (_) {}

      if (!targetPath) {
        const base =
          this._currentCartName
            .replace(/\.(p8\.png|p8|png)$/i, '')
            .split('/')
            .pop() || 'cart';
        targetPath = `/user_data/cdata/${base}.pdat`;
      }

      try {
        this._ensureDirectoryExists(fs, '/user_data/cdata');
        fs.writeFile(targetPath, data);
        await this.rawFlushSram();
        return true;
      } catch (err) {
        console.error('[Pico8Adapter] Failed writing SRAM buffer:', err);
        return false;
      }
    }

    for (const [filePath, content] of Object.entries(data)) {
      try {
        const lastSlash = filePath.lastIndexOf('/');
        if (lastSlash > 0) {
          const dir = filePath.slice(0, lastSlash);
          this._ensureDirectoryExists(fs, dir);
        }
        fs.writeFile(filePath, content);
      } catch (err) {
        console.error(
          `[Pico8Adapter] Failed writing SRAM file ${filePath}:`,
          err,
        );
      }
    }

    await this.rawFlushSram();
    return true;
  }

  public override async rawFlushSram(): Promise<void> {
    const win = this._getGlobalWindow();
    const fs = win.Module?.FS;
    if (!fs || typeof fs.syncfs !== 'function') return;

    await new Promise<void>((resolve) => {
      try {
        fs.syncfs(false, (err: any) => {
          if (err) {
            console.warn('[Pico8Adapter] FS.syncfs failed:', err);
          }
          resolve();
        });
      } catch (err) {
        console.warn('[Pico8Adapter] FS.syncfs exception:', err);
        resolve();
      }
    });
  }

  public override getSramPath(): string {
    const base =
      this._currentCartName
        .replace(/\.(p8\.png|p8|png)$/i, '')
        .split('/')
        .pop() || 'cart';
    return `/user_data/cdata/${base}.pdat`;
  }

  public override rawGetOptions(): CoreOptionDefinition[] {
    return [];
  }

  private _getGlobalWindow(): any {
    return typeof window !== 'undefined'
      ? (window as any)
      : (globalThis as any);
  }

  private _ensureDOMTextarea(): void {
    if (typeof document === 'undefined') return;
    let el = document.getElementById(
      'codo_textarea',
    ) as HTMLTextAreaElement | null;
    if (!el) {
      el = document.createElement('textarea');
      el.id = 'codo_textarea';
      el.className = 'emscripten';
      el.style.cssText =
        'display:none;position:absolute;left:-9999px;height:0;overflow:hidden;';
      document.body.appendChild(el);
      this._textareaElement = el;
    }
  }

  private _ensureGlobalState(): void {
    const win = this._getGlobalWindow();
    if (!win.pico8_buttons || !Array.isArray(win.pico8_buttons)) {
      win.pico8_buttons = [0, 0, 0, 0, 0, 0, 0, 0];
    }
    if (!win.pico8_state) {
      win.pico8_state = {};
    }
    if (!win.pico8_gamepads) {
      win.pico8_gamepads = { count: 0 };
    }
    if (!win.pico8_gpio) {
      win.pico8_gpio = new Array(128);
    }
    if (this.context?.audioContext && !win.pico8_audio_context) {
      win.pico8_audio_context = this.context.audioContext;
    }
    if (typeof document !== 'undefined') {
      win.codo_textarea =
        document.getElementById('codo_textarea') || this._textareaElement;
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

  private _isPngSignature(bytes: Uint8Array): boolean {
    return (
      bytes.length >= 8 &&
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    );
  }

  private async _getRomBytes(
    rom: ArrayBuffer | Blob | string | Uint8Array,
  ): Promise<Uint8Array> {
    if (typeof rom === 'string') {
      if (rom.startsWith('data:')) {
        const commaIdx = rom.indexOf(',');
        const b64 = commaIdx >= 0 ? rom.slice(commaIdx + 1) : rom;
        const bin = atob(b64);
        const out = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) {
          out[i] = bin.charCodeAt(i);
        }
        return out;
      }
      if (rom.includes('pico-8 cartridge') || rom.includes('__lua__')) {
        return new TextEncoder().encode(rom);
      }
      const resp = await fetch(rom, { headers: this.context?.fetchHeaders });
      if (!resp.ok) {
        throw new Error(`[Pico8Adapter] Failed to fetch cartridge from ${rom}`);
      }
      return new Uint8Array(await resp.arrayBuffer());
    }
    if (rom instanceof Blob) {
      return new Uint8Array(await rom.arrayBuffer());
    }
    if (rom instanceof Uint8Array) {
      return rom;
    }
    return new Uint8Array(rom);
  }

  private async _bootPico8(
    cartUrl: string,
    fileName: string,
    cartBuffer: ArrayBuffer,
  ): Promise<void> {
    const canvas = this.context?.canvas;
    if (canvas) {
      canvas.style.imageRendering = 'pixelated';
      canvas.width = 128;
      canvas.height = 128;
    }

    if (this._scriptElement && this._scriptElement.parentNode) {
      this._scriptElement.parentNode.removeChild(this._scriptElement);
      this._scriptElement = null;
    }

    this._ensureDOMTextarea();
    this._ensureGlobalState();

    const win = this._getGlobalWindow();
    delete win._cartdat;
    delete win._cartname;
    delete win._cdpos;

    const isDebug = !!this.context?.debug;

    const moduleObj: any = {
      canvas,
      arguments: [cartUrl],
      readAsync: (
        url: string,
        onload: (buffer: ArrayBuffer) => void,
        onerror: (err?: any) => void,
      ) => {
        if (
          url === cartUrl ||
          url === fileName ||
          url.endsWith(fileName) ||
          url.includes(fileName)
        ) {
          onload(cartBuffer);
          return;
        }

        fetch(url)
          .then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.arrayBuffer();
          })
          .then(onload)
          .catch((err) => {
            if (onerror) onerror(err);
          });
      },
      print: (text: string) => {
        if (isDebug) console.log('[PICO-8]', text);
        this.context?.onLog?.(text, 'info');
      },
      printErr: (text: string) => {
        if (isDebug) console.error('[PICO-8 Err]', text);
        this.context?.onLog?.(text, 'error');
      },
      onRuntimeInitialized: () => {
        this._isReady = true;
      },
    };

    win.Module = moduleObj;

    const configured =
      this.context?.assetPaths?.pico8 || this.context?.assetBaseUrl;
    const baseUrl =
      configured && !configured.includes('libretro') && configured !== '/cores'
        ? configured
        : '/pico8';
    const scriptUrl = baseUrl.endsWith('.js')
      ? baseUrl
      : `${baseUrl.replace(/\/$/, '')}/pico8.js`;

    return new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = scriptUrl;
      script.async = true;
      this._scriptElement = script;

      const timeout = setTimeout(() => {
        resolve();
      }, 4000);

      moduleObj.onRuntimeInitialized = () => {
        clearTimeout(timeout);
        this._isReady = true;
        resolve();
      };

      script.onerror = (err) => {
        clearTimeout(timeout);
        reject(
          new Error(`[Pico8Adapter] Failed to load PICO-8 runtime: ${err}`),
        );
      };

      document.body.appendChild(script);
    });
  }
}
