import Player from '@/sim/classes/Player'
import Skill from '@/sim/classes/Skill'

export default class Bloodthirst extends Skill {
  constructor(_player: Player) {
    super('Bloodthirst', 30, 6, true, _player)
  }

  // Getters

  get dmg() {
    return this._player.ap * 0.45
  }
}
