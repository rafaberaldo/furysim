class Weapon {
  constructor(weapon, player, isOffhand = false) {
    this.consts = {
      NORM_DAGGER_SPEED: 1.7,
      NORM_ONE_HAND_SPEED: 2.4,
      NORM_TWO_HAND_SPEED: 3.3,

      SWING_RESULT_TYPE_MISS: 'SWING_MISS',
      SWING_RESULT_TYPE_DODGE: 'SWING_DODGE',
      SWING_RESULT_TYPE_GLANCE: 'SWING_GLANCE',
      SWING_RESULT_TYPE_CRIT: 'SWING_CRIT',
      SWING_RESULT_TYPE_HIT: 'SWING_HIT'
    }
    this.consts = Object.freeze(this.consts)

    this.isOffhand = isOffhand
    this.wpnType = weapon.wpnType
    this.skill = weapon.skill
    this.dmgMin = weapon.dmgMin
    this.dmgMax = weapon.dmgMax
    this.speed = weapon.speed
    this.enchant = weapon.enchant

    this.player = player
    this.target = player.target

    // Initial offhand swing delay is 200-300 according to Magey
    // https://discordapp.com/channels/383596811517952002/582317222547030021/602887155840450560
    this.offhandSwingOffset = getRandom(0.2, 0.3)
    this.cooldown = new Cooldown(
      this.isOffhand ? 'Offhand' : 'Mainhand',
      this.speed / this.player.haste,
      this.isOffhand ? this.offhandSwingOffset : 0
    )
  }

  // Getters

  get critChance() {
    return this.player.crit + this.critSupp
  }

  get baseAttackRating() {
    return Math.min(this.player.lvl * 5, this.skill)
  }

  get skillDiff() {
    return this.target.defenseSkill - this.skill
  }

  get normalizedSpeed() {
    switch (this.wpnType) {
      case 'DAGGER': return this.consts.NORM_DAGGER_SPEED
      case 'ONE_HANDED': return this.consts.NORM_ONE_HAND_SPEED
      case 'TWO_HANDED': return this.consts.NORM_TWO_HAND_SPEED
      default: return this.consts.NORM_ONE_HAND_SPEED
    }
  }

  get dodgeChance() {
    return clamp(5 + this.skillDiff * 0.1)
  }

  get glanceChance() {
    return clamp(10 + (this.target.defenseSkill - this.baseAttackRating) * 2)
  }

  get critSupp() {
    const baseDiffSkill = this.baseAttackRating - this.target.defenseSkill
    const critSupp = baseDiffSkill < 0
      ? baseDiffSkill * 0.2
      : baseDiffSkill * 0.4

    return critSupp - 1.8
  }

  // https://github.com/magey/classic-warrior/wiki/Attack-table
  get attackTable() {
    const miss = clamp(this.getMissChance())
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
    return this.cooldown.canUse
  }

  get timeLeft() {
    return this.cooldown.timeLeft
  }

  // Methods

  tick(time, secs) {
    this.cooldown.tick(time, secs)
  }

  addFlurry() {
    this.cooldown.duration /= this.player.flurryHaste
    this.cooldown.timeLeft /= this.player.flurryHaste
  }

  removeFlurry() {
    this.cooldown.duration *= this.player.flurryHaste
    this.cooldown.timeLeft *= this.player.flurryHaste
  }

  getMissChance(isAuto = true) {
    // https://www.wowhead.com/news=292085/hit-cap-in-classic-wow-clarifications
    const gearHit = clamp(this.player.hit - (this.skillDiff > 10 ? 1 : 0))
    const baseMiss = 5 + this.skillDiff * (this.skillDiff > 10 ? 0.2 : 0.1)
    const actualMiss = this.player.isDw && isAuto ? (baseMiss * 0.8 + 20) : baseMiss
    return clamp(actualMiss - gearHit)
  }

  getDmg(plus = 0) {
    const weaponDmg = getRandom(this.dmgMin, this.dmgMax)
    let dmg = weaponDmg + (this.speed * this.player.ap / 14)
    dmg += plus
    if (this.isOffhand) dmg *= this.player.offhandDmgMul
    return dmg
  }

  // https://vanilla-wow.fandom.com/wiki/Normalization
  getNormalizedDmg(plus = 0) {
    const weaponDmg = getRandom(this.dmgMin, this.dmgMax)
    let dmg = weaponDmg + (this.normalizedSpeed * this.player.ap / 14)
    return dmg + plus
  }

  swing(time) {
    if (this.player.heroicStrike.isQueued && !this.isOffhand) {
      this.player.heroicStrike.isQueued = false
      if (this.player.heroicStrike.canUse) {
        this.player.heroicStrike.use(time)
        this.cooldown.reset()
        // Heroic strike consumes Flurry charges after patch 1.13.3
        if (this.player.flurry.isActive) this.player.flurry.useCharge(time)
        return
      }
    }

    const roll = Math.random() * 100
    let dmg = this.getDmg() * this.player.dmgMul * this.target.armorMitigationMul
    let type = null

    // Flurry consume charges even on misses
    if (this.player.flurry.isActive) this.player.flurry.useCharge(time)

    // Heroic strike "bug"
    // https://us.forums.blizzard.com/en/wow/t/off-hand-swings-with-hs-cleave-queued-dont-suffer-dw-miss-penalty/309417/7
    const canMiss = !(this.player.heroicStrike.isQueued && this.isOffhand)

    if (roll <= this.attackTable.miss && canMiss) {
      dmg = null
      type = this.consts.SWING_RESULT_TYPE_MISS
      this.player.log.miss++

    } else if (roll <= this.attackTable.dodge) {
      type = this.consts.SWING_RESULT_TYPE_DODGE
      this.player.rage.gainFromDodge(dmg)
      dmg = 0
      this.player.log.dodge++

    } else if (roll <= this.attackTable.glance) {
      dmg *= this.glancePenaltyMul
      type = this.consts.SWING_RESULT_TYPE_GLANCE
      this.player.log.glance++

    } else if (roll <= this.attackTable.crit) {
      dmg *= 2
      type = this.consts.SWING_RESULT_TYPE_CRIT
      this.player.flurry.apply(time)
      this.player.log.crit++

    } else {
      type = this.consts.SWING_RESULT_TYPE_HIT
      this.player.log.hit++
    }

    this.cooldown.use()
    this.player.rage.gainFromSwing(dmg)

    dmg = dmg && Math.floor(dmg)
    this.player.log.totalDmg += dmg
    this.player.addTimeline(time, this.cooldown.name, type, dmg)
  }
}
