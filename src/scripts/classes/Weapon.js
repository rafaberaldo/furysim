import Proc from '@/scripts/classes/Proc'
import AttackSpeed from '@/scripts/classes/Cooldowns/AttackSpeed'
import ExtraAttack from '@/scripts/classes/Cooldowns/ExtraAttack'

import { m, clamp, getRandomInt } from '@/scripts/helpers'

export default class Weapon {
  static NORM_SPEED = {
    DAGGER: 1.7,
    ONE_HANDED: 2.4,
    TWO_HANDED: 3.3
  }

  static RESULT = {
    MISS: 'SWING_MISS',
    DODGE: 'SWING_DODGE',
    GLANCE: 'SWING_GLANCE',
    CRIT: 'SWING_CRIT',
    HIT: 'SWING_HIT'
  }

  constructor(name, weapon, player) {
    this._proc = weapon.proc
    this.log = player.log.set(name)
    this.name = name
    this.isOffhand = name === 'Offhand'
    this.isMainhand = name === 'Mainhand'
    this.type = weapon.type
    this.skill = weapon.skill
    this.min = weapon.min
    this.max = weapon.max
    this.speed = weapon.speed
    this.enchant = weapon.enchant &&
      new Proc(`Crusader ${this.name}`, 15, { ppm: 1, speed: this.speed }, player)

    this.offhandDmgMul = 0.5 + player.talents.dualWieldSpec * 0.025

    // NC: Initial offhand swing start at 50%
    const hastedSpeed = this.speed / (1 + player.haste / 100)
    const swingOffset = this.isOffhand ? hastedSpeed * 0.5 : 0
    this.swingTimer = new AttackSpeed(this.name, hastedSpeed, swingOffset)

    this.player = player
    this.target = player.target
    this.windfury = player.windfury
  }

  // Getters

  get proc() {
    const getProc = () => {
      if (this._proc.type === 'extraAttack') {
        return new ExtraAttack(
          `${this.name} Proc`,
          this._proc.chance,
          this._proc.amount,
          true,
          this.player,
          this._proc
        )
      }

      if (this._proc.type === 'atkSpeed') {
        const proc = new Proc(
          `${this.name} Proc`,
          this._proc.duration,
          { chance: this._proc.chance },
          this.player,
          this._proc
        )
        proc.on('proc', (wasActive) => !wasActive && this.player.increaseAtkSpeed(this._proc.amount))
        proc.on('fade', () => this.player.decreaseAtkSpeed(this._proc.amount))
        return proc
      }

      if (this._proc.type === 'str') {
        return new Proc(
          `${this.name} Proc`,
          this._proc.duration,
          { chance: this._proc.chance },
          this.player,
          this._proc
        )
      }
    }
    const value = getProc()
    Object.defineProperty(this, 'proc', { value })
    return value
  }

  get avg() {
    const value = m.round((this.min + this.max) / 2)
    Object.defineProperty(this, 'avg', { value })
    return value
  }

  get dmg() {
    const weaponDmg = getRandomInt(this.min, this.max)
    let dmg = weaponDmg + (this.speed * this.player.ap / 14)
    if (this.isOffhand) dmg *= this.offhandDmgMul
    return dmg
  }

  get avgDmg() {
    let dmg = this.avg + (this.speed * this.player.ap / 14)
    if (this.isOffhand) dmg *= this.offhandDmgMul
    return dmg
  }

  // https://vanilla-wow.fandom.com/wiki/Normalization
  get normalizedDmg() {
    const weaponDmg = getRandomInt(this.min, this.max)
    let dmg = weaponDmg + (this.normalizedSpeed * this.player.ap / 14)
    return dmg
  }

  get baseAttackRating() {
    const value = m.min(this.player.lvl * 5, this.skill)
    Object.defineProperty(this, 'baseAttackRating', { value })
    return value
  }

  get skillDiff() {
    const value = this.target.defenseSkill - this.skill
    Object.defineProperty(this, 'skillDiff', { value })
    return value
  }

  get normalizedSpeed() {
    const getNorm = (type) => {
      switch (type) {
        case 'DAGGER': return Weapon.NORM_SPEED.DAGGER
        case 'ONE_HANDED': return Weapon.NORM_SPEED.ONE_HANDED
        case 'TWO_HANDED': return Weapon.NORM_SPEED.TWO_HANDED
        default: return Weapon.NORM_SPEED.ONE_HANDED
      }
    }
    const value = getNorm(this.type)
    Object.defineProperty(this, 'normalizedSpeed', { value })
    return value
  }

  // Offhand attacks that occur while on-next-hit abilities such as
  // Heroic Strike are queued do not suffer the dual wield to-hit penalty
  // https://us.forums.blizzard.com/en/wow/t/wow-classic-not-a-bug-list-updated-12-13-2019/175887
  get missChance() {
    if (this.player.heroicStrike.isQueued && this.isOffhand) return 0
    return this._missChance
  }

  get _missChance() {
    const value = this.getMissChance(true)
    Object.defineProperty(this, '_missChance', { value })
    return value
  }

  get skillMissChance() {
    const value = this.getMissChance(false)
    Object.defineProperty(this, 'skillMissChance', { value })
    return value
  }

  get dodgeChance() {
    const value = clamp(5 + this.skillDiff * 0.1)
    Object.defineProperty(this, 'dodgeChance', { value })
    return value
  }

  get glanceChance() {
    const value = clamp(10 + (this.target.defenseSkill - this.baseAttackRating) * 2)
    Object.defineProperty(this, 'glanceChance', { value })
    return value
  }

  // https://github.com/magey/classic-warrior/wiki/Crit-aura-suppression
  get critSupp() {
    const baseDiffSkill = this.baseAttackRating - this.target.defenseSkill
    const critSupp = baseDiffSkill < 0
      ? baseDiffSkill * 0.2
      : baseDiffSkill * 0.4

    const value = critSupp - 1.8
    Object.defineProperty(this, 'critSupp', { value })
    return value
  }

  get critChance() {
    const value = clamp(this.player.crit + this.critSupp)
    Object.defineProperty(this, 'critChance', { value })
    return value
  }

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
    const value = (glancePenaltyLow + glancePenaltyHigh) / 2
    Object.defineProperty(this, 'glancePenaltyMul', { value })
    return value
  }

  get canUse() {
    if (!this.swingTimer.canUse) return false
    if (this.player.slam && this.player.slam.isCasting) return false

    return true
  }

  get timeLeft() {
    return this.swingTimer.timeLeft
  }

  // Methods

  tick(secs) {
    this.swingTimer.tick(secs)
    this.enchant && this.enchant.tick(secs)
    this.proc && this.proc.tick && this.proc.tick(secs)
  }

  getMissChance(isSwing = true) {
    // 1% hit from gear lost if delta > 10
    // https://www.wowhead.com/news=292085/hit-cap-in-classic-wow-clarifications
    const gearHit = clamp(this.player.hit - (this.skillDiff > 10 ? 1 : 0))
    const baseMiss = 5 + this.skillDiff * (this.skillDiff > 10 ? 0.2 : 0.1)
    // NC: DW miss chance is 80% * baseMiss + 20
    const actualMiss = this.player.isDw && isSwing ? (baseMiss * 0.8 + 20) : baseMiss
    return clamp(actualMiss - gearHit)
  }

  isHeroicStrikeReplacing(isExtra) {
    if (this.isOffhand) return
    if (!this.player.heroicStrike.isQueued) return

    this.player.heroicStrike.isQueued = false
    if (!this.player.heroicStrike.canUse) return

    this.player.heroicStrike.use(isExtra)
    return true
  }

  // https://github.com/magey/classic-warrior/wiki/Attack-table
  getSwingResult() {
    const roll = m.random() * 100
    if (roll <= this.attackTable.miss) return Weapon.RESULT.MISS
    if (roll <= this.attackTable.dodge) return Weapon.RESULT.DODGE
    if (roll <= this.attackTable.glance) return Weapon.RESULT.GLANCE
    if (roll <= this.attackTable.crit) return Weapon.RESULT.CRIT
    return Weapon.RESULT.HIT
  }

  // A single hit can proc both weapon enchant and extra-attack
  // A single hit can't proc multiple extra-attacks
  // TODO: Proc multiple if source is an instant attack
  // NC: Priority is WF > MH / OH > Trinket
  tryProcs() {
    this.enchant && this.enchant.tryToProc()
    this.proc && this.proc.type !== 'extraAttack' && this.proc.tryToProc()

    if (this.isMainhand && this.windfury && this.windfury.tryToProc()) return true
    if (this.proc && this.proc.type === 'extraAttack' && this.proc.tryToProc()) return true
    if (this.player.hoj && this.player.hoj.tryToProc()) return true

    return
  }

  swing(isExtra = false) {
    this.swingTimer.restart()

    this.player.flurry && this.player.flurry.useCharge()

    if (this.isHeroicStrikeReplacing(isExtra)) return

    this.log.count++
    const result = this.getSwingResult()

    if (result === Weapon.RESULT.MISS) {
      this.log.miss++
      this.player.addTimeline(this.name, result)
      return
    }

    if (result === Weapon.RESULT.DODGE) {
      this.log.dodge++
      // NC: Rage from dodge is 75% of average damage
      this.player.rage.gainFromSwing(this.avgDmg * 0.75)
      this.player.addTimeline(this.name, result)
      return
    }

    let dmg = this.dmg * this.player.dmgMul * this.target.armorMitigationMul

    if (result === Weapon.RESULT.GLANCE) {
      // NC: Rage gain from glance is based on damage
      dmg *= this.glancePenaltyMul
      this.log.glance++
    }

    if (result === Weapon.RESULT.CRIT) {
      dmg *= 2
      this.log.crit++
      this.player.flurry && this.player.flurry.apply()
    }

    if (result === Weapon.RESULT.HIT) this.log.hit++

    dmg = m.round(dmg)
    this.log.dmg += dmg
    this.player.rage.gainFromSwing(dmg)
    this.player.addTimeline(this.name, result, dmg)

    // Test procs before consuming a WF charge,
    // if it procs a charge is consumed instantly
    if (this.tryProcs() && isExtra) this.log.chain++

    // NC: WF don't consume charge on misses
    this.windfury && this.windfury.useCharge()
  }
}
