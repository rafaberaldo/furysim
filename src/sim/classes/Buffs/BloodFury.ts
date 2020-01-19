import Buff from '@/sim/classes/Buff'
import Player from '@/sim/classes/Player'

export default class BloodFury extends Buff {
  private _apSnapshot: number

  constructor(player: Player, private cfg: any) {
    super(player, 'Blood Fury', 0, 15, 60, true)
    this._apSnapshot = 0
  }

  // Getters

  get apSnapshot() {
    return this._apSnapshot
  }

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
    this._apSnapshot = baseAp * 0.25

    super.use()
  }
}
