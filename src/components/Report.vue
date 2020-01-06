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

    <div v-if="data.report.Flurry" class="progress-bar">
      <span
        class="progress"
        :style="{ width: `${data.report.Flurry.uptime}%` }"/>
      <span class="label">Flurry Uptime ({{ data.report.Flurry.uptime }}%)</span>
    </div>
    <div v-for="item in skills" :key="item.title" class="progress-bar">
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
      <h2>Skills / Swings</h2>
      <template v-for="item in skills">
        <h4 :key="`${item.title}-header`">{{ item.title }}</h4>
        <div :key="item.title" class="report-grid">
          <div
            v-for="({ title, key, suffix }, i) in skillKeys"
            :key="key"
            :class="{ 'span-3': i === 2 }">
            <span class="label">{{ title }}</span>
            <span class="u-family-title">{{ getReportText(item.title, key, item, suffix) }}</span>
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
      <template v-for="item in procs">
        <h4 :key="`${item.title}-header`">{{ item.title }}</h4>
        <div :key="item.title" class="report-grid procs">
          <div v-for="{ title, key, suffix } in procsKeys" :key="key">
            <span class="label">{{ title }}</span>
            <span class="u-family-title">{{ item[key].toFixed(1) + suffix }}</span>

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
      <label class="u-full-width">
        <input
          class="u-full-width"
          type="text"
          placeholder="Filter timeline"
          @input="search">
      </label>
      <pre><code v-html="timeline"/></pre>
    </section>

    <div class="u-align-center">
      <a class="u-pull-right" role="button" @click="scrollUp()">&uarr; Back to top</a>
    </div>
  </div>
</template>

<script>
import debounce from 'lodash.debounce'

export default {
  props: {
    data: Object,
    simple: Boolean
  },
  data() {
    return {
      searchInput: ''
    }
  },
  computed: {
    ep() {
      if (!this.data.epValues) return

      return [...this.data.epValues]
        .sort((a, b) => b.value > a.value ? 1 : -1)
    },
    skills() {
      return Object.values(this.data.report)
        .filter(s => !s.procOrAura)
        .sort((a, b) => b.portion > a.portion ? 1 : -1)
    },
    procs() {
      return Object.values(this.data.report)
        .filter(s => s.procOrAura)
        .sort((a, b) => b.uptime > a.uptime ? 1 : -1)
    },
    skillKeys() {
      return [
        { key: 'portion', title: 'Dmg Portion', suffix: '%' },
        { key: 'dmgPerHit', title: 'Dmg / Hit', suffix: '' },
        { key: 'countPerFight', title: 'Count / Fight', suffix: '' },
        { key: 'misses', title: 'Misses', suffix: '%' },
        { key: 'dodges', title: 'Dodges', suffix: '%' },
        { key: 'glances', title: 'Glances', suffix: '%' },
        { key: 'crits', title: 'Crits', suffix: '%' },
        { key: 'hits', title: 'Hits', suffix: '%' },
      ]
    },
    procsKeys() {
      return [
        { key: 'uptime', title: 'Uptime', suffix: '%' },
        { key: 'countPerFight', title: 'Count / Fight', suffix: '' },
        { key: 'ppm', title: 'Effective PPM', suffix: '' },
      ]
    },
    timeline() {
      return this.data.timeline
        .filter(e => !this.searchInput || e.toLowerCase().includes(this.searchInput.toLowerCase()))
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
    },
    getReportText(title, key, item, suffix) {
      if (key === 'dmgPerHit') return item[key]
      const hs = this.data.report.heroicStrike
      if (title === 'Mainhand' && key === 'countPerFight' && hs) {
        return `${item[key].toFixed(1)}${suffix} (+${hs.countPerFight})`
      }

      return `${item[key].toFixed(1)}${suffix}`
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
