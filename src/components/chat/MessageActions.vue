<template>
  <div class="toolbar">
    <div class="tools-left">
      <el-dropdown trigger="click" placement="top" @command="handleModelChange">
        <div class="choose-model" text>
          <span class="model-name">{{ model }}</span>
          <el-icon class="el-icon--right"><ep-arrow-down /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item v-for="m in modelOptions" :key="m" :command="m">
              {{ m }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <el-tooltip effect="dark" content="上传图片" placement="top">
        <el-button v-if="picCount < 7" class="tool-btn" text @click="$emit('upload-image')">
          <img src="/icons/upload.png" class="w-[20px]" alt="上传图片" />
        </el-button>
      </el-tooltip>
      <!-- <el-popover placement="top" popper-style="padding: 8px 12px;" trigger="click">
        <template #reference>
          <el-button v-if="model === 'dall-e-3'" class="tool-btn" text>
            <img src="/icons/picSetting.png" class="w-[20px]" alt="绘图设置" />
          </el-button>
        </template>
        <div class="setting-title">绘图设置</div>
        <el-radio-group v-model="settings.dalleStyle" size="small" class="setting-group">
          <el-radio value="vivid">生动</el-radio>
          <el-radio value="natural">真实</el-radio>
        </el-radio-group>
        <el-radio-group v-model="settings.quality" size="small" class="setting-group">
          <el-radio value="standard">标准</el-radio>
          <el-radio value="hd">精细</el-radio>
        </el-radio-group>
        <el-radio-group v-model="settings.dalleSize" size="small" class="setting-group">
          <el-radio value="1024x1024">1024x1024</el-radio>
          <el-radio value="1792x1024">1792x1024</el-radio>
          <el-radio value="1024x1792">1024x1792</el-radio>
        </el-radio-group>
      </el-popover>
      <el-tooltip effect="dark" content="创造性" placement="top">
        <el-popover placement="top" popper-style="padding: 8px 12px;" trigger="click">
          <template #reference>
            <el-button class="tool-btn" text>
              <img src="/icons/temperature.png" class="w-[20px]" alt="创造性设置" />
            </el-button>
          </template>
          <div class="setting-title">随机性,越大随机性越强</div>
          <el-slider v-model="settings.temperature" :max="1" :step="0.1" size="small" class="setting-slider" />
        </el-popover>
      </el-tooltip>

      <el-popover placement="top" popper-style="padding: 8px 12px;" trigger="click">
        <template #reference>
          <el-button class="tool-btn" text>
            <img src="/icons/limit.png" alt="历史消息设置" class="w-[20px]" />
          </el-button>
        </template>
        <div class="setting-title">携带历史消息数</div>
        <el-slider v-model="settings.limitContext" :max="30" size="small" class="setting-slider" />
      </el-popover>
      <el-tooltip effect="dark" content="角色扮演" placement="top">
        <el-button class="tool-btn" text @click="$emit('show-prompt-dialog')">
          <img src="/icons/mask.png" alt="角色扮演" class="w-[20px]" />
        </el-button>
      </el-tooltip> -->

      <!-- <el-tooltip effect="dark" content="导出对话" placement="top">
        <el-button 
          class="tool-btn"
          text
          @click="$emit('show-export-dialog')"
          :disabled="!hasMessages"
        >
          <el-icon size="18"><ep-download /></el-icon>
        </el-button>
      </el-tooltip> -->
    </div>

    <div class="tools-right">
      <!-- <ThemeToggle class="tool-btn" @change="$emit('theme-change', $event)" /> -->
      <el-tooltip effect="dark" content="设置" placement="top">
        <el-button class="tool-btn" text @click="$emit('show-settings')">
          <el-icon size="20"><ep-setting /></el-icon>
        </el-button>
      </el-tooltip>
      <el-tooltip effect="dark" content="清空对话" placement="top">
        <el-button class="tool-btn" text @click="$emit('clear-chat')">
          <el-icon size="20"><ep-delete/> </el-icon>
        </el-button>
      </el-tooltip>
      <el-tooltip effect="dark" content="历史记录" placement="top">
        <el-button class="tool-btn" text @click="$emit('show-history')">
          <el-icon size="20"><ep-clock /></el-icon>
        </el-button>
      </el-tooltip>
      <el-tooltip effect="dark" content="新对话" placement="top">
        <el-button class="tool-btn new-chat" text @click="$emit('new-chat')">
          <!-- <el-icon size="20"><ep-circle-plus-filled /></el-icon> -->
           <img src="/icons/newChat.png" class="w-[20px]" alt="新对话" />
        </el-button>
      </el-tooltip>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'

const props = defineProps({
  settings: {
    type: Object,
    required: true
  },
  model: {
    type: String,
    default: 'gpt-3.5-turbo'
  },
  picCount: {
    type: Number,
    default: 0
  },
  hasMessages: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'upload-image',
  'clear-chat',
  'show-history',
  'new-chat',
  'show-settings',
  'show-prompt-dialog',
  'show-export-dialog',
  'theme-change',
  'update:model'
])

const defaultModels = ref([
  'gpt-4o-mini',
  'gpt-4o',
  'gpt-4o-2024-08-06',
  'o3-mini',
  'claude-3-5-sonnet-20240620',
  'claude-3-7-sonnet-20250219',
  'dall-e-3',
  'tts-az-1'
])

const modelOptions = useStorage('modelList', defaultModels, localStorage, {
  mergeDefaults: (storageValue, defaults) => Array.from(new Set([...storageValue, ...defaults]))
})

const handleModelChange = (value) => {
  emit('update:model', value)
}

onMounted(() => {
  console.log('Toolbar mounted')
})
</script>

<style lang="less" scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  padding-bottom: 12px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 12px;
  margin-bottom: 4px;
  
  .el-button + .el-button {
    margin-left: 0;
  }

  .tools-left,
  .tools-right {
    display: flex;
    align-items: center;
    gap: 4px;
    .el-dropdown {
      line-height: 1.2;
    }
  }
  
  .choose-model {
    display: flex;
    align-items: center;
    padding: 6px 10px;
    border-radius: 10px;
    background-color: rgba(0, 0, 0, 0.02);
    border: 1px solid rgba(0, 0, 0, 0.03);
    margin-right: 4px;
    transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1.0);
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.04);
      transform: translateY(-1px);
    }
    
    .model-name {
      font-size: 13px;
      font-weight: 500;
      letter-spacing: -0.01em;
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: #333;
    }
  }

  .tool-btn {
    padding: 8px;
    border-radius: 10px;
    transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1.0);

    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
      transform: translateY(-1px);
    }
    
    &:active {
      transform: translateY(0);
      background-color: rgba(0, 0, 0, 0.08);
    }
    
    &.new-chat {
      background-color: rgba(0, 122, 255, 0.08);
      
      &:hover {
        background-color: rgba(0, 122, 255, 0.12);
      }
    }
  }
}

.setting-title {
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  letter-spacing: -0.01em;
}

.setting-group {
  margin-bottom: 10px;
  
  :deep(.el-radio) {
    margin-right: 12px;
    
    .el-radio__label {
      font-size: 13px;
    }
  }
}

.setting-slider {
  width: 200px;
  
  :deep(.el-slider__runway) {
    height: 4px;
  }
  
  :deep(.el-slider__bar) {
    height: 4px;
    background-color: #007AFF;
  }
  
  :deep(.el-slider__button) {
    width: 16px;
    height: 16px;
    border: 2px solid #007AFF;
  }
}
</style>
