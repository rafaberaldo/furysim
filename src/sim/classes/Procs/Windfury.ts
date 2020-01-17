import { Cooldown } from '@/sim/classes/Cooldown'
import Player from '@/sim/classes/Player'
import Proc from '@/sim/classes/Proc'
import { m } from '@/sim/helpers'

export default class Windfury extends Proc {
  private _charges: number
  private _chargesLeft: number
  private _impWf: boolean
  cooldown: Cooldown

  constructor(player: Player, impWf: boolean) {
    super('Windfury', 1.5, { chance: 0.2 }, player)
    this._charges = 2
    this._chargesLeft = 0
    this._impWf = impWf

    this.cooldown = new Cooldown(this.name, 0.1, 0)
  }

  // Getters

  get ap() {
    return 315 * (this._impWf ? 1.3 : 1)
  }

  get isActive() {
    return super.isActive && this._chargesLeft > 0
  }

  // Methods

  tick(secs: number) {
    super.tick(secs)
    this.cooldown.tick(secs)
  }

  reset() {
    super.reset()
    this._chargesLeft = 0
  }

  apply() {
    this._chargesLeft = this._charges
    super.apply()
    this.cooldown.use()
    this.player.mainhand.swing(true)
  }

  useCharge() {
    if (!this._chargesLeft || !super.isActive) return

    this._chargesLeft = m.max(0, --this._chargesLeft)

    if (this._chargesLeft > 0) return
    this._buffDurationLeft = 0
    this.player.addTimeline(this.name, 'BUFF_FADED')
  }

  tryToProc() {
    if (this.isActive || this.cooldown.onCooldown) return
    return super.tryToProc()
  }
}
