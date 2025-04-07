<template>
  <div class="empty">
    <div class="empty-animation">
      <img src="@/assets/icons/icon.png" />
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
        <el-icon class="question-arrow">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em">
            <path fill="currentColor" d="M13.172 12l-4.586-4.586a1 1 0 0 1 1.414-1.414l5 5a1 1 0 0 1 0 1.414l-5 5a1 1 0 0 1-1.414-1.414L13.172 12z"/>
          </svg>
        </el-icon>
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
  padding: 32px 24px;
  text-align: center;
  background-color: var(--app-bg-color, #f7f8f9);
  color: #1a202c;

  .empty-animation {
    margin-bottom: 28px;
    border-radius: 50%;
    width: 110px;
    height: 110px;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    justify-content: center;
    transition: transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1.0);

    &:hover {
      transform: scale(1.05);
    }

    img {
      width: 60px;
      height: 60px;
      animation: smooth-float 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
      filter: drop-shadow(0 4px 6px rgba(0, 122, 255, 0.2));
    }
  }

  .empty-title {
    font-size: 24px;
    font-weight: 500;
    color: #2d3748;
    margin-bottom: 36px;
    letter-spacing: -0.02em;
  }

  .question-list {
    width: 100%;
    max-width: 520px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .question-item {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    font-size: 15px;
    background-color: rgba(0, 0, 0, 0.02);
    color: #4a5568;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.25s ease;

    &:hover {
      background-color: #f7faff;
      border-color: #cbd5e1;
      transform: translateY(-1px);

      .question-arrow {
        transform: translateX(2px);
        opacity: 1;
        color: #3b82f6;
      }

      .question-text {
        color: #2563eb;
      }
    }

    .question-text {
      flex: 1;
      text-align: left;
      font-weight: 400;
      transition: color 0.25s ease;
    }

    .question-arrow {
      margin-left: 8px;
      font-size: 16px;
      color: #94a3b8;
      opacity: 0.7;
      transition: all 0.25s ease;
    }
  }
}

@keyframes gentle-float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  25% {
    transform: translateY(-4px) rotate(1deg);
  }
  50% {
    transform: translateY(-8px) rotate(-1deg);
  }
  75% {
    transform: translateY(-4px) rotate(0.5deg);
  }
}

@keyframes smooth-float {
   0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>
