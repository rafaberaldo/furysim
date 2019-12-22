import Buff from '@/scripts/classes/Buff'

export default class BloodFury extends Buff {
  constructor(player, useWhen) {
    super('Blood Fury', 0, 15, 60, true, player)

    this.useWhen = useWhen
  }

  // Getters

  get canUse() {
    if (!super.canUse) return false
    if (this.useWhen.waitCrusader && !this.player.hasCrusaderProc) return false
    if (this.useWhen.waitDeathWish && !this.player.isDeathWishActive) return false
    if (this.player.slam && this.player.slam.isCasting) return false

    return true
  }
}
