import { UNIT_ROLES } from './roles.js';

/** @type {import('../types.js').ChampionDef[]} */
export const CHAMPIONS = [
  {
    id: 'tank_guard',
    name: 'Guard',
    spriteKey: 'champion-tank_guard',
    animations: {
      idle: 'champion-tank_guard-idle',
      move: 'champion-tank_guard-move',
      attack: 'champion-tank_guard-attack',
      cast: 'champion-tank_guard-cast',
      death: 'champion-tank_guard-death'
    },
    role: UNIT_ROLES.TANK,
    tags: ['TANK', 'CC'],
    base: { maxHp: 1350, atk: 70, def: 30, moveSpeed: 110, attackRange: 45, attackCd: 0.95 },
    skills: ['taunt_shout', 'shield_wall']
  },
  {
    id: 'healer_priest',
    name: 'Priest',
    spriteKey: 'champion-healer_priest',
    animations: {
      idle: 'champion-healer_priest-idle',
      move: 'champion-healer_priest-move',
      attack: 'champion-healer_priest-attack',
      cast: 'champion-healer_priest-cast',
      death: 'champion-healer_priest-death'
    },
    role: UNIT_ROLES.HEALER,
    tags: ['HEALER'],
    base: { maxHp: 820, atk: 48, def: 10, moveSpeed: 120, attackRange: 180, attackCd: 1.15 },
    skills: ['quick_heal', 'healing_wave']
  },
  {
    id: 'sniper_ranger',
    name: 'Ranger',
    spriteKey: 'champion-sniper_ranger',
    animations: {
      idle: 'champion-sniper_ranger-idle',
      move: 'champion-sniper_ranger-move',
      attack: 'champion-sniper_ranger-attack',
      cast: 'champion-sniper_ranger-cast',
      death: 'champion-sniper_ranger-death'
    },
    role: UNIT_ROLES.DPS,
    tags: ['SNIPER', 'BURST'],
    base: { maxHp: 760, atk: 92, def: 8, moveSpeed: 125, attackRange: 360, attackCd: 1.05 },
    skills: ['power_shot']
  },
  {
    id: 'diver_blade',
    name: 'Blade',
    spriteKey: 'champion-diver_blade',
    animations: {
      idle: 'champion-diver_blade-idle',
      move: 'champion-diver_blade-move',
      attack: 'champion-diver_blade-attack',
      cast: 'champion-diver_blade-cast',
      death: 'champion-diver_blade-death'
    },
    role: UNIT_ROLES.DPS,
    tags: ['DIVER', 'BURST'],
    base: { maxHp: 920, atk: 86, def: 12, moveSpeed: 155, attackRange: 40, attackCd: 0.85 },
    skills: ['dash_strike', 'smoke_screen']
  },
  {
    id: 'mage_pyro',
    name: 'Pyro',
    spriteKey: 'champion-mage_pyro',
    animations: {
      idle: 'champion-mage_pyro-idle',
      move: 'champion-mage_pyro-move',
      attack: 'champion-mage_pyro-attack',
      cast: 'champion-mage_pyro-cast',
      death: 'champion-mage_pyro-death'
    },
    role: UNIT_ROLES.DPS,
    tags: ['AOE'],
    base: { maxHp: 800, atk: 78, def: 9, moveSpeed: 120, attackRange: 260, attackCd: 1.2 },
    skills: ['fire_orb']
  },
  {
    id: 'support_frost',
    name: 'Frost',
    spriteKey: 'champion-support_frost',
    animations: {
      idle: 'champion-support_frost-idle',
      move: 'champion-support_frost-move',
      attack: 'champion-support_frost-attack',
      cast: 'champion-support_frost-cast',
      death: 'champion-support_frost-death'
    },
    role: UNIT_ROLES.SUPPORT,
    tags: ['CC'],
    base: { maxHp: 860, atk: 58, def: 12, moveSpeed: 120, attackRange: 220, attackCd: 1.1 },
    skills: ['ice_nova']
  },
  {
    id: 'summoner_witch',
    name: 'Witch',
    spriteKey: 'champion-summoner_witch',
    animations: {
      idle: 'champion-summoner_witch-idle',
      move: 'champion-summoner_witch-move',
      attack: 'champion-summoner_witch-attack',
      cast: 'champion-summoner_witch-cast',
      death: 'champion-summoner_witch-death'
    },
    role: UNIT_ROLES.SUPPORT,
    tags: ['SUMMON'],
    base: { maxHp: 780, atk: 55, def: 8, moveSpeed: 120, attackRange: 240, attackCd: 1.25 },
    skills: ['summon_imps']
  },
  {
    id: 'bruiser_reaper',
    name: 'Reaper',
    spriteKey: 'champion-bruiser_reaper',
    animations: {
      idle: 'champion-bruiser_reaper-idle',
      move: 'champion-bruiser_reaper-move',
      attack: 'champion-bruiser_reaper-attack',
      cast: 'champion-bruiser_reaper-cast',
      death: 'champion-bruiser_reaper-death'
    },
    role: UNIT_ROLES.DPS,
    tags: ['TANK', 'BURST'],
    base: { maxHp: 1080, atk: 82, def: 18, moveSpeed: 130, attackRange: 55, attackCd: 0.95 },
    skills: ['drain_slash']
  },
  {
    id: 'imp_minion',
    name: 'Imp',
    spriteKey: 'champion-imp_minion',
    animations: {
      idle: 'champion-imp_minion-idle',
      move: 'champion-imp_minion-move',
      attack: 'champion-imp_minion-attack',
      death: 'champion-imp_minion-death'
    },
    role: UNIT_ROLES.DPS,
    tags: ['SUMMON'],
    base: { maxHp: 260, atk: 36, def: 2, moveSpeed: 150, attackRange: 35, attackCd: 0.9 },
    skills: [],
    isMinion: true
  }
];

export const CHAMPIONS_BY_ID = Object.fromEntries(CHAMPIONS.map((c) => [c.id, c]));
