import Aura from '../Aura'

export default class Flurry extends Aura {
  constructor(player) {
    super('Flurry', 15)

    this.charges = 3
    this.chargesLeft = 0

    this.player = player
  }

  // Getters

  get isActive() {
    return super.isActive && this.chargesLeft > 0
  }

  // Methods

  tick(tick) {
    if (this.timeLeft === 1) {
      this.chargesLeft = 0
      this.player.mainhand.cooldown.duration *= this.player.flurryHaste
      this.player.mainhand.cooldown.timeLeft *= this.player.flurryHaste
      if (this.player.isDw) {
        this.player.offhand.cooldown.duration *= this.player.flurryHaste
        this.player.offhand.cooldown.timeLeft *= this.player.flurryHaste
      }
    }
    super.tick(tick)
  }

  gain(tick) {
    if (!this.isActive) {
      this.player.mainhand.cooldown.duration /= this.player.flurryHaste
      this.player.mainhand.cooldown.timeLeft /= this.player.flurryHaste
      if (this.player.isDw) {
        this.player.offhand.cooldown.duration /= this.player.flurryHaste
        this.player.offhand.cooldown.timeLeft /= this.player.flurryHaste
      }
    }

    super.gain(tick)
    this.chargesLeft = this.charges
  }

  useCharge(tick) {
    if (!this.isActive) {
      throw new Error(`Trying to use ${this.name} charges when there is none.`)
    }

    this.chargesLeft--
    if (this.chargesLeft === 0) {
      this.timeLeft = 0
      this.player.mainhand.cooldown.duration *= this.player.flurryHaste
      this.player.mainhand.cooldown.timeLeft *= this.player.flurryHaste
      if (this.player.isDw) {
        this.player.offhand.cooldown.duration *= this.player.flurryHaste
        this.player.offhand.cooldown.timeLeft *= this.player.flurryHaste
      }
      this.player.addTimeline(tick+1, this.name, 'BUFF_FADED_CHARGES')
    }
  }
}