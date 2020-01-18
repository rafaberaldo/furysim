import { Cooldown } from '@/sim/classes/Cooldown'
import Player from '@/sim/classes/Player'

export default class EssenceOfTheRed extends Cooldown {
  constructor(private player: Player) {
    super('Essence of the Red', 1, 1)
  }

  // Methods

  use() {
    super.use()
    this.player.rage.gain(20)
    this.player.addTimeline(this.name, 'RAGE_GAIN_P')
  }
}
