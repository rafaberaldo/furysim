class DeathWish extends CooldownGCD {
  constructor(player) {
    super('Death Wish', 180, 0, player)

    this.buffDuration = 30
    this.buffDurationLeft = 0
    this.cost = 10
  }

  // Getters

  get isActive() {
    return this.buffDurationLeft > 0
  }

  get canUse() {
    return super.canUse && this.player.rage.has(this.cost)
  }

  // Methods

  tick(time, secs) {
    super.tick(time, secs)
    if (!this.buffDurationLeft) return

    this.buffDurationLeft = Math.max(0, this.buffDurationLeft - secs)

    if (this.buffDurationLeft) return
    this.player.addTimeline(time, this.name, 'BUFF_FADED')
  }

  use(time) {
    super.use()
    this.buffDurationLeft = this.buffDuration
    this.player.rage.use(this.cost)
    this.player.addTimeline(time, this.name, 'BUFF_APPLIED', this.buffDuration)
  }
}
