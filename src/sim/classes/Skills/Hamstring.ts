import Player from '@/sim/classes/Player'
import Skill from '@/sim/classes/Skill'

export default class Hamstring extends Skill {
  constructor(_player: Player, _cfg: any) {
    const cost = 10 - (_cfg.pvpGloves ? 3 : 0)
    super('Hamstring', cost, 0, true, _player, _cfg)
  }

  // Getters

  get dmg() {
    return 45
  }

  get canUse() {
    if (!this._cfg.canUse) return false
    if (!super.canUse) return false
    if (!this._player.checkBtCd(this._cfg.btWwCooldown || 0)) return false
    if (!this._player.checkWwCd(this._cfg.btWwCooldown || 0)) return false
    if (!this._player.rage.has(this._cfg.rage || this.cost)) return false

    return true
  }
}
