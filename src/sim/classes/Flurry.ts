import Player from '@/sim/classes/Player'
import { m } from '@/sim/helpers'

export default class Flurry {
  private _charges: number
  private _chargesLeft: number
  log: any
  name: string
  haste: number
  player: Player

  constructor(player: Player) {
    this._charges = 3
    this._chargesLeft = 0
    this.name = 'Flurry'
    this.log = player.log.setProc(this.name)

    this.haste = player.talents.flurry ? (player.talents.flurry + 1) * 5 : 0

    this.player = player
  }

  // Getters

  get isActive() {
    return this._chargesLeft > 0
  }

  // Methods

  tick(secs: number) {
    if (this.isActive) this.log.uptime += secs
  }

  apply() {
    if (!this.isActive) this.player.increaseAtkSpeed(this.haste)

    this._chargesLeft = this._charges
    this.log.count++
    this.player.addTimeline(this.name, 'BUFF_APPLIED')
  }

  useCharge() {
    if (!this.isActive) return

    this._chargesLeft = m.max(0, --this._chargesLeft)

    if (this.isActive) return
    this.player.decreaseAtkSpeed(this.haste)
    this.player.addTimeline(this.name, 'BUFF_FADED')
  }

  reset() {
    this._chargesLeft = 0
  }
}
