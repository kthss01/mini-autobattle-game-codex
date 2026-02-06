import { CHAMPIONS, CHAMPIONS_BY_ID } from './data/champions.js';
import { SKILLS } from './data/skills.js';
import { TEAM_SYNERGIES } from './data/synergies.js';
import { UNIT_ROLES, UNIT_ROLE_VALUES } from './data/roles.js';
import { TAG_MODIFIERS, TAGS } from './data/tags.js';
import { createMatchCore, runMatchCore } from './sim/Match.js';

export { CHAMPIONS, SKILLS, TAGS, TAG_MODIFIERS, TEAM_SYNERGIES, UNIT_ROLES, UNIT_ROLE_VALUES };

export function createMatch(teamA, teamB, opt = {}) {
  return createMatchCore(teamA, teamB, opt);
}

export function runMatch(teamA, teamB, opt = {}) {
  return runMatchCore(teamA, teamB, opt);
}

export function createTeamFromChampionIds(name, championIds) {
  return {
    name,
    units: championIds.map((championId) => {
      if (!CHAMPIONS_BY_ID[championId]) throw new Error(`Unknown champion id: ${championId}`);
      return { championId };
    })
  };
}
