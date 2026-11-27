export interface LibretroKeyEntry {
  /** RetroArch retroarch.cfg suffix after `input_player{N}_` */
  cfgSuffix: string;
  /** RetroArch retroarch.cfg key name */
  cfgKey: string;
  /** DOM KeyboardEvent.key */
  key: string;
  /** DOM KeyboardEvent.code */
  code: string;
  /** DOM KeyboardEvent.keyCode / which */
  keyCode: number;
}

/**
 * Every RetroArch built-in hotkey config key found in web.libretro WASM cores.
 * All are explicitly set to "nul" in retroarch.cfg so RetroKit owns 100% of
 * hotkeys and no player key can ever trigger an unintended RetroArch action.
 */
export const RETROARCH_DISABLED_HOTKEYS: readonly string[] = [
  'input_enable_hotkey',
  'input_enable_hotkey_btn',
  'input_enable_hotkey_axis',
  'input_toggle_fast_forward',
  'input_hold_fast_forward',
  'input_toggle_slowmotion',
  'input_hold_slowmotion',
  'input_rewind',
  'input_load_state',
  'input_save_state',
  'input_state_slot_increase',
  'input_state_slot_decrease',
  'input_reset',
  'input_exit_emulator',
  'input_pause_toggle',
  'input_frame_advance',
  'input_toggle_fullscreen',
  'input_screenshot',
  'input_audio_mute',
  'input_volume_up',
  'input_volume_down',
  'input_menu_toggle',
  'input_cheat_index_plus',
  'input_cheat_index_minus',
  'input_cheat_toggle',
  'input_shader_next',
  'input_shader_prev',
  'input_shader_toggle',
  'input_disk_eject_toggle',
  'input_disk_next',
  'input_disk_prev',
  'input_grab_mouse_toggle',
  'input_game_focus_toggle',
  'input_netplay_game_watch',
  'input_netplay_host_toggle',
  'input_netplay_player_chat',
  'input_netplay_fade_chat_toggle',
  'input_netplay_ping_toggle',
  'input_osk_toggle',
  'input_fps_toggle',
  'input_toggle_statistics',
  'input_ai_service',
  'input_recording_toggle',
  'input_streaming_toggle',
  'input_runahead_toggle',
  'input_preempt_toggle',
  'input_overlay_next',
  'input_close_content',
  'input_quit_retroarch',
  'input_desktop_menu_toggle',
];

const k = (
  cfgSuffix: string,
  cfgKey: string,
  key: string,
  code: string,
  keyCode: number,
): LibretroKeyEntry => ({ cfgSuffix, cfgKey, key, code, keyCode });

/**
 * Collision-free 4-player input map (96 distinct RetroArch keysyms) covering
 * all 16 RetroPad buttons (0..15) and 8 analog stick directions (200..207)
 * for Players 1–4 (indices 0..3).
 */
export const LIBRETRO_PLAYER_KEYMAPS: readonly Record<
  number,
  LibretroKeyEntry
>[] = [
  // Player 1 (index 0)
  {
    0: k('b', 'z', 'z', 'KeyZ', 90),
    1: k('y', 'a', 'a', 'KeyA', 65),
    2: k('select', 'rshift', 'Shift', 'ShiftRight', 16),
    3: k('start', 'enter', 'Enter', 'Enter', 13),
    4: k('up', 'up', 'ArrowUp', 'ArrowUp', 38),
    5: k('down', 'down', 'ArrowDown', 'ArrowDown', 40),
    6: k('left', 'left', 'ArrowLeft', 'ArrowLeft', 37),
    7: k('right', 'right', 'ArrowRight', 'ArrowRight', 39),
    8: k('a', 'x', 'x', 'KeyX', 88),
    9: k('x', 's', 's', 'KeyS', 83),
    10: k('l', 'q', 'q', 'KeyQ', 81),
    11: k('r', 'w', 'w', 'KeyW', 87),
    12: k('l2', 'num1', '1', 'Digit1', 49),
    13: k('r2', 'num2', '2', 'Digit2', 50),
    14: k('l3', 'num3', '3', 'Digit3', 51),
    15: k('r3', 'num4', '4', 'Digit4', 52),
    200: k('l_x_minus', 'j', 'j', 'KeyJ', 74),
    201: k('l_x_plus', 'l', 'l', 'KeyL', 76),
    202: k('l_y_minus', 'i', 'i', 'KeyI', 73),
    203: k('l_y_plus', 'k', 'k', 'KeyK', 75),
    204: k('r_x_minus', 'f', 'f', 'KeyF', 70),
    205: k('r_x_plus', 'g', 'g', 'KeyG', 71),
    206: k('r_y_minus', 't', 't', 'KeyT', 84),
    207: k('r_y_plus', 'b', 'b', 'KeyB', 66),
  },
  // Player 2 (index 1)
  {
    0: k('b', 'c', 'c', 'KeyC', 67),
    1: k('y', 'd', 'd', 'KeyD', 68),
    2: k('select', 'rctrl', 'Control', 'ControlRight', 17),
    3: k('start', 'kp_enter', 'Enter', 'NumpadEnter', 13),
    4: k('up', 'keypad8', '8', 'Numpad8', 104),
    5: k('down', 'keypad2', '2', 'Numpad2', 98),
    6: k('left', 'keypad4', '4', 'Numpad4', 100),
    7: k('right', 'keypad6', '6', 'Numpad6', 102),
    8: k('a', 'v', 'v', 'KeyV', 86),
    9: k('x', 'e', 'e', 'KeyE', 69),
    10: k('l', 'r', 'r', 'KeyR', 82),
    11: k('r', 'y', 'y', 'KeyY', 89),
    12: k('l2', 'num5', '5', 'Digit5', 53),
    13: k('r2', 'num6', '6', 'Digit6', 54),
    14: k('l3', 'num7', '7', 'Digit7', 55),
    15: k('r3', 'num8', '8', 'Digit8', 56),
    200: k('l_x_minus', 'keypad1', '1', 'Numpad1', 97),
    201: k('l_x_plus', 'keypad3', '3', 'Numpad3', 99),
    202: k('l_y_minus', 'keypad7', '7', 'Numpad7', 103),
    203: k('l_y_plus', 'keypad9', '9', 'Numpad9', 105),
    204: k('r_x_minus', 'keypad0', '0', 'Numpad0', 96),
    205: k('r_x_plus', 'keypad5', '5', 'Numpad5', 101),
    206: k('r_y_minus', 'kp_plus', '+', 'NumpadAdd', 107),
    207: k('r_y_plus', 'kp_minus', '-', 'NumpadSubtract', 109),
  },
  // Player 3 (index 2)
  {
    0: k('b', 'm', 'm', 'KeyM', 77),
    1: k('y', 'n', 'n', 'KeyN', 78),
    2: k('select', 'num9', '9', 'Digit9', 57),
    3: k('start', 'num0', '0', 'Digit0', 48),
    4: k('up', 'f1', 'F1', 'F1', 112),
    5: k('down', 'f2', 'F2', 'F2', 113),
    6: k('left', 'f3', 'F3', 'F3', 114),
    7: k('right', 'f4', 'F4', 'F4', 115),
    8: k('a', 'o', 'o', 'KeyO', 79),
    9: k('x', 'p', 'p', 'KeyP', 80),
    10: k('l', 'u', 'u', 'KeyU', 85),
    11: k('r', 'h', 'h', 'KeyH', 72),
    12: k('l2', 'f5', 'F5', 'F5', 116),
    13: k('r2', 'f6', 'F6', 'F6', 117),
    14: k('l3', 'f7', 'F7', 'F7', 118),
    15: k('r3', 'f8', 'F8', 'F8', 119),
    200: k('l_x_minus', 'f9', 'F9', 'F9', 120),
    201: k('l_x_plus', 'f10', 'F10', 'F10', 121),
    202: k('l_y_minus', 'f11', 'F11', 'F11', 122),
    203: k('l_y_plus', 'f12', 'F12', 'F12', 123),
    204: k('r_x_minus', 'comma', ',', 'Comma', 188),
    205: k('r_x_plus', 'period', '.', 'Period', 190),
    206: k('r_y_minus', 'slash', '/', 'Slash', 191),
    207: k('r_y_plus', 'semicolon', ';', 'Semicolon', 186),
  },
  // Player 4 (index 3)
  {
    0: k('b', 'quote', "'", 'Quote', 222),
    1: k('y', 'leftbracket', '[', 'BracketLeft', 219),
    2: k('select', 'rightbracket', ']', 'BracketRight', 221),
    3: k('start', 'backslash', '\\', 'Backslash', 220),
    4: k('up', 'home', 'Home', 'Home', 36),
    5: k('down', 'end', 'End', 'End', 35),
    6: k('left', 'pageup', 'PageUp', 'PageUp', 33),
    7: k('right', 'pagedown', 'PageDown', 'PageDown', 34),
    8: k('a', 'minus', '-', 'Minus', 189),
    9: k('x', 'equals', '=', 'Equal', 187),
    10: k('l', 'tilde', '`', 'Backquote', 192),
    11: k('r', 'insert', 'Insert', 'Insert', 45),
    12: k('l2', 'del', 'Delete', 'Delete', 46),
    13: k('r2', 'tab', 'Tab', 'Tab', 9),
    14: k('l3', 'space', ' ', 'Space', 32),
    15: k('r3', 'backspace', 'Backspace', 'Backspace', 8),
    200: k('l_x_minus', 'ralt', 'Alt', 'AltRight', 18),
    201: k('l_x_plus', 'shift', 'Shift', 'ShiftLeft', 16),
    202: k('l_y_minus', 'ctrl', 'Control', 'ControlLeft', 17),
    203: k('l_y_plus', 'alt', 'Alt', 'AltLeft', 18),
    204: k('r_x_minus', 'kp_period', '.', 'NumpadDecimal', 110),
    205: k('r_x_plus', 'capslock', 'CapsLock', 'CapsLock', 20),
    206: k('r_y_minus', 'numlock', 'NumLock', 'NumLock', 144),
    207: k('r_y_plus', 'scroll_lock', 'ScrollLock', 'ScrollLock', 145),
  },
];

/**
 * Generates retroarch.cfg lines disabling all RetroArch hotkeys and binding
 * all 4 players (input_player1_* .. input_player4_*).
 */
export function buildRetroArchInputConfigLines(): string[] {
  const lines: string[] = [
    'input_max_users = "4"',
    ...RETROARCH_DISABLED_HOTKEYS.map((key) => `${key} = "nul"`),
  ];

  LIBRETRO_PLAYER_KEYMAPS.forEach((map, playerIdx) => {
    const pNum = playerIdx + 1;
    for (const entry of Object.values(map)) {
      lines.push(`input_player${pNum}_${entry.cfgSuffix} = "${entry.cfgKey}"`);
    }
  });

  return lines;
}
