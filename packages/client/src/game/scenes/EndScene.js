import Phaser from 'phaser';
import { createRandomSeed } from '../utils/seed';

const END_LOG_PAGE_SIZE = 10;

function formatLogEntry(entry) {
  const t = Number(entry.t || 0).toFixed(2);
  return `[${t}] ${entry.type} a=${entry.actorId ?? '-'} t=${entry.targetId ?? '-'} s=${entry.skillId ?? '-'} v=${entry.value ?? '-'}`;
}

function computeTeamScore(units, teamId) {
  return units
    .filter((u) => u.teamId === teamId)
    .reduce((sum, u) => sum + u.stats.kills * 3 + Math.round(u.hp / 100), 0);
}

export class EndScene extends Phaser.Scene {
  constructor() {
    super('EndScene');
    this.logPage = 0;
    this.logVisible = false;
  }

  init(data) {
    this.winner = data?.winner ?? 'draw';
    this.appliedSeed = Number.isSafeInteger(Number(data?.seed)) ? Number(data.seed) : 123;
    this.stats = data?.stats ?? { units: [], scoreA: 0, scoreB: 0 };
    this.combatLog = Array.isArray(data?.combatLog) ? data.combatLog : [];
    this.nextMatchSetup = data?.nextMatchSetup ?? null;
    this.logPage = 0;
    this.logVisible = false;

    if ((!this.stats.scoreA && !this.stats.scoreB) && this.stats.units.length > 0) {
      this.stats.scoreA = computeTeamScore(this.stats.units, 'A');
      this.stats.scoreB = computeTeamScore(this.stats.units, 'B');
    }
  }

  create() {
    this.add.text(20, 20, 'Match Ended', { color: '#fff', fontSize: '30px' });
    this.add.text(20, 60, `Winner: ${this.winner}`, { color: '#93c5fd', fontSize: '20px' });
    this.add.text(20, 88, `Applied seed: ${this.appliedSeed}`, { color: '#fde68a', fontSize: '16px' });
    this.add.text(20, 114, `Score A ${this.stats.scoreA} : ${this.stats.scoreB} B`, { color: '#d1d5db' });

    let y = 150;
    for (const u of this.stats.units) {
      const line = `${u.teamId} ${u.name} | Dmg ${u.stats.damageDone} Heal ${u.stats.healDone} K/D ${u.stats.kills}/${u.stats.deaths}`;
      this.add.text(20, y, line, { color: u.teamId === 'A' ? '#7dd3fc' : '#fca5a5', fontSize: '14px' });
      y += 20;
    }

    this.createActions(y + 24);
    if (this.combatLog.length > 0) this.createLogOverlay();
  }

  createActions(y) {
    const backToTitle = this.add.text(20, y, 'Back to Title', {
      backgroundColor: '#1f2937',
      color: '#fff',
      padding: { x: 8, y: 4 }
    });
    backToTitle.setInteractive({ useHandCursor: true });
    backToTitle.on('pointerdown', () => this.scene.start('BootScene'));

    const replaySameSeed = this.add.text(20, y + 36, `Restart same seed (${this.appliedSeed})`, {
      backgroundColor: '#1f2937',
      color: '#fff',
      padding: { x: 8, y: 4 }
    });
    replaySameSeed.setInteractive({ useHandCursor: true });
    replaySameSeed.on('pointerdown', () => {
      if (this.nextMatchSetup) {
        this.scene.start('MatchScene', this.nextMatchSetup);
        return;
      }
      this.scene.start('MatchScene', { seed: this.appliedSeed });
    });

    const replayRandomSeed = this.add.text(20, y + 72, 'Restart new seed', {
      backgroundColor: '#1f2937',
      color: '#fff',
      padding: { x: 8, y: 4 }
    });
    replayRandomSeed.setInteractive({ useHandCursor: true });
    replayRandomSeed.on('pointerdown', () => {
      const randomSeed = createRandomSeed();
      if (this.nextMatchSetup) {
        this.scene.start('MatchScene', {
          ...this.nextMatchSetup,
          seed: randomSeed
        });
        return;
      }
      this.scene.start('MatchScene', { seed: randomSeed });
    });
  }

  createLogOverlay() {
    const toggle = this.add.text(620, 20, 'Combat Log', {
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
      this.refreshLog();
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
      this.refreshLog();
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
      if (this.logVisible) this.refreshLog();
    });
  }

  refreshLog() {
    const maxPage = Math.max(0, Math.ceil(this.combatLog.length / END_LOG_PAGE_SIZE) - 1);
    this.logPage = Math.min(this.logPage, maxPage);

    const start = Math.max(0, this.combatLog.length - END_LOG_PAGE_SIZE * (this.logPage + 1));
    const end = this.combatLog.length - END_LOG_PAGE_SIZE * this.logPage;
    const lines = this.combatLog.slice(start, end).map(formatLogEntry);

    this.logText.setText(`Combat Logs p${this.logPage + 1}/${maxPage + 1}\n${lines.join('\n')}`);
  }
}
