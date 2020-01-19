import { EventEmitter } from 'events'

import { ProcLog } from '@/sim/classes/Log'
import Player from '@/sim/classes/Player'
import { ProcType } from '@/sim/classes/Weapon'
import { m, ppmToChance } from '@/sim/helpers'

export default class Proc extends EventEmitter {
  private log: ProcLog
  private chance: number
  protected buffDurationLeft: number
  protected buffDuration: number
  type: ProcType
  amount: number

  constructor(
    protected player: Player,
    public name: string,
    duration: number,
    ppmOrChance: any,
    cfg: any = undefined
  ) {
    super()
    this.log = player.log.newProcLog(name)
    this.buffDurationLeft = 0
    this.buffDuration = duration
    this.chance = ppmOrChance.ppm
      ? ppmToChance(ppmOrChance.ppm, ppmOrChance.speed)
      : ppmOrChance.chance
    this.amount = cfg && cfg.amount
    this.type = cfg && cfg.type
  }

  // Getters

  get isActive() {
    return !!this.buffDurationLeft
  }

  // Methods

  tick(secs: number) {
    if (!this.buffDurationLeft) return

    this.buffDurationLeft = m.max(0, this.buffDurationLeft - secs)
    this.log.uptime += m.min(secs, this.buffDurationLeft)

    if (this.isActive) return
    this.emit('fade')
    this.player.addTimeline(this.name, 'BUFF_FADED')
  }

  apply() {
    this.emit('proc', this.isActive)
    this.buffDurationLeft = this.buffDuration
    this.log.count++
    this.player.addTimeline(this.name, 'BUFF_APPLIED', `${this.buffDuration}s`)
  }

  tryToProc() {
    if (m.random() > this.chance) return

    this.apply()
    return true
  }

  reset() {
    this.buffDurationLeft = 0
  }
}
