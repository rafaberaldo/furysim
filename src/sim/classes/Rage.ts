import Player from '@/sim/classes/Player'
import { clamp, m } from '@/sim/helpers'

export default class Rage {
  private _startRage: number
  private _current: number
  private _conversionValue: number
  private _extraRageChance: number

  constructor(_player: Player, startRage: number = 0) {
    this._startRage = startRage
    this._current = startRage
    this._conversionValue = 0.0091107836 * _player.lvl**2 + 3.225598133 * _player.lvl + 4.2652911
    this._extraRageChance = _player.talents.unbridledWrath * 0.08
  }

  // Getters

  get current() {
    return this._current
  }

  // Methods

  tryToProcUnbridledWrath() {
    return (m.random() <= this._extraRageChance) ? 1 : 0
  }

  // https://blue.mmo-champion.com/topic/18325-the-new-rage-formula-by-kalgan/
  gainFromSwing(dmg: number) {
    let gain = dmg / this._conversionValue * 7.5
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
    this._current = this._startRage
  }
}
