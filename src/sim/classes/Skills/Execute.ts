import Player from '@/sim/classes/Player'
import Skill from '@/sim/classes/Skill'

export default class Execute extends Skill {
  private extraMissRefundMul: number

  constructor(player: Player, cfg: any) {
    const executeCost = 15 - (player.talents.impExecute && player.talents.impExecute * 3 - 1) || 0
    super(player, 'Execute', executeCost, 0, true, cfg)

    // NC: Execute refund 84% of extra rage only
    this.missRefundMul = 1
    this.extraMissRefundMul = 1 - 0.84
  }

  // Getters

  get dmg() {
    return 600 + (this.player.rage.current - this.cost) * 15
  }

  get onPhase() {
    return this.player.time >= this.cfg.start
  }

  get canUse() {
    if (!super.canUse) return false
    if (!this.onPhase) return false
    if (
      this.cfg.bloodthirst.priority &&
      (this.player.bloodthirst && !this.player.bloodthirst.onCooldown) &&
      (this.player.bloodthirst && this.player.bloodthirst.canUse) &&
      this.player.ap >= this.cfg.bloodthirst.ap
    ) return false

    return true
  }

  // Methods

  use() {
    super.use()

    this.isResultMiss
      ? this.player.rage.use(this.player.rage.current * this.extraMissRefundMul)
      : this.player.rage.removal()

    this.player.addTimeline(this.name, 'RAGE_REMOVAL')
  }
}
