<template>
  <div class="container">
    <!-- <img src="./assets/icons/temp.png" alt="logo" @click="handleClick" />
    <el-button @click="openTab">打开百度页面</el-button> -->
    <!-- <Chat /> -->
    <Gemini />
  </div>
</template>
<script setup lang="ts">
// import Chat from '@/components/chat/index.vue'
import Gemini from '@/components/gemini/index.vue'
const handleClick = () => {
  console.log(123123)
  alert(1312)
}
const openTab = () => {
  // console.log(JSON.stringify(chrome.tabs.create))
  // chrome.tabs.create({ url: 'https://baidu.com' })
}
</script>

<style lang="less">
.container {
  background: none;
}
</style>
