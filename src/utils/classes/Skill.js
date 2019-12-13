import { Cooldown, CooldownGCD } from './Cooldown'

import { clamp } from '../helpers'

export default class Skill {
  constructor(name, cost, cooldown, triggerGcd, player) {
    this.consts = {
      SKILL_RESULT_TYPE_MISS: 'SKILL_MISS',
      SKILL_RESULT_TYPE_DODGE: 'SKILL_DODGE',
      SKILL_RESULT_TYPE_CRIT: 'SKILL_CRIT',
      SKILL_RESULT_TYPE_HIT: 'SKILL_HIT'
    }
    this.consts = Object.freeze(this.consts)

    this.cost = cost
    this.cooldown = triggerGcd
      ? new CooldownGCD(name, cooldown, 0, player)
      : new Cooldown(name, cooldown)

    // WW and Cleve do not refund
    // https://github.com/magey/classic-warrior/issues/27
    // TODO confirm miss refund is 80%
    this.missRefundMul = (name === 'Whirlwind' || name === 'Cleave') ? 1 : 0.2

    this.player = player
    this.target = player.target
  }

  // Getters

  // Skills are two-rolls system
  get attackTable() {
    const miss = clamp(this.player.mainhand.getMissChance(false))
    const dodge = clamp(miss + this.player.mainhand.dodgeChance)
    return { miss, dodge }
  }

  get dmg() {
    throw new Error('Base class, not implemented.')
  }

  get canUse() {
    return this.player.rage.has(this.cost) && this.cooldown.canUse
  }

  // Methods

  use(tick) {
    const roll = Math.random() * 100
    let dmg = null
    let type = null

    if (roll <= this.attackTable.miss) {
      type = this.consts.SKILL_RESULT_TYPE_MISS
      this.player.rage.use(this.cost * this.missRefundMul)
      this.player.log.skillMiss++

    } else if (roll <= this.attackTable.dodge) {
      type = this.consts.SKILL_RESULT_TYPE_DODGE
      this.player.log.skillDodge++
      this.player.rage.use(this.cost * this.missRefundMul)

    } else {
      dmg = this.dmg * this.player.dmgMul * this.target.armorMitigationMul
      const roll2 = Math.random() * 100
      this.player.rage.use(this.cost)

      if (roll2 <= this.player.mainhand.critChance) {
        dmg *= this.player.skillCritMul
        type = this.consts.SKILL_RESULT_TYPE_CRIT
        this.player.log.skillCrit++

      } else {
        type = this.consts.SKILL_RESULT_TYPE_HIT
        this.player.log.skillHit++
      }
    }

    this.cooldown.use()

    dmg = dmg && Math.floor(dmg)
    this.player.log.totalDmg += dmg
    this.player.addTimeline(tick, this.cooldown.name, type, dmg)
  }
}
