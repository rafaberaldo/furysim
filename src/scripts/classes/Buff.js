import { Cooldown, CooldownGCD } from '@/scripts/classes/Cooldown'

import { m } from '@/scripts/helpers'

export default class Buff {
  constructor(name, cost, buffDuration, cooldown, triggerGcd, player, timeLeft = 0) {
    this._buffDuration = buffDuration
    this._buffDurationLeft = 0
    this.name = name
    this.cost = cost

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

  tick(secs) {
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
    this.player.addTimeline(this.name, 'BUFF_APPLIED', this._buffDuration)
  }
}
