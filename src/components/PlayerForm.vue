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

    <div
      v-for="slot in gear"
      :key="slot.key"
      class="horizontal select-edit"
      :class="{ 'ident': slot.ident }">
      <label>{{ slot.title }}</label>
      <select v-model="formData.player[slot.key]">
        <option :value="undefined">None</option>
        <template v-for="(item, key) in apiData[slot.slotData]">
          <optgroup
            v-if="!Array.isArray(apiData[slot.slotData])"
            :key="key"
            :label="key">
            <option v-for="subitem in item" :key="subitem.ID" :value="subitem.ID">
              {{ subitem.Name }}
            </option>
          </optgroup>
          <option v-else :key="item.ID" :value="item.ID">
            {{ item.Name }}
          </option>
        </template>
      </select>

      <select
        v-if="slot.enchant"
        v-model="formData.player[slot.enchant.key]">
        <option :value="undefined">None</option>
        <template v-for="item in apiData[slot.enchant.slotData]">
          <option :key="item.ID" :value="item.ID">
            {{ item.Name }}
          </option>
        </template>
      </select>
    </div>

    <a href='https://classic.wowhead.com/item=15052' :rel="allGearIdsRel">BDS</a>
  </div>
</template>

<script lang="ts">

import axios from 'axios'
import Vue from 'vue'

interface Set {
  [setId: string]: number
}

export default Vue.extend({
  props: {
    formData: Object,
    defaultTalent: String
  },
  data() {
    return {
      apiData: {} as any,
      gear: [
        { title: 'Head', key: 'head', slotData: 'Heads',
          enchant: { key: 'headEnch', slotData: 'HeadsEnch' }
        },
        { title: 'Neck', key: 'neck', slotData: 'Necks' },
        { title: 'Shoulder', key: 'shoulder', slotData: 'Shoulders',
          enchant: { key: 'shoulderEnch', slotData: 'ShouldersEnch'},
        },
        { title: 'Back', key: 'back', slotData: 'Backs',
          enchant: { key: 'backEnch', slotData: 'BacksEnch'},
        },
        { title: 'Chest', key: 'chest', slotData: 'Chests',
          enchant: { key: 'chestEnch', slotData: 'ChestsEnch'},
        },
        { title: 'Wrist', key: 'wrist', slotData: 'Wrists',
          enchant: { key: 'wristEnch', slotData: 'WristsEnch'},
        },
        { title: 'Hand', key: 'hand', slotData: 'Hands',
          enchant: { key: 'handEnch', slotData: 'HandsEnch'},
        },
        { title: 'Waist', key: 'waist', slotData: 'Waists' },
        { title: 'Legs', key: 'legs', slotData: 'Legs',
          enchant: { key: 'legsEnch', slotData: 'LegsEnch'},
        },
        { title: 'Feet', key: 'feet', slotData: 'Feet',
          enchant: { key: 'feetEnch', slotData: 'FeetEnch'},
        },
        { title: 'Finger', key: 'finger1', slotData: 'Rings' },
        { title: 'Finger', key: 'finger2', slotData: 'Rings' },
        { title: 'Trinket', key: 'trinket1', slotData: 'Trinkets' },
        { title: 'Trinket', key: 'trinket2', slotData: 'Trinkets' },
        { title: 'Ranged Weapon', key: 'ranged', slotData: 'RangedWeapons' },
        { title: 'Mainhand', key: 'mainhand', slotData: 'Mainhand',
          enchant: { key: 'mainhandEnch', slotData: 'WeaponsEnch'},
        },
        { title: 'Offhand', key: 'offhand', slotData: 'Offhand',
          enchant: { key: 'offhandEnch', slotData: 'WeaponsEnch'},
        },
      ]
    }
  },
  computed: {
    talentsUrl() {
      const correctUrl = 'classic.wowhead.com/talent-calc/warrior/'
      return this.formData.player.talents.includes(correctUrl)
        ? this.formData.player.talents
        : `https://${correctUrl}`
    },
    allGearIdsRel() {
      const ids: Array<number> = []
      this.gear.forEach(e => ids.push(this.formData.player[e.key]))
      return `pcs=${ids.join(':')}`
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
    updateApiData() {
      this.apiData.Offhand = {
        '1HAxe': this.apiData.Weapons.filter((e: any) => e.Type === '1HAxe'),
        '1HSword': this.apiData.Weapons.filter((e: any) => e.Type === '1HSword'),
        '1HMace': this.apiData.Weapons.filter((e: any) => e.Type === '1HMace'),
        'Dagger': this.apiData.Weapons.filter((e: any) => e.Type === 'Dagger'),
        'Fist': this.apiData.Weapons.filter((e: any) => e.Type === 'Fist'),
      }
      this.apiData.Mainhand = Object.assign({}, this.apiData.Offhand)
      this.apiData.Mainhand = Object.assign(this.apiData.Mainhand, {
        '2HAxe': this.apiData.Weapons.filter((e: any) => e.Type === '2HAxe'),
        '2HSword': this.apiData.Weapons.filter((e: any) => e.Type === '2HSword'),
        '2HMace': this.apiData.Weapons.filter((e: any) => e.Type === '2HMace'),
        'Polearm': this.apiData.Weapons.filter((e: any) => e.Type === 'Polearm'),
      })
      this.apiData.HeadsEnch = this.apiData.Enchants.filter((e: any) => e.Slot === 'Head')
      this.apiData.LegsEnch = this.apiData.Enchants.filter((e: any) => e.Slot === 'Legs')
      this.apiData.HandsEnch = this.apiData.Enchants.filter((e: any) => e.Slot === 'Hands')
      this.apiData.ShouldersEnch = this.apiData.Enchants.filter((e: any) => e.Slot === 'Shoulders')
      this.apiData.BacksEnch = this.apiData.Enchants.filter((e: any) => e.Slot === 'Back')
      this.apiData.WristsEnch = this.apiData.Enchants.filter((e: any) => e.Slot === 'Wrist')
      this.apiData.FeetEnch = this.apiData.Enchants.filter((e: any) => e.Slot === 'Feet')
      this.apiData.ChestsEnch = this.apiData.Enchants.filter((e: any) => e.Slot === 'Chest')
      this.apiData.WeaponsEnch = this.apiData.Enchants.filter((e: any) => e.Slot === 'Weapon')
    },
    calculateStats() {
      const mainhand = this.apiData.Weapons.find((e: any) => e.ID === this.formData.player.mainhand)
      const offhand = this.apiData.Weapons.find((e: any) => e.ID === this.formData.player.offhand)
      const race = this.apiData.Races.find((e: any) => e.Name === this.formData.player.race)

      // Stats of a level 60
      const stats = {
        ap: 160,
        str: 97 + race.Str,
        agi: 60 + race.Agi,
        sta: 88 + race.Sta,
        crit: 0,
        hit: 0,
        dodge: 0,
        parry: 5,
        defense: 300,
        armor: 0,
        hp: 1509,
        mhSkill: race.Type.split(',').includes(mainhand.Type) ? race.Skill : 0,
        ohSkill: race.Type.split(',').includes(offhand.Type) ? race.Skill : 0
      }
      const sets = {} as Set

      this.gear.forEach(slot => {
        const itemId = this.formData.player[slot.key]
        if (!itemId) return

        const slotData = ['Mainhand', 'Offhand'].includes(slot.slotData) ? 'Weapons' : slot.slotData
        const item = this.apiData[slotData].find((e: any) => e.ID === itemId)
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
        stats.hp += item.HP || 0

        if (item.Set) sets[item.SetID] = sets[item.SetID] + 1 || 1

        if (!item.Skill) return
        if (item.Type.split(',').includes(mainhand.Type)) stats.mhSkill += item.Skill
        if (item.Type.split(',').includes(offhand.Type)) stats.ohSkill += item.Skill
      })

      Object.keys(sets).forEach(setId => {
        const total = sets[setId]
        const set = this.apiData.SetBonuses.find((e: any) => {
          return e.ID === Number(setId) && e.Pieces === total
        })
        stats.ap += set.AP || 0
        stats.str += set.Str || 0
        stats.agi += set.Agi || 0
        stats.sta += set.Sta || 0
        stats.crit += set.Crit || 0
        stats.hit += set.Hit || 0
        stats.dodge += set.Dodge || 0
        stats.parry += set.Parry || 0
        stats.defense += set.Defense || 0
        stats.armor += set.AC || 0

        if (!set.Skill) return
        if (set.Type.split(',').includes(mainhand.Type)) stats.mhSkill += set.Skill
        if (set.Type.split(',').includes(offhand.Type)) stats.ohSkill += set.Skill
      })

      stats.ap += stats.str * 2
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
      this.updateApiData()
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
