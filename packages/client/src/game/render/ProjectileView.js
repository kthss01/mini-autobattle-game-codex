export class ProjectileView {
  constructor(scene) {
    this.scene = scene;
  }

  spawn(p) {
    const dot = this.scene.add.circle(p.from.x, p.from.y, 4, 0xfbbf24);
    this.scene.tweens.add({
      targets: dot,
      x: p.to.x,
      y: p.to.y,
      duration: 140,
      onComplete: () => dot.destroy()
    });
  }
}
