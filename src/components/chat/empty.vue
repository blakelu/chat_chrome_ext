<template>
  <div class="empty">
    <img src="@/assets/icons/robot.svg" />
    <div class="text-[18px] text-[#333] font-[600] my-[20px]">今天我能为你做什么？</div>
    <div v-for="item in list" :key="item" class="question-item" @click="$emit('confirm', item)">{{ item }}→</div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['confirm'])
const list = ref([
  '生蚝煮熟了叫什么?',
  '我偷功德箱，是加功德还是减功德?',
  '眼镜没发明出来之前眼镜蛇叫什么？',
  '鉴黄师下班看黄色视频，算加班还是违法?',
  '如果我被判了死刑，在行刑过程中，我把执行死刑的人反杀了，算不算正当防卫?'
])
</script>
<style lang="less" scoped>
.empty {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 22px;
  text-align: center;

  img {
    width: 80px;
    height: 80px;
    margin-bottom: 12px;
    animation: float 3s ease-in-out infinite;
  }

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

    &:hover {
      color: #666666;
      box-shadow: var(--shadow-md);
    }
  }
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
}
</style>
