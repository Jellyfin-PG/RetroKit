import type { ICoreAdapter } from '../adapters/ICoreAdapter';
import type { StandardAxis, StandardButton } from '../core/types';

/**
 * Standard button to numeric ID map for Libretro / RetroPad device.
 */
export const STANDARD_BUTTON_MAP: Record<StandardButton, number> = {
  ACTION_DOWN: 0, // B (Nintendo) / Cross (Sony)
  ACTION_RIGHT: 8, // A (Nintendo) / Circle (Sony)
  ACTION_LEFT: 1, // Y (Nintendo) / Square (Sony)
  ACTION_UP: 9, // X (Nintendo) / Triangle (Sony)
  SELECT: 2,
  START: 3,
  DPAD_UP: 4,
  DPAD_DOWN: 5,
  DPAD_LEFT: 6,
  DPAD_RIGHT: 7,
  L1: 10,
  R1: 11,
  L2: 12,
  R2: 13,
  L3: 14,
  R3: 15,
  HOME: 16,
  HOTKEY_FAST_FORWARD: 20,
  HOTKEY_REWIND: 21,
  HOTKEY_SAVE: 22,
  HOTKEY_LOAD: 23,
};

export const STANDARD_AXIS_MAP: Record<StandardAxis, number> = {
  L_STICK_X: 0,
  L_STICK_Y: 1,
  R_STICK_X: 2,
  R_STICK_Y: 3,
};

/**
 * Dedicated, isolated input channel for a single player (Player 1..N).
 * Supports digital buttons, analog triggers, and dual analog sticks (-1.0 to 1.0).
 */
export class PlayerInputChannel {
  private _assignedGamepadIndex: number | null = null;
  private _keyBindings = new Map<string, StandardButton>();
  private _keyAxisBindings = new Map<
    string,
    { axis: StandardAxis; direction: 1 | -1 }
  >();
  private _activeKeyAxisDirections = new Map<
    StandardAxis,
    { pos: boolean; neg: boolean }
  >();
  private _gamepadBindings = new Map<number, StandardButton>();
  private _gamepadAxisButtonBindings = new Map<
    number,
    { axis: StandardAxis; direction: 1 | -1 }
  >();
  private _gamepadAxisToButtonBindings = new Map<
    string,
    { gpAxisIndex: number; gpDir: 1 | -1; action: StandardButton }
  >();
  private _gamepadAxisToButtonStates = new Map<string, boolean>();
  private _gamepadAxisToAxisBindings = new Map<
    string,
    {
      gpAxisIndex: number;
      gpDir: 1 | -1;
      axis: StandardAxis;
      direction: 1 | -1;
    }
  >();
  private _gamepadAxisToAxisStates = new Map<string, boolean>();
  private _activeGamepadAxisButtonDirections = new Map<
    StandardAxis,
    { pos: boolean; neg: boolean }
  >();
  private _buttonStates = new Map<StandardButton, boolean>();
  private _axisStates = new Map<StandardAxis, number>();
  private _turboIntervals = new Map<StandardButton, number>();

  constructor(
    public readonly playerIndex: number,
    private readonly _getAdapter: () => ICoreAdapter | null,
  ) {
    this.resetBindings();
  }

  public get assignedGamepadIndex(): number | null {
    return this._assignedGamepadIndex;
  }

  public assignGamepad(gamepadIndex: number | null): void {
    this._assignedGamepadIndex = gamepadIndex;
  }

  /**
   * Sends button press or release state.
   */
  public sendButton(button: StandardButton, pressed: boolean): void {
    this._buttonStates.set(button, pressed);
    const adapter = this._getAdapter();
    if (!adapter) return;

    const buttonId = STANDARD_BUTTON_MAP[button];
    if (buttonId !== undefined) {
      adapter.rawSendButton(this.playerIndex, buttonId, pressed);
    }
  }

  /**
   * Sends analog axis value (-1.0 to 1.0) for dual analog sticks.
   */
  public sendAxis(axis: StandardAxis, value: number): void {
    const clamped = Math.max(-1.0, Math.min(1.0, value));
    this._axisStates.set(axis, clamped);
    const adapter = this._getAdapter();
    if (!adapter) return;

    const axisId = STANDARD_AXIS_MAP[axis];
    if (axisId !== undefined) {
      adapter.rawSendAxis(this.playerIndex, axisId, clamped);
    }
  }

  /**
   * Convenience helper to set both X and Y axes of an analog stick simultaneously
   * (e.g. from virtual on-screen joysticks, touch controls, or mouse drag).
   * @param stick 'LEFT' for Left Analog Stick, 'RIGHT' for Right Analog Stick
   * @param x Horizontal tilt from -1.0 (left) to 1.0 (right)
   * @param y Vertical tilt from -1.0 (up) to 1.0 (down)
   */
  public sendAnalogStick(stick: 'LEFT' | 'RIGHT', x: number, y: number): void {
    if (stick === 'LEFT') {
      this.sendAxis('L_STICK_X', x);
      this.sendAxis('L_STICK_Y', y);
    } else {
      this.sendAxis('R_STICK_X', x);
      this.sendAxis('R_STICK_Y', y);
    }
  }

  /**
   * Gets current button press state.
   */
  public isButtonPressed(button: StandardButton): boolean {
    return !!this._buttonStates.get(button);
  }

  /**
   * Gets current axis value (-1.0 to 1.0).
   */
  public getAxisValue(axis: StandardAxis): number {
    return this._axisStates.get(axis) || 0;
  }

  public setKeyBinding(action: StandardButton, keyCode: string): void {
    this._keyBindings.set(keyCode, action);
  }

  public setKeyAxisBinding(
    axis: StandardAxis,
    direction: 1 | -1,
    keyCode: string,
  ): void {
    this._keyAxisBindings.set(keyCode, { axis, direction });
  }

  public setGamepadBinding(action: StandardButton, buttonIndex: number): void {
    this._gamepadBindings.set(buttonIndex, action);
  }

  public setGamepadAxisButtonBinding(
    axis: StandardAxis,
    direction: 1 | -1,
    buttonIndex: number,
  ): void {
    this._gamepadAxisButtonBindings.set(buttonIndex, { axis, direction });
  }

  public setGamepadAxisToButtonBinding(
    gpAxisIndex: number,
    gpDir: 1 | -1,
    action: StandardButton,
  ): void {
    const key = `${gpAxisIndex}:${gpDir}:${action}`;
    this._gamepadAxisToButtonBindings.set(key, { gpAxisIndex, gpDir, action });
  }

  public setGamepadAxisToAxisBinding(
    gpAxisIndex: number,
    gpDir: 1 | -1,
    axis: StandardAxis,
    direction: 1 | -1,
  ): void {
    const key = `${gpAxisIndex}:${gpDir}:${axis}:${direction}`;
    this._gamepadAxisToAxisBindings.set(key, {
      gpAxisIndex,
      gpDir,
      axis,
      direction,
    });
  }

  public clearBindings(): void {
    this._keyBindings.clear();
    this._keyAxisBindings.clear();
    this._activeKeyAxisDirections.clear();
    this._gamepadBindings.clear();
    this._gamepadAxisButtonBindings.clear();
    this._gamepadAxisToButtonBindings.clear();
    this._gamepadAxisToButtonStates.clear();
    this._gamepadAxisToAxisBindings.clear();
    this._gamepadAxisToAxisStates.clear();
    this._activeGamepadAxisButtonDirections.clear();
  }

  public resetBindings(): void {
    this.clearBindings();

    // Default keyboard bindings for Player 1
    if (this.playerIndex === 0) {
      this._keyBindings.set('ArrowUp', 'DPAD_UP');
      this._keyBindings.set('ArrowDown', 'DPAD_DOWN');
      this._keyBindings.set('ArrowLeft', 'DPAD_LEFT');
      this._keyBindings.set('ArrowRight', 'DPAD_RIGHT');
      this._keyBindings.set('KeyZ', 'ACTION_DOWN');
      this._keyBindings.set('KeyX', 'ACTION_RIGHT');
      this._keyBindings.set('KeyA', 'ACTION_LEFT');
      this._keyBindings.set('KeyS', 'ACTION_UP');
      this._keyBindings.set('Enter', 'START');
      this._keyBindings.set('ShiftRight', 'SELECT');
      this._keyBindings.set('KeyQ', 'L1');
      this._keyBindings.set('KeyW', 'R1');
      this._keyBindings.set('KeyE', 'L2');
      this._keyBindings.set('KeyR', 'R2');
    }

    // Default standard W3C Gamepad button mapping (XInput / DualShock layout)
    this._gamepadBindings.set(0, 'ACTION_DOWN'); // A / Cross
    this._gamepadBindings.set(1, 'ACTION_RIGHT'); // B / Circle
    this._gamepadBindings.set(2, 'ACTION_LEFT'); // X / Square
    this._gamepadBindings.set(3, 'ACTION_UP'); // Y / Triangle
    this._gamepadBindings.set(4, 'L1');
    this._gamepadBindings.set(5, 'R1');
    this._gamepadBindings.set(6, 'L2');
    this._gamepadBindings.set(7, 'R2');
    this._gamepadBindings.set(8, 'SELECT');
    this._gamepadBindings.set(9, 'START');
    this._gamepadBindings.set(10, 'L3');
    this._gamepadBindings.set(11, 'R3');
    this._gamepadBindings.set(12, 'DPAD_UP');
    this._gamepadBindings.set(13, 'DPAD_DOWN');
    this._gamepadBindings.set(14, 'DPAD_LEFT');
    this._gamepadBindings.set(15, 'DPAD_RIGHT');
    this._gamepadBindings.set(16, 'HOME');
  }

  public setTurbo(button: StandardButton, enabled: boolean, rateHz = 15): void {
    const existing = this._turboIntervals.get(button);
    if (existing) {
      window.clearInterval(existing);
      this._turboIntervals.delete(button);
    }

    if (enabled) {
      let state = false;
      const interval = window.setInterval(() => {
        state = !state;
        this.sendButton(button, state);
      }, 1000 / rateHz);
      this._turboIntervals.set(button, interval);
    } else {
      this.sendButton(button, false);
    }
  }

  public handleKeyEvent(keyCode: string, pressed: boolean): boolean {
    let handled = false;
    const action = this._keyBindings.get(keyCode);
    if (action) {
      this.sendButton(action, pressed);
      handled = true;
    }

    const axisBind = this._keyAxisBindings.get(keyCode);
    if (axisBind) {
      const state = this._activeKeyAxisDirections.get(axisBind.axis) ?? {
        pos: false,
        neg: false,
      };
      if (axisBind.direction === 1) {
        state.pos = pressed;
      } else {
        state.neg = pressed;
      }
      this._activeKeyAxisDirections.set(axisBind.axis, state);
      const value = (state.pos ? 1 : 0) - (state.neg ? 1 : 0);
      this.sendAxis(axisBind.axis, value);
      handled = true;
    }

    return handled;
  }

  public handleGamepadState(gamepad: Gamepad): void {
    // Process buttons
    for (let i = 0; i < gamepad.buttons.length; i++) {
      const btn = gamepad.buttons[i];
      const pressed = btn.pressed || btn.value > 0.5;

      const action = this._gamepadBindings.get(i);
      if (action && this._buttonStates.get(action) !== pressed) {
        this.sendButton(action, pressed);
      }

      const axisBind = this._gamepadAxisButtonBindings.get(i);
      if (axisBind) {
        const state = this._activeGamepadAxisButtonDirections.get(
          axisBind.axis,
        ) ?? {
          pos: false,
          neg: false,
        };
        const prevDir = axisBind.direction === 1 ? state.pos : state.neg;
        if (prevDir !== pressed) {
          if (axisBind.direction === 1) {
            state.pos = pressed;
          } else {
            state.neg = pressed;
          }
          this._activeGamepadAxisButtonDirections.set(axisBind.axis, state);
          const value = (state.pos ? 1 : 0) - (state.neg ? 1 : 0);
          this.sendAxis(axisBind.axis, value);
        }
      }
    }

    // Process gamepad axis-to-button bindings (e.g. Right Stick Left/Right -> L2/R2)
    for (const [key, bind] of this._gamepadAxisToButtonBindings.entries()) {
      const val = gamepad.axes[bind.gpAxisIndex] ?? 0;
      const pressed = bind.gpDir === 1 ? val > 0.5 : val < -0.5;
      const prev = this._gamepadAxisToButtonStates.get(key) ?? false;
      if (pressed !== prev) {
        this._gamepadAxisToButtonStates.set(key, pressed);
        this.sendButton(bind.action, pressed);
      }
    }

    // Process gamepad axis-to-axis bindings (e.g. remapped stick directions)
    for (const [key, bind] of this._gamepadAxisToAxisBindings.entries()) {
      const val = gamepad.axes[bind.gpAxisIndex] ?? 0;
      const pressed = bind.gpDir === 1 ? val > 0.5 : val < -0.5;
      const prev = this._gamepadAxisToAxisStates.get(key) ?? false;
      if (pressed !== prev) {
        this._gamepadAxisToAxisStates.set(key, pressed);
        const state = this._activeGamepadAxisButtonDirections.get(
          bind.axis,
        ) ?? {
          pos: false,
          neg: false,
        };
        if (bind.direction === 1) state.pos = pressed;
        else state.neg = pressed;
        this._activeGamepadAxisButtonDirections.set(bind.axis, state);
        const outVal = (state.pos ? 1 : 0) - (state.neg ? 1 : 0);
        this.sendAxis(bind.axis, outVal);
      }
    }

    const isAxisDrivenByKeysOrButtons = (axis: StandardAxis): boolean => {
      const k = this._activeKeyAxisDirections.get(axis);
      const b = this._activeGamepadAxisButtonDirections.get(axis);
      return Boolean(k?.pos || k?.neg || b?.pos || b?.neg);
    };

    // Process analog axes with 15% deadzone
    if (gamepad.axes.length >= 2) {
      const lx = Math.abs(gamepad.axes[0]) > 0.15 ? gamepad.axes[0] : 0;
      const ly = Math.abs(gamepad.axes[1]) > 0.15 ? gamepad.axes[1] : 0;
      if (lx !== 0 || !isAxisDrivenByKeysOrButtons('L_STICK_X')) {
        this.sendAxis('L_STICK_X', lx);
      }
      if (ly !== 0 || !isAxisDrivenByKeysOrButtons('L_STICK_Y')) {
        this.sendAxis('L_STICK_Y', ly);
      }
    }

    if (gamepad.axes.length >= 4) {
      const rx = Math.abs(gamepad.axes[2]) > 0.15 ? gamepad.axes[2] : 0;
      const ry = Math.abs(gamepad.axes[3]) > 0.15 ? gamepad.axes[3] : 0;
      if (rx !== 0 || !isAxisDrivenByKeysOrButtons('R_STICK_X')) {
        this.sendAxis('R_STICK_X', rx);
      }
      if (ry !== 0 || !isAxisDrivenByKeysOrButtons('R_STICK_Y')) {
        this.sendAxis('R_STICK_Y', ry);
      }
    }
  }
}
