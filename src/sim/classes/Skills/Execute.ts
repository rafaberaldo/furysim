import Player from '@/sim/classes/Player'
import Skill from '@/sim/classes/Skill'

export default class Execute extends Skill {
  private _extraMissRefundMul: number

  constructor(_player: Player, _cfg: any) {
    const executeCost = 15 - (_player.talents.impExecute && _player.talents.impExecute * 3 - 1) || 0
    super('Execute', executeCost, 0, true, _player, _cfg)

    // NC: Execute refund 84% of extra rage only
    this._missRefundMul = 1
    this._extraMissRefundMul = 1 - 0.84
  }

  // Getters

  get dmg() {
    return 600 + (this._player.rage.current - this.cost) * 15
  }

  get onPhase() {
    return this._player.time >= this._cfg.start
  }

  get canUse() {
    if (!super.canUse) return false
    if (!this.onPhase) return false
    if (
      this._cfg.bloodthirst.priority &&
      (this._player.bloodthirst && !this._player.bloodthirst.onCooldown) &&
      (this._player.bloodthirst && this._player.bloodthirst.canUse) &&
      this._player.ap >= this._cfg.bloodthirst.ap
    ) return false

    return true
  }

  // Methods

  use() {
    super.use()

    this.isResultMiss
      ? this._player.rage.use(this._player.rage.current * this._extraMissRefundMul)
      : this._player.rage.removal()

    this._player.addTimeline(this.name, 'RAGE_REMOVAL')
  }
}
