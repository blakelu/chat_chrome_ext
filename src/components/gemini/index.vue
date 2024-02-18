<template>
  <div class="messages" ref="messages">
    <Message v-for="message in chatMessages" :key="message.id" :message="message" />
  </div>
  <div class="operate_wrap">
    <el-input
      v-model="input"
      placeholder="请输入您的问题"
      @keydown.enter="handleInputEnter"
      @compositionstart="composing = true"
      @compositionend="composing = false"
    ></el-input>
    <el-button @click="clearChat">清除聊天记录</el-button>
  </div>
  <el-dialog v-model="dialogVisible" title="提示" width="80%">
    <el-input v-model="API_KEY" placeholder="请输入Api key" />
    <a href="https://makersuite.google.com/app/apikey" target="_blank">获取我的API Key</a>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="handleConfirm"> 确认 </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { GoogleGenerativeAI } from '@google/generative-ai'

const historyMessage = JSON.parse(localStorage.chatMessages || '[]')
const historyContext = JSON.parse(localStorage.chatContext || '[]')

const dialogVisible = ref(false)
const chatMessages = ref(historyMessage) // 聊天的message
const chatContext = ref(historyContext) // 聊天上下文
const input = ref<string>('')
const API_KEY = ref(localStorage.API_KEY || '')
const composing = ref(false)
const USER_AVATAR = 'https://resource-yswy.oss-cn-hangzhou.aliyuncs.com/web/test/user.png'
const ASSISTANT_AVATAR = 'https://resource-yswy.oss-cn-hangzhou.aliyuncs.com/web/test/ChatGPT.png'

onMounted(() => {
  if (!API_KEY.value) {
    dialogVisible.value = true
  }
})

const handleConfirm = () => {
  localStorage.setItem('API_KEY', API_KEY.value)
  dialogVisible.value = false
}

watch(chatMessages.value, (val) => {
  localStorage.chatMessages = JSON.stringify(val)
})
watch(chatContext.value, (val) => {
  localStorage.chatContext = JSON.stringify(val)
})

const clearChat = () => {
  chatMessages.value.splice(0, chatMessages.value.length)
  chatContext.value.splice(0, chatContext.value.length)
}

async function handleInputEnter() {
  if (!API_KEY.value) {
    dialogVisible.value = true
    return
  }
  const msg = input.value
  if (!msg || composing.value) {
    return
  }
  chatMessages.value.push(createMessage(chatMessages.value.length + 1, 'user', USER_AVATAR, msg))
  chatMessages.value.push(createMessage(chatMessages.value.length + 1, 'model', ASSISTANT_AVATAR, ''))
  input.value = ''
  scrollToBottom()
  const genAI = new GoogleGenerativeAI(API_KEY.value)
  // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
  //   const customPrompt = []
  const history = [...chatContext.value]
  const chat = model.startChat({
    history
  })

  chatContext.value.push({ role: 'user', parts: msg })
  let id = chatMessages.value.length + 1
  try {
    const result = await chat.sendMessageStream(msg)
    let text = ''
    for await (const chunk of result.stream) {
      const chunkText = chunk.text()
      text += chunkText
      chatMessages.value[id - 2].content = text
    }
    chatContext.value.push({ role: 'model', parts: text })
    scrollToBottom()
  } catch (error) {
    chatMessages.value[id - 2].content = '不要说这种羞羞的话题'
    chatContext.value.push({ role: 'model', parts: '不要说这种羞羞的话题' })
  }
}

function createMessage(id, role, avatar, content) {
  return {
    id,
    role,
    avatar,
    content
  }
}
const messages = ref()
const scrollToBottom = () => {
  setTimeout(() => {
    const scrollContainer = messages.value
    scrollContainer.scrollTop = scrollContainer.scrollHeight
  })
}
</script>

<style lang="less" scoped>
:deep(.hljs) {
  padding: 6px;
}

.operate_wrap {
  position: fixed;
  bottom: 0;
  left: 0;
  width: calc(100% - 40px);
  padding: 20px 20px 20px 20px;
}

.messages {
  margin-top: 10px;
  max-height: 440px;
  overflow-y: auto;
}

.el-input {
  margin-bottom: 10px;
}
</style>