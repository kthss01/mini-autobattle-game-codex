import { CHAMPIONS } from '@autobattle/sim';

const ACTIONS = ['idle', 'move', 'attack', 'cast', 'death'];
const FRAMES_PER_ROW = 6;

const ACTION_LAYOUT = {
  idle: { row: 0, frameRate: 8, repeat: -1 },
  move: { row: 1, frameRate: 10, repeat: -1 },
  attack: { row: 2, frameRate: 14, repeat: 0 },
  cast: { row: 3, frameRate: 12, repeat: 0 },
  death: { row: 4, frameRate: 10, repeat: 0 }
};

const COMPLETION_TRANSITION = {
  attack: 'idle',
  cast: 'idle',
  death: null
};

function resolveFrameRange(action) {
  const row = ACTION_LAYOUT[action].row;
  const start = row * FRAMES_PER_ROW;
  const end = start + FRAMES_PER_ROW - 1;
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
