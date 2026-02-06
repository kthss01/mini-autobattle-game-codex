/**
 * @typedef {('TANK'|'HEALER'|'DIVER'|'SNIPER'|'AOE'|'BURST'|'CC'|'SUMMON')} Tag
 */

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
 */

/**
 * @typedef {('DAMAGE'|'HEAL'|'SHIELD'|'STUN'|'SLOW')} EffectKind
 */

/**
 * @typedef {Object} SkillEffect
 * @property {EffectKind} kind
 * @property {number} [value]
 * @property {number} [duration]
 */

/**
 * @typedef {Object} SkillShape
 * @property {'CIRCLE'|'LINE'|'CONE'} kind
 * @property {number} [radius]
 * @property {number} [width]
 * @property {number} [length]
 */

/**
 * @typedef {Object} SkillDef
 * @property {string} id
 * @property {string} name
 * @property {number} cooldown
 * @property {number} range
 * @property {number} castTime
 * @property {'SELF'|'ALLY'|'ENEMY'|'POINT'} target
 * @property {SkillShape} shape
 * @property {SkillEffect[]} effects
 * @property {{priorityBase:number, useWhen:string}} aiHint
 */

/**
 * @typedef {Object} TeamUnitInput
 * @property {string} championId
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
