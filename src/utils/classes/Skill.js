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

    // TODO confirm miss refund is 80%
    this.missRefundMul = 0.2

    this.player = player
  }

  // Getters

  // Skills are two-rolls system
  // https://vanilla-wow.fandom.com/wiki/Attack_table
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
    let dmg = 0
    let type = null

    if (roll <= this.attackTable.miss) {
      type = this.consts.SKILL_RESULT_TYPE_MISS
      this.player.log.skillMiss++
      this.player.rage.use(this.cost * this.missRefundMul)

    } else if (roll <= this.attackTable.dodge) {
      type = this.consts.SKILL_RESULT_TYPE_DODGE
      this.player.log.skillDodge++
      this.player.rage.use(this.cost * this.missRefundMul)

    } else {
      const roll2 = Math.random() * 100
      this.player.rage.use(this.cost)

      if (roll2 <= this.player.mainhand.critChance) {
        dmg = Math.floor(this.dmg * this.player.skillCritMul * this.player.target.armorMitigationMul)
        type = this.consts.SKILL_RESULT_TYPE_CRIT
        this.player.log.skillCrit++

      } else {
        dmg = Math.floor(this.dmg * this.player.target.armorMitigationMul)
        type = this.consts.SKILL_RESULT_TYPE_HIT
        this.player.log.skillHit++
      }
    }

    this.cooldown.use()

    this.player.log.totalDmg += dmg
    this.player.addTimeline(tick, this.cooldown.name, type, dmg)
  }
}
