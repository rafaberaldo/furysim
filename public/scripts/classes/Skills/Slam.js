class Slam extends Skill {
  constructor(player, useWhen) {
    super('Slam', 15, 0, false, player, useWhen)

    this.isPlayerInput = false
    this.isCasting = false
    this.cast = new SlamCast(this, player, useWhen)
    this.swingTimer = player.mainhand.swingTimer
  }

  // Getters

  get dmg() {
    return this.player.mainhand.dmg + 87
  }

  get canUse() {
    if (!this.player.rage.has(this.cost)) return
    if (!this.isCasting) return

    return true
  }

  get timeLeft() {
    return m.max(this.cooldown.timeLeft, this.cast.timeLeft)
  }

  // Methods

  use() {
    this.player.heroicStrike.isQueued = false
    super.use()
    this.isCasting = false

    if (this.swingTimer.timeLeft > 0) this.swingTimer.forceUse()
  }
}
