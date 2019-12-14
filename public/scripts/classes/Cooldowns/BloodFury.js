class BloodFury extends CooldownGCD {
  constructor(player) {
    super('Blood Fury', 60, 0, player)

    this.buffDuration = 15
    this.buffDurationLeft = 0
  }

  // Getters

  get isActive() {
    return this.buffDurationLeft > 0
  }

  // Methods

  tick(time, secs) {
    super.tick(time, secs)
    if (!this.buffDurationLeft) return

    this.buffDurationLeft = Math.max(0, this.buffDurationLeft - secs)

    if (this.buffDurationLeft) return
    this.player.addTimeline(time, this.name, 'BUFF_FADED', null)
  }

  use(time) {
    super.use()
    this.buffDurationLeft = this.buffDuration
    this.player.addTimeline(time, this.name, 'BUFF_APPLIED', this.buffDuration)
  }
}
