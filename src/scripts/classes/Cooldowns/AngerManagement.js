import { Cooldown } from '@/scripts/classes/Cooldown'

export default class AngerManagement extends Cooldown {
  constructor(player) {
    super('Anger Management', 3, 3)

    this.player = player
  }

  // Methods

  use() {
    super.use()
    this.player.rage.gain(1)
    this.player.addTimeline(this.name, 'RAGE_GAIN_P')
  }
}
