import AngerManagement from   '@/scripts/classes/Cooldowns/AngerManagement'
import BloodFury from         '@/scripts/classes/Buffs/BloodFury'
import Bloodrage from         '@/scripts/classes/Cooldowns/Bloodrage'
import Bloodthirst from       '@/scripts/classes/Skills/Bloodthirst'
import Buff from              '@/scripts/classes/Buff'
import Execute from           '@/scripts/classes/Skills/Execute'
import ExtraAttack from       '@/scripts/classes/Cooldowns/ExtraAttack'
import Flurry from            '@/scripts/classes/Flurry'
import Hamstring from         '@/scripts/classes/Skills/Hamstring'
import HeroicStrike from      '@/scripts/classes/Skills/HeroicStrike'
import MightyRagePotion from  '@/scripts/classes/Buffs/MightyRagePotion'
import Rage from              '@/scripts/classes/Rage'
import Slam from              '@/scripts/classes/Skills/Slam'
import Target from            '@/scripts/classes/Target'
import Weapon from            '@/scripts/classes/Weapon'
import Whirlwind from         '@/scripts/classes/Skills/Whirlwind'
import Windfury from          '@/scripts/classes/Procs/Windfury'
import { Cooldown } from      '@/scripts/classes/Cooldown'

import { m } from '@/scripts/helpers'

export default class Player {
  constructor(cfg, log) {
    this.log = log
    this.logTimeline = false
    this.time = 0

    this.talents = Player.parseTalents(cfg.player.talents)

    this._str = cfg.player.str
    this._ap = cfg.player.ap
    this.lvl = cfg.player.lvl
    this.hit = cfg.player.hit
    this.haste = cfg.player.haste
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
    this.offhand = cfg.player.offhand && cfg.player.offhand.canUse &&
      new Weapon('Offhand', cfg.player.offhand, this)
    this.weapons = [this.mainhand, this.offhand].filter(e => !!e)
    this.isDw = !!this.offhand
    this.hoj = cfg.player.hoj && new ExtraAttack('Hand of Justice', 0.02, 1, true, this)
    this.cloudkeeper = cfg.player.cloudkeeper.canUse &&
      new Buff('Cloudkeeper Legplates', 0, 30, 900, false, this, cfg.player.cloudkeeper.timeLeft)

    // Talents
    const battleShoutDuration = 120 * (1 + this.talents.boomingVoice * 0.1)
    const twoHandSpecMul = 1 + this.talents.twoHandSpec * 0.01
    this._dmgMul = this.isDw ? 1 : twoHandSpecMul
    this.battleShoutApMul = 1 + this.talents.impBS * 0.05

    this.bloodrage = new Bloodrage(this, cfg.player.bloodrage)
    this.whirlwind = new Whirlwind(this, cfg.player.whirlwind)
    this.hamstring = new Hamstring(this, cfg.player.hamstring)
    this.slam = new Slam(this, cfg.player.slam)
    this.heroicStrike = new HeroicStrike(this, cfg.player.heroicStrike)
    this.execute = new Execute(this, cfg.player.execute)
    this.battleShout = new Buff('Battle Shout', 10, battleShoutDuration, 0, true, this)
    this.angerManagement = this.talents.angerManagement && new AngerManagement(this)
    this.flurry = this.talents.flurry && new Flurry(this)
    this.bloodthirst = this.talents.bloodthirst && new Bloodthirst(this)
    this.deathWish = this.talents.deathWish &&
      new Buff('Death Wish', 10, 30, 180, true, this, cfg.player.deathWish.timeLeft)
  }

  // Getters

  get dmgMul() {
    let dmgMul = this._dmgMul

    if (this.deathWish && this.deathWish.isActive) dmgMul *= 1.2

    return dmgMul
  }

  get str() {
    let str = this._str

    // Crusader / Holy Strength
    str += this.weapons.reduce((s, w) => s += w.enchant && w.enchant.isActive ? 100 : 0, 0)

    // Str procs
    str += this.weapons.reduce((s, w) => {
      return s += w.proc && w.proc.isActive && w.proc.type === 'str' ? w.proc.amount : 0
    }, 0)

    if (this.mrp && this.mrp.isActive) str += 60
    if (this.bok) str *= 1.1

    return str
  }

  get flatAp() {
    const baseAp = Player.getBaseAp(this.lvl, this._str)
    const value = this._ap - baseAp
    Object.defineProperty(this, 'flatAp', { value })
    return value
  }

  get ap() {
    const baseAp = Player.getBaseAp(this.lvl, this.str)
    let ap = baseAp + this.flatAp

    if (this.bloodFury && this.bloodFury.isActive) ap += this.bloodFury.apSnapshot
    if (this.battleShout.isActive) ap += 193 * this.battleShoutApMul
    if (this.windfury && this.windfury.isActive) ap += 315 * this.windfuryApMul
    if (this.cloudkeeper && this.cloudkeeper.isActive) ap += 100

    return m.round(ap)
  }

  get hasCrusaderProc() {
    return this.weapons.some(w => w.enchant && w.enchant.isActive)
  }

  get hasEveryCrusaderProc() {
    return this.weapons.every(w => w.enchant && w.enchant.isActive)
  }

  // UseWhen helper
  get isDeathWishActive() {
    return this.deathWish ? this.deathWish.isActive : true
  }

  get toReset() {
    const value = [
      this.angerManagement,
      this.battleShout,
      this.bloodFury,
      this.bloodrage,
      this.bloodrage.periodic,
      this.bloodthirst,
      this.cloudkeeper,
      this.deathWish,
      this.execute,
      this.flurry,
      this.gcd,
      this.hamstring,
      this.heroicStrike,
      this.mainhand,
      this.mrp,
      this.offhand,
      this.rage,
      this.slam,
      this.slam.cast,
      this.whirlwind,
      this.windfury
    ].filter(e => !!e)
    Object.defineProperty(this, 'toReset', { value })
    return value
  }

  // Methods

  static parseTalents(url) {
    const numbers = url.split('/').pop()
    let [arms, fury] = numbers.split('-')

    const getValue = (str, i) => {
      return (str && str.length > i)
        ? parseInt(str[i]) || 0
        : 0
    }

    return {
      impHS: getValue(arms, 0),
      tacticalMastery: getValue(arms, 4),
      angerManagement: getValue(arms, 7),
      deepWounds: getValue(arms, 8),
      twoHandSpec: getValue(arms, 9),
      impale: getValue(arms, 10),

      boomingVoice: getValue(fury, 0),
      cruelty: getValue(fury, 1),
      unbridledWrath: getValue(fury, 3),
      impBS: getValue(fury, 7),
      dualWieldSpec: getValue(fury, 8),
      impExecute: getValue(fury, 9),
      impSlam: getValue(fury, 11),
      deathWish: getValue(fury, 12),
      flurry: getValue(fury, 15),
      bloodthirst: getValue(fury, 16)
    }
  }

  static getBaseAp(lvl, str) {
    return (lvl * 3 - 20) + str * 2
  }

  tick(secs) {
    this.gcd.tick(secs)
    this.flurry && this.flurry.tick(secs)
    this.windfury && this.windfury.tick(secs)
  }

  reset() {
    this.time = 0
    this.logTimeline = false
    this.toReset.forEach(e => e.reset())
  }

  increaseAtkSpeed(percent) {
    this.weapons.forEach(w => w.swingTimer.increaseAtkSpeed(percent))
  }

  decreaseAtkSpeed(percent) {
    this.weapons.forEach(w => w.swingTimer.decreaseAtkSpeed(percent))
  }

  // UseWhen helper
  checkBtCd(secs) {
    return this.bloodthirst
      ? this.bloodthirst.cooldown.timeLeft >= secs
      : true
  }

  // UseWhen helper
  checkWwCd(secs) {
    return this.whirlwind && this.whirlwind.canUse
      ? this.whirlwind.cooldown.timeLeft >= secs
      : true
  }

  addTimeline(name, type, value = null) {
    if (!this.logTimeline) return

    const timeHtml = `<span class="time">${this.time.toFixed(3)}</span>`
    const typeHtml = `<span class="event">${type}</span>`
    const infoHtml = `<span class="extra-info">(${this.rage.current} rage, ${this.ap} ap)</span>`
    const valueHtml = Number.isInteger(value)
      ? `<span class="value">${value}</span>`
      : value
    this.log.timeline.push(!value
      ? `${timeHtml}  ${name} ${typeHtml} ${infoHtml}`
      : `${timeHtml}  ${name} ${typeHtml} for ${valueHtml} ${infoHtml}`
    )
  }
}
