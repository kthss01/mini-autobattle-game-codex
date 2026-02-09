import { mulberry32 } from '../rng.js';
import { aiTick } from './AI.js';
import { refreshWorldIndexes, stepCombat } from './Combat.js';
import { createWorld } from './World.js';

export function createMatchCore(teamA, teamB, opt = {}) {
  const options = { seed: 123, durationSec: 75, respawn: false, ...opt };
  const rng = mulberry32(options.seed);
  const world = createWorld(teamA, teamB, rng, options);

  return {
    world,
    options,
    step(dt = world.dt) {
      if (world.finished) return { done: true, winner: world.winner };
      refreshWorldIndexes(world);
      aiTick(world, dt);
      stepCombat(world, dt);
      world.t += dt;
      if (world.t >= options.durationSec) {
        world.finished = true;
        const aHp = world.units.reduce((sum, unit) => (unit.teamId === 'A' ? sum + Math.max(0, unit.hp) : sum), 0);
        const bHp = world.units.reduce((sum, unit) => (unit.teamId === 'B' ? sum + Math.max(0, unit.hp) : sum), 0);
        world.winner = aHp === bHp ? 'DRAW' : aHp > bHp ? 'A' : 'B';
      }
      return { done: world.finished, winner: world.winner };
    }
  };
}

export function runMatchCore(teamA, teamB, opt = {}) {
  const match = createMatchCore(teamA, teamB, opt);
  while (!match.world.finished) match.step();

  const units = match.world.units;
  const scoreA = units.filter((u) => u.teamId === 'A').reduce((s, u) => s + u.stats.kills * 3 + Math.round(u.hp / 100), 0);
  const scoreB = units.filter((u) => u.teamId === 'B').reduce((s, u) => s + u.stats.kills * 3 + Math.round(u.hp / 100), 0);

  return {
    winner: match.world.winner,
    scoreA,
    scoreB,
    stats: units.map((u) => ({
      unitId: u.id,
      teamId: u.teamId,
      championId: u.championId,
      damageDone: u.stats.damageDone,
      healDone: u.stats.healDone,
      kills: u.stats.kills,
      deaths: u.stats.deaths
    })),
    log: match.world.log,
    seed: match.options.seed,
    duration: match.world.t
  };
}
