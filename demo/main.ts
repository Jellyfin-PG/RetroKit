import { RetroKit } from '../src/index';

const canvas = (document.getElementById('canvas') ||
  document.getElementById('emu-canvas')) as HTMLCanvasElement;
if (canvas && !canvas.id) {
  canvas.id = 'canvas';
}
const logEl = document.getElementById('log') as HTMLDivElement;
const coreBadge = document.getElementById(
  'active-core-badge',
) as HTMLSpanElement;
const capGrid = document.getElementById('capabilities-grid') as HTMLDivElement;
const statsHud = document.getElementById('stats-hud') as HTMLDivElement;
const assetUrlInput = document.getElementById(
  'asset-base-url',
) as HTMLInputElement;

function log(msg: string) {
  const time = new Date().toLocaleTimeString();
  if (logEl.textContent?.trim() === 'Awaiting ROM load...') {
    logEl.textContent = '';
  }
  const line = `[${time}] ${msg}\n`;
  logEl.textContent += line;
  logEl.scrollTop = logEl.scrollHeight;
}

// Instantiate RetroKit with canvas
const emu = new RetroKit({
  canvas,
  assetBaseUrl: assetUrlInput?.value || '/libretro-cores',
  debug: true,
});
(window as any).emu = emu;

assetUrlInput?.addEventListener('input', () => {
  if (assetUrlInput.value) {
    (emu as any)._config.assetBaseUrl = assetUrlInput.value;
  }
});

function renderCapabilities() {
  capGrid.innerHTML = '';
  const caps = emu.capabilities;
  for (const [key, val] of Object.entries(caps)) {
    const item = document.createElement('div');
    item.className = 'cap-item';
    item.innerHTML = `
      <span>${key}</span>
      <span class="cap-val ${val}">${val}</span>
    `;
    capGrid.appendChild(item);
  }
}

renderCapabilities();

// Event hooks
emu.on('ready', ({ core, gameId }) => {
  coreBadge.textContent = core.toUpperCase();
  log(`Game loaded: "${gameId}" running on [${core}]`);
  renderCapabilities();
});

emu.on('fps', ({ fps }) => {
  statsHud.textContent = `FPS: ${fps.toFixed(1)}`;
});

let activePatchFile: File | null = null;

emu.on('sramModified', () => {
  log('Battery SRAM updated by in-game progress (dirty-sync triggered).');
});

emu.on('pause', () => log('Emulation paused.'));
emu.on('resume', () => log('Emulation resumed.'));
emu.on('stop', () => log('Emulation stopped (SRAM committed).'));
emu.on('romPatched', ({ format, originalSize, patchedSize }) => {
  log(
    `[ROM Patcher] Applied ${format} patch in-memory (${(originalSize / 1024).toFixed(1)} KB -> ${(patchedSize / 1024).toFixed(1)} KB).`,
  );
});

// --- RetroAchievements UI & Audio Feedback ---
let toastTimer: any = null;
function playAchievementSound() {
  try {
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.connect(gain);
    gain.connect(ctx.destination);

    // Chime Fanfare: C5 -> E5 -> G5 -> C6
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.setValueAtTime(659.25, now + 0.08);
    osc.frequency.setValueAtTime(783.99, now + 0.16);
    osc.frequency.setValueAtTime(1046.5, now + 0.24);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    osc.start(now);
    osc.stop(now + 0.65);
  } catch (_) {}
}

function showAchievementToast(achievement: any, hardcore: boolean) {
  playAchievementSound();
  const toast = document.getElementById('cheevos-toast');
  const badgeImg = document.getElementById(
    'cheevos-toast-badge',
  ) as HTMLImageElement;
  const pointsEl = document.getElementById('cheevos-toast-points');
  const titleEl = document.getElementById('cheevos-toast-title');
  const descEl = document.getElementById('cheevos-toast-desc');

  if (!toast || !badgeImg || !pointsEl || !titleEl || !descEl) return;

  badgeImg.src =
    achievement.badgeUrl ||
    'https://media.retroachievements.org/Badge/00001.png';
  pointsEl.textContent = `+${achievement.points} pts${hardcore ? ' [HC]' : ''}`;
  titleEl.textContent = achievement.title;
  descEl.textContent = achievement.description;

  toast.style.display = 'flex';
  // Small delay to allow CSS transition to trigger
  setTimeout(() => toast.classList.add('show'), 20);

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (!toast.classList.contains('show')) toast.style.display = 'none';
    }, 400);
  }, 4500);
}

function renderAchievementsList(
  achievements: any[],
  gameTitle?: string | null,
) {
  const container = document.getElementById('cheevos-list-container');
  const statusEl = document.getElementById('cheevos-game-status');
  if (!container) return;

  if (statusEl) {
    if (gameTitle) {
      statusEl.textContent = `Game: ${gameTitle} (${achievements.length} achievements)`;
    } else if (emu.achievements.gameHash) {
      statusEl.textContent = `Hash: ${emu.achievements.gameHash.slice(0, 10)}... (${achievements.length} achievements)`;
    } else {
      statusEl.textContent = 'No game loaded or awaiting hash lookup...';
    }
  }

  container.innerHTML = '';
  if (achievements.length === 0) {
    container.innerHTML = `<div style="font-size: 11px; color: #64748b; text-align: center; padding: 12px;">${
      emu.achievements.isLoggedIn
        ? 'No achievements found for this game or ROM hash.'
        : 'Connect your RetroAchievements account to view achievements.'
    }</div>`;
    return;
  }

  for (const ach of achievements) {
    const item = document.createElement('div');
    item.className = `cheevos-item ${ach.unlocked ? 'unlocked' : ''}`;
    item.id = `cheevos-item-${ach.id}`;

    const badgeUrl =
      ach.badgeUrl || 'https://media.retroachievements.org/Badge/00001.png';
    item.innerHTML = `
      <img src="${badgeUrl}" class="cheevos-badge-img ${ach.unlocked ? '' : 'locked'}" alt="${ach.title}" />
      <div style="flex: 1; min-width: 0;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
          <span style="font-size: 12px; font-weight: 600; color: #f8fafc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${ach.title}</span>
          <span style="font-size: 11px; font-weight: 700; color: #f59e0b; margin-left: 6px; flex-shrink: 0;">${ach.points} pts</span>
        </div>
        <div style="font-size: 10px; color: #94a3b8; line-height: 1.2; margin-bottom: 4px;">${ach.description}</div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="badge ${ach.unlocked ? 'success' : 'secondary'}" style="font-size: 9px; padding: 1px 6px;">
            ${ach.unlocked ? (ach.unlockedHardcore ? 'UNLOCKED [HC]' : 'UNLOCKED') : 'LOCKED'}
          </span>
          ${!ach.unlocked ? `<button class="btn-unlock-test" data-id="${ach.id}" style="font-size: 9px; padding: 2px 6px; background: #3b82f6;">Unlock</button>` : ''}
        </div>
      </div>
    `;

    container.appendChild(item);
  }

  // Attach click handlers to individual test unlock buttons
  container.querySelectorAll('.btn-unlock-test').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const id = Number(
        (e.currentTarget as HTMLElement).getAttribute('data-id'),
      );
      if (id) {
        log(
          `[RetroAchievements] Manually triggering unlock for achievement ID: ${id}...`,
        );
        await emu.achievements.unlock(id);
      }
    });
  });
}

// RetroAchievements Event Listeners
const cheevosAuthForm = document.getElementById('cheevos-auth-form');
const cheevosProfile = document.getElementById('cheevos-profile');
const cheevosUserDisplay = document.getElementById('cheevos-user-display');
const cheevosScoreDisplay = document.getElementById('cheevos-score-display');
const btnCheevosLogin = document.getElementById('btn-cheevos-login');
const btnCheevosLogout = document.getElementById('btn-cheevos-logout');

emu.on('achievementLogin', ({ user }) => {
  if (cheevosAuthForm) cheevosAuthForm.style.display = 'none';
  if (cheevosProfile) cheevosProfile.style.display = 'block';
  if (cheevosUserDisplay) cheevosUserDisplay.textContent = user.username;
  if (cheevosScoreDisplay)
    cheevosScoreDisplay.textContent = `${user.score || 0} pts`;
  log(
    `[RetroAchievements] Connected as "${user.username}" (${user.score || 0} pts). Hardcore: ${emu.achievements.hardcore ? 'ON' : 'OFF'}.`,
  );
});

emu.on('achievementsLoaded', ({ gameId, gameTitle, achievements }) => {
  log(
    `[RetroAchievements] Loaded ${achievements.length} achievements for "${gameTitle || 'Game'}" (RA Game ID: ${gameId || 'None'}).`,
  );
  renderAchievementsList(achievements, gameTitle);
});

emu.on('achievementUnlocked', ({ achievement, hardcore }) => {
  log(
    `[RetroAchievements] UNLOCKED: "${achievement.title}" (${achievement.points} pts)${hardcore ? ' [HARDCORE]' : ''}! ${achievement.description}`,
  );
  showAchievementToast(achievement, hardcore);

  // Update visual item in list
  const itemEl = document.getElementById(`cheevos-item-${achievement.id}`);
  if (itemEl) {
    itemEl.classList.add('unlocked');
    const img = itemEl.querySelector('.cheevos-badge-img');
    if (img) img.classList.remove('locked');
    const badgeSpan = itemEl.querySelector('.badge');
    if (badgeSpan) {
      badgeSpan.className = 'badge success';
      badgeSpan.textContent = hardcore ? 'UNLOCKED [HC]' : 'UNLOCKED';
    }
    const unlockBtn = itemEl.querySelector('.btn-unlock-test');
    if (unlockBtn) unlockBtn.remove();
  }

  // Update user score display
  if (cheevosScoreDisplay && emu.achievements.user) {
    const currentScore =
      (emu.achievements.user.score || 0) + achievement.points;
    (emu.achievements.user as any).score = currentScore;
    cheevosScoreDisplay.textContent = `${currentScore} pts`;
  }
});

btnCheevosLogin?.addEventListener('click', async () => {
  const userInput = (
    document.getElementById('cheevos-username') as HTMLInputElement
  )?.value.trim();
  const tokenInput = (
    document.getElementById('cheevos-token') as HTMLInputElement
  )?.value.trim();
  const hardcoreInput = (
    document.getElementById('cheevos-hardcore') as HTMLInputElement
  )?.checked;

  if (!userInput || !tokenInput) {
    alert(
      'Please enter your RetroAchievements username and password or Web API Key.',
    );
    return;
  }

  btnCheevosLogin.textContent = 'Connecting...';
  (btnCheevosLogin as HTMLButtonElement).disabled = true;

  emu.achievements.setHardcore(hardcoreInput);
  const res = await emu.achievements.login(userInput, tokenInput);

  btnCheevosLogin.textContent = 'Connect Account';
  (btnCheevosLogin as HTMLButtonElement).disabled = false;

  if (res.success && res.user) {
    localStorage.setItem('ra_username', userInput);
    localStorage.setItem('ra_token', res.user.token || tokenInput);
    localStorage.setItem('ra_hardcore', hardcoreInput ? 'true' : 'false');
  } else {
    alert(`RetroAchievements login failed: ${res.error}`);
    log(`[RetroAchievements] Login error: ${res.error}`);
  }
});

btnCheevosLogout?.addEventListener('click', () => {
  emu.achievements.logout();
  localStorage.removeItem('ra_username');
  localStorage.removeItem('ra_token');
  if (cheevosAuthForm) cheevosAuthForm.style.display = 'block';
  if (cheevosProfile) cheevosProfile.style.display = 'none';
  renderAchievementsList([]);
  log('[RetroAchievements] Logged out.');
});

// Auto-restore saved credentials
const savedUser = localStorage.getItem('ra_username');
const savedToken = localStorage.getItem('ra_token');
const savedHardcore = localStorage.getItem('ra_hardcore') !== 'false';
if (savedUser && savedToken) {
  const uInput = document.getElementById(
    'cheevos-username',
  ) as HTMLInputElement;
  const tInput = document.getElementById('cheevos-token') as HTMLInputElement;
  const hInput = document.getElementById(
    'cheevos-hardcore',
  ) as HTMLInputElement;
  if (uInput) uInput.value = savedUser;
  if (tInput) tInput.value = savedToken;
  if (hInput) hInput.checked = savedHardcore;
  emu.achievements.setHardcore(savedHardcore);
  emu.achievements.login(savedUser, savedToken).catch((e) => {
    log(`Auto-login to RetroAchievements failed: ${e.message}`);
  });
}

document
  .getElementById('btn-cheevos-test')
  ?.addEventListener('click', async () => {
    const testAch = {
      id: 99901,
      title: 'Retro Pioneer',
      description: 'Launch RetroKit with live RetroAchievements integration.',
      points: 25,
      badgeName: '00001',
      badgeUrl: 'https://media.retroachievements.org/Badge/00001.png',
      unlocked: false,
    };

    const existing = emu.achievements.achievements;
    if (!existing.some((a) => a.id === testAch.id)) {
      emu.achievements.setAchievements(
        [testAch, ...existing],
        emu.achievements.gameHash || undefined,
        emu.achievements.gameTitle || 'Testbed',
      );
      renderAchievementsList(
        emu.achievements.achievements,
        emu.achievements.gameTitle || 'Testbed',
      );
    }

    log('[RetroAchievements] Triggering simulated unlock (ID: 99901)...');
    await emu.achievements.unlock(99901);
  });

emu.on('log', ({ message, level }) => {
  log(`[Core ${level.toUpperCase()}] ${message}`);
});
emu.on('error', ({ error, fatal }) => {
  log(`[ERROR${fatal ? ' FATAL' : ''}] ${error.message}`);
});

// DOM Controls
document.getElementById('patch-input')?.addEventListener('change', (e) => {
  const target = e.target as HTMLInputElement;
  activePatchFile = target.files?.[0] || null;
  if (activePatchFile) {
    log(
      `Selected ROM patch: ${activePatchFile.name} (${(activePatchFile.size / 1024).toFixed(1)} KB). Will be applied on next ROM load.`,
    );
  } else {
    log('ROM patch cleared.');
  }
});

document.getElementById('bios-input')?.addEventListener('change', async (e) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  const buf = await file.arrayBuffer();
  emu.bios.register(file.name, buf);
  log(
    `Registered BIOS: "${file.name}" (${(buf.byteLength / 1024).toFixed(1)} KB). Stored in BiosManager.`,
  );
});

const systemSelect = document.getElementById(
  'system-select',
) as HTMLSelectElement;

systemSelect?.addEventListener('change', () => {
  const selected =
    systemSelect.value && systemSelect.value !== 'auto'
      ? systemSelect.value
      : undefined;
  emu.setSystem(selected);
  log(`Target system platform updated to: ${systemSelect.value}`);
});

document.getElementById('file-input')?.addEventListener('change', async (e) => {
  const target = e.target as HTMLInputElement;
  const files = target.files;
  if (!files || files.length === 0) return;

  const selectedSystem =
    systemSelect?.value && systemSelect.value !== 'auto'
      ? systemSelect.value
      : undefined;

  let primaryFile: File = files[0];
  const additionalFiles: Array<{ name: string; data: File }> = [];

  if (files.length > 1) {
    // If multiple files selected, find the cue / m3u descriptor as primary boot file
    const fileList = Array.from(files);
    const cueMatch = fileList.find(
      (f) =>
        f.name.toLowerCase().endsWith('.cue') ||
        f.name.toLowerCase().endsWith('.m3u'),
    );
    if (cueMatch) {
      primaryFile = cueMatch;
    }
    for (const f of fileList) {
      if (f !== primaryFile) {
        additionalFiles.push({ name: f.name, data: f });
      }
    }
    log(
      `Loading multi-file set: "${primaryFile.name}" with ${additionalFiles.length} companion file(s) (${additionalFiles.map((a) => a.name).join(', ')})...`,
    );
  } else {
    log(
      `Loading file: ${primaryFile.name} (${(primaryFile.size / 1024).toFixed(1)} KB)${
        selectedSystem ? ` [System: ${selectedSystem}]` : ''
      }...`,
    );
  }

  try {
    await emu.load(primaryFile, {
      fileName: primaryFile.name,
      system: selectedSystem,
      additionalFiles: additionalFiles.length > 0 ? additionalFiles : undefined,
      patch: activePatchFile || undefined,
    });
    await emu.play();
  } catch (err: any) {
    log(`Load error: ${err.message}`);
  } finally {
    target.value = '';
  }
});

// Drag and drop ROM files onto the viewport container
const viewportContainer = document.getElementById('viewport-container');
if (viewportContainer) {
  viewportContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
  viewportContainer.addEventListener('drop', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const selectedSystem =
      systemSelect?.value && systemSelect.value !== 'auto'
        ? systemSelect.value
        : undefined;

    let primaryFile = files[0];
    const additionalFiles: Array<{ name: string; data: File }> = [];
    if (files.length > 1) {
      const fileList = Array.from(files);
      const cueMatch = fileList.find(
        (f) =>
          f.name.toLowerCase().endsWith('.cue') ||
          f.name.toLowerCase().endsWith('.m3u'),
      );
      if (cueMatch) primaryFile = cueMatch;
      for (const f of fileList) {
        if (f !== primaryFile) additionalFiles.push({ name: f.name, data: f });
      }
    }

    log(
      `Dropped file: ${primaryFile.name} (${(primaryFile.size / 1024).toFixed(1)} KB)...`,
    );
    try {
      await emu.load(primaryFile, {
        fileName: primaryFile.name,
        system: selectedSystem,
        additionalFiles:
          additionalFiles.length > 0 ? additionalFiles : undefined,
      });
      await emu.play();
    } catch (err: any) {
      log(`Drop load error: ${err.message}`);
    }
  });
}

document
  .getElementById('btn-load-pico8')
  ?.addEventListener('click', async () => {
    log('Fetching test PICO-8 cart: /test_carts/celeste.p8.png...');
    try {
      const res = await fetch('/test_carts/celeste.p8.png');
      const buf = await res.arrayBuffer();
      await emu.load(buf, {
        fileName: 'celeste.p8.png',
        system: 'pico8',
      });
      emu.play();
    } catch (err: any) {
      log(`PICO-8 load error: ${err.message}`);
    }
  });

document.getElementById('btn-load-psp')?.addEventListener('click', async () => {
  log('Fetching test PSP cart: /test_carts/psp_hello_world.pbp...');
  try {
    const res = await fetch('/test_carts/psp_hello_world.pbp');
    const buf = await res.arrayBuffer();
    await emu.load(buf, {
      fileName: 'EBOOT.PBP',
      system: 'psp',
    });
    emu.play();
  } catch (err: any) {
    log(`PSP load error: ${err.message}`);
  }
});

document.getElementById('btn-load-3ds')?.addEventListener('click', async () => {
  log('Fetching test 3DS cart: /test_carts/boot.3dsx...');
  try {
    const res = await fetch('/test_carts/boot.3dsx');
    const buf = await res.arrayBuffer();
    await emu.load(buf, {
      fileName: 'boot.3dsx',
      system: '3ds',
    });
    emu.play();
  } catch (err: any) {
    log(`3DS load error: ${err.message}`);
  }
});

document.getElementById('btn-load-nds')?.addEventListener('click', async () => {
  log('Fetching test NDS cart: /test_carts/nesds.nds...');
  try {
    const res = await fetch('/test_carts/nesds.nds');
    const buf = await res.arrayBuffer();
    await emu.load(buf, {
      fileName: 'nesds.nds',
      system: 'nds',
    });
    emu.play();
  } catch (err: any) {
    log(`NDS load error: ${err.message}`);
  }
});

document
  .getElementById('btn-load-love')
  ?.addEventListener('click', async () => {
    log('Fetching test LÖVE cart: /test_carts/hello.love...');
    try {
      const res = await fetch('/test_carts/hello.love');
      const buf = await res.arrayBuffer();
      await emu.load(buf, {
        fileName: 'hello.love',
        system: 'love',
      });
      emu.play();
    } catch (err: any) {
      log(`LÖVE load error: ${err.message}`);
    }
  });

document.getElementById('btn-play')?.addEventListener('click', async () => {
  await emu.play();
  log('Playback resumed.');
});
document.getElementById('btn-pause')?.addEventListener('click', () => {
  emu.pause();
  log('Playback paused.');
});
document.getElementById('btn-restart')?.addEventListener('click', async () => {
  log('Restarting game...');
  await emu.restart();
  log('Game restarted.');
});
document.getElementById('btn-stop')?.addEventListener('click', async () => {
  await emu.stop();
  statsHud.textContent = 'FPS: --';
  log('Emulation stopped (SRAM committed, screen cleared).');
});
document.getElementById('btn-destroy')?.addEventListener('click', async () => {
  await emu.destroy();
  coreBadge.textContent = 'DISPOSED';
  statsHud.textContent = 'FPS: --';
  log('Engine disposed (WASM memory released, audio closed, canvas cleared).');
});

document
  .getElementById('btn-save-state')
  ?.addEventListener('click', async () => {
    if (!emu.capabilities.saveStates) {
      log('Save states not supported by active core.');
      return;
    }
    log('Saving state to slot 0...');
    const record = await emu.state.saveState(0);
    if (record) {
      log(
        `Saved state slot 0 successfully (${(record.metadata.sizeBytes / 1024).toFixed(1)} KB).`,
      );
    } else {
      log('Failed to capture save state.');
    }
  });

document
  .getElementById('btn-load-state')
  ?.addEventListener('click', async () => {
    if (!emu.capabilities.saveStates) {
      log('Save states not supported by active core.');
      return;
    }
    log('Loading state from slot 0...');
    const ok = await emu.state.loadState(0);
    log(
      ok
        ? 'Loaded state slot 0 successfully.'
        : 'No save state found in slot 0 or restore failed.',
    );
  });

document
  .getElementById('btn-flush-sram')
  ?.addEventListener('click', async () => {
    await emu.sram.flushSram();
    log('Flushed battery SRAM.');
  });

// Virtual Controller Input Injection Buttons
document
  .getElementById('btn-input-dpad-up')
  ?.addEventListener('mousedown', () => {
    emu.input.player(0).sendButton('DPAD_UP', true);
  });
document
  .getElementById('btn-input-dpad-up')
  ?.addEventListener('mouseup', () => {
    emu.input.player(0).sendButton('DPAD_UP', false);
  });

document
  .getElementById('btn-input-action-a')
  ?.addEventListener('mousedown', () => {
    emu.input.player(0).sendButton('ACTION_DOWN', true);
  });
document
  .getElementById('btn-input-action-a')
  ?.addEventListener('mouseup', () => {
    emu.input.player(0).sendButton('ACTION_DOWN', false);
  });

document
  .getElementById('btn-input-stick-right')
  ?.addEventListener('mousedown', () => {
    emu.input.player(0).sendAxis('L_STICK_X', 1.0);
  });
document
  .getElementById('btn-input-stick-right')
  ?.addEventListener('mouseup', () => {
    emu.input.player(0).sendAxis('L_STICK_X', 0.0);
  });

document.getElementById('btn-aspect-43')?.addEventListener('click', () => {
  emu.video.setAspectRatio('4:3');
  log('Aspect ratio changed to 4:3.');
});
document.getElementById('btn-aspect-169')?.addEventListener('click', () => {
  emu.video.setAspectRatio('16:9');
  log('Aspect ratio changed to 16:9.');
});
document.getElementById('btn-aspect-auto')?.addEventListener('click', () => {
  emu.video.setAspectRatio('auto');
  log('Aspect ratio changed to Auto (native).');
});

document
  .getElementById('btn-screenshot')
  ?.addEventListener('click', async () => {
    try {
      const blob = await emu.video.takeScreenshot('image/png');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `screenshot-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      log('Screenshot captured and downloaded.');
    } catch (err: any) {
      log(`Screenshot failed: ${err.message}`);
    }
  });
