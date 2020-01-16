import { Cooldown } from '@/scripts/classes/Cooldown'
import { m } from '@/scripts/helpers'

export default class ExtraAttack extends Cooldown {
  constructor(name, chance, amount, procMultiple, player) {
    super(name, procMultiple ? 0 : 0.1, 0)
    this.chance = chance
    this.amount = amount
    this.log = player.log.setProc(this.name)

    this.player = player
  }

  // Getters

  get canUse() {
    if (this.onCooldown) return false

    return true
  }

  // Methods

  use() {
    super.use()
    this.log.count++
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
