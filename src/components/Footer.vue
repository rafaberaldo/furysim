<template>
  <footer>
    <hr>
    <ul>
      <li>&copy; {{ new Date().getFullYear() }}</li>
      <li>
        FurySim by
        <a
          href="https://twitter.com/rafaelpimpa"
          target="_blank"
          rel="noopener">
          @rafaelpimpa
        </a>
      </li>
      <li><a role="button" @click="$emit('changelog')">v{{ version }}</a> (Phase 2.5)</li>
      <li>
        <a
          href="https://github.com/rafaelpimpa/furysim/"
          target="_blank"
          rel="noopener">
          Github
        </a>
      </li>
      <li><a role="button" @click="$emit('about')">About</a></li>
    </ul>
    <p class="small">Classic WoW is a trademark of Blizzard Entertainment.</p>
  </footer>
</template>

<script>
export default {
  computed: {
    version() {
      return process.env.VERSION
    }
  }
}
</script>

<style>
  footer {
    text-align: center;
    margin-bottom: 3rem;
  }
  footer ul {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    grid-gap: 10px;
  }
  footer .small {
    font-size: 0.75rem;
    color: var(--text-color-softer);
    margin: 1.5rem 0;
  }
</style>
