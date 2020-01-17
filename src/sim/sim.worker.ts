/* eslint-disable no-debugger */
/* eslint-disable no-console */

import Player from '@/sim/classes/Player'
import { getRandom, m } from '@/sim/helpers'

const isProd = process.env.NODE_ENV === 'production'
// Fix for TS error (temp?)
// https://github.com/webpack/webpack-dev-server/issues/745#issuecomment-284880243
const postMessageFix: any = postMessage

function run(cfg: any) {
  let previousProgress
  const startTime = new Date().getTime()
  const player = new Player(cfg)
  const events = [
    player.slam,
    player.heroicStrike.queue,

    player.mainhand,
    player.offhand,

    player.deathWish,
    player.bloodrage,
    player.mrp,
    player.battleShout,
    player.cloudkeeper,
    player.diamondFlask,
    player.bloodFury,

    player.execute,
    player.bloodthirst,
    player.whirlwind,
    player.slam.cast,
    player.hamstring,

    player.bloodrage.periodic,
    player.angerManagement,
    player.red
  ].filter(e => !!e)

  for (let i = 0; i < cfg.iterations; i++) {
    player.logTimeline = i === cfg.iterations - 1

    while (player.time < cfg.duration) {
      const latency = (player.time > 0) && cfg.latency.active ?
        m.max(0, getRandom(cfg.latency.min, cfg.latency.max) / 1000) : 0
      // Get the next event with lower cooldown that can be usable,
      // respecting priority order
      const nextEvent = events.reduce((prio, next) => {
        if (!prio) return next
        if (!next || !next.canUse) return prio

        const prioTL = prio.timeLeft + (prio.isPlayerInput ? latency : 0)
        const nextTL = next.timeLeft + (next.isPlayerInput ? latency : 0)
        if (prioTL <= nextTL && prio.canUse) return prio

        return next
      })

      if (!nextEvent) throw new Error('No event found. WTF?')
      if (nextEvent.timeLeft < 0) throw new Error('No time machines yet.')

      const secs = nextEvent.timeLeft + (nextEvent.isPlayerInput ? latency : 0)
      player.time += secs

      // Tick cooldowns for next event (advance time)
      if (secs > 0) {
        events.forEach(e => e && e.tick(secs))
        player.tick(secs)
      }

      // Some requirements for skills changes after advacing time
      if (!nextEvent.canUse) continue
      if (nextEvent.timeLeft > 0) continue

      if (player.time > cfg.duration) break

      nextEvent.handle()
    }

    player.reset()

    const progress = m.round(i / cfg.iterations * 100)
    if (progress !== previousProgress) {
      postMessageFix({ progress })
      previousProgress = progress
    }
  }

  if (!isProd) {
    console.log(cfg)
    console.log(player)
    console.log(player.log)
  }

  const endTime = new Date().getTime()
  let finishedIn = (endTime - startTime) / 1000
  finishedIn = finishedIn < 1 ? finishedIn : Number(finishedIn.toFixed(1))
  postMessageFix({
    progress: 100,
    finishedIn,
    iterations: cfg.iterations,
    dps: player.log.dps,
    report: JSON.stringify(player.log.report),
    timeline: JSON.stringify(player.log.timeline)
  })
}

onmessage = function ({ data }) {
  run(JSON.parse(data))
}
