import type { ICoreAdapter } from '../adapters/ICoreAdapter';
import type { CoreOptionDefinition } from '../core/types';

export interface ICoreOptionsManager {
  getOptions(): CoreOptionDefinition[];
  getOption(id: string): string | undefined;
  setOption(id: string, value: string): void;
  resetOption(id: string): void;
  resetAll(): void;
  onOptionChanged(callback: (id: string, value: string) => void): () => void;
}

export class CoreOptionsManager implements ICoreOptionsManager {
  private _optionOverrides = new Map<string, string>();
  private _listeners = new Set<(id: string, value: string) => void>();

  constructor(private readonly _getAdapter: () => ICoreAdapter | null) {}

  public getOptions(): CoreOptionDefinition[] {
    const adapter = this._getAdapter();
    if (!adapter || !adapter.capabilities.coreOptions) return [];

    const raw = adapter.rawGetOptions();
    return raw.map((opt) => {
      const override = this._optionOverrides.get(opt.id);
      return {
        ...opt,
        currentValue: override !== undefined ? override : opt.currentValue,
      };
    });
  }

  public getOption(id: string): string | undefined {
    if (this._optionOverrides.has(id)) {
      return this._optionOverrides.get(id);
    }
    const opts = this.getOptions();
    const found = opts.find((o) => o.id === id);
    return found ? found.currentValue : undefined;
  }

  public setOption(id: string, value: string): void {
    this._optionOverrides.set(id, value);
    const adapter = this._getAdapter();
    if (adapter && adapter.capabilities.coreOptions) {
      adapter.rawSetOption(id, value);
    }
    for (const listener of this._listeners) {
      listener(id, value);
    }
  }

  public resetOption(id: string): void {
    const opts = this.getOptions();
    const found = opts.find((o) => o.id === id);
    if (found) {
      this.setOption(id, found.defaultValue);
    }
  }

  public resetAll(): void {
    const opts = this.getOptions();
    for (const opt of opts) {
      this.setOption(opt.id, opt.defaultValue);
    }
    this._optionOverrides.clear();
  }

  public onOptionChanged(
    callback: (id: string, value: string) => void,
  ): () => void {
    this._listeners.add(callback);
    return () => this._listeners.delete(callback);
  }
}
