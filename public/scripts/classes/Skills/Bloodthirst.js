class Bloodthirst extends Skill {
  constructor(player, useWhen) {
    super('Bloodthirst', 30, 6, true, useWhen, player)
  }

  // Getters

  get dmg() {
    return this.player.ap * 0.45
  }
}
