import type { ICoreAdapter } from '../adapters/ICoreAdapter';

export interface ITimingManager {
  readonly isFastForward: boolean;
  readonly isSlowMotion: boolean;
  readonly speedRatio: number;
  setFastForward(active: boolean, rate?: number): void;
  setSlowMotion(active: boolean, rate?: number): void;
  setSpeed(ratio: number): void;
  stepFrame(): void;
  isRewindSupported(): boolean;
  startRewind(): void;
  stopRewind(): void;
}

export class TimingManager implements ITimingManager {
  private _speedRatio = 1.0;
  private _isFastForward = false;
  private _isSlowMotion = false;

  constructor(private readonly _getAdapter: () => ICoreAdapter | null) {}

  public get isFastForward(): boolean {
    return this._isFastForward;
  }

  public get isSlowMotion(): boolean {
    return this._isSlowMotion;
  }

  public get speedRatio(): number {
    return this._speedRatio;
  }

  public setFastForward(active: boolean, rate = 2.5): void {
    this._isFastForward = active;
    if (active) {
      this._isSlowMotion = false;
      this.setSpeed(rate);
    } else {
      this.setSpeed(1.0);
    }
  }

  public setSlowMotion(active: boolean, rate = 0.5): void {
    this._isSlowMotion = active;
    if (active) {
      this._isFastForward = false;
      this.setSpeed(rate);
    } else {
      this.setSpeed(1.0);
    }
  }

  public setSpeed(ratio: number): void {
    this._speedRatio = Math.max(0.1, Math.min(10.0, ratio));
    const adapter = this._getAdapter();
    if (adapter && adapter.capabilities.variableSpeed) {
      adapter.rawSetSpeed(this._speedRatio);
    }
  }

  public stepFrame(): void {
    const adapter = this._getAdapter();
    if (adapter) {
      adapter.resume();
      requestAnimationFrame(() => {
        adapter.pause();
      });
    }
  }

  public isRewindSupported(): boolean {
    const adapter = this._getAdapter();
    return !!adapter?.capabilities.rewind;
  }

  public startRewind(): void {
    if (!this.isRewindSupported()) return;
    const adapter = this._getAdapter();
    if (adapter) {
      adapter.rawSetSpeed(-1.0);
    }
  }

  public stopRewind(): void {
    if (!this.isRewindSupported()) return;
    this.setSpeed(1.0);
  }
}
