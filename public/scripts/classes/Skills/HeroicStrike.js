class HeroicStrike extends Skill {
  constructor(player) {
    super('Heroic Strike', 15, 0, false, player)

    this.isQueued = false
  }

  // Getters

  get dmg() {
    return this.player.mainhand.getDmg(138)
  }

  get canQueue() {
    return super.canUse && this.player.rage.has(50)
  }

  // Methods

  queue(time) {
    if (this.isQueued) return
    if (!this.canQueue) return

    this.isQueued = true
    this.player.addTimeline(time, this.cooldown.name, 'SKILL_QUEUED')
  }
}
