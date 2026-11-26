import type { ICoreAdapter } from '../adapters/ICoreAdapter';

export type AudioEqBand = 'subBass' | 'bass' | 'mid' | 'presence' | 'treble';

export type AudioEqBands = Record<AudioEqBand, number>;

export interface IAudioManager {
  getVolume(): number;
  setVolume(volume: number): void;
  setMute(mute: boolean): void;
  isMuted(): boolean;
  setEqBand(band: AudioEqBand, gainDb: number): void;
  getEqBands(): AudioEqBands;
  resetEq(): void;
  unlockAudio(): Promise<void>;
  getAudioContext(): AudioContext;
  destroy(): void;
}

interface TrackedGainEntry {
  ctx: BaseAudioContext;
  input: AudioNode;
  gain: GainNode;
  filters: Record<AudioEqBand, BiquadFilterNode>;
}

const EQ_BAND_CONFIG: Array<{
  band: AudioEqBand;
  type: BiquadFilterType;
  freq: number;
  q?: number;
}> = [
  { band: 'subBass', type: 'lowshelf', freq: 60 },
  { band: 'bass', type: 'peaking', freq: 230, q: 1.0 },
  { band: 'mid', type: 'peaking', freq: 910, q: 1.0 },
  { band: 'presence', type: 'peaking', freq: 3600, q: 1.0 },
  { band: 'treble', type: 'highshelf', freq: 14000 },
];

const RETROKIT_AUDIO_HOOK_KEY = '__retrokitAudioHookInstalled';
const RETROKIT_GAIN_ENTRIES_KEY = '__retrokitMasterGains';
const RETROKIT_ACTIVE_VOL_KEY = '__retrokitMasterVolume';
const RETROKIT_ACTIVE_EQ_KEY = '__retrokitActiveEq';

function createEqChain(
  ctx: BaseAudioContext,
  masterGain: GainNode,
  eqValues: AudioEqBands,
): { input: AudioNode; filters: Record<AudioEqBand, BiquadFilterNode> } {
  const filters = {} as Record<AudioEqBand, BiquadFilterNode>;
  let prev: AudioNode | null = null;
  let first: AudioNode = masterGain;

  if (typeof ctx.createBiquadFilter === 'function') {
    for (const cfg of EQ_BAND_CONFIG) {
      const filter = ctx.createBiquadFilter();
      filter.type = cfg.type;
      filter.frequency.value = cfg.freq;
      if (cfg.q !== undefined) {
        filter.Q.value = cfg.q;
      }
      filter.gain.value = eqValues[cfg.band] ?? 0;
      filters[cfg.band] = filter;

      if (!prev) {
        first = filter;
      } else {
        prev.connect(filter);
      }
      prev = filter;
    }
    if (prev) {
      prev.connect(masterGain);
    }
  }

  return { input: first, filters };
}

export class AudioManager implements IAudioManager {
  private _masterGain: GainNode;
  private _volume = 1.0;
  private _isMuted = false;
  private _eq: AudioEqBands = {
    subBass: 0,
    bass: 0,
    mid: 0,
    presence: 0,
    treble: 0,
  };

  constructor(
    private readonly _ctx: AudioContext,
    private readonly _getAdapter: () => ICoreAdapter | null,
  ) {
    const g = globalThis as any;
    if (!g[RETROKIT_ACTIVE_EQ_KEY]) {
      g[RETROKIT_ACTIVE_EQ_KEY] = { ...this._eq };
    }
    this._installGlobalAudioHook();

    if (this._ctx && typeof this._ctx.createGain === 'function') {
      this._masterGain = this._ctx.createGain();
      this._masterGain.gain.value = this._volume;
      const chain = createEqChain(this._ctx, this._masterGain, this._eq);
      if (this._ctx.destination) {
        (this._masterGain as any)._isRetroKitMasterGain = true;
        this._masterGain.connect(this._ctx.destination);
      }
      this._registerContextGain(
        this._ctx,
        chain.input,
        this._masterGain,
        chain.filters,
      );
    } else {
      this._masterGain = {
        gain: {
          value: this._volume,
          setValueAtTime: () => {},
        },
        connect: () => {},
      } as any;
    }
  }

  private _getGainRegistry(): Map<BaseAudioContext, TrackedGainEntry> {
    const g = globalThis as any;
    if (!g[RETROKIT_GAIN_ENTRIES_KEY]) {
      g[RETROKIT_GAIN_ENTRIES_KEY] = new Map<
        BaseAudioContext,
        TrackedGainEntry
      >();
    }
    return g[RETROKIT_GAIN_ENTRIES_KEY];
  }

  private _registerContextGain(
    ctx: BaseAudioContext,
    input: AudioNode,
    gain: GainNode,
    filters: Record<AudioEqBand, BiquadFilterNode>,
  ): void {
    const reg = this._getGainRegistry();
    reg.set(ctx, { ctx, input, gain, filters });
  }

  private _installGlobalAudioHook(): void {
    if (
      typeof AudioNode === 'undefined' ||
      typeof AudioDestinationNode === 'undefined'
    ) {
      return;
    }
    const g = globalThis as any;
    if (g[RETROKIT_AUDIO_HOOK_KEY]) return;
    g[RETROKIT_AUDIO_HOOK_KEY] = true;
    if (typeof g[RETROKIT_ACTIVE_VOL_KEY] !== 'number') {
      g[RETROKIT_ACTIVE_VOL_KEY] = 1.0;
    }

    const origConnect = AudioNode.prototype.connect as (...args: any[]) => any;
    const registry = this._getGainRegistry();

    (AudioNode.prototype as any).connect = function (
      this: AudioNode,
      destination: any,
      outputIndex?: number,
      inputIndex?: number,
    ) {
      if (
        !(this as any)._isRetroKitMasterGain &&
        destination instanceof AudioDestinationNode &&
        destination.context &&
        typeof destination.context.createGain === 'function'
      ) {
        const ctx = destination.context;
        let entry = registry.get(ctx);
        if (!entry) {
          const master = ctx.createGain();
          (master as any)._isRetroKitMasterGain = true;
          const vol =
            typeof g[RETROKIT_ACTIVE_VOL_KEY] === 'number'
              ? g[RETROKIT_ACTIVE_VOL_KEY]
              : 1.0;
          master.gain.value = vol;
          const eqState: AudioEqBands = g[RETROKIT_ACTIVE_EQ_KEY] || {
            subBass: 0,
            bass: 0,
            mid: 0,
            presence: 0,
            treble: 0,
          };
          const chain = createEqChain(ctx, master, eqState);
          origConnect.call(master, destination);
          entry = {
            ctx,
            input: chain.input,
            gain: master,
            filters: chain.filters,
          };
          registry.set(ctx, entry);
        }
        if (outputIndex !== undefined && inputIndex !== undefined) {
          return origConnect.call(this, entry.input, outputIndex, inputIndex);
        }
        if (outputIndex !== undefined) {
          return origConnect.call(this, entry.input, outputIndex);
        }
        return origConnect.call(this, entry.input);
      }

      if (outputIndex !== undefined && inputIndex !== undefined) {
        return origConnect.call(this, destination, outputIndex, inputIndex);
      }
      if (outputIndex !== undefined) {
        return origConnect.call(this, destination, outputIndex);
      }
      return origConnect.call(this, destination);
    };
  }

  private _applyEffectiveVolume(): void {
    const effective = this._isMuted ? 0 : this._volume;
    (globalThis as any)[RETROKIT_ACTIVE_VOL_KEY] = effective;

    try {
      this._masterGain.gain.setValueAtTime(effective, this._ctx.currentTime);
    } catch (_) {
      this._masterGain.gain.value = effective;
    }

    const registry = this._getGainRegistry();
    for (const [ctx, entry] of registry.entries()) {
      if ((ctx as any).state === 'closed') {
        registry.delete(ctx);
        continue;
      }
      try {
        entry.gain.gain.setValueAtTime(effective, ctx.currentTime);
      } catch (_) {
        entry.gain.gain.value = effective;
      }
    }

    const adapter = this._getAdapter();
    if (adapter) {
      adapter.rawSetVolume(effective);
    }
  }

  public getVolume(): number {
    return this._volume;
  }

  public setVolume(volume: number): void {
    this._volume = Math.max(0, Math.min(1, volume));
    this._applyEffectiveVolume();
  }

  public setMute(mute: boolean): void {
    this._isMuted = mute;
    this._applyEffectiveVolume();
  }

  public isMuted(): boolean {
    return this._isMuted;
  }

  public setEqBand(band: AudioEqBand, gainDb: number): void {
    const clamped = Math.max(-12, Math.min(12, gainDb));
    this._eq[band] = clamped;
    (globalThis as any)[RETROKIT_ACTIVE_EQ_KEY] = { ...this._eq };

    const registry = this._getGainRegistry();
    for (const [ctx, entry] of registry.entries()) {
      if ((ctx as any).state === 'closed') {
        registry.delete(ctx);
        continue;
      }
      const filter = entry.filters?.[band];
      if (filter) {
        try {
          filter.gain.setValueAtTime(clamped, ctx.currentTime);
        } catch (_) {
          filter.gain.value = clamped;
        }
      }
    }
  }

  public getEqBands(): AudioEqBands {
    return { ...this._eq };
  }

  public resetEq(): void {
    for (const cfg of EQ_BAND_CONFIG) {
      this.setEqBand(cfg.band, 0);
    }
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
