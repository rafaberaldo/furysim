importScripts('./classes/Player.js')
importScripts('./classes/Target.js')
importScripts('./classes/Weapon.js')
importScripts('./classes/Rage.js')
importScripts('./classes/Cooldown.js')
importScripts('./classes/Cooldowns/AngerManagement.js')
importScripts('./classes/Cooldowns/DeathWish.js')
importScripts('./classes/Cooldowns/BloodFury.js')
importScripts('./classes/Flurry.js')
importScripts('./classes/Skill.js')
importScripts('./classes/Skills/Bloodthirst.js')
importScripts('./classes/Skills/Whirlwind.js')
importScripts('./classes/Skills/HeroicStrike.js')
importScripts('./helpers.js')

function run(cfg) {
  const startTime = new Date().getTime()
  let dmg = 0
  let maxIterations = cfg.debug ? 1 : cfg.iterations

  for (let i = 0; i < maxIterations; ++i) {
    const player = new Player(cfg)
    i === 0 && console.log(player)

    let time = 0
    while (time < cfg.duration) {
      const exists = (e) => !!e
      const events = [
        player.mainhand,
        player.offhand,

        player.deathWish,

        player.bloodthirst,
        player.whirlwind,

        player.angerManagement,
        player.bloodFury
      ].filter(exists)

      // Get the next event with lower cooldown that can be usable,
      // respecting priority order
      const nextEvent = events.reduce((prio, next) => {
        if (!next.canUse) return prio
        if (prio.timeLeft <= next.timeLeft && prio.canUse) return prio
        return next
      })

      // Tick cooldowns
      const secs = nextEvent.timeLeft
      player.gcd.tick(time, secs)
      events.forEach((e) => e.tick(time, secs))
      time += secs

      if (time > cfg.duration) break

      // Handle events
      if (nextEvent.swing) nextEvent.swing(time)
      if (nextEvent.use) nextEvent.use(time)

      // Queue mechanic skills
      player.heroicStrike.queue(time)
    }

    console.log(player)

    dmg += player.getDps(cfg.duration)
    postMessage({ progress: i })
  }

  const endTime = new Date().getTime()
  const finishedIn = ((endTime - startTime) / 1000)

  console.log('Finished in', finishedIn, 'secs')
  console.log('DPS:', (dmg / maxIterations).toFixed(1))
  // console.log('DPS:', player.getDps(cfg.duration))

  const summary = { dps: (dmg / maxIterations).toFixed(1), finishedIn }
  Object.assign(summary)
  postMessage({ summary })
  
}

onmessage = function (e) {
  const cfg = e.data
  run(cfg)
}