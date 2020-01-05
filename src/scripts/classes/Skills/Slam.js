import Skill from '@/scripts/classes/Skill'
import SlamCast from '@/scripts/classes/Cooldowns/SlamCast'

export default class Slam extends Skill {
  constructor(player, useWhen) {
    super('Slam', 15, 0, false, player, useWhen)

    this.isPlayerInput = false
    this.isCasting = false
    this.cast = new SlamCast(this, player, useWhen)
    this.swingTimer = player.mainhand.swingTimer
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
    const result = super.use()
    this.isCasting = false

    // If Slam finish before swing timer, swing is lost
    if (this.swingTimer.timeLeft > 0) this.swingTimer.forceUse()

    // NC: if Slam miss, swing is lost
    if (this.isResultMiss(result)) this.swingTimer.forceUse()
  }
}
