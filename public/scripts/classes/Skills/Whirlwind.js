class Whirlwind extends Skill {
  constructor(player, useWhen) {
    super('Whirlwind', 25, 10, true, useWhen, player)

    // WW and Cleve do not refund
    // https://github.com/magey/classic-warrior/issues/27
    this.missRefundMul = 1
  }

  // Getters

  get dmg() {
    return this.player.mainhand.normalizedDmg
  }

  get canUse() {
    if (!this.useWhen.canUse) return
    if (!super.canUse) return
    if (!this.player.checkBtCd(this.useWhen.btCooldown || 0)) return
    if (!this.player.checkSlamCd(this.useWhen.slamCooldown || 0)) return
    if (!this.player.rage.has(this.useWhen.rage || this.cost)) return

    return true
  }
}
