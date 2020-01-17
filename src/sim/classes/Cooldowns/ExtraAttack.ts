import { Cooldown } from '@/sim/classes/Cooldown'
import Player from '@/sim/classes/Player'
import { m } from '@/sim/helpers'

export default class ExtraAttack extends Cooldown {
  private _chance: number
  private _amount: number
  log: any
  player: Player

  constructor(name: string, chance: number, amount: number, procMultiple: boolean, player: Player) {
    super(name, procMultiple ? 0 : 0.1, 0)
    this._chance = chance
    this._amount = amount
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
    for (let i = 0; i < this._amount; i++) {
      this.player.mainhand.swing(true)
    }
  }

  tryToProc() {
    if (!this.canUse) return
    if (m.random() > this._chance) return

    this.use()
    return true
  }
}
