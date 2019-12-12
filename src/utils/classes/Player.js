import Target from './Target'
import Weapon from './Weapon'
import Rage from './Rage'
import AngerManagement from './Cooldowns/AngerManagement'
import Bloodthirst from './Skills/Bloodthirst'

import { parseTalents } from '../helpers'

export default class Player {
  constructor(cfg) {
    this.lvl = cfg.player.lvl
    this.ap = cfg.player.ap
    this.hit = cfg.player.hit
    this.haste = cfg.player.haste
    this.crit = cfg.player.crit

    this.target = new Target(cfg.target, cfg.player)
    this.mainhand = new Weapon(cfg.mainhand, this)
    this.offhand = cfg.offhand
      ? new Weapon(cfg.offhand, this, true)
      : null
    this.isDw = !!this.offhand
    this.rage = new Rage(this)

    // Talents
    const talents = parseTalents()
    this.heroicCost = 15 - talents.improvedHS
    this.skillCritMul = 2 + talents.impale * 0.1
    this.weaponSpecDmgMul = this.isDw ? 1 : (1 + talents.twoHandSpec * 0.01)
    this.offhandDmgMul = 0.5 + talents.dualWieldSpec * 0.025
    this.flurryHaste = 1 + (talents.flurry && (talents.flurry + 1) * 0.05) || 0
    this.angerManagement = talents.angerMgmt ? new AngerManagement(this) : null
    this.extraRageChance = talents.unbridledWrath * 0.08
    this.slamCast = 1.5 - talents.improvedSlam * 0.1
    this.executeCost = 15 - (talents.impExecute && talents.impExecute * 3 - 1) || 0

    this.bloodthirst = new Bloodthirst(this)

    this.log = {
      timeline: [],
      totalDmg: 0,
      miss: 0,
      dodge: 0,
      glance: 0,
      crit: 0,
      hit: 0,
      skillMiss: 0,
      skillDodge: 0,
      skillCrit: 0,
      skillHit: 0
    }
  }

  // Getters

  get dmgMul() {
    if (this.deathWish && this.deathWish.active()) return this.weaponSpecDmgMul * 1.2

    return this.weaponSpecDmgMul
  }

  // Methods

  getDps(duration) {
    if (duration <= 0) return
    return Number((this.log.totalDmg / duration).toFixed(2))
  }

  addTimeline(tick, name, type, dmg) {
    const time = (tick / 1000).toFixed(3).padStart(6, '0')
    this.log.timeline.push(
      `${time}: ${name} ${type} for ${dmg} (${this.rage.current} rage)`
    )
    // eslint-disable-next-line no-console
    console.log(tick / 1000, ':', name, type, 'for', dmg, '(', this.rage.current, 'rage )')
  }
}
