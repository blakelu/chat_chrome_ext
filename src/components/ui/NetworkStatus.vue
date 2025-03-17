<template>
  <Transition name="slide-up">
    <div v-if="!isOnline" class="network-status offline">
      <el-icon><ep-warning /></el-icon>
      <span>网络连接已断开，请检查您的网络设置</span>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const isOnline = ref(true);

const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine;
};

onMounted(() => {
  isOnline.value = navigator.onLine;
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
});

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus);
  window.removeEventListener('offline', updateOnlineStatus);
});
</script>

<style scoped>
.network-status {
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--app-card-bg);
  padding: 10px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: var(--app-shadow-md);
  z-index: 100;
}

.network-status.offline {
  background-color: var(--app-danger-bg, #fee2e2);
  border: 1px solid var(--app-danger, #ef4444);
  color: var(--app-danger, #ef4444);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translate(-50%, 100%);
  opacity: 0;
}
</style>
