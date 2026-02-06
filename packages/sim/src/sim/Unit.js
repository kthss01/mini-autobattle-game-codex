import { CHAMPIONS_BY_ID } from '../data/champions.js';

let nextUnitId = 1;

export function resetUnitIdCounter() {
  nextUnitId = 1;
}

export function createUnit(teamId, championId, x, y, teamBuff = {}) {
  const champion = CHAMPIONS_BY_ID[championId];
  if (!champion) throw new Error(`Unknown champion id: ${championId}`);

  const maxHp = Math.round(champion.base.maxHp * (1 + (teamBuff.maxHpMul || 0)));
  return {
    id: `${teamId}_${championId}_${nextUnitId++}`,
    teamId,
    championId,
    name: champion.name,
    role: champion.role,
    tags: [...champion.tags],
    skillIds: [...champion.skills],
    x,
    y,
    alive: true,
    hp: maxHp,
    maxHp,
    atk: champion.base.atk,
    def: champion.base.def,
    moveSpeed: champion.base.moveSpeed,
    attackRange: champion.base.attackRange,
    attackCd: champion.base.attackCd,
    attackTimer: 0,
    skillCooldowns: Object.create(null),
    effects: [],
    intent: { type: 'NONE' },
    aiTimer: 0,
    damageMulBonus: teamBuff.damageMul || 0,
    healMulBonus: teamBuff.healMul || 0,
    stats: { damageDone: 0, healDone: 0, kills: 0, deaths: 0 }
  };
}
