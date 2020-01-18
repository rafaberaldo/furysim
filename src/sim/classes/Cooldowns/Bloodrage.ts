import { Cooldown } from '@/sim/classes/Cooldown'
import Player from '@/sim/classes/Player'
import { m } from '@/sim/helpers'

export default class Bloodrage extends Cooldown {
  periodic: BloodragePeriodic

  constructor(private player: Player, private cfg: any) {
    super('Bloodrage', 60, 0)
    this.periodic = new BloodragePeriodic(player)
  }

  // Getters

  get isPlayerInput() {
    return true
  }

  get canUse() {
    if (!super.canUse) return false
    if (!this.player.rage.lessThan(this.cfg.rage || 100)) return false
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
  private charges: number
  private chargesLeft: number

  constructor(private player: Player) {
    super('Bloodrage Periodic', 1, 1)
    this.charges = 10
    this.chargesLeft = 0
  }

  // Getters

  get canUse() {
    if (!super.canUse) return false
    if (!this.chargesLeft) return false

    return true
  }

  // Methods

  start() {
    this.chargesLeft = this.charges
    this._timeLeft = 1
    this.player.addTimeline(this.name, 'BUFF_APPLIED')
  }

  use() {
    if (!this.chargesLeft) return

    super.use()
    this.chargesLeft = m.max(0, --this.chargesLeft)
    this.player.rage.gain(1)
    this.player.addTimeline(this.name, 'RAGE_GAIN_P')

    if (this.chargesLeft > 0) return
    this.player.addTimeline(this.name, 'BUFF_FADED')
  }

  reset() {
    super.reset()
    this.chargesLeft = 0
  }
}
