import { Cooldown } from '@/sim/classes/Cooldown'

export default class AttackSpeed extends Cooldown {
  constructor(name: string, duration: number, timeLeft: number = 0) {
    super(name, duration, timeLeft)
  }

  // Getters

  get timeElapsed() {
    return this.duration - this.timeLeft
  }

  // Methods

  // "30" for 30%
  increaseAtkSpeed(percent: number) {
    this._duration /= 1 + percent / 100
    this._timeLeft /= 1 + percent / 100
  }

  // "30" for 30%
  decreaseAtkSpeed(percent: number) {
    this._duration *= 1 + percent / 100
    this._timeLeft *= 1 + percent / 100
  }

  restart(force: boolean) {
    super.use(force)
  }
}
