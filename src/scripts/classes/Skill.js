import { Cooldown, CooldownGCD } from '@/scripts/classes/Cooldown'

import { m, clamp } from '@/scripts/helpers'

export default class Skill {
  constructor(name, cost, cooldown, triggerGcd, player, useWhen) {
    this.consts = {
      SKILL_RESULT_MISS: 'SKILL_MISS',
      SKILL_RESULT_DODGE: 'SKILL_DODGE',
      SKILL_RESULT_CRIT: 'SKILL_CRIT',
      SKILL_RESULT_HIT: 'SKILL_HIT'
    }
    this.consts = Object.freeze(this.consts)

    this.log = player.log.set(name)
    this.name = name
    this.cost = cost
    this.useWhen = useWhen
    this.isPlayerInput = true
    this.cooldown = triggerGcd
      ? new CooldownGCD(name, cooldown, 0, player)
      : new Cooldown(name, cooldown)

    // NC: Miss refund is 80%
    this.missRefundMul = 1 - 0.8

    this.player = player
    this.target = player.target
  }

  // Getters

  get attackTable() {
    const miss = clamp(this.player.mainhand.skillMissChance)
    const dodge = clamp(miss + this.player.mainhand.dodgeChance)
    return { miss, dodge }
  }

  get dmg() {
    throw new Error('Base class, not implemented.')
  }

  get canUse() {
    if (!this.player.rage.has(this.cost)) return false
    if (this.player.slam && this.player.slam.isCasting) return false

    return true
  }

  get timeLeft() {
    return this.cooldown.timeLeft
  }

  get onCooldown() {
    return this.cooldown.onCooldown
  }

  // Methods

  tick(secs) {
    this.cooldown.tick(secs)
  }

  // Skills are two-rolls system
  getSkillResult() {
    const roll = m.random() * 100
    if (roll <= this.attackTable.miss) return this.consts.SKILL_RESULT_MISS
    if (roll <= this.attackTable.dodge) return this.consts.SKILL_RESULT_DODGE

    const roll2 = m.random() * 100
    if (roll2 <= this.player.mainhand.critChance) return this.consts.SKILL_RESULT_CRIT
    return this.consts.SKILL_RESULT_HIT
  }

  isResultMiss(result) {
    [this.consts.SKILL_RESULT_MISS,
    this.consts.SKILL_RESULT_DODGE].indexOf(result) > -1
  }

  use(isExtra = false) {
    if (!this.canUse) {
      throw new Error(`Trying to use ${this.name} when can't use.`)
    }

    if (this.name !== 'Slam') this.cooldown.use()
    this.log.count++

    const result = this.getSkillResult()

    if (result === this.consts.SKILL_RESULT_MISS) {
      this.log.miss++
      this.player.rage.use(this.cost * this.missRefundMul)
      this.player.addTimeline(this.name, result)
      return result
    }

    if (result === this.consts.SKILL_RESULT_DODGE) {
      this.log.dodge++
      this.player.rage.use(this.cost * this.missRefundMul)
      this.player.addTimeline(this.name, result)
      return result
    }

    let dmg = this.dmg * this.player.dmgMul * this.target.armorMitigationMul

    if (result === this.consts.SKILL_RESULT_CRIT) {
      dmg *= this.player.skillCritMul
      this.log.crit++
      this.player.flurry && this.player.flurry.apply()
    }

    if (result === this.consts.SKILL_RESULT_HIT) this.log.hit++

    dmg = m.round(dmg)
    this.player.rage.use(this.cost)
    this.log.dmg += dmg

    this.player.addTimeline(this.name, result, dmg)

    if (this.player.mainhand.tryProcs() && isExtra) this.player.mainhand.log.chain++

    return result
  }
}
