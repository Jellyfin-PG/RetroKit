import type {
  CoreCapabilities,
  CoreOptionDefinition,
  GameLoadOptions,
} from '../core/types';
import { BaseCoreBridge } from './BaseCoreBridge';
import type { AdapterContext } from './ICoreAdapter';

/**
 * LoveAdapter integrates love.js to execute LÖVE (Love2D) 2D games
 * distributed as .love or .zip archives via WebAssembly.
 */
export class LoveAdapter extends BaseCoreBridge {
  public readonly id = 'love';
  public readonly name = 'LÖVE (love.js)';
  public readonly system = 'love';
  public readonly capabilities: CoreCapabilities = {
    saveStates: false,
    sram: true,
    cheats: false,
    coreOptions: true,
    multiDisc: false,
    shaders: false,
    rewind: false,
    variableSpeed: true,
    maxPlayers: 4,
    pointer: true,
  };

  private static readonly RETROPAD_TO_KEY: Record<
    number,
    { key: string; code: string; keyCode: number }
  > = {
    0: { key: 'x', code: 'KeyX', keyCode: 88 }, // RETROPAD_B
    1: { key: 's', code: 'KeyS', keyCode: 83 }, // RETROPAD_Y
    2: { key: ' ', code: 'Space', keyCode: 32 }, // RETROPAD_SELECT
    3: { key: 'Enter', code: 'Enter', keyCode: 13 }, // RETROPAD_START
    4: { key: 'ArrowUp', code: 'ArrowUp', keyCode: 38 }, // RETROPAD_UP
    5: { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40 }, // RETROPAD_DOWN
    6: { key: 'ArrowLeft', code: 'ArrowLeft', keyCode: 37 }, // RETROPAD_LEFT
    7: { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39 }, // RETROPAD_RIGHT
    8: { key: 'z', code: 'KeyZ', keyCode: 90 }, // RETROPAD_A
    9: { key: 'a', code: 'KeyA', keyCode: 65 }, // RETROPAD_X
  };

  private _module: any = null;
  private _gameData: Uint8Array | null = null;
  private _fileName = 'game.love';
  private _fps = 60;
  private _scriptElement: HTMLScriptElement | null = null;

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
        throw new Error(`[LoveAdapter] Failed to fetch .love from: ${rom}`);
      }
      this._gameData = new Uint8Array(await resp.arrayBuffer());
    } else if (rom instanceof Blob) {
      this._gameData = new Uint8Array(await rom.arrayBuffer());
    } else if (rom instanceof Uint8Array) {
      this._gameData = rom;
    } else {
      this._gameData = new Uint8Array(rom);
    }

    this._fileName = options?.fileName || 'game.love';
    if (
      !this._fileName.toLowerCase().endsWith('.love') &&
      !this._fileName.toLowerCase().endsWith('.zip')
    ) {
      this._fileName += '.love';
    }

    await this._instantiateLove();
    this.start();
  }

  public override start(): void {
    super.start();
    this.resume();
  }

  public override pause(): void {
    super.pause();
    if (this._module?.Browser?.mainLoop?.pause) {
      try {
        this._module.Browser.mainLoop.pause();
      } catch (_) {}
    }
  }

  public override resume(): void {
    super.resume();
    if (this._module?.Browser?.mainLoop?.resume) {
      try {
        this._module.Browser.mainLoop.resume();
      } catch (_) {}
    }
  }

  public override async stop(): Promise<void> {
    this.pause();
    await super.stop();
  }

  public override async restart(): Promise<void> {
    if (this._gameData) {
      await this.destroy();
      await this.loadGame(this._gameData, { fileName: this._fileName });
    }
  }

  public override async destroy(): Promise<void> {
    this.pause();
    if (this._module) {
      if (typeof this._module.exit === 'function') {
        try {
          this._module.exit(0);
        } catch (_) {}
      }
      this._module = null;
    }
    if (this._scriptElement?.parentNode) {
      this._scriptElement.parentNode.removeChild(this._scriptElement);
      this._scriptElement = null;
    }
    if (typeof window !== 'undefined') {
      try {
        delete (window as any).Love;
        delete (window as any).Module;
      } catch (_) {
        (window as any).Love = undefined;
        (window as any).Module = undefined;
      }
    }
    this._gameData = null;
    await super.destroy();
  }

  public rawSendButton(
    _player: number,
    buttonId: number,
    pressed: boolean,
  ): void {
    const keyInfo = LoveAdapter.RETROPAD_TO_KEY[buttonId];
    if (!keyInfo) return;

    const eventType = pressed ? 'keydown' : 'keyup';
    const eventInit: KeyboardEventInit = {
      key: keyInfo.key,
      code: keyInfo.code,
      bubbles: true,
      cancelable: true,
    };

    const canvas = this.context?.canvas;
    const target = canvas || (typeof window !== 'undefined' ? window : null);
    if (!target) return;

    try {
      const evt = new KeyboardEvent(eventType, eventInit);
      target.dispatchEvent(evt);
    } catch (_) {}
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
    return this._fps;
  }

  public override rawGetOptions(): CoreOptionDefinition[] {
    return [];
  }

  private async _instantiateLove(): Promise<void> {
    const canvas = this.context?.canvas;
    if (!canvas) {
      throw new Error('[LoveAdapter] Target canvas is required');
    }

    if (!canvas.id) {
      canvas.id = 'canvas';
    }

    this.context?.onLog?.(
      '[LoveAdapter] Fetching love.js and love.wasm...',
      'info',
    );

    const primaryJsUrl = '/love-cores/love.js';
    const fallbackJsUrl =
      'https://cdn.jsdelivr.net/gh/2dengine/love.js@main/11.5/love.js';
    const primaryWasmUrl = '/love-cores/love.wasm';
    const fallbackWasmUrl =
      'https://cdn.jsdelivr.net/gh/2dengine/love.js@main/11.5/love.wasm';

    let wasmBuffer: ArrayBuffer | null = null;
    try {
      const res = await fetch(primaryWasmUrl);
      if (res.ok) wasmBuffer = await res.arrayBuffer();
    } catch (_) {}
    if (!wasmBuffer) {
      const res = await fetch(fallbackWasmUrl);
      if (!res.ok) throw new Error('[LoveAdapter] Failed to fetch love.wasm');
      wasmBuffer = await res.arrayBuffer();
    }

    const isDebug = !!this.context?.debug;
    const gameBytes = this._gameData || new Uint8Array();
    const gameName = this._fileName;

    const moduleObj: any = {
      canvas,
      arguments: [gameName],
      args: [gameName],
      cache: {
        '11.5/love.wasm': wasmBuffer,
      },
      locateFile: (path: string) => {
        if (path.endsWith('.wasm')) return primaryWasmUrl;
        return path;
      },
      INITIAL_MEMORY: Math.min(4 * gameBytes.length + 33554432, 1073741824),
      print: (text: string) => {
        if (isDebug) console.log('[love.js]', text);
        this.context?.onLog?.(text, 'info');
      },
      printErr: (text: string) => {
        if (isDebug) console.error('[love.js Err]', text);
        this.context?.onLog?.(text, 'error');
      },
      prerun: () => {
        try {
          if (moduleObj.FS) {
            try {
              moduleObj.FS.unlink(`/${gameName}`);
            } catch (_) {}
            moduleObj.FS.createDataFile(
              '/',
              gameName,
              gameBytes,
              true,
              true,
              true,
            );
          }
        } catch (e) {
          console.warn('[LoveAdapter] Error mounting game file in FS:', e);
        }
      },
    };

    if (typeof window !== 'undefined') {
      (window as any).Module = moduleObj;
    }

    if (typeof (window as any).Love !== 'function') {
      try {
        await this._loadScript(primaryJsUrl);
      } catch (_) {
        await this._loadScript(fallbackJsUrl);
      }
    }

    const loveFactory = (window as any).Love;
    if (typeof loveFactory !== 'function') {
      throw new Error('[LoveAdapter] love.js did not export window.Love');
    }

    this._module = await loveFactory(moduleObj);
    this.context?.onLog?.(
      '[LoveAdapter] LÖVE runtime initialized successfully',
      'info',
    );
  }

  private _loadScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = (err) =>
        reject(new Error(`[LoveAdapter] Failed to load script ${url}: ${err}`));
      this._scriptElement = script;
      document.body.appendChild(script);
    });
  }
}
