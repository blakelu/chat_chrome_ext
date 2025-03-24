<template>
  <ChatMessages
    :messages="chatMessages"
    :loading="loading"
    :themeSettings="themeSettings"
    @retry="retryMessage"
    @scroll="handleMessagesScroll"
    ref="messagesRef"
  >
    <template #empty>
      <empty @confirm="emptyConfirm" />
    </template>
  </ChatMessages>

  <div class="operate_wrap">
    <MessageActions
      v-model:model="selectMode"
      :settings="commonSettings"
      :picCount="picList.length"
      :hasMessages="chatMessages.length > 0"
      @upload-image="uploadPic"
      @clear-chat="clearChat"
      @show-history="$emit('showHistory')"
      @new-chat="$emit('addNewSession')"
      @show-settings="openOptionsPage"
      @show-prompt-dialog="promptVisible = true"
      @show-export-dialog="openExportDialog"
      @theme-change="handleThemeChange"
    />

    <ChatInput
      v-model="inputMessage"
      :picList="picList"
      :selectedText="selectedText"
      @update:selectedText="(val) => (selectedText = val)"
      @delete-pic="handleDeletePic"
      @send="handleInputEnter"
      @auto-complete="handleTabCompletion"
      @load-previous="loadPreviousMessage"
      @escape="handleEscape"
      @composition-start="composing = true"
      @composition-end="composing = false"
      ref="inputRef"
    />
  </div>

  <RolePrompt v-model:show="promptVisible" />

  <ExportDialog :messages="chatMessages" v-model:visible="exportDialogVisible" @copy="handleExportCopy" @download="handleExportDownload" />
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useStorage } from '@vueuse/core'
import { ElMessage } from 'element-plus'

// Import composable
import { useChat } from '@/composables/useChat.ts'

// Import components with better organization
import ChatMessages from './ChatMessages.vue'
import MessageActions from './MessageActions.vue'
import ChatInput from './ChatInput.vue'
import ExportDialog from './ExportDialog.vue'
import empty from './empty.vue'
import RolePrompt from '../settings/RolePrompt.vue'

// Props and emits
const props = defineProps({
  context: {
    type: Array as any,
    default: () => []
  },
  ttsvoice: {
    type: String,
    default: 'zh-CN-XiaoxiaoNeural'
  }
})

const emit = defineEmits(['showHistory', 'addNewSession', 'saveHistory', 'clear'])

// Initialize chat composable
const {
  chatMessages,
  chatContext,
  inputMessage,
  loading,
  selectedText,
  picList,
  API_KEY,
  API_URL,
  commonSettings,
  selectMode,
  initOpenAI,
  initChat,
  clearChat,
  processMessage,
  retryMessage
} = useChat()

// Local state that's not in the composable
const promptVisible = ref(false)
const exportDialogVisible = ref(false)
const composing = ref(false)
const inputHistory = ref<string[]>([])
const currentHistoryIndex = ref(-1)

// UI settings storage
const themeSettings = useStorage(
  'UI_SETTINGS',
  {
    theme: 'light',
    fontSize: 'medium',
    smoothScrolling: true,
    animations: true,
    highContrast: false,
    reducedMotion: false
  },
  localStorage,
  { mergeDefaults: true }
)

// Refs
const inputRef = ref()
const messagesRef = ref()

// Lifecycle hooks
onMounted(async () => {
  if (!API_KEY.value) {
    openOptionsPage()
  }
  initChat(props.context)
  initOpenAI()

  // 监听选中文本事件
  setupSelectedTextListener()

  // Optimize initial scroll position
  nextTick(() => {
    messagesRef.value?.scrollToBottom()
  })
})

// 设置选中文本监听器
const setupSelectedTextListener = () => {
  // 如果在 Chrome 扩展环境中运行
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    // 注册消息监听器
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'textSelected') {
        selectedText.value = message.text
        inputRef.value.focus()
        // 响应消息确认收到
        sendResponse({ status: 'success' })
      }
      // 返回true以支持异步响应
      return true
    })

    // 向后台脚本发送消息，通知它侧边栏已打开
    try {
      chrome.runtime
        .sendMessage('sidePanelOpened')
        .then(() => console.log('Side panel opened message sent'))
        .catch((err) => console.error('Error sending side panel opened message:', err))
    } catch (error) {
      console.error('Error sending initial message:', error)
    }
  } else {
    // 如果不在扩展环境中，使用普通的事件监听
    window.addEventListener('message', (event) => {
      if (event.data.action === 'textSelected' && event.data.text) {
        const maxLength = 1000
        selectedText.value = event.data.text.length > maxLength ? event.data.text.substring(0, maxLength) + '...' : event.data.text
        inputRef.value.focus()
      }
    })
  }
}

// Watchers
watch(
  chatContext,
  (val) => {
    emit('saveHistory', val)
  },
  { deep: true }
)

watch(
  () => props.context,
  (val) => {
    initChat(val)
  }
)
watch(selectMode, (newVal) => {
  chrome.storage.local.set({ mode: newVal })
})

// Methods
const handleConfirm = (data: any) => {
  API_URL.value = data.API_URL
  API_KEY.value = data.API_KEY
  chrome.storage.local.set({ GPT_API_KEY: data.API_KEY, GPT_API_URL: data.API_URL })
  initOpenAI()
}

// Open the extension's options page
const openOptionsPage = () => {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage()
  } else {
    // Fallback for development environment or when Chrome API is not available
    ElMessage.info('请在扩展管理页面打开选项设置')
  }
}

const uploadPic = () => {
  const inputFile = document.getElementById('inputFile')
  if (inputFile) {
    document.body.removeChild(inputFile)
  }
  const input: any = document.createElement('input')
  input.id = 'inputFile'
  input.type = 'file'
  input.accept = 'image/*'
  input.style.display = 'none'
  document.body.appendChild(input)
  input.click()
  input.onchange = (event: any) => {
    const file = input.files[0]
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      picList.value.push(reader.result as string)
      inputRef.value.focus()
      document.body.removeChild(input)
    }
  }
}

const handleDeletePic = (index: number) => {
  picList.value.splice(index, 1)
}

const handleClearChat = () => {
  clearChat()
  emit('clear')
}

// Handle tab completion
const handleTabCompletion = async () => {
  if (!inputMessage.value.trim()) return

  try {
    ElMessage.info('生成自动补全...')

    // Initialize OpenAI if needed
    const openai = initOpenAI()

    // Get completion from API
    const completion = await openai.completions.create({
      model: 'gpt-3.5-turbo-instruct',
      prompt: inputMessage.value.trim() + '\n\nComplete this thought:',
      max_tokens: 50,
      temperature: 0.7,
      stop: ['\n', '。', '.', '?', '？', '!', '！']
    })

    // Add completion to prompt
    if (completion.choices && completion.choices[0].text) {
      inputMessage.value += completion.choices[0].text
    }
  } catch (error) {
    ElMessage.error('自动补全失败')
    console.error('Tab completion error:', error)
  }
}

// Load previous message from history
const loadPreviousMessage = () => {
  if (chatMessages.value.length === 0) return

  // If first press, store current input and initialize
  if (currentHistoryIndex.value === -1) {
    if (inputMessage.value.trim()) {
      inputHistory.value = [inputMessage.value]
    } else {
      inputHistory.value = []
    }

    // Get user messages from chatMessages
    const userMessages = chatMessages.value
      .filter((m) => m.role === 'user')
      .map((m) => (Array.isArray(m.content) ? m.content.find((c) => c.type === 'text')?.text || '' : m.content))

    inputHistory.value = [...inputHistory.value, ...userMessages.reverse()]
    currentHistoryIndex.value = 0
  } else {
    currentHistoryIndex.value = (currentHistoryIndex.value + 1) % inputHistory.value.length
  }

  if (inputHistory.value.length > 0) {
    inputMessage.value = inputHistory.value[currentHistoryIndex.value]
  }
}

// Handle Escape key to reset history navigation
const handleEscape = () => {
  currentHistoryIndex.value = -1
  inputRef.value.focus()
}

// Theme change handler
const handleThemeChange = (theme) => {
  themeSettings.value.theme = theme
}

// Handle messages scroll events
const handleMessagesScroll = (scrollData) => {
  // Handle any scroll related logic if needed
}

async function handleInputEnter() {
  if (!inputMessage.value || composing.value) return

  const result = await processMessage(inputMessage.value, [...picList.value], props.ttsvoice)

  // Add to input history
  if (result) {
    if (inputHistory.value.indexOf(inputMessage.value) === -1) {
      inputHistory.value.unshift(inputMessage.value)
      if (inputHistory.value.length > 50) {
        inputHistory.value.pop()
      }
    }

    currentHistoryIndex.value = -1
  }

  messagesRef.value?.scrollToBottom()
}

const emptyConfirm = (data: string) => {
  inputMessage.value = data
  handleInputEnter()
}

// Export functionality
const openExportDialog = () => {
  if (chatMessages.value.length === 0) {
    ElMessage.warning('没有对话可导出')
    return
  }
  exportDialogVisible.value = true
}

const handleExportCopy = (result) => {
  if (result.success) {
    ElMessage.success('已复制到剪贴板')
  } else {
    ElMessage.error('复制失败，请手动选择文本复制')
    console.error('复制失败:', result.error)
  }
}

const handleExportDownload = (result) => {
  ElMessage.success(`已导出对话为 ${result.format.toUpperCase()} 格式`)
}

// Expose methods to parent component
defineExpose({
  clearChat: handleClearChat,
  initChat
})
</script>

<style lang="less" scoped>
.operate_wrap {
  width: 100%;
  padding: 8px;
  background-color: #fff;
}
</style>
