<template>
  <header>
    <h1 class="u-marginless">FurySim</h1>
    <p class="u-marginless">{{ description }}</p>
  </header>
</template>

<script>
export default {
  data() {
    return {
      description: process.env.DESCRIPTION,
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
