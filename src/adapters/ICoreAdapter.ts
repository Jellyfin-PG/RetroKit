import type {
  CoreCapabilities,
  CoreOptionDefinition,
  GameLoadOptions,
} from '../core/types';

export interface AdapterContext {
  canvas: HTMLCanvasElement;
  assetBaseUrl: string;
  audioContext: AudioContext;
  fetchHeaders?: Record<string, string>;
  debug?: boolean;
  onFpsUpdate?: (fps: number) => void;
  onSramDirty?: (data: Uint8Array | Record<string, Uint8Array>) => void;
  onLog?: (message: string, level?: 'info' | 'warn' | 'error') => void;
  retroAchievements?: {
    username?: string;
    token?: string;
    hardcore?: boolean;
    apiEndpoint?: string;
  };
}

/**
 * Unified interface contract that every emulation core adapter must satisfy.
 */
export interface ICoreAdapter {
  readonly id: string;
  readonly name: string;
  readonly system: string;
  readonly capabilities: CoreCapabilities;

  // Configuration
  setCoresDirectory?(directory: string): void;
  setCanvas?(canvas: HTMLCanvasElement): void;

  // Lifecycle
  init(context: AdapterContext): Promise<void>;
  loadGame(
    rom: ArrayBuffer | Blob | string | Uint8Array,
    options?: GameLoadOptions,
  ): Promise<void>;
  start(): void;
  pause(): void;
  resume(): void;
  stop(): Promise<void>;
  restart(): Promise<void>;
  destroy(): Promise<void>;

  // Save States
  rawSaveState(slot?: number): Promise<Uint8Array | null>;
  rawLoadState(data: Uint8Array, slot?: number): Promise<boolean>;

  // BIOS / System Firmware
  rawSetBios(name: string, data: Uint8Array): Promise<void>;

  // Live Memory Inspection (RetroAchievements / Debugging)
  rawReadMemory(address: number, length: number): Uint8Array | null;
  rawGetMemorySize(): number;

  // Battery SRAM / Memory Cards
  rawGetSram(): Promise<Uint8Array | Record<string, Uint8Array> | null>;
  rawSetSram(data: Uint8Array | Record<string, Uint8Array>): Promise<boolean>;
  rawFlushSram(): Promise<void>;
  getSramPath(): string;

  // Core Options
  rawGetOptions(): CoreOptionDefinition[];
  rawSetOption(key: string, value: string): void;

  // Cheats
  rawSetCheat(index: number, enabled: boolean, code: string): void;
  rawResetCheats(): void;

  // Multi-Disc
  rawGetDiscCount(): number;
  rawChangeDisc(index: number): Promise<boolean>;

  // Input
  rawSendButton(player: number, buttonId: number, pressed: boolean): void;
  rawSendAxis(player: number, axisId: number, value: number): void;

  // Audio / Timing / Video
  rawSetVolume(volume: number): void;
  rawSetSpeed(ratio: number): void;
  rawGetFps(): number;
  getCanvas(): HTMLCanvasElement;
}
