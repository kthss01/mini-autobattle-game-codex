import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../src/rng.js';
import { createWorld } from '../src/sim/World.js';
import { aiTick, findBestEnemyTarget } from '../src/sim/AI.js';

function makeTeam(name, championIds) {
  return { name, units: championIds.map((championId) => ({ championId })) };
}

describe('tank protection AI', () => {
  it('non-diver DPS deprioritizes protected healer targets', () => {
    const world = createWorld(
      makeTeam('A', ['mage_pyro']),
      makeTeam('B', ['tank_guard', 'healer_priest']),
      mulberry32(7)
    );

    const attacker = world.units.find((u) => u.teamId === 'A');
    const enemyTank = world.units.find((u) => u.teamId === 'B' && u.tags.includes('TANK'));
    const enemyHealer = world.units.find((u) => u.teamId === 'B' && u.tags.includes('HEALER'));

    attacker.x = 300;
    attacker.y = 150;
    enemyTank.x = 470;
    enemyTank.y = 150;
    enemyHealer.x = 500;
    enemyHealer.y = 150;

    const target = findBestEnemyTarget(world, attacker);
    expect(target?.id).toBe(enemyTank.id);
  });

  it('diver can still prioritize healer even when tank is nearby', () => {
    const world = createWorld(
      makeTeam('A', ['diver_blade']),
      makeTeam('B', ['tank_guard', 'healer_priest']),
      mulberry32(9)
    );

    const attacker = world.units.find((u) => u.teamId === 'A');
    const enemyTank = world.units.find((u) => u.teamId === 'B' && u.tags.includes('TANK'));
    const enemyHealer = world.units.find((u) => u.teamId === 'B' && u.tags.includes('HEALER'));

    attacker.x = 300;
    attacker.y = 150;
    enemyTank.x = 470;
    enemyTank.y = 150;
    enemyHealer.x = 500;
    enemyHealer.y = 150;

    const target = findBestEnemyTarget(world, attacker);
    expect(target?.id).toBe(enemyHealer.id);
  });

  it('tank moves to peel when backline ally is threatened', () => {
    const world = createWorld(
      makeTeam('A', ['tank_guard', 'healer_priest']),
      makeTeam('B', ['diver_blade']),
      mulberry32(11)
    );

    const allyTank = world.units.find((u) => u.teamId === 'A' && u.tags.includes('TANK'));
    const allyHealer = world.units.find((u) => u.teamId === 'A' && u.tags.includes('HEALER'));
    const enemyDiver = world.units.find((u) => u.teamId === 'B');

    allyTank.x = 120;
    allyTank.y = 120;
    allyHealer.x = 320;
    allyHealer.y = 120;
    enemyDiver.x = 360;
    enemyDiver.y = 120;

    aiTick(world, 0.25);

    expect(allyTank.intent.type).toBe('MOVE');
    const offset = Math.hypot(allyTank.intent.x - allyHealer.x, allyTank.intent.y - allyHealer.y);
    expect(offset).toBeGreaterThan(40);
    expect(offset).toBeLessThan(70);
  });
});
