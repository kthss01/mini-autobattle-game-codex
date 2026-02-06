export const TAG_MODIFIERS = [
  { fromTag: 'DIVER', toTag: 'SNIPER', damageMul: 1.15 },
  { fromTag: 'AOE', toTag: 'SUMMON', damageMul: 1.2 },
  { fromTag: 'BURST', toTag: 'HEALER', damageMul: 1.1 },
  { fromTag: 'TANK', toTag: 'BURST', damageMul: 0.9 }
];

export const TEAM_SYNERGIES = [
  {
    id: 'balanced',
    requires: [
      { tag: 'TANK', count: 1 },
      { tag: 'HEALER', count: 1 }
    ],
    bonus: { kind: 'MAX_HP_MUL', value: 0.05 }
  }
];
