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

  private _module: any = null;
  private _gameData: Uint8Array | null = null;
  private _fileName = 'game.love';
  private _fps = 60;
  private _started = false;
  private _blobUrlsToRevoke: string[] = [];
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
    if (!this._started && this._module) {
      this._started = true;
      if (typeof this._module.resumeMainLoop === 'function') {
        this._module.resumeMainLoop();
      }
    } else {
      this.resume();
    }
  }

  public override pause(): void {
    super.pause();
    if (this._module && typeof this._module.pauseMainLoop === 'function') {
      this._module.pauseMainLoop();
    }
  }

  public override resume(): void {
    super.resume();
    if (this._module && typeof this._module.resumeMainLoop === 'function') {
      this._module.resumeMainLoop();
    }
  }

  public override async stop(): Promise<void> {
    await super.stop();
    if (this._module) {
      if (typeof this._module.pauseMainLoop === 'function') {
        try {
          this._module.pauseMainLoop();
        } catch (_) {}
      }
      if (typeof this._module.exit === 'function') {
        try {
          this._module.exit(0);
        } catch (_) {}
      }
    }
  }

  public override async destroy(): Promise<void> {
    await super.destroy();
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
    for (const url of this._blobUrlsToRevoke) {
      try {
        URL.revokeObjectURL(url);
      } catch (_) {}
    }
    this._blobUrlsToRevoke = [];
    this._gameData = null;
    this._started = false;
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

    let jsText = '';
    try {
      const res = await fetch(primaryJsUrl);
      if (res.ok) jsText = await res.text();
    } catch (_) {}
    if (!jsText) {
      const res = await fetch(fallbackJsUrl);
      if (!res.ok) throw new Error('[LoveAdapter] Failed to fetch love.js');
      jsText = await res.text();
    }

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

    const wasmBytes = new Uint8Array(wasmBuffer);

    const isDebug = !!this.context?.debug;
    const gameBytes = this._gameData || new Uint8Array();
    const gameName = this._fileName;

    const moduleObj: any = {
      canvas,
      arguments: [gameName],
      args: [gameName],
      cache: {
        '11.5/love.wasm': wasmBytes,
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

    const jsBlob = new Blob([jsText], { type: 'application/javascript' });
    const jsUrl = URL.createObjectURL(jsBlob);
    this._blobUrlsToRevoke.push(jsUrl);

    await this._loadScript(jsUrl);

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
        reject(new Error(`[LoveAdapter] Failed to load script: ${err}`));
      this._scriptElement = script;
      document.body.appendChild(script);
    });
  }
}
