<template>
  <div class="player">
    <div class="horizontal select-edit">
      <label>Race</label>
      <select v-model="player.Races">
        <option v-for="item in apiData.Races" :key="item.Name" :value="item">
          {{ item.Name }}
        </option>
      </select>
    </div>
    {{ apiData }}

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
      player: {} as any,
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
  methods: {
    resetTalent() {
      if (this.formData.player.talents) return

      this.formData.isCustomTalent = false
      this.formData.player.talents = this.defaultTalent
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
      data.sheets.forEach(async (tab: any) => {
        const title = tab.properties.title
        const {data} = await axios.get(this.getApiUrl(title))
        this.apiData[title] = this.arrayToObj(data.values)
        this.$forceUpdate()
      })
      // eslint-disable-next-line no-console
      console.log(this.apiData)
    }
  },
  mounted() {
    // eslint-disable-next-line no-console
    console.time('Test')
    this.getApiData()
    // eslint-disable-next-line no-console
    console.timeEnd('Test')
  }
})
</script>
