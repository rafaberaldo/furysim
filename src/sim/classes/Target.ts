import Player from '@/sim/classes/Player'

export default class Target {
  private _armor: number
  private _lvl: number

  constructor(cfg: any, private _player: Player) {
    this._armor = cfg.armor
    this._lvl = cfg._lvl
  }

  // Getters

  get defenseSkill() {
    const value = this._lvl * 5
    Object.defineProperty(this, 'defenseSkill', { value })
    return value
  }

  // https://vanilla-wow.fandom.com/wiki/Armor
  get armorMitigationMul() {
    const value = 1 - (this._armor / (this._armor + 400 + 85 * this._player.lvl))
    Object.defineProperty(this, 'armorMitigationMul', { value })
    return value
  }
}
