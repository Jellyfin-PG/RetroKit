import type { ICoreAdapter } from '../adapters/ICoreAdapter';

export interface IAudioManager {
  getVolume(): number;
  setVolume(volume: number): void;
  setMute(mute: boolean): void;
  isMuted(): boolean;
  unlockAudio(): Promise<void>;
  getAudioContext(): AudioContext;
  destroy(): void;
}

export class AudioManager implements IAudioManager {
  private _masterGain: GainNode;
  private _volume = 1.0;
  private _isMuted = false;

  constructor(
    private readonly _ctx: AudioContext,
    private readonly _getAdapter: () => ICoreAdapter | null,
  ) {
    this._masterGain = this._ctx.createGain();
    this._masterGain.gain.value = this._volume;
    this._masterGain.connect(this._ctx.destination);
  }

  public getVolume(): number {
    return this._volume;
  }

  public setVolume(volume: number): void {
    this._volume = Math.max(0, Math.min(1, volume));
    if (!this._isMuted) {
      this._masterGain.gain.setValueAtTime(this._volume, this._ctx.currentTime);
    }
    const adapter = this._getAdapter();
    if (adapter) {
      adapter.rawSetVolume(this._isMuted ? 0 : this._volume);
    }
  }

  public setMute(mute: boolean): void {
    this._isMuted = mute;
    this._masterGain.gain.setValueAtTime(
      mute ? 0 : this._volume,
      this._ctx.currentTime,
    );
    const adapter = this._getAdapter();
    if (adapter) {
      adapter.rawSetVolume(mute ? 0 : this._volume);
    }
  }

  public isMuted(): boolean {
    return this._isMuted;
  }

  public async unlockAudio(): Promise<void> {
    if (this._ctx.state === 'suspended') {
      await this._ctx.resume();
    }
  }

  public getAudioContext(): AudioContext {
    return this._ctx;
  }

  public destroy(): void {
    try {
      this._masterGain.disconnect();
    } catch (_) {}
  }
}
