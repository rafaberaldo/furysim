class Hamstring extends Skill {
  constructor(player, useWhen) {
    super('Hamstring', 10, 0, true, useWhen, player)
  }

  // Getters

  get dmg() {
    return this.player.mainhand.normalizedDmg + 45
  }

  get canUse() {
    if (!super.canUse) return
    if (!this.player.checkBtCd(this.useWhen.btCooldown || 0)) return
    if (!this.player.checkWwCd(this.useWhen.wwCooldown || 0)) return
    if (!this.player.rage.has(this.useWhen.rage || this.cost)) return

    return true
  }
}
