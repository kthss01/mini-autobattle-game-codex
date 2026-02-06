/** @type {import('../types.js').TeamSynergyDef[]} */
export const TEAM_SYNERGIES = [
  {
    id: 'balanced_core',
    name: 'Balanced Core',
    requires: [
      { tag: 'TANK', count: 1 },
      { tag: 'HEALER', count: 1 }
    ],
    bonus: { kind: 'MAX_HP_MUL', value: 0.05 }
  },
  {
    id: 'cc_chain',
    name: 'CC Chain',
    requires: [{ tag: 'CC', count: 2 }],
    bonus: { kind: 'DAMAGE_MUL', value: 0.05 }
  },
  {
    id: 'double_diver',
    name: 'Double Diver',
    requires: [{ tag: 'DIVER', count: 2 }],
    bonus: { kind: 'DAMAGE_MUL', value: 0.04 }
  },
  {
    id: 'spell_squad',
    name: 'Spell Squad',
    requires: [
      { tag: 'AOE', count: 1 },
      { tag: 'BURST', count: 1 }
    ],
    bonus: { kind: 'DAMAGE_MUL', value: 0.04 }
  }
];
