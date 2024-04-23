<template>
  <div class="mt-[140px] mx-[50px] flex flex-col items-center">
    <img src="@/assets/icons/robot.svg" class="w-[60px] h-[60px]" />
    <div class="text-[18px] text-[#333] font-[600] my-[20px]">今天我能为你做什么？</div>
    <div v-for="item in list" :key="item" class="question-item" @click="$emit('confirm', item)">{{ item }}→</div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['confirm'])
const list = ref([
  '跳多高才能跳过广告?',
  '秃头的人洗头使用洗发露还是洗面奶?',
  '众所周知哪吒有三头六臂，如果他患了脑血栓，三个头都会脑血栓吗?',
  '如果我被判了死刑，在行刑过程中，我把执行死刑的人反杀了，算不算正当防卫?'
])
</script>
<style lang="less" scoped>
.question-item {
  width: 100%;
  text-align: left;
  padding: 12px;
  font-size: 14px;
  background-color: rgba(0, 0, 0, 0.03);
  color: #424242;
  border-radius: 12px;
  margin-bottom: 12px;
  cursor: pointer;
}
</style>
