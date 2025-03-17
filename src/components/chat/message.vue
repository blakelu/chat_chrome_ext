<template>
  <div class="message" :class="{ 'is-self': isUser }">
    <div class="avatar" :class="{ 'avatar-left': isUser, 'avatar-right': isAssistant }">
      <img :src="realMessage.avatar" />
    </div>
    <div class="flex flex-col max-w-[85%]">
      <div class="content" :class="{ 'content-assistant': isAssistant }">
        <div v-if="realMessage.content?.type == 'audio'" class="audio-content">
          <audio controls>
            <source :src="realMessage.content.audioUrl" type="audio/mpeg" />
          </audio>
          <a :href="realMessage.content.audioUrl" target="_blank" download="audio.mp3" class="download-link">下载音频(暂不支持历史记录)</a>
        </div>
        <div v-else v-html="md.render(realMessage.content)" class="markdown-content"></div>
        <el-icon v-if="isAssistant && loading" class="loading-icon" color="#333"><ep-Loading /></el-icon>
      </div>
      <div class="actions" v-if="isAssistant">
        <el-button class="tool-btn" text @click="handleCopy">
          <el-icon size="16"><ep-copyDocument /></el-icon>
        </el-button>
        <el-button class="tool-btn" text @click="handleShare">
          <el-icon size="16"><ep-share /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
  <share-modal v-if="showShareModal" :messages="messagesForShare" @close="showShareModal = false" />
</template>

<script lang="ts" setup>
import md from '@/composables/markdown.ts'
import { ref, computed, watch } from 'vue'
import ShareModal from './ShareModal.vue'

const props = defineProps({
  message: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: true
  },
  allMessages: {
    type: Array,
    default: () => []
  }
})

const realMessage = ref<any>({})
const showShareModal = ref(false)

const formatMessage = async (val: any) => {
  const { content } = val
  if (Array.isArray(content)) {
    const textInfo = content.find((item) => item.type === 'text')
    const imageList = content.filter((item) => item.type === 'image_url').map((item) => item.image_url.url)
    const imgs = imageList.map((item) => `![image](${item})`).join('\n')
    realMessage.value = {
      ...val,
      content: `${imgs}\n${textInfo?.text}`
    }
    return
  } else if (content?.type === 'audio') {
    realMessage.value = {
      avatar: val.avatar,
      content: {
        type: 'audio',
        audioUrl: content.audioUrl
      }
    }
    return
  }
  realMessage.value = val
}
watch(
  () => props.message,
  (val) => {
    formatMessage(val)
  },
  { immediate: true }
)

const isUser = computed(() => props.message.role === 'user')

const isAssistant = computed(() => props.message.role === 'model' || props.message.role === 'assistant')

const handleCopy = () => {
  navigator.clipboard.writeText(realMessage.value.content)
  ElMessage.success('已复制')
}

const messagesForShare = computed(() => {
  const currentIndex = props.allMessages.findIndex((msg) => msg.id === props.message.id)
  return currentIndex >= 0 ? props.allMessages.slice(0, currentIndex + 1) : [props.message]
})

const handleShare = () => {
  showShareModal.value = true
}
</script>

<style lang="less" scoped>
.avatar-left {
  margin-left: 6px;
}

.avatar-right {
  margin-right: 6px;
}

.content-assistant {
  padding-bottom: 0 !important;
  background-color: transparent !important;
  color: #1a1a1a !important;
}

.message {
  &:not(:last-child) {
    margin-bottom: 16px;
  }
  display: flex;
  align-items: flex-start;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-1px);
  }
}

.message.is-self {
  flex-direction: row-reverse;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  // box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  // border: 2px solid #fff;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.content {
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  color: #333333;
  background-color: #f7f8f9;
  padding: 4px 8px;
  border-radius: 8px;
  // max-width: 85%;
  word-wrap: break-word;
  overflow-x: visible;
  position: relative;

  .audio-content {
    display: flex;
    flex-direction: column;
    gap: 8px;

    audio {
      width: 100%;
      border-radius: 8px;
    }

    .download-link {
      font-size: 13px;
      color: #3b82f6;
      text-decoration: none;
      display: inline-flex;
      align-items: center;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .markdown-content {
    :deep(p) {
      padding: 0.5em 0;
    }

    :deep(pre) {
      border-radius: 8px;
      margin: 10px 0;
    }

    :deep(code) {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 0.9em;
    }

    :deep(img) {
      border-radius: 8px;
      max-width: 100%;
    }
  }

  .loading-icon {
    margin-top: 6px;
    font-size: 16px;
    animation: rotate 1.5s infinite;
  }
}

.actions {
  display: flex;
  transition: opacity 0.2s;
  .el-button + .el-button {
    margin-left: 0;
  }
  .tool-btn {
    color: #999999;
    padding: 0 8px;
    border-radius: 6px;
    transition:
      background-color 0.2s,
      transform 0.2s;

    &:hover {
      background-color: rgba(0, 0, 0, 0.04);
      transform: translateY(-1px);
    }
  }
}

.arrow {
  width: 0;
  height: 0;
  border-style: solid;
  position: absolute;
  top: 14px;
}

.arrow-left {
  border-width: 8px 8px 8px 0;
  border-color: transparent #ecf5fe transparent transparent;
  left: -8px;
}

.arrow-right {
  border-width: 8px 0 8px 8px;
  border-color: transparent transparent transparent #ffffff;
  right: -8px;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
