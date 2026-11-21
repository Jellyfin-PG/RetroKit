# RetroKit

[![CI](https://github.com/Jellyfin-PG/RetroKit/actions/workflows/ci.yml/badge.svg)](https://github.com/Jellyfin-PG/RetroKit/actions/workflows/ci.yml)
[![Publish](https://github.com/Jellyfin-PG/RetroKit/actions/workflows/publish.yml/badge.svg)](https://github.com/Jellyfin-PG/RetroKit/actions/workflows/publish.yml)
[![npm version](https://img.shields.io/npm/v/@grimmdev/retrokit.svg)](https://www.npmjs.com/package/@grimmdev/retrokit)
[![npm downloads](https://img.shields.io/npm/dm/@grimmdev/retrokit.svg)](https://www.npmjs.com/package/@grimmdev/retrokit)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)

Unified, headless WebAssembly emulation runtime for modern web applications. RetroKit provides an engine-agnostic API over Libretro, EmulatorJS, Play! (PS2), Lexaloffle PICO-8, LOVE (love.js), and Adobe Flash (Ruffle) without forcing any predefined UI or DOM styling.

## Features

- Headless Architecture: Complete separation of emulation backend from user interface. Bind to any HTML5 Canvas and inject virtual input programmatically or listen to physical controllers.
- Multi-Engine Core Adapters:
  - Libretro: Direct Emscripten WebAssembly libretro core bridge.
  - EmulatorJS: Bundled 7z core decompression with multi-threading, WebGL2 context configuration, and runtime hooks.
  - Play! (Purei): PlayStation 2 WebAssembly architecture with disc swapping and dual analog sticks.
  - PICO-8: Native Lexaloffle web runtime integration with support for both `.p8.png` cartridges and `.p8` text carts.
  - LOVE (love.js): Full LOVE 11.5 WebAssembly runtime with filesystem normalization and synchronous Lua-to-JavaScript bridging.
  - Ruffle: Adobe Flash runtime integration with ActionScript 1/2/3 vector rendering.
- State and SRAM Persistence: Complete save state slot capturing and battery SRAM synchronization with export and import functionality.
- Input Channel Virtualization: Standard RetroPad mapping supporting physical Gamepad API, physical keyboard listeners, and programmatic button or analog stick injection for on-screen touch overlays.
- RetroAchievements: Full rcheevos protocol client with login, session token caching, unlock overlays, progress tracking, and hardcore mode enforcement.
- Video and Audio Management: Dynamic aspect ratio correction, integer scaling, fullscreen mode, Web Audio volume gain nodes, and mute control.

## Supported Platforms

| System | Primary Core / Adapter | Engine Family | File Formats |
| :--- | :--- | :--- | :--- |
| Sony PlayStation (PSX) | `pcsx_rearmed`, `mednafen_psx_hw`, `beetle_psx` | EmulatorJS / Libretro | `.iso`, `.bin`, `.cue`, `.chd`, `.pbp` |
| Sony PlayStation 2 (PS2) | `play` | Play! | `.iso`, `.bin`, `.chd`, `.cso`, `.isz` |
| Sony PlayStation Portable (PSP) | `ppsspp` | EmulatorJS | `.iso`, `.cso`, `.pbp` |
| Nintendo 3DS | `azahar` | EmulatorJS | `.3ds`, `.3dsx`, `.cia`, `.cxi` |
| Nintendo DS | `melonds`, `desmume`, `desmume2015` | EmulatorJS | `.nds`, `.bin` |
| Nintendo 64 | `mupen64plus_next`, `parallel_n64` | EmulatorJS / Libretro | `.n64`, `.z64`, `.v64` |
| Super Nintendo (SNES) | `snes9x`, `bsnes` | Libretro / EmulatorJS | `.sfc`, `.smc` |
| Nintendo Entertainment System (NES) | `fceumm`, `nestopia` | Libretro / EmulatorJS | `.nes`, `.fds`, `.unf` |
| Game Boy / Game Boy Color | `gambatte`, `gearboy` | Libretro / EmulatorJS | `.gb`, `.gbc` |
| Game Boy Advance | `mgba`, `vba_next` | Libretro / EmulatorJS | `.gba` |
| Sega Saturn | `yabause` | EmulatorJS | `.iso`, `.cue`, `.bin`, `.chd`, `.m3u` |
| Sega Genesis / Mega Drive / 32X / CD | `genesis_plus_gx`, `picodrive` | Libretro / EmulatorJS | `.md`, `.gen`, `.smd`, `.32x`, `.iso`, `.chd` |
| Sega Master System / Game Gear | `smsplus`, `gearsystem` | Libretro / EmulatorJS | `.sms`, `.gg` |
| MS-DOS | `dosbox_pure` | EmulatorJS | `.exe`, `.com`, `.bat`, `.dos`, `.zip`, `.iso` |
| 3DO Interactive Multiplayer | `opera` | EmulatorJS | `.iso`, `.chd`, `.cue` |
| Atari Jaguar | `virtualjaguar` | EmulatorJS | `.jag`, `.j64`, `.rom`, `.bin` |
| Atari 2600 / 5200 / 7800 / Lynx | `stella2014`, `a5200`, `prosystem`, `handy` | EmulatorJS / Libretro | `.a26`, `.a52`, `.a78`, `.lnx` |
| Commodore 64 / 128 / Amiga | `vice_x64sc`, `puae` | EmulatorJS | `.d64`, `.t64`, `.tap`, `.adf`, `.lha` |
| Arcade / Capcom CPS-1 / CPS-2 | `fbneo`, `mame2003_plus` | EmulatorJS / Libretro | `.zip`, `.7z` |
| PICO-8 | `pico8` | Lexaloffle Official | `.p8`, `.p8.png` |
| LOVE (Love2D) | `love` | 2dengine love.js 11.5 | `.love`, `.zip` |
| Adobe Flash | `ruffle` | Ruffle | `.swf` |

## Installation

```bash
npm install @grimmdev/retrokit
```

Or via GitHub Packages:

```bash
npm install @jellyfin-pg/retrokit --registry=https://npm.pkg.github.com
```

## Quick Start

```typescript
import { RetroKit } from '@grimmdev/retrokit';

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;

const emu = new RetroKit({
  canvas,
  assetBaseUrl: '/cores',
  onLog: (message, level) => console.log(`[${level}] ${message}`),
  onError: (err) => console.error('Emulator error:', err),
});

// Load a ROM file (accepts ArrayBuffer, Blob, File, or URL)
const response = await fetch('/roms/game.gba');
const romBuffer = await response.arrayBuffer();

await emu.load(romBuffer, {
  fileName: 'game.gba',
  system: 'gba', // Optional hint; auto-resolved if omitted
});

// Start playback
await emu.play();
```

## Input System

RetroKit is completely headless and provides two input channels that work simultaneously:

### 1. Programmatic Input Injection (Virtual / On-Screen Controls)

Ideal for mobile touch controls, custom d-pads, netplay relays, or automated test harnesses:

```typescript
// Digital button presses (Player 0 to N)
emu.input.player(0).sendButton('ACTION_DOWN', true);  // Press A / Cross
emu.input.player(0).sendButton('ACTION_DOWN', false); // Release
emu.input.player(0).sendButton('DPAD_UP', true);
emu.input.player(0).sendButton('START', true);

// Analog dual-stick injection (-1.0 to 1.0)
emu.input.player(0).sendAnalogStick('LEFT', -0.75, 0.25);
emu.input.player(0).sendAxis('L_STICK_X', 0.8);

// Turbo button firing (pulses button state automatically)
emu.input.player(0).setTurbo('ACTION_RIGHT', true, 60); // 60ms interval
```

### 2. Physical Hardware Listeners

RetroKit monitors connected physical gamepads via the Gamepad API and maps standard keyboard keys to RetroPad buttons. You can remap buttons per player:

```typescript
// Remap physical keyboard key for Player 1
emu.input.player(0).setKeyBinding('KeyZ', 'ACTION_DOWN');

// Remap physical gamepad button index
emu.input.player(0).setGamepadBinding(0, 'ACTION_DOWN');
```

## Save States and Battery SRAM

```typescript
// Save and load state slots
if (emu.capabilities.saveStates) {
  const record = await emu.state.saveState(0);
  await emu.state.loadState(0);
}

// Battery SRAM export and import
if (emu.capabilities.sram) {
  await emu.sram.flushSram();
  const sramData = await emu.sram.getSram(); // Uint8Array or Record<string, Uint8Array>

  // Restore SRAM from local file
  await emu.sram.setSram(savedBuffer, { restart: true });
}
```

## RetroAchievements

RetroKit includes built-in RetroAchievements integration using the official rcheevos protocol:

```typescript
// Log in
await emu.achievements.login('username', 'password_or_token');

// Hardcore mode (disables save states, cheats, and rewind)
emu.achievements.setHardcore(true);

// Listen to achievements events
emu.on('achievementUnlocked', (cheevo) => {
  console.log(`Unlocked: ${cheevo.title} (${cheevo.points} points)`);
});
```

## Cores Directory Configuration

Frontends can configure or dynamically switch the base URL or folder path where emulator core WebAssembly binaries and runtime assets are hosted:

```typescript
// Configure cores directory at runtime
emu.setCoresDirectory('https://cdn.example.com/cores');

// Or read current active directory
console.log('Active cores directory:', emu.coresDirectory);
```

You can also pass `coresDirectory` per game in `load()` options:

```typescript
await emu.load(romBuffer, {
  fileName: 'game.gba',
  coresDirectory: '/my-custom-cores',
});
```

## Complete API Documentation

For exhaustive documentation of all 14 subsystem managers, method signatures, parameters, return types, events, and configuration options, see the [Frontend API Reference](API.md).

## Development and Build

```bash
# Install dependencies
npm install

# Start local testbed development server
npm run dev

# Run typecheck and linting
npm run typecheck
npm run lint

# Build library bundles and TypeScript declarations
npm run build

# Run automated smoke test suite
npm test
```

## License

MIT License. See [LICENSE](LICENSE) for details.
