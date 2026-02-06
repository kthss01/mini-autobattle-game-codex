import { describe, expect, it } from 'vitest';
import { CHAMPIONS, SKILLS, TAGS, createTeamFromChampionIds, runMatch } from '../src/index.js';

describe('sim ticket1-2 smoke', () => {
  it('has enough seed data', () => {
    expect(CHAMPIONS.length).toBeGreaterThanOrEqual(8);
    expect(SKILLS.length).toBeGreaterThanOrEqual(12);
    expect(TAGS.length).toBe(8);
  });

  it('runMatch placeholder returns stable baseline shape', () => {
    const teamA = createTeamFromChampionIds('A', CHAMPIONS.slice(0, 3).map((c) => c.id));
    const teamB = createTeamFromChampionIds('B', CHAMPIONS.slice(3, 6).map((c) => c.id));

    const a = runMatch(teamA, teamB, { seed: 123 });
    const b = runMatch(teamA, teamB, { seed: 123 });

    expect(a).toEqual(b);
    expect(a).toHaveProperty('winner');
    expect(a).toHaveProperty('scoreA');
    expect(a).toHaveProperty('scoreB');
  });
});
