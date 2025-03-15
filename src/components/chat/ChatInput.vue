<template>
  <div class="custom-textarea">
    <div v-if="picList.length" class="image-preview-container">
      <div v-for="(url, index) in picList" :key="url" class="image-preview">
        <el-image
          :src="url"
          fit="cover"
          :preview-src-list="picList"
          :initial-index="index"
          hide-on-click-modal
          class="preview-image"
          alt="上传的图片"
        />
        <el-icon
          size="16"
          class="delete-icon"
          @click="handleDeletePic(index)"
        ><ep-close-bold /></el-icon>
      </div>
    </div>
    <div class="input-container">
      <el-input
        v-model="inputValue"
        type="textarea"
        ref="inputRef"
        :rows="4"
        :placeholder="inputPlaceholder"
        @keydown.ctrl.enter="$emit('send')"
        @keydown.meta.enter="$emit('send')"
        @keydown.tab.prevent="$emit('auto-complete')"
        @keydown.up.prevent="$emit('load-previous')"
        @keydown.escape="$emit('escape')"
        @compositionstart="$emit('composition-start')"
        @compositionend="$emit('composition-end')"
        @focus="focused = true"
        @blur="focused = false"
        aria-label="聊天输入框"
      ></el-input>
      <div class=input-actions>
        <el-icon size="26" @click="$emit('send')" class="enter-icon"><ep-promotion /></el-icon>
      </div>
      <!-- <div class="input-actions">
        <VoiceInput 
          v-if="hasAudioPermission" 
          @result="$emit('voice-result', $event)" 
          @error="$emit('voice-error', $event)"
          @start="voiceRecording = true"
          @stop="voiceRecording = false"
          class="voice-input-btn"
        />
        <el-tooltip v-if="!voiceRecording" :content="focused ? 'Ctrl+Enter 发送' : '发送消息'" placement="top">
          <el-icon size="22" @click="$emit('send')" class="enter-icon"><ep-promotion /></el-icon>
        </el-tooltip>
        <div v-else class="recording-badge" role="status" aria-live="polite">录音中...</div>
      </div> -->
    </div>
  </div>
  <div v-if="!isMobile" class="keyboard-shortcuts">
    <KeyboardShortcut keys="Ctrl+Enter" title="发送消息" class="shortcut" />
    <KeyboardShortcut keys="Tab" title="自动补全" class="shortcut" />
    <KeyboardShortcut keys="↑" title="重用上一条消息" class="shortcut" />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import VoiceInput from '@/components/common/VoiceInput.vue';
import KeyboardShortcut from '@/components/common/KeyboardShortcut.vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  picList: {
    type: Array,
    default: () => []
  },
  hasAudioPermission: {
    type: Boolean,
    default: true
  },
  isMobile: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([
  'update:modelValue',
  'update:picList',
  'send',
  'auto-complete',
  'load-previous',
  'escape',
  'composition-start', 
  'composition-end',
  'voice-result',
  'voice-error',
  'delete-pic'
]);

const inputRef = ref(null);
const focused = ref(false);
const voiceRecording = ref(false);

const inputValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const inputPlaceholder = computed(() => {
  if (props.isMobile) return '输入问题...';
  return '请输入您的问题，Ctrl+Enter发送，Tab自动补全';
});

const handleDeletePic = (index) => {
  emit('delete-pic', index);
};
// Expose public methods
defineExpose({
  focus: () => inputRef.value?.focus()
});
</script>

<style lang="less" scoped>
.custom-textarea {
  border-radius: 12px;
  overflow: visible;
  background-color: #fff;
  position: relative;
  transition: box-shadow 0.2s;
  
  &:focus-within {
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }

  .input-container {
    position: relative;
  }
  
  .input-actions {
    position: absolute;
    right: 12px;
    bottom: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .image-preview-container {
    padding: 12px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .image-preview {
    position: relative;
    width: 60px;
    height: 60px;
    
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
      background-color: rgba(0,0,0,0.6);
      color: #fff;
      border-radius: 50%;
      padding: 3px;
      cursor: pointer;
      z-index: 2;
      transition: background-color 0.2s;
      
      &:hover {
        background-color: rgba(220,38,38,0.8);
      }
    }
  }

  .el-textarea {
    :deep(.el-textarea__inner) {
      padding: 12px 16px 12px 16px;
      padding-right: 90px;
      resize: none;
      font-size: 14px;
      line-height: 1.6;
      transition: background-color 0.2s;
      border-radius: 12px;

      &:hover {
        box-shadow: none;
        background-color: #f9fafb;
      }

      &:focus {
        box-shadow: none;
        background-color: #f9fafb;
      }
    }
  }

  .enter-icon {
    cursor: pointer;
    padding: 6px;
    border-radius: 50%;
    transition: transform 0.2s, background-color 0.2s;
    
    &:hover {
      transform: translateY(-2px) scale(1.1);
      background-color: #dbeafe;
    }
  }

  .recording-badge {
    background-color: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    animation: pulse 2s infinite;
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
  0% { opacity: 1; }
  50% { opacity: 0.6; }
  100% { opacity: 1; }
}
</style>
