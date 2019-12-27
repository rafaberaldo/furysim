import Aura from '@/scripts/classes/Aura'
import AttackSpeed from '@/scripts/classes/Cooldowns/AttackSpeed'
import ExtraAttack from '@/scripts/classes/Cooldowns/ExtraAttack'

import { m, clamp, getRandomInt } from '@/scripts/helpers'

export default class Weapon {
  constructor(name, weapon, player) {
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

    this.log = player.log.set(name)
    this.name = name
    this.isOffhand = name === 'Offhand'
    this.isMainhand = name === 'Mainhand'
    this.type = weapon.type
    this.skill = weapon.skill
    this.min = weapon.min
    this.max = weapon.max
    this.speed = weapon.speed
    switch (weapon.proc.type) {
      case 'extraAttack': {
        this.proc = new ExtraAttack(
          `${name} Proc`, weapon.proc.chance, weapon.proc.amount, true, player
        )
        break
      }

      case 'atkSpeed': {
        this.proc = new Aura(
          `${name} Proc`, weapon.proc.duration, { chance: weapon.proc.chance }, player
        )
        this.proc.on('proc', (isActive) => isActive && player.increaseAtkSpeed(weapon.proc.amount))
        this.proc.on('fade', () => player.decreaseAtkSpeed(weapon.proc.amount))
        break
      }
    }
    this.enchant = weapon.enchant && new Aura(
      `Crusader ${this.name}`, 15, { ppm: 1, speed: this.speed }, player
    )

    this.player = player
    this.target = player.target
    this.windfury = player.windfury

    // NC: Initial offhand swing start at 50%
    const hastedSpeed = this.speed / (1 + this.player.haste / 100)
    const swingOffset = this.isOffhand ? hastedSpeed * 0.5 : 0
    this.swingTimer = new AttackSpeed(this.name, hastedSpeed, swingOffset)
  }

  // Getters

  get dmg() {
    const weaponDmg = getRandomInt(this.min, this.max)
    let dmg = weaponDmg + (this.speed * this.player.ap / 14)
    if (this.isOffhand) dmg *= this.player.offhandDmgMul
    return dmg
  }

  get avgDmg() {
    const weaponDmg = m.round((this.min + this.max) / 2)
    let dmg = weaponDmg + (this.speed * this.player.ap / 14)
    if (this.isOffhand) dmg *= this.player.offhandDmgMul
    return dmg
  }

  // https://vanilla-wow.fandom.com/wiki/Normalization
  get normalizedDmg() {
    const weaponDmg = getRandomInt(this.min, this.max)
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
  // Heroic Strike are queued do not suffer the dual wield to-hit penalty
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
    if (roll <= this.attackTable.miss) return this.consts.SWING_RESULT_MISS
    if (roll <= this.attackTable.dodge) return this.consts.SWING_RESULT_DODGE
    if (roll <= this.attackTable.glance) return this.consts.SWING_RESULT_GLANCE
    if (roll <= this.attackTable.crit) return this.consts.SWING_RESULT_CRIT
    return this.consts.SWING_RESULT_HIT
  }

  // A single hit can proc both weapon enchant and extra-attack
  // A single hit can't proc multiple extra-attacks
  // TODO: Proc multiple if source is an instant attack
  // NC: Priority is WF > MH / OH > Trinket
  tryProcs() {
    this.enchant && this.enchant.tryToProc()

    if (this.isMainhand && this.windfury && this.windfury.tryToProc()) return true
    if (this.proc && this.proc.tryToProc()) return true
    if (this.player.hoj && this.player.hoj.tryToProc()) return true

    return
  }

  swing(isExtra = false) {
    this.swingTimer.restart()

    this.player.flurry && this.player.flurry.useCharge()

    if (this.isHeroicStrikeReplacing(isExtra)) return

    this.log.count++
    const result = this.getSwingResult()

    if (result === this.consts.SWING_RESULT_MISS) {
      this.log.miss++
      this.player.addTimeline(this.name, result)
      return
    }

    if (result === this.consts.SWING_RESULT_DODGE) {
      // NC: Rage from dodge is 75% of average damage
      this.log.dodge++
      this.player.rage.gainFromSwing(this.avgDmg * 0.75)
      this.player.addTimeline(this.name, result)
      return
    }

    let dmg = this.dmg * this.player.dmgMul * this.target.armorMitigationMul

    if (result === this.consts.SWING_RESULT_GLANCE) {
      // NC: Rage gain from glance is based on damage
      dmg *= this.glancePenaltyMul
      this.log.glance++
    }

    if (result === this.consts.SWING_RESULT_CRIT) {
      dmg *= 2
      this.log.crit++
      this.player.flurry && this.player.flurry.apply()
    }

    if (result === this.consts.SWING_RESULT_HIT) this.log.hit++

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
