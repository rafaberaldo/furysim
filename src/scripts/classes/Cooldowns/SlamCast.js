import { CooldownGCD } from '@/scripts/classes/Cooldown'

import { m } from '@/scripts/helpers'

export default class SlamCast extends CooldownGCD {
  constructor(slam, player, useWhen) {
    const slamCast = 1.5 - player.talents.impSlam * 0.1
    super('Slam Cast', slamCast, 0, player)

    this.slam = slam
    this.useWhen = useWhen
    this.swingTimer = player.mainhand.swingTimer
  }

  // Getters

  get canSpam() {
    return this.useWhen.canSpam && this.player.rage.has(this.useWhen.spamRage)
  }

  get canUse() {
    if (!this.useWhen.canUse) return false
    if (this.slam.isCasting) return false
    if (!super.canUse) return false

    if (this.canSpam) return true // Spam bypass

    if (!this.player.rage.has(this.useWhen.rage || this.slam.cost)) return false
    if (!this.player.checkBtCd(this.useWhen.btCooldown || 0)) return false
    const lessThanSwing = this.swingTimer.timeLeft + this.timeLeft < this.useWhen.swing
    if (!this.canSpam && lessThanSwing) return false

    return true
  }

  get timeLeft() {
    if (this.canSpam) return super.timeLeft

    return m.max(super.timeLeft, this.swingTimer.timeLeft - this.duration)
  }

  // Methods

  use() {
    super.use()
    this.slam.isCasting = true
    this.player.addTimeline(this.name, 'CAST_START')
  }
}
