export default class Cooldown {
  constructor(name, duration, timeLeft = 0) {
    this.name = name
    this.duration = duration * 1000
    this.timeLeft = timeLeft
  }

  // Getters

  get canUse() {
    return this.timeLeft === 0
  }

  // Methods

  tick(ms = 1) {
    this.timeLeft = Math.max(0, this.timeLeft - ms)
  }

  use() {
    if (this.timeLeft > 0) {
      throw new Error (`Trying use ${this.name} before it is ready`)
    }

    this.timeLeft = this.duration
    if (this.handle) this.handle()
  }

  // force(duration = this.duration) {
  //   this.timeLeft = duration
  // }

  reset() {
    this.timeLeft = 0
  }
}
