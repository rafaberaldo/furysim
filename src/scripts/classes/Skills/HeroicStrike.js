import Skill from '@/scripts/classes/Skill'

export default class HeroicStrike extends Skill {
  constructor(player, useWhen) {
    const heroicCost = 15 - player.talents.impHS
    super('Heroic Strike', heroicCost, 0, false, player, useWhen)

    this.isQueued = false
    this.queue = new HeroicStrikeQueue(this)
  }

  // Getters

  get dmg() {
    return this.player.mainhand.dmg + 138
  }

  get canQueue() {
    if (!this.useWhen.canUse) return false
    if (this.isQueued) return false
    if (!super.canUse) return false
    if (!this.player.rage.has(this.useWhen.rage || this.cost)) return false

    return true
  }

  // Methods

  tryToQueue() {
    if (this.isQueued) return
    if (!this.canQueue) return

    this.isQueued = true
    this.player.addTimeline(this.cooldown.name, 'SKILL_QUEUED')
  }

  reset() {
    super.reset()
    this.isQueued = false
  }
}

class HeroicStrikeQueue {
  constructor(heroicStrike) {
    this.name = 'Heroic Strike Queue'
    this.heroicStrike = heroicStrike
    this.isPlayerInput = true
  }

  // Getters

  get canUse() {
    return this.heroicStrike.canQueue
  }

  get timeLeft() {
    return this.heroicStrike.timeLeft
  }

  // Methods

  tick(secs) {
    this.heroicStrike.tick(secs)
  }

  use() {
    this.heroicStrike.tryToQueue()
  }
}
