/**
 * @typedef {Object} TeamSlotSetup
 * @property {number} slotIndex
 * @property {string} championId
 */

/**
 * @typedef {Object} TeamSetup
 * @property {'A' | 'B'} id
 * @property {TeamSlotSetup[]} slots
 */

/**
 * @typedef {Object} MatchSetupPayload
 * @property {number} seed
 * @property {{ durationSec: number }} options
 * @property {{ A: TeamSetup, B: TeamSetup }} teams
 */

export const DEFAULT_MATCH_DURATION_SEC = 45;
export const TEAM_SIZE = 4;

/**
 * @param {import('@autobattle/sim').CHAMPIONS[number]['id'][]} championIds
 * @returns {TeamSlotSetup[]}
 */
function toTeamSlots(championIds) {
  return championIds.map((championId, slotIndex) => ({ slotIndex, championId }));
}

/**
 * @param {number} seed
 * @param {import('@autobattle/sim').CHAMPIONS[number]['id'][]} championIds
 * @returns {MatchSetupPayload}
 */
export function createDefaultMatchSetup(seed, championIds) {
  return {
    seed,
    options: { durationSec: DEFAULT_MATCH_DURATION_SEC },
    teams: {
      A: { id: 'A', slots: toTeamSlots(championIds.slice(0, TEAM_SIZE)) },
      B: { id: 'B', slots: toTeamSlots(championIds.slice(TEAM_SIZE, TEAM_SIZE * 2)) }
    }
  };
}

