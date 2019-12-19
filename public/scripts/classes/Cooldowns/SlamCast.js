class SlamCast extends CooldownGCD {
  constructor(slam, useWhen, player) {
    super('SlamCast', player.slamCast, 0, player)

    this.slam = slam
    this.useWhen = useWhen
    this.swingTimer = player.mainhand.swingTimer
  }

  // Getters

  get canSpam() {
    return this.useWhen.spamRage && this.player.rage.has(this.useWhen.spamRage)
  }

  get canUse() {
    // debugger;
    if (!this.useWhen.canUse) return
    if (this.slam.isCasting) return
    if (!super.canUse) return
    if (!this.player.rage.has(this.useWhen.rage || this.slam.cost)) return
    if (!this.player.checkBtCd(this.useWhen.btCooldown || 0)) return

    const lessThanSwing = this.swingTimer.timeLeft + this.timeLeft < this.useWhen.swing
    if (!this.canSpam && lessThanSwing) return

    return true
  }

  get timeLeft() {
    if (this.canSpam) return super.timeLeft

    return m.max(super.timeLeft, this.swingTimer.timeLeft - this.duration)
  }

  // Methods

  use() {
    super.use()
    this.slam.isCasting = true
    this.player.addTimeline(this.name, 'CAST_START')
  }
}
