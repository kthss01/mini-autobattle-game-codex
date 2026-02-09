/** @typedef {('TANK'|'HEALER'|'DIVER'|'SNIPER'|'AOE'|'BURST'|'CC'|'SUMMON')} Tag */

/**
 * @typedef {Object} BaseStats
 * @property {number} maxHp
 * @property {number} atk
 * @property {number} def
 * @property {number} moveSpeed
 * @property {number} attackRange
 * @property {number} attackCd
 */

/**
 * @typedef {Object} ChampionDef
 * @property {string} id
 * @property {string} name
 * @property {string} role
 * @property {Tag[]} tags
 * @property {BaseStats} base
 * @property {string[]} skills
 * @property {boolean} [isMinion]
 */

/** @typedef {('DAMAGE'|'HEAL'|'SHIELD'|'STUN'|'SLOW'|'SUMMON'|'LIFESTEAL')} EffectKind */
/** @typedef {('SINGLE'|'CIRCLE'|'LINE'|'CONE')} SkillShapeKind */
/** @typedef {('SELF'|'ALLY'|'ENEMY'|'POINT')} SkillTarget */

/**
 * @typedef {Object} SkillShape
 * @property {SkillShapeKind} kind
 * @property {number} [radius]
 * @property {number} [width]
 * @property {number} [length]
 */

/**
 * @typedef {Object} SkillEffect
 * @property {EffectKind} kind
 * @property {number} [amount]
 * @property {number} [ratio]
 * @property {number} [duration]
 * @property {number} [count]
 * @property {string} [unitId]
 */

/**
 * @typedef {Object} SkillDef
 * @property {string} id
 * @property {string} name
 * @property {number} cooldown
 * @property {number} range
 * @property {number} castTime
 * @property {SkillTarget} target
 * @property {SkillShape} shape
 * @property {SkillEffect[]} effects
 * @property {{priorityBase:number, useWhen:string}} aiHint
 */

/**
 * @typedef {Object} TagModifier
 * @property {Tag} fromTag
 * @property {Tag} toTag
 * @property {number} [damageMul]
 * @property {number} [healMul]
 */

/** @typedef {('MAX_HP_MUL'|'DAMAGE_MUL')} TeamSynergyBonusKind */

/**
 * @typedef {Object} TeamSynergyRequirement
 * @property {Tag} tag
 * @property {number} count
 */

/**
 * @typedef {Object} TeamSynergyDef
 * @property {string} id
 * @property {string} name
 * @property {TeamSynergyRequirement[]} requires
 * @property {{kind: TeamSynergyBonusKind, value: number}} bonus
 */

/**
 * @typedef {Object} TeamUnitInput
 * @property {string} championId
 * @property {number} [slotId]
 * @property {number} [lane]
 * @property {number} [row]
 * @property {number} [col]
 * @property {number} [slotIndex]
 */

/**
 * @typedef {Object} TeamInput
 * @property {string} name
 * @property {TeamUnitInput[]} units
 */

/**
 * @typedef {Object} MatchOptions
 * @property {number} [seed]
 * @property {number} [durationSec]
 * @property {boolean} [respawn]
 */
