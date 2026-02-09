import { describe, expect, it } from 'vitest';
import { CHAMPIONS, createTeamFromSetup } from '../src/index.js';
import { createWorld, computeSpawnSlots } from '../src/sim/World.js';

describe('world spawn slot formation', () => {
  it('switches to multi-row layout above threshold and stays in bounds', () => {
    const slots = computeSpawnSlots(6, 'A', { width: 800, height: 450 }, { multiRowThreshold: 4 });
    expect(slots).toHaveLength(6);
    expect(new Set(slots.map((s) => s.row)).size).toBeGreaterThan(1);
    for (const slot of slots) {
      expect(slot.x).toBeGreaterThanOrEqual(0);
      expect(slot.x).toBeLessThanOrEqual(800);
      expect(slot.y).toBeGreaterThanOrEqual(0);
      expect(slot.y).toBeLessThanOrEqual(450);
    }
  });



  it('prioritizes explicit position fields and falls back when missing', () => {
    const ids = CHAMPIONS.slice(0, 3).map((c) => c.id);
    const teamA = createTeamFromSetup('A', [
      { championId: ids[0], slotId: 42, row: 1, col: 1 },
      { championId: ids[1], lane: 2, col: 0 },
      { championId: ids[2] }
    ]);
    const teamB = createTeamFromSetup('B', ids.map((championId) => ({ championId })));

    const world = createWorld(teamA, teamB, Math.random, {});
    const unitsA = world.units.filter((u) => u.teamId === 'A');

    expect(unitsA.map((u) => u.spawnSlotId)).toEqual([42, 2, 2]);
    expect(unitsA[0].x).not.toEqual(unitsA[2].x);
    expect(unitsA[0].y).not.toEqual(unitsA[2].y);
  });

  it('propagates slot index to spawned unit slot id', () => {
    const ids = CHAMPIONS.slice(0, 3).map((c) => c.id);
    const teamA = { name: 'A', units: ids.map((championId, slotIndex) => ({ championId, slotIndex: slotIndex + 10 })) };
    const teamB = { name: 'B', units: ids.map((championId, slotIndex) => ({ championId, slotIndex: slotIndex + 20 })) };

    const world = createWorld(teamA, teamB, Math.random, {});
    const unitsA = world.units.filter((u) => u.teamId === 'A');
    const unitsB = world.units.filter((u) => u.teamId === 'B');

    expect(unitsA.map((u) => u.spawnSlotId)).toEqual([10, 11, 12]);
    expect(unitsB.map((u) => u.spawnSlotId)).toEqual([20, 21, 22]);
  });
});
