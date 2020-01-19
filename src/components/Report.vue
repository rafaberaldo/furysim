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
      <span class="label">{{ item.name }} = {{ item.value }} EAP</span>
    </div>

    <hr v-if="ep" style="margin: 1rem 0">

    <div v-if="flurry" class="progress-bar">
      <span
        class="progress"
        :style="{ width: `${flurry.uptime}%` }"/>
      <span class="label">Flurry Uptime ({{ flurry.uptime }}%)</span>
    </div>
    <div v-for="item in data.report.dmg" :key="item.name" class="progress-bar">
      <span
        class="progress"
        :style="{ width: `${item.portion}%` }"/>
      <span class="label">{{ item.name }} ({{ item.portion }}%)</span>
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
          <span class="u-family-title">{{ item.value }} EAP</span>
          <div class="progress-bar small">
            <span class="progress" :style="{ width: `${item.value / 50 * 100 }%` }"/>
          </div>
        </div>
      </div>
    </section>

    <section class="report-section">
      <h2>Damage</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th align="center">Dmg</th>
            <th align="right">Count</th>
            <th align="right">Avg Hit</th>
            <th align="right">Miss</th>
            <th align="right">Dodge</th>
            <th align="right">Glance</th>
            <th align="right">Crit</th>
            <th align="right">Hit</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in data.report.dmg" :key="item.name">
            <th class="span-3">{{ item.name }}</th>
            <td class="span-3" align="right" data-label="Dmg">
              <div style="margin-bottom: 2px">
                {{ tableText(item.dmg, true, 'k') }}
                ({{ tableText(item.portion, true, '%') }})
              </div>
              <div class="progress-bar small">
                <span class="progress" :style="{ width: `${item.portion}%` }"/>
              </div>
            </td>
            <td align="right" data-label="Count">
              {{ tableText(item.count, true) }}
            </td>
            <td align="right" data-label="Avg Hit">
              {{ tableText(item.avgHit, false) }}
            </td>
            <td align="right" data-label="Miss">
              {{ tableText(item.misses, true, '%') }}
            </td>
            <td align="right" data-label="Dodge">
              {{ tableText(item.dodges, true, '%') }}
            </td>
            <td align="right" data-label="Glance">
              {{ tableText(item.glances, true, '%') }}
            </td>
            <td align="right" data-label="Crit">
              {{ tableText(item.crits, true, '%') }}
            </td>
            <td align="right" data-label="Hit">
              {{ tableText(item.hits, true, '%') }}
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="report-section">
      <h2>Procs / Auras</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th align="center">Uptime</th>
            <th align="right">Count</th>
            <th align="right">EPPM</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in data.report.procs" :key="item.name">
            <th class="span-3">{{ item.name }}</th>
            <td class="span-3" align="right" data-label="Uptime">
              <div style="margin-bottom: 2px">
                {{ tableText(item.uptime, true, '%') }}
              </div>
              <div class="progress-bar small">
                <span class="progress" :style="{ width: `${item.uptime}%` }"/>
              </div>
            </td>
            <td align="right" data-label="Count">
              {{ tableText(item.count, true) }}
            </td>
            <td align="right" data-label="Effective PPM">
              {{ tableText(item.ppm, true) }}
            </td>
          </tr>
        </tbody>
      </table>
    </section>

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
      return this.data.report.procs.find(p => p.name === 'Flurry')
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
    },
    tableText(value, decimal, suffix = '') {
      if (!value) return '—'
      if (decimal) return value.toFixed(1) + suffix
      return value + suffix
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
    max-width: 720px;
    margin: 3rem auto;
  }

  @media (max-width: 768px) {
    thead { display: none }
    tbody tr {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-column-gap: 15px;
      margin-bottom: 1.5rem;
      white-space: nowrap;
      font-size: 1.35rem;
      font-weight: 300;
      font-family: var(--font-family-title);
    }
    tbody td,
    tbody th {
      border-color: transparent;
      text-align: left;
      padding-left: 0;
      padding-right: 0;
    }
    tbody td:before,
    tbody th:before {
      content: attr(data-label);
      font-weight: 600;
      display: block;
      font-family: var(--font-family);
      font-size: 1rem;
    }
    tbody th {
      font-weight: 300;
      font-size: 1.5rem;
    }
    tbody td.span-3 { grid-column: span 3; }
  }
</style>
