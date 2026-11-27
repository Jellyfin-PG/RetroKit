import type { ICoreAdapter } from '../adapters/ICoreAdapter';
import type {
  GamepadDetails,
  StandardAxis,
  StandardButton,
  StandardHotkey,
} from '../core/types';
import { PlayerInputChannel } from './PlayerInputChannel';

const KEYBOARD_PASSTHROUGH_SYSTEMS = new Set([
  'dos',
  'amiga',
  'c64',
  'pc88',
  'x1',
  'thomson',
  'mac',
  'palmos',
  'ti83',
  'bk',
  'galaksija',
  'p2000',
  'scummvm',
  'flash',
  'love',
  'chailove',
  'craft',
  'doom',
  'quake',
  'quake2',
  'ecwolf',
]);

export interface IInputManager {
  player(index: number): PlayerInputChannel;
  getMaxPlayers(): number;
  autoAssignGamepads(): void;
  setHotkeyBinding(hotkey: StandardHotkey, keyOrButton: string | number): void;
  getConnectedControllers(): GamepadDetails[];

  // Top-level programmatic injection methods (ideal for front-end virtual touch controllers)
  sendButton(player: number, button: StandardButton, pressed: boolean): void;
  sendAxis(player: number, axis: StandardAxis, value: number): void;
  sendAnalogStick(
    player: number,
    stick: 'LEFT' | 'RIGHT',
    x: number,
    y: number,
  ): void;

  destroy(): void;
}

export class InputManager implements IInputManager {
  private _players: PlayerInputChannel[] = [];
  private _hotkeys = new Map<string, StandardHotkey>();
  private _hotkeyHandlers = new Map<StandardHotkey, () => void>();
  private _pollRaf: number | null = null;
  private _onKeyDownRef: (e: KeyboardEvent) => void;
  private _onKeyUpRef: (e: KeyboardEvent) => void;
  private _onGamepadConnectedRef: () => void;

  constructor(
    private readonly _getAdapter: () => ICoreAdapter | null,
    private readonly _maxPlayers = 4,
  ) {
    for (let i = 0; i < this._maxPlayers; i++) {
      this._players.push(new PlayerInputChannel(i, this._getAdapter));
    }

    this._onKeyDownRef = this._handleKeyDown.bind(this);
    this._onKeyUpRef = this._handleKeyUp.bind(this);
    this._onGamepadConnectedRef = () => this.autoAssignGamepads();

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this._onKeyDownRef, true);
      window.addEventListener('keyup', this._onKeyUpRef, true);
      window.addEventListener('gamepadconnected', this._onGamepadConnectedRef);
      this.autoAssignGamepads();
      this._startGamepadLoop();
    }
  }

  public player(index: number): PlayerInputChannel {
    if (index < 0 || index >= this._players.length) {
      throw new Error(
        `[InputManager] Invalid player index: ${index} (max: ${this._players.length})`,
      );
    }
    return this._players[index];
  }

  public sendButton(
    player: number,
    button: StandardButton,
    pressed: boolean,
  ): void {
    this.player(player).sendButton(button, pressed);
  }

  public sendAxis(player: number, axis: StandardAxis, value: number): void {
    this.player(player).sendAxis(axis, value);
  }

  public sendAnalogStick(
    player: number,
    stick: 'LEFT' | 'RIGHT',
    x: number,
    y: number,
  ): void {
    this.player(player).sendAnalogStick(stick, x, y);
  }

  public getMaxPlayers(): number {
    const adapter = this._getAdapter();
    return adapter?.capabilities.maxPlayers || this._maxPlayers;
  }

  public autoAssignGamepads(): void {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return;
    const gamepads = Array.from(navigator.getGamepads()).filter(
      (g): g is Gamepad => g !== null,
    );

    gamepads.forEach((gp, idx) => {
      if (idx < this._players.length) {
        this._players[idx].assignGamepad(gp.index);
      }
    });
  }

  public setHotkeyBinding(
    hotkey: StandardHotkey,
    keyOrButton: string | number,
  ): void {
    this._hotkeys.set(String(keyOrButton), hotkey);
  }

  public registerHotkeyHandler(
    hotkey: StandardHotkey,
    handler: () => void,
  ): void {
    this._hotkeyHandlers.set(hotkey, handler);
  }

  public getConnectedControllers(): GamepadDetails[] {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return [];
    return Array.from(navigator.getGamepads())
      .filter((g): g is Gamepad => g !== null)
      .map((g) => {
        const assigned = this._players.find(
          (p) => p.assignedGamepadIndex === g.index,
        );
        return {
          index: g.index,
          id: g.id,
          connected: g.connected,
          mapping: g.mapping,
          assignedPlayer: assigned ? assigned.playerIndex : null,
        };
      });
  }

  public destroy(): void {
    if (this._pollRaf) {
      cancelAnimationFrame(this._pollRaf);
      this._pollRaf = null;
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this._onKeyDownRef, true);
      window.removeEventListener('keyup', this._onKeyUpRef, true);
      window.removeEventListener(
        'gamepadconnected',
        this._onGamepadConnectedRef,
      );
    }
  }

  private _shouldIgnoreKeyEvent(e: KeyboardEvent): boolean {
    if ((e as any)._isRetroKitSynthetic) return true;
    const target = e.target as HTMLElement | null;
    if (
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable)
    ) {
      return true;
    }
    if (
      typeof window !== 'undefined' &&
      (window as any).__JE_INPUT_MODAL_OPEN__
    ) {
      return true;
    }
    return false;
  }

  private _handleKeyDown(e: KeyboardEvent): void {
    if (this._shouldIgnoreKeyEvent(e)) return;

    // Check global hotkeys
    const hotkey = this._hotkeys.get(e.code) || this._hotkeys.get(e.key);
    if (hotkey) {
      const handler = this._hotkeyHandlers.get(hotkey);
      if (handler) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        handler();
        return;
      }
    }

    // Dispatch to Player 1 by default for keyboard
    const handled = this._players[0].handleKeyEvent(e.code, true);
    if (handled) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return;
    }

    // Prevent unmapped keys from leaking into Emscripten/RetroArch SDL or EmulatorJS default keymaps
    if (this._shouldBlockUnmappedKey(e)) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }

  private _handleKeyUp(e: KeyboardEvent): void {
    if (this._shouldIgnoreKeyEvent(e)) return;

    const handled = this._players[0].handleKeyEvent(e.code, false);
    if (handled) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return;
    }

    if (this._shouldBlockUnmappedKey(e)) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }

  private _shouldBlockUnmappedKey(e: KeyboardEvent): boolean {
    const adapter = this._getAdapter();
    if (!adapter) return false;
    if (KEYBOARD_PASSTHROUGH_SYSTEMS.has(adapter.system?.toLowerCase())) {
      return false;
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return false;
    // Allow browser refresh (F5), fullscreen (F11), DevTools (F12), and Escape
    if (/^F([5-9]|1[0-2])$/.test(e.code) || e.code === 'Escape') return false;
    return true;
  }

  private _startGamepadLoop(): void {
    const poll = () => {
      if (typeof navigator !== 'undefined' && navigator.getGamepads) {
        const gamepads = navigator.getGamepads();
        for (const player of this._players) {
          if (player.assignedGamepadIndex !== null) {
            const gp = gamepads[player.assignedGamepadIndex];
            if (gp && gp.connected) {
              player.handleGamepadState(gp);
            }
          }
        }
      }
      this._pollRaf = requestAnimationFrame(poll);
    };
    this._pollRaf = requestAnimationFrame(poll);
  }
}
