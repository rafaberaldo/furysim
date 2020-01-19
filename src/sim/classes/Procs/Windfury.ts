import { Cooldown } from '@/sim/classes/Cooldown'
import Player from '@/sim/classes/Player'
import Proc from '@/sim/classes/Proc'
import { m } from '@/sim/helpers'

export default class Windfury extends Proc {
  private charges: number
  private chargesLeft: number
  private cooldown: Cooldown

  constructor(player: Player, private impWf: boolean) {
    super(player, 'Windfury', 1.5, { chance: 0.2 })
    this.charges = 2
    this.chargesLeft = 0
    this.cooldown = new Cooldown(this.name, 0.1, 0)
  }

  // Getters

  get ap() {
    return 315 * (this.impWf ? 1.3 : 1)
  }

  get isActive() {
    return super.isActive && this.chargesLeft > 0
  }

  // Methods

  tick(secs: number) {
    super.tick(secs)
    this.cooldown.tick(secs)
  }

  reset() {
    super.reset()
    this.chargesLeft = 0
  }

  apply() {
    this.chargesLeft = this.charges
    super.apply()
    this.cooldown.use()
    this.player.mainhand.swing(true)
  }

  useCharge() {
    if (!this.chargesLeft || !super.isActive) return

    this.chargesLeft = m.max(0, --this.chargesLeft)

    if (this.chargesLeft > 0) return
    this.buffDurationLeft = 0
    this.player.addTimeline(this.name, 'BUFF_FADED')
  }

  tryToProc() {
    if (this.isActive || this.cooldown.onCooldown) return
    return super.tryToProc()
  }
}
