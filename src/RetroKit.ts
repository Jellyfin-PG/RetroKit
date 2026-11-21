import { EmulatorJSAdapter } from './adapters/EmulatorJSAdapter';
import type { ICoreAdapter } from './adapters/ICoreAdapter';
import { LibretroAdapter } from './adapters/LibretroAdapter';
import { LoveAdapter } from './adapters/LoveAdapter';
import { Pico8Adapter } from './adapters/Pico8Adapter';
import { PlayAdapter } from './adapters/PlayAdapter';
import { RuffleAdapter } from './adapters/RuffleAdapter';
import { CoreRegistry } from './core/CoreRegistry';
import type {
  CoreCapabilities,
  CoreMetadata,
  EmuEventMap,
  GameLoadOptions,
  RetroKitConfig,
} from './core/types';
import {
  AchievementManager,
  type IAchievementManager,
} from './subsystems/AchievementManager';
import { AudioManager, type IAudioManager } from './subsystems/AudioManager';
import { BiosManager, type IBiosManager } from './subsystems/BiosManager';
import { CheatManager, type ICheatManager } from './subsystems/CheatManager';
import {
  CoreOptionsManager,
  type ICoreOptionsManager,
} from './subsystems/CoreOptionsManager';
import { DiscManager, type IDiscManager } from './subsystems/DiscManager';
import { type IInputManager, InputManager } from './subsystems/InputManager';
import {
  type INetplayManager,
  NetplayManager,
} from './subsystems/NetplayManager';
import { type ISramManager, SramManager } from './subsystems/SramManager';
import { type IStateManager, StateManager } from './subsystems/StateManager';
import { type ITimingManager, TimingManager } from './subsystems/TimingManager';
import { type IVideoManager, VideoManager } from './subsystems/VideoManager';
import { EventEmitter } from './utils/EventEmitter';
import { RomPatcher } from './utils/patcher/RomPatcher';

export const DEFAULT_CAPABILITIES: CoreCapabilities = {
  saveStates: false,
  sram: false,
  cheats: false,
  coreOptions: false,
  multiDisc: false,
  shaders: false,
  rewind: false,
  variableSpeed: false,
  maxPlayers: 1,
  pointer: false,
};

/**
 * RetroKit: Universal Headless WebAssembly Emulation Runtime Orchestrator
 */
export class RetroKit extends EventEmitter<EmuEventMap> {
  public readonly state: IStateManager;
  public readonly sram: ISramManager;
  public readonly cheats: ICheatManager;
  public readonly options: ICoreOptionsManager;
  public readonly discs: IDiscManager;
  public readonly input: IInputManager;
  public readonly audio: IAudioManager;
  public readonly video: IVideoManager;
  public readonly timing: ITimingManager;
  public readonly netplay: INetplayManager;
  public readonly bios: IBiosManager;
  public readonly achievements: IAchievementManager;

  private _adapter: ICoreAdapter | null = null;
  private _config: RetroKitConfig;
  private _audioCtx: AudioContext;
  private _activeRom: ArrayBuffer | Blob | string | Uint8Array | null = null;
  private _lastLoadOptions?: GameLoadOptions;
  private _isRunning = false;
  private _isPaused = false;
  private _fpsTimer: any = null;

  constructor(config: RetroKitConfig) {
    super();
    this._config = config;

    // Initialize or inherit AudioContext
    if (config.audioContext) {
      this._audioCtx = config.audioContext;
    } else if (typeof AudioContext !== 'undefined') {
      this._audioCtx = new AudioContext({ latencyHint: 'interactive' });
    } else {
      this._audioCtx = {} as AudioContext;
    }

    // Instantiate Subsystem Managers
    this.video = new VideoManager(
      () => this._adapter,
      () => this._config.canvas || null,
    );

    this.state = new StateManager(
      () => this._adapter,
      async () => {
        try {
          return await this.video.takeScreenshot('image/jpeg', 0.8);
        } catch (_) {
          return null;
        }
      },
    );

    this.sram = new SramManager(() => this._adapter);
    this.cheats = new CheatManager(() => this._adapter);
    this.options = new CoreOptionsManager(() => this._adapter);
    this.discs = new DiscManager(() => this._adapter);
    this.input = new InputManager(() => this._adapter);
    this.audio = new AudioManager(this._audioCtx, () => this._adapter);
    this.timing = new TimingManager(() => this._adapter);
    this.netplay = new NetplayManager();
    this.bios = new BiosManager();
    this.achievements = new AchievementManager(
      () => this._adapter,
      (event, payload) => this.emit(event as any, payload),
    );

    if (config.retroAchievements?.username && config.retroAchievements?.token) {
      this.achievements
        .login(
          config.retroAchievements.username,
          config.retroAchievements.token,
          config.retroAchievements.apiEndpoint,
        )
        .catch(() => {});
      if (typeof config.retroAchievements.hardcore === 'boolean') {
        this.achievements.setHardcore(config.retroAchievements.hardcore);
      }
    }

    // Wire internal subsystem callbacks to engine events
    this.sram.onSramModified((data) => {
      this.emit('sramModified', { data });
    });

    this.options.onOptionChanged((id, value) => {
      this.emit('optionChanged', { id, value });
    });

    this.discs.onDiscChanged((disc) => {
      this.emit('discChanged', { disc });
    });
  }

  public get capabilities(): CoreCapabilities {
    return this._adapter ? this._adapter.capabilities : DEFAULT_CAPABILITIES;
  }

  public async load(
    rom: ArrayBuffer | Blob | string | Uint8Array,
    options?: GameLoadOptions,
  ): Promise<void> {
    this._activeRom = rom;
    this._lastLoadOptions = options;

    if (options?.canvas) {
      this._config.canvas = options.canvas;
    }
    if (options?.preserveCanvas !== undefined) {
      this._config.preserveCanvas = options.preserveCanvas;
    } else if (options?.useExistingCanvas !== undefined) {
      this._config.preserveCanvas = options.useExistingCanvas;
    }

    if (!this._config.canvas) {
      throw new Error(
        '[RetroKit] No canvas provided. Pass a canvas in constructor, load options, or via setCanvas().',
      );
    }

    const gameId =
      options?.gameId ||
      (typeof rom === 'string' ? rom : options?.fileName || 'game');
    (this.state as StateManager).setGameId(gameId);

    // Resolve target core
    const coreMeta = this._resolveCore(options);
    if (!coreMeta) {
      throw new Error(
        `[RetroKit] Could not determine emulator core for: ${options?.fileName || 'ROM'}`,
      );
    }

    // Register BIOS if passed in options
    if (options?.bios) {
      if (Array.isArray(options.bios)) {
        for (const item of options.bios) {
          this.bios.register(item.name, item.data);
        }
      } else {
        for (const [name, bytes] of Object.entries(options.bios)) {
          this.bios.register(name, bytes);
        }
      }
    }

    // Check if the ROM is a large file (e.g. multi-gigabyte PS2 / PS1 disc images).
    // We avoid loading multi-gigabyte blobs entirely into memory as a Uint8Array,
    // which would trigger RangeError: Invalid typed array length in V8.
    const isBlob = rom instanceof Blob;
    const isLargeMedia = isBlob && rom.size > 150 * 1024 * 1024;

    let processedRom: ArrayBuffer | Blob | string | Uint8Array = rom;
    let romBytes: Uint8Array | null = null;

    if (!isLargeMedia) {
      if (typeof rom === 'string') {
        const resp = await fetch(rom, { headers: this._config.fetchHeaders });
        const buf = await resp.arrayBuffer();
        romBytes = new Uint8Array(buf);
      } else if (rom instanceof Blob) {
        const buf = await rom.arrayBuffer();
        romBytes = new Uint8Array(buf);
      } else if (rom instanceof Uint8Array) {
        romBytes = rom;
      } else {
        romBytes = new Uint8Array(rom);
      }
      processedRom = romBytes;

      // Apply ROM Patch (IPS, BPS, UPS) if provided
      if (options?.patch) {
        let patchBytes: Uint8Array;
        if (options.patch instanceof Blob) {
          const buf = await options.patch.arrayBuffer();
          patchBytes = new Uint8Array(buf);
        } else if (options.patch instanceof ArrayBuffer) {
          patchBytes = new Uint8Array(options.patch);
        } else {
          patchBytes = options.patch;
        }

        const patchResult = RomPatcher.applyPatch(
          romBytes,
          patchBytes,
          options.verifyPatchChecksum,
        );
        romBytes = patchResult.patchedRom;
        processedRom = romBytes;

        this.emit('romPatched', {
          format: patchResult.format,
          originalSize: romBytes.length,
          patchedSize: patchResult.patchedRom.length,
        });
      }

      // Compute game hash and fetch RetroAchievements definitions if logged in
      const gameHash = this.achievements.computeGameHash(romBytes);
      this.achievements
        .loadAchievements(gameHash, options?.fileName)
        .catch((err) => {
          console.warn('[RetroKit] RetroAchievements lookup failed:', err);
        });
    } else {
      // For large disc images, hash the initial sector slice for identifier lookup
      try {
        const headerSlice = await (rom as Blob).slice(0, 65536).arrayBuffer();
        const partialHash = this.achievements.computeGameHash(
          new Uint8Array(headerSlice),
        );
        this.achievements
          .loadAchievements(partialHash, options?.fileName)
          .catch(() => {});
      } catch (_) {}
    }

    // Teardown previous adapter if switching games
    if (this._adapter) {
      await this._adapter.destroy();
      this._adapter = null;
    }

    // Reset canvas to grant a pristine rendering surface for the new core
    this._resetCanvas();

    // Instantiate appropriate Core Bridge
    this._adapter = this._createAdapter(coreMeta);

    const effectiveAssetBaseUrl =
      options?.coresDirectory ||
      options?.assetBaseUrl ||
      this._config.assetBaseUrl ||
      '/cores';

    // Initialize adapter with environment context
    await this._adapter.init({
      canvas: this._config.canvas,
      assetBaseUrl: effectiveAssetBaseUrl,
      audioContext: this._audioCtx,
      fetchHeaders: this._config.fetchHeaders,
      debug: this._config.debug,
      onFpsUpdate: (fps) => this.emit('fps', { fps }),
      onSramDirty: (data) => this.emit('sramModified', { data }),
      onLog: (message, level = 'info') => this.emit('log', { message, level }),
      retroAchievements:
        this.achievements.isLoggedIn && this.achievements.user
          ? {
              username: this.achievements.user.username,
              token: this.achievements.user.token,
              hardcore: this.achievements.hardcore,
            }
          : undefined,
    });

    // Inject all registered BIOS files into the adapter
    await this.bios.injectIntoAdapter(this._adapter);

    // Load ROM into the core
    await this._adapter.loadGame(processedRom, options);

    this._isRunning = true;
    this._isPaused = false;
    this._startFpsMonitoring();
    (this.video as any).updateLayout?.();
    this.emit('ready', { core: coreMeta.id, gameId });
  }

  public async play(): Promise<void> {
    if (!this._isRunning && this._activeRom) {
      await this.load(this._activeRom, this._lastLoadOptions);
      return;
    }
    if (!this._adapter) return;
    this.audio.unlockAudio().catch(() => {});
    this._adapter.resume();
    this._isRunning = true;
    this._isPaused = false;
    this._startFpsMonitoring();
    this.emit('resume');
  }

  public pause(): void {
    if (!this._adapter) return;
    this._adapter.pause();
    this._isPaused = true;
    if (this._fpsTimer) {
      clearInterval(this._fpsTimer);
      this._fpsTimer = null;
    }
    this.emit('pause');
  }

  public async stop(): Promise<void> {
    if (!this._adapter) return;
    if (this._fpsTimer) {
      clearInterval(this._fpsTimer);
      this._fpsTimer = null;
    }
    await this._adapter.stop();
    this._isRunning = false;
    this._isPaused = false;
    this.video.clear();
    this.emit('stop');
  }

  /**
   * Sets the base directory or URL where emulator core binaries and runtime assets are located.
   * Updates internal configuration and the active adapter context.
   *
   * @param directory Base URL or directory path (e.g. '/cores', 'https://cdn.example.com/cores')
   */
  public setCoresDirectory(directory: string): void {
    this._config.assetBaseUrl = directory;
    this._adapter?.setCoresDirectory?.(directory);
  }

  /**
   * Alias for setCoresDirectory.
   *
   * @param url Base URL or directory path
   */
  public setAssetBaseUrl(url: string): void {
    this.setCoresDirectory(url);
  }

  /**
   * Returns the currently configured cores directory or asset base URL.
   */
  public getCoresDirectory(): string {
    return this._config.assetBaseUrl || '/cores';
  }

  /**
   * Returns the currently configured cores directory or asset base URL.
   */
  public get coresDirectory(): string {
    return this.getCoresDirectory();
  }

  /**
   * Alias for getCoresDirectory.
   */
  public getAssetBaseUrl(): string {
    return this.getCoresDirectory();
  }

  /**
   * Alias for coresDirectory.
   */
  public get assetBaseUrl(): string {
    return this.getCoresDirectory();
  }

  /**
   * Binds or updates the rendering canvas element.
   *
   * @param canvas The target HTML5 Canvas element (can be an existing WebGL canvas).
   * @param options.preserveCanvas When true, reuses this canvas without replacing its DOM node.
   * @param options.useExistingCanvas Alias for preserveCanvas.
   */
  public setCanvas(
    canvas: HTMLCanvasElement,
    options?: { preserveCanvas?: boolean; useExistingCanvas?: boolean },
  ): void {
    this._config.canvas = canvas;
    if (options?.preserveCanvas !== undefined) {
      this._config.preserveCanvas = options.preserveCanvas;
    } else if (options?.useExistingCanvas !== undefined) {
      this._config.preserveCanvas = options.useExistingCanvas;
    }
    this._adapter?.setCanvas?.(canvas);
    (this.video as any).updateLayout?.();
  }

  /**
   * Returns the currently bound canvas element, if any.
   */
  public get canvas(): HTMLCanvasElement | undefined {
    return this._config.canvas;
  }

  /**
   * Updates the active target platform hint for subsequent game launches.
   */
  public setSystem(system: string | undefined): void {
    if (!this._lastLoadOptions) {
      this._lastLoadOptions = {};
    }
    this._lastLoadOptions.system = system;
  }

  /**
   * Returns the configuration options supplied during the most recent load.
   */
  public get lastLoadOptions(): GameLoadOptions | undefined {
    return this._lastLoadOptions;
  }

  /**
   * Returns the active ROM payload held in memory.
   */
  public get activeRom(): ArrayBuffer | Blob | string | Uint8Array | null {
    return this._activeRom;
  }

  public async restart(): Promise<void> {
    if (!this._adapter) return;
    await this._adapter.restart();
    this._isRunning = true;
    this._isPaused = false;
    this._startFpsMonitoring();
    this.emit('resume');
  }

  public async destroy(): Promise<void> {
    if (this._fpsTimer) {
      clearInterval(this._fpsTimer);
      this._fpsTimer = null;
    }
    await this.stop();
    if (this._adapter) {
      await this._adapter.destroy();
      this._adapter = null;
    }
    this.video.destroy();
    this.input.destroy();
    (this.sram as SramManager).destroy();
    this.audio.destroy();
    this.netplay.disconnect();
    this.removeAllListeners();
    this._activeRom = null;
  }

  private _startFpsMonitoring(): void {
    if (this._fpsTimer) clearInterval(this._fpsTimer);
    const timer = setInterval(() => {
      if (this._isRunning && !this._isPaused && this._adapter) {
        const fps = this._adapter.rawGetFps() || 60;
        this.emit('fps', { fps });
      }
    }, 1000);
    if (typeof timer === 'object' && timer !== null && 'unref' in timer) {
      (timer as any).unref();
    }
    this._fpsTimer = timer;
  }

  public async dispose(): Promise<void> {
    await this.destroy();
  }

  public async switchCore(coreId: string): Promise<void> {
    const meta = CoreRegistry.getCore(coreId);
    if (!meta) {
      throw new Error(`[RetroKit] Core "${coreId}" is not registered.`);
    }

    if (!this._activeRom) {
      throw new Error('[RetroKit] No ROM currently loaded to swap core for.');
    }

    const mergedOptions: GameLoadOptions = {
      ...this._lastLoadOptions,
      core: coreId,
    };

    await this.load(this._activeRom, mergedOptions);
  }

  public getCoreMetadata(): CoreMetadata {
    if (!this._adapter) {
      return {
        id: 'none',
        name: 'None',
        system: 'unknown',
        family: 'libretro',
        extensions: [],
        capabilities: DEFAULT_CAPABILITIES,
      };
    }
    const meta = CoreRegistry.getCore(this._adapter.id);
    return (
      meta || {
        id: this._adapter.id,
        name: this._adapter.name,
        system: this._adapter.system,
        family: 'libretro',
        extensions: [],
        capabilities: this._adapter.capabilities,
      }
    );
  }

  public isRunning(): boolean {
    return this._isRunning;
  }

  public isPaused(): boolean {
    return this._isPaused;
  }

  private _resolveCore(options?: GameLoadOptions): CoreMetadata | undefined {
    // Check if a specific core was requested in the load options
    if (options?.core) {
      const meta = CoreRegistry.getCore(options.core);
      if (meta) return meta;
    }

    // Check if a default core was pinned in constructor config
    if (this._config.core && this._config.core !== 'auto') {
      const meta = CoreRegistry.getCore(this._config.core);
      if (meta) return meta;
    }

    // Determine target system from options or constructor config
    const targetSystem =
      options?.system ||
      options?.platformTag ||
      (this._config.system && this._config.system !== 'auto'
        ? this._config.system
        : undefined);

    // Deduce from file extension using target system hint if present
    if (options?.fileName) {
      const meta = CoreRegistry.resolveCoreFromFileName(
        options.fileName,
        targetSystem,
      );
      if (meta) return meta;
    }

    if (typeof this._activeRom === 'string') {
      const urlFileName = this._activeRom.split('?')[0].split('/').pop() || '';
      const meta = CoreRegistry.resolveCoreFromFileName(
        urlFileName,
        targetSystem,
      );
      if (meta) return meta;
    }

    // Fallback to platform / system tag resolution
    if (targetSystem) {
      const cores = CoreRegistry.getCoresForSystem(targetSystem);
      if (cores.length > 0) return cores[0];
    }

    return undefined;
  }

  /**
   * Replaces the canvas DOM element with a clean canvas surface to prevent
   * WebGL, WebGL2, or 2D context collisions when switching emulator cores.
   * If preserveCanvas or useExistingCanvas is enabled, preserves the existing
   * canvas element and clears its frame buffer instead of replacing the DOM node.
   */
  private _resetCanvas(): HTMLCanvasElement | null {
    const oldCanvas = this._config.canvas;
    const shouldPreserve =
      this._config.preserveCanvas || this._config.useExistingCanvas;

    if (
      !oldCanvas ||
      typeof document === 'undefined' ||
      !oldCanvas.parentNode ||
      shouldPreserve
    ) {
      if (oldCanvas) {
        this.video.clear();
      }
      return oldCanvas || null;
    }

    const newCanvas = document.createElement('canvas');
    if (oldCanvas.id) newCanvas.id = oldCanvas.id;
    if (oldCanvas.className) newCanvas.className = oldCanvas.className;
    newCanvas.width = oldCanvas.width || 640;
    newCanvas.height = oldCanvas.height || 480;
    newCanvas.tabIndex = oldCanvas.tabIndex >= 0 ? oldCanvas.tabIndex : 1;
    if (oldCanvas.style.cssText) {
      newCanvas.style.cssText = oldCanvas.style.cssText;
    }
    newCanvas.style.display = 'block';

    oldCanvas.parentNode.replaceChild(newCanvas, oldCanvas);
    this._config.canvas = newCanvas;
    return newCanvas;
  }

  private _createAdapter(meta: CoreMetadata): ICoreAdapter {
    const customFactory = CoreRegistry.getAdapterFactory(meta.id);
    if (customFactory) {
      return customFactory();
    }

    switch (meta.family) {
      case 'play':
        return new PlayAdapter();
      case 'ruffle':
        return new RuffleAdapter();
      case 'pico8':
        return new Pico8Adapter();
      case 'love':
        return new LoveAdapter();
      case 'emulatorjs':
        return new EmulatorJSAdapter(
          meta.id,
          meta.name,
          meta.system,
          meta.capabilities,
        );
      default:
        return new LibretroAdapter(
          meta.id,
          meta.name,
          meta.system,
          meta.capabilities,
        );
    }
  }
}

/** Backwards-compatibility alias for RetroKit */
export const EmuHeadless = RetroKit;
export type EmuHeadless = RetroKit;
