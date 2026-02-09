const AOE_TEXTURES = {
  fire: 'fx_aoe_fire',
  frost: 'fx_aoe_frost',
  arcane: 'fx_aoe_arcane'
};

const SKILL_AOE_VISUAL = {
  fire_orb: 'fire',
  ice_nova: 'frost',
  healing_wave: 'frost',
  summon_imps: 'arcane',
  smoke_screen: 'arcane',
  taunt_shout: 'arcane'
};

function resolveAOEVisual(fx) {
  const key = SKILL_AOE_VISUAL[fx.skillId] ?? (fx.kind === 'AOE' ? 'arcane' : null);
  if (key === 'fire') return { textureKey: AOE_TEXTURES.fire, color: 0xfb923c, particleColor: 0xfdba74 };
  if (key === 'frost') return { textureKey: AOE_TEXTURES.frost, color: 0x60a5fa, particleColor: 0xbfdbfe };
  return { textureKey: AOE_TEXTURES.arcane, color: 0xc084fc, particleColor: 0xe9d5ff };
}

export class FxView {
  constructor(scene) {
    this.scene = scene;
    this.items = [];
    this.ensureTextures();
  }

  ensureTextures() {
    if (!this.scene.textures.exists(AOE_TEXTURES.fire)) {
      const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(32, 32, 30);
      g.lineStyle(4, 0xffffff, 0.8);
      g.strokeCircle(32, 32, 22);
      g.generateTexture(AOE_TEXTURES.fire, 64, 64);
      g.destroy();
    }

    if (!this.scene.textures.exists(AOE_TEXTURES.frost)) {
      const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(32, 32, 28);
      g.lineStyle(3, 0xffffff, 0.9);
      g.strokeCircle(32, 32, 30);
      g.generateTexture(AOE_TEXTURES.frost, 64, 64);
      g.destroy();
    }

    if (!this.scene.textures.exists(AOE_TEXTURES.arcane)) {
      const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(32, 32, 24);
      g.lineStyle(5, 0xffffff, 0.9);
      g.strokeCircle(32, 32, 30);
      g.generateTexture(AOE_TEXTURES.arcane, 64, 64);
      g.destroy();
    }
  }

  addAOE(fx) {
    const visual = resolveAOEVisual(fx);

    if (!this.scene.textures.exists(visual.textureKey)) {
      const circle = this.scene.add.circle(fx.x, fx.y, fx.radius, 0xf59e0b, 0.2).setStrokeStyle(2, 0xf59e0b, 0.7);
      this.scene.tweens.add({
        targets: circle,
        alpha: 0,
        duration: 260,
        onComplete: () => circle.destroy()
      });
      this.items.push(circle);
      return;
    }

    const burst = this.scene.add
      .sprite(fx.x, fx.y, visual.textureKey)
      .setTint(visual.color)
      .setDisplaySize(fx.radius * 2.4, fx.radius * 2.4)
      .setAlpha(0);

    this.scene.tweens.add({
      targets: burst,
      alpha: 0.75,
      scale: 1.1,
      duration: 90,
      yoyo: true,
      hold: 80,
      onComplete: () => burst.destroy()
    });

    for (let i = 0; i < 10; i += 1) {
      const theta = (Math.PI * 2 * i) / 10;
      const distance = fx.radius * (0.3 + Math.random() * 0.55);
      const particle = this.scene.add.circle(fx.x, fx.y, 3, visual.particleColor, 0.85);
      this.scene.tweens.add({
        targets: particle,
        x: fx.x + Math.cos(theta) * distance,
        y: fx.y + Math.sin(theta) * distance,
        alpha: 0,
        scale: 0.4,
        duration: 220,
        onComplete: () => particle.destroy()
      });
      this.items.push(particle);
    }

    this.items.push(burst);
  }
}
