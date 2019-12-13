export class Cooldown {
  constructor(name, duration, timeLeft = 0) {
    this.name = name
    this._duration = duration * 1000
    this._timeLeft = timeLeft
  }

  // Setters

  set duration(value) {
    this._duration = Math.round(value)
  }

  set timeLeft(value) {
    this._timeLeft = Math.round(value)
  }

  // Getters

  get duration() {
    return this._duration
  }

  get timeLeft() {
    return this._timeLeft
  }

  get canUse() {
    return this.timeLeft === 0
  }

  // Methods

  tick() {
    this.timeLeft = Math.max(0, --this.timeLeft)
  }

  use() {
    if (this.timeLeft > 0) {
      throw new Error (`Trying use ${this.name} before it is ready`)
    }

    this.timeLeft = this.duration
  }
}

export class CooldownGCD extends Cooldown {
  constructor(name, duration, timeLeft, player) {
    super(name, duration, timeLeft)

    this.player = player
  }

  // Getters

  get canUse() {
    return super.canUse && this.player.gcd.canUse
  }

  // Methods

  use() {
    super.use()
    this.player.gcd.use()
  }
}
