import { CHAMPIONS } from './data/champions.js';
import { SKILLS } from './data/skills.js';
import { TAGS, TAG_MODIFIERS } from './data/tags.js';
import { TEAM_SYNERGIES } from './data/synergies.js';

export { CHAMPIONS, SKILLS, TAGS, TAG_MODIFIERS, TEAM_SYNERGIES };

/**
 * @param {import('./types.js').TeamInput} teamA
 * @param {import('./types.js').TeamInput} teamB
 * @param {import('./types.js').MatchOptions} [opt]
 */
export function createMatch(teamA, teamB, opt = {}) {
  return {
    teamA,
    teamB,
    opt: { seed: 123, durationSec: 75, respawn: true, ...opt },
    step() {
      throw new Error('createMatch().step() is not implemented yet. Planned for ticket 3+');
    }
  };
}

/**
 * @param {import('./types.js').TeamInput} teamA
 * @param {import('./types.js').TeamInput} teamB
 * @param {import('./types.js').MatchOptions} [opt]
 */
export function runMatch(teamA, teamB, opt = {}) {
  return {
    winner: 'DRAW',
    scoreA: 0,
    scoreB: 0,
    stats: {
      note: 'Simulation core is not implemented yet. Planned for ticket 3+'
    },
    log: [
      {
        t: 0,
        type: 'INFO',
        message: 'runMatch placeholder result'
      }
    ],
    input: { teamA, teamB, opt: { seed: 123, durationSec: 75, respawn: true, ...opt } }
  };
}

/**
 * @param {string} name
 * @param {string[]} championIds
 * @returns {import('./types.js').TeamInput}
 */
export function createTeamFromChampionIds(name, championIds) {
  return {
    name,
    units: championIds.map((championId) => ({ championId }))
  };
}
