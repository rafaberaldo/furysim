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
      <li>v{{ version }}</li>
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
    <p><small>Classic WoW is a trademark of Blizzard Entertainment.</small></p>
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
    font-size: 1.8rem;
  }
  footer ul {
    list-style: none;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
  }
  footer ul li {
    margin-bottom: 0;
  }
</style>
