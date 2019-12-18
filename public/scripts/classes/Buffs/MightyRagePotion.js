class MightyRagePotion extends Buff {
  constructor(player, useWhen) {
    super('Mighty Rage Potion', 0, 20, 120, false, player)

    this.useWhen = useWhen
  }

  // Getters

  get canUse() {
    if (!super.canUse) return
    if (this.useWhen.waitCrusader && !this.player.hasCrusaderProc) return
    if (this.useWhen.waitDeathWish && !this.player.isDeathWishActive) return
    if (!this.player.rage.lessThan(this.useWhen.rage || 100)) return

    return true
  }

  // Methods

  use() {
    super.use()
    this.player.rage.gain(getRandomInt(45, 75))
    this.player.addTimeline(this.name, 'RAGE_GAIN')
  }
}
