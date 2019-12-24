/* eslint-disable no-console */
import Flurry from            '@/scripts/classes/Flurry'
import Rage from              '@/scripts/classes/Rage'
import Target from            '@/scripts/classes/Target'
import Weapon from            '@/scripts/classes/Weapon'
import Windfury from          '@/scripts/classes/Auras/Windfury'
import Buff from              '@/scripts/classes/Buff'
import BloodFury from         '@/scripts/classes/Buffs/BloodFury'
import MightyRagePotion from  '@/scripts/classes/Buffs/MightyRagePotion'
import AngerManagement from   '@/scripts/classes/Cooldowns/AngerManagement'
import Bloodrage from         '@/scripts/classes/Cooldowns/Bloodrage'
import ExtraAttack from       '@/scripts/classes/Cooldowns/ExtraAttack'
import Bloodthirst from       '@/scripts/classes/Skills/Bloodthirst'
import Execute from           '@/scripts/classes/Skills/Execute'
import Hamstring from         '@/scripts/classes/Skills/Hamstring'
import HeroicStrike from      '@/scripts/classes/Skills/HeroicStrike'
import Slam from              '@/scripts/classes/Skills/Slam'
import Whirlwind from         '@/scripts/classes/Skills/Whirlwind'
import { Cooldown } from      '@/scripts/classes/Cooldown'

import { m, parseTalents } from '@/scripts/helpers'

export default class Player {
  constructor(cfg, log, logTimeline = false) {
    this.log = log
    this.logTimeline = logTimeline

    this._str = cfg.player.str
    this._ap = cfg.player.ap
    this.lvl = cfg.player.lvl
    this.hit = cfg.player.hit
    this.haste = 1 + cfg.player.haste / 100
    this.crit = cfg.player.crit
    this.gcd = new Cooldown('GCD', 1.5)
    this.rage = new Rage(this, cfg.player.startRage)

    this.target = new Target(cfg.target, this)

    this.windfury = cfg.player.buffs.wf && new Windfury(this)
    this.windfuryApMul = cfg.player.buffs.improvedWf ? 1.3 : 1
    this.bok = cfg.player.buffs.bok
    this.mrp = cfg.player.buffs.mrp && new MightyRagePotion(this, cfg.player.mrp)
    this.bloodFury = cfg.player.buffs.bloodFury && new BloodFury(this, cfg.player.bloodFury)

    this.mainhand = new Weapon('Mainhand', cfg.player.mainhand, this)
    this.offhand = cfg.player.offhand && cfg.player.offhand.canUse
      ? new Weapon('Offhand', cfg.player.offhand, this) : null
    this.isDw = !!this.offhand
    this.hoj = cfg.player.hoj && new ExtraAttack('Hand of Justice', 0.02, 1, true, this)

    this.bloodrage = new Bloodrage(this, cfg.player.bloodrage)
    this.whirlwind = new Whirlwind(this, cfg.player.whirlwind)
    this.hamstring = new Hamstring(this, cfg.player.hamstring)

    // Talents
    const talents = parseTalents(cfg.player.talents)
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

    this.execute = new Execute(this, cfg.player.execute)
    this.heroicStrike = new HeroicStrike(this, cfg.player.heroicStrike)
    this.battleShout = new Buff('Battle Shout', 10, this.battleShoutDuration, 0, true, this)
    this.flurry = talents.flurry && new Flurry(this)
    this.bloodthirst = talents.bloodthirst && new Bloodthirst(this)
    this.slam = new Slam(this, cfg.player.slam)
    this.deathWish = talents.deathWish &&
      new Buff('Death Wish', 10, 30, 180, true, this, cfg.player.deathWish.timeLeft)
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
    if (this.offhand && this.offhand.enchant && this.offhand.enchant.isActive) str += 100

    if (this.mrp && this.mrp.isActive) str += 60
    if (this.bok) str *= 1.1

    return str
  }

  get ap() {
    const initBaseAp = (this.lvl * 3 - 20) + this._str * 2
    const initExtraAp = this._ap - initBaseAp

    const baseAp = (this.lvl * 3 - 20) + this.str * 2
    let ap = baseAp + initExtraAp

    if (this.battleShout.isActive) ap += this.battleShoutApMul * 193
    if (this.bloodFury && this.bloodFury.isActive) ap += baseAp * 0.25
    if (this.windfury && this.windfury.isActive) ap += 315 * this.windfuryApMul

    return m.round(ap)
  }

  get hasCrusaderProc() {
    return this.mainhand.enchant && this.mainhand.enchant.isActive ||
      this.offhand && this.offhand.enchant && this.offhand.enchant.isActive
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
      ? this.bloodthirst.cooldown.timeLeft >= min
      : true
  }

  checkWwCd(min) {
    return this.whirlwind && this.whirlwind.canUse
      ? this.whirlwind.cooldown.timeLeft >= min
      : true
  }

  checkSlamCd(min) {
    return this.slam.cast && this.slam.cast.canUse
      ? this.slam.cast.timeLeft >= min
      : true
  }

  addTimeline(name, type, value = null) {
    if (!this.logTimeline) return

    this.log.timeline.push(!value
      ? `${this.time.toFixed(3)}: ${name} ${type} (${this.rage.current} rage / ${this.ap} ap)`
      : `${this.time.toFixed(3)}: ${name} ${type} for ${value} (${this.rage.current} rage / ${this.ap} ap)`
    )

    if (process.env.NODE_ENV === 'production') return

    !value
      ? console.log(this.time, ':', name, type, '(', this.rage.current, 'rage /', this.ap, 'ap )')
      : console.log(this.time, ':', name, type, 'for', value, '(', this.rage.current, 'rage /', this.ap, 'ap )')
  }
}
