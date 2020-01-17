import AttackSpeed from '@/sim/classes/Cooldowns/AttackSpeed'
import ExtraAttack from '@/sim/classes/Cooldowns/ExtraAttack'
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
  private _enchant: any
  private _type: string
  private _skill: number
  private _min: number
  private _max: number
  private _speed: number
  private _dmgMul: number
  private _log: any
  private _result: Result | null
  private _target: Target
  private _wf: Windfury | null
  swingTimer: AttackSpeed

  constructor(public name: string, cfg: any, private _player: Player) {
    this._proc = cfg.proc
    this._enchant = cfg.enchant
    this._type = cfg.type
    this._skill = cfg.skill
    this._min = cfg.min
    this._max = cfg.max
    this._speed = cfg.speed
    this._log = _player.log.setSwingOrSkill(name)
    this._dmgMul = this._isMainhand ? 1 : (0.5 + _player.talents.dualWieldSpec * 0.025)

    // NC: Initial offhand swing start at 50%
    const hastedSpeed = this._speed / (1 + _player.haste / 100)
    const swingOffset = this._isOffhand ? hastedSpeed * 0.5 : 0
    this.swingTimer = new AttackSpeed(this.name, hastedSpeed, swingOffset)

    this._result = null
    this._target = _player.target
    this._wf = _player.windfury
  }

  // Getters

  private get _isOffhand() {
    return this.name === 'Offhand'
  }

  private get _isMainhand() {
    return this.name === 'Mainhand'
  }

  private get _dmg() {
    return getRandomInt(this._min, this._max)
  }

  private get _avg() {
    const value = m.round((this._min + this._max) / 2)
    Object.defineProperty(this, 'avg', { value })
    return value
  }

  private get _baseAttackRating() {
    const value = m.min(this._player.lvl * 5, this._skill)
    Object.defineProperty(this, '_baseAttackRating', { value })
    return value
  }

  private get _skillDiff() {
    const value = this._target.defenseSkill - this._skill
    Object.defineProperty(this, '_skillDiff', { value })
    return value
  }

  private get _normalizedSpeed() {
    const getNorm = (type: string) => {
      switch (type) {
        case 'DAGGER': return 1.7
        case 'ONE_HANDED': return 2.4
        case 'TWO_HANDED': return 3.3
        default: return 2.4
      }
    }
    const value = getNorm(this._type)
    Object.defineProperty(this, '_normalizedSpeed', { value })
    return value
  }

  // 1% hit from gear lost if delta > 10
  // https://www.wowhead.com/news=292085/hit-cap-in-classic-wow-clarifications
  private get _gearHit() {
    const value = clamp(this._player.hit - (this._skillDiff > 10 ? 1 : 0))
    Object.defineProperty(this, '_gearHit', { value })
    return value
  }

  private get _baseMiss() {
    const value = 5 + this._skillDiff * (this._skillDiff > 10 ? 0.2 : 0.1)
    Object.defineProperty(this, '_baseMiss', { value })
    return value
  }

  private get _missChanceCache() {
    const missChance = this._player.isDw ? (this._baseMiss * 0.8 + 20) : this._baseMiss
    const value = clamp(missChance - this._gearHit)
    Object.defineProperty(this, '_missChanceCache', { value })
    return value
  }

  // Offhand attacks that occur while on-next-hit abilities such as
  // Heroic Strike are queued do not suffer the dual wield to-hit penalty
  // https://us.forums.blizzard.com/en/wow/t/wow-classic-not-a-bug-list-updated-12-13-2019/175887
  private get _missChance() {
    if (this._isOffhand && this._player.heroicStrike.isQueued) return 0
    return this._missChanceCache
  }

  private get _glanceChance() {
    const value = clamp(10 + (this._target.defenseSkill - this._baseAttackRating) * 2)
    Object.defineProperty(this, '_glanceChance', { value })
    return value
  }

  // https://github.com/magey/classic-warrior/wiki/Crit-aura-suppression
  private get _critSupp() {
    const baseDiffSkill = this._baseAttackRating - this._target.defenseSkill
    const _critSupp = baseDiffSkill < 0
      ? baseDiffSkill * 0.2
      : baseDiffSkill * 0.4

    const value = _critSupp - 1.8
    Object.defineProperty(this, '_critSupp', { value })
    return value
  }

  private get _glancePenaltyMul() {
    const glancePenaltyLow = clamp(1.3 - 0.05 * this._skillDiff, 0.01, 0.91)
    const glancePenaltyHigh = clamp(1.2 - 0.03 * this._skillDiff, 0.2, 0.99)
    const value = (glancePenaltyLow + glancePenaltyHigh) / 2
    Object.defineProperty(this, '_glancePenaltyMul', { value })
    return value
  }

  private get _attackTable() {
    const miss = clamp(this._missChance)
    const dodge = clamp(miss + this.dodgeChance)
    const glance = clamp(dodge + this._glanceChance)
    const crit = clamp(glance + this.critChance)
    return { miss, dodge, glance, crit }
  }

  private get _isHeroicStrikeReplacing() {
    if (this._isOffhand) return false
    if (!this._player.heroicStrike.isQueued) return false

    this._player.heroicStrike.cancelQueue()
    if (!this._player.heroicStrike.canUse) return false

    return true
  }

  get isPlayerInput() {
    return false
  }

  get enchant() {
    if (!this._enchant) return null

    const value = new Proc(`Crusader ${this.name}`, 15, { ppm: 1, speed: this._speed }, this._player)
    Object.defineProperty(this, 'enchant', { value })
    return value
  }

  get proc() {
    const getProc = () => {
      if (this._proc.type === 'extraAttack') {
        return new ExtraAttack(
          `${this.name} Proc`,
          this._proc.chance,
          this._proc.amount,
          true,
          this._player
        )
      }

      if (this._proc.type === 'atkSpeed') {
        const proc = new Proc(
          `${this.name} Proc`,
          this._proc.duration,
          { chance: this._proc.chance },
          this._player,
          this._proc
        )
        proc.on('proc', (wasActive: boolean) => !wasActive && this._player.increaseAtkSpeed(this._proc.amount))
        proc.on('fade', () => this._player.decreaseAtkSpeed(this._proc.amount))
        return proc
      }

      if (this._proc.type === 'str') {
        return new Proc(
          `${this.name} Proc`,
          this._proc.duration,
          { chance: this._proc.chance },
          this._player,
          this._proc
        )
      }
    }
    const value = getProc()
    Object.defineProperty(this, 'proc', { value })
    return value
  }

  get dmg() {
    return (this._dmg + this._speed * this._player.ap / 14) * this._dmgMul
  }

  get avgDmg() {
    return (this._avg + this._speed * this._player.ap / 14) * this._dmgMul
  }

  // https://vanilla-wow.fandom.com/wiki/Normalization
  get normalizedDmg() {
    return this._dmg + this._normalizedSpeed * this._player.ap / 14
  }

  get skillMissChance() {
    const value = clamp(this._baseMiss - this._gearHit)
    Object.defineProperty(this, 'skillMissChance', { value })
    return value
  }

  get dodgeChance() {
    const value = clamp(5 + this._skillDiff * 0.1)
    Object.defineProperty(this, 'dodgeChance', { value })
    return value
  }

  get critChance() {
    const value = clamp(this._player.crit + this._critSupp)
    Object.defineProperty(this, 'critChance', { value })
    return value
  }

  get canUse() {
    if (!this.swingTimer.canUse) return false
    if (this._player.slam && this._player.slam.isCasting) return false

    return true
  }

  get timeLeft() {
    return this.swingTimer.timeLeft
  }

  // Methods

  // https://github.com/magey/classic-warrior/wiki/Attack-table
  private _getResult() {
    const roll = m.random() * 100
    const _attackTable = Object.assign({}, this._attackTable)
    if (roll <= _attackTable.miss) return Result.MISS
    if (roll <= _attackTable.dodge) return Result.DODGE
    if (roll <= _attackTable.glance) return Result.GLANCE
    if (roll <= _attackTable.crit) return Result.CRIT
    return Result.HIT
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

    if (this._isMainhand && this._wf && this._wf.tryToProc()) return true
    if (this.proc && isExtraAttackProc && this.proc.tryToProc()) return true
    if (this._player.hoj && this._player.hoj.tryToProc()) return true

    return
  }

  swing(force = false) {
    this.swingTimer.restart(force)

    this._player.flurry && this._player.flurry.useCharge()

    if (this._isHeroicStrikeReplacing) {
      this._player.heroicStrike.use()
      return
    }

    this._log.count++
    this._result = this._getResult()

    if (this._result === Result.MISS) {
      this._log.miss++
      this._player.addTimeline(this.name, this._result)
      return
    }

    if (this._result === Result.DODGE) {
      this._log.dodge++
      // NC: Rage from dodge is 75% of average damage
      this._player.rage.gainFromSwing(this.avgDmg * 0.75)
      this._player.addTimeline(this.name, this._result)
      return
    }

    let dmg = this.dmg * this._player.dmgMul * this._target.armorMitigationMul

    if (this._result === Result.GLANCE) {
      // NC: Rage gain from glance is based on damage
      dmg *= this._glancePenaltyMul
      this._log.glance++
    }

    if (this._result === Result.CRIT) {
      dmg *= 2
      this._log.crit++
      this._player.flurry && this._player.flurry.apply()
    }

    if (this._result === Result.HIT) this._log.hit++

    dmg = m.round(dmg)
    this._log.dmg += dmg
    this._player.rage.gainFromSwing(dmg)
    this._player.addTimeline(this.name, this._result, dmg)

    // Test procs before consuming a WF charge,
    // if it procs a charge is consumed instantly
    this.tryProcs()

    // NC: WF don't consume charge on misses
    this._wf && this._wf.useCharge()
  }
}
