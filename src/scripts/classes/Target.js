export default class Target {
  constructor(target, player) {
    this.lvl = target.lvl
    this.armor = target.armor

    this.player = player
  }

  // Getters

  get defenseSkill() {
    return this.lvl * 5
  }

  // https://vanilla-wow.fandom.com/wiki/Armor
  get armorMitigationMul() {
    return 1 - (this.armor / (this.armor + 400 + 85 * this.player.lvl))
  }
}
