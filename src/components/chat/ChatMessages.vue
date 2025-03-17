<template>
  <div 
    class="messages" 
    ref="messagesRef" 
    @scroll="handleScroll"
    :data-smooth-scroll="themeSettings.smoothScrolling"
  >
    <template v-if="messages.length === 0">
      <slot name="empty"></slot>
    </template>
    <template v-else>
      <!-- <TransitionGroup 
        name="message-transition"
        tag="div"
        class="messages-list"
      > -->
        <Message
          v-for="(message, index) in messages"
          :key="message.id"
          :message="message"
          :all-messages="messages"
          :loading="index + 1 === messages.length && loading"
          :data-animate-delay="index"
          @retry="$emit('retry', message)"
        />
      <!-- </TransitionGroup> -->
    </template>
    
    <Transition name="fade">
      <div v-if="loading && processingLongResponse" class="processing-indicator">
        <div class="processing-spinner"></div>
        <span>AI 正在生成较长回复，请耐心等待...</span>
      </div>
    </Transition>
    
    <NetworkStatus />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { throttle } from 'lodash-es';
import Message from './Message.vue';
import NetworkStatus from '@/components/common/NetworkStatus.vue';

const props = defineProps({
  messages: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  themeSettings: {
    type: Object,
    default: () => ({
      smoothScrolling: true
    })
  }
});

const emit = defineEmits(['retry', 'scroll']);

// Refs
const messagesRef = ref<HTMLElement | null>(null);
const scrollVisible = ref(false);
const unreadCount = ref(0);
const isUserActive = ref(true);
const processingLongResponse = ref(false);
const longResponseTimer = ref<number | null>(null);

// Methods
const scrollToBottom = (force = false) => {
  const messagesEl = messagesRef.value;
  if (!messagesEl) return;
  
  if (force) {
    messagesEl.scroll({
      top: messagesEl.scrollHeight,
      behavior: 'smooth'
    });
  } else {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
};

const handleScroll = throttle(() => {
  const messagesEl = messagesRef.value;
  if (!messagesEl) return;
  
  const { scrollTop, scrollHeight, clientHeight } = messagesEl;
  const bottomTolerance = 100;
  
  scrollVisible.value = scrollHeight - scrollTop - clientHeight > bottomTolerance;
  emit('scroll', { scrollTop, scrollHeight, clientHeight, isAtBottom: !scrollVisible.value });
}, 200);

// Track when user is active or idle
const setUserActive = () => {
  isUserActive.value = true;
  clearTimeout(window.userIdleTimer);
  window.userIdleTimer = setTimeout(() => {
    isUserActive.value = false;
  }, 60000); // 1 minute of inactivity
};

onMounted(() => {
  const messagesEl = messagesRef.value;
  if (messagesEl) {
    messagesEl.addEventListener('scroll', handleScroll);
  }
  
  window.addEventListener('mousemove', setUserActive);
  window.addEventListener('keydown', setUserActive);
  window.addEventListener('click', setUserActive);
  
  // Initialize user active status
  setUserActive();
  
  // Set up long response detection
  watch(() => props.loading, (newVal) => {
    if (newVal) {
      if (longResponseTimer.value) clearTimeout(longResponseTimer.value);
      longResponseTimer.value = setTimeout(() => {
        processingLongResponse.value = true;
      }, 5000); // Show indicator after 5 seconds of loading
    } else {
      if (longResponseTimer.value) clearTimeout(longResponseTimer.value);
      processingLongResponse.value = false;
    }
  });
  
  // Watch for new messages when user is not active
  watch(() => props.messages.length, (newLength, oldLength) => {
    if (!isUserActive.value && newLength > oldLength) {
      // Only increment unread count if we're not at the bottom
      const messagesEl = messagesRef.value;
      if (messagesEl) {
        const { scrollTop, scrollHeight, clientHeight } = messagesEl;
        if (scrollHeight - scrollTop - clientHeight > 100) {
          unreadCount.value++;
        }
      }
    }
  });
  
  // Initial scroll to bottom
  nextTick(() => {
    scrollToBottom();
  });
});

onUnmounted(() => {
  const messagesEl = messagesRef.value;
  if (messagesEl) {
    messagesEl.removeEventListener('scroll', handleScroll);
  }
  
  window.removeEventListener('mousemove', setUserActive);
  window.removeEventListener('keydown', setUserActive);
  window.removeEventListener('click', setUserActive);
  
  if (window.userIdleTimer) clearTimeout(window.userIdleTimer);
  if (longResponseTimer.value) clearTimeout(longResponseTimer.value);
});

// Reset unread count when scrolling to bottom
watch(scrollVisible, (newVal) => {
  if (!newVal) {
    unreadCount.value = 0;
  }
});

// Expose methods
defineExpose({
  scrollToBottom
});
</script>

<style lang="less" scoped>
.messages {
  position: relative;
  flex: 1 1 0%;
  overflow-y: auto;
  background-color: var(--app-bg-color);
  scroll-behavior: smooth;

  :deep(img) {
    width: 100%;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  .processing-indicator {
    position: fixed;
    bottom: 220px;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--app-card-bg);
    border-radius: 20px;
    padding: 8px 16px;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: var(--app-shadow-md);
    z-index: 10;
    font-size: 14px;
    color: var(--app-text-secondary);
    
    .processing-spinner {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid var(--app-accent-color);
      border-top-color: transparent;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  }
}

// Message transition animations
.message-transition-enter-active, 
.message-transition-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.message-transition-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.message-transition-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

// Fade scale animation for buttons
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  transform: scale(0.9);
  opacity: 0;
}
</style>
