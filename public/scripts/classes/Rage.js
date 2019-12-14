class Rage {
  constructor(player) {
    this.current = 0
    this.conversionValue = 0.0091107836 * player.lvl**2 + 3.225598133 * player.lvl + 4.2652911

    this.player = player
  }

  // Methods

  unbridledWrath() {
    return (Math.random() <= this.player.extraRageChance) ? 1 : 0
  }

  // TODO should damage be integer before calculating rage gain?
  // https://vanilla-wow.fandom.com/wiki/Rage
  // https://web.archive.org/web/20071012151506/http://forums.wow-europe.com/thread.html?topicId=83678537&pageNo=1&sid=1
  gainFromSwing(dmg) {
    if (!dmg) return

    let gain = dmg / this.conversionValue * 7.5
    gain += this.unbridledWrath(gain)
    this.current = clamp(Math.floor(this.current + gain))
  }

  gainFromDodge(dmg) {
    // TODO confirm rage gain from dodge is 75%
    const gain = dmg / this.conversionValue * 7.5 * 0.75
    this.current = clamp(Math.floor(this.current + gain))
  }

  gain(value) {
    this.current = clamp(Math.floor(this.current + value))
  }

  use(value) {
    if (value > this.current) {
      throw new Error(`Trying use ${value} rage while only has ${this.current}`)
    }

    this.current = clamp(Math.floor(this.current - value))
  }

  has(value) {
    return this.current >= value
  }
}
