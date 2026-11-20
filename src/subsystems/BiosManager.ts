import type { ICoreAdapter } from '../adapters/ICoreAdapter';

export interface IBiosManager {
  register(name: string, data: Uint8Array | ArrayBuffer): void;
  unregister(name: string): boolean;
  has(name: string): boolean;
  get(name: string): Uint8Array | undefined;
  list(): string[];
  clear(): void;
  injectIntoAdapter(adapter: ICoreAdapter): Promise<void>;
}

/**
 * Manages system BIOS and firmware files, automatically injecting them into
 * the virtual system directories of active emulation cores.
 */
export class BiosManager implements IBiosManager {
  private _biosMap = new Map<string, Uint8Array>();

  public register(name: string, data: Uint8Array | ArrayBuffer): void {
    const cleanName = name.replace(/^.*[\\/]/, '');
    const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
    this._biosMap.set(cleanName, bytes);
  }

  public unregister(name: string): boolean {
    const cleanName = name.replace(/^.*[\\/]/, '');
    return this._biosMap.delete(cleanName);
  }

  public has(name: string): boolean {
    const cleanName = name.replace(/^.*[\\/]/, '');
    return this._biosMap.has(cleanName);
  }

  public get(name: string): Uint8Array | undefined {
    const cleanName = name.replace(/^.*[\\/]/, '');
    return this._biosMap.get(cleanName);
  }

  public list(): string[] {
    return Array.from(this._biosMap.keys());
  }

  public clear(): void {
    this._biosMap.clear();
  }

  public async injectIntoAdapter(adapter: ICoreAdapter): Promise<void> {
    if (!adapter) return;
    for (const [name, bytes] of this._biosMap.entries()) {
      try {
        await adapter.rawSetBios(name, bytes);
      } catch (err) {
        console.warn(
          `[BiosManager] Failed to inject BIOS "${name}" into adapter:`,
          err,
        );
      }
    }
  }
}
