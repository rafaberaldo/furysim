import Buff from '@/sim/classes/Buff'
import Player from '@/sim/classes/Player'

export default class BloodFury extends Buff {
  cfg: any
  apSnapshot: number

  constructor(player: Player, cfg: any) {
    super('Blood Fury', 0, 15, 60, true, player)
    this.cfg = cfg
    this.apSnapshot = 0
  }

  // Getters

  get canUse() {
    if (!super.canUse) return false
    if (this.cfg.waitDeathWish && !this.player.isDeathWishActive) return false
    if (this.cfg.waitCrusader && !this.player.hasCrusaderProc) return false
    if (
      this.cfg.waitCrusaderOrDeathWish &&
      !this.player.isDeathWishActive &&
      !this.player.hasEveryCrusaderProc
    ) return false
    if (this.player.slam && this.player.slam.isCasting) return false

    return true
  }

  // Methods

  use() {
    const baseAp = Player.getBaseAp(this.player.lvl, this.player.str)
    this.apSnapshot = baseAp * 0.25

    super.use()
  }
}
