/**
 * Core capability manifest declaring which features an emulation engine natively supports.
 */
export interface CoreCapabilities {
  /** Execution snapshot save states (CPU/RAM/VRAM freeze) */
  saveStates: boolean;

  /** Physical in-game battery RAM (.srm, .sav, MC0, .sol) */
  sram: boolean;

  /** Real-time cheat code engine (Action Replay, GameShark, PNACH) */
  cheats: boolean;

  /** Runtime internal variables (overclocks, rendering mode, region) */
  coreOptions: boolean;

  /** Multi-disc media swapping (.m3u, disc trays) */
  multiDisc: boolean;

  /** Hardware video shaders (CRT, scanlines, xBRZ) */
  shaders: boolean;

  /** Real-time execution rewind buffer */
  rewind: boolean;

  /** Dynamic speed manipulation (Fast forward, slow motion) */
  variableSpeed: boolean;

  /** Maximum simultaneous input players supported (e.g. 1, 2, 4, 8) */
  maxPlayers: number;

  /** Pointer / touch / mouse / light gun input */
  pointer: boolean;
}

/**
 * Metadata defining a WebAssembly emulator core.
 */
export interface CoreMetadata {
  id: string;
  name: string;
  system: string;
  family: 'libretro' | 'play' | 'ruffle' | 'pico8' | 'emulatorjs' | 'love';
  extensions: string[];
  capabilities: CoreCapabilities;
  needsThreads?: boolean;
  needsWebGL2?: boolean;
  assetFile?: string;
  wasmFile?: string;
}

/**
 * Per-engine base URL overrides for loading runtime binaries and assets.
 */
export interface CoreAssetPaths {
  libretro?: string;
  play?: string;
  pico8?: string;
  love?: string;
  ruffle?: string;
  emulatorjs?: string;
}

/**
 * Initialization configuration for RetroKit.
 */
export interface RetroKitConfig {
  /** Target canvas element for rendering. Optional if provided during load() or setCanvas(). */
  canvas?: HTMLCanvasElement;

  /**
   * When true, preserves and reuses the existing canvas element instead of replacing
   * the DOM node when switching cores or resetting. Ideal for frameworks (React/Vue/Svelte)
   * or when using a pre-created WebGL canvas.
   */
  preserveCanvas?: boolean;

  /** Alias for preserveCanvas. */
  useExistingCanvas?: boolean;

  /** Core ID or 'auto' to detect by ROM file extension. */
  core?: string;

  /** Target platform/system identifier (e.g. 'ps1', 'psx', 'ps2', 'snes', 'genesis'). */
  system?: string;

  /** Base URL for loading core WASM/JS binaries and data assets. */
  assetBaseUrl?: string;

  /** Per-engine/adapter base URL overrides (takes precedence over assetBaseUrl for matching adapter). */
  assetPaths?: CoreAssetPaths;

  /** Custom AudioContext, or automatically creates one. */
  audioContext?: AudioContext;

  /** Cross-origin credentials or headers if needed. */
  fetchHeaders?: Record<string, string>;

  /** Enable debug logging. */
  debug?: boolean;

  /** RetroAchievements account credentials for native in-core and headless integration. */
  retroAchievements?: {
    username?: string;
    token?: string;
    hardcore?: boolean;
    apiEndpoint?: string;
  };
}

/** Legacy alias for RetroKitConfig */
export type EmuHeadlessConfig = RetroKitConfig;

export interface CompanionFile {
  name: string;
  data: Uint8Array | ArrayBuffer | Blob;
}

/**
 * Options provided when loading a game.
 */
export interface GameLoadOptions {
  /** Explicit core ID to use instead of auto-detection. */
  core?: string;

  /** System identifier (e.g. 'ps1', 'psx', 'ps2', 'snes', 'nes', 'genesis', 'n64'). Disambiguates shared extensions like .chd, .bin, and .iso. */
  system?: string;

  /** Platform or console tag (e.g. 'snes', 'ps2', 'pico8'). */
  platformTag?: string;

  /** Filename with extension (crucial when passing ArrayBuffer / Blob). */
  fileName?: string;

  /** Additional companion files (e.g. .bin tracks accompanying a .cue file, or multi-disc sets). */
  additionalFiles?: CompanionFile[];

  /** Unique game ID used for state and SRAM scoping. */
  gameId?: string;

  /** Initial in-game battery SRAM or memory card data to inject. */
  initialSram?: Uint8Array | Record<string, Uint8Array>;

  /** Initial save state slot to load automatically on boot. */
  initialStateSlot?: number;

  /** ROM patch data (IPS, BPS, UPS) to apply in memory before boot. */
  patch?: Uint8Array | ArrayBuffer | Blob;

  /** Enforce checksum verification when applying patches. */
  verifyPatchChecksum?: boolean;

  /** BIOS or system firmware files to inject into the core's system directory before boot. */
  bios?:
    | Record<string, Uint8Array | ArrayBuffer>
    | Array<{ name: string; data: Uint8Array }>;

  /** Base URL or directory path for loading core WASM/JS binaries and data assets. Overrides RetroKitConfig. */
  coresDirectory?: string;

  /** Alias for coresDirectory. */
  assetBaseUrl?: string;

  /** Target canvas element to render into. Overrides or sets canvas for this game. */
  canvas?: HTMLCanvasElement;

  /** When true, preserves and reuses the existing canvas without DOM node replacement. */
  preserveCanvas?: boolean;

  /** Alias for preserveCanvas. */
  useExistingCanvas?: boolean;
}

export interface AchievementDefinition {
  id: number;
  title: string;
  description: string;
  points: number;
  badgeName?: string;
  badgeUrl?: string;
  unlocked: boolean;
  unlockedHardcore?: boolean;
  progress?: { current: number; max: number };
}

export interface AchievementUser {
  username: string;
  token?: string;
  score?: number;
  softcoreScore?: number;
}

/**
 * Save state metadata record.
 */
export interface SaveStateMetadata {
  slot: number;
  timestamp: number;
  gameId: string;
  coreId: string;
  screenshot?: Blob | string;
  sizeBytes: number;
}

export interface SaveStateRecord {
  data: Uint8Array;
  metadata: SaveStateMetadata;
}

/**
 * In-game cheat definition.
 */
export interface CheatItem {
  id: string;
  name: string;
  code: string;
  enabled: boolean;
  type?: 'gameshark' | 'gamegenie' | 'actionreplay' | 'raw' | 'pnach';
  address?: number;
  value?: number;
  description?: string;
}

/**
 * Core option choice item.
 */
export interface CoreOptionChoice {
  value: string;
  label: string;
}

/**
 * Definition of an internal emulation variable/option exposed by a core.
 */
export interface CoreOptionDefinition {
  id: string;
  label: string;
  description?: string;
  category?: string;
  type: 'enum' | 'boolean' | 'string' | 'number';
  choices: CoreOptionChoice[];
  defaultValue: string;
  currentValue: string;
}

/**
 * Multi-disc media item.
 */
export interface DiscInfo {
  index: number;
  name: string;
  path: string;
  isCurrent: boolean;
}

/**
 * Standard button definitions matching a standard controller.
 */
export type StandardButton =
  | 'DPAD_UP'
  | 'DPAD_DOWN'
  | 'DPAD_LEFT'
  | 'DPAD_RIGHT'
  | 'ACTION_DOWN' // A / Cross
  | 'ACTION_RIGHT' // B / Circle
  | 'ACTION_LEFT' // X / Square
  | 'ACTION_UP' // Y / Triangle
  | 'START'
  | 'SELECT'
  | 'HOME'
  | 'L1'
  | 'R1'
  | 'L2'
  | 'R2'
  | 'L3'
  | 'R3'
  | 'HOTKEY_FAST_FORWARD'
  | 'HOTKEY_REWIND'
  | 'HOTKEY_SAVE'
  | 'HOTKEY_LOAD';

/**
 * Standard analog stick axes.
 */
export type StandardAxis =
  | 'L_STICK_X'
  | 'L_STICK_Y'
  | 'R_STICK_X'
  | 'R_STICK_Y';

export type StandardHotkey =
  | 'FAST_FORWARD'
  | 'SLOW_MOTION'
  | 'REWIND'
  | 'QUICK_SAVE'
  | 'QUICK_LOAD'
  | 'PAUSE'
  | 'RESTART'
  | 'FULLSCREEN'
  | 'SCREENSHOT';

export interface GamepadDetails {
  index: number;
  id: string;
  connected: boolean;
  mapping: string;
  assignedPlayer: number | null;
}

/**
 * Typed events emitted by EmuHeadless.
 */
export interface EmuEventMap {
  ready: { core: string; gameId: string };
  frame: { fps: number };
  fps: { fps: number };
  pause: void;
  resume: void;
  stop: void;
  stateSaved: { slot?: number; metadata: SaveStateMetadata };
  stateLoaded: { slot?: number };
  sramModified: { data: Uint8Array | Record<string, Uint8Array> };
  discChanged: { disc: DiscInfo };
  optionChanged: { id: string; value: string };
  speedChanged: { fastForward: boolean; slowMotion: boolean; ratio: number };
  error: { error: Error; fatal: boolean };
  log: { message: string; level: 'info' | 'warn' | 'error' };
  achievementUnlocked: {
    achievement: AchievementDefinition;
    hardcore: boolean;
  };
  achievementProgress: {
    achievement: AchievementDefinition;
    current: number;
    max: number;
  };
  achievementLogin: { user: AchievementUser };
  achievementsLoaded: {
    gameId: number | null;
    gameTitle: string | null;
    achievements: AchievementDefinition[];
  };
  romPatched: {
    format: 'IPS' | 'BPS' | 'UPS';
    originalSize: number;
    patchedSize: number;
  };
  biosLoaded: { name: string; sizeBytes: number };
}
