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
    return Number((this.totalDmg / this.totalDuration).toFixed(1))
  }

  get totalDmg() {
    return Object.values(this.events).reduce((s, e) => s += e.dmg, 0)
  }

  get report() {
    const toPercent = (count, total) => Number((count / total * 100).toFixed(1))
    const report = {}
    Object.keys(this.events).forEach(key => {
      const obj = this.events[key]
      if (!obj.count) return
      report[key] = !obj.isProc ? {
        title: key,
        procOrAura: false,
        portion: toPercent(obj.dmg, this.totalDmg),
        dmgPerHit: m.round(obj.dmg / obj.count),
        misses: toPercent(obj.miss, obj.count),
        dodges: toPercent(obj.dodge, obj.count),
        glances: toPercent(obj.glance, obj.count),
        crits: toPercent(obj.crit, obj.count),
        hits: toPercent(obj.hit, obj.count),
        countPerFight: Number((obj.count / this.iterations).toFixed(1)),
      } : {
        title: key,
        procOrAura: true,
        countPerFight: Number((obj.count / this.iterations).toFixed(1)),
        uptime: toPercent(obj.uptime, this.totalDuration),
        ppm: Number((obj.count / (this.totalDuration / 60)).toFixed(1))
      }
      if (key === 'Mainhand') report[key].chainedPerFight = Number((obj.chain / this.iterations).toFixed(2))
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
