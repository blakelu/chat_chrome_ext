<template>
  <div class="chatbox">
    
  </div>
</template>

<script setup lang="ts">

onMounted(() => {
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'newChat') {
      dialogVisible.value = true
    }
  })
})
</script>
<style lang="less" scoped>
.chatbox {}
</style>
