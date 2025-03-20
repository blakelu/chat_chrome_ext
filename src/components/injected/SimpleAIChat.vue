<template>
  <el-dialog
    v-model="showDialog"
    title="closeAI"
    width="500"
    :modal="false"
    :close-on-click-modal="false"
    draggable
    append-to-body
    @open="handleOpen"
    @close="handleClose"
  >
    <div ref="chatRef" class="simple-ai-chat">
      <!-- <div class="chat-header">
        <h3>AI 助手</h3>
        <div class="header-actions">
          <el-button type="text" class="close-btn" @click="handleClose">
            <el-icon><ep-close /></el-icon>
          </el-button>
        </div>
      </div> -->

      <div class="chat-body" ref="chatBodyRef">
        <!-- Chat Messages Component -->
        <ChatMessages :messages="chatMessages" :loading="loading" :themeSettings="themeSettings" @retry="retryMessage" ref="messagesRef" />
      </div>

      <div class="chat-input">
        <el-input
          v-model="inputMessage"
          :placeholder="inputPlaceholder"
          :disabled="loading || initialLoading"
          class="input-field"
          @keyup.enter="handleSendMessage"
        >
          <template #append>
            <el-button :disabled="loading || initialLoading || !inputMessage" @click="handleSendMessage">
              <el-icon><ep-position /></el-icon>
            </el-button>
          </template>
        </el-input>
      </div>
    </div>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, nextTick, watch } from 'vue'
import { useChat } from '@/composables/useChat.ts'
import ChatMessages from '@/components/chat/ChatMessages.vue'
import { resolve } from 'path'

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    default: false
  },
  askType: {
    type: String,
    default: ''
  },
  selectedText: {
    type: String,
    default: ''
  }
})
const showDialog = useVModel(props, 'isDialogVisible')
const emit = defineEmits(['close', 'update:isDialogVisible'])

// Refs
const chatRef = ref(null)
const chatBodyRef = ref(null)
const messagesRef = ref(null)
const inputPlaceholder = ref('输入后续问题...')

// Theme settings
const themeSettings = reactive({
  theme: 'light',
  smoothScrolling: true
})

// Use the chat composable
const {
  chatMessages,
  inputMessage,
  loading,
  initialLoading,
  selectedText: chatSelectedText,
  API_KEY,
  API_URL,
  commonSettings,
  selectMode,
  initOpenAI,
  clearChat,
  sendMessage,
  processMessage,
  retryMessage
} = useChat()

const init = async () => {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['mode', 'GPT_API_KEY', 'GPT_API_URL', 'COMMON_SETTINGS'], async (data) => {
        // Store API settings
        if (data.GPT_API_KEY) API_KEY.value = data.GPT_API_KEY
        if (data.GPT_API_URL) API_URL.value = data.GPT_API_URL
        if (data.mode) selectMode.value = data.mode

        // Copy system prompt if available
        if (data.COMMON_SETTINGS?.prompt) {
          commonSettings.value.prompt = data.COMMON_SETTINGS.prompt
        }

        console.log('API settings loaded', API_KEY.value, API_URL.value, selectMode.value)
        await initOpenAI()
        resolve(true)
      })
    }
  })
}
const handleOpen = async () => {
  await init()
  if (props.selectedText) {
    chatSelectedText.value = props.selectedText
    initialQuery()
  }
}
// Initial query based on selected text
const initialQuery = async () => {
  if (!chatSelectedText.value || initialLoading.value) return

  initialLoading.value = true
  clearChat()
  const askMap = {
    explain: '解释',
    translate: '翻译',
    polish: '润色'
  }
  // Process the selected text with a standardized prompt
  await processMessage(`帮我${askMap[props.askType]}这段内容`)

  initialLoading.value = false

  // Scroll to bottom after initial load
  nextTick(() => {
    messagesRef.value?.scrollToBottom()
  })
}

// Handle closing the dialog
const handleClose = () => {
  emit('close')
}

// Send message
const handleSendMessage = async () => {
  if (!inputMessage.value.trim() || loading.value) return

  await sendMessage()

  // Scroll to bottom after sending message
  nextTick(() => {
    messagesRef.value?.scrollToBottom()
  })
}

// Watch for changes in chat messages to scroll to bottom
watch(
  chatMessages,
  () => {
    nextTick(() => {
      if (messagesRef.value) {
        messagesRef.value.scrollToBottom()
      }
    })
  },
  { deep: true }
)
</script>

<style lang="less" scoped>
.simple-ai-chat {
  // position: fixed;
  // top: 50%;
  // left: 50%;
  // transform: translateX(-50%) translateY(-60%);
  // z-index: 999998;
  width: 100%;
  height: 560px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #fff;
  border-radius: 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f8fafd;
  border-bottom: 1px solid #e2e8f0;
}

.chat-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
}

.header-actions {
  display: flex;
  align-items: center;
}

.close-btn {
  padding: 6px;
  font-size: 16px;
  color: #64748b;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #f43f5e;
}

.chat-body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.user-message {
  display: flex;
  gap: 10px;
  max-width: 100%;
  margin-bottom: 16px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-content {
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
  max-width: calc(100% - 50px);
  background-color: #f0f7ff;
  color: #334155;
}

.chat-input {
  padding: 12px 16px;
  background-color: #fff;
  border-top: 1px solid #e2e8f0;
}
</style>
