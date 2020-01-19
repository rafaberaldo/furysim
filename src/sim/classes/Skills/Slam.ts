import SlamCast from '@/sim/classes/Cooldowns/SlamCast'
import Player from '@/sim/classes/Player'
import Skill from '@/sim/classes/Skill'

export default class Slam extends Skill {
  private _isCasting: boolean
  cast: SlamCast

  constructor(player: Player, cfg: any) {
    super(player, 'Slam', 15, 0, false, cfg)

    this._isCasting = false
    this.cast = new SlamCast(this, player, cfg)
  }

  // Getters

  get isPlayerInput() {
    return false
  }

  get isCasting() {
    return this._isCasting
  }

  get dmg() {
    return this.player.mainhand.dmg + 87
  }

  get canUse() {
    if (!this.player.rage.has(this.cost)) return false
    if (!this._isCasting) return false

    return true
  }

  get timeLeft() {
    return this.cast.timeLeftCast
  }

  // Methods

  startCast() {
    this._isCasting = true
  }

  use() {
    this.player.heroicStrike.cancelQueue()
    super.use()
    this._isCasting = false

    // Slam restart swing
    this.player.weapons.forEach(w => w.swingTimer.restart(true))
  }

  reset() {
    super.reset()
    this._isCasting = false
  }
}
