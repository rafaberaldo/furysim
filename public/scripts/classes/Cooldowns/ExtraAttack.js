class ExtraAttack extends Cooldown {
  constructor(name, chance, procMultiple, player) {
    super(name, procMultiple ? 0 : 0.1, 0)
    this.chance = chance
    this.log = player.log.set(this.name, true)

    this.player = player
  }

  // Getters

  get canUse() {
    if (this.onCooldown) return

    return true
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
