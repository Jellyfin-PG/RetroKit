import type { ICoreAdapter } from '../adapters/ICoreAdapter';
import type {
  GamepadDetails,
  StandardAxis,
  StandardButton,
  StandardHotkey,
} from '../core/types';
import { PlayerInputChannel } from './PlayerInputChannel';

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

  constructor(
    private readonly _getAdapter: () => ICoreAdapter | null,
    private readonly _maxPlayers = 4,
  ) {
    for (let i = 0; i < this._maxPlayers; i++) {
      this._players.push(new PlayerInputChannel(i, this._getAdapter));
    }

    this._onKeyDownRef = this._handleKeyDown.bind(this);
    this._onKeyUpRef = this._handleKeyUp.bind(this);

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this._onKeyDownRef);
      window.addEventListener('keyup', this._onKeyUpRef);
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
      window.removeEventListener('keydown', this._onKeyDownRef);
      window.removeEventListener('keyup', this._onKeyUpRef);
    }
  }

  private _handleKeyDown(e: KeyboardEvent): void {
    if ((e as any)._isRetroKitSynthetic) return;

    // Check global hotkeys
    const hotkey = this._hotkeys.get(e.code) || this._hotkeys.get(e.key);
    if (hotkey) {
      const handler = this._hotkeyHandlers.get(hotkey);
      if (handler) {
        e.preventDefault();
        handler();
        return;
      }
    }

    // Dispatch to Player 1 by default for keyboard
    const handled = this._players[0].handleKeyEvent(e.code, true);
    if (handled) {
      e.preventDefault();
    }
  }

  private _handleKeyUp(e: KeyboardEvent): void {
    if ((e as any)._isRetroKitSynthetic) return;

    const handled = this._players[0].handleKeyEvent(e.code, false);
    if (handled) {
      e.preventDefault();
    }
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
