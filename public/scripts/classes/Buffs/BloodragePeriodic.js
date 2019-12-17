class BloodragePeriodic extends Buff {
  constructor(player) {
    // 11 secs because first second does not give rage
    super('Bloodrage Periodic', 0, 11, 1, false, player)
  }

  // Getters

  get canUse() {
    return this.isActive
  }

  get normTimeLeft() {
    return this.cooldown.normTimeLeft
  }

  get isActive() {
    return this.buffDurationLeft > 0
  }

  // Methods

  start() {
    super.use()
  }

  use() {
    this.cooldown.use()
    this.player.rage.gain(1)
    // this.player.addTimeline(this.name, 'RAGE_GAIN')
  }
}
