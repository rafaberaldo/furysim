import { ProcLog } from '@/sim/classes/Log'
import Player from '@/sim/classes/Player'
import { m } from '@/sim/helpers'

export default class Flurry {
  private charges: number
  private chargesLeft: number
  private log: ProcLog
  private haste: number
  name: string

  constructor(private player: Player) {
    this.name = 'Flurry'
    this.charges = 3
    this.chargesLeft = 0
    this.log = player.log.newProcLog(this.name)
    this.haste = player.talents.flurry ? (player.talents.flurry + 1) * 5 : 0
  }

  // Getters

  get isActive() {
    return this.chargesLeft > 0
  }

  // Methods

  tick(secs: number) {
    if (this.isActive) this.log.uptime += secs
  }

  apply() {
    if (!this.isActive) this.player.increaseAtkSpeed(this.haste)

    this.chargesLeft = this.charges
    this.log.count++
    this.player.addTimeline(this.name, 'BUFF_APPLIED')
  }

  useCharge() {
    if (!this.isActive) return

    this.chargesLeft = m.max(0, --this.chargesLeft)

    if (this.isActive) return
    this.player.decreaseAtkSpeed(this.haste)
    this.player.addTimeline(this.name, 'BUFF_FADED')
  }

  reset() {
    this.chargesLeft = 0
  }
}
