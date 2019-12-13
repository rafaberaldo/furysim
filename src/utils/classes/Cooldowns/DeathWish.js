import { CooldownGCD } from '../Cooldown'

export default class DeathWish extends CooldownGCD {
  constructor(player) {
    super('Death Wish', 180, 0, player)

    this.buffDuration = 30000
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

  tick(tick) {
    super.tick()
    if (this.buffDurationLeft === 1) {
      this.player.addTimeline(tick+1, this.name, 'BUFF_FADED')
    }
    this.buffDurationLeft = Math.max(0, --this.buffDurationLeft)
  }

  use(tick) {
    super.use()
    this.buffDurationLeft = this.buffDuration
    this.player.rage.use(this.cost)
    this.player.addTimeline(tick, this.name, 'BUFF_APPLIED', this.buffDuration / 1000)
  }
}
