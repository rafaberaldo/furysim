import Player from '@/sim/classes/Player'
import Skill from '@/sim/classes/Skill'

export default class Whirlwind extends Skill {
  constructor(player: Player, cfg: any) {
    super(player, 'Whirlwind', 25, 10, true, cfg)

    // WW and Cleve do not refund
    // https://github.com/magey/classic-warrior/issues/27
    this.missRefundMul = 1
  }

  // Getters

  get dmg() {
    return this.player.mainhand.normalizedDmg
  }

  get canUse() {
    if (!this.cfg.canUse) return false
    if (!super.canUse) return false
    if (!this.player.checkBtCd(this.cfg.btCooldown || 0)) return false
    if (!this.player.rage.has(this.cfg.rage || this.cost)) return false

    return true
  }
}
