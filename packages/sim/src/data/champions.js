/** @type {import('../types.js').ChampionDef[]} */
export const CHAMPIONS = [
  { id: 'tank_guard', name: 'Guard', role: 'tank', tags: ['TANK', 'CC'], base: { maxHp: 1200, atk: 65, def: 25, moveSpeed: 120, attackRange: 40, attackCd: 0.9 }, skills: ['taunt_shout', 'shield_wall'] },
  { id: 'tank_colossus', name: 'Colossus', role: 'tank', tags: ['TANK'], base: { maxHp: 1350, atk: 58, def: 28, moveSpeed: 110, attackRange: 42, attackCd: 1.0 }, skills: ['shield_wall'] },
  { id: 'healer_medic', name: 'Medic', role: 'healer', tags: ['HEALER'], base: { maxHp: 820, atk: 40, def: 12, moveSpeed: 125, attackRange: 120, attackCd: 1.05 }, skills: ['healing_wave', 'purify_light'] },
  { id: 'diver_assassin', name: 'Assassin', role: 'diver', tags: ['DIVER', 'BURST'], base: { maxHp: 900, atk: 88, def: 14, moveSpeed: 150, attackRange: 35, attackCd: 0.75 }, skills: ['dash_strike', 'rupture_blade'] },
  { id: 'sniper_ranger', name: 'Ranger', role: 'sniper', tags: ['SNIPER', 'BURST'], base: { maxHp: 780, atk: 95, def: 10, moveSpeed: 115, attackRange: 260, attackCd: 1.1 }, skills: ['snipe_round', 'suppress_shot'] },
  { id: 'aoe_mage', name: 'Mage', role: 'mage', tags: ['AOE'], base: { maxHp: 840, atk: 74, def: 11, moveSpeed: 118, attackRange: 180, attackCd: 1.0 }, skills: ['flame_burst', 'arcane_nova'] },
  { id: 'summoner_orb', name: 'Orbcaller', role: 'summoner', tags: ['SUMMON', 'AOE'], base: { maxHp: 860, atk: 62, def: 12, moveSpeed: 116, attackRange: 170, attackCd: 1.0 }, skills: ['summon_wisp', 'meteor_drop'] },
  { id: 'controller_warden', name: 'Warden', role: 'controller', tags: ['CC', 'TANK'], base: { maxHp: 1080, atk: 60, def: 22, moveSpeed: 117, attackRange: 60, attackCd: 0.95 }, skills: ['taunt_shout', 'suppress_shot'] }
];
