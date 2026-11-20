// Master Engine

export { BaseCoreBridge } from './adapters/BaseCoreBridge';
// Adapters & Virtual Bridge
export type { AdapterContext, ICoreAdapter } from './adapters/ICoreAdapter';
export { LibretroAdapter } from './adapters/LibretroAdapter';
export { PlayAdapter } from './adapters/PlayAdapter';
export { RuffleAdapter } from './adapters/RuffleAdapter';
export { CoreRegistry } from './core/CoreRegistry';
// Core Types & Metadata
export * from './core/types';
export { DEFAULT_CAPABILITIES, EmuHeadless, RetroKit } from './RetroKit';
export type { IAchievementManager } from './subsystems/AchievementManager';
export { AchievementManager } from './subsystems/AchievementManager';
export type { IAudioManager } from './subsystems/AudioManager';
export { AudioManager } from './subsystems/AudioManager';
export type { IBiosManager } from './subsystems/BiosManager';
export { BiosManager } from './subsystems/BiosManager';
export type { ICheatManager } from './subsystems/CheatManager';
export { CheatManager } from './subsystems/CheatManager';
export type { ICoreOptionsManager } from './subsystems/CoreOptionsManager';
export { CoreOptionsManager } from './subsystems/CoreOptionsManager';
export type { IDiscManager } from './subsystems/DiscManager';
export { DiscManager } from './subsystems/DiscManager';
export type { IInputManager } from './subsystems/InputManager';
export { InputManager } from './subsystems/InputManager';
export type { INetplayManager, NetplayPeer } from './subsystems/NetplayManager';
export { NetplayManager } from './subsystems/NetplayManager';
export { PlayerInputChannel } from './subsystems/PlayerInputChannel';
export type { ISramManager } from './subsystems/SramManager';
export { SramManager } from './subsystems/SramManager';
// Subsystems & Interfaces
export type { IStateManager } from './subsystems/StateManager';
export { StateManager } from './subsystems/StateManager';
export type { ITimingManager } from './subsystems/TimingManager';
export { TimingManager } from './subsystems/TimingManager';
export type { IVideoManager } from './subsystems/VideoManager';
export { VideoManager } from './subsystems/VideoManager';
export { crc32 } from './utils/crc32';
export type { EventListener } from './utils/EventEmitter';
// Utilities
export { EventEmitter } from './utils/EventEmitter';
export { md5 } from './utils/md5';
export type { PatchFormat, PatchResult } from './utils/patcher/RomPatcher';
// ROM Patching & Hashing Utilities
export { RomPatcher } from './utils/patcher/RomPatcher';
