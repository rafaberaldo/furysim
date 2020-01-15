import { Cooldown } from '@/scripts/classes/Cooldown'

export default class EssenceOfTheRed extends Cooldown {
  constructor(player) {
    super('Essence of the Red', 1, 1)

    this.player = player
  }

  // Methods

  use() {
    super.use()
    this.player.rage.gain(20)
    this.player.addTimeline(this.name, 'RAGE_GAIN_P')
  }
}
