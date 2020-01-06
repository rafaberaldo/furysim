<template>
  <footer>
    <hr>
    <ul>
      <li>
        &copy; {{ new Date().getFullYear() }}
        FurySim by
        <a
          href="https://twitter.com/rafaelpimpa"
          target="_blank"
          rel="noopener">
          @rafaelpimpa
        </a>
      </li>
      <li><a role="button" @click="$emit('changelog')">v{{ version }}</a></li>
      <li>
        <a
          href="https://github.com/rafaelpimpa/furysim/"
          target="_blank"
          rel="noopener">
          Github
        </a>
      </li>
      <li>
        <a role="button" @click="$emit('toggleTheme')">
          {{ darkTheme ? 'Light' : 'Dark' }} Theme
        </a>
      </li>
      <li><a role="button" @click="$emit('about')">About</a></li>
    </ul>
    <p class="small">Classic WoW is a trademark of Blizzard Entertainment.</p>
  </footer>
</template>

<script>
export default {
  props: {
    darkTheme: Boolean
  },
  data() {
    return {
      version: process.env.VERSION
    }
  }
}
</script>

<style>
  footer {
    margin-bottom: 3rem;
  }
  footer ul {
    display: flex;
    flex-wrap: wrap;
  }
  footer ul li {
    text-align: center;
    margin-bottom: 0.5rem;
    padding: 0 0.5rem;
  }
  footer ul li:not(:last-child) {
    margin-right: 0.5rem;
  }
  footer ul li:first-child {
    text-align: left;
    flex-grow: 1;
  }
  @media (max-width: 768px) { footer ul li:first-child { width: 100% } }
  footer .small {
    font-size: 0.75rem;
    color: var(--text-color-softer);
    margin: 1.5rem 0;
  }
</style>
