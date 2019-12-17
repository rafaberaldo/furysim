class BloodFury extends Buff {
  constructor(player, useWhen) {
    super('Blood Fury', 0, 15, 60, true, player)

    this.useWhen = useWhen
  }

  // Getters

  get canUse() {
    if (!super.canUse) return
    if (this.useWhen.waitCrusader && !this.player.hasCrusaderProc) return
    if (this.useWhen.waitDeathWish && !this.player.isDeathWishActive) return

    return true
  }
}
