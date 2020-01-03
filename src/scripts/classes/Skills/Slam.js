import Skill from '@/scripts/classes/Skill'
import SlamCast from '@/scripts/classes/Cooldowns/SlamCast'

import { m } from '@/scripts/helpers'

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
    return m.max(this.cooldown.timeLeft, this.cast.timeLeft)
  }

  // Methods

  use() {
    this.player.heroicStrike.isQueued = false
    const result = super.use()
    this.isCasting = false

    // If Autoslam finish before swing timer, swing don't connect
    if (this.swingTimer.timeLeft > 0) this.swingTimer.forceUse()

    // NC: if Slam miss, swing also don't connect
    if (this.isResultMiss(result)) this.swingTimer.forceUse()
  }
}
