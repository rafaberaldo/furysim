/* eslint-disable no-debugger */
/* eslint-disable no-console */
import Log from '@/scripts/classes/Log'
import Player from '@/scripts/classes/Player'

import { m, getRandom } from '@/scripts/helpers'

function run(cfg) {
  const startTime = new Date().getTime()
  const log = new Log(cfg.duration, cfg.iterations)
  const exists = (e) => !!e

  for (let i = 0; i < cfg.iterations; i++) {
    const isLastLoop = i === cfg.iterations - 1
    const player = new Player(cfg, log, isLastLoop)

    const events = [
      player.slam,
      player.mainhand,
      player.offhand,

      player.deathWish,
      player.bloodrage,
      player.mrp,
      player.battleShout,
      player.bloodFury,

      player.execute,
      player.bloodthirst,
      player.slam.cast,
      player.whirlwind,
      player.heroicStrike.queue,
      player.hamstring,

      player.bloodrage.periodic,
      player.angerManagement
    ].filter(exists)

    const otherCooldowns = [
      player.gcd,
      player.flurry,
      player.windfury,
      player.hoj
    ].filter(exists)

    let time = 0
    while (time < cfg.duration) {
      // Get the next event with lower cooldown that can be usable,
      // respecting priority order
      const nextEvent = events.reduce((prio, next) => {
        if (!next.canUse) return prio
        if (prio.timeLeft <= next.timeLeft && prio.canUse) return prio
        return next
      })

      if (nextEvent.timeLeft < 0) throw new Error('No time machines yet.')

      const latency = nextEvent.isPlayerInput && cfg.latency.active
        ? m.max(0, getRandom(cfg.latency.min, cfg.latency.max) / 1000) : 0
      const secs = nextEvent.timeLeft + latency
      time += secs
      player.time = time

      // Tick cooldowns for next event
      otherCooldowns.forEach((e) => e.tick(secs))
      events.forEach((e) => e.tick(secs))

      // Some requirements for skills changes after advacing time
      if (!nextEvent.canUse) continue

      if (time > cfg.duration) break

      // Handle events
      if (nextEvent.swing) nextEvent.swing()
      if (nextEvent.use) nextEvent.use()
    }

    const progress = m.floor(i / cfg.iterations * 100)
    postMessage(JSON.stringify({ progress }))

    if (!isLastLoop) continue
    if (process.env.NODE_ENV === 'production') continue

    console.log(cfg)
    console.log(player)
    console.log(log)
  }

  const endTime = new Date().getTime()
  const finishedIn = ((endTime - startTime) / 1000)
  postMessage(JSON.stringify({
    progress: 100,
    finishedIn,
    iterations: cfg.iterations,
    dps: log.dps,
    report: log.report,
    lastTimeline: log.timeline
  }))
}

onmessage = function (e) {
  if (!e.data) return
  run(JSON.parse(e.data))
}
