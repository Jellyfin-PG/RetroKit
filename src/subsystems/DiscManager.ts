import type { ICoreAdapter } from '../adapters/ICoreAdapter';
import type { DiscInfo } from '../core/types';

export interface IDiscManager {
  getDiscCount(): number;
  getCurrentDiscIndex(): number;
  getDiscList(): DiscInfo[];
  changeDisc(index: number): Promise<boolean>;
  nextDisc(): Promise<boolean>;
  previousDisc(): Promise<boolean>;
  ejectDisc(): Promise<void>;
  insertDisc(index: number): Promise<void>;
  onDiscChanged(callback: (disc: DiscInfo) => void): () => void;
}

export class DiscManager implements IDiscManager {
  private _currentDisc = 0;
  private _discs: DiscInfo[] = [];
  private _listeners = new Set<(disc: DiscInfo) => void>();

  constructor(private readonly _getAdapter: () => ICoreAdapter | null) {}

  public setDiscs(paths: string[]): void {
    this._discs = paths.map((p, idx) => ({
      index: idx,
      name: `Disc ${idx + 1}`,
      path: p,
      isCurrent: idx === 0,
    }));
    this._currentDisc = 0;
  }

  public getDiscCount(): number {
    const adapter = this._getAdapter();
    if (adapter && adapter.capabilities.multiDisc) {
      return Math.max(adapter.rawGetDiscCount(), this._discs.length);
    }
    return 1;
  }

  public getCurrentDiscIndex(): number {
    return this._currentDisc;
  }

  public getDiscList(): DiscInfo[] {
    return [...this._discs];
  }

  public async changeDisc(index: number): Promise<boolean> {
    const adapter = this._getAdapter();
    if (!adapter || !adapter.capabilities.multiDisc) return false;

    if (index < 0 || index >= this.getDiscCount()) return false;

    const ok = await adapter.rawChangeDisc(index);
    if (ok) {
      this._currentDisc = index;
      for (const d of this._discs) {
        d.isCurrent = d.index === index;
      }
      const current = this._discs[index] || {
        index,
        name: `Disc ${index + 1}`,
        path: '',
        isCurrent: true,
      };
      for (const listener of this._listeners) {
        listener(current);
      }
    }
    return ok;
  }

  public async nextDisc(): Promise<boolean> {
    const next = (this._currentDisc + 1) % this.getDiscCount();
    return this.changeDisc(next);
  }

  public async previousDisc(): Promise<boolean> {
    const prev =
      (this._currentDisc - 1 + this.getDiscCount()) % this.getDiscCount();
    return this.changeDisc(prev);
  }

  public async ejectDisc(): Promise<void> {
    // Eject is represented as disc -1 in standard Libretro disc control
    const adapter = this._getAdapter();
    if (adapter && adapter.capabilities.multiDisc) {
      await adapter.rawChangeDisc(-1);
    }
  }

  public async insertDisc(index: number): Promise<void> {
    await this.changeDisc(index);
  }

  public onDiscChanged(callback: (disc: DiscInfo) => void): () => void {
    this._listeners.add(callback);
    return () => this._listeners.delete(callback);
  }
}
