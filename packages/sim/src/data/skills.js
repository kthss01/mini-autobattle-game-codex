/** @type {import('../types.js').SkillDef[]} */
export const SKILLS = [
  {
    id: 'taunt_shout',
    name: 'Taunt Shout',
    cooldown: 8,
    range: 140,
    castTime: 0,
    target: 'POINT',
    shape: { kind: 'CIRCLE', radius: 90 },
    effects: [{ kind: 'STUN', duration: 0.55 }],
    aiHint: { priorityBase: 70, useWhen: 'CLUMP_ENEMIES' }
  },
  {
    id: 'shield_wall',
    name: 'Shield Wall',
    cooldown: 10,
    range: 0,
    castTime: 0,
    target: 'SELF',
    shape: { kind: 'SINGLE' },
    effects: [{ kind: 'SHIELD', amount: 220, duration: 3 }],
    aiHint: { priorityBase: 85, useWhen: 'LOW_HP_SELF' }
  },
  {
    id: 'quick_heal',
    name: 'Quick Heal',
    cooldown: 4.5,
    range: 220,
    castTime: 0,
    target: 'ALLY',
    shape: { kind: 'SINGLE' },
    effects: [{ kind: 'HEAL', amount: 140 }],
    aiHint: { priorityBase: 90, useWhen: 'LOW_HP_ALLY' }
  },
  {
    id: 'healing_wave',
    name: 'Healing Wave',
    cooldown: 9,
    range: 260,
    castTime: 0.2,
    target: 'POINT',
    shape: { kind: 'CIRCLE', radius: 110 },
    effects: [{ kind: 'HEAL', amount: 95 }],
    aiHint: { priorityBase: 78, useWhen: 'CLUMP_ENEMIES' }
  },
  {
    id: 'power_shot',
    name: 'Power Shot',
    cooldown: 7,
    range: 420,
    castTime: 0.15,
    target: 'ENEMY',
    shape: { kind: 'SINGLE' },
    effects: [{ kind: 'DAMAGE', amount: 170 }],
    aiHint: { priorityBase: 72, useWhen: 'ON_COOLDOWN' }
  },
  {
    id: 'rapid_fire',
    name: 'Rapid Fire',
    cooldown: 10,
    range: 0,
    castTime: 0,
    target: 'SELF',
    shape: { kind: 'SINGLE' },
    effects: [{ kind: 'SLOW', ratio: -0.2, duration: 3 }],
    aiHint: { priorityBase: 55, useWhen: 'ON_COOLDOWN' }
  },
  {
    id: 'dash_strike',
    name: 'Dash Strike',
    cooldown: 8.5,
    range: 260,
    castTime: 0,
    target: 'ENEMY',
    shape: { kind: 'SINGLE' },
    effects: [
      { kind: 'DAMAGE', amount: 120 },
      { kind: 'STUN', duration: 0.35 }
    ],
    aiHint: { priorityBase: 80, useWhen: 'ON_COOLDOWN' }
  },
  {
    id: 'smoke_screen',
    name: 'Smoke Screen',
    cooldown: 12,
    range: 0,
    castTime: 0,
    target: 'SELF',
    shape: { kind: 'CIRCLE', radius: 90 },
    effects: [{ kind: 'SHIELD', amount: 160, duration: 2.5 }],
    aiHint: { priorityBase: 75, useWhen: 'LOW_HP_SELF' }
  },
  {
    id: 'fire_orb',
    name: 'Fire Orb',
    cooldown: 7.5,
    range: 300,
    castTime: 0.2,
    target: 'POINT',
    shape: { kind: 'CIRCLE', radius: 105 },
    effects: [{ kind: 'DAMAGE', amount: 110 }],
    aiHint: { priorityBase: 76, useWhen: 'CLUMP_ENEMIES' }
  },
  {
    id: 'ice_nova',
    name: 'Ice Nova',
    cooldown: 9.5,
    range: 260,
    castTime: 0.15,
    target: 'POINT',
    shape: { kind: 'CIRCLE', radius: 120 },
    effects: [{ kind: 'SLOW', ratio: 0.35, duration: 2.2 }],
    aiHint: { priorityBase: 70, useWhen: 'CLUMP_ENEMIES' }
  },
  {
    id: 'summon_imps',
    name: 'Summon Imps',
    cooldown: 11,
    range: 200,
    castTime: 0.2,
    target: 'POINT',
    shape: { kind: 'CIRCLE', radius: 80 },
    effects: [{ kind: 'SUMMON', count: 2, unitId: 'imp_minion', duration: 12 }],
    aiHint: { priorityBase: 68, useWhen: 'ON_COOLDOWN' }
  },
  {
    id: 'drain_slash',
    name: 'Drain Slash',
    cooldown: 6.5,
    range: 80,
    castTime: 0,
    target: 'ENEMY',
    shape: { kind: 'SINGLE' },
    effects: [
      { kind: 'DAMAGE', amount: 120 },
      { kind: 'LIFESTEAL', ratio: 0.45 }
    ],
    aiHint: { priorityBase: 73, useWhen: 'ON_COOLDOWN' }
  }
];

export const SKILLS_BY_ID = Object.fromEntries(SKILLS.map((s) => [s.id, s]));
