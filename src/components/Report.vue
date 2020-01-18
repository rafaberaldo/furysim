<template>
  <div v-if="simple">
    <div class="horizontal">
      <label>DPS</label>
      <span class="title h2">{{ data.dps }}</span>
    </div>
    <div class="horizontal u-block">
      <label>Finished in</label>
      <span class="u-family-title">{{ data.finishedIn }} secs</span>
    </div>

    <div v-for="item in ep" :key="item.name" class="progress-bar">
      <span
        class="progress"
        :style="{ width: `${item.value / 50 * 100 }%` }"/>
      <span class="label">{{ item.name }} = {{ item.value }} AP</span>
    </div>

    <hr v-if="ep" style="margin: 1rem 0">

    <div v-if="flurry" class="progress-bar">
      <span
        class="progress"
        :style="{ width: `${flurry.uptime}%` }"/>
      <span class="label">Flurry Uptime ({{ flurry.uptime }}%)</span>
    </div>
    <div v-for="item in data.report.dmg" :key="item.title" class="progress-bar">
      <span
        class="progress"
        :style="{ width: `${item.portion}%` }"/>
      <span class="label">{{ item.title }} ({{ item.portion }}%)</span>
    </div>

    <ul class="u-align-center" style="margin-top: 1.5rem">
      <li><a role="button" @click="scrollDown('report')">See Details</a></li>
      <li><a role="button" @click="scrollDown('timeline')">See Timeline</a></li>
    </ul>
  </div>

  <div v-else id="report">
    <hr>
    <section v-if="ep" class="report-section">
      <h2>Stat Weights</h2>
      <div class="report-grid">
        <div v-for="item in ep" :key="item.name">
          <span class="label">{{ item.name }}</span>
          <span class="u-family-title">{{ item.value }} AP</span>
          <div class="progress-bar small">
            <span class="progress" :style="{ width: `${item.value / 50 * 100 }%` }"/>
          </div>
        </div>
      </div>
    </section>

    <hr v-if="ep" class="transparent">

    <section class="report-section">
      <h2>Damage</h2>
      <template v-for="item in data.report.dmg">
        <h4 :key="`${item.title}-header`">{{ item.title }}</h4>
        <div :key="item.title" class="report-grid">
          <div
            v-for="({ title, key, suffix }, i) in swingKeys"
            :key="key"
            :class="{ 'span-2': i === 3 }">
            <span class="label">{{ title }}</span>
            <span class="u-family-title">{{ item[key] + suffix }}</span>
            <div v-if="suffix === '%'" class="progress-bar small">
              <span class="progress" :style="{ width: `${item[key]}%` }"/>
            </div>
          </div>
        </div>
      </template>
    </section>

    <hr class="transparent">

    <section class="report-section">
      <h2>Procs / Auras</h2>
      <template v-for="item in data.report.procs">
        <h4 :key="`${item.title}-header`">{{ item.title }}</h4>
        <div :key="item.title" class="report-grid procs">
          <div v-for="{ title, key, suffix } in procKeys" :key="key">
            <span class="label">{{ title }}</span>
            <span class="u-family-title">{{ item[key] + suffix }}</span>

            <div v-if="suffix === '%'" class="progress-bar small">
              <span class="progress" :style="{ width: `${item[key]}%` }"/>
            </div>
          </div>
        </div>
      </template>
    </section>

    <hr class="transparent">

    <section id="timeline" class="report-section">
      <h2>Fight Timeline</h2>
      <label>
        <input type="checkbox" v-model="showPeriodicRage">
        <span class="label-body">Show periodic rage gain</span>
      </label>
      <label class="u-full-width">
        <input
          class="u-full-width"
          type="text"
          placeholder="Filter timeline"
          @input="search">
      </label>
      <button v-if="isDev" @click="$emit('sim')">Run</button>
      <pre><code v-html="timeline"/></pre>
    </section>

    <div class="u-align-center">
      <a role="button" @click="scrollUp()">&uarr; Back to top</a>
    </div>
  </div>
</template>

<script>
import debounce from 'lodash/debounce'

export default {
  props: {
    data: Object,
    simple: Boolean
  },
  data() {
    return {
      searchInput: '',
      isDev: process.env.NODE_ENV === 'development',
      showPeriodicRage: false
    }
  },
  computed: {
    ep() {
      if (!this.data.epValues) return

      return [...this.data.epValues]
        .sort((a, b) => b.value > a.value ? 1 : -1)
    },
    flurry() {
      return this.data.report.procs.find(p => p.title === 'Flurry')
    },
    swingKeys() {
      return [
        { key: 'portion', title: 'Dmg %', suffix: '%' },
        { key: 'dmg', title: 'Dmg', suffix: 'k' },
        { key: 'avgHit', title: 'Avg Hit', suffix: '' },
        { key: 'count', title: 'Count', suffix: '' },
        { key: 'misses', title: 'Misses', suffix: '%' },
        { key: 'dodges', title: 'Dodges', suffix: '%' },
        { key: 'glances', title: 'Glances', suffix: '%' },
        { key: 'crits', title: 'Crits', suffix: '%' },
        { key: 'hits', title: 'Hits', suffix: '%' },
      ]
    },
    procKeys() {
      return [
        { key: 'uptime', title: 'Uptime', suffix: '%' },
        { key: 'count', title: 'Count', suffix: '' },
        { key: 'ppm', title: 'Effective PPM', suffix: '' },
      ]
    },
    timeline() {
      const search = this.searchInput.toLowerCase()
      return this.data.timeline
        .filter(e => this.showPeriodicRage || !e.includes('RAGE_GAIN_P'))
        .filter(e => !this.searchInput || e.toLowerCase().includes(search))
        .reduce((string, line) => string += `${line}\r\n`, '')
    }
  },
  methods: {
    search: debounce(function (e) {
      this.searchInput = e.target.value
    }, 300),
    scrollDown(id) {
      const top = document.getElementById(id).offsetTop
      window.scroll({ top, behavior: 'smooth' })
    },
    scrollUp() {
      window.scroll({ top: 0, behavior: 'smooth' })
    }
  }
}
</script>

<style>
  .progress-bar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    height: 1.5rem;
    overflow: hidden;
    position: relative;
    border: var(--border-color);
    background: var(--background-color-softer);
    margin-bottom: 0.25rem;
  }
  .progress-bar.small {
    height: 2px;
    margin-bottom: 0;
  }
  .progress-bar .progress {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    background: var(--link-color);
  }
  .progress-bar .label {
    position: relative;
    margin-right: 0.25rem;
    font-weight: 600;
  }

  hr.transparent { border-color: transparent; }

  #timeline pre code {
    height: 80vh;
    margin: 0;
  }
  #timeline pre code .time { color: hsl(118, 38%, 52%); }
  #timeline pre code .event { color: var(--link-color); }
  #timeline pre code .value { color: hsl(340, 70%, 55%); }
  #timeline pre code .extra-info { opacity: 0.6; }

  .report-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-gap: 15px;
    margin-bottom: 2.5rem;
  }
  @media (max-width: 768px) { .report-grid { grid-template-columns: repeat(3, 1fr); } }
  .report-grid .label {
    display: block;
    font-weight: 800;
    white-space: nowrap;
  }
  .report-grid .u-family-title {
    font-weight: 300;
    font-size: 1.35rem;
  }
  .report-section {
    max-width: 580px;
    margin: 0 auto;
  }
</style>
