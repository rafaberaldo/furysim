import { CooldownGCD } from '@/sim/classes/Cooldown'
import AttackSpeed from '@/sim/classes/Cooldowns/AttackSpeed'
import Player from '@/sim/classes/Player'
import Slam from '@/sim/classes/Skills/Slam'

export default class SlamCast extends CooldownGCD {
  slam: Slam
  cfg: any
  swingTimer: AttackSpeed

  constructor(slam: Slam, player: Player, cfg: any) {
    const slamCast = 1.5 - player.talents.impSlam * 0.1
    super('Slam', slamCast, 0, player)

    this.slam = slam
    this.cfg = cfg
    this.swingTimer = player.mainhand.swingTimer
  }

  // Getters

  get timeLeftCast() {
    return super._timeLeft
  }

  get canUse() {
    if (!this.cfg.canUse) return false
    if (this.slam.isCasting) return false
    if (!super.canUse) return false
    if (!this._player.rage.has(this.cfg.rage || this.slam.cost)) return false
    if (!this._player.checkBtCd(this.cfg.btCooldown || 0)) return false
    if (!this._player.checkWwCd(this.cfg.wwCooldown || 0)) return false
    if (this.swingTimer.timeElapsed > (this.cfg.delay || 0)) return false

    return true
  }

  // Methods

  use() {
    super.use()
    this.slam.startCast()
    this._player.addTimeline(this.name, 'CAST_START')
  }
}
