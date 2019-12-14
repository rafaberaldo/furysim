class Aura {
  constructor(name, duration) {
    this.name = name
    this.duration = duration
    this.timeLeft = 0
  }

  // Getters

  get isActive() {
    return this.timeLeft > 0
  }

  // Methods

  tick(time, secs) {
    if (!this.timeLeft) return

    this.timeLeft = Math.max(0, this.timeLeft - secs)
    this.player.addTimeline(time, this.name, 'BUFF_FADED')
  }

  gain(time) {
    this.timeLeft = this.duration
    this.player.addTimeline(time, this.name, 'BUFF_APPLIED', this.duration)
  }
}
