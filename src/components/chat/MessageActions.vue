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
          <img src="@/assets/icons/upload.png" class="w-[20px]" alt="上传图片" />
        </el-button>
      </el-tooltip>
      <!-- <el-popover placement="top" popper-style="padding: 8px 12px;" trigger="click">
        <template #reference>
          <el-button v-if="model === 'dall-e-3'" class="tool-btn" text>
            <img src="@/assets/icons/picSetting.png" class="w-[20px]" alt="绘图设置" />
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
              <img src="@/assets/icons/temperature.png" class="w-[20px]" alt="创造性设置" />
            </el-button>
          </template>
          <div class="setting-title">随机性,越大随机性越强</div>
          <el-slider v-model="settings.temperature" :max="1" :step="0.1" size="small" class="setting-slider" />
        </el-popover>
      </el-tooltip>

      <el-popover placement="top" popper-style="padding: 8px 12px;" trigger="click">
        <template #reference>
          <el-button class="tool-btn" text>
            <img src="@/assets/icons/limit.png" alt="历史消息设置" class="w-[20px]" />
          </el-button>
        </template>
        <div class="setting-title">携带历史消息数</div>
        <el-slider v-model="settings.limitContext" :max="30" size="small" class="setting-slider" />
      </el-popover>
      <el-tooltip effect="dark" content="角色扮演" placement="top">
        <el-button class="tool-btn" text @click="$emit('show-prompt-dialog')">
          <img src="@/assets/icons/mask.png" alt="角色扮演" class="w-[20px]" />
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
           <img src="@/assets/icons/newChat.png" class="w-[20px]" alt="新对话" />
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
  'claude-3-5-sonnet-20240620',
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
  padding-bottom: 10px;
  .el-button + .el-button {
    margin-left: 0;
  }

  .tools-left,
  .tools-right {
    display: flex;
    align-items: center;
    gap: 2px;
    .el-dropdown {
      line-height: 1.2;
    }
  }
  .choose-model {
    display: flex;
    align-items: center;
    padding: 4px 6px;
    border-radius: 6px;
    background-color: rgba(0, 0, 0, 0.04);
    &:hover {
      background-color: rgba(0, 0, 0, 0.08);
    }
    .model-name {
      font-size: 12px;
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .tool-btn {
    padding: 6px;
    border-radius: 6px;
    transition:
      background-color 0.2s,
      transform 0.2s;

    &:hover {
      background-color: rgba(0, 0, 0, 0.04);
      transform: translateY(-1px);
    }

    &.new-chat {
      color: #3b82f6;

      &:hover {
        color: #2563eb;
      }
    }
  }
}

.setting-title {
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--app-text-color);
}

.setting-group {
  margin-bottom: 8px;
}

.setting-slider {
  width: 200px;
}
</style>
