<template>
  <div class="messages" ref="messages">
    <Message
      v-for="(message, index) in chatMessages"
      :key="message.id"
      :message="message"
      :loading="index + 1 === chatMessages.length && loading"
    />
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
    <el-input v-model="API_URL" placeholder="请输入Api url" />
    <el-input v-model="API_KEY" placeholder="请输入Api key" />
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="handleConfirm"> 确认 </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import axios from 'axios'

const historyMessage = JSON.parse(localStorage.chatgptMessages || '[]')

const dialogVisible = ref(false)
const chatMessages = ref<any>(historyMessage) // 聊天的message
const chatContext = ref<any>() // 聊天上下文
const input = ref<string>('')
const API_URL = ref(localStorage.GPT_API_URL || 'https://proxy.cocopilot.org')
const API_KEY = ref(localStorage.GPT_API_KEY || '')
const loading = ref(false) // 回复loading
const composing = ref(false)
const USER_AVATAR = 'https://cdn.ysservice.com.cn/web/test/user.png'
const ASSISTANT_AVATAR = 'https://cdn.ysservice.com.cn/web/test/ChatGPT.png'

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
  localStorage.chatgptMessages = JSON.stringify(val)
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
  const res = await axios.post(
    `${API_URL.value}/v1/images/generations`,
    {
      model: 'dall-e-3',
      prompt: msg,
      // quality: 'hd',
      style: 'natural'
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY.value}`
      }
    },
    {
      timeout: 99999999
    }
  )
  if (res.status === 200) {
    // 生成markdown可显示的图片
    const content = `![image](${res.data.data[0].url})`
    chatMessages.value[chatMessages.value.length - 1].content = content
  }
}

function createMessage(id: any, role: string, avatar: string, content: string) {
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
defineExpose({
  clearChat,
})
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
  // max-height: 440px;
  overflow-y: auto;
  :deep(img) {
    width: 100%;
  }
}

.el-input {
  margin-bottom: 10px;
}
</style>
