<template>
  <header>
    <h1 class="u-marginless">FurySim</h1>
    <p class="u-marginless">{{ description }}</p>
  </header>
</template>

<script>
export default {
  computed: {
    description() {
      return process.env.DESCRIPTION
    },
    version() {
      return process.env.VERSION
    }
  }
}
</script>

<style>
  header {
    text-align: center;
    margin: 3rem 0;
  }
</style>
