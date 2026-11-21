# RetroKit Frontend API Reference

RetroKit is a headless, framework-agnostic WebAssembly emulation runtime designed for browser frontends, custom user interfaces, TV navigation shells, and virtual on-screen gamepads.

This document details every function, method, property, event, and configuration object available across the RetroKit API.

---

## Table of Contents

1. [RetroKit Orchestrator](#1-retrokit-orchestrator)
   - [Constructor](#constructor)
   - [Core Directory and Asset Configuration](#core-directory-and-asset-configuration)
   - [Game Lifecycle](#game-lifecycle)
   - [State and Status Inspection](#state-and-status-inspection)
   - [Subsystem Accessors](#subsystem-accessors)
2. [Event Emitter](#2-event-emitter)
   - [Event Subscriptions](#event-subscriptions)
   - [Event Map Reference](#event-map-reference)
3. [Video Subsystem (emu.video)](#3-video-subsystem-emuvideo)
4. [Audio Subsystem (emu.audio)](#4-audio-subsystem-emuaudio)
5. [Input Subsystem (emu.input)](#5-input-subsystem-emuinput)
   - [Player Input Channels](#player-input-channels)
   - [Touch and Pointer Input](#touch-and-pointer-input)
   - [Hotkeys and Physical Gamepads](#hotkeys-and-physical-gamepads)
6. [Save State Subsystem (emu.state)](#6-save-state-subsystem-emustate)
7. [Battery SRAM Subsystem (emu.sram)](#7-battery-sram-subsystem-emusram)
8. [Core Options Subsystem (emu.options)](#8-core-options-subsystem-emuoptions)
9. [Disc Control Subsystem (emu.discs)](#9-disc-control-subsystem-emudiscs)
10. [Timing and Speed Subsystem (emu.timing)](#10-timing-and-speed-subsystem-emutiming)
11. [Cheat Engine Subsystem (emu.cheats)](#11-cheat-engine-subsystem-emucheats)
12. [BIOS and System Firmware (emu.bios)](#12-bios-and-system-firmware-emubios)
13. [RetroAchievements Subsystem (emu.achievements)](#13-retroachievements-subsystem-emuachievements)
14. [Netplay Subsystem (emu.netplay)](#14-netplay-subsystem-emunetplay)
15. [Core Registry (CoreRegistry)](#15-core-registry-coreregistry)
16. [ROM Patcher (RomPatcher)](#16-rom-patcher-rompatcher)
17. [Type Reference](#17-type-reference)

---

## 1. RetroKit Orchestrator

The `RetroKit` class (also exported under the alias `EmuHeadless`) manages the emulation runtime lifecycle and orchestrates all subsystem bridges.

```ts
import { RetroKit } from '@grimmdev/retrokit';
```

### Constructor

```ts
const emu = new RetroKit(config: RetroKitConfig);
```

#### `RetroKitConfig` Parameters

| Option | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `canvas` | `HTMLCanvasElement` | No | `undefined` | Target HTML5 Canvas element for video output. Optional if provided via `setCanvas()` or `load()`. |
| `preserveCanvas` | `boolean` | No | `false` | When true, reuses an existing canvas or WebGL canvas without replacing the DOM node during core reboots. |
| `useExistingCanvas` | `boolean` | No | `false` | Alias for `preserveCanvas`. |
| `assetBaseUrl` | `string` | No | `'/cores'` | Initial base URL or directory path for core WASM and JS binaries. |
| `core` | `string` | No | Auto | Preferred core ID override (e.g. `'snes9x'`, `'ppsspp'`). |
| `system` | `string` | No | Auto | Target console/platform identifier (e.g. `'ps1'`, `'snes'`). |
| `audioContext` | `AudioContext` | No | New instance | Custom Web Audio AudioContext instance. |
| `fetchHeaders` | `Record<string, string>` | No | `{}` | HTTP request headers passed when fetching ROMs or core assets. |
| `debug` | `boolean` | No | `false` | Enables verbose diagnostics and engine logging. |
| `retroAchievements` | `object` | No | N/A | Pre-configured RetroAchievements login credentials. |

---

### Canvas Management and Existing WebGL Canvases

Frontends frequently manage their own canvas DOM elements inside UI framework component lifecycles (such as React `useRef`, Vue `ref`, or Svelte `bind:this`) or render inside an existing WebGL surface.

RetroKit fully supports binding existing canvases, reusing them without DOM node replacement, and clearing WebGL framebuffers safely:

#### `emu.setCanvas(canvas: HTMLCanvasElement, options?: { preserveCanvas?: boolean; useExistingCanvas?: boolean }): void`
Binds or updates the rendering canvas element at runtime.
- **canvas**: Target HTML5 Canvas element (compatible with standard 2D and existing WebGL canvases).
- **options.preserveCanvas**: When true, prevents RetroKit from replacing the canvas DOM element with a new canvas during core restarts or game switches.
- **options.useExistingCanvas**: Alias for `preserveCanvas`.

```ts
const existingCanvas = document.getElementById('my-webgl-canvas') as HTMLCanvasElement;

// Bind canvas with DOM preservation enabled
emu.setCanvas(existingCanvas, { useExistingCanvas: true });
```

#### `emu.canvas: HTMLCanvasElement | undefined` (Getter)
Returns the currently bound canvas element.

```ts
if (emu.canvas) {
  console.log('Rendering on canvas dimensions:', emu.canvas.width, emu.canvas.height);
}
```

---

### Core Directory and Asset Configuration

Frontends frequently need to point the runtime to a local CDN, self-hosted proxy route, or custom folder structure. RetroKit provides dedicated methods to update this at runtime.

#### `emu.setCoresDirectory(directory: string): void`
Sets the base directory or URL where emulator core binaries and runtime assets are located. Updates the active configuration and forwards the new location to the active adapter context.
- **directory**: URL string or relative path (e.g. `'/assets/cores'`, `'https://cdn.example.com/cores'`).

```ts
emu.setCoresDirectory('https://cdn.example.com/cores');
```

#### `emu.getCoresDirectory(): string`
Returns the currently active cores directory URL.

```ts
const currentDir = emu.getCoresDirectory();
```

#### `emu.coresDirectory: string` (Getter)
Property accessor returning the current cores directory.

```ts
console.log('Cores directory:', emu.coresDirectory);
```

#### `emu.setAssetBaseUrl(url: string): void`
Alias for `setCoresDirectory`.

#### `emu.getAssetBaseUrl(): string`
Alias for `getCoresDirectory`.

#### `emu.assetBaseUrl: string` (Getter)
Alias getter for `coresDirectory`.

---

### Game Lifecycle

#### `emu.load(rom: ArrayBuffer | Blob | string | Uint8Array, options?: GameLoadOptions): Promise<void>`
Initializes the target core, injects BIOS and initial SRAM, applies patches, and loads the ROM into WebAssembly memory.

- **rom**: The game data as a binary buffer, browser `Blob` or `File`, or URL string.
- **options**: Optional metadata and configuration flags.

```ts
await emu.load(romBuffer, {
  fileName: 'Final Fantasy VII (Disc 1).chd',
  system: 'ps1',
  gameId: 'ff7_disc1',
  initialSram: existingSaveData,
});
```

#### `GameLoadOptions` Parameters

| Option | Type | Description |
| :--- | :--- | :--- |
| `fileName` | `string` | File name with extension. Essential when passing raw binary buffers or Blobs. |
| `system` | `string` | Target console/system identifier to disambiguate shared file extensions (`.iso`, `.bin`, `.chd`). |
| `core` | `string` | Forces a specific core identifier rather than auto-resolving from the file. |
| `coresDirectory` | `string` | Per-load override for the cores directory or asset base URL. |
| `assetBaseUrl` | `string` | Alias for `coresDirectory`. |
| `canvas` | `HTMLCanvasElement` | Target canvas element to render into. Overrides or binds canvas for this game. |
| `preserveCanvas` | `boolean` | When true, preserves and reuses the existing canvas without DOM node replacement. |
| `useExistingCanvas` | `boolean` | Alias for `preserveCanvas`. |
| `gameId` | `string` | Unique identifier for state slot scoping and SRAM persistence. |
| `initialSram` | `Uint8Array \| Record<string, Uint8Array>` | Existing save data or memory card files to pre-populate. |
| `initialStateSlot` | `number` | Save state slot index (0 to 9) to restore immediately after booting. |
| `patch` | `Uint8Array \| ArrayBuffer \| Blob` | IPS, BPS, or UPS ROM patch data applied in memory before boot. |
| `verifyPatchChecksum` | `boolean` | When true, verifies source ROM checksum before applying patch. |
| `additionalFiles` | `CompanionFile[]` | Multi-disc files, companion `.bin` tracks, or CD tracks. |
| `bios` | `Record<string, Uint8Array> \| Array<{ name, data }>` | Firmware binaries to inject prior to game start. |

#### `emu.play(): Promise<void>`
Resumes execution and restarts audio processing. If emulation was previously stopped, re-initializes and boots the active ROM.

```ts
await emu.play();
```

#### `emu.pause(): void`
Freezes core execution and silences audio output.

```ts
emu.pause();
```

#### `emu.stop(): Promise<void>`
Stops execution, flushes modified SRAM to callbacks, shuts down audio, and clears the canvas.

```ts
await emu.stop();
```

#### `emu.restart(): Promise<void>`
Reboots the current game from its initial state while keeping battery save data intact.

```ts
await emu.restart();
```

#### `emu.switchCore(coreId: string): Promise<void>`
Hot-swaps the current game to a different core engine without losing the loaded ROM.

```ts
await emu.switchCore('beetle_psx');
```

#### `emu.destroy(): Promise<void>` / `emu.dispose(): Promise<void>`
Tears down the engine, releases WebAssembly memory allocations, closes the audio context, and removes listeners.

```ts
await emu.destroy();
```

---

### State and Status Inspection

#### `emu.isRunning(): boolean`
Returns true if a game is loaded and running.

#### `emu.isPaused(): boolean`
Returns true if emulation is currently paused.

#### `emu.capabilities: CoreCapabilities`
Returns the capability manifest of the active core (save states, SRAM, cheats, variable speed, max players).

#### `emu.getCoreMetadata(): CoreMetadata`
Returns the core metadata descriptor (name, id, system, family, extensions).

#### `emu.activeRom: ArrayBuffer | Blob | string | Uint8Array | null`
Returns the active ROM payload held in memory.

#### `emu.lastLoadOptions: GameLoadOptions | undefined`
Returns the configuration options passed during the most recent load operation.

#### `emu.setSystem(system: string | undefined): void`
Sets the active platform hint for subsequent game launches.

---

### Subsystem Accessors

The `RetroKit` instance exposes dedicated subsystem managers:

| Subsystem Property | Interface | Purpose |
| :--- | :--- | :--- |
| `emu.video` | `IVideoManager` | Aspect ratio, rotation, shaders, screenshots, and viewport scaling. |
| `emu.audio` | `IAudioManager` | Volume, mute, audio context unlocking. |
| `emu.input` | `IInputManager` | Controller routing, keyboard mapping, virtual touchpads, analog sticks. |
| `emu.state` | `IStateManager` | Save state capturing, loading, slot management, export and import. |
| `emu.sram` | `ISramManager` | In-game battery save persistence, dirty sync, memory card export. |
| `emu.options` | `ICoreOptionsManager` | Core-specific internal configuration parameters. |
| `emu.discs` | `IDiscManager` | Multi-disc swapping, tray ejection, disc indexing. |
| `emu.timing` | `ITimingManager` | Speed control, fast forward, slow motion, frame stepping, rewind. |
| `emu.cheats` | `ICheatManager` | Real-time cheat codes, Action Replay, GameShark, PNACH. |
| `emu.bios` | `IBiosManager` | System firmware and BIOS registration. |
| `emu.achievements` | `IAchievementManager` | RetroAchievements login, progress, unlock evaluations, toast triggers. |
| `emu.netplay` | `INetplayManager` | P2P multiplayer networking. |

---

## 2. Event Emitter

RetroKit extends `EventEmitter<EmuEventMap>` for reactive frontend notification.

### Event Subscriptions

```ts
const unsubscribe = emu.on('event', (payload) => { ... });
emu.once('event', (payload) => { ... });
emu.off('event', callback);
```

### Event Map Reference

| Event Name | Payload | Trigger Condition |
| :--- | :--- | :--- |
| `'ready'` | `{ core: string; gameId: string }` | Emulation core has initialized and is running the ROM. |
| `'fps'` | `{ fps: number }` | Real-time frame rate calculation dispatched every second. |
| `'pause'` | `void` | Emulation has been paused. |
| `'resume'` | `void` | Emulation has resumed from pause. |
| `'stop'` | `void` | Emulation has been stopped and memory released. |
| `'sramModified'` | `{ data: Uint8Array \| Record<string, Uint8Array> }` | Game progress changed battery save memory (dirty-sync). |
| `'optionChanged'`| `{ id: string; value: string }` | A core option changed its value. |
| `'discChanged'` | `{ disc: DiscInfo }` | A multi-disc swap occurred. |
| `'romPatched'` | `{ format: string; originalSize: number; patchedSize: number }` | An IPS, BPS, or UPS patch was applied. |
| `'achievementUnlocked'` | `{ achievement: AchievementDefinition; hardcore: boolean }` | Player unlocked an achievement. |
| `'achievementProgress'` | `{ achievementId: number; progress: number; max: number }` | Measured progress towards an achievement changed. |
| `'log'` | `{ message: string; level: 'info' \| 'warn' \| 'error' }` | Diagnostic message emitted by core or subsystem. |
| `'error'` | `{ message: string; fatal?: boolean }` | Unhandled error occurred during runtime operation. |

---

## 3. Video Subsystem (emu.video)

Manages video presentation, aspect ratio, canvas scaling, rotation, and screen capture.

#### `emu.video.setAspectRatio(ratio: 'auto' | '4:3' | '16:9' | '1:1' | '8:7' | '3:2' | string): void`
Enforces aspect ratio correction across the target canvas.

```ts
emu.video.setAspectRatio('4:3');
```

#### `emu.video.aspectRatio: string`
Returns the currently configured aspect ratio string.

#### `emu.video.setRotation(degrees: 0 | 90 | 180 | 270): void`
Rotates the video canvas clockwise (useful for vertical arcade games like TATE mode).

```ts
emu.video.setRotation(90);
```

#### `emu.video.rotation: number`
Returns current rotation in degrees.

#### `emu.video.setShader(shader: string): Promise<void>`
Selects a hardware shader preset (e.g. `'crt-geom'`, `'scanlines'`, `'sharp-bilinear'`).

#### `emu.video.currentShader: string`
Returns the active shader name.

#### `emu.video.setVsync(enabled: boolean): void`
Toggles vertical sync lock to display refresh rate.

#### `emu.video.takeScreenshot(type?: 'image/png' | 'image/jpeg' | 'image/webp', quality?: number): Promise<Blob>`
Captures the current frame buffer directly from WebGL / 2D context as a compressed image blob.

```ts
const blob = await emu.video.takeScreenshot('image/png');
const previewUrl = URL.createObjectURL(blob);
```

#### `emu.video.getMetrics()`
Returns dimensional metrics:
```ts
const metrics = emu.video.getMetrics();
// { canvasWidth, canvasHeight, renderWidth, renderHeight, nativeAspectRatio, displayAspectRatio }
```

#### `emu.video.updateLayout(): void`
Recalculates container bounding box and updates canvas CSS dimensions to maintain aspect ratio.

#### `emu.video.clear(): void`
Blanks the canvas to black.

---

## 4. Audio Subsystem (emu.audio)

Manages Web Audio context, gain nodes, volume levels, and mute states.

#### `emu.audio.getVolume(): number`
Returns the volume level as a number between `0.0` (silent) and `1.0` (maximum).

#### `emu.audio.setVolume(volume: number): void`
Sets master volume. Clamps values between 0.0 and 1.0.

```ts
emu.audio.setVolume(0.75);
```

#### `emu.audio.setMute(mute: boolean): void`
Mutes or unmutes audio without losing the previous volume setting.

```ts
emu.audio.setMute(true);
```

#### `emu.audio.isMuted(): boolean`
Returns true if audio output is muted.

#### `emu.audio.unlockAudio(): Promise<void>`
Resumes the underlying Web Audio AudioContext after a user gesture to bypass browser autoplay policies.

```ts
window.addEventListener('click', () => emu.audio.unlockAudio(), { once: true });
```

#### `emu.audio.getAudioContext(): AudioContext`
Returns the active Web Audio `AudioContext` instance.

---

## 5. Input Subsystem (emu.input)

The input subsystem provides complete isolation between physical hardware and the emulation core. Frontends can map physical gamepads, listen to keyboards, or inject button and axis events from touch overlays.

### Player Input Channels

#### `emu.input.player(index: number): PlayerInputChannel`
Accesses the isolated input channel for a player index (0 to 7).

```ts
const player1 = emu.input.player(0);
```

#### `PlayerInputChannel` Methods

| Method | Parameters | Description |
| :--- | :--- | :--- |
| `sendButton` | `(button: StandardButton, pressed: boolean)` | Injects digital button press or release. |
| `sendAxis` | `(axis: StandardAxis, value: number)` | Injects analog axis value between `-1.0` and `1.0`. |
| `sendAnalogStick` | `(stick: 'LEFT' \| 'RIGHT', x: number, y: number)` | Injects combined X/Y dual-axis joystick values. |
| `isButtonPressed` | `(button: StandardButton): boolean` | Queries current pressed state of a button. |
| `getAxisValue` | `(axis: StandardAxis): number` | Queries current value of an analog axis. |
| `assignGamepad` | `(gamepadIndex: number \| null)` | Binds a specific physical Gamepad API index to this player. |
| `setKeyBinding` | `(action: StandardButton, keyCode: string)` | Binds a keyboard key code to a RetroPad button. |
| `setGamepadBinding`| `(action: StandardButton, buttonIndex: number)` | Maps a physical gamepad button index to a RetroPad action. |
| `resetBindings` | `()` | Restores default keyboard and gamepad bindings. |
| `setTurbo` | `(button: StandardButton, enabled: boolean, rateHz = 15)` | Enables rapid-fire auto-fire pulsing for a button. |

```ts
// Virtual D-pad touch overlay example
const p1 = emu.input.player(0);
p1.sendButton('DPAD_UP', true);
setTimeout(() => p1.sendButton('DPAD_UP', false), 100);

// Virtual analog stick injection
p1.sendAnalogStick('LEFT', 0.85, -0.4);
```

### Touch and Pointer Input

For systems with touchscreens (Nintendo 3DS bottom screen, Nintendo DS):

```ts
// Injected directly via standard pointer events on the canvas
canvas.addEventListener('pointerdown', (e) => {
  // Dispatches coordinates to cores supporting pointer input (azahar, desmume, melonds)
});
```

### Hotkeys and Physical Gamepads

#### `emu.input.getMaxPlayers(): number`
Returns maximum simultaneous players supported by the active core.

#### `emu.input.autoAssignGamepads(): void`
Automatically routes connected physical gamepads to player 0, player 1, etc.

#### `emu.input.getConnectedControllers(): GamepadDetails[]`
Lists currently connected Gamepad API devices with button counts and vendor IDs.

#### `emu.input.setHotkeyBinding(hotkey: StandardHotkey, keyCode: string): void`
Binds a keyboard key code to an emulator hotkey action (`SAVE_STATE`, `LOAD_STATE`, `PAUSE_TOGGLE`, `FAST_FORWARD`, `REWIND`, `FULLSCREEN`).

#### `emu.input.registerHotkeyHandler(hotkey: StandardHotkey, handler: () => void): () => void`
Registers custom frontend handlers for hotkey actions. Returns an unsubscribe function.

---

## 6. Save State Subsystem (emu.state)

Manages full execution snapshots (RAM, VRAM, and CPU registers) with indexed slots, timestamps, and screenshot previews.

#### `emu.state.saveState(slot = 0): Promise<SaveStateRecord | null>`
Captures the current state into a slot index (0 through 9). Automatically captures a visual thumbnail screenshot.

```ts
const record = await emu.state.saveState(1);
// record contains: { slot, data, timestamp, gameId, screenshot }
```

#### `emu.state.loadState(source: number | Uint8Array): Promise<boolean>`
Restores a state from a numeric slot index or from a raw `Uint8Array` buffer.

```ts
// Load from slot 1
await emu.state.loadState(1);

// Or load from uploaded state file buffer
await emu.state.loadState(rawStateBuffer);
```

#### `emu.state.getStateBuffer(): Promise<Uint8Array | null>`
Exports raw state buffer for the active frame without saving to a specific slot.

#### `emu.state.listStates(): Promise<SaveStateMetadata[]>`
Returns metadata for all available state slots for the active game.

```ts
const states = await emu.state.listStates();
for (const s of states) {
  console.log(`Slot ${s.slot} created at ${new Date(s.timestamp).toLocaleString()}`);
}
```

#### `emu.state.hasState(slot: number): Promise<boolean>`
Checks if a state file exists in the specified slot.

#### `emu.state.deleteState(slot: number): Promise<void>`
Removes the state file for the given slot.

#### `emu.state.autoSave(): Promise<SaveStateRecord | null>`
Saves snapshot to slot index 999 (standard auto-save slot).

#### `emu.state.autoLoad(): Promise<boolean>`
Loads snapshot from slot index 999.

---

## 7. Battery SRAM Subsystem (emu.sram)

Handles non-volatile in-game save files (`.srm`, `.sav`, `.pdat`, Flash `.sol`, and PS1/PS2 memory cards).

#### `emu.sram.getSram(): Promise<Uint8Array | Record<string, Uint8Array> | null>`
Exports the current battery save memory. For cartridge systems, returns a single `Uint8Array`. For multi-file systems (PlayStation 2 memory cards), returns a record of named memory card file buffers.

```ts
const saveData = await emu.sram.getSram();
if (saveData instanceof Uint8Array) {
  // Cartridge SRAM (.srm, .sav, .pdat)
} else {
  // Multi-file memory card record (PS2 Mcd001.ps2)
}
```

#### `emu.sram.setSram(data: Uint8Array | Record<string, Uint8Array>, options?: { restart?: boolean }): Promise<boolean>`
Imports save data into the running core. Setting `restart: true` automatically reboots the game to apply the save immediately.

```ts
await emu.sram.setSram(importedBuffer, { restart: true });
```

#### `emu.sram.flushSram(): Promise<void>`
Forces the core to write all pending in-memory save data to storage.

```ts
await emu.sram.flushSram();
```

#### `emu.sram.isDirty(): boolean`
Returns true if in-game progress has modified save data since the last commit.

#### `emu.sram.onSramModified(callback: (data) => void): () => void`
Subscribes to battery save modifications. Returns an unbind function.

```ts
emu.sram.onSramModified((data) => {
  // Sync save data to backend server database
});
```

---

## 8. Core Options Subsystem (emu.options)

Exposes internal core settings (e.g. video rendering resolution, region selection, audio interpolation).

#### `emu.options.getOptions(): CoreOptionDefinition[]`
Returns list of available configuration parameters for the active core.

```ts
const options = emu.options.getOptions();
// Array of { id, description, values: [{ value, label }], defaultValue }
```

#### `emu.options.getOption(id: string): string | undefined`
Returns the current value of a core option.

#### `emu.options.setOption(id: string, value: string): void`
Sets a core option value.

```ts
emu.options.setOption('pcsx_rearmed_dithering', 'enabled');
```

#### `emu.options.resetOption(id: string): void`
Restores an option to its factory default value.

#### `emu.options.resetAll(): void`
Restores all core options to their defaults.

---

## 9. Disc Control Subsystem (emu.discs)

Handles multi-disc media swapping for PlayStation 1, PlayStation 2, Saturn, and DOSBox.

#### `emu.discs.setDiscs(paths: string[]): void`
Registers a list of disc image paths or filenames for a multi-disc set.

#### `emu.discs.getDiscCount(): number`
Returns total number of discs in the set.

#### `emu.discs.getCurrentDiscIndex(): number`
Returns active disc index (0-based, or -1 if tray is empty).

#### `emu.discs.getDiscList(): DiscInfo[]`
Returns array of disc metadata (`{ index, path, label }`).

#### `emu.discs.changeDisc(index: number): Promise<boolean>`
Ejects current disc, inserts the target disc, and closes the virtual drive tray.

```ts
await emu.discs.changeDisc(1); // Switch to Disc 2
```

#### `emu.discs.nextDisc(): Promise<boolean>`
Advances to the next disc in sequence.

#### `emu.discs.previousDisc(): Promise<boolean>`
Switches to the preceding disc.

#### `emu.discs.ejectDisc(): Promise<void>`
Opens the virtual drive tray.

#### `emu.discs.insertDisc(index: number): Promise<void>`
Inserts a disc into the open tray and closes it.

---

## 10. Timing and Speed Subsystem (emu.timing)

Controls emulation clock rate, fast forward, slow motion, and execution rewind.

#### `emu.timing.setFastForward(active: boolean, rate = 2.5): void`
Enables or disables fast forward mode at the given multiplier.

```ts
emu.timing.setFastForward(true, 3.0);
```

#### `emu.timing.setSlowMotion(active: boolean, rate = 0.5): void`
Enables or disables slow motion mode.

```ts
emu.timing.setSlowMotion(true, 0.5);
```

#### `emu.timing.setSpeed(ratio: number): void`
Sets an arbitrary execution speed multiplier (e.g. 1.0 for normal speed, 2.0 for double speed).

#### `emu.timing.stepFrame(): void`
Advances execution by exactly one video frame while paused.

```ts
emu.timing.stepFrame();
```

#### `emu.timing.isRewindSupported(): boolean`
Returns true if the active core supports real-time execution rewinding.

#### `emu.timing.startRewind(): void`
Begins reversing execution backwards in time.

#### `emu.timing.stopRewind(): void`
Resumes normal forward execution.

---

## 11. Cheat Engine Subsystem (emu.cheats)

Injects real-time GameShark, Action Replay, Game Genie, and PNACH codes directly into core memory.

#### `emu.cheats.getCheats(): CheatItem[]`
Returns list of registered cheats with descriptions, codes, and toggle states.

#### `emu.cheats.addCheat(cheat: Omit<CheatItem, 'id'>): string`
Adds a cheat code and returns its unique generated ID.

```ts
const cheatId = emu.cheats.addCheat({
  description: 'Infinite Lives',
  code: '00E0-0103',
  enabled: true,
});
```

#### `emu.cheats.removeCheat(id: string): boolean`
Deletes a cheat code by its ID.

#### `emu.cheats.toggleCheat(id: string, enabled: boolean): void`
Enables or disables a specific cheat code.

#### `emu.cheats.clearAllCheats(): void`
Removes all cheat codes from the engine.

#### `emu.cheats.loadCheatFile(content: string, format?: 'cht' | 'json'): void`
Parses and registers cheats from standard Libretro `.cht` text or JSON.

#### `emu.cheats.exportCheatFile(): string`
Exports registered cheats as a Libretro `.cht` format string.

---

## 12. BIOS and System Firmware (emu.bios)

Manages system firmware required by PlayStation (SCPH-1001), Game Boy Advance (`gba_bios.bin`), Nintendo DS, and Neo Geo.

#### `emu.bios.register(name: string, data: Uint8Array | ArrayBuffer): void`
Registers a firmware file in memory for automatic injection into core file systems.

```ts
emu.bios.register('scph1001.bin', scphBytes);
```

#### `emu.bios.unregister(name: string): boolean`
Removes a registered BIOS file.

#### `emu.bios.has(name: string): boolean`
Checks if a specific firmware file is registered.

#### `emu.bios.get(name: string): Uint8Array | undefined`
Retrieves the binary data of a registered firmware file.

#### `emu.bios.list(): string[]`
Returns list of all registered BIOS filenames.

#### `emu.bios.clear(): void`
Clears all registered BIOS files from memory.

---

## 13. RetroAchievements Subsystem (emu.achievements)

Integrates with the official RetroAchievements web API and in-memory rcheevos evaluator.

#### `emu.achievements.login(username: string, token: string, apiEndpoint?: string): Promise<AchievementUser>`
Authenticates with RetroAchievements using a username and API session token.

```ts
await emu.achievements.login('Gamer123', 'a1b2c3d4e5f6');
```

#### `emu.achievements.logout(): void`
Clears active credentials and cached achievements.

#### `emu.achievements.loadAchievements(gameHash: string, gameTitle?: string): Promise<AchievementDefinition[]>`
Fetches achievement definitions and player progress for the specified game hash.

#### `emu.achievements.setHardcore(enabled: boolean): void`
Toggles RetroAchievements Hardcore Mode. When active, save states and cheats are disabled.

#### `emu.achievements.computeGameHash(romData: Uint8Array): string`
Computes the canonical MD5 hash for the game binary according to platform hashing specifications.

#### Properties
- `emu.achievements.isLoggedIn: boolean`
- `emu.achievements.user: AchievementUser | null`
- `emu.achievements.achievements: AchievementDefinition[]`
- `emu.achievements.gameHash: string | null`
- `emu.achievements.gameId: number | null`
- `emu.achievements.gameTitle: string | null`
- `emu.achievements.hardcore: boolean`

---

## 14. Netplay Subsystem (emu.netplay)

Manages WebRTC peer-to-peer multiplayer connectivity.

#### `emu.netplay.connect(config: NetplayConfig): Promise<boolean>`
Connects to a multiplayer lobby or peer as host or guest.

```ts
await emu.netplay.connect({
  roomId: 'retrokit-room-42',
  isHost: true,
  playerIndex: 0,
});
```

#### `emu.netplay.disconnect(): void`
Disconnects active peer connections and shuts down room synchronization.

#### `emu.netplay.isConnected(): boolean`
Returns true if netplay session is connected.

#### `emu.netplay.isHost(): boolean`
Returns true if this client is hosting the session.

#### `emu.netplay.getPlayerIndex(): number`
Returns assigned player index for this client.

#### `emu.netplay.getConnectedPeers(): NetplayPeer[]`
Lists currently connected peer endpoints and latencies.

---

## 15. Core Registry (CoreRegistry)

Static registry mapping file extensions, platform identifiers, and core adapters.

```ts
import { CoreRegistry } from '@grimmdev/retrokit';
```

#### `CoreRegistry.getAllCores(): CoreMetadata[]`
Returns list of all registered cores (100+ platforms).

#### `CoreRegistry.getCore(id: string): CoreMetadata | undefined`
Retrieves metadata for a specific core ID (e.g. `'pcsx_rearmed'`, `'azahar'`, `'dosbox_pure'`).

#### `CoreRegistry.getCoresForSystem(system: string): CoreMetadata[]`
Finds all cores capable of running a given platform (e.g. `'snes'` returns `['snes9x', 'bsnes']`).

#### `CoreRegistry.resolveCoreFromFileName(fileName: string, systemHint?: string): CoreMetadata | undefined`
Resolves the optimal core based on file extension and optional platform disambiguation.

```ts
// Disambiguate .iso between PSP and PS2
const psp = CoreRegistry.resolveCoreFromFileName('game.iso', 'psp'); // PPSSPP
const ps2 = CoreRegistry.resolveCoreFromFileName('game.iso', 'ps2'); // Play!
```

#### `CoreRegistry.normalizeSystem(alias: string): string`
Normalizes platform aliases to canonical system names (e.g. `'psx'` -> `'ps1'`, `'megadrive'` -> `'genesis'`).

#### `CoreRegistry.registerCore(metadata: CoreMetadata, factory?: CoreAdapterFactory): void`
Registers a custom or third-party core with the runtime.

---

## 16. ROM Patcher (RomPatcher)

Utility for applying game translation and modification patches in memory before booting.

```ts
import { RomPatcher } from '@grimmdev/retrokit';

const result = RomPatcher.applyPatch(romBytes, patchBytes, verifyChecksum);
// result: { patchedRom: Uint8Array, format: 'IPS' | 'BPS' | 'UPS', originalSize, patchedSize }
```

Supports automatic format detection for:
- **IPS**: International Patching System (up to 16 MB or IPS32).
- **BPS**: Beat Patch System (CRC32 validated differential delta format).
- **UPS**: Universal Patch System (bidirectional patch format).

---

## 17. Type Reference

### Standard Buttons (`StandardButton`)
`'DPAD_UP'`, `'DPAD_DOWN'`, `'DPAD_LEFT'`, `'DPAD_RIGHT'`, `'ACTION_DOWN'` (A / Cross), `'ACTION_RIGHT'` (B / Circle), `'ACTION_LEFT'` (Y / Square), `'ACTION_UP'` (X / Triangle), `'L1'`, `'R1'`, `'L2'`, `'R2'`, `'L3'`, `'R3'`, `'START'`, `'SELECT'`, `'HOME'`.

### Standard Axes (`StandardAxis`)
`'L_STICK_X'`, `'L_STICK_Y'`, `'R_STICK_X'`, `'R_STICK_Y'`, `'L2_AXIS'`, `'R2_AXIS'`.

### Standard Hotkeys (`StandardHotkey`)
`'SAVE_STATE'`, `'LOAD_STATE'`, `'PAUSE_TOGGLE'`, `'FAST_FORWARD'`, `'SLOW_MOTION'`, `'REWIND'`, `'FULLSCREEN'`, `'SCREENSHOT'`, `'MUTE_TOGGLE'`, `'RESET'`.
