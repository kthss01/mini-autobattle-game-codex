import { describe, expect, it } from 'vitest';
import { CHAMPIONS, createMatch, createTeamFromChampionIds, runMatch } from '../src/index.js';

function buildTeam(name, size, offset = 0) {
  const ids = Array.from({ length: size }, (_, index) => CHAMPIONS[(index + offset) % CHAMPIONS.length].id);
  return createTeamFromChampionIds(name, ids);
}

describe('match deterministic/completion scale checks', () => {
  it.each([4, 8, 12, 16])('is deterministic and finishes for team size %i', (teamSize) => {
    const teamA = buildTeam('A', teamSize, 0);
    const teamB = buildTeam('B', teamSize, 3);

    const resultA = runMatch(teamA, teamB, { seed: 777 + teamSize, durationSec: 90 });
    const resultB = runMatch(teamA, teamB, { seed: 777 + teamSize, durationSec: 90 });
    expect(resultA).toEqual(resultB);

    const match = createMatch(teamA, teamB, { seed: 1777 + teamSize, durationSec: 90 });
    while (!match.world.finished) match.step();

    expect(match.world.finished).toBe(true);
    expect(match.world.t).toBeLessThanOrEqual(90 + match.world.dt);
    expect(['A', 'B', 'DRAW']).toContain(match.world.winner);
  });
});
