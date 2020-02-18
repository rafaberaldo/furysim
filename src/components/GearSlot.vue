<template>
  <div class="gear-slot" :class="{ 'rtl': !edit && right, 'right': right && edit }">
    <a v-if="!edit" :href="href" :rel="rel" @click.prevent="edit = true">None</a>
    <select v-else v-model="cValue" @change="slotSelected">
      <option :value="undefined">None</option>
      <template v-for="(item, key) in data">
        <optgroup
          v-if="!Array.isArray(data)"
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
  </div>
</template>

<script>
import Vue from 'vue'

export default {
  props: {
    rel: String,
    value: Number,
    name: String,
    data: [Object, Array],
    gearSlot: Object,
    right: Boolean
  },
  data() {
    return {
      edit: false,
      dValue: this.value
    }
  },
  computed: {
    cValue: {
      get() {
        return this.dValue
      },
      set(value) {
        this.dValue = value
        this.$emit('input', value)
        this.$nextTick(() => $WowheadPower.refreshLinks())
      }
    },
    href() {
      return `https://classic.wowhead.com/item=${this.cValue}`
    }
  },
  watch: {
    value(value) {
      this.dValue = value
      this.$nextTick(() => $WowheadPower.refreshLinks())
    }
  },
  methods: {
    slotSelected() {
      if (this.cValue) this.edit = false
    }
  }
}
</script>

<style>
  .gear-slot.right {
    justify-content: flex-end;
  }
  .gear-slot.rtl {
    direction: rtl;
  }
  .gear-slot {
    display: flex;
    align-items: center;
    height: 50px;
  }
</style>