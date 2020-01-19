import { m } from '@/sim/helpers'

export interface DmgLog {
  [name: string]: {
    name: string,
    count: number,
    dmg: number,
    miss: number,
    dodge: number,
    glance: number,
    crit: number,
    hit: number
  }
}

export interface DmgReport {
  name: string,
  portion: number,
  dmg: number,
  avgHit: number,
  count: number,
  misses: number,
  dodges: number,
  glances: number,
  crits: number,
  hits: number
}

export interface ProcLog {
  [name: string]: {
    name: string,
    count: number,
    uptime: number
  }
}

export interface ProcReport {
  name: string,
  count: number,
  uptime: number,
  ppm: number
}

export default class Log {
  timeline: Array<string>
  dmg: DmgLog
  procs: ProcLog
  rage: any

  constructor(private duration: number, private iterations: number) {
    this.timeline = []
    this.dmg = {}
    this.procs = {}
    this.rage = {}
  }

  // Getters

  get totalDuration() {
    const value = this.duration * this.iterations
    Object.defineProperty(this, 'totalDuration', { value })
    return value
  }

  get totalDmg(): number {
    const value = Object.values(<object>this.dmg).reduce((s, e) => s += e.dmg, 0)
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
    const byUptime = (a: any, b: any) => b.uptime > a.uptime ? 1 : -1
    let dmg: Array<DmgReport> = []
    let procs: Array<ProcReport> = []

    Object.values(this.dmg).forEach(obj => {
      if (!obj.count) return
      dmg.push({
        name: obj.name,
        portion: toPercent(obj.dmg, this.totalDmg),
        dmg: Number((obj.dmg / this.iterations / 1000).toFixed(1)),
        avgHit: m.round(obj.dmg / obj.count),
        count: Number((obj.count / this.iterations).toFixed(1)),
        misses: toPercent(obj.miss, obj.count),
        dodges: toPercent(obj.dodge, obj.count),
        glances: toPercent(obj.glance, obj.count),
        crits: toPercent(obj.crit, obj.count),
        hits: toPercent(obj.hit, obj.count)
      })
    })

    Object.values(this.procs).forEach(obj => {
      if (!obj.count) return
      procs.push({
        name: obj.name,
        count: Number((obj.count / this.iterations).toFixed(1)),
        uptime: toPercent(obj.uptime, this.totalDuration),
        ppm: Number((obj.count / (this.totalDuration / 60)).toFixed(1))
      })
    })

    dmg = Object.values(dmg).sort(byDmg)
    procs = Object.values(procs).sort(byUptime)
    return { dmg, procs }
  }

  // Methods

  newDmgLog(name: string) {
    return this.dmg[name] = {
      name,
      count: 0,
      dmg: 0,
      miss: 0,
      dodge: 0,
      glance: 0,
      crit: 0,
      hit: 0
    }
  }

  newProcLog(name: string) {
    return this.procs[name] = {
      name,
      count: 0,
      uptime: 0
    }
  }
}
