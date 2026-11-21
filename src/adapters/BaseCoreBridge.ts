import type {
  CoreCapabilities,
  CoreOptionDefinition,
  GameLoadOptions,
} from '../core/types';
import type { AdapterContext, ICoreAdapter } from './ICoreAdapter';

/**
 * BaseCoreBridge provides safe, non-breaking default implementations for all
 * emulation operations. If a specific core does not support a feature, it gracefully
 * no-ops instead of throwing unhandled exceptions.
 */
export abstract class BaseCoreBridge implements ICoreAdapter {
  public abstract readonly id: string;
  public abstract readonly name: string;
  public abstract readonly system: string;
  public abstract readonly capabilities: CoreCapabilities;

  protected context: AdapterContext | null = null;
  protected isRunningInternal = false;
  protected isPausedInternal = false;

  public async init(context: AdapterContext): Promise<void> {
    this.context = context;
  }

  public setCoresDirectory(directory: string): void {
    if (this.context) {
      this.context.assetBaseUrl = directory;
    }
  }

  public setCanvas(canvas: HTMLCanvasElement): void {
    if (this.context) {
      this.context.canvas = canvas;
    }
  }

  public abstract loadGame(
    rom: ArrayBuffer | Blob | string | Uint8Array,
    options?: GameLoadOptions,
  ): Promise<void>;

  public start(): void {
    this.isRunningInternal = true;
    this.isPausedInternal = false;
  }

  public pause(): void {
    this.isPausedInternal = true;
  }

  public resume(): void {
    this.isPausedInternal = false;
  }

  public async stop(): Promise<void> {
    this.isRunningInternal = false;
    this.isPausedInternal = false;
    await this.rawFlushSram();
  }

  public async restart(): Promise<void> {
    this.pause();
    this.start();
  }

  public async destroy(): Promise<void> {
    await this.stop();
    this.context = null;
  }

  // --- Safe Default Implementations (Overridden when natively supported) ---

  public async rawSaveState(_slot?: number): Promise<Uint8Array | null> {
    if (this.context?.debug) {
      console.warn(
        `[BaseCoreBridge] Core "${this.id}" does not support save states.`,
      );
    }
    return null;
  }

  public async rawLoadState(
    _data: Uint8Array,
    _slot?: number,
  ): Promise<boolean> {
    if (this.context?.debug) {
      console.warn(
        `[BaseCoreBridge] Core "${this.id}" does not support loading save states.`,
      );
    }
    return false;
  }

  public async rawSetBios(_name: string, _data: Uint8Array): Promise<void> {
    // Graceful no-op when adapter doesn't implement file-based system firmware
  }

  public rawReadMemory(_address: number, _length: number): Uint8Array | null {
    return null;
  }

  public rawGetMemorySize(): number {
    return 0;
  }

  public async rawGetSram(): Promise<
    Uint8Array | Record<string, Uint8Array> | null
  > {
    return null;
  }

  public async rawSetSram(
    _data: Uint8Array | Record<string, Uint8Array>,
  ): Promise<boolean> {
    return false;
  }

  public async rawFlushSram(): Promise<void> {
    // Graceful no-op
  }

  public getSramPath(): string {
    return '';
  }

  public rawGetOptions(): CoreOptionDefinition[] {
    return [];
  }

  public rawSetOption(_key: string, _value: string): void {
    // Graceful no-op
  }

  public rawSetCheat(_index: number, _enabled: boolean, _code: string): void {
    // Graceful no-op
  }

  public rawResetCheats(): void {
    // Graceful no-op
  }

  public rawGetDiscCount(): number {
    return 1;
  }

  public async rawChangeDisc(_index: number): Promise<boolean> {
    return false;
  }

  public rawSendButton(
    _player: number,
    _buttonId: number,
    _pressed: boolean,
  ): void {
    // Graceful no-op
  }

  public rawSendAxis(_player: number, _axisId: number, _value: number): void {
    // Graceful no-op
  }

  public rawSetVolume(_volume: number): void {
    // Handled by master Web Audio gain node
  }

  public rawSetSpeed(_ratio: number): void {
    // Graceful no-op
  }

  public rawGetFps(): number {
    return 60;
  }

  public getCanvas(): HTMLCanvasElement {
    if (!this.context?.canvas) {
      throw new Error(
        `[BaseCoreBridge] Core "${this.id}" has no canvas bound.`,
      );
    }
    return this.context.canvas;
  }
}
