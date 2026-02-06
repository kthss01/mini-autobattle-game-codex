/** @type {const} */
export const TAGS = ['TANK', 'HEALER', 'DIVER', 'SNIPER', 'AOE', 'BURST', 'CC', 'SUMMON'];

/** @type {import('../types.js').TagModifier[]} */
export const TAG_MODIFIERS = [
  { fromTag: 'DIVER', toTag: 'SNIPER', damageMul: 1.15 },
  { fromTag: 'AOE', toTag: 'SUMMON', damageMul: 1.2 },
  { fromTag: 'BURST', toTag: 'HEALER', damageMul: 1.1 },
  { fromTag: 'TANK', toTag: 'BURST', damageMul: 0.9 },
  { fromTag: 'SNIPER', toTag: 'TANK', damageMul: 0.92 },
  { fromTag: 'CC', toTag: 'DIVER', damageMul: 1.05 }
];
