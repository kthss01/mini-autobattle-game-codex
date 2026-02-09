import { CHAMPIONS_BY_ID } from '../data/champions.js';
import { TEAM_SYNERGIES } from '../data/synergies.js';
import { createUnit, resetUnitIdCounter } from './Unit.js';

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/**
 * @param {number} teamSize
 * @param {'A'|'B'} side
 * @param {{width:number, height:number}} worldSize
 * @param {{
 *   xInset?: number,
 *   slotIds?: number[],
 *   multiRowThreshold?: number,
 *   maxRows?: number,
 *   rowGap?: number,
 *   minYRatio?: number,
 *   maxYRatio?: number,
 *   minYSpacing?: number,
 *   maxYSpacing?: number
 * }} [formation]
 */
export function computeSpawnSlots(teamSize, side, worldSize, formation = {}) {
  const width = worldSize.width;
  const height = worldSize.height;
  const xInset = formation.xInset ?? Math.round((160 / 960) * width);
  const slotIds = formation.slotIds || [];

  const minY = clamp(Math.round((formation.minYRatio ?? 0.14) * height), 0, height);
  const maxY = clamp(Math.round((formation.maxYRatio ?? 0.86) * height), minY, height);
  const centerY = Math.round(height / 2);

  const multiRowThreshold = formation.multiRowThreshold ?? 4;
  const maxRows = Math.max(1, formation.maxRows ?? 2);
  const rows = teamSize > multiRowThreshold ? Math.min(maxRows, 2) : 1;
  const cols = Math.max(1, Math.ceil(teamSize / rows));

  const minYSpacing = formation.minYSpacing ?? Math.round((58 / 540) * height);
  const maxYSpacing = formation.maxYSpacing ?? Math.round((118 / 540) * height);
  const desiredSpacing = cols <= 1 ? 0 : Math.round((maxY - minY) / (cols - 1));
  const ySpacing = cols <= 1 ? 0 : clamp(desiredSpacing, minYSpacing, maxYSpacing);
  const totalHeight = ySpacing * Math.max(0, cols - 1);
  const yStart = clamp(Math.round(centerY - totalHeight / 2), minY, maxY);

  const rowGap = clamp(formation.rowGap ?? Math.round((42 / 960) * width), 0, Math.round(width * 0.2));
  const frontX = side === 'A' ? xInset : width - xInset;
  const xDir = side === 'A' ? 1 : -1;

  return Array.from({ length: teamSize }, (_, index) => {
    const row = index % rows;
    const col = Math.floor(index / rows);
    const x = clamp(frontX - row * xDir * rowGap, 0, width);
    const y = clamp(yStart + col * ySpacing, minY, maxY);
    return {
      id: Number.isInteger(slotIds[index]) ? slotIds[index] : index,
      side,
      row,
      col,
      x,
      y
    };
  });
}

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

  const aChampions = teamA.units.map((u) => CHAMPIONS_BY_ID[u.championId]);
  const bChampions = teamB.units.map((u) => CHAMPIONS_BY_ID[u.championId]);
  if (aChampions.some((c) => !c) || bChampions.some((c) => !c)) throw new Error('Unknown champion id in team input');
  const aBuff = resolveTeamBuff(aChampions);
  const bBuff = resolveTeamBuff(bChampions);

  const aSlots = computeSpawnSlots(teamA.units.length, 'A', { width, height }, {
    ...opt.formation,
    xInset,
    slotIds: teamA.units.map((u, i) => (Number.isInteger(u.slotIndex) ? u.slotIndex : i))
  });
  const bSlots = computeSpawnSlots(teamB.units.length, 'B', { width, height }, {
    ...opt.formation,
    xInset,
    slotIds: teamB.units.map((u, i) => (Number.isInteger(u.slotIndex) ? u.slotIndex : i))
  });

  const units = [];
  teamA.units.forEach((u, i) => {
    const spawned = createUnit('A', u.championId, aSlots[i].x, aSlots[i].y, aBuff.buff);
    spawned.spawnSlotId = aSlots[i].id;
    units.push(spawned);
  });
  teamB.units.forEach((u, i) => {
    const spawned = createUnit('B', u.championId, bSlots[i].x, bSlots[i].y, bBuff.buff);
    spawned.spawnSlotId = bSlots[i].id;
    units.push(spawned);
  });

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
