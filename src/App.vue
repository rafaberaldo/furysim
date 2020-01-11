<template>
  <div id="app">
    <Header/>
    <Form ref="form" @report="r => result = r"/>
    <Report v-if="result.finishedIn" :data="result" @sim="$refs.form.submit"/>
    <About ref="about"/>
    <Changelog ref="changelog"/>
    <Footer
      :dark-theme="isDarkTheme"
      @about="$refs.about.$refs.modal.show()"
      @changelog="$refs.changelog.$refs.modal.show()"
      @toggleTheme="toggleTheme()"
    />
  </div>
</template>

<script>
import About from '@/components/About'
import Changelog from '@/components/Changelog'
import Footer from '@/components/Footer'
import Form from '@/components/Form'
import Header from '@/components/Header'
import Report from '@/components/Report'

export default {
  name: 'app',
  components: {
    About,
    Changelog,
    Footer,
    Form,
    Header,
    Report
  },
  data() {
    return {
      result: {},
      isDarkTheme: true
    }
  },
  methods: {
    toggleTheme() {
      this.isDarkTheme = !this.isDarkTheme
      localStorage.isDarkTheme = JSON.stringify(this.isDarkTheme)
      document.documentElement.classList.toggle('light-theme', !this.isDarkTheme)
    }
  },
  mounted() {
    if (localStorage.isDarkTheme) {
      this.isDarkTheme = JSON.parse(localStorage.isDarkTheme)
      document.documentElement.classList.toggle('light-theme', !this.isDarkTheme)
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
