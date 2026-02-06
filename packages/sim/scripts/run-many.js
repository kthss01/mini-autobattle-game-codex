import { CHAMPIONS, createTeamFromChampionIds, runMatch } from '../src/index.js';

const teamA = createTeamFromChampionIds('A', CHAMPIONS.slice(0, 3).map((c) => c.id));
const teamB = createTeamFromChampionIds('B', CHAMPIONS.slice(3, 6).map((c) => c.id));

const runs = 100;
let draw = 0;

for (let i = 0; i < runs; i += 1) {
  const result = runMatch(teamA, teamB, { seed: 1000 + i });
  if (result.winner === 'DRAW') draw += 1;
}

console.log(`[sim:run] placeholder finished: ${runs} matches, draws=${draw}`);
