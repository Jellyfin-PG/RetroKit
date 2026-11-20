# emujs-headless: Unified Headless Emulation Runtime Specification

## 1. Executive Summary & Design Philosophy

**`emujs-headless`** is an enterprise-grade, framework-agnostic, headless WebAssembly emulation runtime designed to execute retro games and legacy web interactives with complete programmatic control.

### Core Design Philosophy: Native Capabilities & Graceful Virtual Bridges
1. **Zero UI Imposition**: The host application (e.g. **JellyEmu**, RomM, or custom web/electron applications) owns the entire user interface and simply supplies an HTML `<canvas>`.
2. **Standardization on Libretro**: Where possible, systems are driven through standard libretro WASM cores. With the inclusion of **`retro8`** from `web.libretro.com`, PICO-8 runs directly through the `LibretroAdapter`, eliminating the need for a fragile standalone PICO-8 web player scaffolding.
3. **No Fragile Retrofitting**: Rather than attempting to reverse-engineer or monkey-patch missing features into WebAssembly cores that lack native support, `emujs-headless` utilizes a **Capability-Driven Virtual Bridge Architecture**:
   - Each core explicitly declares its native capabilities via a `CoreCapabilities` manifest (e.g. whether it supports save states, battery RAM, cheats, core options, multi-disc, shaders, or rewind).
   - The `BaseCoreBridge` supplies safe, graceful no-op implementations for any unsupported feature. The host front-end can execute uniform API calls without wrapping every button or feature in brittle core-specific conditions.
   - Front-end HUDs can inspect `emu.capabilities` at runtime to automatically enable, disable, or hide corresponding UI toggles.
4. **Core Swapping per System**: Systems (e.g. NES, SNES, GBA, PS1) support multiple alternative WASM cores (e.g. switching from `snes9x` to `snes9x2010` for performance on low-power devices, or `fceumm` to `nestopia` for mapper accuracy).
5. **Strict Per-Player Input Isolation**: Input is isolated into dedicated, independent player channels (Player 1 through Player 4/8), each with its own gamepad hardware binding, keyboard layout, and programmatic event dispatcher.
6. **Clear Lifecycle Hierarchy**: Clear distinction between `pause()` (pause loop), `stop()` (stop game session, flush SRAM, keep engine resident), and `destroy()` / `dispose()` (complete teardown of workers, AudioContext, WebGL contexts, listeners, and memory).

---

## 2. Core Sources & Upstream Ecosystems

`emujs-headless` abstracts and unifies three primary upstream runtime families:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       emujs-headless                                        │
├─────────────────────────────────────────────────┬───────────────────┬───────────────────────┤
│                  Libretro WASM Family           │     Play! PS2     │   Adobe Flash Media   │
│       (EmulatorJS Bundle & web.libretro.com)    │ (ps2web wasm)     │     (Ruffle WASM)     │
├─────────────────────────────────────────────────┼───────────────────┼───────────────────────┤
│ • Consoles: NES, SNES, Genesis, GBA, N64, PS1   │ • PlayStation 2   │ • SWF games & anims   │
│ • PICO-8 via retro8 core (.p8 / .p8.png carts)  │ • Disc streaming  │ • ActionScript 1, 2, 3│
│ • Fantasy Consoles: TIC-80, WASM-4              │   IO worker       │ • Flash Local Shared  │
│ • PC Engines: ScummVM, PrBoom, Quake, ECWolf    │ • Memory card     │   Objects (.sol)      │
│ • Archive decompressors: 7z, zip, rar           │   VFS (/work/mc0) │                       │
│ • 80+ libretro WASM cores                       │                   │                       │
└─────────────────────────────────────────────────┴───────────────────┴───────────────────────┘
```

---

## 3. High-Level Engine Architecture

```
                              ┌─────────────────────────────────────┐
                              │     Host Application / Front-end    │
                              │ (React HUD, JellyEmu, WebUI, Vue)   │
                              └──────────────────┬──────────────────┘
                                                 │ Programmatic API
                                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    EmuHeadless Engine Instance                                  │
│                                                                                                 │
│  ┌───────────────────────┐ ┌──────────────────────┐ ┌────────────────────┐ ┌─────────────────┐  │
│  │     Lifecycle API     │ │     State Manager    │ │    SRAM & Memory   │ │  Cheats Engine  │  │
│  │ • load(rom, opts)     │ │ • saveState(slot)    │ │ • getSram()        │ │ • addCheat()    │  │
│  │ • play() / pause()    │ │ • loadState(slot)    │ │ • setSram(data)    │ │ • toggleCheat() │  │
│  │ • stop()              │ │ • listStates()       │ │ • flushSram()      │ │ • loadCheatDb() │  │
│  │ • destroy() / dispose │ │ • autoSaveState()    │ │ • onSramChanged    │ │ • getCheats()   │  │
│  └───────────────────────┘ └──────────────────────┘ └────────────────────┘ └─────────────────┘  │
│  ┌───────────────────────┐ ┌──────────────────────┐ ┌────────────────────┐ ┌─────────────────┐  │
│  │     Core Options      │ │     Disc Manager     │ │    Input Manager   │ │  Audio / Video  │  │
│  │ • getOptions()        │ │ • getDiscList()      │ │ • Per-Player Ch.   │ │ • WebGL Context │  │
│  │ • setOption(k, v)     │ │ • changeDisc(index)  │ │ • Gamepad Poller   │ │ • Web Audio Sync│  │
│  │ • resetOptions()      │ │ • ejectDisc()        │ │ • Keyboard Mapper  │ │ • applyShader() │  │
│  │ • onOptionChanged     │ │ • insertDisc(index)  │ │ • sendButton(p,btn)│ │ • takeScreenshot│ │
│  └───────────────────────┘ └──────────────────────┘ └────────────────────┘ └─────────────────┘  │
│  ┌───────────────────────┐ ┌──────────────────────┐ ┌────────────────────┐ ┌─────────────────┐  │
│  │     Timing Manager    │ │     Core Registry    │ │   Netplay Manager  │ │  Typed Events   │  │
│  │ • setFastForward()    │ │ • System core map    │ │ • Room connection  │ │ • 'ready','save'│  │
│  │ • setSlowMotion()     │ │ • Core swapping      │ │ • Input sync       │ │ • 'sram','frame'│  │
│  │ • stepFrame()         │ │ • Asset caching      │ │ • Peer management  │ │ • 'disc','error'│  │
│  │ • rewind engine       │ │ • Fallback mirrors   │ │                    │ │ • 'optionChange'│  │
│  └───────────────────────┘ └──────────────────────┘ └────────────────────┘ └─────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                  BaseCoreBridge (Graceful No-Op Defaults & Fallbacks)                     │  │
│  └──────────────────────────┬─────────────────────────────┬──────────────────────────────────┘  │
└─────────────────────────────┼─────────────────────────────┼─────────────────────────────────────┘
                              ▼                             ▼                             ▼
              ┌───────────────────────────────┐ ┌───────────────────────┐ ┌───────────────────────┐
              │       LibretroAdapter         │ │      PlayAdapter      │ │     RuffleAdapter     │
              │ • EmulatorJS & web.libretro   │ │ • Play! PS2           │ │ • Adobe Flash SWF     │
              │ • retro8 (PICO-8)             │ │ • Disc streaming VFS  │ │ • Ruffle WebAssembly  │
              │ • 80+ Libretro WASM cores     │ │ • Dynamic audio sync  │ │ • .sol save data      │
              └───────────────────────────────┘ └───────────────────────┘ └───────────────────────┘
```

---

## 4. Subsystem Specifications & Contracts

### 4.1. Core Capabilities Manifest (`CoreCapabilities`)

```typescript
export interface CoreCapabilities {
  saveStates: boolean;    // CPU/RAM/VRAM execution snapshot
  sram: boolean;          // Battery SRAM / memory card files (.srm, .sav, MC0, .sol)
  cheats: boolean;        // Real-time cheat engine (Action Replay, GameShark, PNACH)
  coreOptions: boolean;   // Internal emulation variables (overclocks, rendering mode, region)
  multiDisc: boolean;     // Multi-disc media swapping (.m3u, disc trays)
  shaders: boolean;       // Hardware video post-processing shaders (CRT, scanlines, xBRZ)
  rewind: boolean;        // Real-time reverse execution buffer
  variableSpeed: boolean; // Fast forward and slow motion
  maxPlayers: number;     // Maximum simultaneous input players supported (e.g. 1, 2, 4, 8)
  pointer: boolean;       // Pointer / touch / mouse / light gun input
}
```

---

### 4.2. Core Adapters

1. **`LibretroAdapter`**:
   - Handles the entire family of Libretro WebAssembly cores (both **EmulatorJS** and **`web.libretro.com`** distributions).
   - Runs **PICO-8** cleanly using the `retro8` core (`retro8_libretro.js` + `.wasm`), loading `.p8` and `.p8.png` cartridges directly into the virtual filesystem.
   - Runs classic consoles (NES, SNES, Genesis, GBA, N64, PS1, Arcade) and fantasy micro-consoles (TIC-80, WASM-4).
   - Directly interfaces with Emscripten `Module`, Libretro environment callbacks, audio batches, and frame execution loops.

2. **`PlayAdapter`**:
   - Manages Play! PS2 WebAssembly core (`Play.js` + `Play.wasm`).
   - Houses the `DiscImageDevice` streaming worker for reading ISO / BIN files chunk-by-chunk without loading multi-gigabyte ISOs into browser memory.
   - Dynamic Web Audio sample-rate modulation to eliminate buffer stuttering when PS2 emulation dips below 60 FPS.
   - Mounts and synchronizes `/work/mc0/*` virtual memory cards.

3. **`RuffleAdapter`**:
   - Integrates the Ruffle WebAssembly player (`@ruffle-rs/ruffle`).
   - Loads `.swf` files from raw ArrayBuffer, Blob, or URL.
   - Direct volume control, pause/resume, and frame stepping.
   - Captures and exports Flash Local Shared Objects (`.sol` save files) as persistent save data.
   - Translates gamepad events into standard Flash keyboard/mouse virtual inputs.

---

### 4.3. Master Engine Lifecycle (`EmuHeadless`)

```typescript
export class EmuHeadless extends EventEmitter<EmuEventMap> {
  public readonly state: IStateManager;
  public readonly sram: ISramManager;
  public readonly cheats: ICheatManager;
  public readonly options: ICoreOptionsManager;
  public readonly discs: IDiscManager;
  public readonly input: IInputManager;
  public readonly audio: IAudioManager;
  public readonly video: IVideoManager;
  public readonly timing: ITimingManager;
  public readonly netplay: INetplayManager;

  public readonly capabilities: CoreCapabilities;

  constructor(config: EmuHeadlessConfig);

  public load(rom: ArrayBuffer | Blob | string, options?: GameLoadOptions): Promise<void>;
  public play(): void;
  public pause(): void;
  public stop(): Promise<void>;
  public restart(): Promise<void>;
  public destroy(): Promise<void>;
  public dispose(): Promise<void>; // Alias of destroy()
  public switchCore(coreId: string): Promise<void>;

  public getCoreMetadata(): CoreMetadata;
  public isRunning(): boolean;
  public isPaused(): boolean;
}
```

---

### 4.4. Per-Player Input & Virtual Controller Subsystem (`IInputManager`)

`emujs-headless` is built specifically to serve as the headless engine beneath custom front-ends and virtual on-screen controllers (touchpads, virtual dual-analog sticks, gamepad overlays, and bot automation).

Input is isolated per player (`PlayerInputChannel`), and `InputManager` exposes both continuous analog axes and discrete button injection:

```typescript
export interface PlayerInputChannel {
  readonly playerIndex: number; // 0 = Player 1, 1 = Player 2, etc.

  /** Programmatic button press/release (D-Pad, Cross, Circle, Square, Triangle, L1, R1, etc.). */
  sendButton(button: StandardButton, pressed: boolean): void;

  /**
   * Continuous analog stick axis tilt (-1.0 to 1.0).
   * Automatically clamped and normalized across all backend adapters.
   */
  sendAxis(axis: StandardAxis, value: number): void;

  /**
   * Sets both X and Y axes of an analog stick simultaneously.
   * Designed specifically for virtual touch joysticks and mobile thumbsticks.
   * @param stick 'LEFT' | 'RIGHT'
   * @param x Horizontal tilt from -1.0 (left) to 1.0 (right)
   * @param y Vertical tilt from -1.0 (up) to 1.0 (down)
   */
  sendAnalogStick(stick: 'LEFT' | 'RIGHT', x: number, y: number): void;

  assignGamepad(gamepadIndex: number | null): void;
  setKeyBinding(action: StandardButton, keyCode: string): void;
  setGamepadBinding(action: StandardButton, buttonIndex: number): void;
  resetBindings(): void;
  setTurbo(button: StandardButton, enabled: boolean, rateHz?: number): void;
}

export interface IInputManager {
  player(index: number): PlayerInputChannel;
  getMaxPlayers(): number;
  autoAssignGamepads(): void;

  // Direct engine-level injection shortcuts
  sendButton(player: number, button: StandardButton, pressed: boolean): void;
  sendAxis(player: number, axis: StandardAxis, value: number): void;
  sendAnalogStick(player: number, stick: 'LEFT' | 'RIGHT', x: number, y: number): void;

  setHotkeyBinding(hotkey: StandardHotkey, keyOrButton: string | number): void;
  getConnectedControllers(): GamepadDetails[];
}
```

#### Dual Analog Axis Mapping Under the Hood:
- **Libretro / EmulatorJS**: `sendAxis` passes continuous values to `gamepad.sendAxis` when available, and automatically translates stick vectors into 16-bit signed analog inputs (`simulateInput(player, analogId, intVal)`: IDs 16–23 for L/R Stick directions) with a configurable deadzone.
- **Play! PS2**: `sendAxis` maps analog stick tilt vectors to Play!'s native dual-analog canvas keyboard/controller bindings (`PS2_KEYS.L_STICK_*` / `PS2_KEYS.R_STICK_*`).
- **Flash (Ruffle)**: `sendAxis` maps primary directional stick tilts to arrow key keyboard events for traditional Flash game movement.

---

### 4.5. System to Cores Matrix

| Platform / System | Primary Core | Alternative Cores | Engine Family | Notes |
|:---|:---|:---|:---|:---|
| **PICO-8** | `retro8` | — | Libretro | Native `.p8` and `.p8.png` cart loading via Libretro |
| **Nintendo (NES)** | `nestopia` | `fceumm`, `quicknes` | Libretro | `quicknes` for low-spec devices, `nestopia` for accuracy |
| **Super Nintendo (SNES)** | `snes9x` | `snes9x2010`, `snes9x2005` | Libretro | `snes9x2005` for ultra-lightweight execution |
| **Game Boy / GBC** | `gambatte` | `sameboy`, `gearboy`, `DoubleCherryGB` | Libretro | `DoubleCherryGB` for dual-screen 2-player link cable |
| **Game Boy Advance** | `mgba` | `vba_next` | Libretro | `mgba` has superior accuracy |
| **Nintendo 64** | `mupen64plus_next` | `parallel_n64` | Libretro | `parallel_n64` includes Angrylion video plugin |
| **PlayStation (PS1)** | `pcsx_rearmed` | `mednafen_psx_hw` | Libretro | `pcsx_rearmed` uses fast ARM/x86 dynarec translation |
| **PlayStation 2 (PS2)** | `play` | — | Play! WASM | Álvaro Zamorano's `ps2web` multithreaded core |
| **Sega Genesis / Mega Drive** | `genesis_plus_gx` | `picodrive` | Libretro | `picodrive` required for Sega 32X games |
| **TIC-80** | `tic80` | — | Libretro | WebAssembly fantasy console |
| **WASM-4** | `wasm4` | — | Libretro | Native fantasy micro-cartridges |
| **Adobe Flash** | `ruffle` | — | Ruffle WASM | Rust WebAssembly `.swf` player with ActionScript 1/2/3 |
| **Classic Adventure Engines** | `scummvm` | — | Libretro | LucasArts SCUMM, Humongous, Sierra AGI/SCI |
| **Classic FPS Engines** | `prboom` (Doom) | `tyrquake` (Quake), `ecwolf` (Wolf3D) | Libretro | Native WASM source ports |

---

## 5. Directory Structure & File Map

```
emujs-headless/
├── ARCHITECTURE.md                 # System architecture (this document)
├── README.md                       # Quickstart & API reference
├── package.json                    # Package manifest & build scripts
├── tsconfig.json                   # Strict TypeScript compiler options
├── vite.config.ts                  # Multi-target build (ESM, CJS, UMD)
├── demo/                           # Interactive browser testbed
│   ├── index.html
│   └── main.ts
└── src/
    ├── index.ts                    # Main entry point & public exports
    ├── EmuHeadless.ts              # Master engine orchestrator
    ├── adapters/                   # Core bridge implementations
    │   ├── ICoreAdapter.ts         # Core contract & capabilities definition
    │   ├── BaseCoreBridge.ts       # Safe default no-op bridge
    │   ├── LibretroAdapter.ts      # Libretro / web.libretro.com / EJS / retro8
    │   ├── PlayAdapter.ts          # Play! PS2 WebAssembly core
    │   └── RuffleAdapter.ts        # Adobe Flash SWF / Ruffle WASM
    ├── subsystems/                 # Discrete headless managers
    │   ├── StateManager.ts         # Save states (slots, screenshots)
    │   ├── SramManager.ts          # Battery SRAM, PS2 MC0, Flash .sol
    │   ├── CheatManager.ts         # Cheat codes & patch engine
    │   ├── CoreOptionsManager.ts   # Core variables & options
    │   ├── DiscManager.ts          # Multi-disc swapping & M3U
    │   ├── InputManager.ts         # Gamepad & keyboard coordinator
    │   ├── PlayerInputChannel.ts   # Dedicated per-player input channel
    │   ├── VideoManager.ts         # WebGL canvas & shaders
    │   ├── AudioManager.ts         # AudioContext & rate matching
    │   ├── TimingManager.ts        # Fast forward, slow motion, rewind
    │   └── NetplayManager.ts       # Multiplayer WebRTC/Socket.io
    ├── core/                       # Core resolution & swapping
    │   ├── CoreRegistry.ts         # System core matrix & swapping
    │   ├── CoreLoader.ts           # Dynamic module loader & cache
    │   └── types.ts                # Metadata interfaces
    └── utils/                      # Helper utilities
        ├── Decompressor.ts         # 7z, zip, rar WebAssembly extraction
        └── EventEmitter.ts         # Typed event emitter
```

---

## 6. Phased Implementation Roadmap

### Phase 1: Foundation & Virtual Bridge Architecture
- [x] Create comprehensive architectural specification (`ARCHITECTURE.md`).
- [ ] Initialize repository build configuration (`package.json`, Vite, TypeScript).
- [ ] Implement `CoreCapabilities`, `BaseCoreBridge`, `ICoreAdapter`, and `EmuHeadless`.
- [ ] Implement `CoreRegistry` with System-to-Cores matrix and core swapping support.

### Phase 2: Per-Player Input & Subsystem Managers
- [ ] Implement `PlayerInputChannel` and `InputManager` with isolated per-player dispatch.
- [ ] Implement `StateManager` and `SramManager` with dirty-sync hooks.
- [ ] Implement `CoreOptionsManager` and `CheatManager`.
- [ ] Implement `DiscManager` and `TimingManager`.

### Phase 3: Libretro Adapter (incorporating retro8 for PICO-8)
- [ ] Implement `LibretroAdapter` instantiating Emscripten libretro modules directly.
- [ ] Verify PICO-8 execution via `retro8` using `.p8` and `.p8.png` carts.
- [ ] Map native Libretro variables, memory buffers, and cheats to subsystem managers.
- [ ] Add on-the-fly 7z/zip/rar ROM decompression.

### Phase 4: Play! PS2 & Multi-Disc Support
- [ ] Implement `PlayAdapter` with multithreaded `DiscImageDevice` streaming worker.
- [ ] Mount and sync `/work/mc0` virtual memory cards via `SramManager`.
- [ ] Implement multi-disc switching for PS1/PS2 titles.

### Phase 5: Flash (Ruffle) & Interactive Demo
- [ ] Implement `RuffleAdapter` with `.swf` playback and `.sol` Local Shared Object save handling.
- [ ] Build interactive browser harness in `demo/` demonstrating core swapping, per-player input, and capability reflection live across Libretro, Play!, and Flash.
