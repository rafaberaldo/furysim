class HeroicStrike extends Skill {
  constructor(player, useWhen) {
    super('Heroic Strike', player.heroicCost, 0, false, useWhen, player)

    this.isQueued = false
  }

  // Getters

  get dmg() {
    return this.player.mainhand.dmg + 138
  }

  get canQueue() {
    if (!super.canUse) return

    return this.player.rage.has(this.useWhen.rage || this.cost)
  }

  // Methods

  queue() {
    if (this.isQueued) return
    if (!this.canQueue) return

    this.isQueued = true
    this.player.addTimeline(this.cooldown.name, 'SKILL_QUEUED')
  }
}
