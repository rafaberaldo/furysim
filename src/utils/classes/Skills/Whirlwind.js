import Skill from '../Skill'

export default class Whirlwind extends Skill {
  constructor(player) {
    super('Whirlwind', 25, 10, true, player)
  }

  get dmg() {
    return this.player.mainhand.getNormalizedDmg()
  }
}
