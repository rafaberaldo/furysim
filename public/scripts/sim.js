importScripts('./classes/Flurry.js')
importScripts('./classes/Player.js')
importScripts('./classes/Rage.js')
importScripts('./classes/Target.js')
importScripts('./classes/Weapon.js')
importScripts('./classes/Log.js')

importScripts('./classes/Aura.js')
importScripts('./classes/Auras/Windfury.js')

importScripts('./classes/Buff.js')
importScripts('./classes/Buffs/BloodFury.js')
importScripts('./classes/Buffs/BloodragePeriodic.js')
importScripts('./classes/Buffs/MightyRagePotion.js')

importScripts('./classes/Cooldown.js')
importScripts('./classes/Cooldowns/AngerManagement.js')
importScripts('./classes/Cooldowns/AttackSpeed.js')
importScripts('./classes/Cooldowns/Bloodrage.js')
importScripts('./classes/Cooldowns/ExtraAttack.js')
importScripts('./classes/Cooldowns/SlamCast.js')

importScripts('./classes/Skill.js')
importScripts('./classes/Skills/Bloodthirst.js')
importScripts('./classes/Skills/Execute.js')
importScripts('./classes/Skills/Hamstring.js')
importScripts('./classes/Skills/HeroicStrike.js')
importScripts('./classes/Skills/Slam.js')
importScripts('./classes/Skills/Whirlwind.js')

importScripts('./helpers.js')

function run(cfg) {
  const startTime = new Date().getTime()
  const maxIterations = cfg.debug ? 1 : cfg.iterations
  const log = new Log(cfg.duration, maxIterations)
  const exists = (e) => !!e

  for (let i = 0; i < maxIterations; ++i) {
    const player = new Player(cfg, log)
    if (i === 0 && cfg.debug) console.log(player)

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
        // if (next === player.heroicStrike.queue) debugger;
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

    const progress = m.round(i / maxIterations * 100) + '%'
    postMessage({ progress })
  }

  const endTime = new Date().getTime()
  const finishedIn = ((endTime - startTime) / 1000)

  console.log(log)

  postMessage({ finishedIn, iterations: maxIterations, dps: log.dps, report: log.report })
}

onmessage = function (e) {
  const cfg = e.data
  run(cfg)
}
