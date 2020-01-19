import AttackSpeed from '@/sim/classes/Cooldowns/AttackSpeed'
import ExtraAttack from '@/sim/classes/Cooldowns/ExtraAttack'
import { DmgLog } from '@/sim/classes/Log'
import Player from '@/sim/classes/Player'
import Proc from '@/sim/classes/Proc'
import Windfury from '@/sim/classes/Procs/Windfury'
import Target from '@/sim/classes/Target'
import { clamp, getRandomInt, m } from '@/sim/helpers'

export enum Result {
  MISS = 'SWING_MISS',
  DODGE = 'SWING_DODGE',
  GLANCE = 'SWING_GLANCE',
  CRIT = 'SWING_CRIT',
  HIT = 'SWING_HIT'
}

export enum ProcType {
  ExtraAttack = 'extraAttack',
  AtkSpeed = 'atkSpeed',
  Str = 'str'
}

export default class Weapon {
  private _proc: any
  private type: string
  private skill: number
  private min: number
  private max: number
  private speed: number
  private dmgMul: number
  private log: DmgLog
  private result: Result | undefined
  private target: Target
  private wf: Windfury | undefined
  swingTimer: AttackSpeed
  enchant: Proc | undefined

  constructor(private player: Player, public name: string, cfg: any) {
    this._proc = cfg.proc
    this.type = cfg.type
    this.skill = cfg.skill
    this.min = cfg.min
    this.max = cfg.max
    this.speed = cfg.speed
    this.log = player.log.newDmgLog(name)
    this.dmgMul = this.isMainhand ? 1 : (0.5 + player.talents.dualWieldSpec * 0.025)
    this.enchant = cfg.enchant &&
      new Proc(this.player, `${this.name} Crusader`, 15, { ppm: 1, speed: this.speed })

    // NC: Initial offhand swing start at 50%
    const hastedSpeed = this.speed / (1 + player.haste / 100)
    const swingOffset = this.isOffhand ? hastedSpeed * 0.5 : 0
    this.swingTimer = new AttackSpeed(this.name, hastedSpeed, swingOffset)

    this.result = undefined
    this.target = player.target
    this.wf = player.windfury
  }

  // Getters

  private get isOffhand() {
    return this.name === 'Offhand'
  }

  private get isMainhand() {
    return this.name === 'Mainhand'
  }

  private get _dmg() {
    return getRandomInt(this.min, this.max)
  }

  private get avg() {
    const value = m.round((this.min + this.max) / 2)
    Object.defineProperty(this, 'avg', { value })
    return value
  }

  private get baseAttackRating() {
    const value = m.min(this.player.lvl * 5, this.skill)
    Object.defineProperty(this, 'baseAttackRating', { value })
    return value
  }

  private get skillDiff() {
    const value = this.target.defenseSkill - this.skill
    Object.defineProperty(this, 'skillDiff', { value })
    return value
  }

  private get normalizedSpeed() {
    const getNorm = (type: string) => {
      switch (type) {
        case 'DAGGER': return 1.7
        case 'ONE_HANDED': return 2.4
        case 'TWO_HANDED': return 3.3
        default: return 2.4
      }
    }
    const value = getNorm(this.type)
    Object.defineProperty(this, 'normalizedSpeed', { value })
    return value
  }

  // 1% hit from gear lost if delta > 10
  // https://www.wowhead.com/news=292085/hit-cap-in-classic-wow-clarifications
  private get gearHit() {
    const value = clamp(this.player.hit - (this.skillDiff > 10 ? 1 : 0))
    Object.defineProperty(this, 'gearHit', { value })
    return value
  }

  private get baseMiss() {
    const value = 5 + this.skillDiff * (this.skillDiff > 10 ? 0.2 : 0.1)
    Object.defineProperty(this, 'baseMiss', { value })
    return value
  }

  private get _missChance() {
    const missChance = this.player.isDw ? (this.baseMiss * 0.8 + 20) : this.baseMiss
    const value = clamp(missChance - this.gearHit)
    Object.defineProperty(this, '_missChance', { value })
    return value
  }

  // https://github.com/magey/classic-warrior/wiki/Crit-aura-suppression
  private get critSupp() {
    const baseDiffSkill = this.baseAttackRating - this.target.defenseSkill
    const critSupp = baseDiffSkill < 0
      ? baseDiffSkill * 0.2
      : baseDiffSkill * 0.4

    const value = critSupp - 1.8
    Object.defineProperty(this, 'critSupp', { value })
    return value
  }

  private get glancePenaltyMul() {
    const glancePenaltyLow = clamp(1.3 - 0.05 * this.skillDiff, 0.01, 0.91)
    const glancePenaltyHigh = clamp(1.2 - 0.03 * this.skillDiff, 0.2, 0.99)
    const value = (glancePenaltyLow + glancePenaltyHigh) / 2
    Object.defineProperty(this, 'glancePenaltyMul', { value })
    return value
  }

  private get attackTable() {
    const miss = clamp(this.missChance)
    const dodge = clamp(miss + this.dodgeChance)
    const glance = clamp(dodge + this.glanceChance)
    const crit = clamp(glance + this.critChance)
    return { miss, dodge, glance, crit }
  }

  get isPlayerInput() {
    return false
  }

  get proc() {
    const getProc = () => {
      if (this._proc.type === 'extraAttack') {
        return new ExtraAttack(
          this.player,
          `${this.name} Proc`,
          this._proc.chance,
          this._proc.amount,
          true
        )
      }

      if (this._proc.type === 'atkSpeed') {
        const proc = new Proc(
          this.player,
          `${this.name} Proc`,
          this._proc.duration,
          { chance: this._proc.chance },
          this._proc
        )
        proc.on('proc', (wasActive: boolean) => !wasActive && this.player.increaseAtkSpeed(this._proc.amount))
        proc.on('fade', () => this.player.decreaseAtkSpeed(this._proc.amount))
        return proc
      }

      if (this._proc.type === 'str') {
        return new Proc(
          this.player,
          `${this.name} Proc`,
          this._proc.duration,
          { chance: this._proc.chance },
          this._proc
        )
      }
    }
    const value = getProc()
    Object.defineProperty(this, 'proc', { value })
    return value
  }

  get dmg() {
    return (this._dmg + this.speed * this.player.ap / 14) * this.dmgMul
  }

  get avgDmg() {
    return (this.avg + this.speed * this.player.ap / 14) * this.dmgMul
  }

  // https://vanilla-wow.fandom.com/wiki/Normalization
  get normalizedDmg() {
    return this._dmg + this.normalizedSpeed * this.player.ap / 14
  }

  // Offhand attacks that occur while on-next-hit abilities such as
  // Heroic Strike are queued do not suffer the dual wield to-hit penalty
  // https://us.forums.blizzard.com/en/wow/t/wow-classic-not-a-bug-list-updated-12-13-2019/175887
  get missChance() {
    if (this.isOffhand && this.player.heroicStrike.isQueued) return 0
    return this._missChance
  }

  get skillMissChance() {
    const value = clamp(this.baseMiss - this.gearHit)
    Object.defineProperty(this, 'skillMissChance', { value })
    return value
  }

  get dodgeChance() {
    const value = clamp(5 + this.skillDiff * 0.1)
    Object.defineProperty(this, 'dodgeChance', { value })
    return value
  }

  get critChance() {
    const value = clamp(this.player.crit + this.critSupp)
    Object.defineProperty(this, 'critChance', { value })
    return value
  }

  get glanceChance() {
    const value = clamp(10 + (this.target.defenseSkill - this.baseAttackRating) * 2)
    Object.defineProperty(this, 'glanceChance', { value })
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

  // https://github.com/magey/classic-warrior/wiki/Attack-table
  private getResult() {
    const roll = m.random() * 100
    const attackTable = Object.assign({}, this.attackTable)
    if (roll <= attackTable.miss) return Result.MISS
    if (roll <= attackTable.dodge) return Result.DODGE
    if (roll <= attackTable.glance) return Result.GLANCE
    if (roll <= attackTable.crit) return Result.CRIT
    return Result.HIT
  }

  private tryHeroicStrikeReplace() {
    if (this.isOffhand) return false
    if (!this.player.heroicStrike.isQueued) return false

    this.player.heroicStrike.cancelQueue()
    if (!this.player.heroicStrike.canUse) return false

    this.player.heroicStrike.use()
    return true
  }

  handle() {
    this.swing()
  }

  tick(secs: number) {
    this.swingTimer.tick(secs)
    this.enchant && this.enchant.tick(secs)
    this.proc && this.proc.tick && this.proc.tick(secs)
  }

  reset() {
    this.swingTimer.reset()
    this.enchant && this.enchant.reset()
    this.proc && this.proc.reset()
  }

  // A single hit can proc both weapon enchant and extra-attack
  // A single hit can't proc multiple extra-attacks
  // TODO: Proc multiple if source is an instant attack
  // NC: Priority is WF > MH / OH > Trinket
  tryProcs() {
    const isExtraAttackProc = this.proc instanceof ExtraAttack

    this.enchant && this.enchant.tryToProc()
    this.proc && !isExtraAttackProc && this.proc.tryToProc()

    if (this.isMainhand && this.wf && this.wf.tryToProc()) return true
    if (this.proc && isExtraAttackProc && this.proc.tryToProc()) return true
    if (this.player.hoj && this.player.hoj.tryToProc()) return true

    return
  }

  swing(force = false) {
    this.swingTimer.restart(force)

    this.player.flurry && this.player.flurry.useCharge()

    if (this.tryHeroicStrikeReplace()) return

    this.log.count++
    this.result = this.getResult()

    if (this.result === Result.MISS) {
      this.log.miss++
      this.player.addTimeline(this.name, this.result)
      return
    }

    if (this.result === Result.DODGE) {
      this.log.dodge++
      // NC: Rage from dodge is 75% of average damage
      this.player.rage.gainFromSwing(this.avgDmg * 0.75)
      this.player.addTimeline(this.name, this.result)
      return
    }

    let dmg = this.dmg * this.player.dmgMul * this.target.armorMitigationMul

    if (this.result === Result.GLANCE) {
      // NC: Rage gain from glance is based on damage
      dmg *= this.glancePenaltyMul
      this.log.glance++
    }

    if (this.result === Result.CRIT) {
      dmg *= 2
      this.log.crit++
      this.player.flurry && this.player.flurry.apply()
    }

    if (this.result === Result.HIT) this.log.hit++

    dmg = m.round(dmg)
    this.log.dmg += dmg
    this.player.rage.gainFromSwing(dmg)
    this.player.addTimeline(this.name, this.result, dmg)

    // Test procs before consuming a WF charge,
    // if it procs a charge is consumed instantly
    this.tryProcs()

    // NC: WF don't consume charge on misses
    this.wf && this.wf.useCharge()
  }
}
