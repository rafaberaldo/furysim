import Buff from '@/sim/classes/Buff'
import Player from '@/sim/classes/Player'
import { getRandomInt } from '@/sim/helpers'

export default class MightyRagePotion extends Buff {
  constructor(player: Player, private cfg: any) {
    super(player, 'Mighty Rage Potion', 0, 20, 120, false)
  }

  // Getters

  get canUse() {
    if (!super.canUse) return false
    if (this.cfg.waitExecute && !this.player.execute.onPhase) return false
    if (this.cfg.waitCrusader && !this.player.hasCrusaderProc) return false
    if (this.cfg.waitDeathWish && !this.player.isDeathWishActive) return false
    if (!this.player.rage.lessThan(this.cfg.rage || 100)) return false
    if (this.player.slam && this.player.slam.isCasting) return false

    return true
  }

  // Methods

  use() {
    super.use()
    this.player.rage.gain(getRandomInt(45, 75))
    this.player.addTimeline(this.name, 'RAGE_GAIN')
  }
}
