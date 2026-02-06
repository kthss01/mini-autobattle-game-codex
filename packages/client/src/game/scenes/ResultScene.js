import Phaser from 'phaser';

const RESULT_LOG_PAGE_SIZE = 10;

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
    const seed = data.seed ?? 123;
    this.combatLog = data.logPolicy === 'RESULT_SCENE' ? (data.combatLog || []) : [];

    const scoreA = world.units.filter((u) => u.teamId === 'A').reduce((s, u) => s + u.stats.kills * 3 + Math.round(u.hp / 100), 0);
    const scoreB = world.units.filter((u) => u.teamId === 'B').reduce((s, u) => s + u.stats.kills * 3 + Math.round(u.hp / 100), 0);

    this.add.text(20, 20, `Result: ${winner}`, { color: '#fff', fontSize: '28px' });
    this.add.text(20, 60, `Score A ${scoreA} : ${scoreB} B`, { color: '#d1d5db' });

    let y = 110;
    for (const u of world.units) {
      const line = `${u.teamId} ${u.name} | Dmg ${u.stats.damageDone} Heal ${u.stats.healDone} K/D ${u.stats.kills}/${u.stats.deaths}`;
      this.add.text(20, y, line, { color: u.teamId === 'A' ? '#7dd3fc' : '#fca5a5', fontSize: '14px' });
      y += 20;
    }

    if (this.combatLog.length > 0) this.createResultLogOverlay();

    const btn = this.add.text(20, y + 20, `Restart (seed ${seed})`, { backgroundColor: '#1f2937', color: '#fff', padding: { x: 8, y: 4 } });
    btn.setInteractive({ useHandCursor: true });
    btn.on('pointerdown', () => this.scene.start('MatchScene', { seed }));
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
