<template>
  <div class="container">
    <!-- <el-switch v-model="darkSwitch" size="large" active-text="黑暗模式" inactive-text="正常模式" /> -->
  </div>
</template>
<script lang="ts" setup>
import { ref, watchEffect } from 'vue'
const darkSwitch = ref(false)
console.log(localStorage)
// watchEffect(() => {
//   if (darkSwitch.value) {
//     document.body.style.background = '#333'
//   } else {
//     document.body.style.background = '#fff'
//   }
// })
</script>
<style scoped>
.container {
  position: fixed;
  top: 50%;
  left: 0;
  z-index: 999999;
}
.button {
  width: 200px;
  height: 80px;
  background: url(../assets/click-here.png) no-repeat;
  background-size: 100% 100%;
  cursor: pointer;
}
</style>
