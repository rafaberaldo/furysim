class Cooldown {
  constructor(name, duration, timeLeft = 0) {
    this._timeLeft = timeLeft
    this._duration = duration
    this.name = name
  }

  // Getters

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

  use() {
    if (this.onCooldown) {
      throw new Error (`Trying use ${this.name} before it is ready`)
    }

    this._timeLeft = this._duration
  }

  reset() {
    this._timeLeft = 0
  }
}

class CooldownGCD extends Cooldown {
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
