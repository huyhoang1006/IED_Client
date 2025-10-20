<template>
  <div class="select-test">
    <h3>Select Test</h3>
    <el-select v-model="selectedTest" placeholder="Select test type">
      <el-option
        v-for="test in testOptions"
        :key="test.value"
        :label="test.label"
        :value="test.value">
      </el-option>
    </el-select>
  </div>
</template>

<script>
export default {
  name: 'SelectTest',
  data() {
    return {
      selectedTest: '',
      testOptions: [
        { value: 'insulation', label: 'Insulation Resistance' },
        { value: 'leakage', label: 'Leakage Current' },
        { value: 'power', label: 'Power Frequency' }
      ]
    }
  }
}
</script>

<style scoped>
.select-test {
  padding: 20px;
}
</style>