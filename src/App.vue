<template>
  <div id="app">
    <pre>
      {{ result }}
    </pre>
  </div>
</template>

<script>
  export default {
    name: 'app',
    data() {
      return {
        worker: new Worker('./scripts/sim.js'),
        result: 'Aguardando',
        cfg: {
          debug: true,
          iterations: 1000,
          duration: 40,
          player: {
            lvl: 60,
            str: 270,
            ap: 1700,
            hit: 6,
            haste: 0,
            crit: 45
          },
          target: {
            lvl: 63,
            armor: 3731
          },
          // mainhand: {
          //   wpnType: 'TWO_HANDED', // Spinal Reaper
          //   skill: 305,
          //   dmgMin: 203,
          //   dmgMax: 305,
          //   speed: 3.4
          // },
          mainhand: {
            wpnType: 'ONE_HANDED', // DB
            skill: 305,
            dmgMin: 114,
            dmgMax: 213,
            speed: 2.9,
            enchant: 'ENCH_CRUSADER'
          },
          offhand: {
            wpnType: 'ONE_HANDED', // BSH
            skill: 305,
            dmgMin: 48,
            dmgMax: 90,
            speed: 1.7
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
