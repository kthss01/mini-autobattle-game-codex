import { CHAMPIONS } from '@autobattle/sim';

const ACTIONS = ['idle', 'move', 'attack', 'cast', 'death'];
const ACTION_LAYOUT = {
  idle: { start: 0, end: 5, frameRate: 8, repeat: -1 },
  move: { start: 6, end: 11, frameRate: 10, repeat: -1 },
  attack: { start: 12, end: 19, frameRate: 14, repeat: 0 },
  cast: { start: 20, end: 27, frameRate: 12, repeat: 0 },
  death: { start: 24, end: 29, frameRate: 10, repeat: 0 }
};

const COMPLETION_TRANSITION = {
  attack: 'idle',
  cast: 'idle',
  death: null
};

function resolveFrameRange(action) {
  const { start, end } = ACTION_LAYOUT[action];
  return { start, end };
}

export function registerChampionAnimations(scene) {
  CHAMPIONS.forEach((champion) => {
    if (!scene.textures.exists(champion.spriteKey)) return;

    ACTIONS.forEach((action) => {
      const animationKey = champion.animations?.[action];
      if (!animationKey || scene.anims.exists(animationKey) || !ACTION_LAYOUT[action]) return;

      const { start, end } = resolveFrameRange(action);
      const { frameRate, repeat } = ACTION_LAYOUT[action];

      scene.anims.create({
        key: animationKey,
        frames: scene.anims.generateFrameNumbers(champion.spriteKey, { start, end }),
        frameRate,
        repeat
      });
    });
  });
}

export function resolveAnimationTransitionName(animationKey) {
  if (!animationKey) return null;
  const action = ACTIONS.find((name) => animationKey.endsWith(`-${name}`));
  if (!action) return null;
  return COMPLETION_TRANSITION[action] ?? null;
}
