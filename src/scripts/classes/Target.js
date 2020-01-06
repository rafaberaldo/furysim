export default class Target {
  constructor(target, player) {
    this.armor = target.armor
    this.defenseSkill = target.lvl * 5

    this.player = player
  }

  // Getters

  // https://vanilla-wow.fandom.com/wiki/Armor
  get armorMitigationMul() {
    const value = 1 - (this.armor / (this.armor + 400 + 85 * this.player.lvl))
    Object.defineProperty(this, 'armorMitigationMul', { value })
    return value
  }
}
