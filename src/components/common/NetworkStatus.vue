<template>
  <Transition name="fade">
    <div v-if="!isOnline" class="network-status">
      <el-icon class="status-icon"></el-icon>
      <span>网络连接已断开，部分功能可能无法正常工作</span>
      <el-button 
        size="small" 
        type="primary" 
        @click="retryConnection"
        class="retry-btn"
      >重试</el-button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const isOnline = ref(true);

// Check network status and set up listeners
onMounted(() => {
  isOnline.value = navigator.onLine;
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Set up periodic check for actual internet connectivity
  const intervalCheck = setInterval(checkActualConnectivity, 30000);
  
  onUnmounted(() => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
    clearInterval(intervalCheck);
  });
  
  // Initial check
  checkActualConnectivity();
});

// Handle online event
function handleOnline() {
  isOnline.value = true;
  ElMessage.success('网络连接已恢复');
}

// Handle offline event
function handleOffline() {
  isOnline.value = false;
  ElMessage.error('网络连接已断开');
}

// Check actual connectivity by making a request
async function checkActualConnectivity() {
  try {
    if (!navigator.onLine) {
      isOnline.value = false;
      return;
    }
    
    // Use a tiny request to check connectivity
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('https://www.google.com/favicon.ico', {
      mode: 'no-cors',
      cache: 'no-store',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!isOnline.value) {
      isOnline.value = true;
      ElMessage.success('网络连接已恢复');
    }
  } catch (error) {
    // If we were previously online, show notification
    if (isOnline.value) {
      isOnline.value = false;
      ElMessage.error('网络连接不稳定');
    }
  }
}

// Manual retry connection
function retryConnection() {
  ElMessage.info('正在检查网络连接...');
  checkActualConnectivity();
}
</script>

<style scoped>
.network-status {
  position: fixed;
  bottom: 70px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--app-card-bg);
  padding: 10px 16px;
  border-radius: 24px;
  box-shadow: var(--app-shadow-md);
  z-index: 9000;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--app-border-color);
  max-width: 90%;
  
  .status-icon {
    color: var(--app-warning);
    font-size: 18px;
    flex-shrink: 0;
  }
  
  span {
    font-size: var(--app-font-size-small);
    color: var(--app-text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .retry-btn {
    flex-shrink: 0;
    font-size: 12px;
    padding: 4px 8px;
    height: auto;
  }
}

/* Animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}
</style>
