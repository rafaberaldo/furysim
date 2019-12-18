class HandOfJustice extends Cooldown {
  constructor(player) {
    super('Hand of Justice', 0.01, 0)
    this.chance = 0.02
    this.log = player.log.set(this.name, true)

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
    this.log.count++
    this.player.addTimeline(this.name, 'PROC')
    this.player.mainhand.swingTimer.reset()
    this.player.mainhand.swing(true)
  }

  tryToProc() {
    if (!this.canUse) return
    if (m.random() > this.chance) return

    this.use()
    return true
  }
}
