<template>
  <div class="toolbar">
    <div class="tools-left">
      <div class="choose-model" @click="$emit('show-choose-model')">
        <span class="model-name">{{ model }}</span>
        <img src="@/assets/icons/down.svg" class="w-[16px]" alt="选择模型" />
      </div>

      <el-tooltip effect="dark" content="上传图片" placement="top" append-to="#closeAI-app">
        <el-button v-if="picCount < 7" class="tool-btn" text @click="$emit('upload-image')">
          <img src="@/assets/icons/upload.svg" class="w-[16px]" alt="上传图片" />
        </el-button>
      </el-tooltip>
    </div>

    <div class="tools-right">
      <el-tooltip effect="dark" content="设置" placement="top">
        <el-button class="tool-btn" text @click="$emit('show-settings')">
          <img src="@/assets/icons/setting.svg" class="w-[16px]" alt="设置" />
        </el-button>
      </el-tooltip>
      <el-tooltip effect="dark" content="清空对话" placement="top" append-to="#closeAI-app">
        <el-button class="tool-btn" text @click="$emit('clear-chat')">
          <img src="@/assets/icons/clear.svg" class="w-[16px]" alt="清空对话" />
        </el-button>
      </el-tooltip>
      <el-tooltip effect="dark" content="历史记录" placement="top" append-to="#closeAI-app">
        <el-button class="tool-btn" text @click="$emit('show-history')">
          <img src="@/assets/icons/history.svg" class="w-[16px]" alt="历史记录" />
        </el-button>
      </el-tooltip>
      <el-tooltip effect="dark" content="新对话" placement="top" append-to="#closeAI-app">
        <el-button class="tool-btn new-chat" text @click="$emit('new-chat')">
          <img src="@/assets/icons/newChat.png" class="w-[16px]" alt="新对话" />
        </el-button>
      </el-tooltip>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
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
  'show-choose-model',
])
</script>

<style lang="less" scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  padding-bottom: 4px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 12px;
  margin-bottom: 4px;

  .closeai-button + .closeai-button {
    margin-left: 0;
  }

  .tools-left,
  .tools-right {
    display: flex;
    align-items: center;
    gap: 4px;
    .closeai-dropdown {
      line-height: 1.2;
    }
  }

  .choose-model {
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 6px 10px;
    border-radius: 10px;
    background-color: rgba(0, 0, 0, 0.02);
    border: 1px solid rgba(0, 0, 0, 0.03);
    margin-right: 4px;
    transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);

    &:hover {
      background-color: rgba(0, 0, 0, 0.04);
      transform: translateY(-1px);
    }

    .model-name {
      font-size: 12px;
      font-weight: 500;
      letter-spacing: -0.01em;
      max-width: 180px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: #333;
    }
  }

  .tool-btn {
    padding: 8px;
    border-radius: 10px;
    transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);

    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
      background-color: rgba(0, 0, 0, 0.08);
    }

    &.new-chat {
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

  :deep(.closeai-radio) {
    margin-right: 12px;

    .closeai-radio__label {
      font-size: 13px;
    }
  }
}

.setting-slider {
  width: 200px;

  :deep(.closeai-slider__runway) {
    height: 4px;
  }

  :deep(.closeai-slider__bar) {
    height: 4px;
    background-color: #007aff;
  }

  :deep(.closeai-slider__button) {
    width: 16px;
    height: 16px;
    border: 2px solid #007aff;
  }
}
</style>
