import Skill from '../Skill'

export default class Bloodthirst extends Skill {
  constructor(player) {
    super('Bloodthirst', 30, 6, player)
  }

  get dmg() {
    // TODO add multiplier (Death Wish)
    return this.player.ap * 0.45
  }

  get canUse() {
    return this.player.rage.has(this.cost) && this.cooldown.canUse
  }
}
