import type {
  CoreCapabilities,
  CoreOptionDefinition,
  GameLoadOptions,
} from '../core/types';
import { BaseCoreBridge } from './BaseCoreBridge';

const NORMALIZE_1_LUA = `love.js = {}
local cache = {}
function love.js.eval(cmd)
  love.system = love.system or require('love.system')
  love.system.openURL('javascript:'..cmd)
  for i = 1, 2^32 do
    local line = io.read()
    if not line then
      break
    end
    cache[i] = line
  end
  local output = table.concat(cache, '\\n')
  for i = #cache, 1, -1 do
    cache[i] = nil
  end
  return output
end

local lfs = love.filesystem
local _lfs_getInfo = lfs.getInfo
local _lfs_read = lfs.read
function lfs.read(fn, ...)
  if not _lfs_getInfo(fn, 'file') then
    return nil, 'File does not exist: '..fn
  end
  return _lfs_read(fn, ...)
end

local _lfs_newFile = lfs.newFileData
function lfs.newFileData(fn, arg, ...)
  if not arg and not _lfs_getInfo(fn, 'file') then
    return nil, 'File does not exist: '..fn
  end
  return _lfs_newFile(fn, arg, ...)
end

local reg = debug.getregistry()
if reg then
  local _File_open = reg.File.open
  reg.File.open = function(file, ...)
    local fn = file:getFilename()
    if not _lfs_getInfo(fn) then
      return nil, 'File does not exist: '..fn
    end
    return _File_open(file, ...)
  end
end

function love.js.getWebOS()
  return 'Unknown'
end
`;

const NORMALIZE_2_LUA = `if love.event then
  local _love_event_push = love.event.push
  function love.event.push(event, action, ...)
    if event == 'quit' and action == 'reload' then
      love.js.eval('window.location.reload();')
      return
    end
    return _love_event_push(event, action, ...)
  end
end

if love.audio then
  local playing = {}
  local _love_audio_play = love.audio.play
  function love.audio.play(...)
    for i = 1, select("#", ...) do
      local source = select(i, ...)
      if source ~= nil then
        playing[source] = true
      end
    end
    return _love_audio_play(...)
  end

  local _love_audio_stop = love.audio.stop
  function love.audio.stop(source, ...)
    if source then
      return _love_audio_stop(source, ...)
    end
    for s in pairs(playing) do
      s:stop()
      playing[s] = nil
    end
  end

  local reg = debug.getregistry()
  if reg then
    local _Source_play = reg.Source.play
    reg.Source.play = function(source, ...)
      local res = _Source_play(source, ...)
      if res then
        playing[source] = true
      end
      return res
    end
  end
end

function love.system.getClipboardText()
  return love.js.eval('window.Module.Browser.getClipboard();');
end

function love.system.setClipboardText(text)
  return love.js.eval('window.Module.Browser.setClipboard();')
end

if love.keyboard then
  local textinput = false
  local _love_keyboard_setTextInput = love.keyboard.setTextInput
  function love.keyboard.setTextInput(enabled)
    local on = not not enabled
    local cmd = string.format('window.Module.Browser.setInput(%s);', tostring(on))
    love.js.eval(cmd)
    textinput = on
    return _love_keyboard_setTextInput(enabled)
  end

  local _love_keyboard_hasTextInput = love.keyboard.hasTextInput
  function love.keyboard.hasTextInput()
    if textinput == true then
      return true
    end
    return _love_keyboard_hasTextInput()
  end

  local _love_event_pump = love.event.pump
  function love.event.pump(...)
    local res = love.js.eval('window.Module.Browser.getInput();');
    if res and res ~= '' then
      love.event.push('textinput', res)
    end
    _love_event_pump(...)
  end
end
`;

/**
 * LoveAdapter integrates love.js (LÖVE 11.5 WebAssembly) with support for
 * both standalone .love files and zip archives.
 *
 * It embeds normalize1.lua and normalize2.lua into the virtual filesystem
 * at /usr/local/share/lua/5.1/ and establishes the synchronous JavaScript
 * communication bridge required by modern Love2D games like Little Bookbinder.
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
  private _isReady = false;

  public get isReady(): boolean {
    return this._isReady;
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
    this._isReady = false;
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

  public override async rawGetSram(): Promise<
    Uint8Array | Record<string, Uint8Array> | null
  > {
    const win = typeof window !== 'undefined' ? (window as any) : null;
    if (!win?.Module?.FS) return null;

    const fs = win.Module.FS;
    const result: Record<string, Uint8Array> = {};
    const rootDir = '/home/web_user/.local/share/love';

    const scanDir = (dir: string) => {
      try {
        if (!fs.analyzePath(dir).exists) return;
        const entries: string[] = fs.readdir(dir);
        for (const entry of entries) {
          if (entry === '.' || entry === '..') continue;
          const full = `${dir}/${entry}`;
          try {
            const stat = fs.stat(full);
            if (fs.isDir(stat.mode)) {
              scanDir(full);
            } else {
              result[full] = new Uint8Array(fs.readFile(full));
            }
          } catch (_) {}
        }
      } catch (_) {}
    };

    scanDir(rootDir);
    const keys = Object.keys(result);
    if (keys.length === 0) return null;
    if (keys.length === 1) return result[keys[0]];
    return result;
  }

  public override async rawSetSram(
    data: Uint8Array | Record<string, Uint8Array>,
  ): Promise<boolean> {
    const win = typeof window !== 'undefined' ? (window as any) : null;
    if (!win?.Module?.FS) return false;

    const fs = win.Module.FS;
    if (data instanceof Uint8Array) {
      const base = this._fileName.replace(/\.(love|zip)$/i, '');
      const target = `/home/web_user/.local/share/love/${base}/save.dat`;
      try {
        this._ensureDirectoryExists(
          fs,
          `/home/web_user/.local/share/love/${base}`,
        );
        fs.writeFile(target, data);
        await this.rawFlushSram();
        return true;
      } catch (err) {
        console.error('[LoveAdapter] Failed writing raw SRAM:', err);
        return false;
      }
    }

    for (const [filePath, content] of Object.entries(data)) {
      try {
        const lastSlash = filePath.lastIndexOf('/');
        if (lastSlash > 0) {
          this._ensureDirectoryExists(fs, filePath.slice(0, lastSlash));
        }
        fs.writeFile(filePath, content);
      } catch (err) {
        console.error(`[LoveAdapter] Failed writing file ${filePath}:`, err);
      }
    }

    await this.rawFlushSram();
    return true;
  }

  public override async rawFlushSram(): Promise<void> {
    const win = typeof window !== 'undefined' ? (window as any) : null;
    const fs = win?.Module?.FS;
    if (!fs || typeof fs.syncfs !== 'function') return;

    await new Promise<void>((resolve) => {
      try {
        fs.syncfs(false, () => resolve());
      } catch (_) {
        resolve();
      }
    });
  }

  public override rawGetOptions(): CoreOptionDefinition[] {
    return [];
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

    const encoder = new TextEncoder();
    const norm1Bytes = encoder.encode(NORMALIZE_1_LUA);
    const norm2Bytes = encoder.encode(NORMALIZE_2_LUA);

    const memory =
      typeof navigator !== 'undefined' && (navigator as any).deviceMemory
        ? (navigator as any).deviceMemory * 1e9
        : 1e9;
    const initialMemory = Math.min(4 * gameBytes.length + 2e7, memory);

    const moduleObj: any = {
      canvas,
      arguments: [gameName],
      args: [gameName],
      cache: {
        [gameName]: gameBytes,
        'lua/normalize1.lua': norm1Bytes,
        'lua/normalize2.lua': norm2Bytes,
        '11.5/love.wasm': wasmBuffer,
      },
      INITIAL_MEMORY: initialMemory,
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
            moduleObj.FS.mkdirTree('/usr/local/share/lua/5.1');
            moduleObj.FS.createDataFile(
              '/',
              gameName,
              gameBytes,
              true,
              true,
              true,
            );
            moduleObj.FS.createDataFile(
              '/usr/local/share/lua/5.1',
              'normalize1.lua',
              norm1Bytes,
              true,
              true,
              true,
            );
            moduleObj.FS.createDataFile(
              '/usr/local/share/lua/5.1',
              'normalize2.lua',
              norm2Bytes,
              true,
              true,
              true,
            );
          }
        } catch (e) {
          console.warn('[LoveAdapter] Error mounting files in FS:', e);
        }
      },
      postrun: () => {
        this._isReady = true;
        canvas.focus();
      },
    };

    if (typeof window !== 'undefined') {
      const win = window as any;
      win.Module = moduleObj;

      if (!win._origOpen) {
        win._origOpen = win.open.bind(win);
        win.open = (url: string) => {
          if (typeof url === 'string' && url.startsWith('javascript:')) {
            const code = url.substring(11);
            try {
              // biome-ignore lint/security/noGlobalEval: Required by love.js Lua-to-JS bridge
              win._output = window.eval(code);
            } catch (e) {
              console.warn('[LoveAdapter] eval error in openURL:', e);
            }
            return null;
          }
          return win._origOpen(url);
        };
      }

      win._output = null;
      win.prompt = () => {
        const tmp = win._output;
        win._output = null;
        return tmp;
      };
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
