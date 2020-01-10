import { m } from '@/scripts/helpers'

export class Cooldown {
  constructor(name, duration, timeLeft = 0) {
    this._defaultTimeLeft = timeLeft
    this._defaultDuration = duration
    this._timeLeft = timeLeft
    this._duration = duration
    this.name = name
  }

  // Getters

  get duration() {
    return this._duration
  }

  get timeLeft() {
    return this._timeLeft
  }

  get onCooldown() {
    return !!this.timeLeft
  }

  get canUse() {
    return true
  }

  // Methods

  tick(secs) {
    this._timeLeft = m.max(0, this._timeLeft - secs)
  }

  use(force = false) {
    if (this.onCooldown && !force) {
      throw new Error (`Trying use ${this.name} before it is ready`)
    }

    this._timeLeft = this._duration
  }

  reset() {
    this._timeLeft = this._defaultTimeLeft
    this._duration = this._defaultDuration
  }
}

export class CooldownGCD extends Cooldown {
  constructor(name, duration, timeLeft, player) {
    super(name, duration, timeLeft)
    this.isPlayerInput = true

    this.player = player
  }

  // Getters

  get timeLeft() {
    return m.max(this.player.gcd._timeLeft, this._timeLeft)
  }

  // Methods

  use() {
    super.use()
    this.player.gcd.use()
  }
}
