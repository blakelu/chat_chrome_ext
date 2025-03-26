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
        @openSettings="settingsDrawer = true"
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
    
    <!-- 设置面板
    <el-drawer
      v-model="settingsDrawer"
      title="会话设置"
      direction="rtl"
      size="320px"
    >
      <div class="settings-panel">
        <div class="settings-section">
          <div class="section-title">基础设置</div>
          
          <div class="setting-item">
            <span class="setting-label">流式输出</span>
            <el-switch v-model="commonSettings.stream" />
          </div>
          
          <div class="setting-item">
            <span class="setting-label">温度</span>
            <div class="setting-control">
              <el-slider 
                v-model="commonSettings.temperature" 
                :min="0" 
                :max="2" 
                :step="0.1" 
                show-input
              />
            </div>
          </div>
          
          <div class="setting-item">
            <span class="setting-label">上下文限制</span>
            <div class="setting-control">
              <el-input-number 
                v-model="commonSettings.limitContext" 
                :min="1" 
                :max="20" 
                size="small" 
              />
            </div>
          </div>

          <div class="setting-item" v-if="selectMode.includes('dall-e')">
            <span class="setting-label">图像尺寸</span>
            <div class="setting-control">
              <el-select v-model="commonSettings.dalleSize" size="small">
                <el-option label="1024x1024" value="1024x1024" />
                <el-option label="1024x1792" value="1024x1792" />
                <el-option label="1792x1024" value="1792x1024" />
              </el-select>
            </div>
          </div>

          <div class="setting-item" v-if="selectMode.includes('dall-e')">
            <span class="setting-label">图像风格</span>
            <div class="setting-control">
              <el-radio-group v-model="commonSettings.dalleStyle" size="small">
                <el-radio-button label="vivid">生动</el-radio-button>
                <el-radio-button label="natural">自然</el-radio-button>
              </el-radio-group>
            </div>
          </div>
        </div>
        
        <div class="settings-section">
          <div class="section-title">系统提示词</div>
          <el-input
            v-model="commonSettings.prompt"
            type="textarea"
            :rows="4"
            placeholder="可以设定AI的角色和行为规则..."
          />
        </div>
      </div>
    </el-drawer> -->
    
    <!-- Keyboard shortcut info modal -->
    <el-dialog
      v-model="keyboardHelpVisible"
      title="键盘快捷键"
      width="360px"
      class="keyboard-help-dialog"
    >
      <div class="keyboard-shortcuts-list">
        <div class="shortcut-item" v-for="shortcut in shortcuts" :key="shortcut.keys.join('-')">
          <div class="shortcut-description">{{ shortcut.description }}</div>
          <KeyboardShortcut :keys="shortcut.keys" />
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="keyboardHelpVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'
import Chatgpt from './chat/index.vue'
import History from './history/index.vue'
import KeyboardShortcut from './common/KeyboardShortcut.vue'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts.ts'
import { Plus, Setting, Document, Microphone } from '@element-plus/icons-vue'


const selectMode = useStorage('mode', 'gpt-4o')
const contentRef = ref<any>(null)
const historyDrawer = ref<boolean>(false) // 历史记录弹窗
const settingsDrawer = ref<boolean>(false) // 设置面板
const sessionId = ref('') //  当前会话Id
const currentContext = ref<any>([]) // 当前会话上下文
const ttsvoice = ref('zh-CN-henan-YundengNeural')
const keyboardHelpVisible = ref(false)

// Define keyboard shortcuts
const shortcuts = [
  { keys: ['Ctrl', 'Shift', 'I'], description: '打开侧边栏' },
  { keys: ['Ctrl', '/'], description: '显示快捷键帮助' },
  { keys: ['Ctrl', 'N'], description: '新建对话' },
  { keys: ['Ctrl', 'Enter'], description: '发送消息' },
  { keys: ['Ctrl', 'H'], description: '显示历史记录' },
  { keys: ['Ctrl', ','], description: '打开设置' },
  { keys: ['Esc'], description: '关闭弹窗' },
  { keys: ['Tab'], description: '自动补全' }
]

// Register keyboard shortcuts
useKeyboardShortcuts([
  {
    key: '/',
    ctrlKey: true,
    handler: () => {
      keyboardHelpVisible.value = true
    },
    description: '显示快捷键帮助'
  },
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
      settingsDrawer.value = true
    },
    description: '打开设置'
  },
  {
    key: 'Escape',
    handler: () => {
      keyboardHelpVisible.value = false
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
