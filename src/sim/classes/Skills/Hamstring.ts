import Player from '@/sim/classes/Player'
import Skill from '@/sim/classes/Skill'

export default class Hamstring extends Skill {
  constructor(player: Player, cfg: any) {
    const cost = 10 - (cfg.pvpGloves ? 3 : 0)
    super(player, 'Hamstring', cost, 0, true, cfg)
  }

  // Getters

  get dmg() {
    return 45
  }

  get canUse() {
    if (!this.cfg.canUse) return false
    if (!super.canUse) return false
    if (!this.player.checkBtCd(this.cfg.btWwCooldown || 0)) return false
    if (!this.player.checkWwCd(this.cfg.btWwCooldown || 0)) return false
    if (!this.player.rage.has(this.cfg.rage || this.cost)) return false

    return true
  }
}
