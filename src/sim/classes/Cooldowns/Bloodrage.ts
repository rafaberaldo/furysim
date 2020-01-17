import { Cooldown } from '@/sim/classes/Cooldown'
import Player from '@/sim/classes/Player'
import { m } from '@/sim/helpers'

export default class Bloodrage extends Cooldown {
  periodic: BloodragePeriodic

  constructor(private _player: Player, private _cfg: any) {
    super('Bloodrage', 60, 0)
    this.periodic = new BloodragePeriodic(_player)
  }

  // Getters

  get isPlayerInput() {
    return true
  }

  get canUse() {
    if (!super.canUse) return false
    if (!this._player.rage.lessThan(this._cfg.rage || 100)) return false
    if (this._player.slam && this._player.slam.isCasting) return false

    return true
  }

  // Methods

  use() {
    super.use()
    this._player.rage.gain(10)
    this._player.addTimeline(this.name, 'RAGE_GAIN')
    this.periodic.start()
  }
}

class BloodragePeriodic extends Cooldown {
  private _charges: number
  private _chargesLeft: number

  constructor(private _player: Player) {
    super('Bloodrage Periodic', 1, 1)
    this._charges = 10
    this._chargesLeft = 0
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
    this._player.addTimeline(this.name, 'BUFF_APPLIED')
  }

  use() {
    if (!this._chargesLeft) return

    super.use()
    this._chargesLeft = m.max(0, --this._chargesLeft)
    this._player.rage.gain(1)
    this._player.addTimeline(this.name, 'RAGE_GAIN_P')

    if (this._chargesLeft > 0) return
    this._player.addTimeline(this.name, 'BUFF_FADED')
  }

  reset() {
    super.reset()
    this._chargesLeft = 0
  }
}
