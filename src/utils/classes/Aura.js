export default class Aura {
  constructor(name, duration) {
    this.name = name
    this.duration = duration * 1000
    this.timeLeft = 0
  }

  // Getters

  get isActive() {
    return this.timeLeft > 0
  }

  // Methods

  tick(tick) {
    if (this.timeLeft === 1) {
      this.player.addTimeline(tick+1, this.name, 'BUFF_FADED')
    }
    this.timeLeft = Math.max(0, --this.timeLeft)
  }

  gain(tick) {
    this.timeLeft = this.duration
    this.player.addTimeline(tick, this.name, 'BUFF_APPLIED', this.duration / 1000)
  }
}