class Cooldown {
  constructor(name, duration, timeLeft = 0) {
    this.name = name
    this.duration = duration
    this.timeLeft = timeLeft
  }

  // Getters

  get onCooldown() {
    return !!this.timeLeft
  }

  get normTimeLeft() {
    return this.timeLeft
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

    this.player = player
  }

  // Getters

  get normTimeLeft() {
    const latency = getRandom(this.player.latency.min, this.player.latency.max) / 1000
    return m.max(this.player.gcd.timeLeft, this.timeLeft) + latency
  }

  // Methods

  use() {
    super.use()
    this.player.gcd.use()
  }
}
