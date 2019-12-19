class Aura {
  constructor(name, duration, ppm, speed, player) {
    this._buffDurationLeft = 0
    this._buffDuration = duration
    this.name = name
    this.chance = ppmToChance(ppm, speed)
    this.log = player.log.set(name, true)

    this.player = player
  }

  // Getters

  get isActive() {
    return !!this._buffDurationLeft
  }

  // Methods

  tick(secs) {
    if (!this._buffDurationLeft) return

    this._buffDurationLeft = m.max(0, this._buffDurationLeft - secs)
    this.log.uptime += m.min(secs, this._buffDurationLeft)

    if (this.isActive) return
    this.player.addTimeline(this.name, 'BUFF_FADED')
  }

  apply() {
    this._buffDurationLeft = this._buffDuration
    this.log.count++
    this.player.addTimeline(this.name, 'BUFF_APPLIED', this._buffDuration)
  }

  tryToProc() {
    if (m.random() > this.chance) return

    this.apply()
    return true
  }
}
