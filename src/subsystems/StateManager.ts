import type { ICoreAdapter } from '../adapters/ICoreAdapter';
import type { SaveStateMetadata, SaveStateRecord } from '../core/types';

export interface IStateManager {
  saveState(slot?: number): Promise<SaveStateRecord | null>;
  loadState(source: number | Uint8Array): Promise<boolean>;
  getStateBuffer(): Promise<Uint8Array | null>;
  listStates(): Promise<SaveStateMetadata[]>;
  hasState(slot: number): Promise<boolean>;
  deleteState(slot: number): Promise<void>;
  autoSave(): Promise<SaveStateRecord | null>;
  autoLoad(): Promise<boolean>;
}

export class StateManager implements IStateManager {
  private _stateCache = new Map<number, SaveStateRecord>();
  private _activeGameId = 'default';

  constructor(
    private readonly _getAdapter: () => ICoreAdapter | null,
    private readonly _getScreenshot: () => Promise<Blob | null>,
  ) {}

  public setGameId(gameId: string): void {
    this._activeGameId = gameId;
    this._stateCache.clear();
  }

  public async saveState(slot = 0): Promise<SaveStateRecord | null> {
    const adapter = this._getAdapter();
    if (!adapter || !adapter.capabilities.saveStates) return null;

    const data = await adapter.rawSaveState(slot);
    if (!data) return null;

    let screenshot: Blob | undefined;
    try {
      const shot = await this._getScreenshot();
      if (shot) screenshot = shot;
    } catch (_) {}

    const record: SaveStateRecord = {
      data,
      metadata: {
        slot,
        timestamp: Date.now(),
        gameId: this._activeGameId,
        coreId: adapter.id,
        screenshot,
        sizeBytes: data.byteLength,
      },
    };

    this._stateCache.set(slot, record);
    return record;
  }

  public async loadState(source: number | Uint8Array): Promise<boolean> {
    const adapter = this._getAdapter();
    if (!adapter || !adapter.capabilities.saveStates) return false;

    let buffer: Uint8Array | null = null;
    const slot = typeof source === 'number' ? source : undefined;
    if (typeof source === 'number') {
      const cached = this._stateCache.get(source);
      buffer = cached ? cached.data : null;
    } else {
      buffer = source;
    }

    if (!buffer) return false;
    return adapter.rawLoadState(buffer, slot);
  }

  public async getStateBuffer(): Promise<Uint8Array | null> {
    const adapter = this._getAdapter();
    if (!adapter || !adapter.capabilities.saveStates) return null;
    return adapter.rawSaveState();
  }

  public async listStates(): Promise<SaveStateMetadata[]> {
    return Array.from(this._stateCache.values()).map((r) => r.metadata);
  }

  public async hasState(slot: number): Promise<boolean> {
    return this._stateCache.has(slot);
  }

  public async deleteState(slot: number): Promise<void> {
    this._stateCache.delete(slot);
  }

  public async autoSave(): Promise<SaveStateRecord | null> {
    return this.saveState(-1); // Slot -1 reserved for auto-save
  }

  public async autoLoad(): Promise<boolean> {
    return this.loadState(-1);
  }
}
