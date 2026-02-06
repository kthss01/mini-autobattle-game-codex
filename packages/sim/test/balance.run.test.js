import { describe, expect, it } from 'vitest';
import { CHAMPIONS, createTeamFromChampionIds, runMatch } from '../src/index.js';

describe('balance run placeholder', () => {
  it('executes many runs without runtime errors', () => {
    const teamA = createTeamFromChampionIds('A', CHAMPIONS.slice(0, 3).map((c) => c.id));
    const teamB = createTeamFromChampionIds('B', CHAMPIONS.slice(3, 6).map((c) => c.id));

    let count = 0;
    for (let i = 0; i < 200; i += 1) {
      const result = runMatch(teamA, teamB, { seed: i + 1 });
      if (result.winner === 'DRAW') count += 1;
    }

    expect(count).toBeGreaterThanOrEqual(0);
  });
});
