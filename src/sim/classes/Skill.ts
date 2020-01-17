import { Cooldown, CooldownGCD } from '@/sim/classes/Cooldown'
import Player from '@/sim/classes/Player'
import Target from '@/sim/classes/Target'
import { clamp, m } from '@/sim/helpers'

export enum Result {
  MISS = 'SKILL_MISS',
  DODGE = 'SKILL_DODGE',
  CRIT = 'SKILL_CRIT',
  HIT = 'SKILL_HIT'
}

export default class Skill {
  private _log: any
  private _result: Result | null
  private _target: Target
  private _skillCritMul: number
  private _cooldown: Cooldown | CooldownGCD
  protected _missRefundMul: number

  constructor(
    public name: string,
    public cost: number,
    cooldown: number,
    triggerGcd: boolean,
    protected _player: Player,
    protected _cfg: any = null
  ) {
    this._log = _player.log.setSwingOrSkill(name)
    this._cooldown = triggerGcd
      ? new CooldownGCD(name, cooldown, 0, _player)
      : new Cooldown(name, cooldown)

    // NC: Miss refund is 80%
    this._missRefundMul = 1 - 0.8
    this._skillCritMul = 2 + _player.talents.impale * 0.1

    this._result = null
    this._target = _player.target
  }

  // Getters

  private get _attackTable() {
    const miss = clamp(this._player.mainhand.skillMissChance)
    const dodge = clamp(miss + this._player.mainhand.dodgeChance)
    const crit = clamp(this._player.mainhand.critChance)
    return { miss, dodge, crit }
  }

  protected get isResultMiss() {
    if (!this._result) return false

    return [Result.MISS, Result.DODGE].includes(this._result)
  }

  get isPlayerInput() {
    return true
  }

  get dmg(): number {
    throw new Error('Base class, not implemented.')
  }

  get canUse() {
    if (!this._player.rage.has(this.cost)) return false
    if (this._player.slam && this._player.slam.isCasting) return false

    return true
  }

  get timeLeft() {
    return this._cooldown.timeLeft
  }

  get onCooldown() {
    return this._cooldown.onCooldown
  }

  // Methods

  // Skills are two-rolls system
  private _getResult() {
    const roll = m.random() * 100
    const attackTable = Object.assign({}, this._attackTable)
    if (roll <= attackTable.miss) return Result.MISS
    if (roll <= attackTable.dodge) return Result.DODGE

    const roll2 = m.random() * 100
    if (roll2 <= attackTable.crit) return Result.CRIT
    return Result.HIT
  }

  handle() {
    this.use()
  }

  tick(secs: number) {
    this._cooldown.tick(secs)
  }

  reset() {
    this._cooldown.reset()
  }

  use() {
    if (process.env.NODE_ENV === 'development' && !this.canUse) {
      throw new Error(`Trying to use ${this.name} when can't use.`)
    }

    this._cooldown.use()
    this._log.count++

    this._result = this._getResult()

    if (this._result === Result.MISS) this._log.miss++
    if (this._result === Result.DODGE) this._log.dodge++
    if (this.isResultMiss) {
      this._player.rage.use(this.cost * this._missRefundMul)
      this._player.addTimeline(this.name, this._result)
      return
    }

    let dmg = this.dmg * this._player.dmgMul * this._target.armorMitigationMul

    if (this._result === Result.CRIT) {
      dmg *= this._skillCritMul
      this._log.crit++
      this._player.flurry && this._player.flurry.apply()
    }

    if (this._result === Result.HIT) this._log.hit++

    dmg = m.round(dmg)
    this._player.rage.use(this.cost)
    this._log.dmg += dmg

    this._player.addTimeline(this.name, this._result, dmg)

    this._player.mainhand.tryProcs()
  }
}
