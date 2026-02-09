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
  return createTeamFromSetup(name, championIds.map((championId) => ({ championId })));
}

export function createTeamFromSetup(name, setupUnits) {
  return {
    name,
    units: setupUnits.map((unit) => {
      const { championId, slotId, lane, row, col, slotIndex } = unit;
      if (!CHAMPIONS_BY_ID[championId]) throw new Error(`Unknown champion id: ${championId}`);
      const normalized = { championId };
      if (Number.isInteger(slotId)) normalized.slotId = slotId;
      if (Number.isInteger(lane)) normalized.lane = lane;
      if (Number.isInteger(row)) normalized.row = row;
      if (Number.isInteger(col)) normalized.col = col;
      if (Number.isInteger(slotIndex)) normalized.slotIndex = slotIndex;
      return normalized;
    })
  };
}
