import { Cooldown } from '../Cooldown'

export default class AngerManagement extends Cooldown {
  constructor(player) {
    super('Anger Management', 3, 3000)

    this.player = player
  }

  // Methods

  // eslint-disable-next-line no-unused-vars
  use(tick) {
    super.use()
    this.player.rage.gain(1)
    // this.player.addTimeline(tick, this.name, 'RAGE_GAIN', 1)
  }
}
