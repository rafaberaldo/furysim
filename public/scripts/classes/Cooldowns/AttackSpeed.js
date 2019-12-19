class AttackSpeed extends Cooldown {
  constructor(name, duration, timeLeft = 0) {
    super(name, duration, timeLeft)
  }

  // Methods

  increaseAtkSpeed(percent) {
    this._duration /= percent
    this._timeLeft /= percent
  }

  decreaseAtkSpeed(percent) {
    this._duration *= percent
    this._timeLeft *= percent
  }

  restart() {
    super.use()
  }
}
