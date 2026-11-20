import type { ICoreAdapter } from '../adapters/ICoreAdapter';
import type { CoreMetadata } from './types';

export type CoreAdapterFactory = () => ICoreAdapter;

/**
 * Standard registry mapping systems and file extensions to WebAssembly cores.
 */
export class CoreRegistry {
  private static _cores = new Map<string, CoreMetadata>();
  private static _systemCores = new Map<string, string[]>();
  private static _extensionMap = new Map<string, string>();
  private static _factories = new Map<string, CoreAdapterFactory>();

  static {
    this.registerBuiltinCores();
  }

  private static registerBuiltinCores(): void {
    // PICO-8 (retro8)
    this.registerCore({
      id: 'retro8',
      name: 'PICO-8 (Retro8)',
      system: 'pico8',
      family: 'libretro',
      extensions: ['p8', 'png', 'p8.png'],
      capabilities: {
        saveStates: true,
        sram: true,
        cheats: false,
        coreOptions: true,
        multiDisc: false,
        shaders: true,
        rewind: true,
        variableSpeed: true,
        maxPlayers: 2,
        pointer: false,
      },
    });

    // PlayStation 2 (Play! WASM)
    this.registerCore({
      id: 'play',
      name: 'PlayStation 2 (Play!)',
      system: 'ps2',
      family: 'play',
      extensions: ['iso', 'bin', 'cso', 'chd'],
      needsThreads: true,
      capabilities: {
        saveStates: false, // PS2 relies on virtual memory card / work/mc0
        sram: true, // mc0 memory cards
        cheats: true, // pnach cheats
        coreOptions: true,
        multiDisc: true,
        shaders: false,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 2,
        pointer: false,
      },
    });

    // Adobe Flash (Ruffle WASM)
    this.registerCore({
      id: 'ruffle',
      name: 'Adobe Flash (Ruffle)',
      system: 'flash',
      family: 'ruffle',
      extensions: ['swf'],
      capabilities: {
        saveStates: false,
        sram: true, // Flash .sol Local Shared Objects
        cheats: false,
        coreOptions: true,
        multiDisc: false,
        shaders: false,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 4,
        pointer: true, // Mouse / touch primary
      },
    });

    // Super Nintendo (SNES)
    this.registerCore({
      id: 'snes9x',
      name: 'Super Nintendo (Snes9x)',
      system: 'snes',
      family: 'libretro',
      extensions: ['smc', 'sfc', 'fig'],
      capabilities: {
        saveStates: true,
        sram: true,
        cheats: true,
        coreOptions: true,
        multiDisc: false,
        shaders: true,
        rewind: true,
        variableSpeed: true,
        maxPlayers: 4,
        pointer: true, // Super Scope / Mouse
      },
    });
    this.registerCore({
      id: 'snes9x2010',
      name: 'Super Nintendo (Snes9x 2010)',
      system: 'snes',
      family: 'libretro',
      extensions: ['smc', 'sfc'],
      capabilities: {
        saveStates: true,
        sram: true,
        cheats: true,
        coreOptions: true,
        multiDisc: false,
        shaders: true,
        rewind: true,
        variableSpeed: true,
        maxPlayers: 4,
        pointer: false,
      },
    });

    // Nintendo Entertainment System (NES)
    this.registerCore({
      id: 'nestopia',
      name: 'NES / Famicom (Nestopia)',
      system: 'nes',
      family: 'libretro',
      extensions: ['nes', 'fds', 'unf'],
      capabilities: {
        saveStates: true,
        sram: true,
        cheats: true,
        coreOptions: true,
        multiDisc: false,
        shaders: true,
        rewind: true,
        variableSpeed: true,
        maxPlayers: 4,
        pointer: true, // Zapper
      },
    });
    this.registerCore({
      id: 'fceumm',
      name: 'NES / Famicom (FCEUmm)',
      system: 'nes',
      family: 'libretro',
      extensions: ['nes'],
      capabilities: {
        saveStates: true,
        sram: true,
        cheats: true,
        coreOptions: true,
        multiDisc: false,
        shaders: true,
        rewind: true,
        variableSpeed: true,
        maxPlayers: 4,
        pointer: true,
      },
    });

    // Game Boy Advance (GBA)
    this.registerCore({
      id: 'mgba',
      name: 'Game Boy Advance (mGBA)',
      system: 'gba',
      family: 'libretro',
      extensions: ['gba'],
      capabilities: {
        saveStates: true,
        sram: true,
        cheats: true,
        coreOptions: true,
        multiDisc: false,
        shaders: true,
        rewind: true,
        variableSpeed: true,
        maxPlayers: 4,
        pointer: false,
      },
    });

    // Game Boy / Game Boy Color
    this.registerCore({
      id: 'gambatte',
      name: 'Game Boy / Color (Gambatte)',
      system: 'gb',
      family: 'libretro',
      extensions: ['gb', 'gbc'],
      capabilities: {
        saveStates: true,
        sram: true,
        cheats: true,
        coreOptions: true,
        multiDisc: false,
        shaders: true,
        rewind: true,
        variableSpeed: true,
        maxPlayers: 2,
        pointer: false,
      },
    });

    // Sega Genesis / Mega Drive / 32X
    this.registerCore({
      id: 'genesis_plus_gx',
      name: 'Sega Genesis / CD / SMS (Genesis Plus GX)',
      system: 'genesis',
      family: 'libretro',
      extensions: ['md', 'smd', 'gen', 'sms'],
      capabilities: {
        saveStates: true,
        sram: true,
        cheats: true,
        coreOptions: true,
        multiDisc: true,
        shaders: true,
        rewind: true,
        variableSpeed: true,
        maxPlayers: 4,
        pointer: true, // Menacer / Justifier
      },
    });

    // PlayStation 1
    this.registerCore({
      id: 'pcsx_rearmed',
      name: 'PlayStation (PCSX ReARMed)',
      system: 'psx',
      family: 'libretro',
      extensions: ['cue', 'bin', 'chd', 'pbp', 'm3u'],
      capabilities: {
        saveStates: true,
        sram: true,
        cheats: true,
        coreOptions: true,
        multiDisc: true,
        shaders: true,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 4,
        pointer: true, // Justifier / Guncon
      },
    });

    // Nintendo 64
    this.registerCore({
      id: 'mupen64plus_next',
      name: 'Nintendo 64 (Mupen64Plus-Next)',
      system: 'n64',
      family: 'libretro',
      extensions: ['n64', 'z64', 'v64'],
      needsThreads: true,
      capabilities: {
        saveStates: true,
        sram: true,
        cheats: true,
        coreOptions: true,
        multiDisc: false,
        shaders: true,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 4,
        pointer: false,
      },
    });

    // Fantasy Consoles (TIC-80, WASM-4)
    this.registerCore({
      id: 'tic80',
      name: 'TIC-80',
      system: 'tic80',
      family: 'libretro',
      extensions: ['tic'],
      capabilities: {
        saveStates: true,
        sram: true,
        cheats: false,
        coreOptions: true,
        multiDisc: false,
        shaders: true,
        rewind: true,
        variableSpeed: true,
        maxPlayers: 4,
        pointer: true,
      },
    });
    this.registerCore({
      id: 'wasm4',
      name: 'WASM-4',
      system: 'wasm4',
      family: 'libretro',
      extensions: ['wasm'],
      capabilities: {
        saveStates: true,
        sram: true,
        cheats: false,
        coreOptions: false,
        multiDisc: false,
        shaders: true,
        rewind: true,
        variableSpeed: true,
        maxPlayers: 4,
        pointer: true,
      },
    });

    // Classic Engines (ScummVM, PrBoom)
    this.registerCore({
      id: 'scummvm',
      name: 'ScummVM',
      system: 'scummvm',
      family: 'libretro',
      extensions: ['scummvm'],
      capabilities: {
        saveStates: false,
        sram: true,
        cheats: false,
        coreOptions: true,
        multiDisc: false,
        shaders: true,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 1,
        pointer: true,
      },
    });
    this.registerCore({
      id: 'prboom',
      name: 'Doom (PrBoom)',
      system: 'doom',
      family: 'libretro',
      extensions: ['wad'],
      capabilities: {
        saveStates: true,
        sram: true,
        cheats: true,
        coreOptions: true,
        multiDisc: false,
        shaders: true,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 4,
        pointer: true,
      },
    });
  }

  public static registerCore(
    metadata: CoreMetadata,
    factory?: CoreAdapterFactory,
  ): void {
    this._cores.set(metadata.id, metadata);

    // Map system tag to core list
    const systemKey = metadata.system.toLowerCase();
    const existing = this._systemCores.get(systemKey) || [];
    if (!existing.includes(metadata.id)) {
      existing.push(metadata.id);
      this._systemCores.set(systemKey, existing);
    }

    // Map file extensions
    for (const ext of metadata.extensions) {
      const cleanExt = ext.toLowerCase().replace(/^\./, '');
      if (!this._extensionMap.has(cleanExt)) {
        this._extensionMap.set(cleanExt, metadata.id);
      }
    }

    if (factory) {
      this._factories.set(metadata.id, factory);
    }
  }

  public static getCore(coreId: string): CoreMetadata | undefined {
    return this._cores.get(coreId);
  }

  public static getAllCores(): CoreMetadata[] {
    return Array.from(this._cores.values());
  }

  public static getCoresForSystem(system: string): CoreMetadata[] {
    const coreIds = this._systemCores.get(system.toLowerCase()) || [];
    return coreIds.map((id) => this._cores.get(id)!).filter(Boolean);
  }

  public static resolveCoreFromFileName(
    fileName: string,
  ): CoreMetadata | undefined {
    const parts = fileName.toLowerCase().split('.');
    if (parts.length > 2) {
      // Check for compound extensions e.g. .p8.png
      const compound = `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
      const coreId = this._extensionMap.get(compound);
      if (coreId && this._cores.has(coreId)) {
        return this._cores.get(coreId);
      }
    }

    const ext = parts[parts.length - 1];
    const coreId = this._extensionMap.get(ext);
    return coreId ? this._cores.get(coreId) : undefined;
  }

  public static registerAdapterFactory(
    coreId: string,
    factory: CoreAdapterFactory,
  ): void {
    this._factories.set(coreId, factory);
  }

  public static getAdapterFactory(
    coreId: string,
  ): CoreAdapterFactory | undefined {
    return this._factories.get(coreId);
  }
}
