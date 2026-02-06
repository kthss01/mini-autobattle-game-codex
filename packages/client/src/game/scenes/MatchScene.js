import Phaser from 'phaser';
import { CHAMPIONS, createMatch, createTeamFromChampionIds } from '@autobattle/sim';
import { FxView } from '../render/FxView.js';
import { ProjectileView } from '../render/ProjectileView.js';
import { UnitView } from '../render/UnitView.js';

export class MatchScene extends Phaser.Scene {
  constructor() {
    super('MatchScene');
    this.acc = 0;
    this.fixedDtMs = 1000 / 30;
  }

  init(data) {
    this.seed = Number(data?.seed ?? 123);
  }

  create() {
    const teamA = createTeamFromChampionIds('A', CHAMPIONS.slice(0, 4).map((c) => c.id));
    const teamB = createTeamFromChampionIds('B', CHAMPIONS.slice(4, 8).map((c) => c.id));

    this.match = createMatch(teamA, teamB, { seed: this.seed, durationSec: 45 });

    this.add.text(16, 14, `Mini Autobattle seed=${this.seed}`, { color: '#ffffff' });
    this.liveCountText = this.add.text(16, 40, '', { color: '#ffffff' });

    this.unitViews = new Map();
    this.fxView = new FxView(this);
    this.projectileView = new ProjectileView(this);
    for (const u of this.match.world.units) this.unitViews.set(u.id, new UnitView(this, u));
    this.refreshLiveCountText();
  }

  refreshLiveCountText() {
    const aliveA = this.match.world.units.filter((u) => u.teamId === 'A' && u.alive).length;
    const aliveB = this.match.world.units.filter((u) => u.teamId === 'B' && u.alive).length;
    this.liveCountText.setText(`A ${aliveA} vs ${aliveB} B`);
  }

  update(_, delta) {
    this.acc += delta;
    while (this.acc >= this.fixedDtMs && !this.match.world.finished) {
      const fxStart = this.match.world.fx.length;
      const projectileStart = this.match.world.projectiles.length;
      const result = this.match.step(1 / 30);
      this.acc -= this.fixedDtMs;

      for (let i = fxStart; i < this.match.world.fx.length; i += 1) this.fxView.addAOE(this.match.world.fx[i]);
      for (let i = projectileStart; i < this.match.world.projectiles.length; i += 1) this.projectileView.spawn(this.match.world.projectiles[i]);
      this.refreshLiveCountText();

      if (result.done) {
        this.refreshLiveCountText();
        this.scene.start('ResultScene', { result: this.match.world, seed: this.match.options.seed });
      }
    }

    for (const u of this.match.world.units) {
      if (!this.unitViews.has(u.id)) this.unitViews.set(u.id, new UnitView(this, u));
      this.unitViews.get(u.id).update(u);
    }
  }
}
