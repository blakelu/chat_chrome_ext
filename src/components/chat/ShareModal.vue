<template>
  <el-dialog v-model="dialogVisible" title="对话分享" fullscreen :before-close="handleClose" class="share-dialog">
    <div class="share-content-wrapper">
      <div ref="shareCardRef" class="share-card">
        <div class="share-header">
          <div class="share-title">closeAI 对话分享</div>
          <div class="share-time">{{ formattedDate }}</div>
        </div>

        <div class="share-body">
          <div v-for="(msg, index) in messages" :key="index">
            <div v-if="msg.content?.isQuote" class="quote-container">
              <div v-html="md.render(msg.content.quote || '')" class="quote-content"></div>
            </div>
            <div class="share-message" :class="{ 'is-self': msg.role === 'user' }">
              <div class="share-avatar" :class="{ 'avatar-left': msg.role === 'user' }">
                <img :src="msg.avatar" />
              </div>
              <div class="share-content" :class="{ 'content-assistant': isAssistant(msg) }">
                <div v-if="msg.content?.type === 'audio'" class="audio-content">[Audio Message]</div>
                <div v-else-if="Array.isArray(msg.content)" class="markdown-content">
                  <div v-for="(item, i) in msg.content.filter((i) => i.type === 'image_url')" :key="i">
                    <img :src="item.image_url?.url" class="share-image" />
                  </div>
                  <div>{{ msg.content.find((i) => i.type === 'text')?.text || '' }}</div>
                </div>
                <div v-else-if="msg.content?.isQuote" v-html="md.render(msg.content?.content || '')"></div>
                <div v-else class="markdown-content" v-html="md.render(msg.content || '')"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="share-footer">
          <div class="footer-content">
            <div class="footer-logo">closeAI</div>
            <div class="footer-divider"></div>
            <div class="footer-time">{{ formattedDate }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="share-actions">
      <el-button type="primary" size="default" @click="copyShareImage" :loading="generating"> 复制图片 </el-button>
      <el-button type="success" size="default" @click="downloadShareImage" :loading="generating"> 下载图片 </el-button>
    </div>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import domtoimage from 'dom-to-image'
import { ElMessage } from 'element-plus'
import md from '@/composables/markdown.ts'

const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close'])
const dialogVisible = ref(true)
const shareCardRef = ref(null)
const shareImage = ref('')
const generating = ref(false)

const isAssistant = (msg) => {
  return msg.role === 'model' || msg.role === 'assistant'
}

const formattedDate = computed(() => {
  return new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
})

const handleClose = () => {
  dialogVisible.value = false
  emit('close')
}

const generateImage = async () => {
  if (!shareCardRef.value) return null

  generating.value = true
  try {
    const dataUrl = await domtoimage.toPng(shareCardRef.value, {
      bgcolor: '#ffffff',
      quality: 1,
      width: shareCardRef.value.offsetWidth * 3,
      height: shareCardRef.value.offsetHeight * 3,
      scale: 3,
      style: {
        transform: 'scale(3)',
        transformOrigin: 'top left'
      }
    })

    shareImage.value = dataUrl
    generating.value = false
    return shareImage.value
  } catch (error) {
    console.error('Error generating image:', error)
    ElMessage.error('生成图片失败')
    generating.value = false
    return null
  }
}

const copyShareImage = async () => {
  const dataUrl = await generateImage()
  if (!dataUrl) return

  try {
    const blob = await fetch(dataUrl).then((res) => res.blob())
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    ElMessage.success('图片已复制到剪贴板')
  } catch (error) {
    console.error('Error copying image:', error)
    ElMessage.error('复制图片失败，请尝试下载')
  }
}

const downloadShareImage = async () => {
  const dataUrl = await generateImage()
  if (!dataUrl) return

  const link = document.createElement('a')
  link.href = dataUrl
  link.download = `AI-Chat-${new Date().getTime()}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  ElMessage.success('图片已开始下载')
}

onMounted(() => {
  // Generate image after modal is fully rendered
  nextTick(() => {
    generateImage()
  })
})
</script>

<style lang="less" scoped>
.share-dialog {
  :deep(.closeai-dialog__header) {
    padding: 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);

    .closeai-dialog__title {
      font-weight: 500;
      font-size: 16px;
      letter-spacing: -0.01em;
    }
  }

  :deep(.closeai-dialog__body) {
    padding: 16px;
  }
}

.share-content-wrapper {
  height: 85vh;
  overflow-y: auto;
  padding: 0 8px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 8px;
  }
}

.share-card {
  background: #fff;
  border-radius: 10px;
  margin: 0 auto;
  border: 1px solid rgba(0, 0, 0, 0.06);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
  overflow: hidden;
  transform: translateZ(0);
}

.share-header {
  padding: 14px 18px;
  background: linear-gradient(135deg, #3a86ff, #5e60ce, #7400b8);
  color: white;
  border-bottom: none;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.15), transparent 70%);
    pointer-events: none;
  }

  .share-title {
    font-weight: 600;
    font-size: 16px;
    letter-spacing: -0.01em;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .share-time {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.85);
    margin-top: 3px;
    font-weight: 300;
    letter-spacing: -0.01em;
  }
}

.share-body {
  padding: 8px 12px;
  background-color: #fff;
}

.share-message {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;

  &.is-self {
    flex-direction: row-reverse;
  }
}

.share-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.avatar-left {
  margin-left: 6px;
}

.share-content {
  font-size: 14px;
  line-height: 1.5;
  letter-spacing: -0.01em;
  color: #333333;
  background-color: #f1f3f5;
  padding: 4px 8px;
  border-radius: 10px;
  // max-width: 85%;
  word-wrap: break-word;
  overflow-x: visible;

  &.content-assistant {
    background-color: transparent !important;
    color: #1a1a1a !important;
  }

  .markdown-content {
    :deep(.hljs) {
      margin: 8px 0;
      padding: 12px 10px;
      white-space: pre-wrap;
      border-radius: 8px;
    }
    :deep(p) {
      margin: 0.5em 0;
    }

    :deep(pre) {
      border-radius: 8px;
      margin: 10px 0;
      overflow: hidden;
      white-space: pre-wrap;
    }

    :deep(code) {
      font-family: 'SF Mono', SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 0.9em;
    }

    :deep(img) {
      border-radius: 8px;
      max-width: 100%;
    }
  }
}

.share-footer {
  padding: 12px 18px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  background: linear-gradient(to right, #f9f9f9, #f3f4f6);

  .footer-content {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    height: 18px;
    color: #666;
  }

  .footer-logo {
    font-weight: 600;
    color: #007aff;
    letter-spacing: -0.02em;
  }

  .footer-divider {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background-color: #d1d5db;
    margin: 0 8px;
  }

  .footer-time {
    color: #888;
    font-size: 11px;
    letter-spacing: -0.01em;
  }
}

.share-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;

  .closeai-button {
    border-radius: 12px;
    padding: 10px 24px;
    font-size: 15px;
    font-weight: 500;
    letter-spacing: -0.01em;
    transition: all 0.25s cubic-bezier(0.25, 0.1, 0.25, 1);

    &:hover {
      transform: translateY(-2px);
    }

    &:active {
      transform: translateY(0);
    }
  }
}

.quote-container {
  display: flex;
  flex-direction: row-reverse;
  padding: 8px 44px 8px 8px;
  width: 100%;

  .quote-content {
    max-width: 90%;
    padding: 6px 12px;
    font-size: 13px;
    color: #666666;
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.04);
    background-color: #fafafa;
  }
}
</style>
