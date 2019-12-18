class Aura {
  constructor(name, duration, ppm, speed, player) {
    this.name = name
    this.duration = duration
    this.timeLeft = 0
    this.chance = ppmToChance(ppm, speed)
    this.log = player.log.set(name, true)

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
    this.log.uptime += m.min(secs, this.timeLeft)

    if (this.isActive) return
    this.player.addTimeline(this.name, 'BUFF_FADED')
  }

  apply() {
    this.timeLeft = this.duration
    this.log.count++
    this.player.addTimeline(this.name, 'BUFF_APPLIED', this.duration)
  }

  tryToProc() {
    if (m.random() > this.chance) return

    this.apply()
    return true
  }
}
