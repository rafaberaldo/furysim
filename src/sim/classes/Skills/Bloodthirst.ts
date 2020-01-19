import Player from '@/sim/classes/Player'
import Skill from '@/sim/classes/Skill'

export default class Bloodthirst extends Skill {
  constructor(player: Player) {
    super(player, 'Bloodthirst', 30, 6, true)
  }

  // Getters

  get dmg() {
    return this.player.ap * 0.45
  }
}
