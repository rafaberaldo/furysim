import { RageLog } from '@/sim/classes/Log'
import Player from '@/sim/classes/Player'
import { clamp, m } from '@/sim/helpers'

export default class Rage {
  private _current: number
  private startRage: number
  private conversionValue: number
  private extraRageChance: number
  private log: RageLog

  constructor(player: Player, startRage: number = 0) {
    this._current = startRage
    this.startRage = startRage
    this.conversionValue = 0.0091107836 * player.lvl**2 + 3.225598133 * player.lvl + 4.2652911
    this.extraRageChance = player.talents.unbridledWrath * 0.08
    this.log = player.log.rage
  }

  // Getters

  get current() {
    return this._current
  }

  // Methods

  tick(secs: number) {
    if (this.current > 99) this.log.timeCapped += secs
    if (this.current < 10) this.log.timeStarved += secs
  }

  tryToProcUnbridledWrath() {
    return m.random() <= this.extraRageChance
  }

  // https://blue.mmo-champion.com/topic/18325-the-new-rage-formula-by-kalgan/
  gainFromSwing(dmg: number) {
    let value = dmg / this.conversionValue * 7.5
    if (this.tryToProcUnbridledWrath()) {
      value++
      this.log.gainedUnbridled++
    }
    this.log.lostOverCap += m.max(0, this.current + value - 100)
    value = clamp(m.round(this.current + value))
    this.log.gained += value
    this.log.gainedHit += value
    this.log.hits++
    this._current = value
  }

  gain(value: number) {
    this.log.lostOverCap += m.max(0, this._current + value - 100)
    value = clamp(m.round(this._current + value))
    this.log.gained += value
    this._current = value
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
