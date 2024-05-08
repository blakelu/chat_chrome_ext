<template>
  <div class="chat">
    <div class="mode-select">
      <label>选择模型：</label>
      <el-select v-model="selectMode" placeholder="选择模型" size="small" style="width: 160px" @change="onChangeMode">
        <el-option v-for="item in options" :key="item" :label="item" :value="item" />
        <template #footer>
          <el-button v-if="!isAdding" text bg size="small" @click="addModel"> Add a model </el-button>
          <template v-else>
            <el-input ref="inputRef" v-model="optionName" class="mb-2" placeholder="input model name" size="small" />
            <el-button type="primary" size="small" @click="onConfirm"> confirm </el-button>
            <el-button size="small" @click="clear">cancel</el-button>
          </template>
        </template>
      </el-select>

      <el-input
        v-if="['tts-az-1', 'tts-1', 'tts-1-hd'].includes(selectMode)"
        v-model="ttsvoice"
        class="ml-3 !w-[140px]"
        placeholder="请输入发音人"
        size="small"
      />
      <a
        v-if="selectMode === 'tts-az-1'"
        href="https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts"
        target="_blank"
        class="ml-3"
        >更多声音</a
      >
      <el-tooltip effect="dark" content="不稳定，最好用免费账号，避免封号风险" placement="bottom">
        <el-checkbox v-if="selectMode === 'gpt-3.5-turbo'" v-model="fuckMode" class="ml-3 !h-auto">自由模式</el-checkbox>
      </el-tooltip>
    </div>
    <Chatgpt
      ref="contentRef"
      :model="selectMode"
      :ttsvoice="ttsvoice"
      :fuckMode="fuckMode"
      :context="currentContext"
      @showHistory="historyDrawer = true"
      @addNewSession="addNewSession"
      @clear="clearCurrentChat"
      @saveHistory="saveHistory"
    />
    <!-- <Gemini v-else-if="selectMode === 'gemini'" ref="contentRef" :model="selectMode" :context="currentContext" @clear="clearCurrentChat" @saveHistory="saveHistory" /> -->
    <!-- 历史记录 drawer -->
    <History v-model:drawer="historyDrawer" :sessionId="sessionId" @navToHistory="navToHistory" @reload="initLastInfo" />
  </div>
</template>

<script lang="ts" setup>
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'
import Chatgpt from './chat/index.vue'
import Gemini from './gemini/index.vue'
import History from './history/index.vue'

const options = useStorage('modelList', ['gpt-3.5-turbo', 'gpt-4-0125-preview', 'gpt-4-turbo-2024-04-09', 'dall-e-3', 'tts-az-1'])
const selectMode = useStorage('mode', 'gpt-3.5-turbo')
const inputRef = ref()
const isAdding = ref(false)
const optionName = ref('')
const fuckMode = useStorage('fuckMode', false) // 国粹模式
const contentRef = ref<any>(null)
const historyDrawer = ref<boolean>(false) // 历史记录弹窗
const sessionId = ref('') //  当前会话Id
const currentContext = ref<any>([]) // 当前会话上下文
const ttsvoice = ref('zh-CN-henan-YundengNeural')

const addModel = () => {
  isAdding.value = true
  nextTick(() => {
    inputRef.value?.focus()
  })
}
const onConfirm = () => {
  if (optionName.value) {
    options.value.push(optionName.value)
    clear()
  }
}

const clear = () => {
  optionName.value = ''
  isAdding.value = false
}

// 根据timeStr距离当前最近的时间，获取上一次的历史记录
const initLastInfo = () => {
  const historyInfo = JSON.parse(localStorage.historyInfo || '[]')
  const lastIndex = historyInfo.findIndex((item: any) => item.isLast)
  if (lastIndex > -1) {
    const { mode, context: con, sessionId: uuid } = historyInfo[lastIndex]
    sessionId.value = uuid
    selectMode.value = mode
    currentContext.value = con
  } else {
    sessionId.value = uuidv4()
    selectMode.value = 'gpt-3.5-turbo'
    currentContext.value = []
  }
}
initLastInfo()
// 模式切换
const onChangeMode = () => {
  const historyInfo = JSON.parse(localStorage.historyInfo || '[]')
  const historyIndex = historyInfo.findIndex((item: any) => item.sessionId === sessionId.value)
  if (historyIndex > -1) {
    const { context } = historyInfo[historyIndex]
    currentContext.value = context
  } else {
    currentContext.value = []
  }
}
const addNewSession = () => {
  if (contentRef.value) {
    currentContext.value = []
    sessionId.value = uuidv4()
    contentRef.value.clearChat()
  }
}
// 清除当前聊天内容
const clearCurrentChat = () => {
  currentContext.value = []
}
// 切换历史记录
const navToHistory = (item: any) => {
  const { mode, context: con, sessionId: uuid } = item
  sessionId.value = uuid
  selectMode.value = mode
  currentContext.value = con
}
// 保存历史记录
const saveHistory = (context: { role: string; content: string }[]) => {
  console.log('save history', context)
  // if (context.length === 0) return
  const historyInfo = JSON.parse(localStorage.historyInfo || '[]')
  const historyIndex = historyInfo.findIndex((item: any) => item.sessionId === sessionId.value)
  historyInfo.forEach((item: any) => {
    item.isLast = false
  })
  const item = {
    sessionId: sessionId.value,
    mode: selectMode.value,
    timeStr: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    title: context?.[0]?.content ?? '',
    desc: context.length > 1 ? context[context.length - 1].content : '',
    context,
    isLast: true
  }
  if (historyIndex > -1) {
    historyInfo[historyIndex] = item
  } else {
    historyInfo.push({ ...item, sessionId: sessionId.value })
  }
  localStorage.historyInfo = JSON.stringify(historyInfo)
}
</script>

<style lang="less" scoped>
.chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 260px;
  // background: linear-gradient(0deg, #abbaab, #ffffff);
  background-color: #f3f9f9;
  box-sizing: border-box;
  .mode-select {
    display: flex;
    align-items: center;
    background: linear-gradient(226deg, #1fca6d, #43bff0);
    padding: 12px 16px;
    white-space: nowrap;

    label {
      margin-right: 6px;
      font-weight: 500;
      color: #fff;
      flex-shrink: 0;
    }
  }
}
.bottom_wrap {
  position: fixed;
  bottom: 100px;
  right: 20px;
  white-space: nowrap;
  button {
    padding: 8px;
  }
}
</style>
