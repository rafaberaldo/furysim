class Windfury extends Aura {
  constructor(player) {
    super('Windfury AP', 1.5, null, null, player)
    this.name = 'Windfury AP'
    this.charges = 2
    this.chargesLeft = 0
    this.chance = 0.2

    this.cooldown = new Cooldown(this.name, 0.1, 0)

    this.player = player
  }

  // Getters

  get isActive() {
    return super.isActive && this.chargesLeft > 0
  }

  // Methods

  tick(secs) {
    super.tick(secs)
    this.cooldown.tick(secs)
  }

  apply() {
    this.chargesLeft = this.charges
    super.apply()
    this.cooldown.use()
    this.player.mainhand.swingTimer.reset()
    this.player.mainhand.swing(true)
  }

  useCharge() {
    if (!this.chargesLeft) return

    this.chargesLeft = m.max(0, --this.chargesLeft)

    if (this.chargesLeft > 0) return
    this.timeLeft = 0
    this.player.addTimeline(this.name, 'BUFF_FADED')
  }

  tryToProc() {
    if (this.isActive || this.cooldown.onCooldown) return
    return super.tryToProc()
  }
}
