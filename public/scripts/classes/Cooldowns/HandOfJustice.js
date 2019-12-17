class HandOfJustice extends Cooldown {
  constructor(player) {
    super('Hand of Justice', 0.01, 0)
    this.chance = 0.2

    this.player = player
  }

  // Getters

  get canUse() {
    if (!super.canUse) return

    return !this.timeLeft
  }

  // Methods

  use() {
    super.use()
    this.player.addTimeline(this.name, 'PROC')
    this.player.mainhand.swingTimer.reset()
    this.player.mainhand.swing()
  }

  tryToProc() {
    if (!this.canUse) return

    if (Math.random() <= this.chance) this.use()
  }
}
