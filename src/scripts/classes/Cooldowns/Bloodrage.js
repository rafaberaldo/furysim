import { Cooldown } from '@/scripts/classes/Cooldown'
import { m } from '@/scripts/helpers'

export default class Bloodrage extends Cooldown {
  constructor(player, useWhen) {
    super('Bloodrage', 60, 0)

    this.useWhen = useWhen
    this.isPlayerInput = true
    this.periodic = new BloodragePeriodic(player)

    this.player = player
  }

  // Getters

  get canUse() {
    if (!super.canUse) return false
    if (!this.player.rage.lessThan(this.useWhen.rage || 100)) return false
    if (this.player.slam && this.player.slam.isCasting) return false

    return true
  }

  // Methods

  use() {
    super.use()
    this.player.rage.gain(10)
    this.player.addTimeline(this.name, 'RAGE_GAIN')
    this.periodic.start()
  }
}

class BloodragePeriodic extends Cooldown {
  constructor(player) {
    super('Bloodrage Periodic', 1, 1)
    this._charges = 10
    this._chargesLeft = 0

    this.player = player
  }

  // Getters

  get canUse() {
    if (!super.canUse) return false
    if (!this._chargesLeft) return false

    return true
  }

  // Methods

  start() {
    this._chargesLeft = this._charges
    this._timeLeft = 1
    this.player.addTimeline(this.name, 'BUFF_APPLIED')
  }

  use() {
    if (!this._chargesLeft) return

    super.use()
    this._chargesLeft = m.max(0, --this._chargesLeft)
    this.player.rage.gain(1)
    this.player.addTimeline(this.name, 'RAGE_GAIN_P')

    if (this._chargesLeft > 0) return
    this.player.addTimeline(this.name, 'BUFF_FADED')
  }

  reset() {
    super.reset()
    this._chargesLeft = 0
  }
}
