import { Cooldown, CooldownGCD } from '@/sim/classes/Cooldown'
import { DmgLog } from '@/sim/classes/Log'
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
  private log: DmgLog
  private result: Result | undefined
  private target: Target
  private skillCritMul: number
  private cooldown: Cooldown | CooldownGCD
  protected missRefundMul: number

  constructor(
    protected player: Player,
    public name: string,
    public cost: number,
    cooldown: number,
    triggerGcd: boolean,
    protected cfg: any = undefined
  ) {
    this.log = player.log.newDmgLog(name)
    this.cooldown = triggerGcd
      ? new CooldownGCD(player, name, cooldown, 0)
      : new Cooldown(name, cooldown)

    // NC: Miss refund is 80%
    this.missRefundMul = 1 - 0.8
    this.skillCritMul = 2 + player.talents.impale * 0.1

    this.result = undefined
    this.target = player.target
  }

  // Getters

  private get attackTable() {
    const miss = clamp(this.player.mainhand.skillMissChance)
    const dodge = clamp(miss + this.player.mainhand.dodgeChance)
    const crit = clamp(this.player.mainhand.critChance)
    return { miss, dodge, crit }
  }

  protected get isResultMiss() {
    if (!this.result) return false

    return [Result.MISS, Result.DODGE].includes(this.result)
  }

  get isPlayerInput() {
    return true
  }

  get dmg(): number {
    throw new Error('Base class, not implemented.')
  }

  get canUse() {
    if (!this.player.rage.has(this.cost)) return false
    if (this.player.slam && this.player.slam.isCasting) return false

    return true
  }

  get timeLeft() {
    return this.cooldown.timeLeft
  }

  get onCooldown() {
    return this.cooldown.onCooldown
  }

  // Methods

  // Skills are two-rolls system
  private getResult() {
    const roll = m.random() * 100
    const attackTable = Object.assign({}, this.attackTable)
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
    this.cooldown.tick(secs)
  }

  reset() {
    this.cooldown.reset()
  }

  use() {
    if (process.env.NODE_ENV === 'development' && !this.canUse) {
      throw new Error(`Trying to use ${this.name} when can't use.`)
    }

    this.cooldown.use()
    this.log.count++

    this.result = this.getResult()

    if (this.result === Result.MISS) this.log.miss++
    if (this.result === Result.DODGE) this.log.dodge++
    if (this.isResultMiss) {
      this.player.rage.use(this.cost * this.missRefundMul)
      this.player.addTimeline(this.name, this.result)
      return
    }

    let dmg = this.dmg * this.player.dmgMul * this.target.armorMitigationMul

    if (this.result === Result.CRIT) {
      dmg *= this.skillCritMul
      this.log.crit++
      this.player.flurry && this.player.flurry.apply()
    }

    if (this.result === Result.HIT) this.log.hit++

    dmg = m.round(dmg)
    this.player.rage.use(this.cost)
    this.log.dmg += dmg

    this.player.addTimeline(this.name, this.result, dmg)

    this.player.mainhand.tryProcs()
  }
}
