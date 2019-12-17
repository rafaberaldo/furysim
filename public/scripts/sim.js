importScripts('./classes/Flurry.js')
importScripts('./classes/Player.js')
importScripts('./classes/Rage.js')
importScripts('./classes/Target.js')
importScripts('./classes/Weapon.js')

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
importScripts('./classes/Cooldowns/HandOfJustice.js')

importScripts('./classes/Skill.js')
importScripts('./classes/Skills/Bloodthirst.js')
importScripts('./classes/Skills/HeroicStrike.js')
importScripts('./classes/Skills/Whirlwind.js')

importScripts('./helpers.js')

function run(cfg) {
  const startTime = new Date().getTime()
  let dmg = 0
  let maxIterations = cfg.debug ? 1 : cfg.iterations
  const exists = (e) => !!e

  for (let i = 0; i < maxIterations; ++i) {
    const player = new Player(cfg)
    if (i === 0 && cfg.debug) console.log(player, player.offhand.attackTable)

    const events = [
      player.mainhand,
      player.offhand,

      player.battleShout,
      player.deathWish,
      player.bloodrage,
      player.bloodFury,
      player.mrp,

      player.bloodthirst,
      player.whirlwind,

      player.bloodrage.periodic,
      player.angerManagement
    ].filter(exists)

    const otherCooldowns = [
      player.gcd,
      player.windfury,
      player.hoj
    ].filter(exists)

    let time = 0
    while (time < cfg.duration) {
      // Get the next event with lower cooldown that can be usable,
      // respecting priority order
      const nextEvent = events.reduce((prio, next) => {
        if (!next.canUse) return prio
        if (prio.normTimeLeft <= next.normTimeLeft && prio.canUse) return prio
        return next
      })

      // if (nextEvent === player.bloodrage.periodic) debugger;

      const secs = nextEvent.normTimeLeft
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

      // Try to queue HS
      player.heroicStrike.queue()
    }

    dmg += player.getDps(cfg.duration)
    const progress = m.round(i / maxIterations * 100) + '%'
    postMessage({ progress })
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
