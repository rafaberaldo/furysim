class Buff {
  constructor(name, cost, buffDuration, cooldown, triggerGcd, player, timeLeft = 0) {
    this.name = name
    this.buffDuration = buffDuration
    this.buffDurationLeft = 0
    this.cost = cost

    this.cooldown = triggerGcd
      ? new CooldownGCD(name, cooldown, timeLeft, player)
      : new Cooldown(name, cooldown, timeLeft)

    this.player = player
  }

  // Getters

  get isActive() {
    return this.buffDurationLeft > 0
  }

  get canUse() {
    if (this.isActive) return
    if (!this.player.rage.has(this.cost)) return

    return true
  }

  get normTimeLeft() {
    return this.cooldown.normTimeLeft
  }

  // Methods

  tick(secs) {
    this.cooldown.tick(secs)
    if (!this.buffDurationLeft) return

    this.buffDurationLeft = m.max(0, this.buffDurationLeft - secs)

    if (this.isActive) return
    this.player.addTimeline(this.name, 'BUFF_FADED')
  }

  use() {
    this.cooldown.use()
    this.buffDurationLeft = this.buffDuration
    this.player.rage.use(this.cost)
    this.player.addTimeline(this.name, 'BUFF_APPLIED', this.buffDuration)
  }
}
