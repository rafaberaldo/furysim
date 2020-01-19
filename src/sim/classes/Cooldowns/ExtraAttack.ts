import { Cooldown } from '@/sim/classes/Cooldown'
import Player from '@/sim/classes/Player'
import { m } from '@/sim/helpers'

export default class ExtraAttack extends Cooldown {
  constructor(
    private player: Player,
    public name: string,
    private chance: number,
    private amount: number,
    canProcMultiple: boolean
  ) {
    super(name, canProcMultiple ? 0 : 0.1, 0)
  }

  // Getters

  get canUse() {
    if (this.onCooldown) return false

    return true
  }

  // Methods

  use() {
    super.use()
    this.player.addTimeline(this.name, 'PROC')
    for (let i = 0; i < this.amount; i++) {
      this.player.mainhand.swing(true)
    }
  }

  tryToProc() {
    if (!this.canUse) return
    if (m.random() > this.chance) return

    this.use()
    return true
  }
}
