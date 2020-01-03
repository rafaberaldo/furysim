import Skill from '@/scripts/classes/Skill'

export default class Execute extends Skill {
  constructor(player, useWhen) {
    super('Execute', player.executeCost, 0, true, player, useWhen)

    // NC: Execute refund 84% of extra rage only
    this.missRefundMul = 1
    this.extraMissRefundMul = 1 - 0.84
  }

  // Getters

  get dmg() {
    return 600 + (this.player.rage.current - this.player.executeCost) * 15
  }

  get canUse() {
    if (!super.canUse) return false
    if (this.player.time < this.useWhen.start) return false
    if (
      this.useWhen.bloodthirst.priority &&
      !this.player.bloodthirst.onCooldown &&
      this.player.bloodthirst.canUse &&
      this.player.ap >= this.useWhen.bloodthirst.ap
    ) return false

    return true
  }

  // Methods

  use() {
    const result = super.use()

    this.isResultMiss(result)
      ? this.player.rage.use(this.player.rage.current * this.extraMissRefundMul)
      : this.player.rage.current = 0

    this.player.addTimeline(this.name, 'RAGE_REMOVAL')
  }
}
