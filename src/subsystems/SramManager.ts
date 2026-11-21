import type { ICoreAdapter } from '../adapters/ICoreAdapter';

export interface ISramManager {
  getSram(): Promise<Uint8Array | Record<string, Uint8Array> | null>;
  setSram(
    data: Uint8Array | Record<string, Uint8Array>,
    options?: { restart?: boolean },
  ): Promise<boolean>;
  flushSram(): Promise<void>;
  isDirty(): boolean;
  onSramModified(
    callback: (data: Uint8Array | Record<string, Uint8Array>) => void,
  ): () => void;
  getSaveFilePath(): string;
}

export class SramManager implements ISramManager {
  private _isDirty = false;
  private _lastData: Uint8Array | Record<string, Uint8Array> | null = null;
  private _modifiedListeners = new Set<
    (data: Uint8Array | Record<string, Uint8Array>) => void
  >();
  private _pollTimer: number | null = null;

  constructor(private readonly _getAdapter: () => ICoreAdapter | null) {
    this._startDirtyWatchdog();
  }

  public async getSram(): Promise<
    Uint8Array | Record<string, Uint8Array> | null
  > {
    const adapter = this._getAdapter();
    if (!adapter || !adapter.capabilities.sram) return null;
    return adapter.rawGetSram();
  }

  public async setSram(
    data: Uint8Array | Record<string, Uint8Array>,
    options?: { restart?: boolean },
  ): Promise<boolean> {
    const adapter = this._getAdapter();
    if (!adapter || !adapter.capabilities.sram) return false;

    const ok = await adapter.rawSetSram(data);
    if (ok && options?.restart) {
      await adapter.restart();
    }
    this._isDirty = false;
    this._lastData = data;
    return ok;
  }

  public async flushSram(): Promise<void> {
    const adapter = this._getAdapter();
    if (!adapter || !adapter.capabilities.sram) return;
    await adapter.rawFlushSram();
    this._isDirty = false;
  }

  public isDirty(): boolean {
    return this._isDirty;
  }

  public onSramModified(
    callback: (data: Uint8Array | Record<string, Uint8Array>) => void,
  ): () => void {
    this._modifiedListeners.add(callback);
    return () => this._modifiedListeners.delete(callback);
  }

  public getSaveFilePath(): string {
    const adapter = this._getAdapter();
    return adapter?.getSramPath() || '';
  }

  public destroy(): void {
    if (this._pollTimer) {
      clearInterval(this._pollTimer);
      this._pollTimer = null;
    }
    this._modifiedListeners.clear();
  }

  private _startDirtyWatchdog(): void {
    // Periodically checks if the core's in-memory SRAM has changed (dirty detection)
    const timer = setInterval(async () => {
      const adapter = this._getAdapter();
      if (!adapter || !adapter.capabilities.sram) return;

      const current = await adapter.rawGetSram();
      if (current && this._hasChanged(this._lastData, current)) {
        this._isDirty = true;
        this._lastData = current;
        for (const listener of this._modifiedListeners) {
          try {
            listener(current);
          } catch (err) {
            console.error(
              '[SramManager] Error in onSramModified listener:',
              err,
            );
          }
        }
      }
    }, 2500);

    // Prevent background watchdog timer from keeping Node process alive in tests or SSR
    if (typeof timer === 'object' && timer !== null && 'unref' in timer) {
      (timer as any).unref();
    }
    this._pollTimer = timer as any;
  }

  private _hasChanged(
    a: Uint8Array | Record<string, Uint8Array> | null,
    b: Uint8Array | Record<string, Uint8Array> | null,
  ): boolean {
    if (!a && !b) return false;
    if (!a || !b) return true;

    if (a instanceof Uint8Array && b instanceof Uint8Array) {
      if (a.byteLength !== b.byteLength) return true;
      for (let i = 0; i < a.byteLength; i++) {
        if (a[i] !== b[i]) return true;
      }
      return false;
    }

    return true;
  }
}
