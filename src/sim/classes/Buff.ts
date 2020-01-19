import { Cooldown, CooldownGCD } from '@/sim/classes/Cooldown'
import Player from '@/sim/classes/Player'
import { m } from '@/sim/helpers'

export default class Buff {
  private buffDurationLeft: number
  private cooldown: Cooldown | CooldownGCD
  name: string

  constructor(
    protected player: Player,
    name: string,
    public cost: number,
    private buffDuration: number,
    cooldown: number,
    triggerGcd: boolean,
    timeLeft: number = 0
  ) {
    this.buffDurationLeft = 0
    this.cooldown = triggerGcd
      ? new CooldownGCD(player, name, cooldown, timeLeft)
      : new Cooldown(name, cooldown, timeLeft)
    this.name = name
  }

  // Getters

  get isPlayerInput() {
    return true
  }

  get isActive() {
    return this.buffDurationLeft > 0
  }

  get canUse() {
    if (this.isActive) return false
    if (!this.player.rage.has(this.cost)) return false

    return true
  }

  get timeLeft() {
    return this.cooldown.timeLeft
  }

  // Methods

  handle() {
    this.use()
  }

  tick(secs: number) {
    this.cooldown.tick(secs)
    if (!this.buffDurationLeft) return

    this.buffDurationLeft = m.max(0, this.buffDurationLeft - secs)

    if (this.isActive) return
    this.player.addTimeline(this.name, 'BUFF_FADED')
  }

  use() {
    this.cooldown.use()
    this.buffDurationLeft = this.buffDuration
    this.player.rage.use(this.cost)
    this.player.addTimeline(this.name, 'BUFF_APPLIED', `${this.buffDuration}s`)
  }

  reset() {
    this.cooldown.reset()
    this.buffDurationLeft = 0
  }
}
