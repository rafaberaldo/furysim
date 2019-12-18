class Flurry {
  constructor(player) {
    this.name = 'Flurry'
    this.charges = 3
    this.chargesLeft = 0
    this.log = player.log.set(this.name, true)

    this.player = player
    this.haste = player.flurryHaste
  }

  // Getters

  get isActive() {
    return this.chargesLeft > 0
  }

  // Methods

  tick(secs) {
    if (this.isActive) this.log.uptime += secs
  }

  apply() {
    if (!this.isActive) this.player.increaseAtkSpeed(this.haste)

    this.chargesLeft = this.charges
    this.log.count++
    this.player.addTimeline(this.name, 'BUFF_APPLIED')
  }

  useCharge() {
    if (!this.isActive) return

    this.chargesLeft = m.max(0, --this.chargesLeft)

    if (this.isActive) return
    this.player.decreaseAtkSpeed(this.haste)
    this.player.addTimeline(this.name, 'BUFF_FADED')
  }
}
