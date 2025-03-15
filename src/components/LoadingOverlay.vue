<template>
  <Transition name="fade">
    <div v-if="show" class="loading-overlay" :class="{ 'with-backdrop': withBackdrop }">
      <div class="loading-content">
        <div class="spinner">
          <div class="dot-flashing"></div>
        </div>
        <div v-if="message" class="loading-message">{{ message }}</div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps({
  show: {
    type: Boolean,
    default: false
  },
  withBackdrop: {
    type: Boolean,
    default: true
  },
  message: {
    type: String,
    default: '加载中...'
  }
});
</script>

<style scoped>
.loading-overlay {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.with-backdrop {
  background-color: rgba(var(--app-bg-color-rgb, 255, 255, 255), 0.6);
  backdrop-filter: blur(4px);
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
}

.spinner {
  display: flex;
  justify-content: center;
}

.loading-message {
  font-size: var(--app-font-size-base);
  color: var(--app-text-color);
  font-weight: 500;
}

/* Dot flashing animation */
.dot-flashing {
  position: relative;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: var(--app-accent-color);
  animation: dot-flashing 1s infinite linear alternate;
  animation-delay: 0.5s;
}

.dot-flashing::before,
.dot-flashing::after {
  content: '';
  display: inline-block;
  position: absolute;
  top: 0;
}

.dot-flashing::before {
  left: -15px;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: var(--app-accent-color);
  animation: dot-flashing 1s infinite alternate;
  animation-delay: 0s;
}

.dot-flashing::after {
  left: 15px;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: var(--app-accent-color);
  animation: dot-flashing 1s infinite alternate;
  animation-delay: 1s;
}

@keyframes dot-flashing {
  0% {
    background-color: var(--app-accent-color);
  }
  50%, 100% {
    background-color: rgba(var(--app-accent-color-rgb, 59, 130, 246), 0.2);
  }
}
</style>
