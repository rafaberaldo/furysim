import Skill from '../Skill'

export default class HeroicStrike extends Skill {
  constructor(player) {
    super('Heroic Strike', 15, 0, false, player)

    this.isQueued = false
  }

  // Getters

  get dmg() {
    return this.player.mainhand.getDmg(138)
  }

  get canQueue() {
    return super.canUse && this.player.rage.has(70)
  }

  // Methods

  // TODO make it remove offhand penalty when queued
  queue(tick) {
    if (this.isQueued) return

    this.isQueued = true
    this.player.addTimeline(tick, this.cooldown.name, 'SKILL_QUEUED')
  }
}
