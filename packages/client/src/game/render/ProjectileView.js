const PROJECTILE_TEXTURES = {
  arrow: 'fx_projectile_arrow',
  orb: 'fx_projectile_orb',
  bolt: 'fx_projectile_bolt'
};

const SKILL_PROJECTILE_VISUAL = {
  power_shot: 'arrow',
  rapid_fire: 'arrow',
  fire_orb: 'orb',
  ice_nova: 'orb',
  quick_heal: 'orb',
  taunt_shout: 'bolt',
  dash_strike: 'bolt',
  drain_slash: 'bolt'
};

function resolveProjectileVisual(skillId) {
  const key = SKILL_PROJECTILE_VISUAL[skillId] ?? 'bolt';
  if (key === 'arrow') return { textureKey: PROJECTILE_TEXTURES.arrow, fallbackColor: 0xfbbf24, trailColor: 0xfde68a, size: 14 };
  if (key === 'orb') return { textureKey: PROJECTILE_TEXTURES.orb, fallbackColor: 0x60a5fa, trailColor: 0xbfdbfe, size: 16 };
  return { textureKey: PROJECTILE_TEXTURES.bolt, fallbackColor: 0xf472b6, trailColor: 0xf9a8d4, size: 12 };
}

export class ProjectileView {
  constructor(scene) {
    this.scene = scene;
    this.ensureTextures();
  }

  ensureTextures() {
    if (!this.scene.textures.exists(PROJECTILE_TEXTURES.arrow)) {
      const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillTriangle(2, 8, 18, 10, 2, 12);
      g.generateTexture(PROJECTILE_TEXTURES.arrow, 20, 20);
      g.destroy();
    }

    if (!this.scene.textures.exists(PROJECTILE_TEXTURES.orb)) {
      const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(10, 10, 8);
      g.generateTexture(PROJECTILE_TEXTURES.orb, 20, 20);
      g.destroy();
    }

    if (!this.scene.textures.exists(PROJECTILE_TEXTURES.bolt)) {
      const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillRect(2, 8, 16, 4);
      g.generateTexture(PROJECTILE_TEXTURES.bolt, 20, 20);
      g.destroy();
    }
  }

  spawn(p) {
    const visual = resolveProjectileVisual(p.skillId);
    const dx = p.to.x - p.from.x;
    const dy = p.to.y - p.from.y;
    const rotation = Math.atan2(dy, dx);

    const body = this.scene.textures.exists(visual.textureKey)
      ? this.scene.add
          .sprite(p.from.x, p.from.y, visual.textureKey)
          .setTint(visual.fallbackColor)
          .setDisplaySize(visual.size, visual.size)
          .setRotation(rotation)
      : this.scene.add.circle(p.from.x, p.from.y, 4, visual.fallbackColor);

    this.scene.tweens.add({
      targets: body,
      x: p.to.x,
      y: p.to.y,
      duration: 140,
      onUpdate: () => {
        const trail = this.scene.add.circle(body.x, body.y, 2, visual.trailColor, 0.8);
        this.scene.tweens.add({
          targets: trail,
          alpha: 0,
          scale: 0.3,
          duration: 120,
          onComplete: () => trail.destroy()
        });
      },
      onComplete: () => body.destroy()
    });
  }
}
