import Phaser from 'phaser';

export class ResultScene extends Phaser.Scene {
  constructor() {
    super('ResultScene');
  }

  create(data) {
    const world = data.result;
    const winner = world.winner;
    const seed = data.seed ?? 123;

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

    const btn = this.add.text(20, y + 20, `Restart (seed ${seed})`, { backgroundColor: '#1f2937', color: '#fff', padding: { x: 8, y: 4 } });
    btn.setInteractive({ useHandCursor: true });
    btn.on('pointerdown', () => this.scene.start('MatchScene', { seed }));
  }
}
