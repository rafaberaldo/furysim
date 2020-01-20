<template>
  <Modal ref="modal">
    <h3>About</h3>
    <h5>Are you tracking me or using cookies?</h5>
    <p>
      Although this site doesn't use cookies, your last sim configuration is saved
      into your local storage for convenience. Other than that it's pretty much
      a static page with no database or tracking.
    </p>

    <h5>Is it open source?</h5>
    <p>
      <a href="https://github.com/rafaelpimpa/furysim"
        target="_blank"
        rel="noopener">Yes</a> — GPL-3.0.
    </p>

    <h5>Where did you get the formulas? How spell X works?</h5>
    <p>
      <a href="https://github.com/rafaelpimpa/furysim/blob/master/MECHANICS.md"
        target="_blank"
        rel="noopener">Read about the mechanics</a>
      if you're interested. Sources are there too.
    </p>

    <h5>Found a bug. Where do I report?</h5>
    <p>
      <a href="https://github.com/rafaelpimpa/furysim/issues"
        target="_blank"
        rel="noopener">Here</a>. But post a valid source or insta-closed.
    </p>

    <h5>What's the tech stack?</h5>
    <ul>
      <li>
        <a href="https://www.typescriptlang.org/"
          target="_blank"
          rel="noopener">Typescript</a>
      </li>
      <li>
        <a href="https://cli.vuejs.org/"
          target="_blank"
          rel="noopener">Vue.js / CLI</a>
      </li>
      <li>
        <a href="https://acahir.github.io/Barebones/"
          target="_blank"
          rel="noopener">Barebones</a>
      </li>
    </ul>

    <h5>Why did you make this?</h5>
    <p>
      Always wanted to learn how to simulate something. Also wanted to know if Flurry
      Axe is worth buying. Spoiler: <span class="spoiler">Not much.</span>
    </p>
  </Modal>
</template>

<script>
import Modal from '@/components/Modal'

export default {
  components: {
    Modal
  }
}
</script>
