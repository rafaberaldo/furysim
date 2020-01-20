<template>
  <div class="u-block">
    <label v-if="!mainhand" class="u-block">
      <input type="checkbox" v-model="value.canUse">
      <h4 class="u-marginless" style="margin-left: 0.5rem; cursor: pointer;">Offhand</h4>
    </label>
    <h4 v-else>Mainhand</h4>

    <div :class="{'disabled': !value.canUse }">
      <label class="u-full-width">
        <select v-model="preset" class="u-full-width" :disabled="!value.canUse">
          <option disabled :value="null">Presets</option>
          <optgroup v-for="(options, name) in presets" :key="name" :label="name">
            <option v-for="item in options" :key="item.title" :value="item">
              {{ item.title }}
            </option>
          </optgroup>
        </select>
      </label>
      <div class="horizontal">
        <label>Min/Max</label>
        <input
          v-model.number="value.min"
          :required="mainhand || !mainhand && value.canUse"
          type="number"
          min="1"
          max="600"
          :disabled="!value.canUse">
        <input
          v-model.number="value.max"
          :required="mainhand || !mainhand && value.canUse"
          type="number"
          min="1"
          max="600"
          :disabled="!value.canUse">
      </div>
      <div class="horizontal">
        <label>Speed</label>
        <input
          v-model.number="value.speed"
          :required="mainhand || !mainhand && value.canUse"
          type="number"
          min="1"
          max="600"
          step="0.1"
          :disabled="!value.canUse">
      </div>
      <div class="horizontal">
        <label>Skill</label>
        <input
          v-model.number="value.skill"
          :required="mainhand || !mainhand && value.canUse"
          type="number"
          min="1"
          max="600"
          :disabled="!value.canUse">
      </div>
      <div class="horizontal">
        <label>Proc</label>
        <select v-model="value.proc.type" :disabled="!value.canUse">
          <option :value="null">None</option>
          <option value="atkSpeed">Atk. Speed</option>
          <option value="extraAttack">Extra Attack</option>
          <option value="str">Strength</option>
        </select>
      </div>
      <div v-if="value.proc.type" class="ident">
        <div class="horizontal">
          <label>Chance (%)</label>
          <input
            v-model.number="value.proc.percent"
            type="number"
            min="0.01"
            max="20"
            step="0.01"
            required
            :disabled="!value.canUse">
        </div>
        <div class="horizontal">
          <label>Amount</label>
          <input
            v-model.number="value.proc.amount"
            type="number"
            min="1"
            max="500"
            required
            :disabled="!value.canUse">
        </div>
        <div v-if="value.proc.type !== 'extraAttack'" class="horizontal">
          <label>Duration</label>
          <input
            v-model.number="value.proc.duration"
            type="number"
            min="1"
            max="300"
            required
            :disabled="!value.canUse">
        </div>
      </div>
      <div class="horizontal">
        <label :disabled="!value.canUse">
          <input
            v-model="value.type"
            :required="mainhand || !mainhand && value.canUse"
            :name="mainhand ? 'mhType' : 'ohType'"
            type="radio"
            value="ONE_HANDED"
            :disabled="!value.canUse">
          <span class="label-body">1H</span>
        </label>
        <label v-if="mainhand" :disabled="!value.canUse">
          <input
            v-model="value.type"
            :required="mainhand || !mainhand && value.canUse"
            :name="mainhand ? 'mhType' : 'ohType'"
            type="radio"
            value="TWO_HANDED"
            :disabled="!value.canUse">
          <span class="label-body">2H</span>
        </label>
        <label :disabled="!value.canUse">
          <input
            v-model="value.type"
            :required="mainhand || !mainhand && value.canUse"
            :name="mainhand ? 'mhType' : 'ohType'"
            type="radio"
            value="DAGGER"
            :disabled="!value.canUse">
          <span class="label-body">Dagger</span>
        </label>
      </div>
      <label :disabled="!value.canUse">
        <input type="checkbox" v-model="value.enchant" :disabled="!value.canUse">
        <span class="label-body">Crusader</span>
      </label>
    </div>
  </div>
</template>

<script>
import weaponsData from '@/data/weapons'
import { ppmToChance } from '@/sim/helpers'

export default {
  name: 'Weapon',
  props: {
    value: Object,
    mainhand: Boolean
  },
  data() {
    return {
      preset: null
    }
  },
  computed: {
    presets() {
      const presets = weaponsData
      const presetsOh = Object.assign({}, presets)
      delete presetsOh['2H']

      return this.mainhand
        ? presets
        : presetsOh
    }
  },
  watch: {
    preset(value) {
      if (!value) return

      this.value.min = value.min
      this.value.max = value.max
      this.value.speed = value.speed
      this.value.type = value.type
      this.value.proc = {
         type: value.proc ? value.proc.type : null,
         percent: value.proc && value.proc.percent ||
          value.proc && this.getPercent(value.proc.ppm, value.speed),
         amount: value.proc ? value.proc.amount : 0,
         duration: value.proc ? value.proc.duration : 0
      }
    }
  },
  methods: {
    getPercent: (ppm, speed) => Number((ppmToChance(ppm, speed) * 100).toFixed(2))
  }
}
</script>
