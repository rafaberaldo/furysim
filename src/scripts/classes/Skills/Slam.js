import Skill from '@/scripts/classes/Skill'
import SlamCast from '@/scripts/classes/Cooldowns/SlamCast'

export default class Slam extends Skill {
  constructor(player, useWhen) {
    super('Slam', 15, 0, false, player, useWhen)

    this.isPlayerInput = false
    this.isCasting = false
    this.cast = new SlamCast(this, player, useWhen)
  }

  // Getters

  get dmg() {
    return this.player.mainhand.dmg + 87
  }

  get canUse() {
    if (!this.player.rage.has(this.cost)) return false
    if (!this.isCasting) return false

    return true
  }

  get timeLeft() {
    // Have to get private because GCD
    return this.cast._timeLeft
  }

  // Methods

  use() {
    this.player.heroicStrike.isQueued = false
    super.use()
    this.isCasting = false

    // Slam restart swing
    this.player.weapons.forEach(w => w.swingTimer.restart(true))
  }

  reset() {
    super.reset()
    this.isCasting = false
  }
}
