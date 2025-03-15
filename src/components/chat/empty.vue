<template>
  <div class="empty">
    <div class="empty-animation">
      <img src="@/assets/icons/robot.svg" />
    </div>
    <div class="empty-title">今天我能为你做什么？</div>
    <div class="question-list">
      <div 
        v-for="item in list" 
        :key="item" 
        class="question-item" 
        @click="$emit('confirm', item)"
      >
        <span class="question-text">{{ item }}</span>
        <el-icon class="question-arrow"></el-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits(['confirm']);
const list = ref([
  '生蚝煮熟了叫什么?',
  '我偷功德箱，是加功德还是减功德?',
  '眼镜没发明出来之前眼镜蛇叫什么？',
  '鉴黄师下班看黄色视频，算加班还是违法?',
  '如果我被判了死刑，在行刑过程中，我把执行死刑的人反杀了，算不算正当防卫?'
]);
</script>
<style lang="less" scoped>
.empty {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
  background-color: var(--app-bg-color);

  .empty-animation {
    margin-bottom: 16px;
    background: linear-gradient(135deg, #e0f2fe, #dbeafe);
    border-radius: 50%;
    width: 120px;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 12px 20px -10px rgba(96, 165, 250, 0.2);
    
    img {
      width: 70px;
      height: 70px;
      animation: float 3s ease-in-out infinite;
    }
  }

  .empty-title {
    font-size: 20px;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 24px;
  }

  .question-list {
    width: 100%;
    max-width: 500px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .question-item {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    font-size: 14px;
    background-color: #fff;
    color: #334155;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid #f1f5f9;

    &:hover {
      background-color: #f0f9ff;
      border-color: #bae6fd;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(56, 189, 248, 0.15);
      
      .question-arrow {
        transform: translateX(3px);
        opacity: 1;
      }
    }

    .question-text {
      flex: 1;
      text-align: left;
      font-weight: 500;
    }

    .question-arrow {
      font-size: 16px;
      color: #38bdf8;
      opacity: 0.7;
      transition: transform 0.3s ease, opacity 0.3s ease;
    }
  }
}

@keyframes float {
  0% {
    transform: translateY(0px) rotate(0deg);
  }
  25% {
    transform: translateY(-5px) rotate(2deg);
  }
  50% {
    transform: translateY(-10px) rotate(-1deg);
  }
  75% {
    transform: translateY(-5px) rotate(1deg);
  }
  100% {
    transform: translateY(0px) rotate(0deg);
  }
}
</style>
