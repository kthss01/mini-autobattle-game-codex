import { CHAMPIONS_BY_ID, UNIT_ROLES } from '@autobattle/sim';
import { resolveAnimationTransitionName } from './animationRegistry.js';

const VISUAL_STATES = Object.freeze({
  IDLE: 'idle',
  MOVE: 'move',
  ATTACK: 'attack',
  CAST: 'cast',
  DEATH: 'death'
});

const SPRITE_SIZE = 48;
const ROLE_LABEL_OFFSET_Y = SPRITE_SIZE * 0.62;
const HP_BAR_OFFSET_Y = -(SPRITE_SIZE * 0.62);
const HP_BAR_WIDTH = 36;
const HP_BAR_HEIGHT = 5;
const DEAD_ALPHA = 0.6;
const VISUAL_STATE_FALLBACK_CHAIN = Object.freeze({
  idle: [],
  move: ['idle'],
  attack: ['idle'],
  cast: ['attack', 'idle'],
  death: ['idle']
});
const TRANSIENT_STATES = new Set([VISUAL_STATES.ATTACK, VISUAL_STATES.CAST]);
// TODO(보류): 스프레드시트 기반 2D 모델/스프라이트 적용 이슈 해결 전까지 도형 렌더링을 유지합니다.
const ENABLE_CHAMPION_SPRITES = false;

function resolveChampionRenderMeta(championId) {
  if (!championId) return null;
  return CHAMPIONS_BY_ID[championId] ?? null;
}

function resolveChampionLabel(championId) {
  return resolveChampionRenderMeta(championId)?.name ?? 'Unknown';
}

function resolveTextureKey(unit) {
  const championMeta = resolveChampionRenderMeta(unit?.championId);
  return championMeta?.spriteKey ?? null;
}

export function resolveUnitAnimationKey(championId, animationName) {
  const championMeta = resolveChampionRenderMeta(championId);
  if (!championMeta) return null;

  const actions = [animationName, ...(VISUAL_STATE_FALLBACK_CHAIN[animationName] || [])];
  for (const action of actions) {
    const key = championMeta.animations?.[action];
    if (key) return key;
  }

  return null;
}

function createFallbackBody(scene, unit, color) {
  const normalizedRole = typeof unit.role === 'string' ? unit.role.toLowerCase() : '';

  if (normalizedRole === UNIT_ROLES.TANK) {
    return scene.add.circle(unit.x, unit.y, 17, color);
  }

  if (normalizedRole === UNIT_ROLES.DPS) {
    return scene.add.triangle(unit.x, unit.y, 0, 32, 16, 0, 32, 32, color).setOrigin(0.5, 0.5);
  }

  if (normalizedRole === UNIT_ROLES.SUPPORT) {
    return scene.add.rectangle(unit.x, unit.y, 30, 30, color).setOrigin(0.5);
  }

  if (normalizedRole === UNIT_ROLES.HEALER) {
    return scene.add.polygon(unit.x, unit.y, [0, 16, 16, 0, 32, 16, 16, 32], color).setOrigin(0.5);
  }

  return scene.add.circle(unit.x, unit.y, 16, color);
}

export class UnitView {
  constructor(scene, unit) {
    this.scene = scene;
    this.unitId = unit.id;
    this.roleLabelText = resolveChampionLabel(unit.championId);

    const teamColor = unit.teamId === 'A' ? 0x38bdf8 : 0xf87171;
    const textureKey = resolveTextureKey(unit);

    this.visualState = null;
    this.lastX = unit.x;
    this.lastY = unit.y;
    this.facingDirectionX = unit.teamId === 'B' ? -1 : 1;
    this.lastLoggedState = null;

    if (ENABLE_CHAMPION_SPRITES && textureKey && scene.textures.exists(textureKey)) {
      this.body = scene.add.sprite(unit.x, unit.y, textureKey, 0).setDisplaySize(SPRITE_SIZE, SPRITE_SIZE);
      this.body.setTint(teamColor);
      this.bindAnimationTransition(unit.championId);
      this.applyVisualState(unit, VISUAL_STATES.IDLE);
    } else {
      this.body = createFallbackBody(scene, unit, teamColor);
    }

    this.roleLabel = scene
      .add.text(unit.x, unit.y + ROLE_LABEL_OFFSET_Y, this.roleLabelText, {
        fontSize: '11px',
        color: '#e5e7eb',
        fontStyle: 'bold'
      })
      .setOrigin(0.5, 0);

    this.hpBg = scene.add.rectangle(unit.x, unit.y + HP_BAR_OFFSET_Y, HP_BAR_WIDTH, HP_BAR_HEIGHT, 0x111827).setOrigin(0.5);
    this.hpBar = scene
      .add.rectangle(unit.x - HP_BAR_WIDTH / 2, unit.y + HP_BAR_OFFSET_Y, HP_BAR_WIDTH, HP_BAR_HEIGHT, 0x22c55e)
      .setOrigin(0, 0.5);
  }

  update(unit) {
    this.body.setPosition(unit.x, unit.y);

    if (this.body.type === 'Sprite') {
      this.syncFacing(unit);
      this.syncVisualState(unit);
    }

    const currentAlpha = unit.alive ? 1 : DEAD_ALPHA;
    this.body.setAlpha(currentAlpha);

    this.roleLabel.setPosition(unit.x, unit.y + ROLE_LABEL_OFFSET_Y);
    this.roleLabel.setAlpha(unit.alive ? 0.95 : 0.4);

    this.hpBg.setPosition(unit.x, unit.y + HP_BAR_OFFSET_Y);
    this.hpBar.setPosition(unit.x - HP_BAR_WIDTH / 2, unit.y + HP_BAR_OFFSET_Y);
    this.hpBar.width = HP_BAR_WIDTH * (unit.hp / Math.max(1, unit.maxHp));

    this.lastX = unit.x;
    this.lastY = unit.y;
  }

  bindAnimationTransition(championId) {
    this.body.on('animationcomplete', (animation) => {
      if (this.visualState === VISUAL_STATES.DEATH) {
        this.body.stop();
        this.body.setFrame(animation?.getLastFrame());
        return;
      }

      const transitionName = resolveAnimationTransitionName(animation?.key);
      if (!transitionName) return;

      const transitionKey = resolveUnitAnimationKey(championId, transitionName);
      if (!transitionKey) return;
      this.body.play(transitionKey, true);
    });
  }

  syncVisualState(unit) {
    const nextVisualState = this.resolveVisualState(unit);
    if (this.shouldDelayStateTransition(nextVisualState)) return;
    this.applyVisualState(unit, nextVisualState);
  }

  shouldDelayStateTransition(nextVisualState) {
    if (!this.body?.anims?.isPlaying) return false;
    if (!TRANSIENT_STATES.has(this.visualState)) return false;
    if (nextVisualState === VISUAL_STATES.DEATH) return false;
    return nextVisualState !== this.visualState;
  }

  resolveVisualState(unit) {
    if (!unit.alive) {
      return VISUAL_STATES.DEATH;
    }

    const intentType = unit.intent?.type;
    if (intentType === 'CAST') {
      return VISUAL_STATES.CAST;
    }

    if (intentType === 'ATTACK' && unit.attackTimer > 0) {
      return VISUAL_STATES.ATTACK;
    }

    if (intentType === 'MOVE') {
      return VISUAL_STATES.MOVE;
    }

    return VISUAL_STATES.IDLE;
  }

  applyVisualState(unit, nextVisualState) {
    if (nextVisualState === this.visualState) return;
    this.logStateTransition(unit, this.visualState, nextVisualState);
    this.visualState = nextVisualState;
    this.playAnimation(unit, nextVisualState);
  }

  logStateTransition(unit, fromState, toState) {
    if (unit.championId !== 'tank_guard' || fromState === toState) return;
    const from = fromState ?? '-';
    const line = `[AnimDebug] ${unit.id} ${from} -> ${toState}`;
    this.scene?.recordAnimationDebugLine?.(line);
    this.lastLoggedState = toState;
  }

  syncFacing(unit) {
    const moveDx = unit.x - this.lastX;
    const activeDirection = Math.abs(moveDx) > 0.1 ? moveDx : this.resolveIntentDirection(unit);
    if (Math.abs(activeDirection) > 0.1) this.facingDirectionX = activeDirection;
    this.body.setFlipX(this.facingDirectionX < 0);
  }

  resolveIntentDirection(unit) {
    const intent = unit.intent;
    if (!intent) return 0;

    if (intent.type === 'MOVE' && typeof intent.x === 'number') {
      return intent.x - unit.x;
    }

    if ((intent.type === 'ATTACK' || intent.type === 'CAST') && intent.targetId) {
      const target = this.scene?.match?.world?.units?.find((candidate) => candidate.id === intent.targetId);
      if (target) return target.x - unit.x;
    }

    if (intent.type === 'CAST' && intent.point?.x != null) {
      return intent.point.x - unit.x;
    }

    return 0;
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
