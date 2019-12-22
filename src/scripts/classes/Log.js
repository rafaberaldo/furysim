import { m } from '@/scripts/helpers'

export default class Log {
  constructor(duration, iterations) {
    this.duration = duration
    this.iterations = iterations
    this.totalDuration = duration * iterations
    this.timeline = []

    this.events = {}
  }

  // Getters

  get dps() {
    return (this.totalDmg / this.totalDuration).toFixed(1)
  }

  get totalDmg() {
    let dmg = 0
    Object.values(this.events).forEach((obj) => dmg += obj.dmg)
    return dmg
  }

  get report() {
    const toPercent = (count, total) => (count / total * 100).toFixed(1) + '%'
    const report = {}
    Object.entries(this.events).forEach(([key, obj]) => {
      if (!obj.count) return
      report[key] = !obj.isProc ? {
          portion: toPercent(obj.dmg, this.totalDmg),
          dmgPerHit: m.round(obj.dmg / obj.count),
          misses: toPercent(obj.miss, obj.count),
          dodges: toPercent(obj.dodge, obj.count),
          glances: toPercent(obj.glance, obj.count),
          crits: toPercent(obj.crit, obj.count),
          hits: toPercent(obj.hit, obj.count),
          countPerFight: (obj.count / this.iterations).toFixed(1),
        } : {
          countPerFight: (obj.count / this.iterations).toFixed(1),
          uptime: toPercent(obj.uptime, this.totalDuration),
          ppm: (obj.count / (this.totalDuration / 60)).toFixed(1)
        }
      if (key === 'Mainhand') report[key].chainedPerFight = (obj.chain / this.iterations).toFixed(2)
    })
    return report
  }

  // Methods

  set(name, isProc = false) {
    if (this.events[name]) return this.events[name]

    return this.events[name] = {
      isProc,
      chain: 0,
      count: 0,
      dmg: 0,
      miss: 0,
      dodge: 0,
      glance: 0,
      crit: 0,
      hit: 0,
      uptime: 0
    }
  }
}
