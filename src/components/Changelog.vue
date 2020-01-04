<template>
  <Modal ref="modal">
    <h4>Changelog</h4>
    <strong>v0.3.1</strong>
    <ul>
      <li>Fix attack speed proc calculation</li>
      <li>Add more weapon presets (thanks @Fbi)</li>
    </ul>

    <strong>v0.3.0</strong>
    <ul>
      <li>Add attack speed proc</li>
    </ul>

    <strong>v0.2.2</strong>
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
