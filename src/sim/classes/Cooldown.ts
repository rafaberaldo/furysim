import Player from '@/sim/classes/Player'
import { m } from '@/sim/helpers'

export class Cooldown {
  protected defaultTimeLeft: number
  protected defaultDuration: number

  constructor(
    public name: string,
    protected _duration: number,
    protected _timeLeft: number = 0
  ) {
    this.defaultTimeLeft = _timeLeft
    this.defaultDuration = _duration
  }

  // Getters

  get isPlayerInput() {
    return false
  }

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

  handle() {
    this.use()
  }

  tick(secs: number) {
    this._timeLeft = m.max(0, this._timeLeft - secs)
  }

  use(force = false) {
    if (this.onCooldown && !force) {
      throw new Error (`Trying use ${this.name} before it is ready`)
    }

    this._timeLeft = this._duration
  }

  reset() {
    this._timeLeft = this.defaultTimeLeft
    this._duration = this.defaultDuration
  }
}

export class CooldownGCD extends Cooldown {
  constructor(
    protected player: Player,
    name: string,
    duration: number,
    timeLeft: number
  ) {
    super(name, duration, timeLeft)
  }

  // Getters

  get isPlayerInput() {
    return true
  }

  get timeLeft() {
    return m.max(this.player.gcd.timeLeft, this._timeLeft)
  }

  // Methods

  use() {
    super.use()
    this.player.gcd.use()
  }
}
