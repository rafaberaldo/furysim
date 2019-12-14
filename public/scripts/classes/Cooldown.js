class Cooldown {
  constructor(name, duration, timeLeft = 0) {
    this.name = name
    this._duration = Number(duration.toFixed(3))
    this._timeLeft = Number(timeLeft.toFixed(3))
  }

  // Setters

  set duration(value) {
    this._duration = Number(value.toFixed(3))
  }

  set timeLeft(value) {
    this._timeLeft = Number(value.toFixed(3))
  }

  // Getters

  get duration() {
    return this._duration
  }

  get timeLeft() {
    return this._timeLeft
  }

  get canUse() {
    return true
  }

  // Methods

  tick(time, secs) {
    this._timeLeft = Math.max(0, this.timeLeft - secs)
  }

  use() {
    if (this.timeLeft > 0) {
      throw new Error (`Trying use ${this.name} before it is ready`)
    }

    this._timeLeft = this.duration
  }

  reset() {
    this._timeLeft = this.duration
  }
}

class CooldownGCD extends Cooldown {
  constructor(name, duration, timeLeft, player) {
    super(name, duration, timeLeft)

    this.player = player
  }

  // Getters

  get timeLeft() {
    return Math.max(this.player.gcd.timeLeft, this._timeLeft)
  }

  // Methods

  use() {
    super.use()
    this.player.gcd.use()
  }
}
