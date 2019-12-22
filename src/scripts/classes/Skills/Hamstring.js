import Skill from '@/scripts/classes/Skill'

export default class Hamstring extends Skill {
  constructor(player, useWhen) {
    super('Hamstring', 10, 0, true, player, useWhen)
  }

  // Getters

  get dmg() {
    return 45
  }

  get canUse() {
    if (!this.useWhen.canUse) return false
    if (!super.canUse) return false
    if (!this.player.checkBtCd(this.useWhen.btWwSlamCooldown || 0)) return false
    if (!this.player.checkWwCd(this.useWhen.btWwSlamCooldown || 0)) return false
    if (!this.player.checkSlamCd(this.useWhen.btWwSlamCooldown || 0)) return false
    if (!this.player.rage.has(this.useWhen.rage || this.cost)) return false

    return true
  }
}
