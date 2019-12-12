import Cooldown from '../Cooldown'

export default class AngerManagement extends Cooldown {
  constructor(player) {
    super('Anger Management', 3, 3000)

    this.player = player
  }

  // Methods

  handle() {
    this.player.rage.gain(1)
  }
}
