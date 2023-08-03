<template>
  <div class="chat">
    <div class="messages" ref="messages">
      <div class="message" v-for="message in chatMessages" :key="message.id" :class="{ 'is-self': message.isSelf }">
        <div class="avatar"><img :src="message.avatar" /></div>
        <div class="content">{{ message.content }}</div>
      </div>
    </div>
    <div class="operate_wrap">
      <el-input v-model="input" placeholder="请输入您的问题" @keydown.enter="handleInputEnter"></el-input>
      <el-button @click="clearChat">清除聊天记录</el-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import axios from 'axios'
import openai from 'openai'

interface Message {
  id: number
  isSelf: boolean
  avatar: string
  content: string
}
interface SubmitMessage {
  role: string
  content: string
}
const historyMessage = JSON.parse(localStorage.chatMessages || '[]')
const historyContext = JSON.parse(localStorage.chatContext || '[]')
// console.log(historyMessage)
const chatMessages = ref<Message[]>(historyMessage) // 聊天的message
const chatContext = ref<SubmitMessage[]>(historyContext) // 聊天上下文
const input = ref<string>('')

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

const handleInputEnter = async () => {
  const prompt = input.value
  if (!prompt) {
    return
  }
  // console.log(chatMessages.value, 123)
  chatMessages.value.push({
    id: chatMessages.value.length + 1,
    isSelf: true,
    avatar: 'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png',
    content: prompt
  })
  chatContext.value.push({ role: 'user', content: prompt })
  input.value = ''
  scrollToBottom()
  // const response = await axios.post(
  //   'https://ai.fakeopen.com/v1/chat/completions',
  //   {
  //     model: 'gpt-3.5-turbo-16k',
  //     stream: true,
  //     messages: chatContext.value // [{ role: 'user', content: prompt }]
  //   },
  //   {
  //     headers: {
  //       'Content-Type': 'application/json',
  //       Authorization: 'Bearer pk-this-is-a-real-free-pool-token-for-everyone'
  //     }
  //   }
  // )

  // chatContext.value.push(response.data.choices[0].message)
  // const message = response.data.choices[0].message.content
  // chatMessages.value.push({
  //   id: chatMessages.value.length + 1,
  //   isSelf: false,
  //   avatar: 'https://cdn.pixabay.com/photo/2016/03/31/19/58/avatar-1295429_960_720.png',
  //   content: message
  // })
  chatMessages.value.push({
    id: chatMessages.value.length + 1,
    isSelf: false,
    avatar: 'https://cdn.pixabay.com/photo/2016/03/31/19/58/avatar-1295429_960_720.png',
    content: ''
  })
  let id = chatMessages.value.length + 1
  fetchStream(`https://ai.fakeopen.com/v1/chat/completions`, {
    method: 'POST',
    headers: {
      accept: 'text/event-stream',
      'Content-Type': 'application/json',
      Authorization: 'Bearer pk-this-is-a-real-free-pool-token-for-everyone'
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo-16k',
      stream: true,
      messages: chatContext.value
    }),
    onmessage: (chunk) => {
      // todo
      const lines = chunk
        .toString()
        .split('\n')
        .filter((line) => line.trim() !== '')
      console.log(lines)
      for (const line of lines) {
        const message = line.replace(/^data: /, '')
        if (message.includes('"finish_reason":"stop"')) {
          // 通信结束
          // ctx.sse.send("[DONE]");
          return
        } else if (message == '[DONE]') {
          // ctx.sse.send("[DONE]");
        } else {
          console.log(22222, message)
          const parsed = JSON.parse(message)
          if (parsed.choices[0].delta.content) {
            //解析出来的内容
            let content = parsed.choices[0].delta.content
            if (content.startsWith(':')) {
              //转义
              content = '\\\\' + content
            }
            console.log(content, chatMessages.value, id - 2)
            chatMessages.value[id - 2].content += content
          }
        }
      }
    }
  })
  scrollToBottom()
}
function Uint8ArrayToString(array) {
  var out, i, len, c
  var char2, char3
  let tempAry: Uint8Array = array as Uint8Array
  out = ''
  len = tempAry.length
  i = 0
  while (i < len) {
    c = tempAry[i++]
    switch (c >> 4) {
      case 0:
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
        // 0xxxxxxx
        out += String.fromCharCode(c)
        break
      case 12:
      case 13:
        // 110x xxxx   10xx xxxx
        char2 = tempAry[i++]
        out += String.fromCharCode(((c & 0x1f) << 6) | (char2 & 0x3f))
        break
      case 14:
        // 1110 xxxx  10xx xxxx  10xx xxxx
        char2 = tempAry[i++]
        char3 = tempAry[i++]
        out += String.fromCharCode(((c & 0x0f) << 12) | ((char2 & 0x3f) << 6) | ((char3 & 0x3f) << 0))
        break
    }
  }
  return out
}

const fetchStream = (url, params) => {
  const { onmessage, onclose, ...otherParams } = params
  const push = async (controller, reader) => {
    const { value, done } = await reader.read()
    if (done) {
      controller.close()
      onclose?.()
    } else {
      onmessage?.(Uint8ArrayToString(value))
      controller.enqueue(value)
      push(controller, reader)
    }
  }
  // 发送请求
  return fetch(url, otherParams)
    .then((response) => {
      // 以ReadableStream解析数据
      const reader = response.body.getReader()
      const stream = new ReadableStream({
        start(controller) {
          push(controller, reader)
        }
      })
      return stream
    })
    .then((stream) => new Response(stream, { headers: { 'Content-Type': 'text/html' } }).text())
}
const scrollToBottom = () => {
  setTimeout(() => {
    const messagesDiv: any = document.querySelector('html')
    messagesDiv.scrollTop = messagesDiv.scrollHeight
  })
}
scrollToBottom()
onMounted(() => {
  const inputEl = document.querySelector('.el-input__inner') as HTMLInputElement
  inputEl.focus()
})
</script>
<style lang="less" scoped>
.chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f5f5;
  padding: 20px 20px 134px 20px;
  .operate_wrap {
    position: fixed;
    bottom: 0;
    left: 0;
    width: calc(100% - 40px);
    padding: 20px 20px 20px 20px;
    background: #ccc;
  }
}

.el-input {
  margin-bottom: 10px;
}

.messages {
  flex: 1;
  // overflow-y: scroll;
  padding: 10px;
}

.message {
  display: flex;
  align-items: flex-end;
  margin-bottom: 10px;
}

.message.is-self {
  flex-direction: row-reverse;
}

.avatar {
  width: 50px;
  height: 50px;
  margin-right: 10px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar img {
  width: 100%;
  height: 100%;
}

.content {
  color: #333;
  padding: 10px;
  border-radius: 10px;
  background-color: #fff;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  max-width: 80%;
  word-wrap: break-word;
}

.content.is-self {
  background-color: #efefef;
}

.content.is-self:before {
  content: '';
  display: inline-block;
  position: relative;
  bottom: -1px;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 10px 10px 0;
  border-color: transparent #efefef transparent transparent;
  margin-right: 10px;
}
</style>
