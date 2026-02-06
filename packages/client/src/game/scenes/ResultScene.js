import Phaser from 'phaser';

const RESULT_LOG_PAGE_SIZE = 10;
const RANDOM_SEED_MAX_EXCLUSIVE = 1_000_000_000;
const MAX_ALLOWED_SEED = Number.MAX_SAFE_INTEGER;

function parseSeedInput(value) {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return { ok: false, message: 'Seed is required.' };
  if (!/^[-+]?\d+$/.test(trimmed)) return { ok: false, message: 'Seed must be an integer.' };

  const seed = Number(trimmed);
  if (!Number.isSafeInteger(seed)) return { ok: false, message: `Seed must be within ±${MAX_ALLOWED_SEED}.` };
  if (seed < 0) return { ok: false, message: 'Seed must be >= 0.' };

  return { ok: true, seed };
}

function createRandomSeed() {
  return Math.floor(Math.random() * RANDOM_SEED_MAX_EXCLUSIVE);
}

function formatLogEntry(entry) {
  const t = Number(entry.t || 0).toFixed(2);
  return `[${t}] ${entry.type} a=${entry.actorId ?? '-'} t=${entry.targetId ?? '-'} s=${entry.skillId ?? '-'} v=${entry.value ?? '-'}`;
}

export class ResultScene extends Phaser.Scene {
  constructor() {
    super('ResultScene');
    this.logPage = 0;
    this.logVisible = false;
  }

  create(data) {
    const world = data.result;
    const winner = world.winner;
    const seed = Number.isSafeInteger(Number(data.seed)) ? Number(data.seed) : 123;
    this.appliedSeed = seed;
    this.combatLog = data.logPolicy === 'RESULT_SCENE' ? (data.combatLog || []) : [];

    const scoreA = world.units.filter((u) => u.teamId === 'A').reduce((s, u) => s + u.stats.kills * 3 + Math.round(u.hp / 100), 0);
    const scoreB = world.units.filter((u) => u.teamId === 'B').reduce((s, u) => s + u.stats.kills * 3 + Math.round(u.hp / 100), 0);

    this.add.text(20, 20, `Result: ${winner}`, { color: '#fff', fontSize: '28px' });
    this.add.text(20, 52, `Applied seed: ${this.appliedSeed}`, { color: '#fde68a', fontSize: '18px' });
    this.add.text(20, 78, `Score A ${scoreA} : ${scoreB} B`, { color: '#d1d5db' });

    let y = 120;
    for (const u of world.units) {
      const line = `${u.teamId} ${u.name} | Dmg ${u.stats.damageDone} Heal ${u.stats.healDone} K/D ${u.stats.kills}/${u.stats.deaths}`;
      this.add.text(20, y, line, { color: u.teamId === 'A' ? '#7dd3fc' : '#fca5a5', fontSize: '14px' });
      y += 20;
    }

    if (this.combatLog.length > 0) this.createResultLogOverlay();

    this.createReplayActions(y + 20);
    this.createSeedInputOverlay();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroySeedInputOverlay());
    this.events.once(Phaser.Scenes.Events.DESTROY, () => this.destroySeedInputOverlay());
  }

  createReplayActions(y) {
    const sameSeedButton = this.add.text(20, y, `Replay same seed (${this.appliedSeed})`, {
      backgroundColor: '#1f2937',
      color: '#fff',
      padding: { x: 8, y: 4 }
    });
    sameSeedButton.setInteractive({ useHandCursor: true });
    sameSeedButton.on('pointerdown', () => this.scene.start('MatchScene', { seed: this.appliedSeed }));

    const randomSeedButton = this.add.text(20, y + 36, 'Replay random seed', {
      backgroundColor: '#1f2937',
      color: '#fff',
      padding: { x: 8, y: 4 }
    });
    randomSeedButton.setInteractive({ useHandCursor: true });
    randomSeedButton.on('pointerdown', () => {
      const randomSeed = createRandomSeed();
      this.scene.start('MatchScene', { seed: randomSeed });
    });

    this.add.text(20, y + 72, 'Replay with input seed (overlay):', {
      color: '#cbd5e1',
      fontSize: '14px'
    });
  }

  createSeedInputOverlay() {
    const appRoot = document.getElementById('app');
    if (!appRoot) return;

    const wrapper = document.createElement('div');
    wrapper.style.position = 'absolute';
    wrapper.style.left = '20px';
    wrapper.style.top = '390px';
    wrapper.style.display = 'flex';
    wrapper.style.gap = '8px';
    wrapper.style.alignItems = 'center';
    wrapper.style.zIndex = '10';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter seed (integer >= 0)';
    input.value = String(this.appliedSeed);
    input.style.width = '220px';
    input.style.padding = '6px 8px';

    const submit = document.createElement('button');
    submit.type = 'button';
    submit.textContent = 'Replay with input seed';
    submit.style.padding = '6px 10px';
    submit.style.cursor = 'pointer';

    const message = document.createElement('span');
    message.style.color = '#fca5a5';
    message.style.fontSize = '12px';

    const startWithInputSeed = () => {
      const parsed = parseSeedInput(input.value);
      if (!parsed.ok) {
        message.textContent = parsed.message;
        return;
      }
      message.textContent = '';
      this.scene.start('MatchScene', { seed: parsed.seed });
    };

    submit.addEventListener('click', startWithInputSeed);
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') startWithInputSeed();
    });

    wrapper.appendChild(input);
    wrapper.appendChild(submit);
    wrapper.appendChild(message);
    appRoot.appendChild(wrapper);

    this.seedInputOverlay = wrapper;
  }

  destroySeedInputOverlay() {
    if (!this.seedInputOverlay) return;
    this.seedInputOverlay.remove();
    this.seedInputOverlay = null;
  }

  createResultLogOverlay() {
    const toggle = this.add.text(620, 20, 'Result 로그', {
      backgroundColor: '#1f2937',
      color: '#fff',
      padding: { x: 8, y: 4 }
    });
    toggle.setInteractive({ useHandCursor: true });

    this.logPanel = this.add.graphics();
    this.logPanel.fillStyle(0x111827, 0.9);
    this.logPanel.fillRoundedRect(420, 54, 370, 320, 8);
    this.logPanel.lineStyle(1, 0x4b5563, 1);
    this.logPanel.strokeRoundedRect(420, 54, 370, 320, 8);

    this.logText = this.add.text(430, 64, '', {
      color: '#e5e7eb',
      fontSize: '12px',
      wordWrap: { width: 350 }
    });

    this.logPrev = this.add.text(430, 346, '▲ Up', {
      backgroundColor: '#374151',
      color: '#fff',
      padding: { x: 6, y: 3 },
      fontSize: '12px'
    });
    this.logPrev.setInteractive({ useHandCursor: true });
    this.logPrev.on('pointerdown', () => {
      this.logPage += 1;
      this.refreshResultLog();
    });

    this.logNext = this.add.text(490, 346, '▼ Down', {
      backgroundColor: '#374151',
      color: '#fff',
      padding: { x: 6, y: 3 },
      fontSize: '12px'
    });
    this.logNext.setInteractive({ useHandCursor: true });
    this.logNext.on('pointerdown', () => {
      this.logPage = Math.max(0, this.logPage - 1);
      this.refreshResultLog();
    });

    const setVisible = (visible) => {
      this.logPanel.setVisible(visible);
      this.logText.setVisible(visible);
      this.logPrev.setVisible(visible);
      this.logNext.setVisible(visible);
    };
    setVisible(false);

    toggle.on('pointerdown', () => {
      this.logVisible = !this.logVisible;
      setVisible(this.logVisible);
      if (this.logVisible) this.refreshResultLog();
    });
  }

  refreshResultLog() {
    const maxPage = Math.max(0, Math.ceil(this.combatLog.length / RESULT_LOG_PAGE_SIZE) - 1);
    this.logPage = Math.min(this.logPage, maxPage);

    const start = Math.max(0, this.combatLog.length - RESULT_LOG_PAGE_SIZE * (this.logPage + 1));
    const end = this.combatLog.length - RESULT_LOG_PAGE_SIZE * this.logPage;
    const lines = this.combatLog.slice(start, end).map(formatLogEntry);

    this.logText.setText(`Combat Logs p${this.logPage + 1}/${maxPage + 1}\n${lines.join('\n')}`);
  }
}
