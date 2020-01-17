import { m } from '@/sim/helpers'

export default class Log {
  duration: number
  iterations: number
  totalDuration: number
  timeline: Array<string>
  swings: any
  procs: any
  rage: any

  constructor(duration: number, iterations: number) {
    this.duration = duration
    this.iterations = iterations
    this.totalDuration = duration * iterations
    this.timeline = []

    this.swings = {}
    this.procs = {}
    this.rage = {}
  }

  // Getters

  get totalDmg(): number {
    const value = Object.values(<object>this.swings).reduce((s, e) => s += e.dmg, 0)
    Object.defineProperty(this, 'totalDmg', { value })
    return value
  }

  get dps() {
    const value = Number((this.totalDmg / this.totalDuration).toFixed(1))
    Object.defineProperty(this, 'dps', { value })
    return value
  }

  get report() {
    const toPercent = (count: number, total: number) => Number((count / total * 100).toFixed(1))
    const byDmg = (a: any, b: any) => b.portion > a.portion ? 1 : -1
    let swings: any = {}
    let procs: any = {}

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

    swings = Object.values(swings).sort(byDmg)
    procs = Object.values(procs).sort(byDmg)
    return { swings, procs }
  }

  // Methods

  setSwingOrSkill(name: string) {
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

  setProc(name: string) {
    if (this.procs[name]) return this.procs[name]

    return this.procs[name] = {
      count: 0,
      uptime: 0
    }
  }
}
