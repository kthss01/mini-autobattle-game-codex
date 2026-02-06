import { CHAMPIONS_BY_ID } from '../data/champions.js';
import { SKILLS_BY_ID } from '../data/skills.js';
import { TAG_MODIFIERS } from '../data/tags.js';
import { clampMapBounds, inRange, isAlive, moveTowards } from './Effects.js';

function getById(world, id) {
  return world.units.find((u) => u.id === id);
}

function teamAlive(world, teamId) {
  return world.units.some((u) => u.teamId === teamId && isAlive(u));
}

function damageMultiplier(attacker, defender) {
  let mul = 1 + (attacker.damageMulBonus || 0);
  for (const m of TAG_MODIFIERS) {
    if (attacker.tags.includes(m.fromTag) && defender.tags.includes(m.toTag)) mul *= m.damageMul || 1;
  }
  return mul;
}

function applyDamage(world, source, target, raw) {
  if (!isAlive(target)) return 0;
  const reduced = raw * damageMultiplier(source, target);
  const dmg = Math.max(1, Math.round(reduced * (100 / (100 + target.def))));
  target.hp -= dmg;
  source.stats.damageDone += dmg;
  if (target.hp <= 0) {
    target.hp = 0;
    target.alive = false;
    source.stats.kills += 1;
    target.stats.deaths += 1;
  }
  return dmg;
}

function applyHeal(source, target, amount) {
  const before = target.hp;
  const mul = 1 + (source.healMulBonus || 0);
  target.hp = Math.min(target.maxHp, target.hp + Math.round(amount * mul));
  const healed = target.hp - before;
  source.stats.healDone += healed;
  return healed;
}

function applySkill(world, unit, skillId, intent) {
  const skill = SKILLS_BY_ID[skillId];
  if (!skill || (unit.skillCooldowns[skillId] || 0) > 0) return;
  unit.skillCooldowns[skillId] = skill.cooldown;

  const enemies = world.units.filter((u) => isAlive(u) && u.teamId !== unit.teamId);
  const allies = world.units.filter((u) => isAlive(u) && u.teamId === unit.teamId);

  if (skill.target === 'SELF') {
    for (const e of skill.effects) {
      if (e.kind === 'SHIELD') unit.hp = Math.min(unit.maxHp, unit.hp + (e.amount || 0));
    }
    return;
  }

  if (skill.target === 'ALLY') {
    const target = getById(world, intent.targetId) || unit;
    if (!isAlive(target)) return;
    for (const e of skill.effects) {
      if (e.kind === 'HEAL') applyHeal(unit, target, e.amount || 0);
    }
    return;
  }

  if (skill.target === 'ENEMY') {
    const target = getById(world, intent.targetId);
    if (!target || !isAlive(target) || !inRange(unit, target, skill.range)) return;
    let damageDealt = 0;
    for (const e of skill.effects) {
      if (e.kind === 'DAMAGE') damageDealt += applyDamage(world, unit, target, (e.amount || 0) + unit.atk * 0.7);
      if (e.kind === 'LIFESTEAL') applyHeal(unit, unit, damageDealt * (e.ratio || 0));
    }
    world.projectiles.push({ t: world.t, from: { x: unit.x, y: unit.y }, to: { x: target.x, y: target.y }, skillId });
    return;
  }

  const point = intent.point || { x: unit.x, y: unit.y };
  const radius = skill.shape.radius || 80;
  if (skill.range > 0) {
    const dx = point.x - unit.x;
    const dy = point.y - unit.y;
    if (dx * dx + dy * dy > skill.range * skill.range) return;
  }
  for (const e of skill.effects) {
    if (e.kind === 'SUMMON') {
      const def = CHAMPIONS_BY_ID[e.unitId];
      for (let i = 0; i < (e.count || 1); i += 1) {
        const idx = world.units.length + i;
        world.units.push({
          id: `${unit.teamId}_${e.unitId}_${idx}`,
          teamId: unit.teamId,
          championId: e.unitId,
          name: def.name,
          role: def.role,
          tags: [...def.tags],
          skillIds: [],
          x: point.x + i * 20,
          y: point.y + i * 10,
          alive: true,
          hp: def.base.maxHp,
          maxHp: def.base.maxHp,
          atk: def.base.atk,
          def: def.base.def,
          moveSpeed: def.base.moveSpeed,
          attackRange: def.base.attackRange,
          attackCd: def.base.attackCd,
          attackTimer: 0,
          skillCooldowns: Object.create(null),
          effects: [],
          intent: { type: 'NONE' },
          aiTimer: 0,
          damageMulBonus: unit.damageMulBonus,
          healMulBonus: 0,
          stats: { damageDone: 0, healDone: 0, kills: 0, deaths: 0 }
        });
      }
      continue;
    }

    const pool = e.kind === 'HEAL' ? allies : enemies;
    for (const target of pool) {
      const dx = target.x - point.x;
      const dy = target.y - point.y;
      if (dx * dx + dy * dy > radius * radius) continue;
      if (e.kind === 'DAMAGE') applyDamage(world, unit, target, (e.amount || 0) + unit.atk * 0.55);
      if (e.kind === 'HEAL') applyHeal(unit, target, e.amount || 0);
    }
  }
  world.fx.push({ t: world.t, kind: 'AOE', skillId, x: point.x, y: point.y, radius });
}

export function stepCombat(world, dt) {
  for (const unit of world.units) {
    if (!isAlive(unit)) continue;
    unit.attackTimer = Math.max(0, unit.attackTimer - dt);
    for (const sid of Object.keys(unit.skillCooldowns)) unit.skillCooldowns[sid] = Math.max(0, unit.skillCooldowns[sid] - dt);

    const intent = unit.intent || { type: 'NONE' };
    if (intent.type === 'MOVE') {
      moveTowards(unit, intent, dt);
      clampMapBounds(unit, world);
      continue;
    }

    if (intent.type === 'CAST') {
      applySkill(world, unit, intent.skillId, intent);
      continue;
    }

    if (intent.type === 'ATTACK') {
      const target = getById(world, intent.targetId);
      if (!target || !isAlive(target) || !inRange(unit, target, unit.attackRange)) continue;
      if (unit.attackTimer > 0) continue;
      unit.attackTimer = unit.attackCd;
      applyDamage(world, unit, target, unit.atk);
    }
  }

  const aAlive = teamAlive(world, 'A');
  const bAlive = teamAlive(world, 'B');
  if (!aAlive || !bAlive) {
    world.finished = true;
    world.winner = aAlive && !bAlive ? 'A' : bAlive && !aAlive ? 'B' : 'DRAW';
  }
}
