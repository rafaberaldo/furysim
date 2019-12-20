class HeroicStrike extends Skill {
  constructor(player, useWhen) {
    super('Heroic Strike', player.heroicCost, 0, false, player, useWhen)

    this.isQueued = false
    this.queue = new HeroicStrikeQueue(this)
  }

  // Getters

  get dmg() {
    return this.player.mainhand.dmg + 138
  }

  get canQueue() {
    if (!this.useWhen.canUse) return
    if (this.isQueued) return
    if (!super.canUse) return
    if (!this.player.rage.has(this.useWhen.rage || this.cost)) return

    return true
  }

  // Methods

  tryToQueue() {
    if (this.isQueued) return
    if (!this.canQueue) return

    this.isQueued = true
    this.player.addTimeline(this.cooldown.name, 'SKILL_QUEUED')
  }
}

class HeroicStrikeQueue {
  constructor(heroicStrike) {
    this.name = 'Heroic Strike Queue'
    this.heroicStrike = heroicStrike
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
