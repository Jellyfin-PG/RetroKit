import type { ICoreAdapter } from '../adapters/ICoreAdapter';
import type { CoreMetadata } from './types';

export type CoreAdapterFactory = () => ICoreAdapter;

export class CoreRegistry {
  private static _cores: Map<string, CoreMetadata> = new Map();
  private static _extensionMap: Map<string, string> = new Map();
  private static _systemCores: Map<string, string[]> = new Map();
  private static _factories: Map<string, CoreAdapterFactory> = new Map();

  static {
    this.registerBuiltinCores();
  }

  private static registerBuiltinCores(): void {
    this.registerCore({
      id: 'play',
      name: 'PlayStation 2 (Play!)',
      system: 'ps2',
      family: 'play',
      extensions: ['iso', 'bin', 'cso', 'chd', 'isz', 'elf'],
      needsThreads: true,
      capabilities: {
        saveStates: false,
        sram: true,
        cheats: true,
        coreOptions: true,
        multiDisc: true,
        shaders: false,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 2,
        pointer: false,
      },
    });

    this.registerCore({
      id: 'ppsspp',
      name: 'Sony PlayStation Portable (PPSSPP)',
      system: 'psp',
      family: 'emulatorjs',
      extensions: ['iso', 'cso', 'pbp', 'elf', 'prx'],
      needsThreads: true,
      needsWebGL2: true,
      capabilities: {
        saveStates: true,
        sram: true,
        cheats: true,
        coreOptions: true,
        multiDisc: true,
        shaders: false,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 1,
        pointer: false,
      },
    });

    this.registerCore({
      id: 'azahar',
      name: 'Nintendo 3DS (Azahar / Citra)',
      system: '3ds',
      family: 'emulatorjs',
      extensions: ['3ds', '3dsx', 'cci', 'cxi', 'elf', 'axf', 'app', 'cia'],
      needsThreads: true,
      needsWebGL2: true,
      capabilities: {
        saveStates: true,
        sram: true,
        cheats: false,
        coreOptions: true,
        multiDisc: false,
        shaders: false,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 1,
        pointer: true,
      },
    });

    this.registerCore({
      id: 'desmume',
      name: 'Nintendo DS (DeSmuME)',
      system: 'nds',
      family: 'emulatorjs',
      extensions: ['nds', 'bin'],
      needsWebGL2: true,
      needsThreads: false,
      capabilities: {
        saveStates: true,
        sram: true,
        cheats: true,
        coreOptions: true,
        multiDisc: false,
        shaders: false,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 1,
        pointer: true,
      },
    });

    this.registerCore({
      id: 'melonds',
      name: 'Nintendo DS (melonDS)',
      system: 'nds',
      family: 'emulatorjs',
      extensions: ['nds', 'bin'],
      needsWebGL2: true,
      needsThreads: false,
      capabilities: {
        saveStates: true,
        sram: true,
        cheats: true,
        coreOptions: true,
        multiDisc: false,
        shaders: false,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 1,
        pointer: true,
      },
    });

    this.registerCore({
      id: 'ruffle',
      name: 'Adobe Flash (Ruffle)',
      system: 'flash',
      family: 'ruffle',
      extensions: ['swf'],
      capabilities: {
        saveStates: false,
        sram: true,
        cheats: false,
        coreOptions: true,
        multiDisc: false,
        shaders: false,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 4,
        pointer: true,
      },
    });

    this.registerCore({
      id: 'nestopia',
      name: 'Nintendo NES (Nestopia)',
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
        pointer: true,
      },
    });

    this.registerCore({
      id: 'fceumm',
      name: 'Nintendo NES (FCEUmm)',
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
        pointer: true,
      },
    });

    this.registerCore({
      id: 'quicknes',
      name: 'Nintendo NES (QuickNES)',
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
        maxPlayers: 2,
        pointer: false,
      },
    });

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
        pointer: true,
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

    this.registerCore({
      id: 'snes9x2005',
      name: 'Super Nintendo (Snes9x 2005)',
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

    this.registerCore({
      id: 'snes9x2002',
      name: 'Super Nintendo (Snes9x 2002)',
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

    this.registerCore({
      id: 'gearboy',
      name: 'Game Boy / Color (Gearboy)',
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

    this.registerCore({
      id: 'DoubleCherryGB',
      name: 'Game Boy / Color 2P (DoubleCherryGB)',
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

    this.registerCore({
      id: 'tgbdual',
      name: 'Game Boy / Color Link (TGB Dual)',
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

    this.registerCore({
      id: 'vba_next',
      name: 'Game Boy Advance (VBA Next)',
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

    this.registerCore({
      id: 'mednafen_vb',
      name: 'Virtual Boy (Beetle VB)',
      system: 'virtualboy',
      family: 'libretro',
      extensions: ['vb', 'vboy', 'bin'],
      capabilities: {
        saveStates: true,
        sram: true,
        cheats: false,
        coreOptions: true,
        multiDisc: false,
        shaders: true,
        rewind: true,
        variableSpeed: true,
        maxPlayers: 1,
        pointer: false,
      },
    });

    this.registerCore({
      id: 'mupen64plus_next',
      name: 'Nintendo 64 (Mupen64Plus-Next)',
      system: 'n64',
      family: 'emulatorjs',
      extensions: ['n64', 'z64', 'v64'],
      needsThreads: true,
      needsWebGL2: true,
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

    this.registerCore({
      id: 'parallel_n64',
      name: 'Nintendo 64 (ParaLLEl N64)',
      system: 'n64',
      family: 'emulatorjs',
      extensions: ['n64', 'z64', 'v64'],
      needsThreads: true,
      needsWebGL2: true,
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

    this.registerCore({
      id: 'love',
      name: 'LÖVE (love.js)',
      system: 'love',
      family: 'love',
      extensions: ['love', 'zip'],
      capabilities: {
        saveStates: false,
        sram: true,
        cheats: false,
        coreOptions: true,
        multiDisc: false,
        shaders: false,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 4,
        pointer: true,
      },
    });

    this.registerCore({
      id: 'genesis_plus_gx',
      name: 'Sega Genesis / Mega Drive (Genesis Plus GX)',
      system: 'genesis',
      family: 'libretro',
      extensions: ['md', 'smd', 'gen', 'bin'],
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
        pointer: true,
      },
    });

    this.registerCore({
      id: 'genesis_plus_gx_wide',
      name: 'Sega Mega Drive Widescreen',
      system: 'genesis',
      family: 'libretro',
      extensions: ['md', 'smd', 'gen'],
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
        pointer: true,
      },
    });

    this.registerCore({
      id: 'picodrive',
      name: 'Sega 32X / Genesis (PicoDrive)',
      system: 'genesis',
      family: 'libretro',
      extensions: ['32x', 'md', 'smd', 'gen'],
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
        pointer: false,
      },
    });

    this.registerCore({
      id: 'clownmdemu',
      name: 'Sega MD / CD (ClownMDEmu)',
      system: 'genesis',
      family: 'libretro',
      extensions: ['md', 'smd', 'gen', 'bin'],
      capabilities: {
        saveStates: true,
        sram: true,
        cheats: false,
        coreOptions: true,
        multiDisc: true,
        shaders: true,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 2,
        pointer: false,
      },
    });

    this.registerCore({
      id: 'gearsystem',
      name: 'Sega Master System / Game Gear (Gearsystem)',
      system: 'mastersystem',
      family: 'libretro',
      extensions: ['sms', 'gg', 'sg'],
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
        pointer: true,
      },
    });

    this.registerCore({
      id: 'fbneo',
      name: 'Arcade (FinalBurn Neo)',
      system: 'arcade',
      family: 'libretro',
      extensions: ['zip', '7z'],
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

    this.registerCore({
      id: 'fbalpha2012',
      name: 'Arcade (FB Alpha 2012)',
      system: 'arcade',
      family: 'libretro',
      extensions: ['zip', '7z'],
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

    this.registerCore({
      id: 'fbalpha2012_cps1',
      name: 'Arcade CPS-1 (FB Alpha 2012)',
      system: 'arcade',
      family: 'libretro',
      extensions: ['zip'],
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

    this.registerCore({
      id: 'fbalpha2012_cps2',
      name: 'Arcade CPS-2 (FB Alpha 2012)',
      system: 'arcade',
      family: 'libretro',
      extensions: ['zip'],
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

    this.registerCore({
      id: 'fbalpha2012_neogeo',
      name: 'Arcade Neo Geo (FB Alpha 2012)',
      system: 'arcade',
      family: 'libretro',
      extensions: ['zip'],
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

    this.registerCore({
      id: 'mame2000',
      name: 'Arcade (MAME 2000)',
      system: 'arcade',
      family: 'libretro',
      extensions: ['zip'],
      capabilities: {
        saveStates: false,
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

    this.registerCore({
      id: 'mame2003',
      name: 'Arcade (MAME 2003)',
      system: 'arcade',
      family: 'libretro',
      extensions: ['zip'],
      capabilities: {
        saveStates: false,
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

    this.registerCore({
      id: 'mame2003_plus',
      name: 'Arcade (MAME 2003-Plus)',
      system: 'arcade',
      family: 'libretro',
      extensions: ['zip'],
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

    this.registerCore({
      id: 'dice',
      name: 'Arcade (DICE)',
      system: 'arcade',
      family: 'libretro',
      extensions: ['zip'],
      capabilities: {
        saveStates: false,
        sram: false,
        cheats: false,
        coreOptions: false,
        multiDisc: false,
        shaders: true,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 2,
        pointer: false,
      },
    });

    this.registerCore({
      id: 'tia',
      name: 'Atari 2600 (Tia)',
      system: 'atari2600',
      family: 'libretro',
      extensions: ['a26', 'bin'],
      capabilities: {
        saveStates: true,
        sram: false,
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

    this.registerCore({
      id: 'handy',
      name: 'Atari Lynx (Handy)',
      system: 'lynx',
      family: 'libretro',
      extensions: ['lnx'],
      capabilities: {
        saveStates: true,
        sram: true,
        cheats: false,
        coreOptions: true,
        multiDisc: false,
        shaders: true,
        rewind: true,
        variableSpeed: true,
        maxPlayers: 1,
        pointer: false,
      },
    });

    this.registerCore({
      id: 'mednafen_lynx',
      name: 'Atari Lynx (Beetle Lynx)',
      system: 'lynx',
      family: 'libretro',
      extensions: ['lnx'],
      capabilities: {
        saveStates: true,
        sram: true,
        cheats: false,
        coreOptions: true,
        multiDisc: false,
        shaders: true,
        rewind: true,
        variableSpeed: true,
        maxPlayers: 1,
        pointer: false,
      },
    });

    this.registerCore({
      id: 'mednafen_pce_fast',
      name: 'PC Engine / CD (Beetle PCE FAST)',
      system: 'pce',
      family: 'libretro',
      extensions: ['pce', 'sgx', 'cue', 'chd', 'ccd'],
      capabilities: {
        saveStates: true,
        sram: true,
        cheats: true,
        coreOptions: true,
        multiDisc: true,
        shaders: true,
        rewind: true,
        variableSpeed: true,
        maxPlayers: 5,
        pointer: false,
      },
    });

    this.registerCore({
      id: 'geargrafx',
      name: 'PC Engine (Geargrafx)',
      system: 'pce',
      family: 'libretro',
      extensions: ['pce', 'sgx'],
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

    this.registerCore({
      id: 'quasi88',
      name: 'NEC PC-8800 (QUASI88)',
      system: 'pc88',
      family: 'libretro',
      extensions: ['d88', 't88'],
      capabilities: {
        saveStates: true,
        sram: true,
        cheats: false,
        coreOptions: true,
        multiDisc: false,
        shaders: true,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 2,
        pointer: true,
      },
    });

    this.registerCore({
      id: 'mednafen_ngp',
      name: 'Neo Geo Pocket / Color (Beetle NeoPop)',
      system: 'ngp',
      family: 'libretro',
      extensions: ['ngp', 'ngc'],
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

    this.registerCore({
      id: 'neocd',
      name: 'SNK Neo Geo CD (NeoCD)',
      system: 'neocd',
      family: 'libretro',
      extensions: ['cue', 'chd', 'iso'],
      capabilities: {
        saveStates: true,
        sram: true,
        cheats: false,
        coreOptions: true,
        multiDisc: true,
        shaders: true,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 2,
        pointer: false,
      },
    });

    this.registerCore({
      id: 'mednafen_wswan',
      name: 'WonderSwan / Color (Beetle Wonderswan)',
      system: 'wswan',
      family: 'libretro',
      extensions: ['ws', 'wsc'],
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

    this.registerCore({
      id: 'tamalibretro',
      name: 'Tamagotchi P1 (TamaLIBretro)',
      system: 'tamagotchi',
      family: 'libretro',
      extensions: ['bin'],
      capabilities: {
        saveStates: true,
        sram: true,
        cheats: false,
        coreOptions: false,
        multiDisc: false,
        shaders: true,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 1,
        pointer: false,
      },
    });

    this.registerCore({
      id: 'vice_x64',
      name: 'Commodore 64 (VICE x64)',
      system: 'c64',
      family: 'libretro',
      extensions: ['d64', 't64', 'prg', 'crt', 'tap'],
      capabilities: {
        saveStates: true,
        sram: true,
        cheats: false,
        coreOptions: true,
        multiDisc: false,
        shaders: true,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 2,
        pointer: true,
      },
    });

    this.registerCore({
      id: 'vice_x64sc',
      name: 'Commodore 64 Accurate (VICE x64sc)',
      system: 'c64',
      family: 'libretro',
      extensions: ['d64', 't64', 'prg', 'crt'],
      capabilities: {
        saveStates: true,
        sram: true,
        cheats: false,
        coreOptions: true,
        multiDisc: false,
        shaders: true,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 2,
        pointer: true,
      },
    });

    this.registerCore({
      id: 'vice_x128',
      name: 'Commodore 128 (VICE x128)',
      system: 'c64',
      family: 'libretro',
      extensions: ['d64', 'd81', 'prg'],
      capabilities: {
        saveStates: true,
        sram: true,
        cheats: false,
        coreOptions: true,
        multiDisc: false,
        shaders: true,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 2,
        pointer: true,
      },
    });

    this.registerCore({
      id: 'vice_xvic',
      name: 'Commodore VIC-20 (VICE xvic)',
      system: 'c64',
      family: 'libretro',
      extensions: ['prg', 'crt', 'd64'],
      capabilities: {
        saveStates: true,
        sram: true,
        cheats: false,
        coreOptions: true,
        multiDisc: false,
        shaders: true,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 2,
        pointer: true,
      },
    });

    this.registerCore({
      id: 'vice_xplus4',
      name: 'Commodore PLUS/4 (VICE xplus4)',
      system: 'c64',
      family: 'libretro',
      extensions: ['prg', 'd64'],
      capabilities: {
        saveStates: true,
        sram: true,
        cheats: false,
        coreOptions: true,
        multiDisc: false,
        shaders: true,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 2,
        pointer: true,
      },
    });

    this.registerCore({
      id: 'vice_xpet',
      name: 'Commodore PET (VICE xpet)',
      system: 'c64',
      family: 'libretro',
      extensions: ['prg', 'd64'],
      capabilities: {
        saveStates: true,
        sram: true,
        cheats: false,
        coreOptions: true,
        multiDisc: false,
        shaders: true,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 2,
        pointer: true,
      },
    });

    this.registerCore({
      id: 'vice_xscpu64',
      name: 'Commodore SuperCPU (VICE xscpu64)',
      system: 'c64',
      family: 'libretro',
      extensions: ['d64', 'prg'],
      capabilities: {
        saveStates: true,
        sram: true,
        cheats: false,
        coreOptions: true,
        multiDisc: false,
        shaders: true,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 2,
        pointer: true,
      },
    });

    this.registerCore({
      id: 'gearcoleco',
      name: 'ColecoVision (Gearcoleco)',
      system: 'colecovision',
      family: 'libretro',
      extensions: ['col', 'bin'],
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

    this.registerCore({
      id: 'vecx',
      name: 'Vectrex (vecx)',
      system: 'vectrex',
      family: 'libretro',
      extensions: ['vec', 'bin'],
      capabilities: {
        saveStates: true,
        sram: false,
        cheats: false,
        coreOptions: true,
        multiDisc: false,
        shaders: true,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 2,
        pointer: false,
      },
    });

    this.registerCore({
      id: 'opera',
      name: '3DO (Opera)',
      system: '3do',
      family: 'libretro',
      extensions: ['iso', 'chd', 'cue'],
      capabilities: {
        saveStates: true,
        sram: true,
        cheats: false,
        coreOptions: true,
        multiDisc: true,
        shaders: true,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 4,
        pointer: true,
      },
    });

    this.registerCore({
      id: 'freechaf',
      name: 'Fairchild Channel F (FreeChaF)',
      system: 'channelf',
      family: 'libretro',
      extensions: ['chf', 'bin'],
      capabilities: {
        saveStates: true,
        sram: false,
        cheats: false,
        coreOptions: true,
        multiDisc: false,
        shaders: true,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 2,
        pointer: false,
      },
    });

    this.registerCore({
      id: 'o2em',
      name: 'Magnavox Odyssey2 (O2EM)',
      system: 'odyssey2',
      family: 'libretro',
      extensions: ['bin'],
      capabilities: {
        saveStates: true,
        sram: false,
        cheats: false,
        coreOptions: true,
        multiDisc: false,
        shaders: true,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 2,
        pointer: false,
      },
    });

    this.registerCore({
      id: 'theodore',
      name: 'Thomson MO/TO (Theodore)',
      system: 'thomson',
      family: 'libretro',
      extensions: ['fd', 'k7', 'sap'],
      capabilities: {
        saveStates: true,
        sram: true,
        cheats: false,
        coreOptions: true,
        multiDisc: false,
        shaders: true,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 2,
        pointer: true,
      },
    });

    this.registerCore({
      id: 'x1',
      name: 'Sharp X1 (X Millennium)',
      system: 'x1',
      family: 'libretro',
      extensions: ['2d', '2hd', 'd88'],
      capabilities: {
        saveStates: true,
        sram: true,
        cheats: false,
        coreOptions: true,
        multiDisc: false,
        shaders: true,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 2,
        pointer: true,
      },
    });

    this.registerCore({
      id: 'minivmac',
      name: 'Macintosh II (minivmac)',
      system: 'mac',
      family: 'libretro',
      extensions: ['dsk', 'img'],
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
      id: 'mu',
      name: 'Palm OS (Mu)',
      system: 'palmos',
      family: 'libretro',
      extensions: ['prc', 'pqa'],
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
      id: 'numero',
      name: 'TI-83 (Numero)',
      system: 'ti83',
      family: 'libretro',
      extensions: ['83p', '8xp'],
      capabilities: {
        saveStates: true,
        sram: true,
        cheats: false,
        coreOptions: false,
        multiDisc: false,
        shaders: true,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 1,
        pointer: false,
      },
    });

    this.registerCore({
      id: 'bk',
      name: 'Elektronika BK-0010 (BK)',
      system: 'bk',
      family: 'libretro',
      extensions: ['bin'],
      capabilities: {
        saveStates: true,
        sram: false,
        cheats: false,
        coreOptions: false,
        multiDisc: false,
        shaders: true,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 2,
        pointer: true,
      },
    });

    this.registerCore({
      id: 'galaksija',
      name: 'Galaksija',
      system: 'galaksija',
      family: 'libretro',
      extensions: ['gtp'],
      capabilities: {
        saveStates: true,
        sram: false,
        cheats: false,
        coreOptions: false,
        multiDisc: false,
        shaders: true,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 1,
        pointer: true,
      },
    });

    this.registerCore({
      id: 'm2000',
      name: 'Philips P2000T (M2000)',
      system: 'p2000',
      family: 'libretro',
      extensions: ['cas'],
      capabilities: {
        saveStates: true,
        sram: false,
        cheats: false,
        coreOptions: false,
        multiDisc: false,
        shaders: true,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 2,
        pointer: true,
      },
    });

    this.registerCore({
      id: 'pico8',
      name: 'PICO-8 (Official Lexaloffle)',
      system: 'pico8',
      family: 'pico8',
      extensions: ['p8', 'p8.png', 'png'],
      capabilities: {
        saveStates: false,
        sram: true,
        cheats: false,
        coreOptions: true,
        multiDisc: false,
        shaders: false,
        rewind: false,
        variableSpeed: false,
        maxPlayers: 8,
        pointer: true,
      },
    });

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

    this.registerCore({
      id: 'ardens',
      name: 'Arduboy (Ardens)',
      system: 'arduboy',
      family: 'libretro',
      extensions: ['hex'],
      capabilities: {
        saveStates: true,
        sram: true,
        cheats: false,
        coreOptions: true,
        multiDisc: false,
        shaders: true,
        rewind: true,
        variableSpeed: true,
        maxPlayers: 1,
        pointer: false,
      },
    });

    this.registerCore({
      id: 'arduous',
      name: 'Arduboy (Arduous)',
      system: 'arduboy',
      family: 'libretro',
      extensions: ['hex'],
      capabilities: {
        saveStates: true,
        sram: true,
        cheats: false,
        coreOptions: false,
        multiDisc: false,
        shaders: true,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 1,
        pointer: false,
      },
    });

    this.registerCore({
      id: 'jaxe',
      name: 'CHIP-8 (JAXE)',
      system: 'chip8',
      family: 'libretro',
      extensions: ['ch8'],
      capabilities: {
        saveStates: true,
        sram: false,
        cheats: false,
        coreOptions: false,
        multiDisc: false,
        shaders: true,
        rewind: true,
        variableSpeed: true,
        maxPlayers: 1,
        pointer: false,
      },
    });

    this.registerCore({
      id: 'lowresnx',
      name: 'LowRes NX',
      system: 'lowresnx',
      family: 'libretro',
      extensions: ['nx'],
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
        pointer: false,
      },
    });

    this.registerCore({
      id: 'uw8',
      name: 'MicroW8',
      system: 'microw8',
      family: 'libretro',
      extensions: ['uw8'],
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
        pointer: false,
      },
    });

    this.registerCore({
      id: 'vaporspec',
      name: 'VaporSpec',
      system: 'vaporspec',
      family: 'libretro',
      extensions: ['vaporspec'],
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
        pointer: false,
      },
    });

    this.registerCore({
      id: 'uzem',
      name: 'Uzebox (Uzem)',
      system: 'uzebox',
      family: 'libretro',
      extensions: ['bin', 'hex', 'uze'],
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

    this.registerCore({
      id: 'chailove',
      name: 'ChaiLove',
      system: 'chailove',
      family: 'libretro',
      extensions: ['chai', 'chailove'],
      capabilities: {
        saveStates: false,
        sram: true,
        cheats: false,
        coreOptions: false,
        multiDisc: false,
        shaders: true,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 4,
        pointer: true,
      },
    });

    this.registerCore({
      id: 'lutro',
      name: 'Lutro',
      system: 'lutro',
      family: 'libretro',
      extensions: ['lutro', 'lua'],
      capabilities: {
        saveStates: false,
        sram: true,
        cheats: false,
        coreOptions: false,
        multiDisc: false,
        shaders: true,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 4,
        pointer: true,
      },
    });

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
        cheats: false,
        coreOptions: true,
        multiDisc: false,
        shaders: true,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 4,
        pointer: true,
      },
    });

    this.registerCore({
      id: 'tyrquake',
      name: 'Quake (TyrQuake)',
      system: 'quake',
      family: 'libretro',
      extensions: ['pak'],
      capabilities: {
        saveStates: true,
        sram: true,
        cheats: false,
        coreOptions: true,
        multiDisc: false,
        shaders: true,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 4,
        pointer: true,
      },
    });

    this.registerCore({
      id: 'vitaquake2',
      name: 'Quake II (vitaQuake 2)',
      system: 'quake2',
      family: 'libretro',
      extensions: ['pak'],
      capabilities: {
        saveStates: true,
        sram: true,
        cheats: false,
        coreOptions: true,
        multiDisc: false,
        shaders: true,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 4,
        pointer: true,
      },
    });

    this.registerCore({
      id: 'vitaquake2-rogue',
      name: 'Quake II Ground Zero (vitaQuake 2)',
      system: 'quake2',
      family: 'libretro',
      extensions: ['pak'],
      capabilities: {
        saveStates: true,
        sram: true,
        cheats: false,
        coreOptions: true,
        multiDisc: false,
        shaders: true,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 4,
        pointer: true,
      },
    });

    this.registerCore({
      id: 'vitaquake2-xatrix',
      name: 'Quake II The Reckoning (vitaQuake 2)',
      system: 'quake2',
      family: 'libretro',
      extensions: ['pak'],
      capabilities: {
        saveStates: true,
        sram: true,
        cheats: false,
        coreOptions: true,
        multiDisc: false,
        shaders: true,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 4,
        pointer: true,
      },
    });

    this.registerCore({
      id: 'vitaquake2-zaero',
      name: 'Quake II Zaero (vitaQuake 2)',
      system: 'quake2',
      family: 'libretro',
      extensions: ['pak'],
      capabilities: {
        saveStates: true,
        sram: true,
        cheats: false,
        coreOptions: true,
        multiDisc: false,
        shaders: true,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 4,
        pointer: true,
      },
    });

    this.registerCore({
      id: 'ecwolf',
      name: 'Wolfenstein 3D (ECWolf)',
      system: 'ecwolf',
      family: 'libretro',
      extensions: ['wl6', 'n3d', 'sod'],
      capabilities: {
        saveStates: true,
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
      id: 'nxengine',
      name: 'Cave Story (NXEngine)',
      system: 'cavestory',
      family: 'libretro',
      extensions: ['exe', 'doukutsu'],
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
        pointer: false,
      },
    });

    this.registerCore({
      id: 'xrick',
      name: 'Rick Dangerous (XRick)',
      system: 'xrick',
      family: 'libretro',
      extensions: ['zip'],
      capabilities: {
        saveStates: true,
        sram: false,
        cheats: false,
        coreOptions: false,
        multiDisc: false,
        shaders: true,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 1,
        pointer: false,
      },
    });

    this.registerCore({
      id: 'mrboom',
      name: 'Mr.Boom Bomberman',
      system: 'mrboom',
      family: 'libretro',
      extensions: ['mrboom'],
      capabilities: {
        saveStates: false,
        sram: false,
        cheats: false,
        coreOptions: true,
        multiDisc: false,
        shaders: true,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 8,
        pointer: false,
      },
    });

    this.registerCore({
      id: 'jumpnbump',
      name: "Jump 'n Bump",
      system: 'jumpnbump',
      family: 'libretro',
      extensions: ['dat'],
      capabilities: {
        saveStates: false,
        sram: false,
        cheats: false,
        coreOptions: false,
        multiDisc: false,
        shaders: true,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 4,
        pointer: false,
      },
    });

    this.registerCore({
      id: 'anarch',
      name: 'Anarch',
      system: 'anarch',
      family: 'libretro',
      extensions: ['anarch'],
      capabilities: {
        saveStates: false,
        sram: false,
        cheats: false,
        coreOptions: false,
        multiDisc: false,
        shaders: true,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 1,
        pointer: false,
      },
    });

    this.registerCore({
      id: 'craft',
      name: 'Minecraft (Craft)',
      system: 'craft',
      family: 'libretro',
      extensions: ['craft'],
      capabilities: {
        saveStates: false,
        sram: true,
        cheats: false,
        coreOptions: false,
        multiDisc: false,
        shaders: true,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 1,
        pointer: true,
      },
    });

    this.registerCore({
      id: 'gong',
      name: 'Gong Pong',
      system: 'gong',
      family: 'libretro',
      extensions: ['gong'],
      capabilities: {
        saveStates: false,
        sram: false,
        cheats: false,
        coreOptions: false,
        multiDisc: false,
        shaders: true,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 2,
        pointer: false,
      },
    });

    this.registerCore({
      id: '2048',
      name: '2048',
      system: '2048',
      family: 'libretro',
      extensions: ['2048'],
      capabilities: {
        saveStates: true,
        sram: true,
        cheats: false,
        coreOptions: false,
        multiDisc: false,
        shaders: true,
        rewind: true,
        variableSpeed: true,
        maxPlayers: 1,
        pointer: false,
      },
    });

    this.registerCore({
      id: 'gw',
      name: 'Game & Watch (GW)',
      system: 'gw',
      family: 'libretro',
      extensions: ['mgw'],
      capabilities: {
        saveStates: true,
        sram: true,
        cheats: false,
        coreOptions: false,
        multiDisc: false,
        shaders: true,
        rewind: true,
        variableSpeed: true,
        maxPlayers: 1,
        pointer: false,
      },
    });

    this.registerCore({
      id: 'gam4980',
      name: 'GAM4980',
      system: 'gam4980',
      family: 'libretro',
      extensions: ['gam'],
      capabilities: {
        saveStates: false,
        sram: false,
        cheats: false,
        coreOptions: false,
        multiDisc: false,
        shaders: true,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 1,
        pointer: false,
      },
    });

    this.registerCore({
      id: 'gme',
      name: 'Game Music Emu',
      system: 'gme',
      family: 'libretro',
      extensions: ['nsf', 'spc', 'gym', 'vgm', 'gbs'],
      capabilities: {
        saveStates: false,
        sram: false,
        cheats: false,
        coreOptions: true,
        multiDisc: false,
        shaders: true,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 1,
        pointer: false,
      },
    });

    this.registerCore({
      id: 'pocketcdg',
      name: 'PocketCDG',
      system: 'pocketcdg',
      family: 'libretro',
      extensions: ['cdg'],
      capabilities: {
        saveStates: false,
        sram: false,
        cheats: false,
        coreOptions: false,
        multiDisc: false,
        shaders: true,
        rewind: false,
        variableSpeed: true,
        maxPlayers: 1,
        pointer: false,
      },
    });
  }

  public static registerCore(metadata: CoreMetadata): void {
    this._cores.set(metadata.id, metadata);

    const normalizedSys = this.normalizeSystem(metadata.system);
    const existing = this._systemCores.get(normalizedSys) || [];
    if (!existing.includes(metadata.id)) {
      existing.push(metadata.id);
      this._systemCores.set(normalizedSys, existing);
    }

    for (const ext of metadata.extensions) {
      const clean = ext.toLowerCase().replace(/^\./, '');
      if (!this._extensionMap.has(clean)) {
        this._extensionMap.set(clean, metadata.id);
      }
    }
  }

  public static getCore(id: string): CoreMetadata | undefined {
    return this._cores.get(id);
  }

  public static normalizeSystem(sys: string): string {
    const s = sys.trim().toLowerCase();
    switch (s) {
      case 'ps1':
      case 'psx':
      case 'playstation':
      case 'playstation1':
      case 'sony-playstation':
        return 'psx';
      case 'ps2':
      case 'playstation2':
      case 'sony-playstation-2':
        return 'ps2';
      case 'snes':
      case 'sfc':
      case 'super-nintendo':
      case 'super-famicom':
        return 'snes';
      case 'nes':
      case 'fc':
      case 'famicom':
      case 'nintendo':
        return 'nes';
      case 'gba':
      case 'gameboy-advance':
        return 'gba';
      case 'gb':
      case 'gbc':
      case 'gameboy':
      case 'gameboy-color':
        return 'gb';
      case 'vb':
      case 'virtualboy':
      case 'virtual-boy':
        return 'virtualboy';
      case 'genesis':
      case 'megadrive':
      case 'mega-drive':
      case 'sega-cd':
      case '32x':
        return 'genesis';
      case 'sms':
      case 'mastersystem':
      case 'master-system':
      case 'gamegear':
      case 'game-gear':
      case 'gg':
      case 'sg1000':
        return 'mastersystem';
      case 'arcade':
      case 'mame':
      case 'fba':
      case 'fbneo':
      case 'cps1':
      case 'cps2':
        return 'arcade';
      case 'atari':
      case '2600':
      case 'a2600':
      case 'atari2600':
        return 'atari2600';
      case 'lynx':
      case 'atarilynx':
        return 'lynx';
      case 'pce':
      case 'tg16':
      case 'turbografx':
      case 'supergrafx':
      case 'pcecd':
        return 'pce';
      case 'c64':
      case 'commodore':
      case 'c128':
      case 'vic20':
        return 'c64';
      case '3do':
        return '3do';
      case 'coleco':
      case 'colecovision':
        return 'colecovision';
      case 'vectrex':
        return 'vectrex';
      case 'ngp':
      case 'ngpc':
      case 'neogeopocket':
        return 'ngp';
      case 'neocd':
        return 'neocd';
      case 'wswan':
      case 'wonderswan':
      case 'wsc':
        return 'wswan';
      case 'doom':
      case 'prboom':
        return 'doom';
      case 'quake':
        return 'quake';
      case 'quake2':
        return 'quake2';
      case 'wolf3d':
      case 'ecwolf':
        return 'ecwolf';
      case 'n64':
      case 'nintendo64':
        return 'n64';
      case 'pico':
      case 'pico8':
      case 'pico-8':
        return 'pico8';
      case 'psp':
      case 'playstationportable':
      case 'playstation-portable':
      case 'sony-psp':
        return 'psp';
      case '3ds':
      case 'nintendo-3ds':
      case 'n3ds':
        return '3ds';
      case 'tic80':
      case 'tic-80':
        return 'tic80';
      case 'wasm4':
      case 'wasm-4':
        return 'wasm4';
      case 'flash':
      case 'swf':
      case 'ruffle':
        return 'flash';
      case 'love':
      case 'love2d':
      case 'lovejs':
        return 'love';
      default:
        return s;
    }
  }

  public static getAllCores(): CoreMetadata[] {
    return Array.from(this._cores.values());
  }

  public static getCoresForSystem(system: string): CoreMetadata[] {
    const normalized = this.normalizeSystem(system);
    const coreIds = this._systemCores.get(normalized) || [];
    return coreIds.map((id) => this._cores.get(id)!).filter(Boolean);
  }

  public static resolveCoreFromFileName(
    fileName: string,
    systemHint?: string,
  ): CoreMetadata | undefined {
    const parts = fileName.toLowerCase().split('.');
    const ext = parts[parts.length - 1];
    let compound: string | undefined;

    if (parts.length > 2) {
      compound = `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
    }

    // If an explicit system was passed, give absolute priority to that system's cores
    if (systemHint) {
      const systemCores = this.getCoresForSystem(systemHint);
      if (systemCores.length > 0) {
        if (compound) {
          const matchCompound = systemCores.find((c) =>
            c.extensions.some(
              (e) => e.toLowerCase().replace(/^\./, '') === compound,
            ),
          );
          if (matchCompound) return matchCompound;
        }

        const matchExt = systemCores.find((c) =>
          c.extensions.some((e) => e.toLowerCase().replace(/^\./, '') === ext),
        );
        if (matchExt) return matchExt;

        // Default to the first core for that system if extension isn't uniquely recognized
        return systemCores[0];
      }
    }

    // Smart defaults for ambiguous disc images (.chd, .cue, .pbp):
    // PS1 (pcsx_rearmed) is the default target for .chd / .cue / .pbp over PS2
    if (ext === 'chd' || ext === 'cue' || ext === 'pbp') {
      const psxCore = this.getCore('pcsx_rearmed');
      if (psxCore) return psxCore;
    }

    // CSO was created specifically for the PSP ecosystem
    if (ext === 'cso') {
      const pspCore = this.getCore('ppsspp');
      if (pspCore) return pspCore;
    }

    if (compound) {
      const coreId = this._extensionMap.get(compound);
      if (coreId && this._cores.has(coreId)) {
        return this._cores.get(coreId);
      }
    }

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
