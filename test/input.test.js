import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildRetroArchInputConfigLines,
  EmulatorJSAdapter,
  LIBRETRO_PLAYER_KEYMAPS,
  LibretroAdapter,
  LoveAdapter,
  Pico8Adapter,
  PlayAdapter,
  RETROARCH_DISABLED_HOTKEYS,
  RuffleAdapter,
} from '../dist/retrokit.js';

const ALL_ACTION_IDS = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 200, 201, 202, 203, 204,
  205, 206, 207,
];

test('LIBRETRO_PLAYER_KEYMAPS defines 4 players with 24 unique non-colliding keys each', () => {
  assert.equal(LIBRETRO_PLAYER_KEYMAPS.length, 4);
  const usedCfgKeys = new Set();

  for (let p = 0; p < 4; p++) {
    const map = LIBRETRO_PLAYER_KEYMAPS[p];
    for (const id of ALL_ACTION_IDS) {
      const entry = map[id];
      assert.ok(entry, `Player ${p + 1} missing action ID ${id}`);
      assert.ok(
        !usedCfgKeys.has(entry.cfgKey),
        `Duplicate RetroArch cfgKey "${entry.cfgKey}" on Player ${p + 1} action ${id}`,
      );
      usedCfgKeys.add(entry.cfgKey);
    }
  }
  assert.equal(usedCfgKeys.size, 96);
});

test('buildRetroArchInputConfigLines disables all RetroArch hotkeys and binds P1-P4', () => {
  const lines = buildRetroArchInputConfigLines();
  for (const hk of RETROARCH_DISABLED_HOTKEYS) {
    assert.ok(
      lines.includes(`${hk} = "nul"`),
      `Expected disabled hotkey line for ${hk}`,
    );
  }
  for (let p = 1; p <= 4; p++) {
    assert.ok(lines.includes(`input_player${p}_b = "${LIBRETRO_PLAYER_KEYMAPS[p - 1][0].cfgKey}"`));
    assert.ok(lines.includes(`input_player${p}_r_x_plus = "${LIBRETRO_PLAYER_KEYMAPS[p - 1][205].cfgKey}"`));
  }
});

test('LibretroAdapter dispatches non-colliding synthetic KeyboardEvents for Players 1-4', () => {
  const prevDoc = globalThis.document;
  const prevKb = globalThis.KeyboardEvent;
  const dispatched = [];

  globalThis.KeyboardEvent = class MockKeyboardEvent {
    constructor(type, init) {
      this.type = type;
      Object.assign(this, init);
    }
  };
  globalThis.document = {
    dispatchEvent: (evt) => {
      dispatched.push(evt);
      return true;
    },
  };

  try {
    const adapter = new LibretroAdapter('pcsx_rearmed', 'PS1', 'psx', {
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
    });

    for (let p = 0; p < 4; p++) {
      dispatched.length = 0;
      adapter.rawSendButton(p, 0, true);
      adapter.rawSendButton(p, 12, true);
      adapter.rawSendAxis(p, 2, 1.0);
      adapter.rawSendAxis(p, 3, -1.0);
      assert.equal(dispatched.length, 4, `Player ${p + 1} should dispatch 4 events`);
      assert.ok(dispatched.every((e) => e.bubbles === true && e._isRetroKitSynthetic === true));
      assert.equal(dispatched[0].code, LIBRETRO_PLAYER_KEYMAPS[p][0].code);
      assert.equal(dispatched[1].code, LIBRETRO_PLAYER_KEYMAPS[p][12].code);
      assert.equal(dispatched[2].code, LIBRETRO_PLAYER_KEYMAPS[p][205].code);
      assert.equal(dispatched[3].code, LIBRETRO_PLAYER_KEYMAPS[p][206].code);
    }
  } finally {
    globalThis.document = prevDoc;
    globalThis.KeyboardEvent = prevKb;
  }
});

test('EmulatorJSAdapter forwards all 4 players and axes to simulateInput', () => {
  const calls = [];
  const adapter = new EmulatorJSAdapter('mupen64plus_next', 'N64', 'n64', {
    saveStates: true,
    sram: true,
    cheats: true,
    coreOptions: true,
    multiDisc: false,
    shaders: false,
    rewind: false,
    variableSpeed: true,
    maxPlayers: 4,
    pointer: false,
  });
  adapter._module = {
    gameManager: {
      simulateInput: (player, id, val) => calls.push([player, id, val]),
    },
  };

  for (let p = 0; p < 4; p++) {
    adapter.rawSendButton(p, 0, true);
    adapter.rawSendAxis(p, 2, 1.0);
  }
  assert.ok(calls.some((c) => c[0] === 0 && c[1] === 0 && c[2] === 1));
  assert.ok(calls.some((c) => c[0] === 3 && c[1] === 0 && c[2] === 1));
  assert.ok(calls.some((c) => c[0] === 3 && c[1] === 20 && c[2] === 32767));
});

test('PlayAdapter, Pico8Adapter, LoveAdapter, RuffleAdapter are importable and handle buttons', () => {
  assert.equal(typeof PlayAdapter, 'function');
  assert.equal(typeof Pico8Adapter, 'function');
  assert.equal(typeof LoveAdapter, 'function');
  assert.equal(typeof RuffleAdapter, 'function');
});
