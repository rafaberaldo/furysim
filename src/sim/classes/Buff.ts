import { Cooldown, CooldownGCD } from '@/sim/classes/Cooldown'
import Player from '@/sim/classes/Player'
import { m } from '@/sim/helpers'

export default class Buff {
  private _buffDuration: number
  private _buffDurationLeft: number
  name: string
  cost: number
  isPlayerInput: boolean
  cooldown: Cooldown | CooldownGCD
  player: Player

  constructor(
    name: string,
    cost: number,
    buffDuration: number,
    cooldown: number,
    triggerGcd: boolean,
    player: Player,
    timeLeft: number = 0
  ) {
    this._buffDuration = buffDuration
    this._buffDurationLeft = 0
    this.name = name
    this.cost = cost
    this.isPlayerInput = true
    this.cooldown = triggerGcd
      ? new CooldownGCD(name, cooldown, timeLeft, player)
      : new Cooldown(name, cooldown, timeLeft)

    this.player = player
  }

  // Getters

  get isActive() {
    return this._buffDurationLeft > 0
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
    if (!this._buffDurationLeft) return

    this._buffDurationLeft = m.max(0, this._buffDurationLeft - secs)

    if (this.isActive) return
    this.player.addTimeline(this.name, 'BUFF_FADED')
  }

  use() {
    this.cooldown.use()
    this._buffDurationLeft = this._buffDuration
    this.player.rage.use(this.cost)
    this.player.addTimeline(this.name, 'BUFF_APPLIED', `${this._buffDuration}s`)
  }

  reset() {
    this.cooldown.reset()
    this._buffDurationLeft = 0
  }
}
