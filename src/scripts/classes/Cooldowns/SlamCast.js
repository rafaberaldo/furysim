import { CooldownGCD } from '@/scripts/classes/Cooldown'

export default class SlamCast extends CooldownGCD {
  constructor(slam, player, useWhen) {
    const slamCast = 1.5 - player.talents.impSlam * 0.1
    super('Slam', slamCast, 0, player)

    this.slam = slam
    this.useWhen = useWhen
    this.swingTimer = player.mainhand.swingTimer
  }

  // Getters

  get canUse() {
    if (!this.useWhen.canUse) return false
    if (this.slam.isCasting) return false
    if (!super.canUse) return false
    if (!this.player.rage.has(this.useWhen.rage || this.slam.cost)) return false
    if (!this.player.checkBtCd(this.useWhen.btCooldown || 0)) return false
    if (!this.player.checkWwCd(this.useWhen.wwCooldown || 0)) return false
    if (this.swingTimer.timeElapsed > (this.useWhen.delay || 0)) return false

    return true
  }

  // Methods

  use() {
    super.use()
    this.slam.isCasting = true
    this.player.addTimeline(this.name, 'CAST_START')
  }
}
