class Cooldown {
  constructor(name, duration, timeLeft = 0) {
    this.name = name
    this.duration = duration
    this.timeLeft = timeLeft
  }

  // Getters

  get normTimeLeft() {
    return this.timeLeft
  }

  get onCooldown() {
    return !!this.normTimeLeft
  }

  get canUse() {
    return true
  }

  // Methods

  tick(secs) {
    this.timeLeft = m.max(0, this.timeLeft - secs)
  }

  use() {
    if (this.onCooldown) {
      throw new Error (`Trying use ${this.name} before it is ready`)
    }

    this.timeLeft = this.duration
  }

  reset() {
    this.timeLeft = 0
  }
}

class CooldownGCD extends Cooldown {
  constructor(name, duration, timeLeft, player) {
    super(name, duration, timeLeft)
    this.isPlayerInput = true

    this.player = player
  }

  // Getters

  get normTimeLeft() {
    return m.max(this.player.gcd.timeLeft, this.timeLeft)
  }

  // Methods

  use() {
    super.use()
    this.player.gcd.use()
  }
}
