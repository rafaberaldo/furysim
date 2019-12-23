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

    <div v-if="flurry" class="progress-bar">
      <span
        class="progress"
        :style="{ width: `${flurry.uptime}%` }"/>
      <span class="label">{{ flurry.title }} Uptime ({{ flurry.uptime }}%)</span>
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
    <hr>
    <section class="report-section">
      <h2>Skills / Swings</h2>
      <template v-for="item in skills">
        <h4 :key="`${item.title}-header`">{{ item.title }}</h4>
        <div :key="item.title" class="report-grid">
          <div v-for="{ title, key, suffix } in skillKeys" :key="key">
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
    skills() {
      return this.data.report
        .filter(s => !s.procOrAura)
        .sort((a, b) => b.portion > a.portion)
    },
    procs() {
      return this.data.report
        .filter(s => s.procOrAura)
        .sort((a, b) => b.uptime > a.uptime)
    },
    flurry() {
      const flurry = this.data.report.filter(s => s.title === 'Flurry')
      return flurry && flurry[0]
    },
    heroicStrike() {
      const hs = this.data.report.filter(s => s.title === 'Heroic Strike')
      return hs && hs[0]
    },
    skillKeys() {
      return [
        { key: 'misses', title: 'Misses', suffix: '%' },
        { key: 'dodges', title: 'Dodges', suffix: '%' },
        { key: 'glances', title: 'Glances', suffix: '%' },
        { key: 'crits', title: 'Crits', suffix: '%' },
        { key: 'hits', title: 'Hits', suffix: '%' },
        { key: 'portion', title: 'Dmg Portion', suffix: '%' },
        { key: 'dmgPerHit', title: 'Dmg / Hit', suffix: '' },
        { key: 'countPerFight', title: 'Count / Fight', suffix: '' },
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
      this.data.lastTimeline.forEach(line => timeline += `${line}\r\n`)
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
      if (title === 'Mainhand' && key === 'countPerFight' && this.heroicStrike) {
        return `${item[key].toFixed(1)}${suffix} (+${this.heroicStrike.countPerFight})`
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
    height: 2.5rem;
    overflow: hidden;
    width: 100%;
    position: relative;
    border: var(--border-color);
    background: var(--background-color-softer);
    margin-bottom: 0.5rem;
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
    transition: transform 80ms ease;
    pointer-events: none;
    background: var(--link-color);
  }
  .progress-bar .label {
    position: relative;
    margin-left: 0.5rem;
    font-weight: 600;
  }

  .report-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
    margin-bottom: 3.5rem;
  }
  .report-grid .label {
    display: block;
    font-weight: 800;
  }
  .report-grid .u-family-title {
    font-weight: 300;
    font-size: 2rem;
  }
  .report-section {
    max-width: 580px;
    margin: 0 auto;
  }
</style>
