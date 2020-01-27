<template>
  <div class="player">
    <div class="horizontal select-edit">
      <label>Race</label>
      <select v-model="formData.player.race">
        <option v-for="item in apiData.Races" :key="item.Name" :value="item.Name">
          {{ item.Name }}
        </option>
      </select>
    </div>

    <div class="horizontal">
      <label>Level</label>
      <input type="number" required min="1" max="60" v-model.number="formData.player.lvl">
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
        <option :value="defaultTalent">
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

    <div v-for="slot in gear" :key="slot.title" class="horizontal select-edit">
      <label>{{ slot.title }}</label>
      <select v-model="formData.player[slot.key]">
        <option
          v-for="item in apiData[slot.apiKey]"
          :key="item.ID"
          :value="item.ID">
          {{ item.Name }}
        </option>
      </select>
    </div>
  </div>
</template>

<script lang="ts">

import axios from 'axios'
import Vue from 'vue'

export default Vue.extend({
  props: {
    formData: Object,
    defaultTalent: String
  },
  data() {
    return {
      apiData: {} as any,
      gear: [
        { title: 'Head', key: 'head', apiKey: 'Heads' },
        { title: 'Neck', key: 'neck', apiKey: 'Necks' },
        { title: 'Shoulder', key: 'shoulder', apiKey: 'Shoulders' },
        { title: 'Back', key: 'back', apiKey: 'Backs' },
        { title: 'Chest', key: 'chest', apiKey: 'Chests' },
        { title: 'Wrist', key: 'wrist', apiKey: 'Wrists' },
        { title: 'Hand', key: 'hand', apiKey: 'Hands' },
        { title: 'Waist', key: 'waist', apiKey: 'Waists' },
        { title: 'Legs', key: 'legs', apiKey: 'Legs' },
        { title: 'Feet', key: 'feet', apiKey: 'Feet' },
        { title: 'Finger 1', key: 'finger1', apiKey: 'Rings' },
        { title: 'Finger 2', key: 'finger2', apiKey: 'Rings' },
        { title: 'Trinket 1', key: 'trinket1', apiKey: 'Trinkets' },
        { title: 'Trinket 2', key: 'trinket2', apiKey: 'Trinkets' },
        { title: 'Ranged Weapon', key: 'ranged', apiKey: 'RangedWeapons' },
        { title: 'Mainhand', key: 'mainhand', apiKey: 'Weapons' },
        { title: 'Offhand', key: 'offhand', apiKey: 'Weapons' },
      ]
    }
  },
  computed: {
    talentsUrl() {
      const correctUrl = 'classic.wowhead.com/talent-calc/warrior/'
      return this.formData.player.talents.includes(correctUrl)
        ? this.formData.player.talents
        : `https://${correctUrl}`
    }
  },
  watch: {
    'formData.player': function () {
      // this.calculateStats()
    }
  },
  methods: {
    resetTalent() {
      if (this.formData.player.talents) return

      this.formData.isCustomTalent = false
      this.formData.player.talents = this.defaultTalent
    },
    calculateStats() {
      const mainhand = this.apiData.Weapons.find((e: any) => e.ID === this.formData.player.mainhand)
      const offhand = this.apiData.Weapons.find((e: any) => e.ID === this.formData.player.offhand)
      const race = this.apiData.Races.find((e: any) => e.Name === this.formData.player.race)

      const stats = {
        ap: race.AP,
        str: race.Str,
        agi: race.Agi,
        sta: race.Sta,
        crit: 0,
        hit: 0,
        dodge: 0,
        parry: 5,
        defense: this.formData.player.lvl * 5,
        armor: 0,
        hp: 1509,
        mhSkill: race.Type.split(',').includes(mainhand.Type) ? race.Skill : 0,
        ohSkill: race.Type.split(',').includes(offhand.Type) ? race.Skill : 0
      }
      const sets = {} as any

      this.gear.forEach(slot => {
        const itemId = this.formData.player[slot.key]
        const item = this.apiData[slot.apiKey].find((e: any) => e.ID === itemId)
        stats.ap += item.AP || 0
        stats.str += item.Str || 0
        stats.agi += item.Agi || 0
        stats.sta += item.Sta || 0
        stats.crit += item.Crit || 0
        stats.hit += item.Hit || 0
        stats.dodge += item.Dodge || 0
        stats.parry += item.Parry || 0
        stats.defense += item.Defense || 0
        stats.armor += item.AC || 0

        if (item.Set) sets[item.Set] = sets[item.Set] + 1 || 1

        if (!item.Skill) return
        if (item.Type.split(',').includes(mainhand.Type)) stats.mhSkill += item.Skill
        if (item.Type.split(',').includes(offhand.Type)) stats.ohSkill += item.Skill
      })
      stats.ap += stats.str * 2
      // TODO stats.block += stats.str * 0.05
      stats.dodge += stats.agi * 0.05
      stats.crit += stats.agi * 0.05
      stats.armor += stats.agi * 2
      stats.hp += stats.sta * 10
      stats.hp *= this.formData.player.race === 'Tauren' ? 1.05 : 1
      this.$emit('stats', stats)
      // eslint-disable-next-line no-console
      console.log(stats, sets)
    },
    getApiUrl(tab: string) {
      const sheetId = '1Y7GPrPoO3F_hvN60_s8RT61e_n9I1aTG3k1ZkiMuecU'
      const key = 'AIzaSyBJyox71jjGI0u6jjQg9kpeUOY_rQm9tek'
      const fields = 'sheets.properties.title'
      const majorDimension = 'ROWS'
      const valueRenderOption = 'UNFORMATTED_VALUE'
      const queryParams = new URLSearchParams(tab === 'Tabs'
        ? { key, fields }
        : { key, majorDimension, valueRenderOption }
      ).toString()

      return tab === 'Tabs'
        ? `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/?${queryParams}`
        : `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${tab}?${queryParams}`
    },
    // https://gist.github.com/patarapolw/8af83d09ccf3e33227e717af2e49ec22
    arrayToObj(array: Array<any>) {
      const header = array.splice(0, 1)[0]
      const output = [] as Array<any>
      array.forEach(el => {
        const entry = {} as any
        header.forEach((h: any, i: any) => {
          entry[h] = el[i] ? el[i] : undefined
        })
        output.push(entry)
      })
      return output
    },
    async getApiData() {
      const {data} = await axios.get(this.getApiUrl('Tabs'))
      await Promise.all(data.sheets.map(async (tab: any) => {
        const title = tab.properties.title
        const {data} = await axios.get(this.getApiUrl(title))
        this.apiData[title] = this.arrayToObj(data.values)
      }))
      this.$forceUpdate()
      this.calculateStats()
      // eslint-disable-next-line no-console
      console.log(this.apiData)
    }
  },
  mounted() {
    this.getApiData()
  }
})
</script>
