class Skill {
  constructor(name, cost, cooldown, triggerGcd, useWhen, player) {
    this.consts = {
      SKILL_RESULT_MISS: 'SKILL_MISS',
      SKILL_RESULT_DODGE: 'SKILL_DODGE',
      SKILL_RESULT_CRIT: 'SKILL_CRIT',
      SKILL_RESULT_HIT: 'SKILL_HIT'
    }
    this.consts = Object.freeze(this.consts)

    this.name = name
    this.cost = cost
    this.useWhen = useWhen
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
    const miss = clamp(this.player.mainhand.skillMissChance)
    const dodge = clamp(miss + this.player.mainhand.dodgeChance)
    return { miss, dodge }
  }

  get dmg() {
    throw new Error('Base class, not implemented.')
  }

  get canUse() {
    return this.player.rage.has(this.cost)
  }

  get normTimeLeft() {
    return this.cooldown.normTimeLeft
  }

  // Methods

  tick(secs) {
    this.cooldown.tick(secs)
  }

  getSkillResult() {
    const roll = Math.random() * 100
    if (roll <= this.attackTable.miss) return this.consts.SKILL_RESULT_MISS
    if (roll <= this.attackTable.dodge) return this.consts.SKILL_RESULT_DODGE

    const roll2 = Math.random() * 100
    if (roll2 <= this.player.mainhand.critChance) return this.consts.SKILL_RESULT_CRIT
    return this.consts.SKILL_RESULT_HIT
  }

  use() {
    if (!this.canUse) {
      throw new Error(`Trying to use ${this.name} when can't use.`)
    }

    this.cooldown.use()

    const result = this.getSkillResult()

    if (result === this.consts.SKILL_RESULT_MISS) {
      this.player.rage.use(m.round(this.cost * this.missRefundMul))
      this.player.log.skillMiss++
      this.player.addTimeline(this.name, result)
      return
    }

    if (result === this.consts.SKILL_RESULT_DODGE) {
      this.player.rage.use(m.round(this.cost * this.missRefundMul))
      this.player.log.skillDodge++
      this.player.addTimeline(this.name, result)
      return
    }

    let dmg = this.dmg * this.player.dmgMul * this.target.armorMitigationMul

    if (result === this.consts.SKILL_RESULT_CRIT) {
      dmg *= this.player.skillCritMul
      this.player.flurry.apply()
      this.player.log.skillCrit++
    }

    if (result === this.consts.SKILL_RESULT_HIT) {
      this.player.log.skillHit++
    }

    dmg = m.round(dmg)
    this.player.rage.use(this.cost)
    this.player.log.totalDmg += dmg

    this.player.addTimeline(this.name, result, dmg)

    this.player.mainhand.testProcs()
  }
}
