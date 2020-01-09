import Skill from '@/scripts/classes/Skill'

export default class Whirlwind extends Skill {
  constructor(player, useWhen) {
    super('Whirlwind', 25, 10, true, player, useWhen)

    // WW and Cleve do not refund
    // https://github.com/magey/classic-warrior/issues/27
    this.missRefundMul = 1
  }

  // Getters

  get dmg() {
    return this.player.mainhand.normalizedDmg
  }

  get canUse() {
    if (!this.useWhen.canUse) return false
    if (!super.canUse) return false
    if (!this.player.checkBtCd(this.useWhen.btCooldown || 0)) return false
    if (!this.player.rage.has(this.useWhen.rage || this.cost)) return false

    return true
  }
}
