import Player from '@/sim/classes/Player'
import Skill from '@/sim/classes/Skill'

export default class HeroicStrike extends Skill {
  private _isQueued: boolean
  queue: HeroicStrikeQueue

  constructor(_player: Player, _cfg: any) {
    const heroicCost = 15 - _player.talents.impHS
    super('Heroic Strike', heroicCost, 0, false, _player, _cfg)

    this._isQueued = false
    this.queue = new HeroicStrikeQueue(this)
  }

  // Getters

  get isQueued() {
    return this._isQueued
  }

  get dmg() {
    return this._player.mainhand.dmg + 138
  }

  get canQueue() {
    if (!this._cfg.canUse) return false
    if (this._isQueued) return false
    if (!super.canUse) return false
    if (!this._player.rage.has(this._cfg.rage || this.cost)) return false

    return true
  }

  // Methods

  tryToQueue() {
    if (this._isQueued) return
    if (!this.canQueue) return

    this._isQueued = true
    this._player.addTimeline(this.name, 'SKILL_QUEUED')
  }

  cancelQueue() {
    this._isQueued = false
  }

  reset() {
    super.reset()
    this._isQueued = false
  }
}

class HeroicStrikeQueue {
  name: string
  heroicStrike: HeroicStrike
  isPlayerInput: boolean

  constructor(heroicStrike: HeroicStrike) {
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

  handle() {
    this.heroicStrike.tryToQueue()
  }

  tick(secs: number) {
    this.heroicStrike.tick(secs)
  }
}
