export class FxView {
  constructor(scene) {
    this.scene = scene;
    this.items = [];
  }

  addAOE(fx) {
    const circle = this.scene.add.circle(fx.x, fx.y, fx.radius, 0xf59e0b, 0.2).setStrokeStyle(2, 0xf59e0b, 0.7);
    this.scene.tweens.add({
      targets: circle,
      alpha: 0,
      duration: 260,
      onComplete: () => circle.destroy()
    });
    this.items.push(circle);
  }
}
