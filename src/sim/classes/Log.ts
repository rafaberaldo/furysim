import { m } from '@/sim/helpers'

export class DmgLog {
  constructor (
    public name: string,
    public count: number = 0,
    public dmg: number = 0,
    public miss: number = 0,
    public dodge: number = 0,
    public glance: number = 0,
    public crit: number = 0,
    public hit: number = 0,
  ) {}
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

export class ProcLog {
  constructor(
    public name: string,
    public count: number = 0,
    public uptime: number = 0
  ) {}
}

export interface ProcReport {
  name: string,
  count: number,
  uptime: number,
  ppm: number
}

export class RageLog {
  constructor(
    public hits: number = 0,
    public gained: number = 0,
    public gainedHit: number = 0,
    public gainedUnbridled: number = 0,
    public lostOverCap: number = 0,
    public timeCapped: number = 0,
    public timeStarved: number = 0
  ) {}
}

export interface Report {
  name: string,
  value: number | string,
  suffix?: string
}

export default class Log {
  timeline: Array<string>
  dmg: Array<DmgLog>
  procs: Array<ProcLog>
  rage: RageLog

  constructor(private duration: number, private iterations: number) {
    this.timeline = []
    this.dmg = []
    this.procs = []
    this.rage = new RageLog()
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

    this.dmg.forEach(obj => {
      if (!obj.count) return
      dmg.push({
        name: obj.name,
        portion: toPercent(obj.dmg, this.totalDmg),
        dmg: Number((obj.dmg / this.iterations / 1000).toFixed(1)),
        avgHit: Number((obj.dmg / obj.count).toFixed(1)),
        count: Number((obj.count / this.iterations).toFixed(1)),
        misses: toPercent(obj.miss, obj.count),
        dodges: toPercent(obj.dodge, obj.count),
        glances: toPercent(obj.glance, obj.count),
        crits: toPercent(obj.crit, obj.count),
        hits: toPercent(obj.hit, obj.count)
      })
    })

    this.procs.forEach(obj => {
      if (!obj.count) return
      procs.push({
        name: obj.name,
        count: Number((obj.count / this.iterations).toFixed(1)),
        uptime: toPercent(obj.uptime, this.totalDuration),
        ppm: Number((obj.count / (this.totalDuration / 60)).toFixed(1))
      })
    })

    const rage: Array<Report> = [{
      name: 'Avg per hit',
      value: Number((this.rage.gainedHit / this.rage.hits).toFixed(1))
    },{
      name: 'Per sec',
      value: Number((this.rage.gained / this.totalDuration).toFixed(1))
    },{
      name: 'Unbridled Wrath',
      value: Number((this.rage.gainedUnbridled / this.iterations).toFixed(1))
    },{
      name: 'Lost (capped)',
      value: Number((this.rage.lostOverCap / this.iterations).toFixed(1))
    },{
      name: 'Time capped',
      value: toPercent(this.rage.timeCapped, this.totalDuration),
      suffix: '%'
    },{
      name: 'Time starved',
      value: toPercent(this.rage.timeStarved, this.totalDuration),
      suffix: '%'
    }]

    dmg = Object.values(dmg).sort(byDmg)
    procs = Object.values(procs).sort(byUptime)
    return { dmg, procs, rage }
  }

  // Methods

  newDmgLog(name: string) {
    const value = new DmgLog(name)
    this.dmg.push(value)
    return value
  }

  newProcLog(name: string) {
    const value = new ProcLog(name)
    this.procs.push(value)
    return value
  }
}
