<template>
  <ChatMessages :messages="chatMessages" :loading="loading" @retry="retryMessage" ref="messagesRef">
    <template #empty>
      <empty @confirm="emptyConfirm" />
    </template>
  </ChatMessages>

  <div class="operate_wrap">
    <MessageActions
      :model="selectMode"
      :settings="commonSettings"
      :picCount="picList.length"
      :hasMessages="chatMessages.length > 0"
      @upload-image="uploadPic"
      @clear-chat="clearChat"
      @show-history="$emit('showHistory')"
      @new-chat="$emit('addNewSession')"
      @show-settings="openOptionsPage"
      @show-choose-model="openChooseModel"
    />

    <ChatInput
      v-model="inputMessage"
      :picList="picList"
      :selectedText="selectedText"
      @update:selectedText="(val) => (selectedText = val)"
      @update:picList="(val) => (picList = val)"
      @delete-pic="handleDeletePic"
      @send="handleInputEnter"
      @load-previous="loadPreviousMessage"
      @escape="handleEscape"
      @composition-start="composing = true"
      @composition-end="composing = false"
      ref="inputRef"
    />
  </div>
  <ChooseModel v-model:show-modal="showModelModal" @select-model="handleChooseModel" @nav-to-config="handleNavToConfig" />

  <RolePrompt v-model:show="promptVisible" />
</template>

<script lang="ts" setup>
// Import composable
import { useChat } from '@/composables/useChat.ts'

// Import components with better organization
import ChatMessages from './ChatMessages.vue'
import MessageActions from './MessageActions.vue'
import ChatInput from './ChatInput.vue'
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
  hiddenText,
  picList,
  apiInfo,
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
const composing = ref(false)
const inputHistory = ref<string[]>([])
const currentHistoryIndex = ref(-1)
const showModelModal = ref(false)

// Refs
const inputRef = ref()
const messagesRef = ref()

// Open the extension's options page
const openOptionsPage = () => {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage()
  }
}

// Initialize with a loading state
const apiCheckCompleted = ref(false)

// Watch for API info changes
watch(
  apiInfo,
  (newValue) => {
    if (newValue.apiKey && newValue.apiUrl) {
      initOpenAI()
    } else if (apiCheckCompleted.value) {
      openOptionsPage()
    }
  },
  { immediate: true, deep: true }
)

// Set a timeout to check if apiInfo is loaded
setTimeout(() => {
  apiCheckCompleted.value = true
  if (!unref(apiInfo).apiKey || !unref(apiInfo).apiUrl) {
    openOptionsPage()
  }
}, 1000)

onMounted(() => {
  chrome.runtime.sendMessage({ action: 'sidePanelReady' }).catch((error) => {
    console.error('Error notifying side panel readiness:', error);
  });
  chrome.runtime.connect({ name: 'mySidepanel' });
  // 监听选中文本事件
  setupSelectedTextListener()

  // Optimize initial scroll position
  nextTick(() => {
    messagesRef.value?.scrollToBottom()
  })
  initChat(props.context)
})

// 设置选中文本监听器
const setupSelectedTextListener = () => {
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'textSelected') {
        selectedText.value = message.text
        inputRef.value.focus()
        sendResponse({ status: 'success' })
      }
      if (message.action === 'summarizePage' || message.action === 'summarizePageWithSVG') {
        selectedText.value = message.title
        hiddenText.value = message.content
        const prompt = message.action === 'summarizePage' ? '总结页面' : '总结页面并结合SVG展示'
        emptyConfirm(prompt)
      }
      return true
    })
    try {
      chrome.runtime
        .sendMessage('sidePanelOpened')
        .then(() => console.log('Side panel opened message sent'))
        .catch((err) => console.error('Error sending side panel opened message:', err))
    } catch (error) {
      console.error('Error sending initial message:', error)
    }
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

// Methods
const handleChooseModel = (api, model) => {
  apiInfo.value.apiKey = api.apiKey
  apiInfo.value.apiUrl = api.apiUrl
  selectMode.value = model
  // initOpenAI()
}
const handleNavToConfig = (api: any) => {
  openOptionsPage()
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
const openChooseModel = () => {
  showModelModal.value = true
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
  background-color: var(--app-bg-color);
  border-top: 1px solid rgba(0, 0, 0, 0.03);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.03);
  border-radius: 16px 16px 0 0;
  margin-top: -14px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  position: relative;
  z-index: 1;
}
</style>
