export default class Flurry {
  constructor(player) {
    this.name = 'Flurry'
    this.charges = 3
    this.chargesLeft = 0

    this.player = player
  }

  // Getters

  get isActive() {
    return this.chargesLeft > 0
  }

  // Methods

  gain(tick) {
    if (!this.isActive) {
      // if not already applied
      this.player.mainhand.addFlurry()
      this.player.isDw && this.player.offhand.addFlurry()
    }

    this.player.addTimeline(tick, this.name, 'BUFF_APPLIED')
    this.chargesLeft = this.charges
  }

  useCharge(tick) {
    if (!this.isActive) {
      throw new Error(`Trying to use ${this.name} charges when there is none.`)
    }

    this.chargesLeft = Math.max(0, --this.chargesLeft)

    if (this.isActive) return

    this.player.mainhand.removeFlurry()
    this.player.isDw && this.player.offhand.removeFlurry()
    this.player.addTimeline(tick+1, this.name, 'BUFF_FADED')
  }
}
