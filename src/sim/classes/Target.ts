import Player from '@/sim/classes/Player'

export default class Target {
  private armor: number
  private lvl: number

  constructor(private player: Player, cfg: any) {
    this.armor = cfg.armor
    this.lvl = cfg.lvl
  }

  // Getters

  get defenseSkill() {
    const value = this.lvl * 5
    Object.defineProperty(this, 'defenseSkill', { value })
    return value
  }

  // https://vanilla-wow.fandom.com/wiki/Armor
  get armorMitigationMul() {
    const value = 1 - (this.armor / (this.armor + 400 + 85 * this.player.lvl))
    Object.defineProperty(this, 'armorMitigationMul', { value })
    return value
  }
}
