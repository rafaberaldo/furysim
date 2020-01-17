import Player from '@/sim/classes/Player'
import Skill from '@/sim/classes/Skill'

export default class Whirlwind extends Skill {
  constructor(_player: Player, _cfg: any) {
    super('Whirlwind', 25, 10, true, _player, _cfg)

    // WW and Cleve do not refund
    // https://github.com/magey/classic-warrior/issues/27
    this._missRefundMul = 1
  }

  // Getters

  get dmg() {
    return this._player.mainhand.normalizedDmg
  }

  get canUse() {
    if (!this._cfg.canUse) return false
    if (!super.canUse) return false
    if (!this._player.checkBtCd(this._cfg.btCooldown || 0)) return false
    if (!this._player.rage.has(this._cfg.rage || this.cost)) return false

    return true
  }
}
