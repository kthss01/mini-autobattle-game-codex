import Phaser from 'phaser';
import { createMatch } from '@autobattle/sim';
import { FxView } from '../render/FxView.js';
import { ProjectileView } from '../render/ProjectileView.js';
import { UnitView } from '../render/UnitView.js';
import { DEFAULT_MATCH_DURATION_SEC } from '../types/MatchSetup';

const LOG_PAGE_SIZE = 12;
const LOG_POLICY = 'END_SCENE';

function formatLogEntry(entry) {
  const t = Number(entry.t || 0).toFixed(2);
  const actor = entry.actorId ?? '-';
  const target = entry.targetId ?? '-';
  const skill = entry.skillId ?? '-';
  const value = entry.value ?? '-';
  return `[${t}] ${entry.type} a=${actor} t=${target} s=${skill} v=${value}`;
}

function toMatchTeam(teamSetup) {
  const units = [...(teamSetup?.slots || [])]
    .sort((a, b) => a.slotIndex - b.slotIndex)
    .map((slot) => ({ championId: slot.championId, slotIndex: slot.slotIndex }));
  return { name: teamSetup?.id, units };
}

export class MatchScene extends Phaser.Scene {
  constructor() {
    super('MatchScene');
    this.acc = 0;
    this.fixedDtMs = 1000 / 30;
    this.speedMultiplier = 1;
    this.isPaused = false;
    this.logPage = 0;
    this.logVisible = false;
    this.lastRenderedLogLength = -1;
  }

  init(data) {
    this.seed = Number(data?.seed ?? 123);
    this.matchOptions = {
      durationSec: Number(data?.options?.durationSec ?? DEFAULT_MATCH_DURATION_SEC)
    };
    this.teamSetup = data?.teams || null;
    this.acc = 0;
    this.speedMultiplier = 1;
    this.isPaused = false;
    this.logPage = 0;
    this.logVisible = false;
    this.lastRenderedLogLength = -1;
  }

  create() {
    const teamA = toMatchTeam(this.teamSetup?.A);
    const teamB = toMatchTeam(this.teamSetup?.B);

    this.match = createMatch(teamA, teamB, { seed: this.seed, ...this.matchOptions });

    this.add.text(16, 14, `Mini Autobattle seed=${this.seed}`, { color: '#ffffff' });
    this.liveCountText = this.add.text(16, 40, '', { color: '#ffffff' });
    this.pauseStatusText = this.add.text(16, 98, '', {
      color: '#fbbf24',
      fontStyle: 'bold'
    });

    this.unitViews = new Map();
    this.fxView = new FxView(this);
    this.projectileView = new ProjectileView(this);
    for (const u of this.match.world.units) this.unitViews.set(u.id, new UnitView(this, u));

    this.createLogOverlay();
    this.refreshLiveCountText();
  }

  createLogOverlay() {
    this.pauseToggleButton = this.add.text(16, 70, 'Pause', {
      backgroundColor: '#1f2937',
      color: '#fff',
      padding: { x: 8, y: 4 }
    });
    this.pauseToggleButton.setInteractive({ useHandCursor: true });
    this.pauseToggleButton.on('pointerdown', () => {
      this.isPaused = !this.isPaused;
      this.refreshPauseUI();
    });

    this.logToggleButton = this.add.text(16, 70, '로그', {
      backgroundColor: '#1f2937',
      color: '#fff',
      padding: { x: 8, y: 4 }
    });
    this.logToggleButton.setX(this.pauseToggleButton.x + this.pauseToggleButton.width + 10);
    this.logToggleButton.setInteractive({ useHandCursor: true });
    this.logToggleButton.on('pointerdown', () => {
      this.logVisible = !this.logVisible;
      this.logPanel.setVisible(this.logVisible);
      this.logText.setVisible(this.logVisible);
      this.logPrevButton.setVisible(this.logVisible);
      this.logNextButton.setVisible(this.logVisible);
      if (this.logVisible) this.refreshLogText(true);
    });

    this.speedButtons = [1, 2, 4].map((multiplier, index) => {
      const button = this.add.text(16 + index * 48, 126, `${multiplier}x`, {
        backgroundColor: '#1f2937',
        color: '#fff',
        padding: { x: 8, y: 4 }
      });
      button.setInteractive({ useHandCursor: true });
      button.on('pointerdown', () => {
        this.speedMultiplier = multiplier;
        this.refreshSpeedUI();
      });
      return button;
    });

    this.logPanel = this.add.graphics();
    this.logPanel.fillStyle(0x111827, 0.9);
    this.logPanel.fillRoundedRect(440, 12, 350, 300, 8);
    this.logPanel.lineStyle(1, 0x4b5563, 1);
    this.logPanel.strokeRoundedRect(440, 12, 350, 300, 8);

    this.logText = this.add.text(450, 22, '', {
      color: '#e5e7eb',
      fontSize: '12px',
      wordWrap: { width: 330 }
    });

    this.logPrevButton = this.add.text(450, 286, '▲ Up', {
      backgroundColor: '#374151',
      color: '#fff',
      padding: { x: 6, y: 3 },
      fontSize: '12px'
    });
    this.logPrevButton.setInteractive({ useHandCursor: true });
    this.logPrevButton.on('pointerdown', () => {
      this.logPage += 1;
      this.refreshLogText(true);
    });

    this.logNextButton = this.add.text(510, 286, '▼ Down', {
      backgroundColor: '#374151',
      color: '#fff',
      padding: { x: 6, y: 3 },
      fontSize: '12px'
    });
    this.logNextButton.setInteractive({ useHandCursor: true });
    this.logNextButton.on('pointerdown', () => {
      this.logPage = Math.max(0, this.logPage - 1);
      this.refreshLogText(true);
    });

    this.logPanel.setVisible(false);
    this.logText.setVisible(false);
    this.logPrevButton.setVisible(false);
    this.logNextButton.setVisible(false);

    this.refreshPauseUI();
    this.refreshSpeedUI();
  }

  refreshPauseUI() {
    this.pauseToggleButton.setText(this.isPaused ? 'Resume' : 'Pause');
    this.pauseStatusText.setText(this.isPaused ? 'PAUSED' : '');
  }

  refreshSpeedUI() {
    for (const button of this.speedButtons) {
      const isActive = button.text === `${this.speedMultiplier}x`;
      button.setBackgroundColor(isActive ? '#2563eb' : '#1f2937');
      button.setColor(isActive ? '#ffffff' : '#d1d5db');
    }
  }

  refreshLogText(force = false) {
    const logs = this.match.world.log || [];
    if (!force && this.lastRenderedLogLength === logs.length) return;
    this.lastRenderedLogLength = logs.length;

    const maxPage = Math.max(0, Math.ceil(logs.length / LOG_PAGE_SIZE) - 1);
    this.logPage = Math.min(this.logPage, maxPage);
    const start = Math.max(0, logs.length - LOG_PAGE_SIZE * (this.logPage + 1));
    const end = logs.length - LOG_PAGE_SIZE * this.logPage;
    const page = logs.slice(start, end);

    const lines = page.length > 0 ? page.map(formatLogEntry) : ['(no logs)'];
    this.logText.setText(`Combat Logs p${this.logPage + 1}/${maxPage + 1}\n${lines.join('\n')}`);
  }

  refreshLiveCountText() {
    const aliveA = this.match.world.units.filter((u) => u.teamId === 'A' && u.alive).length;
    const aliveB = this.match.world.units.filter((u) => u.teamId === 'B' && u.alive).length;
    this.liveCountText.setText(`A ${aliveA} vs ${aliveB} B`);
  }

  update(_, delta) {
    if (!this.isPaused) {
      this.acc += delta * this.speedMultiplier;
      while (this.acc >= this.fixedDtMs && !this.match.world.finished) {
        const fxStart = this.match.world.fx.length;
        const projectileStart = this.match.world.projectiles.length;
        const result = this.match.step(1 / 30);
        this.acc -= this.fixedDtMs;

        for (let i = fxStart; i < this.match.world.fx.length; i += 1) this.fxView.addAOE(this.match.world.fx[i]);
        for (let i = projectileStart; i < this.match.world.projectiles.length; i += 1) this.projectileView.spawn(this.match.world.projectiles[i]);
        this.refreshLiveCountText();
        if (this.logVisible) this.refreshLogText();

        if (result.done) {
          this.speedMultiplier = 1;
          this.refreshSpeedUI();
          this.refreshLiveCountText();
          const stats = {
            units: this.match.world.units,
            scoreA: this.match.world.units
              .filter((u) => u.teamId === 'A')
              .reduce((sum, u) => sum + u.stats.kills * 3 + Math.round(u.hp / 100), 0),
            scoreB: this.match.world.units
              .filter((u) => u.teamId === 'B')
              .reduce((sum, u) => sum + u.stats.kills * 3 + Math.round(u.hp / 100), 0)
          };

          const endPayload = {
            winner: this.match.world.winner,
            seed: this.match.options.seed,
            stats,
            logPolicy: LOG_POLICY,
            combatLog: [...this.match.world.log],
            nextMatchSetup: {
              seed: this.match.options.seed,
              options: { ...this.matchOptions },
              teams: this.teamSetup
            }
          };

          this.scene.start('EndScene', endPayload);
        }
      }
    }

    for (const u of this.match.world.units) {
      if (!this.unitViews.has(u.id)) this.unitViews.set(u.id, new UnitView(this, u));
      this.unitViews.get(u.id).update(u);
    }
  }
}
