<template>
  <div class="chat">
    <div class="mode-select">
      <label>选择模型：</label>
      <el-select v-model="selectMode" placeholder="选择模型" size="small" style="width: 160px" @change="onChangeMode">
        <el-option v-for="item in options" :key="item.value" :label="item.value" :value="item.value" />
      </el-select>
      <el-input
        v-if="selectMode === '自定义模型'"
        v-model="customModel"
        placeholder="请输入模型"
        size="small"
        style="width: 160px"
        class="ml-[12px] flex-shrink-0"
      />
      <el-tooltip effect="dark" content="不稳定，最好用免费账号，避免封号风险" placement="bottom">
        <el-checkbox v-if="selectMode === 'gpt-3.5-turbo'" v-model="fuckMode" class="ml-[12px] !h-auto">国粹模式</el-checkbox>
      </el-tooltip>
    </div>
    <Chatgpt
      ref="contentRef"
      :model="selectMode != '自定义模型' ? selectMode : customModel"
      :fuckMode="fuckMode"
      :context="currentContext"
      @clear="clearCurrentChat"
      @saveHistory="saveHistory"
    />
    <!-- <Gemini v-else-if="selectMode === 'gemini'" ref="contentRef" :model="selectMode" :context="currentContext" @clear="clearCurrentChat" @saveHistory="saveHistory" />
    <Dalle3 v-else ref="contentRef" :model="selectMode" /> -->
    <!-- 历史记录 drawer -->
    <History v-model:drawer="historyDrawer" :sessionId="sessionId" @navToHistory="navToHistory" @reload="initLastInfo" />
    <!-- 底部 -->
    <div class="bottom_wrap">
      <el-tooltip effect="dark" content="历史记录" placement="top">
        <el-button text type="" @click="historyDrawer = true">
          <el-icon size="20" color="#333"><ep-clock /></el-icon>
        </el-button>
      </el-tooltip>
      <el-tooltip effect="dark" content="新对话" placement="top">
        <el-button style="margin-left: 0" text type="" @click="addNewSession">
          <el-icon size="20" color="#666"><ep-circle-plus-filled /></el-icon>
        </el-button>
      </el-tooltip>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'
import Chatgpt from './chat/index1.vue'
import Gemini from './gemini/index.vue'
import Dalle3 from './dalle3/index.vue'
import History from './history/index.vue'

const options = [
  {
    value: 'gpt-4-turbo',
    desc: '遥遥遥遥领先'
  },
  {
    value: 'gpt-4-0125-preview',
    desc: '遥遥领先'
  },
  {
    value: 'gpt-3.5-turbo',
    desc: 'GPT-3.5, 速度较快，能力一般'
  },
  {
    value: '自定义模型',
    desc: '自定义模型'
  }

  // {
  //   value: 'dall-e-3',
  //   desc: '画图的'
  // },
  // {
  //   value: 'gemini',
  //   desc: 'google的辣鸡模型，凑活用'
  // }
]
const selectMode = useStorage('mode', 'gpt-3.5-turbo')
const customModel = useStorage('customModel', '') // 自定义模型
const fuckMode = useStorage('fuckMode', false) // 国粹模式
const contentRef = ref<any>(null)
const historyDrawer = ref<boolean>(false) // 历史记录弹窗
const sessionId = ref('') //  当前会话Id
const currentContext = ref<any>([]) // 当前会话上下文

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
