class AttackSpeed extends Cooldown {
  constructor(name, duration, timeLeft = 0) {
    super(name, duration, timeLeft)
  }

  // Methods

  increaseAtkSpeed(percent) {
    this.duration /= percent
    this.timeLeft /= percent
  }

  decreaseAtkSpeed(percent) {
    this.duration *= percent
    this.timeLeft *= percent
  }

  restart() {
    super.use()
  }
}
