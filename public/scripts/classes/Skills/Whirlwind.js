class Whirlwind extends Skill {
  constructor(player, useWhen) {
    super('Whirlwind', 25, 10, true, useWhen, player)
  }

  // Getters

  get dmg() {
    return this.player.mainhand.normalizedDmg
  }

  get canUse() {
    if (!super.canUse) return
    if (!this.player.checkBtCd(this.useWhen.btCooldown || 0)) return

    return this.player.rage.has(this.useWhen.rage || this.cost)
  }
}
