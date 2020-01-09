/* eslint-disable no-debugger */
/* eslint-disable no-console */
import Log from '@/scripts/classes/Log'
import Player from '@/scripts/classes/Player'

import { m, getRandom } from '@/scripts/helpers'

function run(cfg) {
  const startTime = new Date().getTime()
  const log = new Log(cfg.duration, cfg.iterations)
  let previousProgress

  for (let i = 0; i < cfg.iterations; i++) {
    const isLastLoop = i === cfg.iterations - 1
    const player = new Player(cfg, log, isLastLoop)

    if (isLastLoop && process.env.NODE_ENV !== 'production') {
      console.log(cfg)
      console.log(player)
    }

    const events = [
      player.slam,
      player.mainhand,
      player.offhand,

      player.deathWish,
      player.bloodrage,
      player.mrp,
      player.battleShout,
      player.bloodFury,
      player.cloudkeeper,

      player.execute,
      player.bloodthirst,
      player.whirlwind,
      player.slam.cast,
      player.heroicStrike.queue,
      player.hamstring,

      player.bloodrage.periodic,
      player.angerManagement
    ].filter(e => !!e)

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
      events.forEach((e) => e.tick(secs))
      player.tick(secs)

      // Some requirements for skills changes after advacing time
      if (!nextEvent.canUse) continue
      if (nextEvent.timeLeft > 0) continue

      if (time > cfg.duration) break

      // Handle events
      if (nextEvent.swing) nextEvent.swing()
      if (nextEvent.use) nextEvent.use()
    }

    const progress = Number((i / cfg.iterations * 100).toFixed(1))
    if (progress !== previousProgress) {
      postMessage({ progress })
      previousProgress = progress
    }
  }

  if (process.env.NODE_ENV !== 'production') console.log(log)

  const endTime = new Date().getTime()
  let finishedIn = (endTime - startTime) / 1000
  finishedIn = finishedIn < 1 ? finishedIn : Number(finishedIn.toFixed(1))
  postMessage({
    progress: 100,
    finishedIn,
    iterations: cfg.iterations,
    dps: log.dps,
    report: JSON.stringify(log.report),
    timeline: JSON.stringify(log.timeline)
  })
}

onmessage = function ({ data }) {
  run(JSON.parse(data))
}
