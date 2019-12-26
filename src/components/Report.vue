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
      <span class="label">{{ item.name }}: {{ item.value }}</span>
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

    <div class="u-align-center" style="margin-top: 1.5rem">
      <a role="button" @click="scrollDown('report')">See Details</a>
    </div>
    <div class="u-align-center">
      <a role="button" @click="scrollDown('timeline')">See Timeline</a>
    </div>
  </div>

  <div v-else id="report">
    <section v-if="ep" class="report-section">
      <h2>EP values</h2>
      <div class="report-grid">
        <div v-for="item in ep" :key="item.name">
          <span class="label">{{ item.name }}</span>
          <span class="u-family-title">{{ item.value }}</span>
          <div class="progress-bar small">
            <span class="progress" :style="{ width: `${item.value / 50 * 100 }%` }"/>
          </div>
        </div>
      </div>
    </section>

    <hr>

    <section class="report-section">
      <h2>Skills / Swings</h2>
      <template v-for="item in skills">
        <h4 :key="`${item.title}-header`">{{ item.title }}</h4>
        <div :key="item.title" class="report-grid">
          <div
            v-for="({ title, key, suffix }, i) in skillKeys"
            :key="key"
            :style="{ gridColumn: i === 2 ? 'span 3' : null }">
            <span class="label">{{ title }}</span>
            <span class="u-family-title">{{ getReportText(item.title, key, item, suffix) }}</span>
            <div v-if="suffix === '%'" class="progress-bar small">
              <span class="progress" :style="{ width: `${item[key]}%` }"/>
            </div>
          </div>
        </div>
      </template>
    </section>

    <hr>

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

    <hr>

    <section id="timeline" class="report-section">
      <h2>Timeline of one fight</h2>
      <pre><code>{{ timeline }}</code></pre>
    </section>

    <a role="button" @click="scrollUp()">Back to top</a>
  </div>
</template>

<script>
export default {
  props: {
    data: Object,
    simple: Boolean
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
      let timeline = ''
      this.data.timeline.forEach(line => timeline += `${line}\r\n`)
      return timeline
    }
  },
  methods: {
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
    margin-top: 4px;
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

  .report-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-gap: 10px;
    margin-bottom: 2.5rem;
  }
  .report-grid .label {
    display: block;
    font-weight: 800;
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
