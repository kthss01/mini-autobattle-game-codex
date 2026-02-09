import { CHAMPIONS_BY_ID, UNIT_ROLES } from '@autobattle/sim';
import { resolveAnimationTransitionName } from './animationRegistry.js';

const ROLE_LABEL_MAP = {
  [UNIT_ROLES.TANK]: 'Tank',
  [UNIT_ROLES.HEALER]: 'Healer',
  [UNIT_ROLES.DPS]: 'DPS',
  [UNIT_ROLES.SUPPORT]: 'Support'
};

function resolveRoleLabel(role) {
  const normalizedRole = typeof role === 'string' ? role.toLowerCase() : '';
  return ROLE_LABEL_MAP[normalizedRole] ?? 'Unknown';
}

function resolveChampionRenderMeta(championId) {
  if (!championId) return null;
  return CHAMPIONS_BY_ID[championId] ?? null;
}

function resolveTextureKey(unit) {
  const championMeta = resolveChampionRenderMeta(unit?.championId);
  return championMeta?.spriteKey ?? null;
}

export function resolveUnitAnimationKey(championId, animationName) {
  const championMeta = resolveChampionRenderMeta(championId);
  if (!championMeta) return null;
  return championMeta.animations?.[animationName] ?? null;
}

function createFallbackBody(scene, unit, color) {
  return scene.add.circle(unit.x, unit.y, 16, color);
}

export class UnitView {
  constructor(scene, unit) {
    this.scene = scene;
    this.unitId = unit.id;
    this.roleLabelText = resolveRoleLabel(unit.role);

    const teamColor = unit.teamId === 'A' ? 0x38bdf8 : 0xf87171;
    const textureKey = resolveTextureKey(unit);

    if (textureKey && scene.textures.exists(textureKey)) {
      this.body = scene.add.sprite(unit.x, unit.y, textureKey, 0).setDisplaySize(48, 48);
      this.body.setTint(teamColor);
      this.bindAnimationTransition(unit.championId);
      this.playAnimation(unit, 'idle');
    } else {
      this.body = createFallbackBody(scene, unit, teamColor);
    }

    this.roleLabel = scene
      .add.text(unit.x, unit.y + 30, this.roleLabelText, {
        fontSize: '11px',
        color: '#e5e7eb',
        fontStyle: 'bold'
      })
      .setOrigin(0.5, 0);

    this.hpBg = scene.add.rectangle(unit.x, unit.y - 30, 36, 5, 0x111827).setOrigin(0.5);
    this.hpBar = scene.add.rectangle(unit.x - 18, unit.y - 30, 36, 5, 0x22c55e).setOrigin(0, 0.5);
  }

  update(unit) {
    this.body.setPosition(unit.x, unit.y);

    if (this.body.type === 'Sprite') {
      this.body.setFlipX(unit.teamId === 'B');
      this.syncAnimationState(unit);
    }

    const currentAlpha = unit.alive ? 1 : 0.25;
    this.body.setAlpha(currentAlpha);

    this.roleLabel.setPosition(unit.x, unit.y + 30);
    this.roleLabel.setAlpha(unit.alive ? 0.95 : 0.4);

    this.hpBg.setPosition(unit.x, unit.y - 30);
    this.hpBar.setPosition(unit.x - 18, unit.y - 30);
    this.hpBar.width = 36 * (unit.hp / Math.max(1, unit.maxHp));
  }

  bindAnimationTransition(championId) {
    this.body.on('animationcomplete', (animation) => {
      const transitionName = resolveAnimationTransitionName(animation?.key);
      if (!transitionName) return;

      const transitionKey = resolveUnitAnimationKey(championId, transitionName);
      if (!transitionKey) return;
      this.body.play(transitionKey, true);
    });
  }

  syncAnimationState(unit) {
    if (!unit.alive) {
      this.playAnimation(unit, 'death');
      return;
    }

    const intentType = unit.intent?.type;
    if (intentType === 'CAST') {
      this.playAnimation(unit, 'cast');
      return;
    }

    if (intentType === 'ATTACK' && unit.attackTimer > 0) {
      this.playAnimation(unit, 'attack');
      return;
    }

    if (intentType === 'MOVE') {
      this.playAnimation(unit, 'move');
      return;
    }

    this.playAnimation(unit, 'idle');
  }

  playAnimation(unit, action) {
    const animationKey = resolveUnitAnimationKey(unit.championId, action);
    if (!animationKey || this.body.anims?.currentAnim?.key === animationKey) return;
    this.body.play(animationKey, true);
  }

  destroy() {
    this.body.destroy();
    this.roleLabel.destroy();
    this.hpBg.destroy();
    this.hpBar.destroy();
  }
}
