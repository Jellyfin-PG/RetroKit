import type {
  CoreCapabilities,
  CoreOptionDefinition,
  GameLoadOptions,
} from '../core/types';
import { BaseCoreBridge } from './BaseCoreBridge';
import type { AdapterContext } from './ICoreAdapter';

/**
 * RuffleAdapter integrates the Ruffle WebAssembly engine to execute
 * Adobe Flash (.swf) games, movies, and animations without browser plugins.
 */
export class RuffleAdapter extends BaseCoreBridge {
  public readonly id = 'ruffle';
  public readonly name = 'Adobe Flash (Ruffle)';
  public readonly system = 'flash';
  public readonly capabilities: CoreCapabilities = {
    saveStates: false,
    sram: true, // Flash .sol (Shared Objects)
    cheats: false,
    coreOptions: true,
    multiDisc: false,
    shaders: false,
    rewind: false,
    variableSpeed: true,
    maxPlayers: 4,
    pointer: true, // Mouse / touch
  };

  private _player: any = null;
  private _swfBuffer: ArrayBuffer | null = null;

  public async init(context: AdapterContext): Promise<void> {
    await super.init(context);
  }

  public async loadGame(
    rom: ArrayBuffer | Blob | string | Uint8Array,
    _options?: GameLoadOptions,
  ): Promise<void> {
    if (typeof rom === 'string') {
      const resp = await fetch(rom, { headers: this.context?.fetchHeaders });
      if (!resp.ok)
        throw new Error(`[RuffleAdapter] Failed to fetch SWF from ${rom}`);
      this._swfBuffer = await resp.arrayBuffer();
    } else if (rom instanceof Blob) {
      this._swfBuffer = await rom.arrayBuffer();
    } else if (rom instanceof Uint8Array) {
      this._swfBuffer = (rom.buffer as ArrayBuffer).slice(
        rom.byteOffset,
        rom.byteOffset + rom.byteLength,
      );
    } else {
      this._swfBuffer = rom;
    }

    await this._instantiateRuffle();

    if (this._player && this._swfBuffer) {
      await this._player.load({ data: this._swfBuffer });
    }

    this.start();
  }

  public override start(): void {
    super.start();
    if (this._player && typeof this._player.play === 'function') {
      this._player.play();
    }
  }

  public override pause(): void {
    super.pause();
    if (this._player && typeof this._player.pause === 'function') {
      this._player.pause();
    }
  }

  public override resume(): void {
    super.resume();
    if (this._player && typeof this._player.play === 'function') {
      this._player.play();
    }
  }

  public override async stop(): Promise<void> {
    await super.stop();
    if (this._player && typeof this._player.pause === 'function') {
      this._player.pause();
    }
  }

  public override async destroy(): Promise<void> {
    await super.destroy();
    if (this._player) {
      if (typeof this._player.destroy === 'function') {
        try {
          this._player.destroy();
        } catch (_) {}
      }
      this._player = null;
    }
    this._swfBuffer = null;
  }

  // --- Flash Shared Objects (.sol) ---
  public override async rawGetSram(): Promise<Record<
    string,
    Uint8Array
  > | null> {
    // Collect localStorage Flash Local Shared Objects (.sol)
    if (typeof localStorage === 'undefined') return null;

    const result: Record<string, Uint8Array> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('ruffle_sol') || key.endsWith('.sol'))) {
        const val = localStorage.getItem(key);
        if (val) {
          result[key] = new TextEncoder().encode(val);
        }
      }
    }
    return Object.keys(result).length > 0 ? result : null;
  }

  public override async rawSetSram(
    data: Uint8Array | Record<string, Uint8Array>,
  ): Promise<boolean> {
    if (typeof localStorage === 'undefined' || data instanceof Uint8Array)
      return false;

    for (const [key, val] of Object.entries(data)) {
      localStorage.setItem(key, new TextDecoder().decode(val));
    }
    return true;
  }

  // --- Core Options ---
  public override rawGetOptions(): CoreOptionDefinition[] {
    return [
      {
        id: 'letterbox',
        label: 'Letterbox',
        type: 'enum',
        choices: [
          { value: 'on', label: 'On' },
          { value: 'off', label: 'Off' },
        ],
        defaultValue: 'on',
        currentValue: 'on',
      },
      {
        id: 'quality',
        label: 'Rendering Quality',
        type: 'enum',
        choices: [
          { value: 'high', label: 'High' },
          { value: 'medium', label: 'Medium' },
          { value: 'low', label: 'Low' },
        ],
        defaultValue: 'high',
        currentValue: 'high',
      },
    ];
  }

  public override rawSetOption(key: string, value: string): void {
    if (this._player && typeof this._player.setConfig === 'function') {
      this._player.setConfig({ [key]: value });
    }
  }

  // --- Input ---
  public override rawSendButton(
    _player: number,
    buttonId: number,
    pressed: boolean,
  ): void {
    // Map gamepad buttons to standard Flash arrow keys / action keys
    const keyMap: Record<number, string> = {
      4: 'ArrowUp',
      5: 'ArrowDown',
      6: 'ArrowLeft',
      7: 'ArrowRight',
      0: 'Space',
      8: 'KeyZ',
      1: 'KeyX',
      3: 'Enter',
    };

    const key = keyMap[buttonId];
    if (key && typeof window !== 'undefined') {
      window.dispatchEvent(
        new KeyboardEvent(pressed ? 'keydown' : 'keyup', { code: key, key }),
      );
    }
  }

  private async _instantiateRuffle(): Promise<void> {
    const baseUrl =
      this.context?.assetPaths?.ruffle || this.context?.assetBaseUrl || '';
    const ruffleJsUrl = `${baseUrl.replace(/\/$/, '')}/ruffle.js`;

    if (!(window as any).RufflePlayer) {
      try {
        await import(/* @vite-ignore */ ruffleJsUrl);
      } catch (err) {
        if (this.context?.debug) {
          console.warn(
            '[RuffleAdapter] Dynamic import of ruffle.js failed:',
            err,
          );
        }
      }
    }

    const RufflePlayer = (window as any).RufflePlayer;
    if (RufflePlayer && typeof RufflePlayer.newest === 'function') {
      const ruffle = RufflePlayer.newest();
      this._player = ruffle.createPlayer();

      // Parent container to hold ruffle canvas
      const canvas = this.context?.canvas;
      if (canvas && canvas.parentElement) {
        canvas.style.display = 'none'; // Hide placeholder canvas
        canvas.parentElement.appendChild(this._player);
      }
    }
  }
}
