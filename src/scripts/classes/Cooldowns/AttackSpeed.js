import { Cooldown } from '@/scripts/classes/Cooldown'

export default class AttackSpeed extends Cooldown {
  constructor(name, duration, timeLeft = 0) {
    super(name, duration, timeLeft)
  }

  // Getters

  get timeElapsed() {
    return this.duration - this.timeLeft
  }

  // Methods

  // "30" for 30%
  increaseAtkSpeed(percent) {
    this._duration /= 1 + percent / 100
    this._timeLeft /= 1 + percent / 100
  }

  // "30" for 30%
  decreaseAtkSpeed(percent) {
    this._duration *= 1 + percent / 100
    this._timeLeft *= 1 + percent / 100
  }

  restart() {
    super.use()
  }

  forceRestart() {
    super.forceUse()
  }
}
