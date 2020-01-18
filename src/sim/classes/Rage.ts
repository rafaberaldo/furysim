import Player from '@/sim/classes/Player'
import { clamp, m } from '@/sim/helpers'

export default class Rage {
  private startRage: number
  private _current: number
  private conversionValue: number
  private extraRageChance: number

  constructor(player: Player, startRage: number = 0) {
    this.startRage = startRage
    this._current = startRage
    this.conversionValue = 0.0091107836 * player.lvl**2 + 3.225598133 * player.lvl + 4.2652911
    this.extraRageChance = player.talents.unbridledWrath * 0.08
  }

  // Getters

  get current() {
    return this._current
  }

  // Methods

  tryToProcUnbridledWrath() {
    return (m.random() <= this.extraRageChance) ? 1 : 0
  }

  // https://blue.mmo-champion.com/topic/18325-the-new-rage-formula-by-kalgan/
  gainFromSwing(dmg: number) {
    let gain = dmg / this.conversionValue * 7.5
    gain += this.tryToProcUnbridledWrath()
    this._current = clamp(m.round(this._current + gain))
  }

  gain(value: number) {
    this._current = clamp(m.round(this._current + value))
  }

  removal() {
    this._current = 0
  }

  use(value: number) {
    if (value > this._current) {
      throw new Error(`Trying use ${value} rage while only has ${this._current}`)
    }

    this._current = clamp(m.round(this._current - value))
  }

  has(value: number) {
    return this._current >= value
  }

  lessThan(value: number) {
    return this._current <= value
  }

  reset() {
    this._current = this.startRage
  }
}
