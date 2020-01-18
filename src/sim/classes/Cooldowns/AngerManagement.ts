import { Cooldown } from '@/sim/classes/Cooldown'
import Player from '@/sim/classes/Player'

export default class AngerManagement extends Cooldown {
  constructor(private player: Player) {
    super('Anger Management', 3, 3)
  }

  // Methods

  use() {
    super.use()
    this.player.rage.gain(1)
    this.player.addTimeline(this.name, 'RAGE_GAIN_P')
  }
}
