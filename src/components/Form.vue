<template>
  <form @submit.prevent="submit">
    <div class="grid-container quarters">
      <section class="grid-item">
        <h4>Player Stats w/ Gear</h4>
        <p>
          With gear, unbuffed and untalented. I recommend
          <a href="https://sixtyupgrades.com" rel="noopener" target="_blank">Sixty Upgrades</a>.
        </p>
        <div class="horizontal">
          <label>Level</label>
          <input type="number" required min="1" max="60" v-model.number="formData.player.lvl">
        </div>

        <div class="horizontal">
          <label>Strength</label>
          <input type="number" required min="10" max="1000" v-model.number="formData.player.str">
        </div>

        <div class="horizontal">
          <label>Attack Power</label>
          <input type="number" required min="50" max="5000" v-model.number="formData.player.ap">
        </div>

        <div class="horizontal">
          <label>Hit (%)</label>
          <input type="number" required min="0" max="100" v-model.number="formData.player.hit">
        </div>

        <div class="horizontal">
          <label>Haste (%)</label>
          <input type="number" required min="0" max="50" v-model.number="formData.player.haste">
        </div>

        <div class="horizontal">
          <label>Crit (%)</label>
          <input type="number" required min="0" max="100" step="0.05" v-model.number="formData.player.crit">
        </div>

        <div class="horizontal">
          <label>Start Rage</label>
          <input type="number" required min="0" max="100" v-model.number="formData.player.startRage">
        </div>

        <div class="horizontal">
          <label><a :href="talentsUrl" rel="noopener" target="_blank">Talents</a></label>
          <input
            type="url"
            required
            pattern="https?://classic\.wowhead\.com/talent-calc/warrior/.+"
            v-model="formData.player.talents">
        </div>
      </section>

      <section class="grid-item">
        <h4>Buffs</h4>
        <label v-for="item in formGenerator.buffs" :key="item.value">
          <input type="checkbox" v-model="formData.player.buffs" :value="item.value">
          <span class="label-body">{{ item.title }}</span>
        </label>
      </section>

      <section class="grid-item">
        <h4>Consumables</h4>
        <label v-for="item in formGenerator.consumables" :key="item.value">
          <input type="checkbox" v-model="formData.player.buffs" :value="item.value">
          <span class="label-body">{{ item.title }}</span>
        </label>
      </section>

      <section class="grid-item">
        <h4>Target Stats</h4>
        <div class="horizontal">
          <label>Level</label>
          <input type="number" required min="1" max="63" v-model.number="formData.target.lvl">
        </div>

        <div class="horizontal">
          <label>Armor</label>
          <input type="number" required min="0" max="10000" v-model.number="formData.target.armor">
        </div>

        <div class="horizontal">
          <label>After Reductions</label>
          <span class="u-family-title">{{ targetArmor }}</span>
        </div>

        <div class="horizontal">
          <label>Mitigation</label>
          <span class="u-family-title">{{ targetMitigation }}%</span>
        </div>

        <label v-for="item in formGenerator.debuffs" :key="item.value">
          <input type="checkbox" v-model="formData.target.debuffs" :value="item.value">
          <span class="label-body">{{ item.title }}</span>
        </label>
      </section>
    </div>

    <div class="grid-container quarters">
      <section class="grid-item">
        <div class="u-block">
          <h4>Trinkets</h4>
          <label>
            <input type="checkbox" v-model="formData.player.hoj">
            <span class="label-body">Hand of Justice</span>
          </label>
        </div>

        <Weapon v-model="formData.player.mainhand" :mainhand="true"/>
        <Weapon v-model="formData.player.offhand" :mainhand="false"/>
      </section>

      <section class="grid-item" style="grid-column: span 2">
        <h4>Rotation</h4>
        <p>Skills follow this priority order (can't change for now)</p>
        <label v-if="hasDeathWish">
          <input class="disabled" type="checkbox" checked disabled>
          <span class="label-body u-weight-bold">Death Wish </span>
        </label>
        <div class="ident">
          <label>
            <input type="checkbox" v-model="formData.player.deathWish.last30">
            <span class="label-body">In the last 30 secs of fight</span>
          </label>
        </div>

        <label>
          <input class="disabled" type="checkbox" checked disabled>
          <span class="label-body u-weight-bold">Bloodrage</span>
        </label>
        <div class="ident">
          <div class="horizontal">
            <span>If <code>rage &lt;=</code></span>
            <input type="number" min="0" max="100" v-model.number="formData.player.bloodrage.rage">
          </div>
        </div>

        <label v-if="hasMrp">
          <input class="disabled" type="checkbox" checked disabled>
          <span class="label-body u-weight-bold">MRP</span>
        </label>
        <div v-if="hasMrp" class="ident">
          <div class="horizontal">
            <span>If <code>rage &lt;=</code></span>
            <input type="number" min="0" max="100" v-model.number="formData.player.mrp.rage">
          </div>
          <label>
            <input type="checkbox" v-model="formData.player.mrp.waitDeathWish">
            <span class="label-body">Wait for Death Wish</span>
          </label>
          <label>
            <input type="checkbox" v-model="formData.player.mrp.waitCrusader">
            <span class="label-body">Wait for Crusader Proc</span>
          </label>
        </div>

        <label v-if="hasBloodFury">
          <input class="disabled" type="checkbox" checked disabled>
          <span class="label-body u-weight-bold">Blood Fury</span>
        </label>
        <div v-if="hasBloodFury" class="ident">
          <label>
            <input type="checkbox" v-model="formData.player.bloodFury.waitDeathWish">
            <span class="label-body">Wait for Death Wish</span>
          </label>
          <label>
            <input type="checkbox" v-model="formData.player.bloodFury.waitCrusader">
            <span class="label-body">Wait for Crusader Proc</span>
          </label>
        </div>

        <label>
          <input class="disabled" type="checkbox" checked disabled>
          <span class="label-body u-weight-bold">Execute</span>
        </label>
        <div class="ident">
          <div class="horizontal">
            <span>Execute Phase lasts <code>{{ executeDuration }} secs =</code></span>
            <input type="number" required min="0" max="100" step="0.5" v-model.number="formData.player.execute.percent">
            <span>%</span>
          </div>
          <label>
            <input type="checkbox" v-model="formData.player.execute.bloodthirst.priority">
            <span class="label-body">Use Bloodthirst on Execute Phase if <code>AP >=</code></span>
            <input type="number" min="0" max="5000" v-model.number="formData.player.execute.bloodthirst.ap">
          </label>
        </div>

        <label v-if="hasBloodthirst">
          <input class="disabled" type="checkbox" checked disabled>
          <span class="label-body u-weight-bold">Bloodthirst whenever available</span>
        </label>

        <label>
          <input type="checkbox" v-model="formData.player.slam.canUse">
          <span class="label-body u-weight-bold">AutoSlam</span>
        </label>
        <div class="ident" :class="{ 'disabled': !formData.player.slam.canUse }">
          <div class="horizontal">
            <span>If <code>rage &gt;=</code></span>
            <input type="number" min="0" max="100" v-model.number="formData.player.slam.rage">
          </div>
          <div class="horizontal">
            <span>If Bloodthirst <code>cooldown left &gt;=</code></span>
            <input type="number" min="0" max="6" step="0.5" v-model.number="formData.player.slam.btCooldown">
          </div>
          <div class="horizontal">
            <span>If swing <code>time left &lt;= {{ slamCastTime }}</code> and <code>&gt;=</code></span>
            <input type="number" min="0" max="4" step="0.1" v-model.number="formData.player.slam.swing">
          </div>
          <div class="horizontal">
            <span>Spam Slam if <code>rage &gt;=</code></span>
            <input type="number" min="0" max="100" v-model.number="formData.player.slam.spamRage">
          </div>
        </div>

        <label>
          <input type="checkbox" v-model="formData.player.whirlwind.canUse">
          <span class="label-body u-weight-bold">Whirlwind</span>
        </label>
        <div class="ident" :class="{ 'disabled': !formData.player.whirlwind.canUse }">
          <div class="horizontal">
            <span>If <code>rage &gt;=</code></span>
            <input type="number" min="0" max="100" v-model.number="formData.player.whirlwind.rage">
          </div>
          <div class="horizontal">
            <span>If Bloodthirst and AutoSlam <code>cooldown left &gt;=</code></span>
            <input type="number" min="0" max="6" step="0.5" v-model.number="formData.player.whirlwind.btSlamCooldown">
          </div>
        </div>

        <label>
          <input type="checkbox" v-model="formData.player.heroicStrike.canUse">
          <span class="label-body u-weight-bold">Heroic Strike</span>
        </label>
        <div class="ident" :class="{ 'disabled': !formData.player.heroicStrike.canUse }">
          <div class="horizontal">
            <span>If <code>rage &gt;=</code></span>
            <input type="number" min="0" max="100" v-model.number="formData.player.heroicStrike.rage">
          </div>
        </div>

        <label>
          <input type="checkbox" v-model="formData.player.hamstring.canUse">
          <span class="label-body u-weight-bold">Hamstring</span>
        </label>
        <div class="ident" :class="{ 'disabled': !formData.player.hamstring.canUse }">
          <div class="horizontal">
            <span>If <code>rage &gt;=</code></span>
            <input type="number" min="0" max="100" v-model.number="formData.player.hamstring.rage">
          </div>
          <div class="horizontal">
            <span>If Bloodthirst, WW and AutoSlam <code>cooldown left &gt;=</code></span>
            <input type="number" min="0" max="6" step="0.5" v-model.number="formData.player.hamstring.btWwSlamCooldown">
          </div>
        </div>
      </section>

      <section class="grid-item">
        <h4>Stats After Buffs</h4>
        <div class="u-block">
          <div class="horizontal">
            <label>Strength</label>
            <span class="u-family-title">{{ playerStats.str }}</span>
          </div>
          <div class="horizontal">
            <label>Attack Power</label>
            <span class="u-family-title">{{ playerStats.ap }}</span>
          </div>
          <div class="horizontal">
            <label>Haste</label>
            <span class="u-family-title">{{ playerStats.haste }}%</span>
          </div>
          <div class="horizontal">
            <label>Crit</label>
            <span class="u-family-title">{{ playerStats.crit }}%</span>
          </div>
          <small>* BoK is added during sim to account procs.</small>
        </div>

        <h4>Simulation</h4>
        <div class="horizontal">
          <label>Duration of Fight (secs)</label>
          <input type="number" required min="10" max="3600" v-model.number="formData.duration">
        </div>
        <div class="horizontal">
          <label>Total Iterations</label>
          <input type="number" required min="1" max="100000" v-model.number="formData.iterations">
        </div>

        <label>
          <input type="checkbox" v-model="formData.latency.active">
          <span class="label-body u-weight-bold">Add latency to every action</span>
        </label>
        <div class="horizontal u-block" :class="{ 'disabled': !formData.latency.active }">
          <label>Min/Max</label>
          <input type="number" :required="formData.latency.active" :disabled="!formData.latency.active" min="0" max="500" v-model.number="formData.latency.min">
          <input type="number" :required="formData.latency.active" :disabled="!formData.latency.active" min="0" max="500" v-model.number="formData.latency.max">
        </div>

        <button class="button-primary u-full-width" :class="{ 'noevents': isLoading }">
          <span class="progress" :style="{ width: `${message.progress}%` }"/>
          <span class="u-pos-relative">
            {{ isLoading && message.progress ? `${Math.round(message.progress)}%` : 'Simulate!' }}
          </span>
        </button>

        <small><a role="button" @click="reset">Reset everything to default</a></small>

        <Report v-if="result.finishedIn" :data="result" simple/>
      </section>
    </div>
  </form>
</template>

<script>
import Report from '@/components/Report'
import Weapon from '@/components/Weapon'
import weaponsData from '@/data/weapons'
import { m, parseTalents } from '@/scripts/helpers'

export default {
  name: 'app',
  components: {
    Report,
    Weapon
  },
  data() {
    const defaultMh = weaponsData['1H Axes'].find(w => w.title === 'Deathbringer')
    const defaultOh = weaponsData['1H Axes'].find(w => w.title === 'Frostbite')

    return {
      worker: new Worker('@/scripts/sim.worker', { type: 'module' }),
      result: {},
      message: {},
      isLoading: false,
      formData: {
        duration: 90,
        iterations: process.env.NODE_ENV === 'production' ? 10000 : 500,
        latency: {
          active: false,
          min: 60,
          max: 200
        },
        player: {
          lvl: 60,
          str: 250,
          ap: 910,
          hit: 6,
          haste: 0,
          crit: 20.45,
          hoj: true,
          startRage: 0,
          talents: 'https://classic.wowhead.com/talent-calc/warrior/30305001302-05050005525010051',
          buffs: [
            'ony', 'dm', 'sf', 'mark', 'bloodFury', 'strTotem', 'wf', 'jujuPower',
            'roids', 'firewater', 'sunfruit', 'mrp', 'mongoose', 'eleStoneOh'
          ],
          mainhand: {
            canUse: true,
            min: defaultMh.min,
            max: defaultMh.max,
            speed: defaultMh.speed,
            type: defaultMh.type,
            skill: 305,
            enchant: true,
            proc: {
              type: defaultMh.proc &&  defaultMh.proc.type,
              percent: defaultMh.proc &&  defaultMh.proc.percent,
              amount: defaultMh.proc &&  defaultMh.proc.amount
            }
          },
          offhand: {
            canUse: true,
            min: defaultOh.min,
            max: defaultOh.max,
            speed: defaultOh.speed,
            type: defaultOh.type,
            skill: 305,
            enchant: true,
            proc: {
              type: defaultOh.proc &&  defaultOh.proc.type,
              percent: defaultOh.proc &&  defaultOh.proc.percent,
              amount: defaultOh.proc &&  defaultOh.proc.amount
            }
          },
          bloodFury: {
            waitCrusader: true,
            waitDeathWish: true
          },
          deathWish: {
            last30: true
          },
          heroicStrike: {
            canUse: true,
            rage: 50
          },
          whirlwind: {
            canUse: true,
            rage: 25,
            btSlamCooldown: 1
          },
          hamstring: {
            canUse: true,
            rage: 80,
            btWwSlamCooldown: 1
          },
          slam: {
            canUse: false,
            rage: 15,
            spamRage: 80,
            btCooldown: 1,
            swing: 0.5
          },
          execute: {
            percent: 12,
            bloodthirst: {
              priority: true,
              ap: 2000
            }
          },
          bloodrage: {
            rage: 50
          },
          mrp: {
            rage: 50,
            waitCrusader: true,
            waitDeathWish: true
          }
        },
        target: {
          lvl: 63,
          armor: 3731,
          debuffs: ['sunder', 'faerieFire', 'cor']
        },
      }
    }
  },
  computed: {
    formGenerator() {
      return {
        buffs: [
          { title: 'Rallying Cry (Onyxia Head)', value: 'ony' },
          { title: 'Fengus\' Ferocity (DM AP)', value: 'dm' },
          { title: 'Songflower Serenade', value: 'sf' },
          { title: 'Warchief\'s Blessing (Rend)', value: 'wcb' },
          { title: 'Mark of the Wild', value: 'mark' },
          { title: 'Leader of the Pack', value: 'lotp' },
          { title: 'Trueshot Aura', value: 'trueshot' },
          { title: '[H] Blood Fury (Orc)', value: 'bloodFury' },
          { title: '[H] Strength of Earth Totem', value: 'strTotem' },
          { title: '[H] Windfury', value: 'wf' },
          { title: '[H] Improved Windfury', value: 'improvedWf' },
          { title: '[A] Blessing of Might', value: 'bom' },
          { title: '[A] Blessing of Kings *', value: 'bok' },
        ],
        consumables: [
          { title: 'Juju Power', value: 'jujuPower' },
          { title: 'Elixir of Giants', value: 'giants' },
          { title: 'R.O.I.D.S.', value: 'roids' },
          { title: 'Juju Might', value: 'jujuMight' },
          { title: 'Winterfall Firewater', value: 'firewater' },
          { title: 'Blessed Sunfruit', value: 'sunfruit' },
          { title: 'Mighty Rage Potion (MRP)', value: 'mrp' },
          { title: 'Elixir of the Mongoose', value: 'mongoose' },
          { title: 'Elem. Sharp. Stone MH', value: 'eleStoneMh' },
          { title: 'Elem. Sharp. Stone OH', value: 'eleStoneOh' },
        ],
        debuffs: [
          { title: 'Sunder Armor', value: 'sunder' },
          { title: 'Faerie Fire', value: 'faerieFire' },
          { title: 'Curse of Recklessness', value: 'cor' },
          { title: 'Annihilator', value: 'anni' },
        ]
      }
    },
    cfg() {
      const form = this.formData
      if (!form.player.mainhand.canUse) return

      form.player.execute.start = form.duration * (1 - form.player.execute.percent / 100)
      form.player.mainhand.proc.chance = form.player.mainhand.proc.percent / 100
      form.player.offhand.proc.chance = form.player.offhand.proc.percent / 100
      form.player.deathWish.timeLeft = form.player.deathWish.last30 ? m.max(0, form.duration - 30) : 0

      return {
        iterations: form.iterations,
        duration: form.duration,
        latency: form.latency,
        player: {
          lvl: form.player.lvl,
          str: this.playerStats.str,
          ap: this.playerStats.ap,
          crit: this.playerStats.crit,
          haste: this.playerStats.haste,
          hit: form.player.hit,
          startRage: form.player.startRage,
          talents: form.player.talents,
          buffs: {
            wf: form.player.buffs.indexOf('wf') > -1,
            improvedWf: form.player.buffs.indexOf('improvedWf') > -1,
            bok: form.player.buffs.indexOf('bok') > -1,
            bloodFury: form.player.buffs.indexOf('bloodFury') > -1,
            mrp: form.player.buffs.indexOf('mrp') > -1
          },
          hoj: form.player.hoj,
          mainhand: form.player.mainhand,
          offhand: form.player.offhand,
          bloodFury: form.player.bloodFury,
          heroicStrike: form.player.heroicStrike,
          whirlwind: form.player.whirlwind,
          hamstring: form.player.hamstring,
          slam: form.player.slam,
          bloodrage: form.player.bloodrage,
          mrp: form.player.mrp,
          execute: form.player.execute,
          deathWish: form.player.deathWish
        },
        target: {
          lvl: form.target.lvl,
          armor: this.targetArmor
        }
      }
    },
    playerStats() {
      const initBaseAp = this.getBaseAp(this.formData.player.str)
      const gearAp = this.formData.player.ap - initBaseAp

      // BoK is calculated on sim to account procs
      let str = this.formData.player.str
      this.formData.player.buffs.forEach((value) => {
        if (value === 'sf') str += 15
        if (value === 'mark') str += 12
        if (value === 'strTotem') str += 61
        if (value === 'jujuPower') str += 30
        if (value === 'giants') str += 25
        if (value === 'roids') str += 25
        if (value === 'sunfruit') str += 10
      })

      let buffAp = 0
      this.formData.player.buffs.forEach((value) => {
        if (value === 'ony') buffAp += 140
        if (value === 'dm') buffAp += 200
        if (value === 'trueshot') buffAp += 100
        if (value === 'bom') buffAp += 155
        if (value === 'jujuMight') buffAp += 40
        if (value === 'firewater') buffAp += 35
      })

      const baseAp = this.getBaseAp(str)
      const ap = baseAp + gearAp + buffAp

      let crit = this.formData.player.crit
      this.formData.player.buffs.forEach((value) => {
        if (value === 'ony') crit += 5
        if (value === 'sf') crit += 5.75
        if (value === 'mark') crit += 0.6
        if (value === 'lotp') crit += 3
        if (value === 'mongoose') crit += 3.25
        if (value === 'eleStoneMh') crit += 2
        if (value === 'eleStoneOh') crit += 2
      })
      crit += this.talents.cruelty
      crit = Number(crit.toFixed(2))

      let haste = this.formData.player.haste
      haste += this.formData.player.buffs.indexOf('wcb') > -1 ? 15 : 0

      return { str, ap, crit, haste }
    },
    hasMrp() {
      return this.formData.player.buffs.indexOf('mrp') > -1
    },
    hasBloodFury() {
      return this.formData.player.buffs.indexOf('bloodFury') > -1
    },
    hasDeathWish() {
      return !!this.talents.deathWish
    },
    hasBloodthirst() {
      return !!this.talents.bloodthirst
    },
    slamCastTime() {
      return 1.5 - this.talents.improvedSlam * 0.1
    },
    executeDuration() {
      return (this.formData.duration * (this.formData.player.execute.percent / 100))
        .toFixed(1)
    },
    targetArmor() {
      let armor = this.formData.target.armor
      this.formData.target.debuffs.forEach((value) => {
        if (value === 'sunder') armor -= 2250
        if (value === 'faerieFire') armor -= 505
        if (value === 'cor') armor -= 640
        if (value === 'anni') armor -= 600
      })
      return m.max(0, armor)
    },
    targetMitigation() {
      const mitig = this.targetArmor / (this.targetArmor + 400 + 85 * this.formData.player.lvl)
      return (mitig * 100).toFixed(1)
    },
    talents() {
      return parseTalents(this.formData.player.talents)
    },
    talentsUrl() {
      const correctUrl = 'classic.wowhead.com/talent-calc/warrior/'
      return this.formData.player.talents.indexOf(correctUrl) > -1
        ? this.formData.player.talents
        : 'https://' + correctUrl
    }
  },
  watch: {
    'formData.player.mainhand.type': function (value) {
      if (value === 'TWO_HANDED') this.formData.player.offhand.canUse = false
    },
    'formData.player.offhand.canUse': function (value) {
      if (value  && this.formData.player.mainhand.type === 'TWO_HANDED') {
        this.formData.player.mainhand.type = 'ONE_HANDED'
      }
    }
  },
  methods: {
    submit() {
      if (this.isLoading) return

      this.worker.onerror = (e) => this.message = `Error: ${e}`
      this.worker.postMessage(JSON.stringify(this.cfg))
      this.worker.onmessage = ({ data }) => {
        this.message = data
        if (this.message.finishedIn) {
          this.result = data
          this.result.report = JSON.parse(data.report)
          this.result.timeline = JSON.parse(data.timeline)
          this.isLoading = false
          this.$emit('report', this.result)
        }
      }

      this.isLoading = true
      localStorage.formData = JSON.stringify(this.formData)
    },
    getBaseAp(str) {
      return (this.formData.player.lvl * 3 - 20) + str * 2
    },
    reset() {
      Object.assign(this.$data, this.$options.data.apply(this))
      this.$emit('report', this.result)
    }
  },
  mounted() {
    if (localStorage.formData) {
      this.formData = JSON.parse(localStorage.formData)
    }
  }
}
</script>

<style>
  .horizontal {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  .horizontal label {
    margin-bottom: 0;
    margin-right: 10px;
    flex-basis: 0;
    flex-grow: 1;
    flex-shrink: 0;
  }
  .horizontal .title { margin: 0; }
  .horizontal input[type="number"] + input[type="number"] {
    margin-left: 5px;
  }

  button .progress {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #000;
    opacity: 0.35;
    pointer-events: none;
  }

  .disabled {
    pointer-events: none;
    opacity: 0.25;
    transition: opacity 80ms ease;
  }
  .noevents {
    pointer-events: none;
  }
  .ident {
    margin-left: 2.5rem;
  }
</style>
