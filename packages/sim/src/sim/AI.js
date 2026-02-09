import { SKILLS_BY_ID } from '../data/skills.js';
import { distance, distance2, inRange, isAlive } from './Effects.js';

const AI_TICK_SEC = 0.25;

function getEnemyTeamId(unit) {
  return unit.teamId === 'A' ? 'B' : 'A';
}

function getAllies(world, unit) {
  const indexed = world.indexes?.teamAliveUnits?.[unit.teamId];
  if (indexed) return indexed;
  const allies = [];
  for (const other of world.units) {
    if (other.teamId === unit.teamId && isAlive(other)) allies.push(other);
  }
  return allies;
}

function getEnemies(world, unit) {
  const indexed = world.indexes?.teamAliveUnits?.[getEnemyTeamId(unit)];
  if (indexed) return indexed;
  const enemies = [];
  for (const other of world.units) {
    if (other.teamId !== unit.teamId && isAlive(other)) enemies.push(other);
  }
  return enemies;
}

function canCast(unit, skillId) {
  return (unit.skillCooldowns[skillId] || 0) <= 0;
}

function hpRate(unit) {
  return unit.hp / Math.max(1, unit.maxHp);
}

function skillByUseWhen(unit, useWhen) {
  return unit.skillIds
    .map((sid) => SKILLS_BY_ID[sid])
    .find((sk) => sk && sk.aiHint?.useWhen === useWhen && canCast(unit, sk.id));
}

function shouldKeepBackline(unit) {
  return ['HEALER', 'SNIPER', 'SUMMON'].some((t) => unit.tags.includes(t));
}

function findLowestHpAllyInRange(world, unit, range) {
  const allies = getAllies(world, unit);
  let best = null;
  let bestRate = Infinity;
  for (const ally of allies) {
    if (!inRange(unit, ally, range)) continue;
    const rate = hpRate(ally);
    if (rate < bestRate) {
      best = ally;
      bestRate = rate;
    }
  }
  return best;
}

function countEnemiesInCircle(world, teamId, point, radius) {
  const enemies = world.indexes?.teamAliveUnits?.[teamId === 'A' ? 'B' : 'A'] || world.units;
  const r2 = radius * radius;
  let n = 0;
  for (const u of enemies) {
    if (!isAlive(u) || u.teamId === teamId) continue;
    const dx = u.x - point.x;
    const dy = u.y - point.y;
    if (dx * dx + dy * dy <= r2) n += 1;
  }
  return n;
}

function findBestPointForAOE(world, unit, radius, castRange) {
  const enemies = getEnemies(world, unit);
  let best = null;
  let bestCount = 0;
  for (const enemy of enemies) {
    if (!inRange(unit, enemy, castRange)) continue;
    const c = countEnemiesInCircle(world, unit.teamId, enemy, radius);
    if (c > bestCount) {
      bestCount = c;
      best = { x: enemy.x, y: enemy.y, count: c };
    }
  }
  return best;
}

function getBacklinePoint(world, unit) {
  const x = unit.teamId === 'A' ? 120 : world.width - 120;
  return { x, y: unit.y };
}

function findBestEnemyTarget(world, unit) {
  const enemies = getEnemies(world, unit);
  if (!enemies.length) return null;

  let best = enemies[0];
  let bestScore = -Infinity;
  const allies = getAllies(world, unit);
  for (const enemy of enemies) {
    let score = 0;
    const d = distance(unit, enemy);
    score += 0.35 * (1 / (1 + d));
    score += 0.32 * (1 - hpRate(enemy));

    if (enemy.tags.includes('HEALER')) score += 0.25;
    if (enemy.tags.includes('SNIPER')) score += 0.18;
    if (enemy.tags.includes('SUMMON')) score += 0.1;
    if (enemy.tags.includes('TANK')) score -= 0.08;

    if (unit.tags.includes('DIVER') && (enemy.tags.includes('HEALER') || enemy.tags.includes('SNIPER'))) score += 0.25;
    if (unit.tags.includes('BURST') && hpRate(enemy) <= 0.5) score += 0.18;
    if (unit.tags.includes('AOE')) score += Math.min(0.15, countEnemiesInCircle(world, unit.teamId, enemy, 120) * 0.04);

    let focused = false;
    for (const ally of allies) {
      if (ally.intent?.targetId === enemy.id) {
        focused = true;
        break;
      }
    }
    if (focused) score += 0.08;

    if (score > bestScore) {
      bestScore = score;
      best = enemy;
    }
  }
  return best;
}

export function aiTick(world, dt = AI_TICK_SEC) {
  for (const unit of world.units) {
    if (!isAlive(unit)) {
      unit.intent = { type: 'NONE' };
      continue;
    }

    unit.aiTimer -= dt;
    if (unit.aiTimer > 0) continue;
    unit.aiTimer = AI_TICK_SEC;

    unit.intent = { type: 'NONE' };
    const target = findBestEnemyTarget(world, unit);
    if (!target) {
      unit.intent = { type: 'NONE' };
      continue;
    }

    if (hpRate(unit) < 0.35) {
      const selfSkillId = unit.skillIds.find((sid) => {
        const sk = SKILLS_BY_ID[sid];
        return sk && sk.target === 'SELF' && canCast(unit, sid);
      });
      if (selfSkillId) {
        unit.intent = { type: 'CAST', skillId: selfSkillId, targetType: 'SELF' };
        continue;
      }
    }

    if (unit.tags.includes('HEALER')) {
      const lowHpAllySkill = skillByUseWhen(unit, 'LOW_HP_ALLY') || (unit.skillIds.includes('quick_heal') ? SKILLS_BY_ID.quick_heal : null);
      if (lowHpAllySkill) {
        const ally = findLowestHpAllyInRange(world, unit, lowHpAllySkill.range);
        if (ally && hpRate(ally) < 0.4) {
          unit.intent = { type: 'CAST', skillId: lowHpAllySkill.id, targetType: 'ALLY', targetId: ally.id };
          continue;
        }
      }

      const healingWave = unit.skillIds.includes('healing_wave') ? SKILLS_BY_ID.healing_wave : null;
      if (healingWave && canCast(unit, healingWave.id)) {
        let center = null;
        let lowHpInRange = 0;
        for (const ally of getAllies(world, unit)) {
          if (!inRange(unit, ally, healingWave.range) || hpRate(ally) >= 0.6) continue;
          if (!center) center = ally;
          lowHpInRange += 1;
          if (lowHpInRange >= 2) break;
        }
        if (lowHpInRange >= 2 && center) {
          unit.intent = { type: 'CAST', skillId: healingWave.id, targetType: 'POINT', point: { x: center.x, y: center.y } };
          continue;
        }
      }
    }

    for (const sid of unit.skillIds) {
      const sk = SKILLS_BY_ID[sid];
      if (!sk || !canCast(unit, sid)) continue;
      if (['fire_orb', 'ice_nova', 'taunt_shout'].includes(sid) || sk.aiHint?.useWhen === 'CLUMP_ENEMIES') {
        const radius = sk.shape.radius || 100;
        const bestPoint = findBestPointForAOE(world, unit, radius, sk.range || unit.attackRange);
        if (bestPoint && bestPoint.count >= 2) {
          unit.intent = { type: 'CAST', skillId: sid, targetType: 'POINT', point: { x: bestPoint.x, y: bestPoint.y } };
          break;
        }
      }
    }
    if (unit.intent.type === 'CAST') continue;

    for (const sid of unit.skillIds) {
      const sk = SKILLS_BY_ID[sid];
      if (!sk || !canCast(unit, sid)) continue;
      if (sk.aiHint?.useWhen === 'ON_COOLDOWN' || ['power_shot', 'drain_slash', 'dash_strike', 'summon_imps'].includes(sid)) {
        const range = sk.range || unit.attackRange;
        if (sid === 'dash_strike' && distance(unit, target) < 120) continue;
        if (sk.target === 'POINT') {
          unit.intent = { type: 'CAST', skillId: sid, targetType: 'POINT', point: { x: target.x, y: target.y } };
        } else if (inRange(unit, target, range)) {
          unit.intent = { type: 'CAST', skillId: sid, targetType: 'ENEMY', targetId: target.id };
        }
        if (unit.intent.type === 'CAST') break;
      }
    }
    if (unit.intent.type === 'CAST') continue;

    if (shouldKeepBackline(unit)) {
      let nearEnemy = null;
      for (const enemy of getEnemies(world, unit)) {
        if (inRange(unit, enemy, 140)) {
          nearEnemy = enemy;
          break;
        }
      }
      if (nearEnemy) {
        const dx = unit.x - nearEnemy.x;
        const dy = unit.y - nearEnemy.y;
        const len = Math.hypot(dx, dy) || 1;
        unit.intent = { type: 'MOVE', x: unit.x + (dx / len) * 100, y: unit.y + (dy / len) * 100 };
        continue;
      }
      const backline = getBacklinePoint(world, unit);
      if (distance2(unit, backline) > 70 * 70) {
        unit.intent = { type: 'MOVE', x: backline.x, y: backline.y };
        continue;
      }
    }

    if (!inRange(unit, target, unit.attackRange)) {
      unit.intent = { type: 'MOVE', x: target.x, y: target.y };
      continue;
    }

    unit.intent = { type: 'ATTACK', targetId: target.id };
  }
}

export { distance2, findBestEnemyTarget, findLowestHpAllyInRange, countEnemiesInCircle, findBestPointForAOE };
