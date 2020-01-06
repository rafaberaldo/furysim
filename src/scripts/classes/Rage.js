import { m, clamp } from '@/scripts/helpers'

export default class Rage {
  constructor(player, startRage) {
    this.current = startRage || 0
    this.conversionValue = 0.0091107836 * player.lvl**2 + 3.225598133 * player.lvl + 4.2652911

    this.extraRageChance = player.talents.unbridledWrath * 0.08

    this.player = player
  }

  // Methods

  tryToProcUnbridledWrath() {
    return (m.random() <= this.extraRageChance) ? 1 : 0
  }

  // https://blue.mmo-champion.com/topic/18325-the-new-rage-formula-by-kalgan/
  gainFromSwing(dmg) {
    let gain = dmg / this.conversionValue * 7.5
    gain += this.tryToProcUnbridledWrath(gain)
    this.current = clamp(m.round(this.current + gain))
  }

  gain(value) {
    this.current = clamp(m.round(this.current + value))
  }

  use(value) {
    if (value > this.current) {
      throw new Error(`Trying use ${value} rage while only has ${this.current}`)
    }

    this.current = clamp(m.round(this.current - value))
  }

  has(value) {
    return this.current >= value
  }

  lessThan(value) {
    return this.current <= value
  }
}
