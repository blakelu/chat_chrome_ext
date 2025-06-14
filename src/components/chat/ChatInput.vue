<template>
  <div class="custom-textarea">
    <!-- 添加选中文本显示区域 -->
    <div v-if="selectedText" class="selected-text">
      <div class="text-content">{{ selectedText }}</div>
      <el-icon size="24" class="close-icon" @click="clearSelectedText"><ep-close-bold /></el-icon>
    </div>
    <div v-if="picList.length" class="image-preview-container">
      <div v-for="(url, index) in picList" :key="url" class="image-preview">
        <el-image
          :src="url"
          fit="cover"
          :preview-src-list="picList"
          :initial-index="index"
          :preview-teleported="true"
          hide-on-click-modal
          class="preview-image"
          alt="上传的图片"
        />
        <el-icon size="16" class="delete-icon" @click="handleDeletePic(index)"><ep-close-bold /></el-icon>
      </div>
    </div>
    <div class="input-container">
      <el-input
        v-model="inputValue"
        type="textarea"
        ref="inputRef"
        :rows="4"
        placeholder="请输入您的问题，ctrl+enter发送"
        @keydown.ctrl.enter="$emit('send')"
        @keydown.meta.enter="$emit('send')"
        @keydown.up.prevent="$emit('load-previous')"
        @keydown.escape="$emit('escape')"
        @compositionstart="$emit('composition-start')"
        @compositionend="$emit('composition-end')"
        @focus="focused = true"
        @blur="focused = false"
        aria-label="聊天输入框"
      ></el-input>
      <div class="input-actions">
        <img src="@/assets/icons/send.svg" class="enter-icon" @click="$emit('send')" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  picList: {
    type: Array,
    default: () => []
  },
  // 新增选中文本的属性
  selectedText: {
    type: String,
    default: ''
  }
})

const emit = defineEmits([
  'update:modelValue',
  'update:picList',
  'send',
  'load-previous',
  'escape',
  'composition-start',
  'composition-end',
  'voice-result',
  'voice-error',
  'delete-pic',
  'update:selectedText' // 新增事件
])

const inputRef = ref<HTMLInputElement | null>(null)

const handlePaste = (event: ClipboardEvent) => {
  const items = event.clipboardData?.items
  if (!items) return

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (item.kind === 'file' && item.type.startsWith('image/')) {
      const file = item.getAsFile()
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          emit('update:picList', [...props.picList, e.target?.result])
        }
        reader.readAsDataURL(file)
        event.preventDefault()
      }
    }
  }
}
onMounted(() => {
  nextTick(() => {
    // 获取 el-input 组件内部的 textarea 元素
    const textareaElement = inputRef.value?.$el?.querySelector('textarea')
    if (textareaElement) {
      textareaElement.addEventListener('paste', handlePaste)
    }
  })
})

onUnmounted(() => {
  // 清理事件监听器
  const textareaElement = inputRef.value?.$el?.querySelector('textarea')
  if (textareaElement) {
    textareaElement.removeEventListener('paste', handlePaste)
  }
})

const focused = ref(false)
const inputValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const handleDeletePic = (index: number) => {
  emit('delete-pic', index)
}

const clearSelectedText = () => {
  emit('update:selectedText', '')
}

// Expose public methods
defineExpose({
  focus: () => inputRef.value?.focus()
})
</script>

<style lang="less" scoped>
.custom-textarea {
  border-radius: 16px;
  overflow: visible;
  background-color: rgba(0, 0, 0, 0.02);
  position: relative;
  transition: box-shadow 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
  box-shadow: 0 1px 12px rgba(0, 0, 0, 0.04);

  &:focus-within {
    box-shadow: 0 0 0 1px rgba(0, 122, 255, 0.3);
  }

  // 添加选中文本的样式
  .selected-text {
    border-radius: 12px 12px 0 0;
    padding: 10px 12px;
    font-size: 12px;
    color: #666666;
    position: relative;
    display: flex;
    justify-content: space-between;
    letter-spacing: -0.01em;

    .text-content {
      flex-grow: 1;
      white-space: pre-wrap;
      padding-right: 10px;
      border-left: 3px solid #007aff;
      padding-left: 10px;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      /* 限制显示3行 */
      overflow: hidden;
      text-overflow: ellipsis;

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-thumb {
        background-color: rgba(0, 0, 0, 0.1);
        border-radius: 6px;
      }
    }

    .close-icon {
      color: #888;
      cursor: pointer;
      padding: 6px;
      border-radius: 50%;
      transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);

      &:hover {
        background-color: rgba(0, 0, 0, 0.06);
        transform: scale(1.1);
      }

      &:active {
        background-color: rgba(0, 0, 0, 0.1);
        transform: scale(1);
      }
    }
  }

  .input-container {
    position: relative;
  }

  .input-actions {
    position: absolute;
    right: 12px;
    bottom: 12px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .image-preview-container {
    padding: 14px;
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    background-color: rgba(0, 0, 0, 0.02);
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }

  .image-preview {
    position: relative;
    width: 68px;
    height: 68px;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    transition: transform 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);

    &:hover {
      transform: scale(1.03);
    }

    .preview-image {
      width: 100%;
      height: 100%;
      border-radius: 8px;
      object-fit: cover;
    }

    .delete-icon {
      position: absolute;
      top: -6px;
      right: -6px;
      background-color: rgba(0, 0, 0, 0.7);
      color: #fff;
      border-radius: 50%;
      padding: 4px;
      cursor: pointer;
      z-index: 2;
      transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);

      &:hover {
        background-color: rgba(220, 38, 38, 0.9);
        transform: scale(1.1);
      }

      &:active {
        transform: scale(1);
      }
    }
  }

  .closeai-textarea {
    :deep(.closeai-textarea__inner) {
      padding: 14px 48px 14px 16px;
      resize: none;
      font-size: 15px;
      line-height: 1.5;
      letter-spacing: -0.01em;
      transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
      border-radius: 16px !important;
      border-color: transparent;

      &:hover {
        box-shadow: 0 0 0 1px rgba(0, 122, 255, 0.3);
        // background-color: #f9fafb;
      }

      &:focus {
        box-shadow: 0 0 0 1px rgba(0, 122, 255, 0.3);
        // background-color: #f9fafb;
      }
    }
  }

  .enter-icon {
    cursor: pointer;
    width: 30px;
    padding: 6px;
    border-radius: 50%;
    transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);

    &:hover {
      transform: translateY(-2px) scale(1.1);
      background-color: rgba(0, 122, 255, 0.1);
    }

    &:active {
      transform: translateY(0) scale(1);
      background-color: rgba(0, 122, 255, 0.2);
    }
  }
}

.keyboard-shortcuts {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding-top: 8px;
  color: var(--app-text-secondary);
  font-size: 12px;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.6;
  }

  100% {
    opacity: 1;
  }
}
</style>
