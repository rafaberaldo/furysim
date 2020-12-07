<template>
  <Modal ref="modal">
    <h3>Changelog</h3>
    <h5>v0.6.1</h5>
    <ul>
      <li>Add Spirit of Zandalar buff</li>
      <li>Add Smoked Desert Dumplings</li>
    </ul>

    <h5>v0.6.0</h5>
    <ul>
      <li>Fix Execute phase failing sim on Slam rotation</li>
      <li>Fix Slam interaction with latency</li>
      <li>Fix Blood Fury not snapshotting AP</li>
      <li>Add more rotation options to MRP and BF</li>
      <li>Add Diamond Flask</li>
      <li>Add PvP Gloves</li>
      <li>Add Essence of the Red</li>
      <li>Add Imp. Expose Armor</li>
      <li>Add rage info</li>
      <li>Changes on code for better scaling</li>
      <li>UI stuff:</li>
      <ul>
        <li>Detailed report on desktop is now a table</li>
        <li>Add settings import/export functionality</li>
        <li>Fix the need to clear cache for some users (hopefully)</li>
      </ul>
    </ul>

    <h5>v0.5.0</h5>
    <ul>
      <li>Add standard Slam rotation!</li>
      <li>Add strength procs</li>
      <li>Heroic Strike priority over swing — means that it can open a fight with HS if has rage</li>
      <li>More weapon presets</li>
      <li>Performance improvements</li>
      <li>UI stuff:</li>
      <ul>
        <li>Fix custom talent on Chrome</li>
        <li>Fix total time of stat weight calc</li>
        <li>Stat weight set to 50k iterations</li>
        <li>Add option to show periodic rage gain</li>
      </ul>
    </ul>

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
