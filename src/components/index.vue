<template>
  <div class="chat">
    <div class="mode-select">
      <label>选择模型：</label>
      <el-radio-group v-model="selectMode" placeholder="请选择模型" size="small">
        <el-radio v-for="item in options" :label="item.value">
          <el-tooltip class="box-item" effect="dark" :content="item.desc" placement="bottom"> {{ item.value }}</el-tooltip>
        </el-radio>
      </el-radio-group>
    </div>
    <Chatgpt v-if="selectMode != 'gemini'" ref="contentRef" :model="selectMode" :context="context" @saveHistory="saveHistory" />
    <Gemini v-else ref="contentRef" :model="selectMode" :context="context" @saveHistory="saveHistory" />
    <!-- 历史记录 drawer -->
    <History v-model:drawer="historyDrawer" :sessionId="sessionId" @navToHistory="navToHistory" @reload="initLastInfo" />
    <!-- 底部 -->
    <div class="bottom_wrap">
      <el-button text type="" @click="historyDrawer = true">
        <el-icon size="20" color="#333"><ep-clock /></el-icon>
      </el-button>
      <el-button style="margin-left: 0" text type="" @click="addNewSession">
        <el-icon size="20" color="#4540ff"><ep-circle-plus-filled /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'
import Chatgpt from './chat/index.vue'
import Gemini from './gemini/index.vue'
import History from './history/index.vue'

const options = [
  {
    value: 'gpt-3.5-turbo',
    desc: 'GPT-3.5, 速度较快，能力一般'
  },
  {
    value: 'gpt-4',
    desc: '遥遥领先'
  },
  {
    value: 'gpt-4-coze',
    desc: '支持画图，速度相对gpt4较慢'
  },
  {
    value: 'gemini',
    desc: 'google的辣鸡模型，凑活用'
  }
]
const selectMode = ref('')
const contentRef = ref<any>(null)
const historyDrawer = ref<boolean>(false) // 历史记录弹窗
const sessionId = ref('') //  当前会话Id
const context = ref<any>([]) // 当前会话上下文
watch(selectMode, (val) => {
  localStorage.mode = val
})

// 根据timeStr距离当前最近的时间，获取上一次的历史记录
const initLastInfo = () => {
  const historyInfo = JSON.parse(localStorage.historyInfo || '[]')
  const lastIndex = historyInfo.findIndex((item: any) => item.isLast)
  if (lastIndex > -1) {
    const { mode, context: con, sessionId: uuid } = historyInfo[lastIndex]
    sessionId.value = uuid
    selectMode.value = mode
    context.value = con
  } else {
    sessionId.value = uuidv4()
    selectMode.value = 'gpt-3.5-turbo'
    context.value = []
  }
}
initLastInfo()

const addNewSession = () => {
  if (contentRef.value) {
    context.value = []
    sessionId.value = uuidv4()
    contentRef.value.clearChat()
  }
}
// 切换历史记录
const navToHistory = (item: any) => {
  const { mode, context: con, sessionId: uuid } = item
  sessionId.value = uuid
  selectMode.value = mode
  context.value = con
}
// 保存历史记录
const saveHistory = (context: { role: string; content: string }[]) => {
  console.log('save history', context)
  if (context.length === 0) return
  const historyInfo = JSON.parse(localStorage.historyInfo || '[]')
  const historyIndex = historyInfo.findIndex((item: any) => item.sessionId === sessionId.value)
  historyInfo.forEach((item: any) => {
    item.isLast = false
  })
  const item = {
    sessionId: sessionId.value,
    mode: selectMode.value,
    timeStr: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    title: context[0].content,
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
:deep(.hljs) {
  padding: 6px;
}

.chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 260px;
  background: linear-gradient(0deg, #abbaab, #ffffff);
  padding: 20px 20px 110px 20px;
  box-sizing: border-box;
  .mode-select {
    display: flex;
    align-items: center;

    label {
      margin-right: 6px;
      color: #666666;
      flex-shrink: 0;
    }
  }
}
.bottom_wrap {
  position: fixed;
  bottom: 0;
  right: 0;
  white-space: nowrap;
  padding: 0 20px 20px 0;
  button {
    padding: 8px;
  }
}
</style>
