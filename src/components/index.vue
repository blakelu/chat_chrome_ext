<template>
  <div class="chat">
    <div class="chat-container">
      <Chatgpt
        ref="contentRef"
        :model="selectMode"
        :ttsvoice="ttsvoice"
        :context="currentContext"
        @showHistory="historyDrawer = true"
        @addNewSession="addNewSession"
        @clear="clearCurrentChat"
        @saveHistory="saveHistory"
        @changeModel="onChangeMode"
        @updateSelectMode="selectMode = $event"
        @updateTtsVoice="ttsvoice = $event"
      />
    </div>
    
    <!-- 历史记录 drawer -->
    <History 
      v-model:drawer="historyDrawer" 
      :sessionId="sessionId" 
      @navToHistory="navToHistory" 
      @reload="initLastInfo" 
    />
  </div>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs'
import { v4 as uuidv4 } from 'uuid'
import Chatgpt from './chat/index.vue'
import History from './history/index.vue'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts.ts'


const selectMode = useStorage('mode', 'gpt-4o')
const contentRef = ref<any>(null)
const historyDrawer = ref<boolean>(false) // 历史记录弹窗
const settingsDrawer = ref<boolean>(false) // 设置面板
const sessionId = ref('') //  当前会话Id
const currentContext = ref<any>([]) // 当前会话上下文
const ttsvoice = ref('zh-CN-henan-YundengNeural')

// Register keyboard shortcuts
useKeyboardShortcuts([
  {
    key: 'n',
    ctrlKey: true,
    handler: () => {
      addNewSession()
    },
    description: '新建对话'
  },
  {
    key: 'h',
    ctrlKey: true,
    handler: () => {
      historyDrawer.value = true
    },
    description: '显示历史记录'
  },
  {
    key: ',',
    ctrlKey: true,
    handler: () => {
      chrome?.runtime.openOptionsPage()
    },
    description: '打开设置'
  },
  {
    key: 'Escape',
    handler: () => {
      historyDrawer.value = false
      settingsDrawer.value = false
    },
    description: '关闭弹窗'
  }
])

// 根据timeStr距离当前最近的时间，获取上一次的历史记录
const initLastInfo = () => {
  const historyInfo = JSON.parse(localStorage.historyInfo || '[]')
  const lastIndex = historyInfo.findIndex((item: any) => item.isLast)
  if (lastIndex > -1) {
    const { mode, context: con, sessionId: uuid } = historyInfo[lastIndex]
    sessionId.value = uuid
    // selectMode.value = mode
    currentContext.value = con
  } else {
    sessionId.value = uuidv4()
    // selectMode.value = 'gpt-4o'
    currentContext.value = []
  }
}

// Initialize last session on component mount
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
    
    ElMessage({
      message: '已创建新对话',
      type: 'success',
      offset: 60
    })
  }
}

// 清除当前聊天内容
const clearCurrentChat = () => {
  currentContext.value = []
}

// 切换历史记录
const navToHistory = (item: any) => {
  if (item.isNew) {
    addNewSession()
    return
  }
  
  const { mode, context: con, sessionId: uuid } = item
  sessionId.value = uuid
  // selectMode.value = mode
  currentContext.value = con
}

// 保存历史记录
const saveHistory = (context: { role: string; content: string }[]) => {
  // if (context.length === 0) return
  const historyInfo = JSON.parse(localStorage.historyInfo || '[]')
  const historyIndex = historyInfo.findIndex((item: any) => item.sessionId === sessionId.value)
  historyInfo.forEach((item: any) => {
    item.isLast = false
  })
  const item = {
    sessionId: sessionId.value,
    // mode: selectMode.value,
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
  background-color: #f7f8f9;
  box-sizing: border-box;
  
  .chat-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    margin: 4px;
    padding: 10px 8px;
    border-radius: 12px;
    background-color: var(--app-bg-color);
  }
  
  .model-control-panel {
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--app-border-color);
    display: flex;
    justify-content: flex-end;
    
    .action-buttons {
      display: flex;
      gap: 8px;
    }
  }
  
  .settings-panel {
    padding: 16px;
    
    .settings-section {
      margin-bottom: 24px;
      
      .section-title {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 16px;
        color: var(--el-text-color-primary);
        padding-bottom: 8px;
        border-bottom: 1px solid var(--app-border-color);
      }
      
      .setting-item {
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        
        .setting-label {
          width: 80px;
          flex-shrink: 0;
          font-size: 14px;
          color: var(--el-text-color-regular);
        }
        
        .setting-control {
          flex-grow: 1;
        }
      }
    }
  }
  
  .keyboard-shortcuts-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    
    .shortcut-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid var(--app-border-color);
      
      &:last-child {
        border-bottom: none;
      }
      
      .shortcut-description {
        font-size: 14px;
        color: var(--app-text-color);
      }
    }
  }
}

.keyboard-help-dialog {
  :deep(.el-dialog__header) {
    padding: 16px 20px;
    margin-right: 0;
    border-bottom: 1px solid var(--app-border-color);
  }
  
  :deep(.el-dialog__headerbtn) {
    top: 16px;
  }
  
  :deep(.el-dialog__body) {
    padding: 20px;
  }
  
  :deep(.el-dialog__footer) {
    padding: 12px 20px;
    border-top: 1px solid var(--app-border-color);
  }
}
</style>
