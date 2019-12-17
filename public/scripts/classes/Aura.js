class Aura {
  constructor(name, duration, ppm, speed, player) {
    this.name = name
    this.duration = duration
    this.timeLeft = 0
    this.chance = ppmToChance(ppm, speed)

    this.player = player
  }

  // Getters

  get isActive() {
    return !!this.timeLeft
  }

  // Methods

  tick(secs) {
    if (!this.timeLeft) return

    this.timeLeft = m.max(0, this.timeLeft - secs)

    if (this.isActive) return
    this.player.addTimeline(this.name, 'BUFF_FADED')
  }

  apply() {
    this.timeLeft = this.duration
    this.player.addTimeline(this.name, 'BUFF_APPLIED', this.duration)
  }

  tryToProc() {
    if (Math.random() <= this.chance) this.apply()
  }
}
