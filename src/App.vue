<template>
  <div id="app">
    <pre>{{ result }}</pre>
  </div>
</template>

<script>
  const duration = 100
  const worldBuffsAp = 200 + 140 + 30
  const consumablesAp = 60 + 50 + 35 + 20

  export default {
    name: 'app',
    data() {
      return {
        worker: new Worker('./scripts/sim.js'),
        result: 'Aguardando',
        cfg: {
          debug: true,
          iterations: 50000,
          duration,
          latency: {
            min: 0,
            max: 0
          },
          player: {
            lvl: 60,
            str: 250,
            gearAp: 230,
            buffAp: worldBuffsAp + consumablesAp + 24 + 122,
            hit: 6,
            haste: 0,
            crit: 40,
            bloodFury: true,
            wf: true,
            improvedWf: false,
            hoj: true
          },
          target: {
            lvl: 63,
            armor: 3731,
            sunderArmor: true,
            faerieFire: true,
            cor: true,
            annihilator: false
          },
          // mainhand: {
          //   type: 'TWO_HANDED', // Spinal Reaper
          //   skill: 305,
          //   dmgMin: 203,
          //   dmgMax: 305,
          //   speed: 3.4
          // },
          mainhand: {
            type: 'ONE_HANDED', // DB
            skill: 305,
            dmgMin: 114,
            dmgMax: 213,
            speed: 2.9,
            enchant: true
          },
          // offhand: {
          //   type: 'ONE_HANDED', // BSH
          //   skill: 305,
          //   dmgMin: 48,
          //   dmgMax: 90,
          //   speed: 1.7,
          //   enchant: true
          // },
          offhand: {
            type: 'ONE_HANDED', // Frostbite
            skill: 305,
            dmgMin: 80,
            dmgMax: 150,
            speed: 2.7,
            enchant: true
          },
          bloodFury: {
            waitCrusader: true,
            waitDeathWish: true
          },
          deathWish: {
            timeLeft: Math.max(0, duration - 30)
          },
          heroicStrike: {
            rage: 50
          },
          whirlwind: {
            rage: 25,
            btCooldown: 1
          },
          bloodrage: {
            rage: 50
          },
          mrp: {
            rage: 50,
            waitCrusader: true,
            waitDeathWish: true
          }
        }
      }
    },
    mounted() {
      this.worker.onmessage = (e) => this.result = e.data
      this.worker.postMessage(this.cfg)
    }
  }
</script>

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    margin-top: 1em;
  }
</style>
