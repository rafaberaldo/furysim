import Proc from '@/scripts/classes/Proc'
import { Cooldown } from '@/scripts/classes/Cooldown'

import { m } from '@/scripts/helpers'

export default class Windfury extends Proc {
  constructor(player) {
    super('Windfury', 1.5, { chance: 0.2 }, player)
    this.charges = 2
    this.chargesLeft = 0

    this.cooldown = new Cooldown(this.name, 0.1, 0)

    this.player = player
  }

  // Getters

  get isActive() {
    return super.isActive && this.chargesLeft > 0
  }

  // Methods

  tick(secs) {
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
    this._buffDurationLeft = 0
    this.player.addTimeline(this.name, 'BUFF_FADED')
  }

  tryToProc() {
    if (this.isActive || this.cooldown.onCooldown) return
    return super.tryToProc()
  }
}
