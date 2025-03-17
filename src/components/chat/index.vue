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
      @show-settings="dialogVisible = true"
      @show-prompt-dialog="promptVisible = true"
      @show-export-dialog="openExportDialog"
      @theme-change="handleThemeChange"
    />

    <ChatInput
      v-model="prompt"
      :picList="picList"
      :selectedText="selectedText"
      @update:selectedText="selectedText = $event"
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

  <SettingsDrawer v-model:show="dialogVisible" @confirm="handleConfirm" />
  <RolePrompt v-model:show="promptVisible" />

  <ExportDialog :messages="chatMessages" v-model:visible="exportDialogVisible" @copy="handleExportCopy" @download="handleExportDownload" />
</template>

<script lang="ts" setup>
import OpenAI from 'openai'
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useStorage } from '@vueuse/core'
import { throttle } from 'lodash-es'
import { ElMessage } from 'element-plus'

// Import components with better organization
import ChatMessages from './ChatMessages.vue'
import MessageActions from './MessageActions.vue'
import ChatInput from './ChatInput.vue'
import ExportDialog from './ExportDialog.vue'
import empty from './empty.vue'
import SettingsDrawer from '../settings/SettingsDrawer.vue'
import RolePrompt from '../settings/RolePrompt.vue'

// Import assets
import USER_AVATAR from '@/assets/icons/user.png'
import ASSISTANT_AVATAR from '@/assets/icons/ROBOT.png'

// Define interfaces
interface Message {
  id: number
  role: string
  avatar: string
  content: string | any
  errorMessage?: string
}

interface SubmitMessage {
  role: string
  content: string | any
}

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

// State
const chatMessages = ref<Message[]>([])
const chatContext = ref<SubmitMessage[]>([])
const prompt = ref<string>('')
const loading = ref(false)
const dialogVisible = ref(false)
const promptVisible = ref(false)
const exportDialogVisible = ref(false)
const picList = ref<string[]>([])
const composing = ref(false)
const inputHistory = ref<string[]>([])
const currentHistoryIndex = ref(-1)
const selectedText = ref('') // 添加选中文本状态

// Refs
const inputRef = ref()
const messagesRef = ref()

// Storage
const API_KEY = useStorage('GPT_API_KEY', '')
const API_URL = useStorage('GPT_API_URL', '')
const settings = ref({
  temperature: 0.7,
  limitContext: 6,
  quality: 'standard',
  dalleSize: '1024x1024',
  dalleStyle: 'vivid',
  stream: true,
  prompt: ''
})
const commonSettings = useStorage('COMMON_SETTINGS', settings, localStorage, { mergeDefaults: true })
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

const selectMode = useStorage('mode', 'gpt-4o')

// OpenAI client
let openai: any = {}
const initOpenAI = () => {
  const baseURL = `${API_URL.value}${API_URL.value === 'https://models.inference.ai.azure.com' ? '' : '/v1'}`
  openai = new OpenAI({ baseURL, apiKey: API_KEY.value, dangerouslyAllowBrowser: true })
}

// Lifecycle hooks
onMounted(async () => {
  if (!API_KEY.value) {
    dialogVisible.value = true
  }
  initChat()
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
      if (message.action === 'textSelected' && message.text) {
        // 限制选中文本长度以避免过长
        const maxLength = 1000
        selectedText.value = message.text.length > maxLength ? message.text.substring(0, maxLength) + '...' : message.text
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

    // 每30秒发送心跳以保持连接活跃
    const heartbeatInterval = setInterval(() => {
      try {
        chrome.runtime.sendMessage('sidePanelHeartbeat').catch((err) => console.error('Heartbeat error:', err))
      } catch (error) {
        console.error('Error sending heartbeat:', error)
      }
    }, 30000)

    // 清理函数
    onUnmounted(() => {
      clearInterval(heartbeatInterval)
    })
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

// Methods
const handleConfirm = (data: any) => {
  API_URL.value = data.API_URL
  API_KEY.value = data.API_KEY
  initOpenAI()
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

const initChat = (val?: any) => {
  const arr = val || props.context
  chatContext.value.splice(0, chatContext.value.length, ...arr)
  chatMessages.value = arr.map((item: any, index: number) => {
    return {
      ...item,
      id: index + 1,
      avatar: item.role === 'user' ? USER_AVATAR : ASSISTANT_AVATAR
    }
  })
  console.log(chatContext.value, 'chatContext.value', props.context)
}

const clearChat = () => {
  chatMessages.value.splice(0, chatMessages.value.length)
  chatContext.value.splice(0, chatContext.value.length)
  emit('clear')
}

function createMessage(id: any, role: string, avatar: string, content: string) {
  return {
    id,
    role,
    avatar,
    content
  }
}

function updateMessageAndContext(id: number, content: any) {
  chatMessages.value[id].content = content
  chatContext.value.push({ role: 'assistant', content })
  inputRef.value.focus()
}

function formatPromptMessages(chatContext: any) {
  let result = []

  // 使用 for 循环以便能够提前查看下一个元素
  for (let i = 0; i < chatContext.length; i++) {
    // 判断当前项
    const isAudio = Object.prototype.toString.call(chatContext[i].content) === '[object Object]' && chatContext[i].content.type === 'audio'
    // 预判断下一项是否满足条件，同时确保不会越界
    const hasNext = i + 1 < chatContext.length
    const isArrayAndWrongModelForNext = hasNext && Array.isArray(chatContext[i].content)

    if (isAudio) {
      // 如果当前项是音频，跳过当前项和前一项
      if (i > 0) {
        // 如果存在前一项，则从结果中移除
        result.pop()
      }
      // 跳过当前项的添加，即不执行result.push
    } else if (isArrayAndWrongModelForNext) {
      // 如果下一项满足数组条件并使用了错误的模型，跳过当前项和下一项
      i++ // 跳过下一项
    } else {
      result.push(chatContext[i])
    }
  }

  return result
}


// Handle tab completion
const handleTabCompletion = async () => {
  if (!prompt.value.trim()) return

  try {
    ElMessage.info('生成自动补全...')

    // Get completion from API
    const completion = await openai.completions.create({
      model: 'gpt-3.5-turbo-instruct',
      prompt: prompt.value.trim() + '\n\nComplete this thought:',
      max_tokens: 50,
      temperature: 0.7,
      stop: ['\n', '。', '.', '?', '？', '!', '！']
    })

    // Add completion to prompt
    if (completion.choices && completion.choices[0].text) {
      prompt.value += completion.choices[0].text
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
    if (prompt.value.trim()) {
      inputHistory.value = [prompt.value]
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
    prompt.value = inputHistory.value[currentHistoryIndex.value]
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

  if (!prompt.value || composing.value) return

  const content = prepareContent()
  updateUserChat(content)

  selectedText.value = '' // 清空选中文本

  const temporaryMessageId = addTemporaryAssistantMessage()

  const customPrompt = prepareCustomPrompt()

  loading.value = true

  try {
    await handleModelResponse(content, temporaryMessageId, customPrompt)

    // Add to input history
    if (typeof content === 'string') {
      if (inputHistory.value.indexOf(content) === -1) {
        inputHistory.value.unshift(content)
        if (inputHistory.value.length > 50) {
          inputHistory.value.pop()
        }
      }
    }

    currentHistoryIndex.value = -1
  } catch (error) {
    const errorMessage = error.message || 'something went wrong'
    updateMessageAndContext(temporaryMessageId - 1, errorMessage)
    ElMessage.error('请求失败: ' + errorMessage)
  }

  loading.value = false
  messagesRef.value?.scrollToBottom()
}

function prepareContent() {
  if (picList.value.length > 0) {
    const urls = picList.value.map((item: string) => ({
      type: 'image_url',
      image_url: {
        url: item,
        detail: 'auto'
      }
    }))
    picList.value = []
    return [{ type: 'text', text: prompt.value }, ...urls]
  }
  if (selectedText.value) {
    return `${prompt.value}\n\`\`\`${selectedText.value}\`\`\``
  }
  return prompt.value
}

function updateUserChat(content: any) {
  chatMessages.value.push(createMessage(chatMessages.value.length + 1, 'user', USER_AVATAR, content))
  chatContext.value.push({ role: 'user', content })
  prompt.value = ''
  messagesRef.value?.scrollToBottom()
}

function addTemporaryAssistantMessage() {
  chatMessages.value.push(createMessage(chatMessages.value.length + 1, 'assistant', ASSISTANT_AVATAR, ''))
  return chatMessages.value.length
}

function prepareCustomPrompt() {
  const limitContext = commonSettings.value.limitContext + 1
  const customPrompt = formatPromptMessages([...chatContext.value.slice(-limitContext)])
  if (commonSettings.value.prompt) {
    customPrompt.unshift({ role: 'system', content: commonSettings.value.prompt })
  }
  return customPrompt
}

async function handleModelResponse(content: any, temporaryMessageId: number, customPrompt: any) {
  if (selectMode.value === 'dall-e-3') {
    await handleDallEModelResponse(content, temporaryMessageId)
  } else if (['tts-1', 'tts-1-hd', 'tts-az-1'].includes(selectMode.value)) {
    await handleTTSModelResponse(content, temporaryMessageId)
  } else {
    await handleChatModelResponse(customPrompt, temporaryMessageId)
  }
}

async function handleDallEModelResponse(content: any, temporaryMessageId: number) {
  const { dalleSize: size, dalleStyle: style, quality } = commonSettings.value
  const image = await openai.images.generate({ model: selectMode.value, prompt: content, size, style, quality })
  const url = `![image](${image.data[0].url})`
  updateMessageAndContext(temporaryMessageId - 1, url)
}

async function handleTTSModelResponse(content: any, temporaryMessageId: number) {
  const mp3 = await openai.audio.speech.create({
    model: selectMode.value,
    voice: props.ttsvoice,
    input: content
  })
  const response = new Response(mp3.body)
  const audioBlob = await response.blob()
  const audioUrl = URL.createObjectURL(audioBlob)
  const data = { type: 'audio', audioUrl }
  updateMessageAndContext(temporaryMessageId - 1, data)
}

async function handleChatModelResponse(customPrompt: any, temporaryMessageId: number) {
  const completion = await openai.chat.completions.create({
    model: selectMode.value,
    messages: customPrompt,
    temperature: commonSettings.value.temperature,
    stream: commonSettings.value.stream
  })

  if (commonSettings.value.stream) {
    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content
      if (!content) continue
      if (chunk.choices[0]?.finish_reason === 'stop') break
      chatMessages.value[temporaryMessageId - 1].content += content
    }
    chatContext.value.push({ role: 'assistant', content: chatMessages.value[temporaryMessageId - 1].content })
    inputRef.value.focus()
  } else {
    const content = completion.choices[0]?.message?.content
    updateMessageAndContext(temporaryMessageId - 1, content)
  }
}

const emptyConfirm = (data: string) => {
  prompt.value = data
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

// Add retry function for failed messages
const retryMessage = (message) => {
  // Find the failed message in chatMessages
  const failedMsgIndex = chatMessages.value.findIndex((m) => m.id === message.id)
  if (failedMsgIndex === -1) return

  // Remove the error message
  chatMessages.value.splice(failedMsgIndex, 1)

  // Find the context of the message (user's prompt)
  const userMsgIndex = chatContext.value.findIndex(
    (ctx) =>
      ctx.role === 'user' &&
      (ctx.content === message.content ||
        (Array.isArray(ctx.content) && ctx.content.some((c) => c.type === 'text' && c.text === message.content)))
  )

  if (userMsgIndex !== -1) {
    // Get the user's original prompt
    const userPrompt = chatContext.value[userMsgIndex]

    // Remove all messages after this one in context
    chatContext.value.splice(userMsgIndex + 1)

    // Handle this as a new message from the last user input
    const temporaryMessageId = addTemporaryAssistantMessage()
    const customPrompt = prepareCustomPrompt()

    loading.value = true

    handleModelResponse(userPrompt.content, temporaryMessageId, customPrompt)
      .then(() => {
        loading.value = false
        messagesRef.value?.scrollToBottom()
      })
      .catch((error) => {
        const errorMessage = error.message || 'something went wrong'
        updateMessageAndContext(temporaryMessageId - 1, errorMessage)
        ElMessage.error('重试失败: ' + errorMessage)
        loading.value = false
      })
  }
}

// Expose methods to parent component
defineExpose({
  clearChat,
  initChat
})
</script>

<style lang="less" scoped>
.operate_wrap {
  width: 100%;
  padding: 8px;
  background-color: #fff;
}

:deep(.hljs) {
  margin: 8px 0;
  padding: 12px 10px;
  white-space: pre-wrap;
  border-radius: 8px;
}
</style>
