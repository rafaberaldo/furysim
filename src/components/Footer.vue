<template>
  <footer>
    <hr>
    <p>
      FurySim v{{ version }} by
      <a
        href="https://twitter.com/rafaelpimpa"
        target="_blank"
        rel="noopener">
        @rafaelpimpa
      </a> /
      Source code licensed under
      <a
        href="https://opensource.org/licenses/GPL-3.0"
        target="_blank"
        rel="noopener">
        GPL-3.0
      </a> /
      <a
        href="https://github.com/rafaelpimpa/furysim/blob/master/README.md"
        target="_blank"
        rel="noopener">
        About
      </a>
    </p>
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
</style>
