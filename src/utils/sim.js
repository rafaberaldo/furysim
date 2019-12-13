/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import Player from './classes/Player'

export default {
  run(cfg) {
    const player = new Player(cfg)

    console.log(player)

    const startTime = new Date().getTime()

    for (let tick = 0; tick < cfg.duration * 1000; tick++) {
      this.handleTick(player, tick)
    }

    const endTime = new Date().getTime()
    const finishedIn = ((endTime - startTime) / 1000)

    console.log('Finished in', finishedIn, 'secs')
    console.log('DPS:', player.getDps(cfg.duration))

    const result = { dps: player.getDps(cfg.duration), finishedIn }
    Object.assign(result, player.log)
    return JSON.stringify(result, null, 2)
  },

  handleTick(player, tick) {
    const exists = (e) => !!e
    const eventOrder = [
      player.bloodFury,
      player.deathWish,
      player.bloodthirst,
      player.whirlwind,
      player.mainhand,
      player.offhand,
      player.angerManagement
    ].filter(exists)

    eventOrder.forEach((e) => {
      if (!e.canUse) return
      if (e.swing) e.swing(tick)
      if (e.use) e.use(tick)
    })

    // Tick cooldowns
    player.gcd.tick()
    player.flurry.tick(tick)
    eventOrder.forEach((e) => {
      if (e.cooldown) e.cooldown.tick(tick)
      if (e.tick) e.tick(tick)
    })
  }
}
