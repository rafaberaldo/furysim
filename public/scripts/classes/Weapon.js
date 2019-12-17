class Weapon {
  constructor(weapon, player, isOffhand = false) {
    this.consts = {
      NORM_DAGGER_SPEED: 1.7,
      NORM_ONE_HAND_SPEED: 2.4,
      NORM_TWO_HAND_SPEED: 3.3,

      SWING_RESULT_MISS: 'SWING_MISS',
      SWING_RESULT_DODGE: 'SWING_DODGE',
      SWING_RESULT_GLANCE: 'SWING_GLANCE',
      SWING_RESULT_CRIT: 'SWING_CRIT',
      SWING_RESULT_HIT: 'SWING_HIT'
    }
    this.consts = Object.freeze(this.consts)

    this.name = isOffhand ? 'Offhand' : 'Mainhand'
    this.isOffhand = isOffhand
    this.type = weapon.type
    this.skill = weapon.skill
    this.dmgMin = weapon.dmgMin
    this.dmgMax = weapon.dmgMax
    this.speed = weapon.speed

    this.player = player
    this.target = player.target

    // Initial offhand swing delay is 200-300 according to Magey
    // https://discordapp.com/channels/383596811517952002/582317222547030021/602887155840450560
    this.offhandSwingOffset = getRandom(0.2, 0.3)
    this.swingTimer = new AttackSpeed(
      this.name,
      this.speed / this.player.haste,
      this.isOffhand ? this.offhandSwingOffset : 0
    )
    this.enchant = weapon.enchant && new Aura(
      `Crusader ${this.name}`, 15, 1, this.speed, this.player
    )
  }

  // Getters

  get dmg() {
    const weaponDmg = getRandom(this.dmgMin, this.dmgMax)
    let dmg = weaponDmg + (this.speed * this.player.ap / 14)
    if (this.isOffhand) dmg *= this.player.offhandDmgMul
    return dmg
  }

  get avgDmg() {
    const weaponDmg = m.round((this.dmgMin + this.dmgMax) / 2)
    let dmg = weaponDmg + (this.speed * this.player.ap / 14)
    if (this.isOffhand) dmg *= this.player.offhandDmgMul
    return dmg
  }

  // https://vanilla-wow.fandom.com/wiki/Normalization
  get normalizedDmg() {
    const weaponDmg = getRandom(this.dmgMin, this.dmgMax)
    let dmg = weaponDmg + (this.normalizedSpeed * this.player.ap / 14)
    return dmg
  }

  get baseAttackRating() {
    return m.min(this.player.lvl * 5, this.skill)
  }

  get skillDiff() {
    return this.target.defenseSkill - this.skill
  }

  get normalizedSpeed() {
    switch (this.type) {
      case 'DAGGER': return this.consts.NORM_DAGGER_SPEED
      case 'ONE_HANDED': return this.consts.NORM_ONE_HAND_SPEED
      case 'TWO_HANDED': return this.consts.NORM_TWO_HAND_SPEED
      default: return this.consts.NORM_ONE_HAND_SPEED
    }
  }

  // Offhand attacks that occur while on-next-hit abilities such as
  // Heroic Strike are queued do not suffer the dual wield to-hit penalty.
  // https://us.forums.blizzard.com/en/wow/t/wow-classic-not-a-bug-list-updated-12-13-2019/175887
  get missChance() {
    if (this.player.heroicStrike.isQueued && this.isOffhand) return 0
    return this.getMissChance(true)
  }

  get skillMissChance() {
    return this.getMissChance(false)
  }

  get dodgeChance() {
    return clamp(5 + this.skillDiff * 0.1)
  }

  get glanceChance() {
    return clamp(10 + (this.target.defenseSkill - this.baseAttackRating) * 2)
  }

  // https://github.com/magey/classic-warrior/wiki/Crit-aura-suppression
  get critSupp() {
    const baseDiffSkill = this.baseAttackRating - this.target.defenseSkill
    const critSupp = baseDiffSkill < 0
      ? baseDiffSkill * 0.2
      : baseDiffSkill * 0.4

    return critSupp - 1.8
  }

  get critChance() {
    return clamp(this.player.crit + this.critSupp)
  }

  // https://github.com/magey/classic-warrior/wiki/Attack-table
  get attackTable() {
    const miss = clamp(this.missChance)
    const dodge = clamp(miss + this.dodgeChance)
    const glance = clamp(dodge + this.glanceChance)
    const crit = clamp(glance + this.critChance)
    return { miss, dodge, glance, crit }
  }

  get glancePenaltyMul() {
    const glancePenaltyLow = clamp(1.3 - 0.05 * this.skillDiff, 0.01, 0.91)
    const glancePenaltyHigh = clamp(1.2 - 0.03 * this.skillDiff, 0.2, 0.99)
    return (glancePenaltyLow + glancePenaltyHigh) / 2
  }

  get canUse() {
    return this.swingTimer.canUse
  }

  get normTimeLeft() {
    return this.swingTimer.normTimeLeft
  }

  get isHeroicStrikeReplacing() {
    if (this.isOffhand) return
    if (!this.player.heroicStrike.isQueued) return

    this.player.heroicStrike.isQueued = false
    if (!this.player.heroicStrike.canUse) return

    this.player.heroicStrike.use()
    return true
  }

  // Methods

  tick(secs) {
    this.swingTimer.tick(secs)
    this.enchant && this.enchant.tick(secs)
  }

  getMissChance(isSwing = true) {
    // https://www.wowhead.com/news=292085/hit-cap-in-classic-wow-clarifications
    const gearHit = clamp(this.player.hit - (this.skillDiff > 10 ? 1 : 0))
    const baseMiss = 5 + this.skillDiff * (this.skillDiff > 10 ? 0.2 : 0.1)
    const actualMiss = this.player.isDw && isSwing ? (baseMiss * 0.8 + 20) : baseMiss
    return clamp(actualMiss - gearHit)
  }

  getSwingResult() {
    const roll = Math.random() * 100
    if (roll <= this.attackTable.miss) return this.consts.SWING_RESULT_MISS
    if (roll <= this.attackTable.dodge) return this.consts.SWING_RESULT_DODGE
    if (roll <= this.attackTable.glance) return this.consts.SWING_RESULT_GLANCE
    if (roll <= this.attackTable.crit) return this.consts.SWING_RESULT_CRIT
    return this.consts.SWING_RESULT_HIT
  }

  testProcs() {
    this.enchant && this.enchant.tryToProc()
    this.player.hoj && this.player.hoj.tryToProc()

    if (this.isOffhand) return
    this.player.windfury && this.player.windfury.tryToProc()
  }

  swing() {
    this.swingTimer.restart()

    this.player.flurry && this.player.flurry.useCharge()

    if (this.isHeroicStrikeReplacing) return

    const result = this.getSwingResult()

    if (result === this.consts.SWING_RESULT_MISS) {
      this.player.log.miss++
      this.player.addTimeline(this.name, result)
      return
    }

    if (result === this.consts.SWING_RESULT_DODGE) {
      // TODO confirm rage gain from dodge
      this.player.rage.gainFromSwing(this.avgDmg)
      this.player.log.dodge++
      this.player.addTimeline(this.name, result)
      return
    }

    let dmg = this.dmg * this.player.dmgMul * this.target.armorMitigationMul

    if (result === this.consts.SWING_RESULT_GLANCE) {
      dmg *= this.glancePenaltyMul
      this.player.log.glance++
    }

    if (result === this.consts.SWING_RESULT_CRIT) {
      dmg *= 2
      this.player.flurry.apply()
      this.player.log.crit++
    }

    if (result === this.consts.SWING_RESULT_HIT) {
      this.player.log.hit++
    }

    dmg = m.round(dmg)
    this.player.rage.gainFromSwing(dmg)
    this.player.log.totalDmg += dmg
    this.player.addTimeline(this.name, result, dmg)

    // Test procs before consuming a WF charge.
    // If it procs a charge is consumed instantly.
    this.testProcs(result)

    // TODO WF consume charge on misses?
    this.player.windfury && this.player.windfury.useCharge()
  }
}
