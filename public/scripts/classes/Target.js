class Target {
  constructor(target, player) {
    this._armor = target.armor
    this.lvl = target.lvl
    this.sunderArmor = target.sunderArmor
    this.faerieFire = target.faerieFire
    this.cor = target.cor
    this.annihilator = target.annihilator

    this.player = player
  }

  // Getters

  get armor() {
    let armor = this._armor
    if (this.sunderArmor) armor -= 2250
    if (this.faerieFire) armor -= 505
    if (this.cor) armor -= 640
    if (this.annihilator) armor -= 600

    return armor
  }

  get defenseSkill() {
    return this.lvl * 5
  }

  // https://vanilla-wow.fandom.com/wiki/Armor
  get armorMitigationMul() {
    return 1 - (this.armor / (this.armor + 400 + 85 * this.player.lvl))
  }
}
