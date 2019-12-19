class Bloodrage extends Cooldown {
  constructor(player, useWhen) {
    super('Bloodrage', 60, 0)

    this.useWhen = useWhen
    this.isPlayerInput = true
    this.periodic = new BloodragePeriodic(player)

    this.player = player
  }

  // Getters

  get canUse() {
    if (!super.canUse) return
    if (!this.player.rage.lessThan(this.useWhen.rage || 100)) return
    if (this.player.slam && this.player.slam.isCasting) return

    return true
  }

  // Methods

  use() {
    super.use()
    this.player.rage.gain(10)
    this.player.addTimeline(this.name, 'RAGE_GAIN')
    this.periodic.start()
  }
}
