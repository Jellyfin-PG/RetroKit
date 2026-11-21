import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { CoreRegistry, SramManager, InputManager, RetroKit } = require('../dist/retrokit.umd.cjs');

test('CoreRegistry has all expected cores and systems', () => {
  const allCores = CoreRegistry.getAllCores();
  assert.ok(allCores.length >= 100, `Expected at least 100 cores, found ${allCores.length}`);

  const psp = CoreRegistry.getCore('ppsspp');
  assert.ok(psp, 'PPSSPP core should be registered');
  assert.equal(psp.family, 'emulatorjs');

  const azahar = CoreRegistry.getCore('azahar');
  assert.ok(azahar, 'Azahar (3DS) core should be registered');
  assert.equal(azahar.family, 'emulatorjs');

  const dos = CoreRegistry.getCore('dosbox_pure');
  assert.ok(dos, 'DOSBox Pure core should be registered');
  assert.equal(dos.system, 'dos');

  const pico8 = CoreRegistry.getCore('pico8');
  assert.ok(pico8, 'PICO-8 core should be registered');
  assert.equal(pico8.family, 'pico8');

  const love = CoreRegistry.getCore('love');
  assert.ok(love, 'LÖVE core should be registered');
  assert.equal(love.family, 'love');
});

test('CoreRegistry resolves cores by file extension', () => {
  const pspCore = CoreRegistry.resolveCoreFromFileName('game.iso', 'psp');
  assert.equal(pspCore?.id, 'ppsspp');

  const loveCore = CoreRegistry.resolveCoreFromFileName('bookbinder.love');
  assert.equal(loveCore?.id, 'love');

  const pico8Core = CoreRegistry.resolveCoreFromFileName('celeste.p8.png');
  assert.equal(pico8Core?.id, 'pico8');
});

test('InputManager initializes standard players and hotkeys', () => {
  const input = new InputManager(() => null, 4);
  assert.equal(input.getMaxPlayers(), 4);
  assert.ok(input.player(0), 'Player 0 input channel should exist');
  assert.ok(input.player(3), 'Player 3 input channel should exist');
  assert.throws(() => input.player(4), /Invalid player index/);
  input.destroy();
});

test('RetroKit setCoresDirectory and coresDirectory methods', () => {
  const emu = new RetroKit({
    canvas: {},
    assetBaseUrl: '/initial-cores',
  });
  assert.equal(emu.coresDirectory, '/initial-cores');
  assert.equal(emu.assetBaseUrl, '/initial-cores');
  assert.equal(emu.getCoresDirectory(), '/initial-cores');
  assert.equal(emu.getAssetBaseUrl(), '/initial-cores');

  emu.setCoresDirectory('/custom/cdn/cores');
  assert.equal(emu.coresDirectory, '/custom/cdn/cores');
  assert.equal(emu.assetBaseUrl, '/custom/cdn/cores');

  emu.setAssetBaseUrl('https://cores.example.com');
  assert.equal(emu.coresDirectory, 'https://cores.example.com');
});

test('RetroKit supports existing canvas and setCanvas', () => {
  const emu = new RetroKit({
    preserveCanvas: true,
  });
  assert.equal(emu.canvas, undefined);

  const mockCanvas = { id: 'existing-gl-canvas' };
  emu.setCanvas(mockCanvas, { useExistingCanvas: true });
  assert.equal(emu.canvas, mockCanvas);
  assert.equal(emu.canvas.id, 'existing-gl-canvas');
});


