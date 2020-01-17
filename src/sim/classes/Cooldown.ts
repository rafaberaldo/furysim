import Player from '@/sim/classes/Player'
import { m } from '@/sim/helpers'

export class Cooldown {
  protected _defaultTimeLeft: number
  protected _defaultDuration: number

  constructor(public name: string, protected _duration: number, protected _timeLeft: number = 0) {
    this._defaultTimeLeft = _timeLeft
    this._defaultDuration = _duration
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
    this._timeLeft = this._defaultTimeLeft
    this._duration = this._defaultDuration
  }
}

export class CooldownGCD extends Cooldown {
  constructor(name: string, duration: number, timeLeft: number, protected _player: Player) {
    super(name, duration, timeLeft)
  }

  // Getters

  get isPlayerInput() {
    return true
  }

  get timeLeft() {
    return m.max(this._player.gcd.timeLeft, this._timeLeft)
  }

  // Methods

  use() {
    super.use()
    this._player.gcd.use()
  }
}
