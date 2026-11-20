import type { ICoreAdapter } from '../adapters/ICoreAdapter';
import type { CheatItem } from '../core/types';

export interface ICheatManager {
  getCheats(): CheatItem[];
  addCheat(cheat: Omit<CheatItem, 'id'>): string;
  removeCheat(id: string): boolean;
  toggleCheat(id: string, enabled: boolean): void;
  clearAllCheats(): void;
  loadCheatFile(content: string, format?: 'cht' | 'pnach' | 'json'): void;
  exportCheatFile(): string;
}

export class CheatManager implements ICheatManager {
  private _cheats = new Map<string, CheatItem>();
  private _counter = 0;

  constructor(private readonly _getAdapter: () => ICoreAdapter | null) {}

  public getCheats(): CheatItem[] {
    return Array.from(this._cheats.values());
  }

  public addCheat(cheat: Omit<CheatItem, 'id'>): string {
    const id = `cheat_${++this._counter}`;
    const item: CheatItem = { ...cheat, id };
    this._cheats.set(id, item);

    this._syncToCore();
    return id;
  }

  public removeCheat(id: string): boolean {
    const ok = this._cheats.delete(id);
    if (ok) {
      this._syncToCore();
    }
    return ok;
  }

  public toggleCheat(id: string, enabled: boolean): void {
    const cheat = this._cheats.get(id);
    if (cheat) {
      cheat.enabled = enabled;
      this._syncToCore();
    }
  }

  public clearAllCheats(): void {
    this._cheats.clear();
    const adapter = this._getAdapter();
    if (adapter && adapter.capabilities.cheats) {
      adapter.rawResetCheats();
    }
  }

  public loadCheatFile(
    content: string,
    format: 'cht' | 'pnach' | 'json' = 'cht',
  ): void {
    if (format === 'json') {
      try {
        const arr = JSON.parse(content) as CheatItem[];
        for (const item of arr) {
          this.addCheat({
            name: item.name,
            code: item.code,
            enabled: !!item.enabled,
            type: item.type,
          });
        }
      } catch (err) {
        console.error('[CheatManager] Failed to parse JSON cheats:', err);
      }
      return;
    }

    // Basic .cht parser (Libretro / EmulatorJS format)
    const lines = content.split('\n');
    let currentDesc = '';
    let currentCode = '';
    let currentEnabled = false;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      if (line.includes('_desc =')) {
        currentDesc = line.split('=')[1]?.replace(/"/g, '').trim() || '';
      } else if (line.includes('_code =')) {
        currentCode = line.split('=')[1]?.replace(/"/g, '').trim() || '';
      } else if (line.includes('_enable =')) {
        currentEnabled = line.split('=')[1]?.trim() === 'true';
        if (currentCode) {
          this.addCheat({
            name: currentDesc || currentCode,
            code: currentCode,
            enabled: currentEnabled,
          });
          currentDesc = '';
          currentCode = '';
          currentEnabled = false;
        }
      }
    }
  }

  public exportCheatFile(): string {
    let out = `cheats = ${this._cheats.size}\n\n`;
    let i = 0;
    for (const cheat of this._cheats.values()) {
      out += `cheat${i}_desc = "${cheat.name}"\n`;
      out += `cheat${i}_code = "${cheat.code}"\n`;
      out += `cheat${i}_enable = ${cheat.enabled}\n\n`;
      i++;
    }
    return out;
  }

  private _syncToCore(): void {
    const adapter = this._getAdapter();
    if (!adapter || !adapter.capabilities.cheats) return;

    adapter.rawResetCheats();
    let idx = 0;
    for (const cheat of this._cheats.values()) {
      adapter.rawSetCheat(idx, cheat.enabled, cheat.code);
      idx++;
    }
  }
}
