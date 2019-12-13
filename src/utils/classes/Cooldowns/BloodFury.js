import { CooldownGCD } from '../Cooldown'

export default class BloodFury extends CooldownGCD {
  constructor(player) {
    super('Blood Fury', 60, 0, player)

    this.buffDuration = 15 * 1000
    this.buffDurationLeft = 0
  }

  // Getters

  get isActive() {
    return this.buffDurationLeft > 0
  }

  // Methods

  tick(tick) {
    super.tick()
    if (this.buffDurationLeft === 1) {
      this.player.addTimeline(tick+1, this.name, 'BUFF_FADED', null)
    }
    this.buffDurationLeft = Math.max(0, --this.buffDurationLeft)
  }

  use(tick) {
    super.use()
    this.buffDurationLeft = this.buffDuration
    this.player.addTimeline(tick, this.name, 'BUFF_APPLIED', this.buffDuration / 1000)
  }
}
