import { CHAMPIONS_BY_ID } from '../data/champions.js';
import { TEAM_SYNERGIES } from '../data/synergies.js';
import { createUnit, resetUnitIdCounter } from './Unit.js';

function countTags(champions) {
  /** @type {Record<string, number>} */
  const result = Object.create(null);
  for (const c of champions) {
    for (const tag of c.tags || []) result[tag] = (result[tag] || 0) + 1;
  }
  return result;
}

function resolveTeamBuff(champions) {
  const tagCounts = countTags(champions);
  const active = [];
  const buff = { maxHpMul: 0, damageMul: 0, healMul: 0 };
  for (const s of TEAM_SYNERGIES) {
    if (!s.requires.every((r) => (tagCounts[r.tag] || 0) >= r.count)) continue;
    active.push(s.id);
    if (s.bonus.kind === 'MAX_HP_MUL') buff.maxHpMul += s.bonus.value;
    if (s.bonus.kind === 'DAMAGE_MUL') buff.damageMul += s.bonus.value;
  }
  return { buff, active };
}

export function createWorld(teamA, teamB, rng, opt = {}) {
  resetUnitIdCounter();
  const width = 800;
  const height = 450;
  const dt = 1 / 30;
  const xInset = Math.round((160 / 960) * width);
  const yStart = Math.round((160 / 540) * height);
  const ySpacing = Math.round((100 / 540) * height);

  const aChampions = teamA.units.map((u) => CHAMPIONS_BY_ID[u.championId]);
  const bChampions = teamB.units.map((u) => CHAMPIONS_BY_ID[u.championId]);
  if (aChampions.some((c) => !c) || bChampions.some((c) => !c)) throw new Error('Unknown champion id in team input');
  const aBuff = resolveTeamBuff(aChampions);
  const bBuff = resolveTeamBuff(bChampions);

  const units = [];
  teamA.units.forEach((u, i) => units.push(createUnit('A', u.championId, xInset, yStart + i * ySpacing, aBuff.buff)));
  teamB.units.forEach((u, i) => units.push(createUnit('B', u.championId, width - xInset, yStart + i * ySpacing, bBuff.buff)));

  return {
    width,
    height,
    t: 0,
    dt,
    rng,
    units,
    fx: [],
    projectiles: [],
    log: [],
    finished: false,
    winner: 'DRAW',
    opt,
    synergy: { A: aBuff.active, B: bBuff.active }
  };
}
