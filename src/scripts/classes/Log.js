import { m } from '@/scripts/helpers'

export default class Log {
  constructor(duration, iterations) {
    this.duration = duration
    this.iterations = iterations
    this.totalDuration = duration * iterations
    this.timeline = []

    this.swings = {}
    this.procs = {}
    this.rage = {}
  }

  // Getters

  get totalDmg() {
    const value = Object.values(this.swings).reduce((s, e) => s += e.dmg, 0)
    Object.defineProperty(this, 'totalDmg', { value })
    return value
  }

  get dps() {
    const value = Number((this.totalDmg / this.totalDuration).toFixed(1))
    Object.defineProperty(this, 'dps', { value })
    return value
  }

  get report() {
    const toPercent = (count, total) => Number((count / total * 100).toFixed(1))
    const sortPortion = (a, b) => b.portion > a.portion ? 1 : -1
    let swings = {}
    let procs = {}

    Object.keys(this.swings).forEach(key => {
      const obj = this.swings[key]
      if (!obj.count) return

      swings[key] = {
        title: key,
        portion: toPercent(obj.dmg, this.totalDmg),
        dmg: Number((obj.dmg / this.iterations / 1000).toFixed(1)),
        avgHit: m.round(obj.dmg / obj.count),
        count: Number((obj.count / this.iterations).toFixed(1)),
        misses: toPercent(obj.miss, obj.count),
        dodges: toPercent(obj.dodge, obj.count),
        glances: toPercent(obj.glance, obj.count),
        crits: toPercent(obj.crit, obj.count),
        hits: toPercent(obj.hit, obj.count),
        _chained: Number((obj.chain / this.iterations).toFixed(1))
      }
    })

    Object.keys(this.procs).forEach(key => {
      const obj = this.procs[key]
      if (!obj.count) return

      procs[key] = {
        title: key,
        count: Number((obj.count / this.iterations).toFixed(1)),
        uptime: toPercent(obj.uptime, this.totalDuration),
        ppm: Number((obj.count / (this.totalDuration / 60)).toFixed(1))
      }
    })

    swings = Object.values(swings).sort(sortPortion)
    procs = Object.values(procs).sort(sortPortion)
    return { swings, procs }
  }

  // Methods

  setSwingOrSkill(name) {
    if (this.swings[name]) return this.swings[name]

    return this.swings[name] = {
      chain: 0,
      count: 0,
      dmg: 0,
      miss: 0,
      dodge: 0,
      glance: 0,
      crit: 0,
      hit: 0
    }
  }

  setProc(name) {
    if (this.procs[name]) return this.procs[name]

    return this.procs[name] = {
      count: 0,
      uptime: 0
    }
  }
}
