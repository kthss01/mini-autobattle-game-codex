export class UnitView {
  constructor(scene, unit) {
    this.scene = scene;
    this.unitId = unit.id;
    const color = unit.teamId === 'A' ? 0x38bdf8 : 0xf87171;
    this.body = scene.add.circle(unit.x, unit.y, 16, color);
    this.hpBg = scene.add.rectangle(unit.x, unit.y - 24, 36, 5, 0x111827).setOrigin(0.5);
    this.hpBar = scene.add.rectangle(unit.x - 18, unit.y - 24, 36, 5, 0x22c55e).setOrigin(0, 0.5);
  }

  update(unit) {
    this.body.setPosition(unit.x, unit.y);
    this.body.setAlpha(unit.alive ? 1 : 0.25);
    this.hpBg.setPosition(unit.x, unit.y - 24);
    this.hpBar.setPosition(unit.x - 18, unit.y - 24);
    this.hpBar.width = 36 * (unit.hp / Math.max(1, unit.maxHp));
  }

  destroy() {
    this.body.destroy();
    this.hpBg.destroy();
    this.hpBar.destroy();
  }
}
