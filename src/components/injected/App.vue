<template>
  <div class="crx-app-container">
    <FloatingMenu v-if="showMenu && selectedText" :position="selectionPosition" @close="closeMenu" @askAI="handleAskAI" />

    <SimpleAIChat v-model:isDialogVisible="isDialogVisible" :selectedText="selectedText" :askType="askType" @close="closeChat" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import FloatingMenu from './FloatingMenu.vue'
import SimpleAIChat from './SimpleAIChat.vue'

enum AskType {
  Explain = 'explain',
  Translate = 'translate',
  Polish = 'polish'
}

const showMenu = ref(false)
const isDialogVisible = ref(false)
const askType = ref<AskType>()
const selectedText = ref('')
const selectionPosition = ref({ top: 0, left: 0, bottom: 0, right: 0 })

// Handle showing floating menu
const showFloatingMenu = (data) => {
  if (!data) {
    closeMenu()
    return
  }
  console.log('showFloatingMenu:', data)
  selectedText.value = data.text
  selectionPosition.value = data.position
  showMenu.value = true
}

// Open chat with AI
const handleAskAI = (type: string) => {
  closeMenu()
  askType.value = type as AskType
  isDialogVisible.value = true
}

// Close floating menu
const closeMenu = () => {
  showMenu.value = false
}

// Close AI chat
const closeChat = () => {
  isDialogVisible.value = false
}

// Send message back to the extension via content script bridge
const sendMessageToExtension = (data) => {
  window.postMessage({
    source: 'closeai-injected-app',
    payload: {
      responseToBackground: true,
      data
    }
  }, '*');
}

// Listen for custom events from our message bridge
const handleBridgedMessages = (event) => {
  const { message, sender } = event.detail;
  console.log('App received bridged message:', message);
  
  if (message.action === 'showFloatingMenu') {
    showFloatingMenu(message.data)
    // Send response back through the bridge
    sendMessageToExtension({ action: 'showFloatingMenuResponse', success: true });
  }

  if (message.action === 'openAIChat' && message.data) {
    selectedText.value = message.data.text
    isDialogVisible.value = true
    sendMessageToExtension({ action: 'openAIChatResponse', success: true });
  }
}

onMounted(() => {
  // Listen for bridged messages using custom events
  document.addEventListener('closeai-runtime-message', handleBridgedMessages);
})

onUnmounted(() => {
  document.removeEventListener('closeai-runtime-message', handleBridgedMessages);
})
</script>

<style scoped>
.crx-app-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  z-index: 9999999;
  pointer-events: none;
  line-height: 1.5;
}

.crx-app-container * {
  pointer-events: auto;
}
</style>
