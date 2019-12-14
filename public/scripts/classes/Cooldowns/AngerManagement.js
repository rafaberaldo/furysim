class AngerManagement extends Cooldown {
  constructor(player) {
    super('Anger Management', 3, 3)

    this.player = player
  }

  // Methods

  use(time) {
    super.use()
    this.player.rage.gain(1)
    // this.player.addTimeline(time, this.name, 'RAGE_GAIN', 1)
  }
}
