import { describe, expect, it } from 'vitest';
import { CHAMPIONS, createTeamFromChampionIds, createTeamFromSetup } from '../src/index.js';

describe('team creation api', () => {
  it('keeps backward compatibility for champion id input', () => {
    const ids = CHAMPIONS.slice(0, 2).map((c) => c.id);
    const team = createTeamFromChampionIds('Legacy', ids);
    expect(team).toEqual({
      name: 'Legacy',
      units: [{ championId: ids[0] }, { championId: ids[1] }]
    });
  });

  it('accepts setup units with position identifiers', () => {
    const ids = CHAMPIONS.slice(0, 2).map((c) => c.id);
    const team = createTeamFromSetup('Setup', [
      { championId: ids[0], slotId: 7, row: 1, col: 2 },
      { championId: ids[1], lane: 0 }
    ]);
    expect(team).toEqual({
      name: 'Setup',
      units: [
        { championId: ids[0], slotId: 7, row: 1, col: 2 },
        { championId: ids[1], lane: 0 }
      ]
    });
  });
});
