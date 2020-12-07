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
          <label>Agility</label>
          <input type="number" required min="10" max="1000" v-model.number="formData.player.agi">
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
          <input type="number" required min="0" max="100" step="0.01" v-model.number="formData.player.crit">
        </div>

        <div class="horizontal">
          <label>Start Rage</label>
          <input type="number" required min="0" max="100" v-model.number="formData.player.startRage">
        </div>

        <div class="horizontal select-edit">
          <label><a :href="talentsUrl" rel="noopener" target="_blank">Talents</a></label>
          <input
            v-if="formData.isCustomTalent"
            type="url"
            required
            pattern="https?://classic\.wowhead\.com/talent-calc/warrior/.+"
            style="flex-grow: 1"
            v-model="formData.player.talents"
            @blur="resetTalent">
          <select v-else v-model="formData.player.talents">
            <option :value="dwTalent">
              Default Dual Wield
            </option>
            <option value="https://classic.wowhead.com/talent-calc/warrior/20305011332-05052005025010051">
              Default Two-Hand
            </option>
            <option value="https://classic.wowhead.com/talent-calc/warrior/20305011332-05050005005410051">
              Default Slam
            </option>
            <option disabled>────────</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      </section>

      <section class="grid-item">
        <h4>Buffs</h4>
        <ul>
          <li v-for="item in formGenerator.buffs" :key="item.value" class="u-flex" :class="{ 'disabled': item.disabled }">
            <label>
              <input type="checkbox" v-model="formData.player.buffs" :value="item.value" :disabled="item.disabled">
              <span class="label-body">{{ item.title }}</span>
            </label>
          </li>
        </ul>
      </section>

      <section class="grid-item">
        <h4>Consumables</h4>
        <ul>
          <li v-for="item in formGenerator.consumables" :key="item.value" class="u-flex" :class="{ 'disabled': item.disabled }">
            <label>
              <input type="checkbox" v-model="formData.player.buffs" :value="item.value" :disabled="item.disabled">
              <span class="label-body">{{ item.title }}</span>
            </label>
          </li>
        </ul>
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

        <ul>
          <li v-for="item in formGenerator.debuffs" :key="item.value" class="u-flex" :class="{ 'disabled': item.disabled }">
            <label>
              <input type="checkbox" v-model="formData.target.debuffs" :value="item.value" :disabled="item.disabled">
              <span class="label-body">{{ item.title }}</span>
            </label>
          </li>
        </ul>

        <div class="horizontal">
          <label>Armor After Reductions</label>
          <span class="u-family-title">{{ targetArmor }}</span>
        </div>

        <div class="horizontal">
          <label>Mitigation</label>
          <span class="u-family-title">{{ targetMitigation }}%</span>
        </div>
      </section>
    </div>

    <div class="grid-container quarters">
      <section class="grid-item">
        <div class="u-block">
          <h4>Gear</h4>
          <ul>
            <li>
              <label>
                <input type="checkbox" v-model="formData.player.hoj">
                <span class="label-body">Hand of Justice</span>
              </label>
            </li>
            <li>
              <label>
                <input type="checkbox" v-model="formData.player.diamondFlask.canUse">
                <span class="label-body">Diamond Flask</span>
              </label>
            </li>
            <li>
              <label>
                <input type="checkbox" v-model="formData.player.cloudkeeper.canUse">
                <span class="label-body">Cloudkeeper Legplates</span>
              </label>
            </li>
            <li>
              <label>
                <input type="checkbox" v-model="formData.player.hamstring.pvpGloves">
                <span class="label-body">PvP Gloves</span>
              </label>
            </li>
          </ul>
        </div>

        <Weapon v-model="formData.player.mainhand" :mainhand="true"/>
        <Weapon v-model="formData.player.offhand" :mainhand="false"/>
      </section>

      <section class="grid-item span-2">
        <h4>Rotation</h4>
        <p>Skills follow this priority order (can't change for now)</p>
        <div v-if="hasDeathWish" class="u-flex">
          <label>
            <input class="disabled" type="checkbox" checked disabled>
            <span class="label-body u-weight-bold">Death Wish </span>
          </label>
        </div>
        <div v-if="hasDeathWish" class="ident">
          <div class="u-flex">
            <label>
              <input type="checkbox" v-model="formData.player.deathWish.last30">
              <span class="label-body">In the last 30 secs of fight</span>
            </label>
          </div>
        </div>

        <div class="u-flex">
          <label>
            <input class="disabled" type="checkbox" checked disabled>
            <span class="label-body u-weight-bold">Bloodrage</span>
          </label>
        </div>
        <div class="ident">
          <div class="horizontal">
            If
            <code>rage &lt;=
              <input type="number" min="0" max="100" v-model.number="formData.player.bloodrage.rage">
            </code>
          </div>
        </div>

        <div class="u-flex">
          <label v-if="hasMrp">
            <input class="disabled" type="checkbox" checked disabled>
            <span class="label-body u-weight-bold">MRP</span>
          </label>
        </div>
        <div v-if="hasMrp" class="ident">
          <div class="horizontal">
            If
            <code>rage &lt;=
              <input type="number" min="0" max="100" v-model.number="formData.player.mrp.rage">
            </code>
          </div>
          <div class="u-flex">
            <label>
              <input type="checkbox" v-model="formData.player.mrp.waitExecute">
              <span class="label-body">Wait for Execute Phase</span>
            </label>
          </div>
          <div class="u-flex">
            <label>
              <input type="checkbox" v-model="formData.player.mrp.waitDeathWish">
              <span class="label-body">Wait for Death Wish</span>
            </label>
          </div>
          <div class="u-flex">
            <label>
              <input type="checkbox" v-model="formData.player.mrp.waitCrusader">
              <span class="label-body">Wait for Crusader Proc</span>
            </label>
          </div>
        </div>

        <div class="u-flex">
          <label v-if="formData.player.cloudkeeper.canUse">
            <input class="disabled" type="checkbox" checked disabled>
            <span class="label-body u-weight-bold">Cloudkeeper Legplates</span>
          </label>
        </div>
        <div v-if="formData.player.cloudkeeper.canUse" class="ident">
          <div class="u-flex">
            <label>
              <input type="checkbox" v-model="formData.player.cloudkeeper.last30">
              <span class="label-body">In the last 30 secs of fight</span>
            </label>
          </div>
        </div>

        <div class="u-flex">
          <label v-if="formData.player.diamondFlask.canUse">
            <input class="disabled" type="checkbox" checked disabled>
            <span class="label-body u-weight-bold">Diamond Flask</span>
          </label>
        </div>
        <div v-if="formData.player.diamondFlask.canUse" class="ident">
          <div class="u-flex">
            <label>
              <input type="checkbox" v-model="formData.player.diamondFlask.last60">
              <span class="label-body">In the last 60 secs of fight</span>
            </label>
          </div>
        </div>

        <div class="u-flex">
          <label v-if="hasBloodFury">
            <input class="disabled" type="checkbox" checked disabled>
            <span class="label-body u-weight-bold">Blood Fury</span>
          </label>
        </div>
        <div v-if="hasBloodFury" class="ident">
          <div class="u-flex">
            <label>
              <input type="checkbox" v-model="formData.player.bloodFury.waitDeathWish">
              <span class="label-body">Wait for Death Wish</span>
            </label>
          </div>
          <div class="u-flex">
            <label>
              <input type="checkbox" v-model="formData.player.bloodFury.waitCrusader">
              <span class="label-body">Wait for 1 Crusader Proc</span>
            </label>
          </div>
          <div class="u-flex">
            <label>
              <input type="checkbox" v-model="formData.player.bloodFury.waitCrusaderOrDeathWish">
              <span class="label-body">
                Wait for {{ formData.player.offhand.canUse ? 2 : 1 }} Crusader Proc or Death Wish
              </span>
            </label>
          </div>
        </div>

        <label>
          <input class="disabled" type="checkbox" checked disabled>
          <span class="label-body u-weight-bold">Execute</span>
        </label>
        <div class="ident">
          <div class="horizontal">
            Execute Phase lasts
            <code>{{ executeDuration }} secs =
              <input type="number" required min="0" max="100" step="0.5" v-model.number="formData.player.execute.percent">
              %
            </code>
          </div>
          <div class="u-flex">
            <label>
              <input type="checkbox" v-model="formData.player.execute.bloodthirst.priority">
              <span class="label-body">Use Bloodthirst on Execute Phase if
                <code>AP >=
                  <input type="number" min="0" max="5000" v-model.number="formData.player.execute.bloodthirst.ap">
                </code>
              </span>
            </label>
          </div>
        </div>

        <div class="u-flex">
          <label v-if="hasBloodthirst">
            <input class="disabled" type="checkbox" checked disabled>
            <span class="label-body u-weight-bold">Bloodthirst whenever available</span>
          </label>
        </div>

        <div class="u-flex">
          <label>
            <input type="checkbox" v-model="formData.player.whirlwind.canUse">
            <span class="label-body u-weight-bold">Whirlwind</span>
          </label>
        </div>
        <div v-if="formData.player.whirlwind.canUse" class="ident">
          <div class="horizontal">
            If
            <code>rage &gt;=
              <input type="number" min="0" max="100" v-model.number="formData.player.whirlwind.rage">
            </code>
          </div>
          <div class="horizontal">
            If Bloodthirst
            <code>cooldown left &gt;=
              <input type="number" min="0" max="6" step="0.1" v-model.number="formData.player.whirlwind.btCooldown">
            </code>
          </div>
        </div>

        <div class="u-flex">
          <label>
            <input type="checkbox" v-model="formData.player.slam.canUse">
            <span class="label-body u-weight-bold">Slam</span>
          </label>
        </div>
        <div v-if="formData.player.slam.canUse" class="ident">
          <div class="horizontal">
            If
            <code>rage &gt;=
              <input type="number" min="0" max="100" v-model.number="formData.player.slam.rage">
            </code>
          </div>
          <div class="horizontal">
            If Bloodthirst
            <code>cooldown left &gt;=
              <input type="number" min="0" max="6" step="0.1" v-model.number="formData.player.slam.btCooldown">
            </code>
          </div>
          <div class="horizontal">
            If Whirlwind
            <code>cooldown left &gt;=
              <input type="number" min="0" max="6" step="0.1" v-model.number="formData.player.slam.wwCooldown">
            </code>
          </div>
          <div class="horizontal">
            If swing
            <code>elapsed time &lt;=
              <input
                type="number"
                min="0"
                max="1000"
                v-model.number="formData.player.slam.delayMs">
              ms
            </code>
          </div>
        </div>

        <div class="u-flex">
          <label>
            <input type="checkbox" v-model="formData.player.heroicStrike.canUse">
            <span class="label-body u-weight-bold">Heroic Strike</span>
          </label>
        </div>
        <div v-if="formData.player.heroicStrike.canUse" class="ident">
          <div class="horizontal">
            If
            <code>rage &gt;=
              <input type="number" min="0" max="100" v-model.number="formData.player.heroicStrike.rage">
            </code>
          </div>
        </div>

        <div class="u-flex">
          <label>
            <input type="checkbox" v-model="formData.player.hamstring.canUse">
            <span class="label-body u-weight-bold">Hamstring</span>
          </label>
        </div>
        <div v-if="formData.player.hamstring.canUse" class="ident">
          <div class="horizontal">
            If
            <code>rage &gt;=
              <input type="number" min="0" max="100" v-model.number="formData.player.hamstring.rage">
            </code>
          </div>
          <div class="horizontal">
            If Bloodthirst and WW
            <code>cooldown left &gt;=
              <input type="number" min="0" max="6" step="0.1" v-model.number="formData.player.hamstring.btWwCooldown">
            </code>
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
          <small>* BoK and Zandalar Str is added during sim to account procs.</small>
        </div>

        <h4>Simulation</h4>
        <p><small><a role="button" @click="reset">Reset settings to default</a></small></p>
        <p>
          <small><a role="button" @click="exportStt">Export settings</a></small> |
          <small><a role="button" @click="importStt">Import settings</a></small>
        </p>
        <div class="horizontal">
          <label>Duration of Fight (secs)</label>
          <input type="number" required min="10" max="3600" v-model.number="formData.duration">
        </div>
        <div class="horizontal">
          <label>Total Iterations</label>
          <input
            type="number"
            required
            :min="isCalcEP && isProd ? 50000 : 1"
            max="100000"
            v-model.number="formData.iterations">
        </div>

        <label>
          <input type="checkbox" v-model="formData.latency.active">
          <span class="label-body u-weight-bold">Add latency to every action</span>
        </label>
        <div v-if="formData.latency.active" class="ident horizontal" :class="{ 'disabled': !formData.latency.active }">
          <label>Min/Max (ms)</label>
          <input type="number" min="0" max="500" v-model.number="formData.latency.min">
          <input type="number" min="0" max="500" v-model.number="formData.latency.max">
        </div>

        <label class="u-block">
          <input type="checkbox" v-model="isCalcEP">
          <span class="label-body u-weight-bold">Calculate stat weights (beta)</span>
        </label>

        <button class="button-primary u-full-width" :class="{ 'noevents': isLoading }">
          <span class="progress" :style="{ width: `${message.progress}%` }"/>
          <span class="u-pos-relative">
            {{ submitText }}
          </span>
        </button>

        <Report v-if="result.finishedIn" :data="result" :ep="epValues" simple/>
      </section>
    </div>

    <Modal ref="modal">
      <h4>You know, just like WeakAuras</h4>
      <textarea
        style="width: 100%; min-height: 40vh"
        v-model="importExport"
        :readonly="!isImporting"
        @focus="e => e.target.select()"/>
      <button
        v-if="isImporting"
        class="u-full-width"
        @click.prevent="importMerge">
        Import
      </button>
    </Modal>
  </form>
</template>

<script>
import Modal from '@/components/Modal'
import Report from '@/components/Report'
import Weapon from '@/components/Weapon'
import weaponsData from '@/data/weapons'
import Player from '@/sim/classes/Player'

import mergeWith from 'lodash/mergeWith'

// Deep merge but replacing arrays
const customizer = (objValue, srcValue, key, obj, src) => {
  if (!Array.isArray(objValue)) return
  return obj[key] = src[key]
}

export default {
  name: 'app',
  components: {
    Modal,
    Report,
    Weapon
  },
  data() {
    const defaultMh = weaponsData['1H Axes'].find(w => w.title === 'Deathbringer')
    const defaultOh = weaponsData['1H Axes'].find(w => w.title === 'Frostbite')
    const dwTalent = 'https://classic.wowhead.com/talent-calc/warrior/30305001302-05050005525010051'
    const isProd = process.env.NODE_ENV === 'production'

    return {
      worker: {},
      importExport: '',
      isImporting: false,
      isProd,
      dwTalent,
      result: {},
      message: {},
      epValues: [],
      isLoading: false,
      isCalcEP: false,
      formData: {
        isCustomTalent: false,
        duration: 75,
        iterations: isProd ? 10000 : 500,
        latency: {
          active: true,
          min: 60,
          max: 200
        },
        player: {
          lvl: 60,
          str: 250,
          agi: 125,
          ap: 910,
          hit: 6,
          haste: 0,
          crit: 20.45,
          startRage: 0,
          talents: dwTalent,
          buffs: [
            'ony', 'dm', 'sf', 'wcb', 'mark', 'bloodFury', 'strTotem', 'wf', 'jujuPower',
            'roids', 'jujuMight', 'dumplings', 'mrp', 'mongoose', 'eleStoneOh'
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
              type: defaultMh.proc ? defaultMh.proc.type : null,
              percent: defaultMh.proc ? defaultMh.proc.percent : 0,
              amount: defaultMh.proc ? defaultMh.proc.amount : 0,
              duration: defaultMh.proc ? defaultMh.proc.duratiom : 0
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
              type: defaultOh.proc ? defaultOh.proc.type : null,
              percent: defaultOh.proc ? defaultOh.proc.percent : 0,
              amount: defaultOh.proc ? defaultOh.proc.amount : 0,
              duration: defaultOh.proc ? defaultOh.proc.duration : 0
            }
          },
          hoj: true,
          cloudkeeper: {
            canUse: false,
            last30: true
          },
          diamondFlask: {
            canUse: false,
            last60: true
          },
          bloodFury: {
            waitDeathWish: true,
            waitCrusader: false,
            waitCrusaderOrDeathWish: false
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
            btCooldown: 1
          },
          hamstring: {
            canUse: false,
            rage: 80,
            btWwCooldown: 1,
            pvpGloves: false
          },
          slam: {
            canUse: false,
            rage: 15,
            btCooldown: 1,
            wwCooldown: 1,
            delayMs: 500
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
            waitCrusader: false,
            waitDeathWish: false,
            waitExecute: true
          }
        },
        target: {
          lvl: 63,
          armor: 3731,
          debuffs: ['sunder', 'ff', 'cor']
        },
      }
    }
  },
  computed: {
    formGenerator() {
      return {
        buffs: [
          { title: 'Essence of the Red (Vael)', value: 'red' },
          { title: 'Rallying Cry (Onyxia Head)', value: 'ony' },
          { title: 'Fengus\' Ferocity (DM AP)', value: 'dm' },
          { title: 'Songflower Serenade', value: 'sf' },
          { title: 'Warchief\'s Blessing (WCB/Rend)', value: 'wcb' },
          { title: 'Spirit of Zandalar *', value: 'zand' },
          { title: 'Mark of the Wild', value: 'mark' },
          { title: 'Leader of the Pack', value: 'lotp' },
          { title: 'Trueshot Aura', value: 'trueshot' },
          { title: '[H] Blood Fury (Orc)', value: 'bloodFury' },
          { title: '[H] Strength of Earth Totem', value: 'strTotem' },
          { title: '[H] Windfury', value: 'wf',
            disabled: this.formData.player.buffs.includes('eleStoneMh')
          },
          { title: '[H] Improved Windfury', value: 'improvedWf' },
          { title: '[A] Blessing of Might', value: 'bom' },
          { title: '[A] Blessing of Kings *', value: 'bok' },
        ],
        consumables: [
          { title: 'Juju Power', value: 'jujuPower',
            disabled: this.formData.player.buffs.includes('giants')
          },
          { title: 'Elixir of Giants', value: 'giants',
            disabled: this.formData.player.buffs.includes('jujuPower')
          },
          { title: 'Juju Might', value: 'jujuMight',
            disabled: this.formData.player.buffs.includes('firewater')
          },
          { title: 'Winterfall Firewater', value: 'firewater',
            disabled: this.formData.player.buffs.includes('jujuMight')
          },
          { title: 'R.O.I.D.S.', value: 'roids' },
          { title: 'Smoked Desert Dumplings', value: 'dumplings', disabled: this.formData.player.buffs.includes('sunfruit') },
          { title: 'Blessed Sunfruit', value: 'sunfruit', disabled: this.formData.player.buffs.includes('dumplings') },
          { title: 'Mighty Rage Potion (MRP)', value: 'mrp' },
          { title: 'Elixir of the Mongoose', value: 'mongoose' },
          { title: 'Elem. Sharp. Stone MH', value: 'eleStoneMh',
            disabled: this.formData.player.buffs.includes('wf')
          },
          { title: 'Elem. Sharp. Stone OH', value: 'eleStoneOh',
            disabled: !this.formData.player.offhand.canUse
          },
        ],
        debuffs: [
          { title: 'Sunder Armor', value: 'sunder',
            disabled: this.formData.target.debuffs.includes('impEa') },
          { title: 'Imp. Expose Armor', value: 'impEa',
            disabled: this.formData.target.debuffs.includes('sunder') },
          { title: 'Faerie Fire', value: 'ff' },
          { title: 'Curse of Recklessness', value: 'cor' },
          { title: 'Annihilator', value: 'anni' },
        ]
      }
    },
    playerStats() {
      let str = this.formData.player.str
      const lvl = this.formData.player.lvl
      const initBaseAp = Player.getBaseAp(lvl, str)
      const gearAp = this.formData.player.ap - initBaseAp
      const agi = this.formData.player.agi

      // BoK and Zandalar Str is calculated on sim to account procs
      this.formData.player.buffs.forEach((value) => {
        if (value === 'sf') str += 15
        if (value === 'mark') str += 12
        if (value === 'strTotem') str += 61
        if (value === 'jujuPower') str += 30
        if (value === 'giants') str += 25
        if (value === 'roids') str += 25
        if (value === 'dumplings') str += 20
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

      const baseAp = Player.getBaseAp(lvl, str)
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
        if (value === 'zand') crit += (agi * 1.15 - agi) * 0.05
      })
      crit += this.talents.cruelty
      crit += 3 // Berserker Stance
      crit = Number(crit.toFixed(2))

      let haste = this.formData.player.haste
      haste += this.formData.player.buffs.includes('wcb') ? 15 : 0

      return { str, ap, crit, haste }
    },
    hasMrp() {
      return this.formData.player.buffs.includes('mrp')
    },
    hasBloodFury() {
      return this.formData.player.buffs.includes('bloodFury')
    },
    hasDeathWish() {
      return !!this.talents.deathWish
    },
    hasBloodthirst() {
      return !!this.talents.bloodthirst
    },
    slamCastTime() {
      return 1.5 - this.talents.impSlam * 0.1
    },
    executeDuration() {
      return (this.formData.duration * (this.formData.player.execute.percent / 100))
        .toFixed(1)
    },
    targetArmor() {
      let armor = this.formData.target.armor
      this.formData.target.debuffs.forEach((value) => {
        if (value === 'sunder') armor -= 2250
        if (value === 'impEa') armor -= 2550
        if (value === 'ff') armor -= 505
        if (value === 'cor') armor -= 640
        if (value === 'anni') armor -= 600
      })
      return Math.max(0, armor)
    },
    targetMitigation() {
      const mitig = this.targetArmor / (this.targetArmor + 400 + 85 * this.formData.player.lvl)
      return (mitig * 100).toFixed(1)
    },
    talents() {
      return Player.parseTalents(this.formData.player.talents)
    },
    talentsUrl() {
      const correctUrl = 'classic.wowhead.com/talent-calc/warrior/'
      return this.formData.player.talents.includes(correctUrl)
        ? this.formData.player.talents
        : 'https://' + correctUrl
    },
    submitText() {
      if (this.isLoading && this.message.progress < 100) return `${this.message.progress}%`
      if (this.isLoading) return `0%`
      return 'Simulate!'
    }
  },
  watch: {
    'formData.player.mainhand.type': function (value) {
      if (value === 'TWO_HANDED') this.formData.player.offhand.canUse = false
    },
    'formData.player.offhand.canUse': function (canUse) {
      if (canUse && this.formData.player.mainhand.type === 'TWO_HANDED') {
        this.formData.player.mainhand.type = 'ONE_HANDED'
      }

      if (!canUse) {
        const index = this.formData.player.buffs.indexOf('eleStoneOh')
        index > -1 && this.formData.player.buffs.splice(index, 1)
      }
    },
    'formData.player.talents': function (value) {
      if (value !== 'custom') return

      this.formData.isCustomTalent = true
      this.formData.player.talents = this.dwTalent
    }
  },
  methods: {
    getCfg(mod = {}) {
      const form = this.formData
      if (!form.player.mainhand.canUse) return

      form.player.execute.start = form.duration * (1 - form.player.execute.percent / 100)
      form.player.mainhand.proc.chance = form.player.mainhand.proc.percent / 100
      form.player.offhand.proc.chance = form.player.offhand.proc.percent / 100
      form.player.deathWish.timeLeft = form.player.deathWish.last30 ? Math.max(0, form.duration - 30) : 0
      form.player.cloudkeeper.timeLeft = form.player.cloudkeeper.last30 ? Math.max(0, form.duration - 30) : 0
      form.player.diamondFlask.timeLeft = form.player.diamondFlask.last60 ? Math.max(0, form.duration - 60) : 0
      form.player.slam.delay = (form.player.slam.delayMs + (form.latency.active ? form.latency.max : 0)) / 1000

      return {
        iterations: form.iterations,
        duration: form.duration,
        latency: form.latency,
        player: {
          lvl: form.player.lvl,
          str: this.playerStats.str + (mod.str ? mod.str : 0),
          ap: this.playerStats.ap + (mod.ap ? mod.ap : 0) + (mod.str ? mod.str * 2 : 0),
          crit: this.playerStats.crit + (mod.crit ? mod.crit : 0),
          haste: this.playerStats.haste + (mod.haste ? mod.haste : 0),
          hit: form.player.hit + (mod.hit ? mod.hit : 0),
          startRage: form.player.startRage,
          talents: form.player.talents,
          buffs: {
            red: form.player.buffs.includes('red'),
            wf: form.player.buffs.includes('wf'),
            improvedWf: form.player.buffs.includes('improvedWf'),
            bok: form.player.buffs.includes('bok'),
            zand: form.player.buffs.includes('zand'),
            bloodFury: form.player.buffs.includes('bloodFury'),
            mrp: form.player.buffs.includes('mrp')
          },
          hoj: form.player.hoj,
          mainhand: form.player.mainhand,
          offhand: form.player.offhand,
          cloudkeeper: form.player.cloudkeeper,
          diamondFlask: form.player.diamondFlask,
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
    submit() {
      if (this.isLoading) return

      localStorage.formData = JSON.stringify(this.formData)
      if (this.isCalcEP) {
        this.epWorkerChain()
        return
      }

      this.isLoading = true
      if (this.worker instanceof Worker) this.worker.terminate()
      this.worker = new Worker('@/sim/sim.worker', { type: 'module' })
      this.worker.postMessage(JSON.stringify(this.getCfg()))
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
    },
    epWorkerChain() {
      this.isLoading = true

      let count = 0
      const chain = {
        base:  { cfg: this.getCfg() },
        ap:    { cfg: this.getCfg({ ap: 50 }) },
        crit:  { cfg: this.getCfg({ crit: 1 }) },
        hit:   { cfg: this.getCfg({ hit: 1 }) },
        haste: { cfg: this.getCfg({ haste: 1 }) },
        str:   { cfg: this.getCfg({ str: 8 }) },
      }
      const chainValues = Object.values(chain)

      chainValues.forEach(item => {
        const worker = new Worker('@/sim/sim.worker', { type: 'module' })

        worker.postMessage(JSON.stringify(item.cfg))
        worker.onmessage = ({ data }) => {
          item.progress = data.progress
          const sum = chainValues.reduce((s, w) => w.progress ? s += w.progress : 0, 0)
          this.message = { progress: Math.round(sum / chainValues.length) }
          if (data.finishedIn) {
            count++
            item.result = data
            item.result.report = JSON.parse(data.report)
            item.dps = item.result.dps
            item.finishedIn = data.finishedIn
            if (count === chainValues.length) {
              this.result = chain.base.result
              this.result.timeline = JSON.parse(this.result.timeline)
              this.result.finishedIn = chainValues.reduce((a, b) => Math.max(a, b.finishedIn), 0)
              this.result.epValues = this.calculateEp(chain)
              this.$emit('report', this.result)
              this.isLoading = false
            }
            worker.terminate()
          }
        }
      })
    },
    calculateEp(chain) {
      const base = chain.base
      const ap = chain.ap
      const dpsEp = 50 / (ap.dps - base.dps)

      const result = []
      Object.keys(chain).forEach(key => {
        if (key === 'base' || key === 'ap') return

        const item = chain[key]
        const ep = Math.max(0, (item.dps - base.dps) * dpsEp)
        result.push({
          name: key === 'str' ? `8 ${key}` : `1% ${key}`,
          value: Number(ep.toFixed(1))
        })
      })

      return result
    },
    reset() {
      Object.assign(this.$data, this.$options.data.apply(this))
      this.$children.forEach(child => {
        if (!child.$options.data) return
        Object.assign(child.$data, child.$options.data.apply(child))
      })
      delete localStorage.formData
      this.$emit('report', this.result)
    },
    resetTalent() {
      if (this.formData.player.talents) return

      this.formData.isCustomTalent = false
      this.formData.player.talents = this.dwTalent
    },
    loadData() {
      if (!localStorage.formData) return

      const storageData = JSON.parse(localStorage.formData)
      this.formData = mergeWith(this.formData, storageData, customizer)
    },
    exportStt() {
      this.importExport = btoa(JSON.stringify(this.formData))
      this.isImporting = false
      this.$refs.modal.show()
    },
    importStt() {
      this.importExport = ''
      this.isImporting = true
      this.$refs.modal.show()
    },
    importMerge() {
      if (!this.isImporting) return

      try {
        const data = JSON.parse(atob(this.importExport))
        this.formData = mergeWith(this.formData, data, customizer)
        this.$refs.modal.hide()
      } catch (err) {
        this.importExport = `NotLikeThis`
      }
    }
  },
  mounted() {
    this.loadData()
  }
}
</script>

<style>
  @media (max-width: 768px) { .grid-item { overflow: auto; } }
  @media (min-width: 769px) {
    .span-2 { grid-column: span 2; }
    .span-3 { grid-column: span 3; }
  }

  .horizontal {
    display: flex;
    align-items: center;
    margin-bottom: 0.25rem;
  }
  .horizontal label {
    margin-bottom: 0;
    margin-right: 0.5rem;
    flex-basis: 0;
    flex-grow: 1;
    flex-shrink: 0;
  }
  .horizontal .title { margin: 0; }
  .horizontal input + input { margin-left: 0.25rem; }

  button .progress {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #000;
    opacity: 0.35;
    pointer-events: none;
    width: 0;
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
    margin-left: 1.5rem;
    margin-bottom: 0.5rem;
  }
  .ident code {
    display: inline-flex;
    align-items: center;
    padding-top: 1px;
    padding-bottom: 1px;
    margin: 0 0.5rem;
  }
  input[type="number"].invisible,
  .ident input[type="number"] {
    height: auto;
    padding: 0;
    text-align: center;
    max-width: 2.75rem;
    border-color: transparent;
    background: transparent;
    font-size: 0.9rem;
    color: var(--link-color);
  }
</style>
