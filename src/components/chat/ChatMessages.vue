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
    
    <NetworkStatus />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { throttle } from 'lodash-es';
import Message from './Message.vue';
import NetworkStatus from '@/components/ui/NetworkStatus.vue';

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
  
  emit('scroll', { scrollTop, scrollHeight, clientHeight });
}, 200);

onMounted(() => {
  const messagesEl = messagesRef.value;
  if (messagesEl) {
    messagesEl.addEventListener('scroll', handleScroll);
  }
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
