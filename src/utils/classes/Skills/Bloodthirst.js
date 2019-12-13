import Skill from '../Skill'

export default class Bloodthirst extends Skill {
  constructor(player) {
    super('Bloodthirst', 30, 6, true, player)
  }

  get dmg() {
    return this.player.ap * 0.45 * this.player.dmgMul
  }
}
