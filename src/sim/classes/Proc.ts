import { EventEmitter } from 'events'

import Player from '@/sim/classes/Player'
import { ProcType } from '@/sim/classes/Weapon'
import { m, ppmToChance } from '@/sim/helpers'

export default class Proc extends EventEmitter {
  protected _buffDurationLeft: number
  protected _buffDuration: number
  name: string
  type: ProcType
  amount: number
  chance: number
  log: any
  player: Player

  constructor(name: string, duration: number, ppmOrChance: any, player: Player, info: any = null) {
    super()
    this._buffDurationLeft = 0
    this._buffDuration = duration
    this.name = name
    this.type = info && info.type
    this.amount = info && info.amount
    this.chance = ppmOrChance.ppm
      ? ppmToChance(ppmOrChance.ppm, ppmOrChance.speed)
      : ppmOrChance.chance
    this.log = player.log.setProc(name)

    this.player = player
  }

  // Getters

  get isActive() {
    return !!this._buffDurationLeft
  }

  // Methods

  tick(secs: number) {
    if (!this._buffDurationLeft) return

    this._buffDurationLeft = m.max(0, this._buffDurationLeft - secs)
    this.log.uptime += m.min(secs, this._buffDurationLeft)

    if (this.isActive) return
    this.emit('fade')
    this.player.addTimeline(this.name, 'BUFF_FADED')
  }

  apply() {
    this.emit('proc', this.isActive)
    this._buffDurationLeft = this._buffDuration
    this.log.count++
    this.player.addTimeline(this.name, 'BUFF_APPLIED', `${this._buffDuration}s`)
  }

  tryToProc() {
    if (m.random() > this.chance) return

    this.apply()
    return true
  }

  reset() {
    this._buffDurationLeft = 0
  }
}
