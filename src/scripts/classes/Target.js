export default class Target {
  constructor(target, player) {
    this.lvl = target.lvl
    this.armor = target.armor
    this.defenseSkill = this.lvl * 5
    // https://vanilla-wow.fandom.com/wiki/Armor
    this.armorMitigationMul = 1 - (this.armor / (this.armor + 400 + 85 * player.lvl))
  }
}
