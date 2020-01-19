import { CooldownGCD } from '@/sim/classes/Cooldown'
import AttackSpeed from '@/sim/classes/Cooldowns/AttackSpeed'
import Player from '@/sim/classes/Player'
import Slam from '@/sim/classes/Skills/Slam'

export default class SlamCast extends CooldownGCD {
  swingTimer: AttackSpeed

  constructor(private slam: Slam, player: Player, private cfg: any) {
    super(player, 'Slam', (1.5 - player.talents.impSlam * 0.1), 0)

    this.swingTimer = player.mainhand.swingTimer
  }

  // Getters

  get timeLeftCast() {
    return this._timeLeft
  }

  get canUse() {
    if (!this.cfg.canUse) return false
    if (this.slam.isCasting) return false
    if (!super.canUse) return false
    if (!this.player.rage.has(this.cfg.rage || this.slam.cost)) return false
    if (!this.player.checkBtCd(this.cfg.btCooldown || 0)) return false
    if (!this.player.checkWwCd(this.cfg.wwCooldown || 0)) return false
    if (this.swingTimer.timeElapsed > (this.cfg.delay || 0)) return false

    return true
  }

  // Methods

  use() {
    super.use()
    this.slam.startCast()
    this.player.addTimeline(this.name, 'CAST_START')
  }
}
