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

// Listen for runtime messages from background/content scripts
const handleRuntimeMessages = (message, sender, sendResponse) => {
  if (message.action === 'showFloatingMenu') {
    showFloatingMenu(message.data)
    sendResponse({ success: true })
  }

  if (message.action === 'openAIChat' && message.data) {
    selectedText.value = message.data.text
    isDialogVisible.value = true
    sendResponse({ success: true })
  }

  return true // Enable async response
}

onMounted(() => {
  // Listen for chrome runtime messages
  if (chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener(handleRuntimeMessages)
  }
})

onUnmounted(() => {
  if (chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.removeListener(handleRuntimeMessages)
  }
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
