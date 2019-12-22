import Buff from '@/scripts/classes/Buff'

export default class BloodragePeriodic extends Buff {
  constructor(player) {
    // 11 secs because first second does not give rage
    super('Bloodrage Periodic', 0, 11, 1, false, player)
  }

  // Getters

  get canUse() {
    return this.isActive
  }

  // Methods

  start() {
    super.use()
  }

  use() {
    this.cooldown.use()
    this.player.rage.gain(1)
    // this.player.addTimeline(this.name, 'RAGE_GAIN')
  }
}
