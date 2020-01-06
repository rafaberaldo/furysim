<template>
  <Modal ref="modal">
    <h3>Changelog</h3>
    <h5>v0.4.0</h5>
    <ul>
      <li>Fix not accounting Berserker Stance</li>
      <li>Add option to not spam Slam</li>
      <li>Fix Slam cast time when talented</li>
      <li>Internal changes in hope to make sim faster</li>
      <li>Some improvements on UI/UX</li>
    </ul>

    <h5>v0.3.2</h5>
    <ul>
      <li>Add Cloudkeeper Legplates</li>
      <li>Add talents presets</li>
      <li>Add light/dark theme option instead of system preference</li>
      <li>Add filter option to timeline</li>
    </ul>

    <h5>v0.3.1</h5>
    <ul>
      <li>Fix attack speed proc calculation</li>
      <li>Add more weapon presets (thanks @Fbi)</li>
    </ul>

    <h5>v0.3.0</h5>
    <ul>
      <li>Add attack speed proc</li>
    </ul>

    <h5>v0.2.2</h5>
    <ul>
      <li>Add stat weight calculation</li>
    </ul>
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
