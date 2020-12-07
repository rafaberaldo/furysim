import Buff from                 '@/sim/classes/Buff'
import BloodFury from            '@/sim/classes/Buffs/BloodFury'
import MightyRagePotion from     '@/sim/classes/Buffs/MightyRagePotion'
import { Cooldown } from         '@/sim/classes/Cooldown'
import AngerManagement from      '@/sim/classes/Cooldowns/AngerManagement'
import Bloodrage from            '@/sim/classes/Cooldowns/Bloodrage'
import EssenceOfTheRed from      '@/sim/classes/Cooldowns/EssenceOfTheRed'
import ExtraAttack from          '@/sim/classes/Cooldowns/ExtraAttack'
import Flurry from               '@/sim/classes/Flurry'
import Log from                  '@/sim/classes/Log'
import Proc from                 '@/sim/classes/Proc'
import Windfury from             '@/sim/classes/Procs/Windfury'
import Rage from                 '@/sim/classes/Rage'
import Bloodthirst from          '@/sim/classes/Skills/Bloodthirst'
import Execute from              '@/sim/classes/Skills/Execute'
import Hamstring from            '@/sim/classes/Skills/Hamstring'
import HeroicStrike from         '@/sim/classes/Skills/HeroicStrike'
import Slam from                 '@/sim/classes/Skills/Slam'
import Whirlwind from            '@/sim/classes/Skills/Whirlwind'
import Target from               '@/sim/classes/Target'
import Weapon, { ProcType } from '@/sim/classes/Weapon'
import { m } from                '@/sim/helpers'

export default class Player {
  private _str: number
  private _ap: number
  private _dmgMul: number
  log: Log
  logTimeline: boolean
  time: number
  talents: any
  lvl: number
  hit: number
  haste: number
  crit: number
  gcd: Cooldown
  rage: Rage
  target: Target
  windfury: Windfury | undefined
  bok: boolean
  zand: boolean
  mrp: MightyRagePotion | undefined
  bloodFury: BloodFury | undefined
  red: EssenceOfTheRed | undefined
  mainhand: Weapon
  offhand: Weapon | undefined
  weapons: Array<Weapon>
  isDw: boolean
  hoj: ExtraAttack | undefined
  diamondFlask: Buff | undefined
  cloudkeeper: Buff | undefined
  battleShoutApMul: number
  bloodrage: Bloodrage
  whirlwind: Whirlwind
  hamstring: Hamstring
  slam: Slam
  heroicStrike: HeroicStrike
  execute: Execute
  battleShout: Buff
  angerManagement: AngerManagement | undefined
  flurry: Flurry | undefined
  bloodthirst: Bloodthirst | undefined
  deathWish: Buff | undefined

  constructor(cfg: any) {
    this.log = new Log(cfg.duration, cfg.iterations)
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

    this.target = new Target(this, cfg.target)

    this.windfury = cfg.player.buffs.wf && new Windfury(this, cfg.player.buffs.improvedWf)
    this.bok = cfg.player.buffs.bok
    this.zand = cfg.player.buffs.zand
    this.mrp = cfg.player.buffs.mrp && new MightyRagePotion(this, cfg.player.mrp)
    this.bloodFury = cfg.player.buffs.bloodFury && new BloodFury(this, cfg.player.bloodFury)
    this.red = cfg.player.buffs.red && new EssenceOfTheRed(this)

    this.mainhand = new Weapon(this, 'Mainhand', cfg.player.mainhand)
    this.offhand = cfg.player.offhand && cfg.player.offhand.canUse &&
      new Weapon(this, 'Offhand', cfg.player.offhand)
    this.weapons = [this.mainhand, this.offhand].filter(e => !!e)
    this.isDw = !!this.offhand
    this.hoj = cfg.player.hoj && new ExtraAttack(this, 'Hand of Justice', 0.02, 1, true)
    this.diamondFlask = cfg.player.diamondFlask.canUse &&
      new Buff(this, 'Diamond Flask', 0, 60, 360, false, cfg.player.diamondFlask.timeLeft)
    this.cloudkeeper = cfg.player.cloudkeeper.canUse &&
      new Buff(this, 'Cloudkeeper Legplates', 0, 30, 900, false, cfg.player.cloudkeeper.timeLeft)

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
    this.battleShout = new Buff(this, 'Battle Shout', 10, battleShoutDuration, 0, true)
    this.angerManagement = this.talents.angerManagement && new AngerManagement(this)
    this.flurry = this.talents.flurry && new Flurry(this)
    this.bloodthirst = this.talents.bloodthirst && new Bloodthirst(this)
    this.deathWish = this.talents.deathWish &&
      new Buff(this, 'Death Wish', 10, 30, 180, true, cfg.player.deathWish.timeLeft)
  }

  // Getters

  get dmgMul() {
    let dmgMul = this._dmgMul

    if (this.deathWish && this.deathWish.isActive) dmgMul *= 1.2

    return dmgMul
  }

  get str() {
    let str = this._str

    // Weapon enchant/procs
    str += this.weapons.reduce((s, w) => {
      s += w.enchant && w.enchant.isActive ? 100 : 0
      s += w.proc instanceof Proc && w.proc.type === ProcType.Str && w.proc.isActive
        ? w.proc.amount : 0
      return s
    }, 0)

    if (this.diamondFlask && this.diamondFlask.isActive) str += 75
    if (this.mrp && this.mrp.isActive) str += 60
    if (this.bok) str *= 1.1
    if (this.zand) str *= 1.15

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
    if (this.windfury && this.windfury.isActive) ap += this.windfury.ap
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
      this.diamondFlask,
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

  static parseTalents(url: string) {
    const numbers = url.split('/').pop()
    if (!numbers) return

    let [arms, fury] = numbers.split('-')

    const getValue = (str: any, i: number) => {
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

  static getBaseAp(lvl: number, str: number) {
    return (lvl * 3 - 20) + str * 2
  }

  tick(secs: number) {
    this.gcd.tick(secs)
    this.rage.tick(secs)
    this.flurry && this.flurry.tick(secs)
    this.windfury && this.windfury.tick(secs)
  }

  reset() {
    this.time = 0
    this.logTimeline = false
    this.toReset.forEach(e => e && e.reset())
  }

  increaseAtkSpeed(percent: number) {
    this.weapons.forEach(w => w.swingTimer.increaseAtkSpeed(percent))
  }

  decreaseAtkSpeed(percent: number) {
    this.weapons.forEach(w => w.swingTimer.decreaseAtkSpeed(percent))
  }

  // UseWhen helper
  checkBtCd(secs: number) {
    return this.bloodthirst
      ? this.bloodthirst.timeLeft >= secs
      : true
  }

  // UseWhen helper
  checkWwCd(secs: number) {
    return this.whirlwind && this.whirlwind.canUse
      ? this.whirlwind.timeLeft >= secs
      : true
  }

  addTimeline(name: string, type: string, value: number | string | undefined = undefined) {
    if (!this.logTimeline) return

    const timeHtml = `<span class="time">${this.time.toFixed(3)}</span>`
    const typeHtml = `<span class="event">${type}</span>`
    const infoHtml = `<span class="extra-info">(${this.rage.current} rage, ${this.ap} ap)</span>`
    const valueHtml = `<span class="value">${value}</span>`

    if (value && Number.isInteger(<number>value)) {
      this.log.timeline.push(`${timeHtml}  ${name} ${typeHtml} for ${valueHtml} ${infoHtml}`)
    } else if (value) {
      this.log.timeline.push(`${timeHtml}  ${name} ${typeHtml} for ${value} ${infoHtml}`)
    } else {
      this.log.timeline.push(`${timeHtml}  ${name} ${typeHtml} ${infoHtml}`)
    }
  }
}
