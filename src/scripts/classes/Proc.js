import EventEmitter from 'events'

import { m, ppmToChance } from '@/scripts/helpers'

export default class Proc extends EventEmitter {
  constructor(name, duration, ppmOrChance, player) {
    super()
    this._buffDurationLeft = 0
    this._buffDuration = duration
    this.name = name
    this.chance = ppmOrChance.ppm
      ? ppmToChance(ppmOrChance.ppm, ppmOrChance.speed)
      : ppmOrChance.chance
    this.log = player.log.set(name, true)

    this.player = player
  }

  // Getters

  get isActive() {
    return !!this._buffDurationLeft
  }

  // Methods

  tick(secs) {
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
    this.player.addTimeline(this.name, 'BUFF_APPLIED', this._buffDuration)
  }

  tryToProc() {
    if (m.random() > this.chance) return

    this.apply()
    return true
  }
}
