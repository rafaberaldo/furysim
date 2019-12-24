<template>
  <div id="app">
    <Header/>
    <Form @report="r => result = r"/>
    <Report v-if="result.finishedIn" :data="result"/>
    <Modal ref="modal">
      <h4>About</h4>
      <strong>Are you tracking me or using cookies?</strong>
      <p>
        Although this site doesn't use cookies, your last sim configuration is saved
        into your local storage for convenience. Other than that it's pretty much
        a static page with no database or tracking.
      </p>

      <strong>Is it open source?</strong>
      <p>
        <a href="https://github.com/rafaelpimpa/furysim"
          target="_blank"
          rel="noopener">Yes</a> — GPL-3.0.
      </p>

      <strong>Does it have a light/dark theme?</strong>
      <p>Yes, it should change based on your system preference.</p>

      <strong>Where did you get the formulas? How spell X works?</strong>
      <p>
        <a href="https://github.com/rafaelpimpa/furysim/blob/master/MECHANICS.md"
          target="_blank"
          rel="noopener">Read about the mechanics</a>
        if you're interested. Sources are there too.
      </p>

      <strong>Found a bug. Where do I report?</strong>
      <p>
        <a href="https://github.com/rafaelpimpa/furysim/issues"
          target="_blank"
          rel="noopener">Here</a>. But post a valid source or insta-closed.
      </p>

      <strong>What's the tech used?</strong>
      <p>
        The simulator itself runs in pure Javascript (Web Worker).
        Interface is the default stack from
        <a href="https://cli.vuejs.org/"
          target="_blank"
          rel="noopener">Vue CLI</a>.
        CSS lib is
        <a href="https://acahir.github.io/Barebones/"
          target="_blank"
          rel="noopener">Barebones</a> with a bit of changes.
      </p>

      <strong>Why did you make this?</strong>
      <p>
        Always wanted to learn how to simulate something. Also wanted to know if Flurry
        Axe is worth buying. Spoiler: <span class="spoiler">Not much.</span>
      </p>
    </Modal>
    <Footer @about="$refs.modal.show()"/>
  </div>
</template>

<script>
import Footer from '@/components/Footer'
import Form from '@/components/Form'
import Header from '@/components/Header'
import Modal from '@/components/Modal'
import Report from '@/components/Report'

export default {
  name: 'app',
  components: {
    Footer,
    Form,
    Header,
    Modal,
    Report
  },
  data() {
    return {
      result: {}
    }
  }
}
</script>

<style>
  @import './assets/minireset.css';
  @import './assets/barebones.css';
  @import url('https://fonts.googleapis.com/css?family=Oswald:300,400|PT+Sans+Narrow:400,700&display=swap');

  #app {
    padding: 10px;
    max-width: 980px;
    margin: 0 auto;
  }
  .spoiler {
    color: var(--code-background);
    background: currentColor;
  }
  .spoiler::selection {
    color: var(--text-color-normal);
  }
</style>
