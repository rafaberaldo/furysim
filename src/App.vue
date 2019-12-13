<template>
  <div id="app">
    <pre>
      {{ result }}
    </pre>
  </div>
</template>

<script>
  import sim from './utils/sim'

  export default {
    name: 'app',
    data() {
      return {
        result: []
      }
    },
    mounted() {
      const cfg = {
          duration: 45,
          player: {
            lvl: 60,
            str: 270,
            ap: 1500,
            hit: 6,
            haste: 0,
            crit: 25
          },
          target: {
            lvl: 63,
            armor: 3731
          },
          mainhand: {
            wpnType: 'TWO_HANDED', // Spinal Reaper
            skill: 305,
            dmgMin: 203,
            dmgMax: 305,
            speed: 3.4
          },
          // mainhand: {
          //   wpnType: 'ONE_HANDED', // DB
          //   skill: 305,
          //   dmgMin: 114,
          //   dmgMax: 213,
          //   speed: 2.9,
          //   enchant: 'ENCH_CRUSADER'
          // },
          // offhand: {
          //   wpnType: 'ONE_HANDED', // BSH
          //   skill: 305,
          //   dmgMin: 48,
          //   dmgMax: 90,
          //   speed: 1.7
          // }
      }

      this.result = sim.run(cfg)
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
