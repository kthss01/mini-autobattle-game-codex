/** @type {import('../types.js').ChampionDef[]} */
export const CHAMPIONS = [
  {
    id: 'tank_guard',
    name: 'Guard',
    role: 'tank',
    tags: ['TANK', 'CC'],
    base: { maxHp: 1350, atk: 70, def: 30, moveSpeed: 110, attackRange: 45, attackCd: 0.95 },
    skills: ['taunt_shout', 'shield_wall']
  },
  {
    id: 'healer_priest',
    name: 'Priest',
    role: 'healer',
    tags: ['HEALER'],
    base: { maxHp: 820, atk: 48, def: 10, moveSpeed: 120, attackRange: 180, attackCd: 1.15 },
    skills: ['quick_heal', 'healing_wave']
  },
  {
    id: 'sniper_ranger',
    name: 'Ranger',
    role: 'dps',
    tags: ['SNIPER', 'BURST'],
    base: { maxHp: 760, atk: 92, def: 8, moveSpeed: 125, attackRange: 360, attackCd: 1.05 },
    skills: ['power_shot']
  },
  {
    id: 'diver_blade',
    name: 'Blade',
    role: 'dps',
    tags: ['DIVER', 'BURST'],
    base: { maxHp: 920, atk: 86, def: 12, moveSpeed: 155, attackRange: 40, attackCd: 0.85 },
    skills: ['dash_strike', 'smoke_screen']
  },
  {
    id: 'mage_pyro',
    name: 'Pyro',
    role: 'dps',
    tags: ['AOE'],
    base: { maxHp: 800, atk: 78, def: 9, moveSpeed: 120, attackRange: 260, attackCd: 1.2 },
    skills: ['fire_orb']
  },
  {
    id: 'support_frost',
    name: 'Frost',
    role: 'support',
    tags: ['CC'],
    base: { maxHp: 860, atk: 58, def: 12, moveSpeed: 120, attackRange: 220, attackCd: 1.1 },
    skills: ['ice_nova']
  },
  {
    id: 'summoner_witch',
    name: 'Witch',
    role: 'support',
    tags: ['SUMMON'],
    base: { maxHp: 780, atk: 55, def: 8, moveSpeed: 120, attackRange: 240, attackCd: 1.25 },
    skills: ['summon_imps']
  },
  {
    id: 'bruiser_reaper',
    name: 'Reaper',
    role: 'dps',
    tags: ['TANK', 'BURST'],
    base: { maxHp: 1080, atk: 82, def: 18, moveSpeed: 130, attackRange: 55, attackCd: 0.95 },
    skills: ['drain_slash']
  },
  {
    id: 'imp_minion',
    name: 'Imp',
    role: 'dps',
    tags: ['SUMMON'],
    base: { maxHp: 260, atk: 36, def: 2, moveSpeed: 150, attackRange: 35, attackCd: 0.9 },
    skills: [],
    isMinion: true
  }
];

export const CHAMPIONS_BY_ID = Object.fromEntries(CHAMPIONS.map((c) => [c.id, c]));
