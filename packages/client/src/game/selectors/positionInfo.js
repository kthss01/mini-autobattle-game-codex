import { CHAMPIONS, SKILLS, UNIT_ROLES } from '@autobattle/sim';

const CHAMPIONS_BY_ID = Object.fromEntries(CHAMPIONS.map((champion) => [champion.id, champion]));
const SKILLS_BY_ID = Object.fromEntries(SKILLS.map((skill) => [skill.id, skill]));

const ROLE_LABELS = Object.freeze({
  [UNIT_ROLES.TANK]: 'Tank',
  [UNIT_ROLES.HEALER]: 'Healer',
  [UNIT_ROLES.DPS]: 'DPS',
  [UNIT_ROLES.SUPPORT]: 'Support'
});

const POSITION_RECOMMENDED_ROLES = Object.freeze({
  0: [UNIT_ROLES.TANK, UNIT_ROLES.SUPPORT],
  1: [UNIT_ROLES.DPS, UNIT_ROLES.TANK],
  2: [UNIT_ROLES.HEALER, UNIT_ROLES.SUPPORT],
  3: [UNIT_ROLES.DPS, UNIT_ROLES.HEALER]
});

const POSITION_LABELS = Object.freeze({
  0: 'Frontline',
  1: 'Skirmisher',
  2: 'Backline Utility',
  3: 'Backline Carry'
});

function toRoleLabel(role) {
  return ROLE_LABELS[role] ?? role;
}

function summarizeEffect(effect) {
  switch (effect.kind) {
    case 'DAMAGE':
      return `Damage ${effect.amount}`;
    case 'HEAL':
      return `Heal ${effect.amount}`;
    case 'STUN':
      return `Stun ${effect.duration}s`;
    case 'SHIELD':
      return `Shield ${effect.amount} (${effect.duration}s)`;
    case 'SLOW':
      return `Slow ${Math.round(effect.ratio * 100)}% (${effect.duration}s)`;
    case 'SUMMON':
      return `Summon ${effect.count} ${effect.unitId} (${effect.duration}s)`;
    case 'LIFESTEAL':
      return `Lifesteal ${Math.round(effect.ratio * 100)}%`;
    default:
      return effect.kind;
  }
}

function summarizeSkills(skillIds = []) {
  if (!skillIds.length) return 'No active skills';
  return skillIds
    .map((skillId) => {
      const skill = SKILLS_BY_ID[skillId];
      if (!skill) return null;
      const effects = skill.effects.map(summarizeEffect).join(', ');
      return `${skill.name}: ${effects}`;
    })
    .filter(Boolean)
    .join(' | ');
}

/**
 * @param {{
 *  position: number,
 *  championId?: string,
 *  slot?: { slotIndex: number, championId?: string }
 * }} input
 */
export function selectPositionInfo(input) {
  const slot = input.slot ?? null;
  const position = Number.isInteger(input.position) ? input.position : slot?.slotIndex;
  const championId = input.championId ?? slot?.championId;
  const champion = championId ? CHAMPIONS_BY_ID[championId] : null;

  const recommendedRoles = POSITION_RECOMMENDED_ROLES[position] ?? [UNIT_ROLES.DPS, UNIT_ROLES.SUPPORT];

  return {
    position,
    positionLabel: POSITION_LABELS[position] ?? `Slot ${position ?? '-'}`,
    recommendedRoles: recommendedRoles.map(toRoleLabel),
    assignedChampion: champion
      ? {
          id: champion.id,
          name: champion.name,
          role: toRoleLabel(champion.role)
        }
      : null,
    coreStats: champion
      ? {
          hp: champion.base.maxHp,
          attack: champion.base.atk,
          range: champion.base.attackRange,
          attackSpeed: Number((1 / champion.base.attackCd).toFixed(2))
        }
      : null,
    skillSummary: champion ? summarizeSkills(champion.skills) : 'Assign a champion to see skills'
  };
}
