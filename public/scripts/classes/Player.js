class Player {
  constructor(cfg) {
    this._str = cfg.player.str
    this.lvl = cfg.player.lvl
    this.gearAp = cfg.player.gearAp
    this.buffAp = cfg.player.buffAp
    this.hit = cfg.player.hit
    this.haste = 1 + cfg.player.haste / 100
    this.crit = cfg.player.crit

    this.debug = cfg.debug || false
    this.latency = cfg.latency

    this.target = new Target(cfg.target, cfg.player)
    this.mainhand = new Weapon(cfg.mainhand, this)
    this.offhand = cfg.offhand ? new Weapon(cfg.offhand, this, true) : null
    this.isDw = !!this.offhand
    this.rage = new Rage(this)
    this.windfury = cfg.player.wf && new Windfury(this)
    this.windfuryApMul = cfg.player.improvedWf ? 1.3 : 1
    this.hoj = cfg.player.hoj && new HandOfJustice(this)

    // Talents
    const talents = parseTalents()
    this.heroicCost = 15 - talents.improvedHS
    this.skillCritMul = 2 + talents.impale * 0.1
    this.weaponSpecDmgMul = this.isDw ? 1 : (1 + talents.twoHandSpec * 0.01)
    this.offhandDmgMul = 0.5 + talents.dualWieldSpec * 0.025
    this.flurryHaste = 1 + (talents.flurry && (talents.flurry + 1) * 0.05) || 0
    this.angerManagement = talents.angerManagement ? new AngerManagement(this) : null
    this.extraRageChance = talents.unbridledWrath * 0.08
    this.slamCast = 1.5 - talents.improvedSlam * 0.1
    this.executeCost = 15 - (talents.impExecute && talents.impExecute * 3 - 1) || 0
    this.battleShoutDuration = 120 * (1 + talents.boomingVoice * 0.1)
    this.battleShoutApMul = 1 + talents.improvedBS * 0.05

    this.gcd = new Cooldown('GCD', 1.5)
    this.bloodrage = new Bloodrage(this, cfg.bloodrage)
    this.heroicStrike = new HeroicStrike(this, cfg.heroicStrike)
    this.whirlwind = new Whirlwind(this, cfg.whirlwind)
    this.battleShout = new Buff('Battle Shout', 10, this.battleShoutDuration, 0, true, this)
    this.bloodFury = cfg.player.bloodFury && new BloodFury(this, cfg.bloodFury)
    this.flurry = talents.flurry && new Flurry(this)
    this.bloodthirst = talents.bloodthirst && new Bloodthirst(this)
    this.deathWish = talents.deathWish &&
      new Buff('Death Wish', 10, 30, 180, true, this, cfg.deathWish.timeLeft)
    this.mrp = new MightyRagePotion(this, cfg.mrp)

    this.log = {
      timeline: [],
      totalDmg: 0,
      miss: 0,
      dodge: 0,
      glance: 0,
      crit: 0,
      hit: 0,
      skillMiss: 0,
      skillDodge: 0,
      skillCrit: 0,
      skillHit: 0
    }
  }

  // Setters

  set time(value) {
    this._time = Number(value.toFixed(3))
  }

  // Getters

  get time() {
    return this._time
  }

  get dmgMul() {
    if (this.deathWish && this.deathWish.isActive) return this.weaponSpecDmgMul * 1.2

    return this.weaponSpecDmgMul
  }

  get str() {
    let str = this._str

    // Crusader / Holy Strength
    if (this.mainhand.enchant && this.mainhand.enchant.isActive) str += 100
    if (this.offhand.enchant && this.offhand.enchant.isActive) str += 100
    if (this.mrp && this.mrp.isActive) str += 60

    return str
  }

  get ap() {
    const baseAp = (this.lvl * 3 - 20) + this.str * 2
    let ap = baseAp + this.gearAp + this.buffAp

    if (this.battleShout.isActive) ap += this.battleShoutApMul * 193
    if (this.bloodFury && this.bloodFury.isActive) ap += baseAp * 0.25
    if (this.windfury && this.windfury.isActive) ap += 315 * this.windfuryApMul

    return m.round(ap)
  }

  get hasCrusaderProc() {
    return this.mainhand.enchant && this.mainhand.enchant.isActive ||
      this.offhand.enchant && this.offhand.enchant.isActive
  }

  get isDeathWishActive() {
    return this.deathWish ? this.deathWish.isActive : true
  }

  // Methods

  increaseAtkSpeed(percent) {
    this.mainhand.swingTimer.increaseAtkSpeed(percent)
    this.isDw && this.offhand.swingTimer.increaseAtkSpeed(percent)
  }

  decreaseAtkSpeed(percent) {
    this.mainhand.swingTimer.decreaseAtkSpeed(percent)
    this.isDw && this.offhand.swingTimer.decreaseAtkSpeed(percent)
  }

  checkBtCd(min) {
    return this.bloodthirst
      ? this.bloodthirst.cooldown.normTimeLeft >= min
      : true
  }

  getDps(duration) {
    if (duration <= 0) return
    return this.log.totalDmg / duration
  }

  addTimeline(name, type, value = null) {
    this.log.timeline.push(
      `${this.time}: ${name} ${type} for ${value} (${this.rage.current} rage)`
    )
    if (!this.debug) return

    !value
      ? console.log(
        this.time, ':', name, type, '(', this.rage.current, 'rage', this.ap, 'ap )'
      )
      : console.log(
        this.time, ':', name, type, 'for', value,
        '(', this.rage.current, 'rage', this.ap, 'ap )'
      )
  }
}
