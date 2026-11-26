import type { CoreOptionDefinition } from '../core/types';

export type StaticCoreOptionDefinition = Omit<
  CoreOptionDefinition,
  'currentValue' | 'type'
>;

/**
 * Static core option definitions extracted from web.libretro.com WASM cores
 * (retro_core_option_v2_definition / retro_core_option_definition structs).
 */
export const LIBRETRO_CORE_OPTIONS: Record<
  string,
  StaticCoreOptionDefinition[]
> = {
  gambatte: [
    {
      id: 'gambatte_gb_colorization',
      label: 'gambatte_gb_colorization',
      choices: [
        {
          value: 'disabled',
          label: 'disabled',
        },
        {
          value: 'auto',
          label: 'auto',
        },
        {
          value: 'GBC',
          label: 'GBC',
        },
        {
          value: 'SGB',
          label: 'SGB',
        },
        {
          value: 'internal',
          label: 'internal',
        },
        {
          value: 'custom',
          label: 'custom',
        },
      ],
      defaultValue: 'disabled',
    },
    {
      id: 'gambatte_gb_internal_palette',
      label: 'Paleta interna',
      choices: [
        {
          value: 'GB - DMG',
          label: 'GB - DMG',
        },
        {
          value: 'GB - Pocket',
          label: 'GB - Pocket',
        },
        {
          value: 'GB - Light',
          label: 'GB - Light',
        },
        {
          value: 'GBC - Blue',
          label: 'GBC - Azul',
        },
        {
          value: 'GBC - Brown',
          label: 'GBC - Marrón',
        },
        {
          value: 'GBC - Dark Blue',
          label: 'GBC - Azul escuro',
        },
        {
          value: 'GBC - Dark Brown',
          label: 'GBC - Marrón escuro',
        },
        {
          value: 'GBC - Dark Green',
          label: 'GBC - Verde escuro',
        },
        {
          value: 'GBC - Grayscale',
          label: 'GBC - Escala de buxos',
        },
        {
          value: 'GBC - Green',
          label: 'GBC - Verde',
        },
        {
          value: 'GBC - Inverted',
          label: 'GBC - Inverted',
        },
        {
          value: 'GBC - Orange',
          label: 'GBC - Naranxa',
        },
        {
          value: 'GBC - Pastel Mix',
          label: 'GBC - Pastel Mix',
        },
        {
          value: 'GBC - Red',
          label: 'GBC - Coloráu',
        },
        {
          value: 'GBC - Yellow',
          label: 'GBC - Mariellu',
        },
        {
          value: 'SGB - 1A',
          label: 'SGB - 1A',
        },
        {
          value: 'SGB - 1B',
          label: 'SGB - 1B',
        },
        {
          value: 'SGB - 1C',
          label: 'SGB - 1C',
        },
        {
          value: 'SGB - 1D',
          label: 'SGB - 1D',
        },
        {
          value: 'SGB - 1E',
          label: 'SGB - 1E',
        },
        {
          value: 'SGB - 1F',
          label: 'SGB - 1F',
        },
        {
          value: 'SGB - 1G',
          label: 'SGB - 1G',
        },
        {
          value: 'SGB - 1H',
          label: 'SGB - 1H',
        },
        {
          value: 'SGB - 2A',
          label: 'SGB - 2A',
        },
        {
          value: 'SGB - 2B',
          label: 'SGB - 2B',
        },
        {
          value: 'SGB - 2C',
          label: 'SGB - 2C',
        },
        {
          value: 'SGB - 2D',
          label: 'SGB - 2D',
        },
        {
          value: 'SGB - 2E',
          label: 'SGB - 2E',
        },
        {
          value: 'SGB - 2F',
          label: 'SGB - 2F',
        },
        {
          value: 'SGB - 2G',
          label: 'SGB - 2G',
        },
        {
          value: 'SGB - 2H',
          label: 'SGB - 2H',
        },
        {
          value: 'SGB - 3A',
          label: 'SGB - 3A',
        },
        {
          value: 'SGB - 3B',
          label: 'SGB - 3B',
        },
        {
          value: 'SGB - 3C',
          label: 'SGB - 3C',
        },
        {
          value: 'SGB - 3D',
          label: 'SGB - 3D',
        },
        {
          value: 'SGB - 3E',
          label: 'SGB - 3E',
        },
        {
          value: 'SGB - 3F',
          label: 'SGB - 3F',
        },
        {
          value: 'SGB - 3G',
          label: 'SGB - 3G',
        },
        {
          value: 'SGB - 3H',
          label: 'SGB - 3H',
        },
        {
          value: 'SGB - 4A',
          label: 'SGB - 4A',
        },
        {
          value: 'SGB - 4B',
          label: 'SGB - 4B',
        },
        {
          value: 'SGB - 4C',
          label: 'SGB - 4C',
        },
        {
          value: 'SGB - 4D',
          label: 'SGB - 4D',
        },
        {
          value: 'SGB - 4E',
          label: 'SGB - 4E',
        },
        {
          value: 'SGB - 4F',
          label: 'SGB - 4F',
        },
        {
          value: 'SGB - 4G',
          label: 'SGB - 4G',
        },
        {
          value: 'SGB - 4H',
          label: 'SGB - 4H',
        },
        {
          value: 'Special 1',
          label: 'Especial 1',
        },
        {
          value: 'Special 2',
          label: 'Especial 2',
        },
        {
          value: 'Special 3',
          label: 'Especial 3',
        },
        {
          value: 'Special 4 (TI-83 Legacy)',
          label: 'Special 4 (TI-83 Legacy)',
        },
        {
          value: 'TWB64 - Pack 1',
          label: 'TWB64 - Paquete 1',
        },
        {
          value: 'TWB64 - Pack 2',
          label: 'TWB64 - Paquete 2',
        },
        {
          value: 'TWB64 - Pack 3',
          label: 'TWB64 - Paquete 3',
        },
        {
          value: 'PixelShift - Pack 1',
          label: 'PixelShift - Paquete 1',
        },
      ],
      defaultValue: 'GB - DMG',
    },
    {
      id: 'gambatte_gb_palette_twb64_1',
      label: 'gambatte_gb_palette_twb64_1',
      choices: [
        {
          value: 'TWB64 001 - Aqours Blue',
          label: 'TWB64 001 - Aqours Blue',
        },
        {
          value: 'TWB64 002 - Anime Expo Ver.',
          label: 'TWB64 002 - Anime Expo Ver.',
        },
        {
          value: 'TWB64 003 - SpongeBob Yellow',
          label: 'TWB64 003 - SpongeBob Yellow',
        },
        {
          value: 'TWB64 004 - Patrick Star Pink',
          label: 'TWB64 004 - Patrick Star Pink',
        },
        {
          value: 'TWB64 005 - Neon Red',
          label: 'TWB64 005 - Coloráu neón',
        },
        {
          value: 'TWB64 006 - Neon Blue',
          label: 'TWB64 006 - Azul neón',
        },
        {
          value: 'TWB64 007 - Neon Yellow',
          label: 'TWB64 007 - Mariellu neón',
        },
        {
          value: 'TWB64 008 - Neon Green',
          label: 'TWB64 008 - Verde neón',
        },
        {
          value: 'TWB64 009 - Neon Pink',
          label: 'TWB64 009 - Rosa neón',
        },
        {
          value: 'TWB64 010 - Mario Red',
          label: 'TWB64 010 - Mario Red',
        },
        {
          value: 'TWB64 011 - Nick Orange',
          label: 'TWB64 011 - Nick Orange',
        },
        {
          value: 'TWB64 012 - Virtual Vision',
          label: 'TWB64 012 - Virtual Vision',
        },
        {
          value: 'TWB64 013 - Golden Wild',
          label: 'TWB64 013 - Golden Wild',
        },
        {
          value: 'TWB64 014 - DMG-099',
          label: 'TWB64 014 - DMG-099',
        },
        {
          value: 'TWB64 015 - Classic Blurple',
          label: 'TWB64 015 - Classic Blurple',
        },
        {
          value: 'TWB64 016 - 765 Production Ver.',
          label: 'TWB64 016 - 765 Production Ver.',
        },
        {
          value: 'TWB64 017 - Superball Ivory',
          label: 'TWB64 017 - Superball Ivory',
        },
        {
          value: 'TWB64 018 - Crunchyroll Orange',
          label: 'TWB64 018 - Crunchyroll Orange',
        },
        {
          value: 'TWB64 019 - Muse Pink',
          label: 'TWB64 019 - Muse Pink',
        },
        {
          value: 'TWB64 020 - School Idol Blue',
          label: 'TWB64 020 - School Idol Blue',
        },
        {
          value: 'TWB64 021 - Gamate Ver.',
          label: 'TWB64 021 - Gamate Ver.',
        },
        {
          value: 'TWB64 022 - Greenscale Ver.',
          label: 'TWB64 022 - Greenscale Ver.',
        },
        {
          value: 'TWB64 023 - Odyssey Gold',
          label: 'TWB64 023 - Odyssey Gold',
        },
        {
          value: 'TWB64 024 - Super Saiyan God',
          label: 'TWB64 024 - Super Saiyan God',
        },
        {
          value: 'TWB64 025 - Super Saiyan Blue',
          label: 'TWB64 025 - Super Saiyan Blue',
        },
        {
          value: 'TWB64 026 - ANIMAX BLUE',
          label: 'TWB64 026 - ANIMAX BLUE',
        },
        {
          value: 'TWB64 027 - BMO Ver.',
          label: 'TWB64 027 - BMO Ver.',
        },
        {
          value: 'TWB64 028 - Game.com Ver.',
          label: 'TWB64 028 - Game.com Ver.',
        },
        {
          value: 'TWB64 029 - Sanrio Pink',
          label: 'TWB64 029 - Sanrio Pink',
        },
        {
          value: 'TWB64 030 - Timmy Turner Pink',
          label: 'TWB64 030 - Timmy Turner Pink',
        },
        {
          value: 'TWB64 031 - Fairly OddPalette',
          label: 'TWB64 031 - Fairly OddPalette',
        },
        {
          value: 'TWB64 032 - Danny Phantom Silver',
          label: 'TWB64 032 - Danny Phantom Silver',
        },
        {
          value: "TWB64 033 - Link's Awakening DX Ver.",
          label: "TWB64 033 - Link's Awakening DX Ver.",
        },
        {
          value: 'TWB64 034 - Travel Wood',
          label: 'TWB64 034 - Travel Wood',
        },
        {
          value: 'TWB64 035 - Pokemon Ver.',
          label: 'TWB64 035 - Pokemon Ver.',
        },
        {
          value: 'TWB64 036 - Game Grump Orange',
          label: 'TWB64 036 - Game Grump Orange',
        },
        {
          value: 'TWB64 037 - Scooby-Doo Mystery Ver.',
          label: 'TWB64 037 - Scooby-Doo Mystery Ver.',
        },
        {
          value: 'TWB64 038 - Pokemon mini Ver.',
          label: 'TWB64 038 - Pokemon mini Ver.',
        },
        {
          value: 'TWB64 039 - Supervision Ver.',
          label: 'TWB64 039 - Supervision Ver.',
        },
        {
          value: 'TWB64 040 - DMG Ver.',
          label: 'TWB64 040 - DMG Ver.',
        },
        {
          value: 'TWB64 041 - Pocket Ver.',
          label: 'TWB64 041 - Pocket Ver.',
        },
        {
          value: 'TWB64 042 - Light Ver.',
          label: 'TWB64 042 - Light Ver.',
        },
        {
          value: 'TWB64 043 - All Might Hero Palette',
          label: 'TWB64 043 - All Might Hero Palette',
        },
        {
          value: 'TWB64 044 - U.A. High School Uniform',
          label: 'TWB64 044 - U.A. High School Uniform',
        },
        {
          value: 'TWB64 045 - Pikachu Yellow',
          label: 'TWB64 045 - Mariellu Pikachu',
        },
        {
          value: 'TWB64 046 - Eevee Brown',
          label: 'TWB64 046 - Marrón Eevee',
        },
        {
          value: 'TWB64 047 - Microvision Ver.',
          label: 'TWB64 047 - Microvision Ver.',
        },
        {
          value: 'TWB64 048 - TI-83 Ver.',
          label: 'TWB64 048 - TI-83 Ver.',
        },
        {
          value: 'TWB64 049 - Aegis Cherry',
          label: 'TWB64 049 - Aegis Cherry',
        },
        {
          value: 'TWB64 050 - Labo Fawn',
          label: 'TWB64 050 - Labo Fawn',
        },
        {
          value: 'TWB64 051 - MILLION LIVE GOLD!',
          label: 'TWB64 051 - MILLION LIVE GOLD!',
        },
        {
          value: 'TWB64 052 - Squidward Sea Foam Green',
          label: 'TWB64 052 - Squidward Sea Foam Green',
        },
        {
          value: 'TWB64 053 - VMU Ver.',
          label: 'TWB64 053 - VMU Ver.',
        },
        {
          value: 'TWB64 054 - Game Master Ver.',
          label: 'TWB64 054 - Game Master Ver.',
        },
        {
          value: 'TWB64 055 - Android Green',
          label: 'TWB64 055 - Verde Android',
        },
        {
          value: 'TWB64 056 - Amazon Vision',
          label: 'TWB64 056 - Amazon Vision',
        },
        {
          value: 'TWB64 057 - Google Red',
          label: 'TWB64 057 - Coloráu Google',
        },
        {
          value: 'TWB64 058 - Google Blue',
          label: 'TWB64 058 - Azul Google',
        },
        {
          value: 'TWB64 059 - Google Yellow',
          label: 'TWB64 059 - Mariellu Google',
        },
        {
          value: 'TWB64 060 - Google Green',
          label: 'TWB64 060 - Verde Google',
        },
        {
          value: 'TWB64 061 - WonderSwan Ver.',
          label: 'TWB64 061 - WonderSwan Ver.',
        },
        {
          value: 'TWB64 062 - Neo Geo Pocket Ver.',
          label: 'TWB64 062 - Neo Geo Pocket Ver.',
        },
        {
          value: 'TWB64 063 - Dew Green',
          label: 'TWB64 063 - Dew Green',
        },
        {
          value: 'TWB64 064 - Coca-Cola Vision',
          label: 'TWB64 064 - Coca-Cola Vision',
        },
        {
          value: 'TWB64 065 - GameKing Ver.',
          label: 'TWB64 065 - GameKing Ver.',
        },
        {
          value: 'TWB64 066 - Do The Dew Ver.',
          label: 'TWB64 066 - Do The Dew Ver.',
        },
        {
          value: 'TWB64 067 - Digivice Ver.',
          label: 'TWB64 067 - Digivice Ver.',
        },
        {
          value: 'TWB64 068 - Bikini Bottom Ver.',
          label: 'TWB64 068 - Bikini Bottom Ver.',
        },
        {
          value: 'TWB64 069 - Blossom Pink',
          label: 'TWB64 069 - Blossom Pink',
        },
        {
          value: 'TWB64 070 - Bubbles Blue',
          label: 'TWB64 070 - Bubbles Blue',
        },
        {
          value: 'TWB64 071 - Buttercup Green',
          label: 'TWB64 071 - Buttercup Green',
        },
        {
          value: 'TWB64 072 - NASCAR Ver.',
          label: 'TWB64 072 - NASCAR Ver.',
        },
        {
          value: 'TWB64 073 - Lemon-Lime Green',
          label: 'TWB64 073 - Lemon-Lime Green',
        },
        {
          value: 'TWB64 074 - Mega Man V Ver.',
          label: 'TWB64 074 - Mega Man V Ver.',
        },
        {
          value: 'TWB64 075 - Tamagotchi Ver.',
          label: 'TWB64 075 - Tamagotchi Ver.',
        },
        {
          value: 'TWB64 076 - Phantom Red',
          label: 'TWB64 076 - Phantom Red',
        },
        {
          value: 'TWB64 077 - Halloween Ver.',
          label: 'TWB64 077 - Halloween Ver.',
        },
        {
          value: 'TWB64 078 - Christmas Ver.',
          label: 'TWB64 078 - Christmas Ver.',
        },
        {
          value: 'TWB64 079 - Cardcaptor Pink',
          label: 'TWB64 079 - Cardcaptor Pink',
        },
        {
          value: 'TWB64 080 - Pretty Guardian Gold',
          label: 'TWB64 080 - Pretty Guardian Gold',
        },
        {
          value: 'TWB64 081 - Camouflage Ver.',
          label: 'TWB64 081 - Camouflage Ver.',
        },
        {
          value: 'TWB64 082 - Legendary Super Saiyan',
          label: 'TWB64 082 - Legendary Super Saiyan',
        },
        {
          value: 'TWB64 083 - Super Saiyan Rose',
          label: 'TWB64 083 - Super Saiyan Rose',
        },
        {
          value: 'TWB64 084 - Super Saiyan',
          label: 'TWB64 084 - Super Saiyan',
        },
        {
          value: 'TWB64 085 - Perfected Ultra Instinct',
          label: 'TWB64 085 - Perfected Ultra Instinct',
        },
        {
          value: 'TWB64 086 - Saint Snow Red',
          label: 'TWB64 086 - Saint Snow Red',
        },
        {
          value: 'TWB64 087 - Yellow Banana',
          label: 'TWB64 087 - Yellow Banana',
        },
        {
          value: 'TWB64 088 - Green Banana',
          label: 'TWB64 088 - Green Banana',
        },
        {
          value: 'TWB64 089 - Super Saiyan 3',
          label: 'TWB64 089 - Super Saiyan 3',
        },
        {
          value: 'TWB64 090 - Super Saiyan Blue Evolved',
          label: 'TWB64 090 - Super Saiyan Blue Evolved',
        },
        {
          value: 'TWB64 091 - Pocket Tales Ver.',
          label: 'TWB64 091 - Pocket Tales Ver.',
        },
        {
          value: 'TWB64 092 - Investigation Yellow',
          label: 'TWB64 092 - Investigation Yellow',
        },
        {
          value: 'TWB64 093 - S.E.E.S. Blue',
          label: 'TWB64 093 - S.E.E.S. Blue',
        },
        {
          value: 'TWB64 094 - Ultra Instinct Sign',
          label: 'TWB64 094 - Ultra Instinct Sign',
        },
        {
          value: 'TWB64 095 - Hokage Orange',
          label: 'TWB64 095 - Hokage Orange',
        },
        {
          value: 'TWB64 096 - Straw Hat Red',
          label: 'TWB64 096 - Straw Hat Red',
        },
        {
          value: 'TWB64 097 - Sword Art Cyan',
          label: 'TWB64 097 - Sword Art Cyan',
        },
        {
          value: 'TWB64 098 - Deku Alpha Emerald',
          label: 'TWB64 098 - Deku Alpha Emerald',
        },
        {
          value: 'TWB64 099 - Blue Stripes Ver.',
          label: 'TWB64 099 - Blue Stripes Ver.',
        },
        {
          value: 'TWB64 100 - Precure Marble Raspberry',
          label: 'TWB64 100 - Precure Marble Raspberry',
        },
      ],
      defaultValue: 'TWB64 001 - Aqours Blue',
    },
    {
      id: 'gambatte_gb_palette_twb64_2',
      label: 'gambatte_gb_palette_twb64_2',
      choices: [
        {
          value: 'TWB64 101 - 765PRO Pink',
          label: 'TWB64 101 - Rosa 765PRO',
        },
        {
          value: 'TWB64 102 - CINDERELLA Blue',
          label: 'TWB64 102 - Azul CINDERELLA',
        },
        {
          value: 'TWB64 103 - MILLION Yellow!',
          label: 'TWB64 103 - MILLION Yellow!',
        },
        {
          value: 'TWB64 104 - SideM Green',
          label: 'TWB64 104 - Verde SideM',
        },
        {
          value: 'TWB64 105 - SHINY Sky Blue',
          label: 'TWB64 105 - SHINY Sky Blue',
        },
        {
          value: 'TWB64 106 - Angry Volcano Ver.',
          label: 'TWB64 106 - Angry Volcano Ver.',
        },
        {
          value: 'TWB64 107 - NBA Vision',
          label: 'TWB64 107 - NBA Vision',
        },
        {
          value: 'TWB64 108 - NFL Vision',
          label: 'TWB64 108 - NFL Vision',
        },
        {
          value: 'TWB64 109 - MLB Vision',
          label: 'TWB64 109 - MLB Vision',
        },
        {
          value: 'TWB64 110 - Anime Digivice Ver.',
          label: 'TWB64 110 - Anime Digivice Ver.',
        },
        {
          value: 'TWB64 111 - Aquatic Iro',
          label: 'TWB64 111 - Aquatic Iro',
        },
        {
          value: 'TWB64 112 - Tea Midori',
          label: 'TWB64 112 - Tea Midori',
        },
        {
          value: 'TWB64 113 - Sakura Pink',
          label: 'TWB64 113 - Sakura Pink',
        },
        {
          value: 'TWB64 114 - Wisteria Murasaki',
          label: 'TWB64 114 - Wisteria Murasaki',
        },
        {
          value: 'TWB64 115 - Oni Aka',
          label: 'TWB64 115 - Oni Aka',
        },
        {
          value: 'TWB64 116 - Golden Kiiro',
          label: 'TWB64 116 - Golden Kiiro',
        },
        {
          value: 'TWB64 117 - Silver Shiro',
          label: 'TWB64 117 - Silver Shiro',
        },
        {
          value: 'TWB64 118 - Fruity Orange',
          label: 'TWB64 118 - Fruity Orange',
        },
        {
          value: 'TWB64 119 - AKB48 Pink',
          label: 'TWB64 119 - Rosa AKB48',
        },
        {
          value: 'TWB64 120 - Miku Blue',
          label: 'TWB64 120 - Azul Miku',
        },
        {
          value: 'TWB64 121 - Tri Digivice Ver.',
          label: 'TWB64 121 - Tri Digivice Ver.',
        },
        {
          value: 'TWB64 122 - Survey Corps Uniform',
          label: 'TWB64 122 - Survey Corps Uniform',
        },
        {
          value: 'TWB64 123 - Island Green',
          label: 'TWB64 123 - Island Green',
        },
        {
          value: 'TWB64 124 - Nogizaka46 Purple',
          label: 'TWB64 124 - Nogizaka46 Purple',
        },
        {
          value: 'TWB64 125 - Ninja Turtle Green',
          label: 'TWB64 125 - Ninja Turtle Green',
        },
        {
          value: 'TWB64 126 - Slime Blue',
          label: 'TWB64 126 - Slime Blue',
        },
        {
          value: 'TWB64 127 - Lime Midori',
          label: 'TWB64 127 - Lime Midori',
        },
        {
          value: 'TWB64 128 - Ghostly Aoi',
          label: 'TWB64 128 - Ghostly Aoi',
        },
        {
          value: 'TWB64 129 - Retro Bogeda',
          label: 'TWB64 129 - Retro Bogeda',
        },
        {
          value: 'TWB64 130 - Royal Blue',
          label: 'TWB64 130 - Royal Blue',
        },
        {
          value: 'TWB64 131 - Neon Purple',
          label: 'TWB64 131 - Moráu neón',
        },
        {
          value: 'TWB64 132 - Neon Orange',
          label: 'TWB64 132 - Naranxa neón',
        },
        {
          value: 'TWB64 133 - Moonlight Vision',
          label: 'TWB64 133 - Moonlight Vision',
        },
        {
          value: 'TWB64 134 - Rising Sun Red',
          label: 'TWB64 134 - Rising Sun Red',
        },
        {
          value: 'TWB64 135 - Burger King Color Combo',
          label: 'TWB64 135 - Burger King Color Combo',
        },
        {
          value: 'TWB64 136 - Grand Zeno Coat',
          label: 'TWB64 136 - Grand Zeno Coat',
        },
        {
          value: 'TWB64 137 - Pac-Man Yellow',
          label: 'TWB64 137 - Mariellu Pac-Man',
        },
        {
          value: 'TWB64 138 - Irish Green',
          label: 'TWB64 138 - Verde irlandés',
        },
        {
          value: 'TWB64 139 - Goku Gi',
          label: 'TWB64 139 - Goku Gi',
        },
        {
          value: 'TWB64 140 - Dragon Ball Orange',
          label: 'TWB64 140 - Dragon Ball Orange',
        },
        {
          value: 'TWB64 141 - Christmas Gold',
          label: 'TWB64 141 - Christmas Gold',
        },
        {
          value: 'TWB64 142 - Pepsi Vision',
          label: 'TWB64 142 - Pepsi Vision',
        },
        {
          value: 'TWB64 143 - Bubblun Green',
          label: 'TWB64 143 - Bubblun Green',
        },
        {
          value: 'TWB64 144 - Bobblun Blue',
          label: 'TWB64 144 - Bobblun Blue',
        },
        {
          value: 'TWB64 145 - Baja Blast Storm',
          label: 'TWB64 145 - Baja Blast Storm',
        },
        {
          value: 'TWB64 146 - Olympic Gold',
          label: 'TWB64 146 - Olympic Gold',
        },
        {
          value: 'TWB64 147 - LisAni Orange!',
          label: 'TWB64 147 - LisAni Orange!',
        },
        {
          value: 'TWB64 148 - Liella Purple!',
          label: 'TWB64 148 - Liella Purple!',
        },
        {
          value: 'TWB64 149 - Olympic Silver',
          label: 'TWB64 149 - Olympic Silver',
        },
        {
          value: 'TWB64 150 - Olympic Bronze',
          label: 'TWB64 150 - Olympic Bronze',
        },
        {
          value: 'TWB64 151 - ANA Flight Blue',
          label: 'TWB64 151 - ANA Flight Blue',
        },
        {
          value: 'TWB64 152 - Nijigasaki Orange',
          label: 'TWB64 152 - Nijigasaki Orange',
        },
        {
          value: 'TWB64 153 - Holoblue',
          label: 'TWB64 153 - Holoblue',
        },
        {
          value: 'TWB64 154 - WWE White and Red',
          label: 'TWB64 154 - WWE White and Red',
        },
        {
          value: 'TWB64 155 - Yoshi Egg Green',
          label: 'TWB64 155 - Yoshi Egg Green',
        },
        {
          value: 'TWB64 156 - Pokedex Red',
          label: 'TWB64 156 - Coloráu Pokédex',
        },
        {
          value: 'TWB64 157 - FamilyMart Vision',
          label: 'TWB64 157 - FamilyMart Vision',
        },
        {
          value: 'TWB64 158 - Xbox Green',
          label: 'TWB64 158 - Verde Xbox',
        },
        {
          value: 'TWB64 159 - Sonic Mega Blue',
          label: 'TWB64 159 - Sonic Mega Blue',
        },
        {
          value: 'TWB64 160 - Sprite Green',
          label: 'TWB64 160 - Sprite Green',
        },
        {
          value: 'TWB64 161 - Scarlett Green',
          label: 'TWB64 161 - Scarlett Green',
        },
        {
          value: 'TWB64 162 - Glitchy Blue',
          label: 'TWB64 162 - Glitchy Blue',
        },
        {
          value: 'TWB64 163 - Classic LCD',
          label: 'TWB64 163 - Classic LCD',
        },
        {
          value: 'TWB64 164 - 3DS Virtual Console Ver.',
          label: 'TWB64 164 - 3DS Virtual Console Ver.',
        },
        {
          value: 'TWB64 165 - PocketStation Ver.',
          label: 'TWB64 165 - PocketStation Ver.',
        },
        {
          value: 'TWB64 166 - Timeless Gold and Red',
          label: 'TWB64 166 - Timeless Gold and Red',
        },
        {
          value: 'TWB64 167 - Smurfy Blue',
          label: 'TWB64 167 - Azul estrunfín',
        },
        {
          value: 'TWB64 168 - Swampy Ogre Green',
          label: 'TWB64 168 - Swampy Ogre Green',
        },
        {
          value: 'TWB64 169 - Sailor Spinach Green',
          label: 'TWB64 169 - Sailor Spinach Green',
        },
        {
          value: 'TWB64 170 - Shenron Green',
          label: 'TWB64 170 - Shenron Green',
        },
        {
          value: 'TWB64 171 - Berserk Blood',
          label: 'TWB64 171 - Berserk Blood',
        },
        {
          value: 'TWB64 172 - Super Star Pink',
          label: 'TWB64 172 - Super Star Pink',
        },
        {
          value: 'TWB64 173 - Gamebuino Classic Ver.',
          label: 'TWB64 173 - Gamebuino Classic Ver.',
        },
        {
          value: 'TWB64 174 - Barbie Pink',
          label: 'TWB64 174 - Rosa Barbie',
        },
        {
          value: 'TWB64 175 - YOASOBI AMARANTH',
          label: 'TWB64 175 - YOASOBI AMARANTH',
        },
        {
          value: 'TWB64 176 - Nokia 3310 Ver.',
          label: 'TWB64 176 - Nokia 3310 Ver.',
        },
        {
          value: 'TWB64 177 - Clover Green',
          label: 'TWB64 177 - Clover Green',
        },
        {
          value: 'TWB64 178 - Goku GT Gi',
          label: 'TWB64 178 - Goku GT Gi',
        },
        {
          value: 'TWB64 179 - Famicom Disk Yellow',
          label: 'TWB64 179 - Famicom Disk Yellow',
        },
        {
          value: 'TWB64 180 - Team Rocket Uniform',
          label: 'TWB64 180 - Team Rocket Uniform',
        },
        {
          value: 'TWB64 181 - SEIKO Timely Vision',
          label: 'TWB64 181 - SEIKO Timely Vision',
        },
        {
          value: 'TWB64 182 - PASTEL109',
          label: 'TWB64 182 - PASTEL109',
        },
        {
          value: 'TWB64 183 - Doraemon Tricolor',
          label: 'TWB64 183 - Doraemon Tricolor',
        },
        {
          value: 'TWB64 184 - Fury Blue',
          label: 'TWB64 184 - Fury Blue',
        },
        {
          value: 'TWB64 185 - GOOD SMILE VISION',
          label: 'TWB64 185 - GOOD SMILE VISION',
        },
        {
          value: 'TWB64 186 - Puyo Puyo Green',
          label: 'TWB64 186 - Puyo Puyo Green',
        },
        {
          value: 'TWB64 187 - Circle K Color Combo',
          label: 'TWB64 187 - Circle K Color Combo',
        },
        {
          value: 'TWB64 188 - Pizza Hut Red',
          label: 'TWB64 188 - Coloráu Pizza Hut',
        },
        {
          value: 'TWB64 189 - Emerald Green',
          label: 'TWB64 189 - Verde esmeralda',
        },
        {
          value: 'TWB64 190 - Grand Ivory',
          label: 'TWB64 190 - Grand Ivory',
        },
        {
          value: "TWB64 191 - Demon's Gold",
          label: "TWB64 191 - Demon's Gold",
        },
        {
          value: 'TWB64 192 - SEGA Tokyo Blue',
          label: 'TWB64 192 - Azul SEGA Tokiu',
        },
        {
          value: "TWB64 193 - Champion's Tunic",
          label: "TWB64 193 - Champion's Tunic",
        },
        {
          value: 'TWB64 194 - DK Barrel Brown',
          label: 'TWB64 194 - DK Barrel Brown',
        },
        {
          value: 'TWB64 195 - EVA-01',
          label: 'TWB64 195 - EVA-01',
        },
        {
          value: 'TWB64 196 - Wild West Vision',
          label: 'TWB64 196 - Wild West Vision',
        },
        {
          value: 'TWB64 197 - Optimus Prime Palette',
          label: 'TWB64 197 - Optimus Prime Palette',
        },
        {
          value: 'TWB64 198 - Niconico Sea Green',
          label: 'TWB64 198 - Niconico Sea Green',
        },
        {
          value: 'TWB64 199 - Duracell Copper',
          label: 'TWB64 199 - Duracell Copper',
        },
        {
          value: 'TWB64 200 - TOKYO SKYTREE CLOUDY BLUE',
          label: 'TWB64 200 - TOKYO SKYTREE CLOUDY BLUE',
        },
      ],
      defaultValue: 'TWB64 101 - 765PRO Pink',
    },
    {
      id: 'gambatte_gb_palette_twb64_3',
      label: 'gambatte_gb_palette_twb64_3',
      choices: [
        {
          value: 'TWB64 201 - DMG-GOLD',
          label: 'TWB64 201 - DMG-GOLD',
        },
        {
          value: 'TWB64 202 - LCD Clock Green',
          label: 'TWB64 202 - LCD Clock Green',
        },
        {
          value: 'TWB64 203 - Famicom Frenzy',
          label: 'TWB64 203 - Famicom Frenzy',
        },
        {
          value: 'TWB64 204 - DK Arcade Blue',
          label: 'TWB64 204 - DK Arcade Blue',
        },
        {
          value: 'TWB64 205 - Advanced Indigo',
          label: 'TWB64 205 - Advanced Indigo',
        },
        {
          value: 'TWB64 206 - Ultra Black',
          label: 'TWB64 206 - Ultra Black',
        },
        {
          value: 'TWB64 207 - Chaos Emerald Green',
          label: 'TWB64 207 - Chaos Emerald Green',
        },
        {
          value: 'TWB64 208 - Blue Bomber Vision',
          label: 'TWB64 208 - Blue Bomber Vision',
        },
        {
          value: 'TWB64 209 - Krispy Kreme Vision',
          label: 'TWB64 209 - Krispy Kreme Vision',
        },
        {
          value: 'TWB64 210 - Steam Gray',
          label: 'TWB64 210 - Steam Gray',
        },
        {
          value: 'TWB64 211 - Dream Land GB Ver.',
          label: 'TWB64 211 - Dream Land GB Ver.',
        },
        {
          value: 'TWB64 212 - Pokemon Pinball Ver.',
          label: 'TWB64 212 - Pokemon Pinball Ver.',
        },
        {
          value: 'TWB64 213 - Poketch Ver.',
          label: 'TWB64 213 - Poketch Ver.',
        },
        {
          value: 'TWB64 214 - COLLECTION of SaGa Ver.',
          label: 'TWB64 214 - COLLECTION of SaGa Ver.',
        },
        {
          value: 'TWB64 215 - Rocky-Valley Holiday',
          label: 'TWB64 215 - Rocky-Valley Holiday',
        },
        {
          value: 'TWB64 216 - Giga Kiwi DMG',
          label: 'TWB64 216 - Giga Kiwi DMG',
        },
        {
          value: 'TWB64 217 - DMG Pea Green',
          label: 'TWB64 217 - DMG Pea Green',
        },
        {
          value: 'TWB64 218 - Timing Hero Ver.',
          label: 'TWB64 218 - Timing Hero Ver.',
        },
        {
          value: 'TWB64 219 - Invincible Yellow and Blue',
          label: 'TWB64 219 - Invincible Yellow and Blue',
        },
        {
          value: 'TWB64 220 - Grinchy Green',
          label: 'TWB64 220 - Grinchy Green',
        },
        {
          value: 'TWB64 221 - Animate Vision',
          label: 'TWB64 221 - Animate Vision',
        },
        {
          value: 'TWB64 222 - School Idol Mix',
          label: 'TWB64 222 - School Idol Mix',
        },
        {
          value: 'TWB64 223 - Green Awakening',
          label: 'TWB64 223 - Green Awakening',
        },
        {
          value: 'TWB64 224 - Goomba Brown',
          label: 'TWB64 224 - Goomba Brown',
        },
        {
          value: 'TWB64 225 - WarioWare MicroBlue',
          label: 'TWB64 225 - WarioWare MicroBlue',
        },
        {
          value: 'TWB64 226 - KonoSuba Sherbet',
          label: 'TWB64 226 - KonoSuba Sherbet',
        },
        {
          value: 'TWB64 227 - Spooky Purple',
          label: 'TWB64 227 - Spooky Purple',
        },
        {
          value: 'TWB64 228 - Treasure Gold',
          label: 'TWB64 228 - Treasure Gold',
        },
        {
          value: 'TWB64 229 - Cherry Blossom Pink',
          label: 'TWB64 229 - Cherry Blossom Pink',
        },
        {
          value: 'TWB64 230 - Golden Trophy',
          label: "TWB64 230 - Troféu d'oru",
        },
        {
          value: 'TWB64 231 - Glacial Winter Blue',
          label: 'TWB64 231 - Glacial Winter Blue',
        },
        {
          value: 'TWB64 232 - Leprechaun Green',
          label: 'TWB64 232 - Leprechaun Green',
        },
        {
          value: 'TWB64 233 - SAITAMA SUPER BLUE',
          label: 'TWB64 233 - SAITAMA SUPER BLUE',
        },
        {
          value: 'TWB64 234 - SAITAMA SUPER GREEN',
          label: 'TWB64 234 - SAITAMA SUPER GREEN',
        },
        {
          value: 'TWB64 235 - Duolingo Green',
          label: 'TWB64 235 - Duolingo Green',
        },
        {
          value: 'TWB64 236 - Super Mushroom Vision',
          label: 'TWB64 236 - Super Mushroom Vision',
        },
        {
          value: 'TWB64 237 - Ancient Hisuian Brown',
          label: 'TWB64 237 - Ancient Hisuian Brown',
        },
        {
          value: 'TWB64 238 - Sky Pop Ivory',
          label: 'TWB64 238 - Sky Pop Ivory',
        },
        {
          value: 'TWB64 239 - LAWSON BLUE',
          label: 'TWB64 239 - LAWSON BLUE',
        },
        {
          value: 'TWB64 240 - Anime Expo Red',
          label: 'TWB64 240 - Anime Expo Red',
        },
        {
          value: 'TWB64 241 - Brilliant Diamond Blue',
          label: 'TWB64 241 - Brilliant Diamond Blue',
        },
        {
          value: 'TWB64 242 - Shining Pearl Pink',
          label: 'TWB64 242 - Shining Pearl Pink',
        },
        {
          value: 'TWB64 243 - Funimation Melon',
          label: 'TWB64 243 - Funimation Melon',
        },
        {
          value: 'TWB64 244 - Teyvat Brown',
          label: 'TWB64 244 - Teyvat Brown',
        },
        {
          value: 'TWB64 245 - Chozo Blue',
          label: 'TWB64 245 - Chozo Blue',
        },
        {
          value: 'TWB64 246 - Spotify Green',
          label: 'TWB64 246 - Verde Spotify',
        },
        {
          value: 'TWB64 247 - Dr Pepper Red',
          label: 'TWB64 247 - Dr Pepper Red',
        },
        {
          value: 'TWB64 248 - NHK Silver Gray',
          label: 'TWB64 248 - NHK Silver Gray',
        },
        {
          value: "TWB64 249 - Dunkin' Vision",
          label: "TWB64 249 - Dunkin' Vision",
        },
        {
          value: 'TWB64 250 - Deku Gamma Palette',
          label: 'TWB64 250 - Deku Gamma Palette',
        },
        {
          value: 'TWB64 251 - Universal Studios Blue',
          label: 'TWB64 251 - Universal Studios Blue',
        },
        {
          value: 'TWB64 252 - Hogwarts Goldius',
          label: 'TWB64 252 - Hogwarts Goldius',
        },
        {
          value: 'TWB64 253 - Kentucky Fried Red',
          label: 'TWB64 253 - Kentucky Fried Red',
        },
        {
          value: 'TWB64 254 - Cheeto Orange',
          label: 'TWB64 254 - Cheeto Orange',
        },
        {
          value: 'TWB64 255 - Namco Idol Pink',
          label: 'TWB64 255 - Namco Idol Pink',
        },
        {
          value: "TWB64 256 - Domino's Pizza Vision",
          label: "TWB64 256 - Domino's Pizza Vision",
        },
        {
          value: 'TWB64 257 - Pac-Man Vision',
          label: 'TWB64 257 - Pac-Man Vision',
        },
        {
          value: "TWB64 258 - Bill's PC Screen",
          label: "TWB64 258 - Bill's PC Screen",
        },
        {
          value: 'TWB64 259 - Ebott Prolouge',
          label: 'TWB64 259 - Ebott Prolouge',
        },
        {
          value: "TWB64 260 - Fool's Gold and Silver",
          label: "TWB64 260 - Fool's Gold and Silver",
        },
        {
          value: 'TWB64 261 - UTA VISION',
          label: 'TWB64 261 - UTA VISION',
        },
        {
          value: 'TWB64 262 - Metallic Paldea Brass',
          label: 'TWB64 262 - Metallic Paldea Brass',
        },
        {
          value: 'TWB64 263 - Classy Christmas',
          label: 'TWB64 263 - Classy Christmas',
        },
        {
          value: 'TWB64 264 - Winter Christmas',
          label: 'TWB64 264 - Winter Christmas',
        },
        {
          value: 'TWB64 265 - IDOL WORLD TRICOLOR!!!',
          label: 'TWB64 265 - IDOL WORLD TRICOLOR!!!',
        },
        {
          value: 'TWB64 266 - Inkling Tricolor',
          label: 'TWB64 266 - Inkling Tricolor',
        },
        {
          value: 'TWB64 267 - 7-Eleven Color Combo',
          label: 'TWB64 267 - 7-Eleven Color Combo',
        },
        {
          value: 'TWB64 268 - PAC-PALETTE',
          label: 'TWB64 268 - PAC-PALETTE',
        },
        {
          value: 'TWB64 269 - Vulnerable Blue',
          label: 'TWB64 269 - Vulnerable Blue',
        },
        {
          value: 'TWB64 270 - Nightvision Green',
          label: 'TWB64 270 - Nightvision Green',
        },
        {
          value: 'TWB64 271 - Bandai Namco Tricolor',
          label: 'TWB64 271 - Bandai Namco Tricolor',
        },
        {
          value: 'TWB64 272 - Gold, Silver, and Bronze',
          label: 'TWB64 272 - Gold, Silver, and Bronze',
        },
        {
          value: 'TWB64 273 - Deku Vigilante Palette',
          label: 'TWB64 273 - Deku Vigilante Palette',
        },
        {
          value: 'TWB64 274 - Super Famicom Supreme',
          label: 'TWB64 274 - Super Famicom Supreme',
        },
        {
          value: 'TWB64 275 - Absorbent and Yellow',
          label: 'TWB64 275 - Absorbent and Yellow',
        },
        {
          value: 'TWB64 276 - 765PRO TRICOLOR',
          label: 'TWB64 276 - 765PRO TRICOLOR',
        },
        {
          value: 'TWB64 277 - GameCube Glimmer',
          label: 'TWB64 277 - GameCube Glimmer',
        },
        {
          value: 'TWB64 278 - 1st Vision Pastel',
          label: 'TWB64 278 - 1st Vision Pastel',
        },
        {
          value: 'TWB64 279 - Perfect Majin Emperor',
          label: 'TWB64 279 - Perfect Majin Emperor',
        },
        {
          value: 'TWB64 280 - J-Pop Idol Sherbet',
          label: 'TWB64 280 - J-Pop Idol Sherbet',
        },
        {
          value: 'TWB64 281 - Ryuuguu Sunset',
          label: 'TWB64 281 - Ryuuguu Sunset',
        },
        {
          value: 'TWB64 282 - Tropical Starfall',
          label: 'TWB64 282 - Tropical Starfall',
        },
        {
          value: 'TWB64 283 - Colorful Horizons',
          label: 'TWB64 283 - Colorful Horizons',
        },
        {
          value: 'TWB64 284 - BLACKPINK BLINK PINK',
          label: 'TWB64 284 - BLACKPINK BLINK PINK',
        },
        {
          value: 'TWB64 285 - DMG-SWITCH',
          label: 'TWB64 285 - DMG-SWITCH',
        },
        {
          value: 'TWB64 286 - POCKET SWITCH',
          label: 'TWB64 286 - POCKET SWITCH',
        },
        {
          value: 'TWB64 287 - Sunny Passion Paradise',
          label: 'TWB64 287 - Sunny Passion Paradise',
        },
        {
          value: 'TWB64 288 - Saiyan Beast Silver',
          label: 'TWB64 288 - Saiyan Beast Silver',
        },
        {
          value: 'TWB64 289 - RADIANT SMILE RAMP',
          label: 'TWB64 289 - RADIANT SMILE RAMP',
        },
        {
          value: 'TWB64 290 - A-RISE BLUE',
          label: 'TWB64 290 - A-RISE BLUE',
        },
        {
          value: 'TWB64 291 - TROPICAL TWICE APRICOT',
          label: 'TWB64 291 - TROPICAL TWICE APRICOT',
        },
        {
          value: 'TWB64 292 - Odyssey Boy',
          label: 'TWB64 292 - Odyssey Boy',
        },
        {
          value: 'TWB64 293 - Frog Coin Green',
          label: 'TWB64 293 - Frog Coin Green',
        },
        {
          value: 'TWB64 294 - Garfield Vision',
          label: 'TWB64 294 - Garfield Vision',
        },
        {
          value: 'TWB64 295 - Bedrock Caveman Vision',
          label: 'TWB64 295 - Bedrock Caveman Vision',
        },
        {
          value: 'TWB64 296 - BANGTAN ARMY PURPLE',
          label: 'TWB64 296 - BANGTAN ARMY PURPLE',
        },
        {
          value: 'TWB64 297 - LE SSERAFIM FEARLESS BLUE',
          label: 'TWB64 297 - LE SSERAFIM FEARLESS BLUE',
        },
        {
          value: 'TWB64 298 - Baja Blast Beach',
          label: 'TWB64 298 - Baja Blast Beach',
        },
        {
          value: 'TWB64 299 - 3DS Virtual Console Green',
          label: 'TWB64 299 - 3DS Virtual Console Green',
        },
        {
          value: 'TWB64 300 - Wonder Purple',
          label: 'TWB64 300 - Wonder Purple',
        },
      ],
      defaultValue: 'TWB64 201 - DMG-GOLD',
    },
    {
      id: 'gambatte_gb_palette_pixelshift_1',
      label: 'gambatte_gb_palette_pixelshift_1',
      choices: [
        {
          value: 'PixelShift 01 - Arctic Green',
          label: 'PixelShift 01 - Arctic Green',
        },
        {
          value: 'PixelShift 02 - Arduboy',
          label: 'PixelShift 02 - Arduboy',
        },
        {
          value: 'PixelShift 03 - BGB 0.3 Emulator',
          label: 'PixelShift 03 - BGB 0.3 Emulator',
        },
        {
          value: 'PixelShift 04 - Camouflage',
          label: 'PixelShift 04 - Camouflage',
        },
        {
          value: 'PixelShift 05 - Chocolate Bar',
          label: 'PixelShift 05 - Chocolate Bar',
        },
        {
          value: 'PixelShift 06 - CMYK',
          label: 'PixelShift 06 - CMYK',
        },
        {
          value: 'PixelShift 07 - Cotton Candy',
          label: 'PixelShift 07 - Cotton Candy',
        },
        {
          value: 'PixelShift 08 - Easy Greens',
          label: 'PixelShift 08 - Easy Greens',
        },
        {
          value: 'PixelShift 09 - Gamate',
          label: 'PixelShift 09 - Gamate',
        },
        {
          value: 'PixelShift 10 - Game Boy Light',
          label: 'PixelShift 10 - Game Boy Light',
        },
        {
          value: 'PixelShift 11 - Game Boy Pocket',
          label: 'PixelShift 11 - Game Boy Pocket',
        },
        {
          value: 'PixelShift 12 - Game Boy Pocket Alt',
          label: 'PixelShift 12 - Game Boy Pocket Alt',
        },
        {
          value: 'PixelShift 13 - Game Pocket Computer',
          label: 'PixelShift 13 - Game Pocket Computer',
        },
        {
          value: 'PixelShift 14 - Game & Watch Ball',
          label: 'PixelShift 14 - Game & Watch Ball',
        },
        {
          value: 'PixelShift 15 - GB Backlight Blue',
          label: 'PixelShift 15 - GB Backlight Blue',
        },
        {
          value: 'PixelShift 16 - GB Backlight Faded',
          label: 'PixelShift 16 - GB Backlight Faded',
        },
        {
          value: 'PixelShift 17 - GB Backlight Orange',
          label: 'PixelShift 17 - GB Backlight Orange',
        },
        {
          value: 'PixelShift 18 - GB Backlight White ',
          label: 'PixelShift 18 - GB Backlight White ',
        },
        {
          value: 'PixelShift 19 - GB Backlight Yellow Dark',
          label: 'PixelShift 19 - GB Backlight Yellow Dark',
        },
        {
          value: 'PixelShift 20 - GB Bootleg',
          label: 'PixelShift 20 - GB Bootleg',
        },
        {
          value: 'PixelShift 21 - GB Hunter',
          label: 'PixelShift 21 - GB Hunter',
        },
        {
          value: 'PixelShift 22 - GB Kiosk',
          label: 'PixelShift 22 - GB Kiosk',
        },
        {
          value: 'PixelShift 23 - GB Kiosk 2',
          label: 'PixelShift 23 - GB Kiosk 2',
        },
        {
          value: 'PixelShift 24 - GB New',
          label: 'PixelShift 24 - GB New',
        },
        {
          value: 'PixelShift 25 - GB Nuked',
          label: 'PixelShift 25 - GB Nuked',
        },
        {
          value: 'PixelShift 26 - GB Old',
          label: 'PixelShift 26 - GB Old',
        },
        {
          value: 'PixelShift 27 - GBP Bivert',
          label: 'PixelShift 27 - GBP Bivert',
        },
        {
          value: 'PixelShift 28 - GB Washed Yellow Backlight',
          label: 'PixelShift 28 - GB Washed Yellow Backlight',
        },
        {
          value: 'PixelShift 29 - Ghost',
          label: 'PixelShift 29 - Ghost',
        },
        {
          value: 'PixelShift 30 - Glow In The Dark',
          label: 'PixelShift 30 - Glow In The Dark',
        },
        {
          value: 'PixelShift 31 - Gold Bar',
          label: 'PixelShift 31 - Gold Bar',
        },
        {
          value: 'PixelShift 32 - Grapefruit',
          label: 'PixelShift 32 - Grapefruit',
        },
        {
          value: 'PixelShift 33 - Gray Green Mix',
          label: 'PixelShift 33 - Gray Green Mix',
        },
        {
          value: 'PixelShift 34 - Missingno',
          label: 'PixelShift 34 - Missingno',
        },
        {
          value: 'PixelShift 35 - MS-Dos',
          label: 'PixelShift 35 - MS-DOS',
        },
        {
          value: 'PixelShift 36 - Newspaper',
          label: 'PixelShift 36 - Newspaper',
        },
        {
          value: 'PixelShift 37 - Pip-Boy',
          label: 'PixelShift 37 - Pip-Boy',
        },
        {
          value: 'PixelShift 38 - Pocket Girl',
          label: 'PixelShift 38 - Pocket Girl',
        },
        {
          value: 'PixelShift 39 - Silhouette',
          label: 'PixelShift 39 - Silhouette',
        },
        {
          value: 'PixelShift 40 - Sunburst',
          label: 'PixelShift 40 - Sunburst',
        },
        {
          value: 'PixelShift 41 - Technicolor',
          label: 'PixelShift 41 - Technicolor',
        },
        {
          value: 'PixelShift 42 - Tron',
          label: 'PixelShift 42 - Tron',
        },
        {
          value: 'PixelShift 43 - Vaporwave',
          label: 'PixelShift 43 - Vaporwave',
        },
        {
          value: 'PixelShift 44 - Virtual Boy',
          label: 'PixelShift 44 - Virtual Boy',
        },
        {
          value: 'PixelShift 45 - Wish',
          label: 'PixelShift 45 - Wish',
        },
      ],
      defaultValue: 'PixelShift 01 - Arctic Green',
    },
    {
      id: 'gambatte_gbc_color_correction',
      label: 'gambatte_gbc_color_correction',
      choices: [
        {
          value: 'GBC only',
          label: 'GBC only',
        },
        {
          value: 'always',
          label: 'Siempre',
        },
        {
          value: 'disabled',
          label: 'disabled',
        },
      ],
      defaultValue: 'GBC only',
    },
    {
      id: 'gambatte_gbc_color_correction_mode',
      label: 'gambatte_gbc_color_correction_mode',
      choices: [
        {
          value: 'accurate',
          label: 'accurate',
        },
        {
          value: 'fast',
          label: 'fast',
        },
      ],
      defaultValue: 'accurate',
    },
    {
      id: 'gambatte_gbc_frontlight_position',
      label: 'gambatte_gbc_frontlight_position',
      choices: [
        {
          value: 'central',
          label: 'central',
        },
        {
          value: 'above screen',
          label: 'above screen',
        },
        {
          value: 'below screen',
          label: 'below screen',
        },
      ],
      defaultValue: 'central',
    },
    {
      id: 'gambatte_dark_filter_level',
      label: 'gambatte_dark_filter_level',
      choices: [
        {
          value: '0',
          label: '0',
        },
        {
          value: '5',
          label: '5',
        },
        {
          value: '10',
          label: '10',
        },
        {
          value: '15',
          label: '15',
        },
        {
          value: '20',
          label: '20',
        },
        {
          value: '25',
          label: '25',
        },
        {
          value: '30',
          label: '30',
        },
        {
          value: '35',
          label: '35',
        },
        {
          value: '40',
          label: '40',
        },
        {
          value: '45',
          label: '45',
        },
        {
          value: '50',
          label: '50',
        },
      ],
      defaultValue: '0',
    },
    {
      id: 'gambatte_mix_frames',
      label: 'gambatte_mix_frames',
      choices: [
        {
          value: 'disabled',
          label: 'disabled',
        },
        {
          value: 'mix',
          label: 'mix',
        },
        {
          value: 'lcd_ghosting',
          label: 'lcd_ghosting',
        },
        {
          value: 'lcd_ghosting_fast',
          label: 'lcd_ghosting_fast',
        },
      ],
      defaultValue: 'disabled',
    },
    {
      id: 'gambatte_audio_resampler',
      label: 'gambatte_audio_resampler',
      choices: [
        {
          value: 'sinc',
          label: 'sinc',
        },
        {
          value: 'cc',
          label: 'cc',
        },
      ],
      defaultValue: 'sinc',
    },
    {
      id: 'gambatte_gb_hwmode',
      label: 'gambatte_gb_hwmode',
      choices: [
        {
          value: 'Auto',
          label: 'Auto',
        },
        {
          value: 'GB',
          label: 'GB',
        },
        {
          value: 'GBC',
          label: 'GBC',
        },
        {
          value: 'GBA',
          label: 'GBA',
        },
      ],
      defaultValue: 'Auto',
    },
    {
      id: 'gambatte_gb_bootloader',
      label: "Usar el cargador d'arrinque oficial (ye obligatorio reaniciar)",
      description:
        "Activa la compatibilidá colos xestores d'arrinque de Game Boy ya Game Boy Color xunto colos sos logos animaos del aniciu.",
      choices: [
        {
          value: 'enabled',
          label: 'enabled',
        },
        {
          value: 'disabled',
          label: 'disabled',
        },
      ],
      defaultValue: 'enabled',
    },
    {
      id: 'gambatte_up_down_allowed',
      label: 'Permitir les direiciones opuestes',
      choices: [
        {
          value: 'disabled',
          label: 'disabled',
        },
        {
          value: 'enabled',
          label: 'enabled',
        },
      ],
      defaultValue: 'disabled',
    },
    {
      id: 'gambatte_turbo_period',
      label: 'gambatte_turbo_period',
      choices: [
        {
          value: '4',
          label: '4',
        },
        {
          value: '5',
          label: '5',
        },
        {
          value: '6',
          label: '6',
        },
        {
          value: '7',
          label: '7',
        },
        {
          value: '8',
          label: '8',
        },
        {
          value: '9',
          label: '9',
        },
        {
          value: '10',
          label: '10',
        },
        {
          value: '11',
          label: '11',
        },
        {
          value: '12',
          label: '12',
        },
        {
          value: '13',
          label: '13',
        },
        {
          value: '14',
          label: '14',
        },
        {
          value: '15',
          label: '15',
        },
        {
          value: '16',
          label: '16',
        },
        {
          value: '17',
          label: '17',
        },
        {
          value: '18',
          label: '18',
        },
        {
          value: '19',
          label: '19',
        },
        {
          value: '20',
          label: '20',
        },
        {
          value: '21',
          label: '21',
        },
        {
          value: '22',
          label: '22',
        },
        {
          value: '23',
          label: '23',
        },
        {
          value: '24',
          label: '24',
        },
        {
          value: '25',
          label: '25',
        },
        {
          value: '26',
          label: '26',
        },
        {
          value: '27',
          label: '27',
        },
        {
          value: '28',
          label: '28',
        },
        {
          value: '29',
          label: '29',
        },
        {
          value: '30',
          label: '30',
        },
        {
          value: '31',
          label: '31',
        },
        {
          value: '32',
          label: '32',
        },
        {
          value: '33',
          label: '33',
        },
        {
          value: '34',
          label: '34',
        },
        {
          value: '35',
          label: '35',
        },
        {
          value: '36',
          label: '36',
        },
        {
          value: '37',
          label: '37',
        },
        {
          value: '38',
          label: '38',
        },
        {
          value: '39',
          label: '39',
        },
        {
          value: '40',
          label: '40',
        },
        {
          value: '41',
          label: '41',
        },
        {
          value: '42',
          label: '42',
        },
        {
          value: '43',
          label: '43',
        },
        {
          value: '44',
          label: '44',
        },
        {
          value: '45',
          label: '45',
        },
        {
          value: '46',
          label: '46',
        },
        {
          value: '47',
          label: '47',
        },
        {
          value: '48',
          label: '48',
        },
        {
          value: '49',
          label: '49',
        },
        {
          value: '50',
          label: '50',
        },
        {
          value: '51',
          label: '51',
        },
        {
          value: '52',
          label: '52',
        },
        {
          value: '53',
          label: '53',
        },
        {
          value: '54',
          label: '54',
        },
        {
          value: '55',
          label: '55',
        },
        {
          value: '56',
          label: '56',
        },
        {
          value: '57',
          label: '57',
        },
        {
          value: '58',
          label: '58',
        },
        {
          value: '59',
          label: '59',
        },
        {
          value: '60',
          label: '60',
        },
        {
          value: '61',
          label: '61',
        },
        {
          value: '62',
          label: '62',
        },
        {
          value: '63',
          label: '63',
        },
        {
          value: '64',
          label: '64',
        },
        {
          value: '65',
          label: '65',
        },
        {
          value: '66',
          label: '66',
        },
        {
          value: '67',
          label: '67',
        },
        {
          value: '68',
          label: '68',
        },
        {
          value: '69',
          label: '69',
        },
        {
          value: '70',
          label: '70',
        },
        {
          value: '71',
          label: '71',
        },
        {
          value: '72',
          label: '72',
        },
        {
          value: '73',
          label: '73',
        },
        {
          value: '74',
          label: '74',
        },
        {
          value: '75',
          label: '75',
        },
        {
          value: '76',
          label: '76',
        },
        {
          value: '77',
          label: '77',
        },
        {
          value: '78',
          label: '78',
        },
        {
          value: '79',
          label: '79',
        },
        {
          value: '80',
          label: '80',
        },
        {
          value: '81',
          label: '81',
        },
        {
          value: '82',
          label: '82',
        },
        {
          value: '83',
          label: '83',
        },
        {
          value: '84',
          label: '84',
        },
        {
          value: '85',
          label: '85',
        },
        {
          value: '86',
          label: '86',
        },
        {
          value: '87',
          label: '87',
        },
        {
          value: '88',
          label: '88',
        },
        {
          value: '89',
          label: '89',
        },
        {
          value: '90',
          label: '90',
        },
        {
          value: '91',
          label: '91',
        },
        {
          value: '92',
          label: '92',
        },
        {
          value: '93',
          label: '93',
        },
        {
          value: '94',
          label: '94',
        },
        {
          value: '95',
          label: '95',
        },
        {
          value: '96',
          label: '96',
        },
        {
          value: '97',
          label: '97',
        },
        {
          value: '98',
          label: '98',
        },
        {
          value: '99',
          label: '99',
        },
        {
          value: '100',
          label: '100',
        },
        {
          value: '101',
          label: '101',
        },
        {
          value: '102',
          label: '102',
        },
        {
          value: '103',
          label: '103',
        },
        {
          value: '104',
          label: '104',
        },
        {
          value: '105',
          label: '105',
        },
        {
          value: '106',
          label: '106',
        },
        {
          value: '107',
          label: '107',
        },
        {
          value: '108',
          label: '108',
        },
        {
          value: '109',
          label: '109',
        },
        {
          value: '110',
          label: '110',
        },
        {
          value: '111',
          label: '111',
        },
        {
          value: '112',
          label: '112',
        },
        {
          value: '113',
          label: '113',
        },
        {
          value: '114',
          label: '114',
        },
        {
          value: '115',
          label: '115',
        },
        {
          value: '116',
          label: '116',
        },
        {
          value: '117',
          label: '117',
        },
        {
          value: '118',
          label: '118',
        },
        {
          value: '119',
          label: '119',
        },
        {
          value: '120',
          label: '120',
        },
      ],
      defaultValue: '4',
    },
    {
      id: 'gambatte_rumble_level',
      label: 'Fuercia del vibrador del mandu',
      choices: [
        {
          value: '0',
          label: '0',
        },
        {
          value: '1',
          label: '1',
        },
        {
          value: '2',
          label: '2',
        },
        {
          value: '3',
          label: '3',
        },
        {
          value: '4',
          label: '4',
        },
        {
          value: '5',
          label: '5',
        },
        {
          value: '6',
          label: '6',
        },
        {
          value: '7',
          label: '7',
        },
        {
          value: '8',
          label: '8',
        },
        {
          value: '9',
          label: '9',
        },
        {
          value: '10',
          label: '10',
        },
      ],
      defaultValue: '10',
    },
  ],
  mgba: [
    {
      id: 'mgba_gb_model',
      label: 'mgba_gb_model',
      category: 'system',
      choices: [
        {
          value: 'Autodetect',
          label: 'Autodetect',
        },
        {
          value: 'Game Boy',
          label: 'Game Boy',
        },
        {
          value: 'Super Game Boy',
          label: 'Super Game Boy',
        },
        {
          value: 'Game Boy Color',
          label: 'Game Boy Color',
        },
        {
          value: 'Game Boy Advance',
          label: 'Game Boy Advance',
        },
      ],
      defaultValue: 'Autodetect',
    },
    {
      id: 'mgba_use_bios',
      label: 'mgba_use_bios',
      category: 'system',
      choices: [
        {
          value: 'ON',
          label: 'enabled',
        },
        {
          value: 'OFF',
          label: 'disabled',
        },
      ],
      defaultValue: 'ON',
    },
    {
      id: 'mgba_skip_bios',
      label: 'mgba_skip_bios',
      category: 'system',
      choices: [
        {
          value: 'OFF',
          label: 'disabled',
        },
        {
          value: 'ON',
          label: 'enabled',
        },
      ],
      defaultValue: 'OFF',
    },
    {
      id: 'mgba_gb_colors',
      label: 'mgba_gb_colors',
      category: 'video',
      choices: [
        {
          value: 'Grayscale',
          label: 'Grayscale',
        },
      ],
      defaultValue: 'Grayscale',
    },
    {
      id: 'mgba_gb_colors_preset',
      label: 'mgba_gb_colors_preset',
      description:
        'Usa les paletes de los xuegos de Game Boy que tengan preaxustes en Game Boy Color o Super Game Boy.',
      category: 'video',
      choices: [
        {
          value: '0',
          label: '0',
        },
        {
          value: '1',
          label: 'Namás preaxustes de Game Boy Color',
        },
        {
          value: '2',
          label: 'Namás preaxustes de Super Game Boy',
        },
        {
          value: '3',
          label: 'Cualesquier preaxuste disponible',
        },
      ],
      defaultValue: '0',
    },
    {
      id: 'mgba_sgb_borders',
      label: 'mgba_sgb_borders',
      category: 'video',
      choices: [
        {
          value: 'ON',
          label: 'enabled',
        },
        {
          value: 'OFF',
          label: 'disabled',
        },
      ],
      defaultValue: 'ON',
    },
    {
      id: 'mgba_color_correction',
      label: 'mgba_color_correction',
      category: 'video',
      choices: [
        {
          value: 'OFF',
          label: 'disabled',
        },
        {
          value: 'GBA',
          label: 'GBA',
        },
        {
          value: 'GBC',
          label: 'GBC',
        },
        {
          value: 'Auto',
          label: 'Auto',
        },
      ],
      defaultValue: 'OFF',
    },
    {
      id: 'mgba_interframe_blending',
      label: 'mgba_interframe_blending',
      category: 'video',
      choices: [
        {
          value: 'OFF',
          label: 'disabled',
        },
        {
          value: 'mix',
          label: 'mix',
        },
        {
          value: 'mix_smart',
          label: 'mix_smart',
        },
        {
          value: 'lcd_ghosting',
          label: 'lcd_ghosting',
        },
        {
          value: 'lcd_ghosting_fast',
          label: 'lcd_ghosting_fast',
        },
      ],
      defaultValue: 'OFF',
    },
    {
      id: 'mgba_audio_low_pass_filter',
      label: 'mgba_audio_low_pass_filter',
      category: 'audio',
      choices: [
        {
          value: 'disabled',
          label: 'disabled',
        },
        {
          value: 'enabled',
          label: 'enabled',
        },
      ],
      defaultValue: 'disabled',
    },
    {
      id: 'mgba_audio_low_pass_range',
      label: 'mgba_audio_low_pass_range',
      category: 'audio',
      choices: [
        {
          value: '5',
          label: '5',
        },
        {
          value: '10',
          label: '10',
        },
        {
          value: '15',
          label: '15',
        },
        {
          value: '20',
          label: '20',
        },
        {
          value: '25',
          label: '25',
        },
        {
          value: '30',
          label: '30',
        },
        {
          value: '35',
          label: '35',
        },
        {
          value: '40',
          label: '40',
        },
        {
          value: '45',
          label: '45',
        },
        {
          value: '50',
          label: '50',
        },
        {
          value: '55',
          label: '55',
        },
        {
          value: '60',
          label: '60',
        },
        {
          value: '65',
          label: '65',
        },
        {
          value: '70',
          label: '70',
        },
        {
          value: '75',
          label: '75',
        },
        {
          value: '80',
          label: '80',
        },
        {
          value: '85',
          label: '85',
        },
        {
          value: '90',
          label: '90',
        },
        {
          value: '95',
          label: '95',
        },
      ],
      defaultValue: '60',
    },
    {
      id: 'mgba_allow_opposing_directions',
      label: 'mgba_allow_opposing_directions',
      category: 'input',
      choices: [
        {
          value: 'no',
          label: 'disabled',
        },
        {
          value: 'yes',
          label: 'enabled',
        },
      ],
      defaultValue: 'no',
    },
    {
      id: 'mgba_solar_sensor_level',
      label: 'Nivel del sensor solar',
      category: 'input',
      choices: [
        {
          value: 'sensor',
          label: 'sensor',
        },
        {
          value: '0',
          label: '0',
        },
        {
          value: '1',
          label: '1',
        },
        {
          value: '2',
          label: '2',
        },
        {
          value: '3',
          label: '3',
        },
        {
          value: '4',
          label: '4',
        },
        {
          value: '5',
          label: '5',
        },
        {
          value: '6',
          label: '6',
        },
        {
          value: '7',
          label: '7',
        },
        {
          value: '8',
          label: '8',
        },
        {
          value: '9',
          label: '9',
        },
        {
          value: '10',
          label: '10',
        },
      ],
      defaultValue: '0',
    },
    {
      id: 'mgba_force_gbp',
      label: 'mgba_force_gbp',
      category: 'input',
      choices: [
        {
          value: 'OFF',
          label: 'disabled',
        },
        {
          value: 'ON',
          label: 'enabled',
        },
      ],
      defaultValue: 'OFF',
    },
    {
      id: 'mgba_idle_optimization',
      label: 'mgba_idle_optimization',
      category: 'performance',
      choices: [
        {
          value: 'Remove Known',
          label: 'Remove Known',
        },
        {
          value: 'Detect and Remove',
          label: 'Detect and Remove',
        },
        {
          value: "Don't Remove",
          label: "Don't Remove",
        },
      ],
      defaultValue: 'Remove Known',
    },
    {
      id: 'mgba_frameskip',
      label: 'mgba_frameskip',
      category: 'performance',
      choices: [
        {
          value: 'disabled',
          label: 'disabled',
        },
        {
          value: 'auto',
          label: 'auto',
        },
        {
          value: 'auto_threshold',
          label: 'auto_threshold',
        },
        {
          value: 'fixed_interval',
          label: 'fixed_interval',
        },
      ],
      defaultValue: 'disabled',
    },
    {
      id: 'mgba_frameskip_threshold',
      label: 'mgba_frameskip_threshold',
      category: 'performance',
      choices: [
        {
          value: '15',
          label: '15',
        },
        {
          value: '18',
          label: '18',
        },
        {
          value: '21',
          label: '21',
        },
        {
          value: '24',
          label: '24',
        },
        {
          value: '27',
          label: '27',
        },
        {
          value: '30',
          label: '30',
        },
        {
          value: '33',
          label: '33',
        },
        {
          value: '36',
          label: '36',
        },
        {
          value: '39',
          label: '39',
        },
        {
          value: '42',
          label: '42',
        },
        {
          value: '45',
          label: '45',
        },
        {
          value: '48',
          label: '48',
        },
        {
          value: '51',
          label: '51',
        },
        {
          value: '54',
          label: '54',
        },
        {
          value: '57',
          label: '57',
        },
        {
          value: '60',
          label: '60',
        },
      ],
      defaultValue: '33',
    },
    {
      id: 'mgba_frameskip_interval',
      label: 'mgba_frameskip_interval',
      category: 'performance',
      choices: [
        {
          value: '0',
          label: '0',
        },
        {
          value: '1',
          label: '1',
        },
        {
          value: '2',
          label: '2',
        },
        {
          value: '3',
          label: '3',
        },
        {
          value: '4',
          label: '4',
        },
        {
          value: '5',
          label: '5',
        },
        {
          value: '6',
          label: '6',
        },
        {
          value: '7',
          label: '7',
        },
        {
          value: '8',
          label: '8',
        },
        {
          value: '9',
          label: '9',
        },
        {
          value: '10',
          label: '10',
        },
      ],
      defaultValue: '0',
    },
  ],
  pcsx_rearmed: [
    {
      id: 'pcsx_rearmed_region',
      label: 'Region',
      description:
        "Specify which region the system is from. 'NTSC' is 60 Hz while 'PAL' is 50 Hz. 'Auto' will detect the region of the currently loaded content. Games may run faster or slower than normal if the incorrect region is selected.",
      category: 'system',
      choices: [
        {
          value: 'auto',
          label: 'Auto',
        },
        {
          value: 'NTSC',
          label: 'NTSC',
        },
        {
          value: 'PAL',
          label: 'PAL',
        },
      ],
      defaultValue: 'auto',
    },
    {
      id: 'pcsx_rearmed_bios',
      label: 'BIOS Selection',
      description:
        "Specify which BIOS to use. 'Auto' will attempt to load a real bios file from the frontend 'system' directory, falling back to high level emulation if unavailable. 'HLE' forces high level BIOS emulation. It is recommended to use an official bios file for better compatibility.",
      category: 'system',
      choices: [
        {
          value: 'auto',
          label: 'Auto',
        },
        {
          value: 'HLE',
          label: 'HLE',
        },
      ],
      defaultValue: 'auto',
    },
    {
      id: 'pcsx_rearmed_show_bios_bootlogo',
      label: 'Show BIOS Name/Boot Logo',
      description:
        'When using a custom BIOS file, enables the display of its file name in the OSD. Also specifies whether to show the BIOS logo when starting or selecting Reset. Warning: Enabling the logo may reduce game compatibility.',
      category: 'system',
      choices: [
        {
          value: 'disabled',
          label: 'disabled',
        },
        {
          value: 'enabled',
          label: 'enabled',
        },
        {
          value: 'enabled_no_pcsx',
          label: 'ON, w/o PCSXtm',
        },
      ],
      defaultValue: 'disabled',
    },
    {
      id: 'pcsx_rearmed_memcard1',
      label: 'Memory Card 1 Type (Restart)',
      description:
        "How to emulate the memory card in slot 1. 'Libretro' passes the card data to the frontend (usually saved as .srm). 'Game Code' saves it to a file named based on the serial, such as SCUS-00001_1.mcd, for compatibility with some other emulators.",
      category: 'system',
      choices: [
        {
          value: 'libretro',
          label: 'Libretro (Default)',
        },
        {
          value: 'serial',
          label: 'Game Code (Serial)',
        },
        {
          value: 'shared',
          label: 'Shared Between All Games',
        },
        {
          value: 'none',
          label: 'No Memory Card',
        },
      ],
      defaultValue: 'libretro',
    },
    {
      id: 'pcsx_rearmed_memcard2',
      label: 'Memory Card 2 Type',
      description: 'Same as above, but card in slot 2.',
      category: 'system',
      choices: [
        {
          value: 'serial',
          label: 'Game Code (Serial)',
        },
        {
          value: 'shared',
          label: 'Shared Between All Games',
        },
        {
          value: 'none',
          label: 'No Memory Card',
        },
      ],
      defaultValue: 'shared',
    },
    {
      id: 'pcsx_rearmed_psxclock',
      label: 'PSX CPU Clock Speed (%)',
      description:
        "Overclock or under-clock the PSX CPU. Should be much less than 100 (something like 57) due to some real hardware slowdowns not being emulated. Usually should be left at 'Auto', else glitches or hangs are likely.",
      category: 'system',
      choices: [
        {
          value: 'auto',
          label: 'Auto',
        },
        {
          value: '30',
          label: '30',
        },
        {
          value: '31',
          label: '31',
        },
        {
          value: '32',
          label: '32',
        },
        {
          value: '33',
          label: '33',
        },
        {
          value: '34',
          label: '34',
        },
        {
          value: '35',
          label: '35',
        },
        {
          value: '36',
          label: '36',
        },
        {
          value: '37',
          label: '37',
        },
        {
          value: '38',
          label: '38',
        },
        {
          value: '39',
          label: '39',
        },
        {
          value: '40',
          label: '40',
        },
        {
          value: '41',
          label: '41',
        },
        {
          value: '42',
          label: '42',
        },
        {
          value: '43',
          label: '43',
        },
        {
          value: '44',
          label: '44',
        },
        {
          value: '45',
          label: '45',
        },
        {
          value: '46',
          label: '46',
        },
        {
          value: '47',
          label: '47',
        },
        {
          value: '48',
          label: '48',
        },
        {
          value: '49',
          label: '49',
        },
        {
          value: '50',
          label: '50',
        },
        {
          value: '51',
          label: '51',
        },
        {
          value: '52',
          label: '52',
        },
        {
          value: '53',
          label: '53',
        },
        {
          value: '54',
          label: '54',
        },
        {
          value: '55',
          label: '55',
        },
        {
          value: '56',
          label: '56',
        },
        {
          value: '57',
          label: '57',
        },
        {
          value: '58',
          label: '58',
        },
        {
          value: '59',
          label: '59',
        },
        {
          value: '60',
          label: '60',
        },
        {
          value: '61',
          label: '61',
        },
        {
          value: '62',
          label: '62',
        },
        {
          value: '63',
          label: '63',
        },
        {
          value: '64',
          label: '64',
        },
        {
          value: '65',
          label: '65',
        },
        {
          value: '66',
          label: '66',
        },
        {
          value: '67',
          label: '67',
        },
        {
          value: '68',
          label: '68',
        },
        {
          value: '69',
          label: '69',
        },
        {
          value: '70',
          label: '70',
        },
        {
          value: '71',
          label: '71',
        },
        {
          value: '72',
          label: '72',
        },
        {
          value: '73',
          label: '73',
        },
        {
          value: '74',
          label: '74',
        },
        {
          value: '75',
          label: '75',
        },
        {
          value: '76',
          label: '76',
        },
        {
          value: '77',
          label: '77',
        },
        {
          value: '78',
          label: '78',
        },
        {
          value: '79',
          label: '79',
        },
        {
          value: '80',
          label: '80',
        },
        {
          value: '81',
          label: '81',
        },
        {
          value: '82',
          label: '82',
        },
        {
          value: '83',
          label: '83',
        },
        {
          value: '84',
          label: '84',
        },
        {
          value: '85',
          label: '85',
        },
        {
          value: '86',
          label: '86',
        },
        {
          value: '87',
          label: '87',
        },
        {
          value: '88',
          label: '88',
        },
        {
          value: '89',
          label: '89',
        },
        {
          value: '90',
          label: '90',
        },
        {
          value: '91',
          label: '91',
        },
        {
          value: '92',
          label: '92',
        },
        {
          value: '93',
          label: '93',
        },
        {
          value: '94',
          label: '94',
        },
        {
          value: '95',
          label: '95',
        },
        {
          value: '96',
          label: '96',
        },
        {
          value: '97',
          label: '97',
        },
        {
          value: '98',
          label: '98',
        },
        {
          value: '99',
          label: '99',
        },
        {
          value: '100',
          label: '100',
        },
      ],
      defaultValue: 'auto',
    },
    {
      id: 'pcsx_rearmed_dithering',
      label: 'Dithering Pattern',
      description:
        'Enable emulation of the dithering technique used by the PSX to smooth out color banding artifacts. "Force" enables it even if the game turns it off. Increases performance requirements.',
      category: 'video',
      choices: [
        {
          value: 'disabled',
          label: 'disabled',
        },
        {
          value: 'enabled',
          label: 'enabled',
        },
        {
          value: 'force',
          label: 'Force',
        },
      ],
      defaultValue: 'enabled',
    },
    {
      id: 'pcsx_rearmed_frameskip_type',
      label: 'Frameskip',
      description:
        "Skip frames to avoid audio buffer under-run (crackling). Improves performance at the expense of visual smoothness. 'Auto' skips frames when advised by the frontend. 'Auto (Threshold)' utilises the 'Frameskip Threshold (%)' setting. 'Fixed Interval' utilises the 'Frameskip Interval' setting.",
      category: 'video',
      choices: [
        {
          value: 'disabled',
          label: 'disabled',
        },
        {
          value: 'auto',
          label: 'Auto',
        },
        {
          value: 'auto_threshold',
          label: 'Auto (Threshold)',
        },
        {
          value: 'fixed_interval',
          label: 'Fixed Interval',
        },
      ],
      defaultValue: 'disabled',
    },
    {
      id: 'pcsx_rearmed_frameskip_threshold',
      label: 'Frameskip Threshold (%)',
      description:
        "When 'Frameskip' is set to 'Auto (Threshold)', specifies the audio buffer occupancy threshold (percentage) below which frames will be skipped. Higher values reduce the risk of crackling by causing frames to be dropped more frequently.",
      category: 'video',
      choices: [
        {
          value: '15',
          label: '15',
        },
        {
          value: '18',
          label: '18',
        },
        {
          value: '21',
          label: '21',
        },
        {
          value: '24',
          label: '24',
        },
        {
          value: '27',
          label: '27',
        },
        {
          value: '30',
          label: '30',
        },
        {
          value: '33',
          label: '33',
        },
        {
          value: '36',
          label: '36',
        },
        {
          value: '39',
          label: '39',
        },
        {
          value: '42',
          label: '42',
        },
        {
          value: '45',
          label: '45',
        },
        {
          value: '48',
          label: '48',
        },
        {
          value: '51',
          label: '51',
        },
        {
          value: '54',
          label: '54',
        },
        {
          value: '57',
          label: '57',
        },
        {
          value: '60',
          label: '60',
        },
        {
          value: '65',
          label: '65',
        },
        {
          value: '70',
          label: '70',
        },
        {
          value: '75',
          label: '75',
        },
        {
          value: '80',
          label: '80',
        },
      ],
      defaultValue: '33',
    },
    {
      id: 'pcsx_rearmed_frameskip_interval',
      label: 'Frameskip Interval',
      description:
        'Specify the maximum number of frames that can be skipped before a new frame is rendered.',
      category: 'video',
      choices: [
        {
          value: '1',
          label: '1',
        },
        {
          value: '2',
          label: '2',
        },
        {
          value: '3',
          label: '3',
        },
        {
          value: '4',
          label: '4',
        },
        {
          value: '5',
          label: '5',
        },
        {
          value: '6',
          label: '6',
        },
        {
          value: '7',
          label: '7',
        },
        {
          value: '8',
          label: '8',
        },
        {
          value: '9',
          label: '9',
        },
        {
          value: '10',
          label: '10',
        },
      ],
      defaultValue: '3',
    },
    {
      id: 'pcsx_rearmed_display_fps_v2',
      label: 'Display Internal FPS',
      description:
        'Show the internal frame rate at which the emulated system is rendering content. Note: Requires on-screen notifications to be enabled in the libretro frontend.',
      category: 'video',
      choices: [
        {
          value: 'disabled',
          label: 'disabled',
        },
        {
          value: 'enabled',
          label: 'enabled',
        },
        {
          value: 'extra',
          label: 'extra',
        },
      ],
      defaultValue: 'disabled',
    },
    {
      id: 'pcsx_rearmed_display_info',
      label: 'Display Informational Notifications',
      description:
        'Shows things like unsafe hack options that are enabled and the BIOS name that is booting.',
      category: 'video',
      choices: [
        {
          value: 'disabled',
          label: 'disabled',
        },
        {
          value: 'enabled',
          label: 'enabled',
        },
      ],
      defaultValue: 'enabled',
    },
    {
      id: 'pcsx_rearmed_fractional_framerate',
      label: 'Use fractional frame rate',
      description:
        'Instead of the exact 50 or 60 (maximum) fps for PAL/NTSC the real console runs closer to something like 49.75 and 59.81fps (varies slightly between hw versions). PCSX-ReARMed uses the former "round" framerates to better match modern displays, however that may cause audio/video desync in games like DDR and Spyro 2 (intro). With this option you can try to use fractional framerates.',
      category: 'video',
      choices: [
        {
          value: 'auto',
          label: 'Auto',
        },
        {
          value: 'disabled',
          label: 'disabled',
        },
        {
          value: 'enabled',
          label: 'enabled',
        },
      ],
      defaultValue: 'auto',
    },
    {
      id: 'pcsx_rearmed_alt_flip',
      label: 'Framebuffer readout',
      description:
        "Some games make changes to the framebuffer while it's being sent to the display, which is currently not emulated. However this option allows to choose if the emulator takes the video frame before the emulated PSX active display period ('Early') or after ('Late'). Normally this should be left at 'Auto'.",
      category: 'video',
      choices: [
        {
          value: 'auto',
          label: 'Auto',
        },
        {
          value: 'early',
          label: 'Early',
        },
        {
          value: 'late',
          label: 'Late',
        },
      ],
      defaultValue: 'auto',
    },
    {
      id: 'pcsx_rearmed_rgb32_output',
      label: 'RGB32 output',
      description:
        'Improves color depth for true color modes (most FMVs and occasional title screens). Causes higher CPU usage due to double memory bandwidth requirement, even in 15bpp modes. Takes effect on game reload only (libretro limitation).',
      category: 'video',
      choices: [
        {
          value: 'disabled',
          label: 'disabled',
        },
        {
          value: 'enabled',
          label: 'enabled',
        },
      ],
      defaultValue: 'disabled',
    },
    {
      id: 'pcsx_rearmed_scale_hires',
      label: 'Hi-Res Downscaling',
      description:
        'When enabled, games that run in high resolution video modes (480i, 512i) will be downscaled to 320x240 by skipping lines and/or columns. May be useful on some devices with native 240p display resolutions that lack efficient hardware scaling.',
      category: 'video',
      choices: [
        {
          value: 'disabled',
          label: 'disabled',
        },
        {
          value: 'enabled',
          label: 'enabled',
        },
      ],
      defaultValue: 'disabled',
    },
    {
      id: 'pcsx_rearmed_gpu_slow_llists',
      label: '(GPU) Slow linked list processing',
      description:
        'Slower but more accurate GPU linked list processing. Needed by only a few games like Vampire Hunter D. Should be autodetected in most cases.',
      category: 'video',
      choices: [
        {
          value: 'auto',
          label: 'Auto',
        },
        {
          value: 'disabled',
          label: 'disabled',
        },
        {
          value: 'enabled',
          label: 'enabled',
        },
      ],
      defaultValue: 'auto',
    },
    {
      id: 'pcsx_rearmed_show_overscan',
      label: '(GPU) Horizontal overscan',
      description:
        "The PSX can display graphics way into the horizontal borders, even if most screens would crop it. This option tries to display all such graphics. Note that this may result in unusual resolutions that your device might not handle well. The 'Hack' option is intended for the widescreen hacks.",
      category: 'video',
      choices: [
        {
          value: 'disabled',
          label: 'disabled',
        },
        {
          value: 'auto',
          label: 'Auto',
        },
        {
          value: 'hack',
          label: 'Hack',
        },
      ],
      defaultValue: 'disabled',
    },
    {
      id: 'pcsx_rearmed_screen_centering',
      label: '(GPU) Screen centering',
      description:
        "The PSX has a feature allowing it to shift the image position on screen. Some (mostly PAL) games used this feature in a strange way making the image miscentered and causing uneven borders to appear. With 'Auto' the emulator tries to correct this miscentering automatically. 'Game-controlled' uses the settings supplied by the game. 'Manual' allows to override those values with the settings below.",
      category: 'video',
      choices: [
        {
          value: 'auto',
          label: 'Auto',
        },
        {
          value: 'game',
          label: 'Game-controlled',
        },
        {
          value: 'borderless',
          label: 'Borderless',
        },
        {
          value: 'manual',
          label: 'Manual',
        },
      ],
      defaultValue: 'auto',
    },
    {
      id: 'pcsx_rearmed_screen_centering_x',
      label: '(GPU) Manual position X',
      description:
        "X offset of the frame buffer. Only effective when 'Screen centering' is set to 'Manual'.",
      category: 'video',
      choices: [
        {
          value: '-16',
          label: '-16',
        },
        {
          value: '-14',
          label: '-14',
        },
        {
          value: '-12',
          label: '-12',
        },
        {
          value: '-10',
          label: '-10',
        },
        {
          value: '-8',
          label: '-8',
        },
        {
          value: '-6',
          label: '-6',
        },
        {
          value: '-4',
          label: '-4',
        },
        {
          value: '-2',
          label: '-2',
        },
        {
          value: '0',
          label: '0',
        },
        {
          value: '2',
          label: '2',
        },
        {
          value: '4',
          label: '4',
        },
        {
          value: '6',
          label: '6',
        },
        {
          value: '8',
          label: '8',
        },
        {
          value: '10',
          label: '10',
        },
        {
          value: '12',
          label: '12',
        },
        {
          value: '14',
          label: '14',
        },
        {
          value: '16',
          label: '16',
        },
      ],
      defaultValue: '0',
    },
    {
      id: 'pcsx_rearmed_screen_centering_y',
      label: '(GPU) Manual position Y',
      description:
        "Y offset of the frame buffer. Only effective when 'Screen centering' is set to 'Manual'.",
      category: 'video',
      choices: [
        {
          value: '-16',
          label: '-16',
        },
        {
          value: '-15',
          label: '-15',
        },
        {
          value: '-14',
          label: '-14',
        },
        {
          value: '-13',
          label: '-13',
        },
        {
          value: '-12',
          label: '-12',
        },
        {
          value: '-11',
          label: '-11',
        },
        {
          value: '-10',
          label: '-10',
        },
        {
          value: '-9',
          label: '-9',
        },
        {
          value: '-8',
          label: '-8',
        },
        {
          value: '-7',
          label: '-7',
        },
        {
          value: '-6',
          label: '-6',
        },
        {
          value: '-5',
          label: '-5',
        },
        {
          value: '-4',
          label: '-4',
        },
        {
          value: '-3',
          label: '-3',
        },
        {
          value: '-2',
          label: '-2',
        },
        {
          value: '-1',
          label: '-1',
        },
        {
          value: '0',
          label: '0',
        },
        {
          value: '1',
          label: '1',
        },
        {
          value: '2',
          label: '2',
        },
        {
          value: '3',
          label: '3',
        },
        {
          value: '4',
          label: '4',
        },
        {
          value: '5',
          label: '5',
        },
        {
          value: '6',
          label: '6',
        },
        {
          value: '7',
          label: '7',
        },
        {
          value: '8',
          label: '8',
        },
        {
          value: '9',
          label: '9',
        },
        {
          value: '10',
          label: '10',
        },
        {
          value: '11',
          label: '11',
        },
        {
          value: '12',
          label: '12',
        },
        {
          value: '13',
          label: '13',
        },
        {
          value: '14',
          label: '14',
        },
        {
          value: '15',
          label: '15',
        },
        {
          value: '16',
          label: '16',
        },
      ],
      defaultValue: '0',
    },
    {
      id: 'pcsx_rearmed_screen_centering_h_adj',
      label: '(GPU) Manual height adjustment',
      description:
        "Height adjustment. Only effective when 'Screen centering' is set to 'Manual'.",
      category: 'video',
      choices: [
        {
          value: '-64',
          label: '-64',
        },
        {
          value: '-48',
          label: '-48',
        },
        {
          value: '-40',
          label: '-40',
        },
        {
          value: '-32',
          label: '-32',
        },
        {
          value: '-24',
          label: '-24',
        },
        {
          value: '-16',
          label: '-16',
        },
        {
          value: '-8',
          label: '-8',
        },
        {
          value: '-7',
          label: '-7',
        },
        {
          value: '-6',
          label: '-6',
        },
        {
          value: '-5',
          label: '-5',
        },
        {
          value: '-4',
          label: '-4',
        },
        {
          value: '-3',
          label: '-3',
        },
        {
          value: '-2',
          label: '-2',
        },
        {
          value: '-1',
          label: '-1',
        },
        {
          value: '0',
          label: '0',
        },
      ],
      defaultValue: '0',
    },
    {
      id: 'pcsx_rearmed_neon_interlace_enable_v2',
      label: 'Show Interlaced Video',
      description:
        'When enabled, games that run in high resolution video modes (480i, 512i) will produced interlaced video output. While this displays correctly on CRT televisions, it will produce artifacts on modern displays. When disabled, all video is output in progressive format. Note: there are games that will glitch is this is off.',
      category: 'gpu_neon',
      choices: [
        {
          value: 'auto',
          label: 'auto',
        },
        {
          value: 'disabled',
          label: 'disabled',
        },
        {
          value: 'enabled',
          label: 'enabled',
        },
      ],
      defaultValue: 'auto',
    },
    {
      id: 'pcsx_rearmed_neon_enhancement_enable',
      label: 'Enhanced Resolution',
      description:
        'Render games that do not already run in high resolution video modes (480i, 512i) at twice the native internal resolution. Improves the fidelity of 3D models at the expense of increased performance requirements. 2D elements are generally unaffected by this setting.',
      category: 'gpu_neon',
      choices: [
        {
          value: 'disabled',
          label: 'disabled',
        },
        {
          value: 'enabled',
          label: 'enabled',
        },
      ],
      defaultValue: 'disabled',
    },
    {
      id: 'pcsx_rearmed_neon_enhancement_no_main',
      label: 'Enh. Res. Speed Hack',
      description:
        "('Enhanced Resolution' Hack) Improves performance but reduces compatibility and may cause rendering errors.",
      category: 'gpu_neon',
      choices: [
        {
          value: 'disabled',
          label: 'disabled',
        },
        {
          value: 'enabled',
          label: 'enabled',
        },
      ],
      defaultValue: 'disabled',
    },
    {
      id: 'pcsx_rearmed_neon_enhancement_tex_adj_v2',
      label: 'Enh. Res. Texture Fixup',
      description:
        "('Enhanced Resolution' Hack) Solves some texturing issues in some games in Enhanced Resolution mode. May cause a small performance hit.",
      category: 'gpu_neon',
      choices: [
        {
          value: 'disabled',
          label: 'disabled',
        },
        {
          value: 'enabled',
          label: 'enabled',
        },
      ],
      defaultValue: 'enabled',
    },
    {
      id: 'pcsx_rearmed_spu_reverb',
      label: 'Reverb Effects',
      description:
        'Enable emulation of the reverb feature provided by the PSX SPU. Can be disabled to improve performance at the expense of reduced audio quality/authenticity.',
      category: 'audio',
      choices: [
        {
          value: 'disabled',
          label: 'disabled',
        },
        {
          value: 'enabled',
          label: 'enabled',
        },
      ],
      defaultValue: 'enabled',
    },
    {
      id: 'pcsx_rearmed_spu_interpolation',
      label: 'Sound Interpolation',
      description:
        "Enable emulation of the in-built audio interpolation provided by the PSX SPU. 'Gaussian' sounds closest to original hardware. 'Simple' improves performance but reduces quality. 'Cubic' has the highest performance requirements but produces increased clarity. Can be disabled entirely for maximum performance, at the expense of greatly reduced audio quality.",
      category: 'audio',
      choices: [
        {
          value: 'simple',
          label: 'Simple',
        },
        {
          value: 'gaussian',
          label: 'Gaussian',
        },
        {
          value: 'cubic',
          label: 'Cubic',
        },
        {
          value: 'off',
          label: 'disabled',
        },
      ],
      defaultValue: 'simple',
    },
    {
      id: 'pcsx_rearmed_nocdaudio',
      label: 'CD Audio',
      description:
        'Enable playback of CD (CD-DA) audio tracks. Can be disabled to improve performance in games that include CD audio, at the expense of missing music.',
      category: 'audio',
      choices: [
        {
          value: 'disabled',
          label: 'disabled',
        },
        {
          value: 'enabled',
          label: 'enabled',
        },
      ],
      defaultValue: 'enabled',
    },
    {
      id: 'pcsx_rearmed_noxadecoding',
      label: 'XA Decoding',
      description:
        'Enable playback of XA (eXtended Architecture ADPCM) audio tracks. Can be disabled to improve performance in games that include XA audio, at the expense of missing music.',
      category: 'audio',
      choices: [
        {
          value: 'disabled',
          label: 'disabled',
        },
        {
          value: 'enabled',
          label: 'enabled',
        },
      ],
      defaultValue: 'enabled',
    },
    {
      id: 'pcsx_rearmed_show_input_settings',
      label: 'Show Input Settings',
      description:
        'Show configuration options for all input devices: analog response, Multitaps, light guns, etc. Quick Menu may need to be toggled for this setting to take effect.',
      choices: [
        {
          value: 'disabled',
          label: 'disabled',
        },
        {
          value: 'enabled',
          label: 'enabled',
        },
      ],
      defaultValue: 'disabled',
    },
    {
      id: 'pcsx_rearmed_analog_axis_modifier',
      label: 'Analog Axis Bounds',
      description:
        "Specify range limits for the left and right analog sticks when input device is set to 'analog' or 'dualshock'. 'Square' bounds improve input response when using controllers with highly circular ranges that are unable to fully saturate the X and Y axes at 45 degree deflections.",
      category: 'input',
      choices: [
        {
          value: 'circle',
          label: 'Circle',
        },
        {
          value: 'square',
          label: 'Square',
        },
      ],
      defaultValue: 'square',
    },
    {
      id: 'pcsx_rearmed_vibration',
      label: 'Rumble Effects',
      description:
        "Enable haptic feedback when using a rumble-equipped gamepad with input device set to 'dualshock'.",
      category: 'input',
      choices: [
        {
          value: 'disabled',
          label: 'disabled',
        },
        {
          value: 'enabled',
          label: 'enabled',
        },
      ],
      defaultValue: 'enabled',
    },
    {
      id: 'pcsx_rearmed_analog_combo',
      label: 'DualShock Analog Mode Toggle Key Combo',
      description:
        'When the input device type is DualShock, this option allows the emulated DualShock to be toggled between DIGITAL and ANALOG mode like original hardware. You can select the button combination for this.',
      category: 'input',
      choices: [
        {
          value: 'disabled',
          label: 'disabled',
        },
        {
          value: 'l1+r1+select',
          label: 'L1 + R1 + Select',
        },
        {
          value: 'l1+r1+start',
          label: 'L1 + R1 + Start',
        },
        {
          value: 'l1+r1+l3',
          label: 'L1 + R1 + L3',
        },
        {
          value: 'l1+r1+r3',
          label: 'L1 + R1 + R3',
        },
        {
          value: 'l3+r3',
          label: 'L3 + R3',
        },
      ],
      defaultValue: 'l1+r1+select',
    },
    {
      id: 'pcsx_rearmed_multitap',
      label: 'Multitap Mode',
      description:
        "Connect a virtual PSX Multitap peripheral to either controller 'Port 1' or controller 'Port 2' for 5 player simultaneous input, or to both 'Ports 1 and 2' for 8 player input. Mutlitap usage requires compatible games.",
      category: 'input',
      choices: [
        {
          value: 'disabled',
          label: 'disabled',
        },
        {
          value: 'port 1',
          label: 'Port 1',
        },
        {
          value: 'port 2',
          label: 'Port 2',
        },
        {
          value: 'ports 1 and 2',
          label: 'Ports 1 and 2',
        },
      ],
      defaultValue: 'disabled',
    },
    {
      id: 'pcsx_rearmed_negcon_deadzone',
      label: 'NegCon Twist Deadzone',
      description:
        "Set the deadzone of the RetroPad left analog stick when simulating the 'twist' action of emulated neGcon Controllers. Used to eliminate drift/unwanted input.",
      category: 'input',
      choices: [
        {
          value: '0',
          label: '0%',
        },
        {
          value: '3',
          label: '3%',
        },
        {
          value: '5',
          label: '5%',
        },
        {
          value: '7',
          label: '7%',
        },
        {
          value: '10',
          label: '10%',
        },
        {
          value: '13',
          label: '13%',
        },
        {
          value: '15',
          label: '15%',
        },
        {
          value: '17',
          label: '17%',
        },
        {
          value: '20',
          label: '20%',
        },
        {
          value: '23',
          label: '23%',
        },
        {
          value: '25',
          label: '25%',
        },
        {
          value: '27',
          label: '27%',
        },
        {
          value: '30',
          label: '30%',
        },
      ],
      defaultValue: '0',
    },
    {
      id: 'pcsx_rearmed_negcon_response',
      label: 'NegCon Twist Response',
      description:
        "Specify the analog response when using a RetroPad left analog stick to simulate the 'twist' action of emulated neGcon Controllers.",
      category: 'input',
      choices: [
        {
          value: 'linear',
          label: 'Linear',
        },
        {
          value: 'quadratic',
          label: 'Quadratic',
        },
        {
          value: 'cubic',
          label: 'Cubic',
        },
      ],
      defaultValue: 'linear',
    },
    {
      id: 'pcsx_rearmed_input_sensitivity',
      label: 'Mouse Sensitivity',
      description: "Adjust responsiveness of emulated 'mouse' input devices.",
      category: 'input',
      choices: [
        {
          value: '0.05',
          label: '0.05',
        },
        {
          value: '0.10',
          label: '0.10',
        },
        {
          value: '0.15',
          label: '0.15',
        },
        {
          value: '0.20',
          label: '0.20',
        },
        {
          value: '0.25',
          label: '0.25',
        },
        {
          value: '0.30',
          label: '0.30',
        },
        {
          value: '0.35',
          label: '0.35',
        },
        {
          value: '0.40',
          label: '0.40',
        },
        {
          value: '0.45',
          label: '0.45',
        },
        {
          value: '0.50',
          label: '0.50',
        },
        {
          value: '0.55',
          label: '0.55',
        },
        {
          value: '0.60',
          label: '0.60',
        },
        {
          value: '0.65',
          label: '0.65',
        },
        {
          value: '0.70',
          label: '0.70',
        },
        {
          value: '0.75',
          label: '0.75',
        },
        {
          value: '0.80',
          label: '0.80',
        },
        {
          value: '0.85',
          label: '0.85',
        },
        {
          value: '0.90',
          label: '0.90',
        },
        {
          value: '0.95',
          label: '0.95',
        },
        {
          value: '1.00',
          label: '1.00',
        },
        {
          value: '1.05',
          label: '1.05',
        },
        {
          value: '1.10',
          label: '1.10',
        },
        {
          value: '1.15',
          label: '1.15',
        },
        {
          value: '1.20',
          label: '1.20',
        },
        {
          value: '1.25',
          label: '1.25',
        },
        {
          value: '1.30',
          label: '1.30',
        },
        {
          value: '1.35',
          label: '1.35',
        },
        {
          value: '1.40',
          label: '1.40',
        },
        {
          value: '1.45',
          label: '1.45',
        },
        {
          value: '1.50',
          label: '1.50',
        },
        {
          value: '1.55',
          label: '1.55',
        },
        {
          value: '1.60',
          label: '1.60',
        },
        {
          value: '1.65',
          label: '1.65',
        },
        {
          value: '1.70',
          label: '1.70',
        },
        {
          value: '1.75',
          label: '1.75',
        },
        {
          value: '1.80',
          label: '1.80',
        },
        {
          value: '1.85',
          label: '1.85',
        },
        {
          value: '1.90',
          label: '1.90',
        },
        {
          value: '1.95',
          label: '1.95',
        },
        {
          value: '2.00',
          label: '2.00',
        },
      ],
      defaultValue: '1.00',
    },
    {
      id: 'pcsx_rearmed_crosshair1',
      label: 'Player 1 Lightgun Crosshair',
      description:
        "Toggle player 1's crosshair for the Guncon or Konami Gun. Only works if RGB32 output is off (video options).",
      category: 'input',
      choices: [
        {
          value: 'disabled',
          label: 'disabled',
        },
        {
          value: 'blue',
          label: 'blue',
        },
        {
          value: 'green',
          label: 'green',
        },
        {
          value: 'red',
          label: 'red',
        },
        {
          value: 'white',
          label: 'white',
        },
      ],
      defaultValue: 'disabled',
    },
    {
      id: 'pcsx_rearmed_crosshair2',
      label: 'Player 2 Lightgun Crosshair',
      description:
        "Toggle player 2's crosshair for the Guncon or Konami Gun. Only works if RGB32 output is off (video options).",
      category: 'input',
      choices: [
        {
          value: 'disabled',
          label: 'disabled',
        },
        {
          value: 'blue',
          label: 'blue',
        },
        {
          value: 'green',
          label: 'green',
        },
        {
          value: 'red',
          label: 'red',
        },
        {
          value: 'white',
          label: 'white',
        },
      ],
      defaultValue: 'disabled',
    },
    {
      id: 'pcsx_rearmed_konamigunadjustx',
      label: 'Konami Gun X Axis Offset',
      description:
        'Apply an X axis offset to light gun input when emulating a Konami Gun (Hyper Blaster / Justifier) device. Can be used to correct aiming misalignments.',
      category: 'input',
      choices: [
        {
          value: '-40',
          label: '-40',
        },
        {
          value: '-39',
          label: '-39',
        },
        {
          value: '-38',
          label: '-38',
        },
        {
          value: '-37',
          label: '-37',
        },
        {
          value: '-36',
          label: '-36',
        },
        {
          value: '-35',
          label: '-35',
        },
        {
          value: '-34',
          label: '-34',
        },
        {
          value: '-33',
          label: '-33',
        },
        {
          value: '-32',
          label: '-32',
        },
        {
          value: '-31',
          label: '-31',
        },
        {
          value: '-30',
          label: '-30',
        },
        {
          value: '-29',
          label: '-29',
        },
        {
          value: '-28',
          label: '-28',
        },
        {
          value: '-27',
          label: '-27',
        },
        {
          value: '-26',
          label: '-26',
        },
        {
          value: '-25',
          label: '-25',
        },
        {
          value: '-24',
          label: '-24',
        },
        {
          value: '-23',
          label: '-23',
        },
        {
          value: '-22',
          label: '-22',
        },
        {
          value: '-21',
          label: '-21',
        },
        {
          value: '-20',
          label: '-20',
        },
        {
          value: '-19',
          label: '-19',
        },
        {
          value: '-18',
          label: '-18',
        },
        {
          value: '-17',
          label: '-17',
        },
        {
          value: '-16',
          label: '-16',
        },
        {
          value: '-15',
          label: '-15',
        },
        {
          value: '-14',
          label: '-14',
        },
        {
          value: '-13',
          label: '-13',
        },
        {
          value: '-12',
          label: '-12',
        },
        {
          value: '-11',
          label: '-11',
        },
        {
          value: '-10',
          label: '-10',
        },
        {
          value: '-9',
          label: '-9',
        },
        {
          value: '-8',
          label: '-8',
        },
        {
          value: '-7',
          label: '-7',
        },
        {
          value: '-6',
          label: '-6',
        },
        {
          value: '-5',
          label: '-5',
        },
        {
          value: '-4',
          label: '-4',
        },
        {
          value: '-3',
          label: '-3',
        },
        {
          value: '-2',
          label: '-2',
        },
        {
          value: '-1',
          label: '-1',
        },
        {
          value: '0',
          label: '0',
        },
        {
          value: '1',
          label: '1',
        },
        {
          value: '2',
          label: '2',
        },
        {
          value: '3',
          label: '3',
        },
        {
          value: '4',
          label: '4',
        },
        {
          value: '5',
          label: '5',
        },
        {
          value: '6',
          label: '6',
        },
        {
          value: '7',
          label: '7',
        },
        {
          value: '8',
          label: '8',
        },
        {
          value: '9',
          label: '9',
        },
        {
          value: '10',
          label: '10',
        },
        {
          value: '11',
          label: '11',
        },
        {
          value: '12',
          label: '12',
        },
        {
          value: '13',
          label: '13',
        },
        {
          value: '14',
          label: '14',
        },
        {
          value: '15',
          label: '15',
        },
        {
          value: '16',
          label: '16',
        },
        {
          value: '17',
          label: '17',
        },
        {
          value: '18',
          label: '18',
        },
        {
          value: '19',
          label: '19',
        },
        {
          value: '20',
          label: '20',
        },
        {
          value: '21',
          label: '21',
        },
        {
          value: '22',
          label: '22',
        },
        {
          value: '23',
          label: '23',
        },
        {
          value: '24',
          label: '24',
        },
        {
          value: '25',
          label: '25',
        },
        {
          value: '26',
          label: '26',
        },
        {
          value: '27',
          label: '27',
        },
        {
          value: '28',
          label: '28',
        },
        {
          value: '29',
          label: '29',
        },
        {
          value: '30',
          label: '30',
        },
        {
          value: '31',
          label: '31',
        },
        {
          value: '32',
          label: '32',
        },
        {
          value: '33',
          label: '33',
        },
        {
          value: '34',
          label: '34',
        },
        {
          value: '35',
          label: '35',
        },
        {
          value: '36',
          label: '36',
        },
        {
          value: '37',
          label: '37',
        },
        {
          value: '38',
          label: '38',
        },
        {
          value: '39',
          label: '39',
        },
        {
          value: '40',
          label: '40',
        },
      ],
      defaultValue: '0',
    },
    {
      id: 'pcsx_rearmed_konamigunadjusty',
      label: 'Konami Gun Y Axis Offset',
      description:
        'Apply a Y axis offset to light gun input when emulating a Konami Gun (Hyper Blaster / Justifier) device. Can be used to correct aiming misalignments.',
      category: 'input',
      choices: [
        {
          value: '-40',
          label: '-40',
        },
        {
          value: '-39',
          label: '-39',
        },
        {
          value: '-38',
          label: '-38',
        },
        {
          value: '-37',
          label: '-37',
        },
        {
          value: '-36',
          label: '-36',
        },
        {
          value: '-35',
          label: '-35',
        },
        {
          value: '-34',
          label: '-34',
        },
        {
          value: '-33',
          label: '-33',
        },
        {
          value: '-32',
          label: '-32',
        },
        {
          value: '-31',
          label: '-31',
        },
        {
          value: '-30',
          label: '-30',
        },
        {
          value: '-29',
          label: '-29',
        },
        {
          value: '-28',
          label: '-28',
        },
        {
          value: '-27',
          label: '-27',
        },
        {
          value: '-26',
          label: '-26',
        },
        {
          value: '-25',
          label: '-25',
        },
        {
          value: '-24',
          label: '-24',
        },
        {
          value: '-23',
          label: '-23',
        },
        {
          value: '-22',
          label: '-22',
        },
        {
          value: '-21',
          label: '-21',
        },
        {
          value: '-20',
          label: '-20',
        },
        {
          value: '-19',
          label: '-19',
        },
        {
          value: '-18',
          label: '-18',
        },
        {
          value: '-17',
          label: '-17',
        },
        {
          value: '-16',
          label: '-16',
        },
        {
          value: '-15',
          label: '-15',
        },
        {
          value: '-14',
          label: '-14',
        },
        {
          value: '-13',
          label: '-13',
        },
        {
          value: '-12',
          label: '-12',
        },
        {
          value: '-11',
          label: '-11',
        },
        {
          value: '-10',
          label: '-10',
        },
        {
          value: '-9',
          label: '-9',
        },
        {
          value: '-8',
          label: '-8',
        },
        {
          value: '-7',
          label: '-7',
        },
        {
          value: '-6',
          label: '-6',
        },
        {
          value: '-5',
          label: '-5',
        },
        {
          value: '-4',
          label: '-4',
        },
        {
          value: '-3',
          label: '-3',
        },
        {
          value: '-2',
          label: '-2',
        },
        {
          value: '-1',
          label: '-1',
        },
        {
          value: '0',
          label: '0',
        },
        {
          value: '1',
          label: '1',
        },
        {
          value: '2',
          label: '2',
        },
        {
          value: '3',
          label: '3',
        },
        {
          value: '4',
          label: '4',
        },
        {
          value: '5',
          label: '5',
        },
        {
          value: '6',
          label: '6',
        },
        {
          value: '7',
          label: '7',
        },
        {
          value: '8',
          label: '8',
        },
        {
          value: '9',
          label: '9',
        },
        {
          value: '10',
          label: '10',
        },
        {
          value: '11',
          label: '11',
        },
        {
          value: '12',
          label: '12',
        },
        {
          value: '13',
          label: '13',
        },
        {
          value: '14',
          label: '14',
        },
        {
          value: '15',
          label: '15',
        },
        {
          value: '16',
          label: '16',
        },
        {
          value: '17',
          label: '17',
        },
        {
          value: '18',
          label: '18',
        },
        {
          value: '19',
          label: '19',
        },
        {
          value: '20',
          label: '20',
        },
        {
          value: '21',
          label: '21',
        },
        {
          value: '22',
          label: '22',
        },
        {
          value: '23',
          label: '23',
        },
        {
          value: '24',
          label: '24',
        },
        {
          value: '25',
          label: '25',
        },
        {
          value: '26',
          label: '26',
        },
        {
          value: '27',
          label: '27',
        },
        {
          value: '28',
          label: '28',
        },
        {
          value: '29',
          label: '29',
        },
        {
          value: '30',
          label: '30',
        },
        {
          value: '31',
          label: '31',
        },
        {
          value: '32',
          label: '32',
        },
        {
          value: '33',
          label: '33',
        },
        {
          value: '34',
          label: '34',
        },
        {
          value: '35',
          label: '35',
        },
        {
          value: '36',
          label: '36',
        },
        {
          value: '37',
          label: '37',
        },
        {
          value: '38',
          label: '38',
        },
        {
          value: '39',
          label: '39',
        },
        {
          value: '40',
          label: '40',
        },
      ],
      defaultValue: '0',
    },
    {
      id: 'pcsx_rearmed_gunconadjustx',
      label: 'Guncon X Axis Offset',
      description:
        'Apply an X axis offset to light gun input when emulating a Guncon device. Can be used to correct aiming misalignments.',
      category: 'input',
      choices: [
        {
          value: '-40',
          label: '-40',
        },
        {
          value: '-39',
          label: '-39',
        },
        {
          value: '-38',
          label: '-38',
        },
        {
          value: '-37',
          label: '-37',
        },
        {
          value: '-36',
          label: '-36',
        },
        {
          value: '-35',
          label: '-35',
        },
        {
          value: '-34',
          label: '-34',
        },
        {
          value: '-33',
          label: '-33',
        },
        {
          value: '-32',
          label: '-32',
        },
        {
          value: '-31',
          label: '-31',
        },
        {
          value: '-30',
          label: '-30',
        },
        {
          value: '-29',
          label: '-29',
        },
        {
          value: '-28',
          label: '-28',
        },
        {
          value: '-27',
          label: '-27',
        },
        {
          value: '-26',
          label: '-26',
        },
        {
          value: '-25',
          label: '-25',
        },
        {
          value: '-24',
          label: '-24',
        },
        {
          value: '-23',
          label: '-23',
        },
        {
          value: '-22',
          label: '-22',
        },
        {
          value: '-21',
          label: '-21',
        },
        {
          value: '-20',
          label: '-20',
        },
        {
          value: '-19',
          label: '-19',
        },
        {
          value: '-18',
          label: '-18',
        },
        {
          value: '-17',
          label: '-17',
        },
        {
          value: '-16',
          label: '-16',
        },
        {
          value: '-15',
          label: '-15',
        },
        {
          value: '-14',
          label: '-14',
        },
        {
          value: '-13',
          label: '-13',
        },
        {
          value: '-12',
          label: '-12',
        },
        {
          value: '-11',
          label: '-11',
        },
        {
          value: '-10',
          label: '-10',
        },
        {
          value: '-9',
          label: '-9',
        },
        {
          value: '-8',
          label: '-8',
        },
        {
          value: '-7',
          label: '-7',
        },
        {
          value: '-6',
          label: '-6',
        },
        {
          value: '-5',
          label: '-5',
        },
        {
          value: '-4',
          label: '-4',
        },
        {
          value: '-3',
          label: '-3',
        },
        {
          value: '-2',
          label: '-2',
        },
        {
          value: '-1',
          label: '-1',
        },
        {
          value: '0',
          label: '0',
        },
        {
          value: '1',
          label: '1',
        },
        {
          value: '2',
          label: '2',
        },
        {
          value: '3',
          label: '3',
        },
        {
          value: '4',
          label: '4',
        },
        {
          value: '5',
          label: '5',
        },
        {
          value: '6',
          label: '6',
        },
        {
          value: '7',
          label: '7',
        },
        {
          value: '8',
          label: '8',
        },
        {
          value: '9',
          label: '9',
        },
        {
          value: '10',
          label: '10',
        },
        {
          value: '11',
          label: '11',
        },
        {
          value: '12',
          label: '12',
        },
        {
          value: '13',
          label: '13',
        },
        {
          value: '14',
          label: '14',
        },
        {
          value: '15',
          label: '15',
        },
        {
          value: '16',
          label: '16',
        },
        {
          value: '17',
          label: '17',
        },
        {
          value: '18',
          label: '18',
        },
        {
          value: '19',
          label: '19',
        },
        {
          value: '20',
          label: '20',
        },
        {
          value: '21',
          label: '21',
        },
        {
          value: '22',
          label: '22',
        },
        {
          value: '23',
          label: '23',
        },
        {
          value: '24',
          label: '24',
        },
        {
          value: '25',
          label: '25',
        },
        {
          value: '26',
          label: '26',
        },
        {
          value: '27',
          label: '27',
        },
        {
          value: '28',
          label: '28',
        },
        {
          value: '29',
          label: '29',
        },
        {
          value: '30',
          label: '30',
        },
        {
          value: '31',
          label: '31',
        },
        {
          value: '32',
          label: '32',
        },
        {
          value: '33',
          label: '33',
        },
        {
          value: '34',
          label: '34',
        },
        {
          value: '35',
          label: '35',
        },
        {
          value: '36',
          label: '36',
        },
        {
          value: '37',
          label: '37',
        },
        {
          value: '38',
          label: '38',
        },
        {
          value: '39',
          label: '39',
        },
        {
          value: '40',
          label: '40',
        },
      ],
      defaultValue: '0',
    },
    {
      id: 'pcsx_rearmed_gunconadjusty',
      label: 'Guncon Y Axis Offset',
      description:
        'Apply a Y axis offset to light gun input when emulating a Guncon device. Can be used to correct aiming misalignments.',
      category: 'input',
      choices: [
        {
          value: '-40',
          label: '-40',
        },
        {
          value: '-39',
          label: '-39',
        },
        {
          value: '-38',
          label: '-38',
        },
        {
          value: '-37',
          label: '-37',
        },
        {
          value: '-36',
          label: '-36',
        },
        {
          value: '-35',
          label: '-35',
        },
        {
          value: '-34',
          label: '-34',
        },
        {
          value: '-33',
          label: '-33',
        },
        {
          value: '-32',
          label: '-32',
        },
        {
          value: '-31',
          label: '-31',
        },
        {
          value: '-30',
          label: '-30',
        },
        {
          value: '-29',
          label: '-29',
        },
        {
          value: '-28',
          label: '-28',
        },
        {
          value: '-27',
          label: '-27',
        },
        {
          value: '-26',
          label: '-26',
        },
        {
          value: '-25',
          label: '-25',
        },
        {
          value: '-24',
          label: '-24',
        },
        {
          value: '-23',
          label: '-23',
        },
        {
          value: '-22',
          label: '-22',
        },
        {
          value: '-21',
          label: '-21',
        },
        {
          value: '-20',
          label: '-20',
        },
        {
          value: '-19',
          label: '-19',
        },
        {
          value: '-18',
          label: '-18',
        },
        {
          value: '-17',
          label: '-17',
        },
        {
          value: '-16',
          label: '-16',
        },
        {
          value: '-15',
          label: '-15',
        },
        {
          value: '-14',
          label: '-14',
        },
        {
          value: '-13',
          label: '-13',
        },
        {
          value: '-12',
          label: '-12',
        },
        {
          value: '-11',
          label: '-11',
        },
        {
          value: '-10',
          label: '-10',
        },
        {
          value: '-9',
          label: '-9',
        },
        {
          value: '-8',
          label: '-8',
        },
        {
          value: '-7',
          label: '-7',
        },
        {
          value: '-6',
          label: '-6',
        },
        {
          value: '-5',
          label: '-5',
        },
        {
          value: '-4',
          label: '-4',
        },
        {
          value: '-3',
          label: '-3',
        },
        {
          value: '-2',
          label: '-2',
        },
        {
          value: '-1',
          label: '-1',
        },
        {
          value: '0',
          label: '0',
        },
        {
          value: '1',
          label: '1',
        },
        {
          value: '2',
          label: '2',
        },
        {
          value: '3',
          label: '3',
        },
        {
          value: '4',
          label: '4',
        },
        {
          value: '5',
          label: '5',
        },
        {
          value: '6',
          label: '6',
        },
        {
          value: '7',
          label: '7',
        },
        {
          value: '8',
          label: '8',
        },
        {
          value: '9',
          label: '9',
        },
        {
          value: '10',
          label: '10',
        },
        {
          value: '11',
          label: '11',
        },
        {
          value: '12',
          label: '12',
        },
        {
          value: '13',
          label: '13',
        },
        {
          value: '14',
          label: '14',
        },
        {
          value: '15',
          label: '15',
        },
        {
          value: '16',
          label: '16',
        },
        {
          value: '17',
          label: '17',
        },
        {
          value: '18',
          label: '18',
        },
        {
          value: '19',
          label: '19',
        },
        {
          value: '20',
          label: '20',
        },
        {
          value: '21',
          label: '21',
        },
        {
          value: '22',
          label: '22',
        },
        {
          value: '23',
          label: '23',
        },
        {
          value: '24',
          label: '24',
        },
        {
          value: '25',
          label: '25',
        },
        {
          value: '26',
          label: '26',
        },
        {
          value: '27',
          label: '27',
        },
        {
          value: '28',
          label: '28',
        },
        {
          value: '29',
          label: '29',
        },
        {
          value: '30',
          label: '30',
        },
        {
          value: '31',
          label: '31',
        },
        {
          value: '32',
          label: '32',
        },
        {
          value: '33',
          label: '33',
        },
        {
          value: '34',
          label: '34',
        },
        {
          value: '35',
          label: '35',
        },
        {
          value: '36',
          label: '36',
        },
        {
          value: '37',
          label: '37',
        },
        {
          value: '38',
          label: '38',
        },
        {
          value: '39',
          label: '39',
        },
        {
          value: '40',
          label: '40',
        },
      ],
      defaultValue: '0',
    },
    {
      id: 'pcsx_rearmed_gunconadjustratiox',
      label: 'Guncon X Axis Response',
      description:
        'Adjust relative magnitude of horizontal light gun motion when emulating a Guncon device. Can be used to correct aiming misalignments.',
      category: 'input',
      choices: [
        {
          value: '0.75',
          label: '0.75',
        },
        {
          value: '0.76',
          label: '0.76',
        },
        {
          value: '0.77',
          label: '0.77',
        },
        {
          value: '0.78',
          label: '0.78',
        },
        {
          value: '0.79',
          label: '0.79',
        },
        {
          value: '0.80',
          label: '0.80',
        },
        {
          value: '0.81',
          label: '0.81',
        },
        {
          value: '0.82',
          label: '0.82',
        },
        {
          value: '0.83',
          label: '0.83',
        },
        {
          value: '0.84',
          label: '0.84',
        },
        {
          value: '0.85',
          label: '0.85',
        },
        {
          value: '0.86',
          label: '0.86',
        },
        {
          value: '0.87',
          label: '0.87',
        },
        {
          value: '0.88',
          label: '0.88',
        },
        {
          value: '0.89',
          label: '0.89',
        },
        {
          value: '0.90',
          label: '0.90',
        },
        {
          value: '0.91',
          label: '0.91',
        },
        {
          value: '0.92',
          label: '0.92',
        },
        {
          value: '0.93',
          label: '0.93',
        },
        {
          value: '0.94',
          label: '0.94',
        },
        {
          value: '0.95',
          label: '0.95',
        },
        {
          value: '0.96',
          label: '0.96',
        },
        {
          value: '0.97',
          label: '0.97',
        },
        {
          value: '0.98',
          label: '0.98',
        },
        {
          value: '0.99',
          label: '0.99',
        },
        {
          value: '1.00',
          label: '1.00',
        },
        {
          value: '1.01',
          label: '1.01',
        },
        {
          value: '1.02',
          label: '1.02',
        },
        {
          value: '1.03',
          label: '1.03',
        },
        {
          value: '1.04',
          label: '1.04',
        },
        {
          value: '1.05',
          label: '1.05',
        },
        {
          value: '1.06',
          label: '1.06',
        },
        {
          value: '1.07',
          label: '1.07',
        },
        {
          value: '1.08',
          label: '1.08',
        },
        {
          value: '1.09',
          label: '1.09',
        },
        {
          value: '1.10',
          label: '1.10',
        },
        {
          value: '1.11',
          label: '1.11',
        },
        {
          value: '1.12',
          label: '1.12',
        },
        {
          value: '1.13',
          label: '1.13',
        },
        {
          value: '1.14',
          label: '1.14',
        },
        {
          value: '1.15',
          label: '1.15',
        },
        {
          value: '1.16',
          label: '1.16',
        },
        {
          value: '1.17',
          label: '1.17',
        },
        {
          value: '1.18',
          label: '1.18',
        },
        {
          value: '1.19',
          label: '1.19',
        },
        {
          value: '1.20',
          label: '1.20',
        },
        {
          value: '1.21',
          label: '1.21',
        },
        {
          value: '1.22',
          label: '1.22',
        },
        {
          value: '1.23',
          label: '1.23',
        },
        {
          value: '1.24',
          label: '1.24',
        },
        {
          value: '1.25',
          label: '1.25',
        },
      ],
      defaultValue: '1.00',
    },
    {
      id: 'pcsx_rearmed_gunconadjustratioy',
      label: 'Guncon Y Axis Response',
      description:
        'Adjust relative magnitude of vertical light gun motion when emulating a Guncon device. Can be used to correct aiming misalignments.',
      category: 'input',
      choices: [
        {
          value: '0.75',
          label: '0.75',
        },
        {
          value: '0.76',
          label: '0.76',
        },
        {
          value: '0.77',
          label: '0.77',
        },
        {
          value: '0.78',
          label: '0.78',
        },
        {
          value: '0.79',
          label: '0.79',
        },
        {
          value: '0.80',
          label: '0.80',
        },
        {
          value: '0.81',
          label: '0.81',
        },
        {
          value: '0.82',
          label: '0.82',
        },
        {
          value: '0.83',
          label: '0.83',
        },
        {
          value: '0.84',
          label: '0.84',
        },
        {
          value: '0.85',
          label: '0.85',
        },
        {
          value: '0.86',
          label: '0.86',
        },
        {
          value: '0.87',
          label: '0.87',
        },
        {
          value: '0.88',
          label: '0.88',
        },
        {
          value: '0.89',
          label: '0.89',
        },
        {
          value: '0.90',
          label: '0.90',
        },
        {
          value: '0.91',
          label: '0.91',
        },
        {
          value: '0.92',
          label: '0.92',
        },
        {
          value: '0.93',
          label: '0.93',
        },
        {
          value: '0.94',
          label: '0.94',
        },
        {
          value: '0.95',
          label: '0.95',
        },
        {
          value: '0.96',
          label: '0.96',
        },
        {
          value: '0.97',
          label: '0.97',
        },
        {
          value: '0.98',
          label: '0.98',
        },
        {
          value: '0.99',
          label: '0.99',
        },
        {
          value: '1.00',
          label: '1.00',
        },
        {
          value: '1.01',
          label: '1.01',
        },
        {
          value: '1.02',
          label: '1.02',
        },
        {
          value: '1.03',
          label: '1.03',
        },
        {
          value: '1.04',
          label: '1.04',
        },
        {
          value: '1.05',
          label: '1.05',
        },
        {
          value: '1.06',
          label: '1.06',
        },
        {
          value: '1.07',
          label: '1.07',
        },
        {
          value: '1.08',
          label: '1.08',
        },
        {
          value: '1.09',
          label: '1.09',
        },
        {
          value: '1.10',
          label: '1.10',
        },
        {
          value: '1.11',
          label: '1.11',
        },
        {
          value: '1.12',
          label: '1.12',
        },
        {
          value: '1.13',
          label: '1.13',
        },
        {
          value: '1.14',
          label: '1.14',
        },
        {
          value: '1.15',
          label: '1.15',
        },
        {
          value: '1.16',
          label: '1.16',
        },
        {
          value: '1.17',
          label: '1.17',
        },
        {
          value: '1.18',
          label: '1.18',
        },
        {
          value: '1.19',
          label: '1.19',
        },
        {
          value: '1.20',
          label: '1.20',
        },
        {
          value: '1.21',
          label: '1.21',
        },
        {
          value: '1.22',
          label: '1.22',
        },
        {
          value: '1.23',
          label: '1.23',
        },
        {
          value: '1.24',
          label: '1.24',
        },
        {
          value: '1.25',
          label: '1.25',
        },
      ],
      defaultValue: '1.00',
    },
    {
      id: 'pcsx_rearmed_icache_emulation',
      label: 'Instruction Cache Emulation',
      description:
        'Enable emulation of the PSX CPU instruction cache. Improves accuracy at the expense of increased performance overheads. Required for Formula One 2001, Formula One Arcade and Formula One 99. [Interpreter only; partial on lightrec and ARM dynarecs]',
      category: 'compat_hack',
      choices: [
        {
          value: 'enabled',
          label: 'enabled',
        },
        {
          value: 'disabled',
          label: 'disabled',
        },
      ],
      defaultValue: 'enabled',
    },
    {
      id: 'pcsx_rearmed_exception_emulation',
      label: 'Exception and Breakpoint Emulation',
      description:
        "Enable emulation of some almost never used PSX's debug features. This causes a performance hit, is not useful for games and is intended for PSX homebrew and romhack developers only. Only enable if you know what you are doing. [Interpreter only]",
      category: 'compat_hack',
      choices: [
        {
          value: 'disabled',
          label: 'disabled',
        },
        {
          value: 'enabled',
          label: 'enabled',
        },
      ],
      defaultValue: 'disabled',
    },
    {
      id: 'pcsx_rearmed_cd_turbo',
      label: 'Turbo CD',
      description:
        'This makes the emulated CD-ROM extremely fast and can reduce loading times in some cases. Warning: many games were not programmed to handle such a speed. The game (or even the emulator) MAY CRASH at ANY TIME if this is enabled.',
      category: 'speed_hack',
      choices: [
        {
          value: 'disabled',
          label: 'disabled',
        },
        {
          value: 'enabled',
          label: 'enabled',
        },
      ],
      defaultValue: 'disabled',
    },
    {
      id: 'pcsx_rearmed_nostalls',
      label: 'Disable CPU/GTE Stalls',
      description:
        'Will cause some games to run too quickly. Should be disabled in almost all cases.',
      category: 'speed_hack',
      choices: [
        {
          value: 'disabled',
          label: 'disabled',
        },
        {
          value: 'enabled',
          label: 'enabled',
        },
      ],
      defaultValue: 'disabled',
    },
  ],
  snes9x: [
    {
      id: 'snes9x_region',
      label: 'Console Region (Reload Core)',
      description:
        "Specify which region the system is from. 'PAL' is 50hz, 'NTSC' is 60hz. Games will run faster or slower than normal if the incorrect region is selected.",
      choices: [
        {
          value: 'auto',
          label: 'Auto',
        },
        {
          value: 'ntsc',
          label: 'NTSC',
        },
        {
          value: 'pal',
          label: 'PAL',
        },
      ],
      defaultValue: 'auto',
    },
    {
      id: 'snes9x_aspect',
      label: 'Preferred Aspect Ratio',
      description:
        "Choose the preferred content aspect ratio. This will only apply when RetroArch's aspect ratio is set to 'Core provided' in the Video settings.",
      choices: [
        {
          value: '4:3',
          label: '4:3',
        },
        {
          value: '4:3 scaled',
          label: '4:3 (Preserved)',
        },
        {
          value: 'uncorrected',
          label: 'Uncorrected',
        },
        {
          value: 'auto',
          label: 'Auto',
        },
        {
          value: 'ntsc',
          label: 'NTSC',
        },
        {
          value: 'pal',
          label: 'PAL',
        },
      ],
      defaultValue: '4:3',
    },
    {
      id: 'snes9x_overscan',
      label: 'Crop Overscan',
      description:
        "Remove the borders at the top and bottom of the screen, typically unused by games and hidden by the bezel of a standard-definition television. 'Auto' will attempt to detect and crop the ~8 pixel overscan based on the current content.",
      choices: [
        {
          value: 'enabled',
          label: '~8 Pixels',
        },
        {
          value: '12_pixels',
          label: '12 Pixels',
        },
        {
          value: '16_pixels',
          label: '16 Pixels',
        },
        {
          value: 'auto',
          label: 'Auto (~8 Pixels)',
        },
        {
          value: 'disabled',
          label: 'disabled',
        },
      ],
      defaultValue: 'enabled',
    },
    {
      id: 'snes9x_mode7_hires',
      label: 'HD Mode 7 Scale',
      description:
        'Render Mode 7 backgrounds at a higher horizontal resolution. 2x/4x sample the rotation matrix at sub-pixel steps; the _hv variants additionally resample vertically for square pixels. From snes9x2010.',
      choices: [
        {
          value: 'disabled',
          label: 'disabled',
        },
        {
          value: '2x',
          label: '2x',
        },
        {
          value: '4x',
          label: '4x',
        },
        {
          value: '2x_hv',
          label: '2x (H+V)',
        },
        {
          value: '4x_hv',
          label: '4x (H+V)',
        },
      ],
      defaultValue: 'disabled',
    },
    {
      id: 'snes9x_mode7_hires_bilinear',
      label: 'HD Mode 7 Filtering',
      description:
        "Texture sampling filter for HD Mode 7. 'Stable' bilinear snaps to texel centres to avoid shimmer; 'Smooth' is full bilinear.",
      choices: [
        {
          value: 'disabled',
          label: 'disabled',
        },
        {
          value: 'stable',
          label: 'Stable',
        },
        {
          value: 'smooth',
          label: 'Smooth',
        },
      ],
      defaultValue: 'disabled',
    },
    {
      id: 'snes9x_hires_blend',
      label: 'Hi-Res Blending',
      description:
        "Blend adjacent pixels when game switches to hi-res mode (512x448). Required for certain games that use hi-res mode to produce transparency effects (Kirby's Dream Land, Jurassic Park...).",
      choices: [
        {
          value: 'disabled',
          label: 'disabled',
        },
        {
          value: 'merge',
          label: 'Merge',
        },
        {
          value: 'blur',
          label: 'Blur',
        },
      ],
      defaultValue: 'disabled',
    },
    {
      id: 'snes9x_blargg',
      label: 'Blargg NTSC Filter',
      description: 'Apply a video filter to mimic various NTSC TV signals.',
      choices: [
        {
          value: 'disabled',
          label: 'disabled',
        },
        {
          value: 'monochrome',
          label: 'Monochrome',
        },
        {
          value: 'rf',
          label: 'RF',
        },
        {
          value: 'composite',
          label: 'Composite',
        },
        {
          value: 's-video',
          label: 'S-Video',
        },
        {
          value: 'rgb',
          label: 'RGB',
        },
      ],
      defaultValue: 'disabled',
    },
    {
      id: 'snes9x_audio_interpolation',
      label: 'Audio Interpolation',
      description:
        "Apply an audio filter. 'Gaussian' reproduces the bass-heavy sound of the original hardware. 'Cubic' and 'Sinc' are less accurate, and preserve more of the high range.",
      choices: [
        {
          value: 'gaussian',
          label: 'Gaussian',
        },
        {
          value: 'cubic',
          label: 'Cubic',
        },
        {
          value: 'sinc',
          label: 'Sinc',
        },
        {
          value: 'none',
          label: 'None',
        },
        {
          value: 'linear',
          label: 'Linear',
        },
      ],
      defaultValue: 'gaussian',
    },
    {
      id: 'snes9x_up_down_allowed',
      label: 'Allow Opposing Directions',
      description:
        'Enabling this will allow pressing / quickly alternating / holding both left and right (or up and down) directions at the same time. This may cause movement-based glitches.',
      choices: [
        {
          value: 'disabled',
          label: 'disabled',
        },
        {
          value: 'enabled',
          label: 'enabled',
        },
      ],
      defaultValue: 'disabled',
    },
    {
      id: 'snes9x_overclock_superfx',
      label: 'SuperFX Overclocking',
      description:
        'SuperFX coprocessor frequency multiplier. Can improve frame rate or cause timing errors. Values under 100% can improve game performance on slow devices.',
      category: 'hacks',
      choices: [
        {
          value: '50%',
          label: '50%',
        },
        {
          value: '60%',
          label: '60%',
        },
        {
          value: '70%',
          label: '70%',
        },
        {
          value: '80%',
          label: '80%',
        },
        {
          value: '90%',
          label: '90%',
        },
        {
          value: '100%',
          label: '100%',
        },
        {
          value: '150%',
          label: '150%',
        },
        {
          value: '200%',
          label: '200%',
        },
        {
          value: '250%',
          label: '250%',
        },
        {
          value: '300%',
          label: '300%',
        },
        {
          value: '350%',
          label: '350%',
        },
        {
          value: '400%',
          label: '400%',
        },
        {
          value: '450%',
          label: '450%',
        },
        {
          value: '500%',
          label: '500%',
        },
      ],
      defaultValue: '100%',
    },
    {
      id: 'snes9x_superfx_timing',
      label: 'SuperFX Timing Model (Experimental)',
      description:
        "'Compatibility' runs the GSU with snes9x2010's field-tested per-line budget. 'Hardware-derived' charges each instruction its approximate real GSU cycle cost (cache-aware fetches, 5-cycle memory accesses, amortized plot flushes), matching ares/MiSTer wait states; backported from mainline Snes9x. More accurate, less field-tested. Works together with SuperFX Overclocking.",
      category: 'hacks',
      choices: [
        {
          value: 'compat',
          label: 'Compatibility (snes9x2010)',
        },
        {
          value: 'hardware',
          label: 'Hardware-derived',
        },
      ],
      defaultValue: 'compat',
    },
    {
      id: 'snes9x_overclock_cycles',
      label: 'Reduce Slowdown (Unsafe)',
      description:
        "Overclock SNES CPU. May cause games to crash! Use 'Light' for shorter loading times, 'Compatible' for most games exhibiting slowdown and 'Max' only if absolutely required (Gradius 3, Super R-type...).",
      category: 'hacks',
      choices: [
        {
          value: 'disabled',
          label: 'disabled',
        },
        {
          value: 'light',
          label: 'Light',
        },
        {
          value: 'compatible',
          label: 'Compatible',
        },
        {
          value: 'max',
          label: 'Max',
        },
      ],
      defaultValue: 'disabled',
    },
    {
      id: 'snes9x_reduce_sprite_flicker',
      label: 'Reduce Flickering (Unsafe)',
      description:
        'Increases number of sprites that can be drawn simultaneously on screen.',
      category: 'hacks',
      choices: [
        {
          value: 'disabled',
          label: 'disabled',
        },
        {
          value: 'enabled',
          label: 'enabled',
        },
      ],
      defaultValue: 'disabled',
    },
    {
      id: 'snes9x_randomize_memory',
      label: 'Randomize Memory (Unsafe)',
      description:
        "Randomizes system RAM upon start-up. Some games such as 'Super Off Road' use system RAM as a random number generator for item placement and AI behavior, to make gameplay more unpredictable.",
      category: 'hacks',
      choices: [
        {
          value: 'disabled',
          label: 'disabled',
        },
        {
          value: 'enabled',
          label: 'enabled',
        },
      ],
      defaultValue: 'disabled',
    },
    {
      id: 'snes9x_block_invalid_vram_access',
      label: 'Block Invalid VRAM Access',
      description:
        'Some homebrew/ROM hacks require this option to be disabled for correct operation.',
      category: 'hacks',
      choices: [
        {
          value: 'enabled',
          label: 'enabled',
        },
        {
          value: 'disabled',
          label: 'disabled',
        },
      ],
      defaultValue: 'enabled',
    },
    {
      id: 'snes9x_echo_buffer_hack',
      label: 'Echo Buffer Hack (Unsafe, only enable for old addmusic hacks)',
      description:
        'Some homebrew/ROM hacks require this option to be enabled for correct operation.',
      category: 'hacks',
      choices: [
        {
          value: 'disabled',
          label: 'disabled',
        },
        {
          value: 'enabled',
          label: 'enabled',
        },
      ],
      defaultValue: 'disabled',
    },
    {
      id: 'snes9x_show_lightgun_settings',
      label: 'Show Light Gun Settings',
      description:
        'Enable configuration of Super Scope / Justifier / M.A.C.S. rifle input. NOTE: Quick Menu must be toggled for this setting to take effect.',
      choices: [
        {
          value: 'enabled',
          label: 'enabled',
        },
        {
          value: 'disabled',
          label: 'disabled',
        },
      ],
      defaultValue: 'disabled',
    },
    {
      id: 'snes9x_lightgun_mode',
      label: 'Mode',
      description: "Use a mouse-controlled 'Light Gun' or 'Touchscreen' input.",
      category: 'lightgun',
      choices: [
        {
          value: 'Lightgun',
          label: 'Light Gun',
        },
        {
          value: 'Touchscreen',
          label: 'Touchscreen',
        },
      ],
      defaultValue: 'Lightgun',
    },
    {
      id: 'snes9x_superscope_reverse_buttons',
      label: 'Super Scope Reverse Trigger Buttons',
      description:
        "Swap the positions of the Super Scope 'Fire' and 'Cursor' buttons.",
      category: 'lightgun',
      choices: [
        {
          value: 'disabled',
          label: 'disabled',
        },
        {
          value: 'enabled',
          label: 'enabled',
        },
      ],
      defaultValue: 'disabled',
    },
    {
      id: 'snes9x_superscope_crosshair',
      label: 'Super Scope Crosshair',
      description: 'Change the crosshair size on screen.',
      category: 'lightgun',
      choices: [
        {
          value: '0',
          label: '0',
        },
        {
          value: '1',
          label: '1',
        },
        {
          value: '2',
          label: '2',
        },
        {
          value: '3',
          label: '3',
        },
        {
          value: '4',
          label: '4',
        },
        {
          value: '5',
          label: '5',
        },
        {
          value: '6',
          label: '6',
        },
        {
          value: '7',
          label: '7',
        },
        {
          value: '8',
          label: '8',
        },
        {
          value: '9',
          label: '9',
        },
        {
          value: '10',
          label: '10',
        },
        {
          value: '11',
          label: '11',
        },
        {
          value: '12',
          label: '12',
        },
        {
          value: '13',
          label: '13',
        },
        {
          value: '14',
          label: '14',
        },
        {
          value: '15',
          label: '15',
        },
        {
          value: '16',
          label: '16',
        },
      ],
      defaultValue: '2',
    },
    {
      id: 'snes9x_superscope_color',
      label: 'Super Scope Color',
      description: 'Change the crosshair color on screen.',
      category: 'lightgun',
      choices: [
        {
          value: 'White',
          label: 'White',
        },
        {
          value: 'White (blend)',
          label: 'White (blend)',
        },
        {
          value: 'Red',
          label: 'Red',
        },
        {
          value: 'Red (blend)',
          label: 'Red (blend)',
        },
        {
          value: 'Orange',
          label: 'Orange',
        },
        {
          value: 'Orange (blend)',
          label: 'Orange (blend)',
        },
        {
          value: 'Yellow',
          label: 'Yellow',
        },
        {
          value: 'Yellow (blend)',
          label: 'Yellow (blend)',
        },
        {
          value: 'Green',
          label: 'Green',
        },
        {
          value: 'Green (blend)',
          label: 'Green (blend)',
        },
        {
          value: 'Cyan',
          label: 'Cyan',
        },
        {
          value: 'Cyan (blend)',
          label: 'Cyan (blend)',
        },
        {
          value: 'Sky',
          label: 'Sky',
        },
        {
          value: 'Sky (blend)',
          label: 'Sky (blend)',
        },
        {
          value: 'Blue',
          label: 'Blue',
        },
        {
          value: 'Blue (blend)',
          label: 'Blue (blend)',
        },
        {
          value: 'Violet',
          label: 'Violet',
        },
        {
          value: 'Violet (blend)',
          label: 'Violet (blend)',
        },
        {
          value: 'Pink',
          label: 'Pink',
        },
        {
          value: 'Pink (blend)',
          label: 'Pink (blend)',
        },
        {
          value: 'Purple',
          label: 'Purple',
        },
        {
          value: 'Purple (blend)',
          label: 'Purple (blend)',
        },
        {
          value: 'Black',
          label: 'Black',
        },
        {
          value: 'Black (blend)',
          label: 'Black (blend)',
        },
        {
          value: '25% Grey',
          label: '25% Grey',
        },
        {
          value: '25% Grey (blend)',
          label: '25% Grey (blend)',
        },
        {
          value: '50% Grey',
          label: '50% Grey',
        },
        {
          value: '50% Grey (blend)',
          label: '50% Grey (blend)',
        },
        {
          value: '75% Grey',
          label: '75% Grey',
        },
        {
          value: '75% Grey (blend)',
          label: '75% Grey (blend)',
        },
      ],
      defaultValue: 'White',
    },
    {
      id: 'snes9x_justifier1_crosshair',
      label: 'Justifier 1 Crosshair',
      description: 'Change the crosshair size on screen.',
      category: 'lightgun',
      choices: [
        {
          value: '0',
          label: '0',
        },
        {
          value: '1',
          label: '1',
        },
        {
          value: '2',
          label: '2',
        },
        {
          value: '3',
          label: '3',
        },
        {
          value: '4',
          label: '4',
        },
        {
          value: '5',
          label: '5',
        },
        {
          value: '6',
          label: '6',
        },
        {
          value: '7',
          label: '7',
        },
        {
          value: '8',
          label: '8',
        },
        {
          value: '9',
          label: '9',
        },
        {
          value: '10',
          label: '10',
        },
        {
          value: '11',
          label: '11',
        },
        {
          value: '12',
          label: '12',
        },
        {
          value: '13',
          label: '13',
        },
        {
          value: '14',
          label: '14',
        },
        {
          value: '15',
          label: '15',
        },
        {
          value: '16',
          label: '16',
        },
      ],
      defaultValue: '4',
    },
    {
      id: 'snes9x_justifier1_color',
      label: 'Justifier 1 Color',
      description: 'Change the crosshair color on screen.',
      category: 'lightgun',
      choices: [
        {
          value: 'Blue',
          label: 'Blue',
        },
        {
          value: 'Blue (blend)',
          label: 'Blue (blend)',
        },
        {
          value: 'Violet',
          label: 'Violet',
        },
        {
          value: 'Violet (blend)',
          label: 'Violet (blend)',
        },
        {
          value: 'Pink',
          label: 'Pink',
        },
        {
          value: 'Pink (blend)',
          label: 'Pink (blend)',
        },
        {
          value: 'Purple',
          label: 'Purple',
        },
        {
          value: 'Purple (blend)',
          label: 'Purple (blend)',
        },
        {
          value: 'Black',
          label: 'Black',
        },
        {
          value: 'Black (blend)',
          label: 'Black (blend)',
        },
        {
          value: '25% Grey',
          label: '25% Grey',
        },
        {
          value: '25% Grey (blend)',
          label: '25% Grey (blend)',
        },
        {
          value: '50% Grey',
          label: '50% Grey',
        },
        {
          value: '50% Grey (blend)',
          label: '50% Grey (blend)',
        },
        {
          value: '75% Grey',
          label: '75% Grey',
        },
        {
          value: '75% Grey (blend)',
          label: '75% Grey (blend)',
        },
        {
          value: 'White',
          label: 'White',
        },
        {
          value: 'White (blend)',
          label: 'White (blend)',
        },
        {
          value: 'Red',
          label: 'Red',
        },
        {
          value: 'Red (blend)',
          label: 'Red (blend)',
        },
        {
          value: 'Orange',
          label: 'Orange',
        },
        {
          value: 'Orange (blend)',
          label: 'Orange (blend)',
        },
        {
          value: 'Yellow',
          label: 'Yellow',
        },
        {
          value: 'Yellow (blend)',
          label: 'Yellow (blend)',
        },
        {
          value: 'Green',
          label: 'Green',
        },
        {
          value: 'Green (blend)',
          label: 'Green (blend)',
        },
        {
          value: 'Cyan',
          label: 'Cyan',
        },
        {
          value: 'Cyan (blend)',
          label: 'Cyan (blend)',
        },
        {
          value: 'Sky',
          label: 'Sky',
        },
        {
          value: 'Sky (blend)',
          label: 'Sky (blend)',
        },
      ],
      defaultValue: 'Blue',
    },
    {
      id: 'snes9x_justifier2_crosshair',
      label: 'Justifier 2 Crosshair',
      description: 'Change the crosshair size on screen.',
      category: 'lightgun',
      choices: [
        {
          value: '0',
          label: '0',
        },
        {
          value: '1',
          label: '1',
        },
        {
          value: '2',
          label: '2',
        },
        {
          value: '3',
          label: '3',
        },
        {
          value: '4',
          label: '4',
        },
        {
          value: '5',
          label: '5',
        },
        {
          value: '6',
          label: '6',
        },
        {
          value: '7',
          label: '7',
        },
        {
          value: '8',
          label: '8',
        },
        {
          value: '9',
          label: '9',
        },
        {
          value: '10',
          label: '10',
        },
        {
          value: '11',
          label: '11',
        },
        {
          value: '12',
          label: '12',
        },
        {
          value: '13',
          label: '13',
        },
        {
          value: '14',
          label: '14',
        },
        {
          value: '15',
          label: '15',
        },
        {
          value: '16',
          label: '16',
        },
      ],
      defaultValue: '4',
    },
    {
      id: 'snes9x_justifier2_color',
      label: 'Justifier 2 Color',
      description: 'Change the crosshair color on screen.',
      category: 'lightgun',
      choices: [
        {
          value: 'Pink',
          label: 'Pink',
        },
        {
          value: 'Pink (blend)',
          label: 'Pink (blend)',
        },
        {
          value: 'Purple',
          label: 'Purple',
        },
        {
          value: 'Purple (blend)',
          label: 'Purple (blend)',
        },
        {
          value: 'Black',
          label: 'Black',
        },
        {
          value: 'Black (blend)',
          label: 'Black (blend)',
        },
        {
          value: '25% Grey',
          label: '25% Grey',
        },
        {
          value: '25% Grey (blend)',
          label: '25% Grey (blend)',
        },
        {
          value: '50% Grey',
          label: '50% Grey',
        },
        {
          value: '50% Grey (blend)',
          label: '50% Grey (blend)',
        },
        {
          value: '75% Grey',
          label: '75% Grey',
        },
        {
          value: '75% Grey (blend)',
          label: '75% Grey (blend)',
        },
        {
          value: 'White',
          label: 'White',
        },
        {
          value: 'White (blend)',
          label: 'White (blend)',
        },
        {
          value: 'Red',
          label: 'Red',
        },
        {
          value: 'Red (blend)',
          label: 'Red (blend)',
        },
        {
          value: 'Orange',
          label: 'Orange',
        },
        {
          value: 'Orange (blend)',
          label: 'Orange (blend)',
        },
        {
          value: 'Yellow',
          label: 'Yellow',
        },
        {
          value: 'Yellow (blend)',
          label: 'Yellow (blend)',
        },
        {
          value: 'Green',
          label: 'Green',
        },
        {
          value: 'Green (blend)',
          label: 'Green (blend)',
        },
        {
          value: 'Cyan',
          label: 'Cyan',
        },
        {
          value: 'Cyan (blend)',
          label: 'Cyan (blend)',
        },
        {
          value: 'Sky',
          label: 'Sky',
        },
        {
          value: 'Sky (blend)',
          label: 'Sky (blend)',
        },
        {
          value: 'Blue',
          label: 'Blue',
        },
        {
          value: 'Blue (blend)',
          label: 'Blue (blend)',
        },
        {
          value: 'Violet',
          label: 'Violet',
        },
        {
          value: 'Violet (blend)',
          label: 'Violet (blend)',
        },
      ],
      defaultValue: 'Pink',
    },
    {
      id: 'snes9x_rifle_crosshair',
      label: 'M.A.C.S. Rifle Crosshair',
      description: 'Change the crosshair size on screen.',
      category: 'lightgun',
      choices: [
        {
          value: '0',
          label: '0',
        },
        {
          value: '1',
          label: '1',
        },
        {
          value: '2',
          label: '2',
        },
        {
          value: '3',
          label: '3',
        },
        {
          value: '4',
          label: '4',
        },
        {
          value: '5',
          label: '5',
        },
        {
          value: '6',
          label: '6',
        },
        {
          value: '7',
          label: '7',
        },
        {
          value: '8',
          label: '8',
        },
        {
          value: '9',
          label: '9',
        },
        {
          value: '10',
          label: '10',
        },
        {
          value: '11',
          label: '11',
        },
        {
          value: '12',
          label: '12',
        },
        {
          value: '13',
          label: '13',
        },
        {
          value: '14',
          label: '14',
        },
        {
          value: '15',
          label: '15',
        },
        {
          value: '16',
          label: '16',
        },
      ],
      defaultValue: '2',
    },
    {
      id: 'snes9x_rifle_color',
      label: 'M.A.C.S. Rifle Color',
      description: 'Change the crosshair color on screen.',
      category: 'lightgun',
      choices: [
        {
          value: 'White',
          label: 'White',
        },
        {
          value: 'White (blend)',
          label: 'White (blend)',
        },
        {
          value: 'Red',
          label: 'Red',
        },
        {
          value: 'Red (blend)',
          label: 'Red (blend)',
        },
        {
          value: 'Orange',
          label: 'Orange',
        },
        {
          value: 'Orange (blend)',
          label: 'Orange (blend)',
        },
        {
          value: 'Yellow',
          label: 'Yellow',
        },
        {
          value: 'Yellow (blend)',
          label: 'Yellow (blend)',
        },
        {
          value: 'Green',
          label: 'Green',
        },
        {
          value: 'Green (blend)',
          label: 'Green (blend)',
        },
        {
          value: 'Cyan',
          label: 'Cyan',
        },
        {
          value: 'Cyan (blend)',
          label: 'Cyan (blend)',
        },
        {
          value: 'Sky',
          label: 'Sky',
        },
        {
          value: 'Sky (blend)',
          label: 'Sky (blend)',
        },
        {
          value: 'Blue',
          label: 'Blue',
        },
        {
          value: 'Blue (blend)',
          label: 'Blue (blend)',
        },
        {
          value: 'Violet',
          label: 'Violet',
        },
        {
          value: 'Violet (blend)',
          label: 'Violet (blend)',
        },
        {
          value: 'Pink',
          label: 'Pink',
        },
        {
          value: 'Pink (blend)',
          label: 'Pink (blend)',
        },
        {
          value: 'Purple',
          label: 'Purple',
        },
        {
          value: 'Purple (blend)',
          label: 'Purple (blend)',
        },
        {
          value: 'Black',
          label: 'Black',
        },
        {
          value: 'Black (blend)',
          label: 'Black (blend)',
        },
        {
          value: '25% Grey',
          label: '25% Grey',
        },
        {
          value: '25% Grey (blend)',
          label: '25% Grey (blend)',
        },
        {
          value: '50% Grey',
          label: '50% Grey',
        },
        {
          value: '50% Grey (blend)',
          label: '50% Grey (blend)',
        },
        {
          value: '75% Grey',
          label: '75% Grey',
        },
        {
          value: '75% Grey (blend)',
          label: '75% Grey (blend)',
        },
      ],
      defaultValue: 'White',
    },
    {
      id: 'snes9x_msu1_enhanced_audio',
      label: 'MSU-1 Enhanced Audio',
      description:
        "Run the audio pipeline at 44.1 kHz when an MSU-1 game is loaded. When disabled, MSU-1's 44.1 kHz PCM stream is decimated to the SNES's native ~32 kHz output with no anti-alias filtering, folding the track's top octave into the audible band as slight hiss. When enabled, the MSU-1 stream passes through bit-exactly and the SPC sound is upsampled cleanly. Has no effect on non-MSU-1 games. Changing this takes effect on the next content load.",
      choices: [
        {
          value: 'enabled',
          label: 'enabled',
        },
        {
          value: 'disabled',
          label: 'disabled',
        },
      ],
      defaultValue: 'enabled',
    },
    {
      id: 'snes9x_show_advanced_av_settings',
      label: 'Show Advanced Audio/Video Settings',
      description:
        'Enable configuration of low-level video layer / GFX effect / audio channel parameters. NOTE: Quick Menu must be toggled for this setting to take effect.',
      choices: [
        {
          value: 'enabled',
          label: 'enabled',
        },
        {
          value: 'disabled',
          label: 'disabled',
        },
      ],
      defaultValue: 'disabled',
    },
    {
      id: 'snes9x_layer_1',
      label: 'Show Layer 1',
      category: 'advanced_av',
      choices: [
        {
          value: 'enabled',
          label: 'enabled',
        },
        {
          value: 'disabled',
          label: 'disabled',
        },
      ],
      defaultValue: 'enabled',
    },
    {
      id: 'snes9x_layer_2',
      label: 'Show Layer 2',
      category: 'advanced_av',
      choices: [
        {
          value: 'enabled',
          label: 'enabled',
        },
        {
          value: 'disabled',
          label: 'disabled',
        },
      ],
      defaultValue: 'enabled',
    },
    {
      id: 'snes9x_layer_3',
      label: 'Show Layer 3',
      category: 'advanced_av',
      choices: [
        {
          value: 'enabled',
          label: 'enabled',
        },
        {
          value: 'disabled',
          label: 'disabled',
        },
      ],
      defaultValue: 'enabled',
    },
    {
      id: 'snes9x_layer_4',
      label: 'Show Layer 4',
      category: 'advanced_av',
      choices: [
        {
          value: 'enabled',
          label: 'enabled',
        },
        {
          value: 'disabled',
          label: 'disabled',
        },
      ],
      defaultValue: 'enabled',
    },
    {
      id: 'snes9x_layer_5',
      label: 'Show Sprite Layer',
      category: 'advanced_av',
      choices: [
        {
          value: 'enabled',
          label: 'enabled',
        },
        {
          value: 'disabled',
          label: 'disabled',
        },
      ],
      defaultValue: 'enabled',
    },
    {
      id: 'snes9x_gfx_transp',
      label: 'Enable Transparency Effects',
      category: 'advanced_av',
      choices: [
        {
          value: 'enabled',
          label: 'enabled',
        },
        {
          value: 'disabled',
          label: 'disabled',
        },
      ],
      defaultValue: 'enabled',
    },
    {
      id: 'snes9x_sndchan_volume_1',
      label: 'Volume % for Sound Channel 1',
      category: 'advanced_av',
      choices: [
        {
          value: '0',
          label: '0',
        },
        {
          value: '10',
          label: '10',
        },
        {
          value: '20',
          label: '20',
        },
        {
          value: '30',
          label: '30',
        },
        {
          value: '40',
          label: '40',
        },
        {
          value: '50',
          label: '50',
        },
        {
          value: '60',
          label: '60',
        },
        {
          value: '70',
          label: '70',
        },
        {
          value: '80',
          label: '80',
        },
        {
          value: '90',
          label: '90',
        },
        {
          value: '100',
          label: '100',
        },
      ],
      defaultValue: '100',
    },
    {
      id: 'snes9x_sndchan_volume_2',
      label: 'Volume % for Sound Channel 2',
      category: 'advanced_av',
      choices: [
        {
          value: '0',
          label: '0',
        },
        {
          value: '10',
          label: '10',
        },
        {
          value: '20',
          label: '20',
        },
        {
          value: '30',
          label: '30',
        },
        {
          value: '40',
          label: '40',
        },
        {
          value: '50',
          label: '50',
        },
        {
          value: '60',
          label: '60',
        },
        {
          value: '70',
          label: '70',
        },
        {
          value: '80',
          label: '80',
        },
        {
          value: '90',
          label: '90',
        },
        {
          value: '100',
          label: '100',
        },
      ],
      defaultValue: '100',
    },
    {
      id: 'snes9x_sndchan_volume_3',
      label: 'Volume % for Sound Channel 3',
      category: 'advanced_av',
      choices: [
        {
          value: '0',
          label: '0',
        },
        {
          value: '10',
          label: '10',
        },
        {
          value: '20',
          label: '20',
        },
        {
          value: '30',
          label: '30',
        },
        {
          value: '40',
          label: '40',
        },
        {
          value: '50',
          label: '50',
        },
        {
          value: '60',
          label: '60',
        },
        {
          value: '70',
          label: '70',
        },
        {
          value: '80',
          label: '80',
        },
        {
          value: '90',
          label: '90',
        },
        {
          value: '100',
          label: '100',
        },
      ],
      defaultValue: '100',
    },
    {
      id: 'snes9x_sndchan_volume_4',
      label: 'Volume % for Sound Channel 4',
      category: 'advanced_av',
      choices: [
        {
          value: '0',
          label: '0',
        },
        {
          value: '10',
          label: '10',
        },
        {
          value: '20',
          label: '20',
        },
        {
          value: '30',
          label: '30',
        },
        {
          value: '40',
          label: '40',
        },
        {
          value: '50',
          label: '50',
        },
        {
          value: '60',
          label: '60',
        },
        {
          value: '70',
          label: '70',
        },
        {
          value: '80',
          label: '80',
        },
        {
          value: '90',
          label: '90',
        },
        {
          value: '100',
          label: '100',
        },
      ],
      defaultValue: '100',
    },
    {
      id: 'snes9x_sndchan_volume_5',
      label: 'Volume % for Sound Channel 5',
      category: 'advanced_av',
      choices: [
        {
          value: '0',
          label: '0',
        },
        {
          value: '10',
          label: '10',
        },
        {
          value: '20',
          label: '20',
        },
        {
          value: '30',
          label: '30',
        },
        {
          value: '40',
          label: '40',
        },
        {
          value: '50',
          label: '50',
        },
        {
          value: '60',
          label: '60',
        },
        {
          value: '70',
          label: '70',
        },
        {
          value: '80',
          label: '80',
        },
        {
          value: '90',
          label: '90',
        },
        {
          value: '100',
          label: '100',
        },
      ],
      defaultValue: '100',
    },
    {
      id: 'snes9x_sndchan_volume_6',
      label: 'Volume % for Sound Channel 6',
      category: 'advanced_av',
      choices: [
        {
          value: '0',
          label: '0',
        },
        {
          value: '10',
          label: '10',
        },
        {
          value: '20',
          label: '20',
        },
        {
          value: '30',
          label: '30',
        },
        {
          value: '40',
          label: '40',
        },
        {
          value: '50',
          label: '50',
        },
        {
          value: '60',
          label: '60',
        },
        {
          value: '70',
          label: '70',
        },
        {
          value: '80',
          label: '80',
        },
        {
          value: '90',
          label: '90',
        },
        {
          value: '100',
          label: '100',
        },
      ],
      defaultValue: '100',
    },
    {
      id: 'snes9x_sndchan_volume_7',
      label: 'Volume % for Sound Channel 7',
      category: 'advanced_av',
      choices: [
        {
          value: '0',
          label: '0',
        },
        {
          value: '10',
          label: '10',
        },
        {
          value: '20',
          label: '20',
        },
        {
          value: '30',
          label: '30',
        },
        {
          value: '40',
          label: '40',
        },
        {
          value: '50',
          label: '50',
        },
        {
          value: '60',
          label: '60',
        },
        {
          value: '70',
          label: '70',
        },
        {
          value: '80',
          label: '80',
        },
        {
          value: '90',
          label: '90',
        },
        {
          value: '100',
          label: '100',
        },
      ],
      defaultValue: '100',
    },
    {
      id: 'snes9x_sndchan_volume_8',
      label: 'Volume % for Sound Channel 8',
      category: 'advanced_av',
      choices: [
        {
          value: '0',
          label: '0',
        },
        {
          value: '10',
          label: '10',
        },
        {
          value: '20',
          label: '20',
        },
        {
          value: '30',
          label: '30',
        },
        {
          value: '40',
          label: '40',
        },
        {
          value: '50',
          label: '50',
        },
        {
          value: '60',
          label: '60',
        },
        {
          value: '70',
          label: '70',
        },
        {
          value: '80',
          label: '80',
        },
        {
          value: '90',
          label: '90',
        },
        {
          value: '100',
          label: '100',
        },
      ],
      defaultValue: '100',
    },
  ],
};
