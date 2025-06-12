<template>
  <div v-if="realMessage.content?.isQuote" class="closeAI-quote-container">
    <div v-html="md.render(realMessage.content.quote)" class="quote-content"></div>
  </div>
  <div class="closeAI-message" :class="{ 'is-self': isUser }">
    <div class="avatar" :class="{ 'avatar-left': isUser }">
      <img :src="realMessage.avatar" />
    </div>
    <div class="content-container" :class="{ 'is-self': isUser }">
      <div :class="{ 'content-assistant': isAssistant }" class="content">
        <div v-if="realMessage.content?.type == 'audio'" class="audio-content">
          <audio controls>
            <source :src="realMessage.content.audioUrl" type="audio/mpeg" />
          </audio>
          <a :href="realMessage.content.audioUrl" target="_blank" download="audio.mp3" class="download-link">下载音频(暂不支持历史记录)</a>
        </div>
        <div v-else-if="realMessage.content?.isQuote" v-html="md.render(realMessage.content.content)" class="markdown-content"></div>
        <div v-else class="markdown-content" ref="markdownContentRef">
          <el-collapse v-if="realMessage.reasonContent" accordion v-model="collapseValue">
            <el-collapse-item title="推理过程" name="reasoning">
              <div v-html="md.render(realMessage.reasonContent)" class="text-[#666]"></div>
            </el-collapse-item>
          </el-collapse>
          <div v-if="realMessage.content" v-html="md.render(realMessage.content)"></div>
        </div>
        <el-icon v-if="isAssistant && loading" class="loading-icon" :color="uiSettings.theme === 'dark' ? '#fff' : '#333'"
          ><ep-Loading
        /></el-icon>
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
import ShareModal from './ShareModal.vue'

interface MessageContent {
  type: 'text' | 'image_url' | 'reasoning' | 'audio'
  text?: string
  content?: string
  image_url?: { url: string }
}

interface AudioContent {
  type: 'audio'
  audioUrl: string
}

interface MessageInput {
  content: MessageContent[] | AudioContent | string
  avatar?: string
  [key: string]: any
}

interface FormattedMessage {
  content: string | { type: 'audio'; audioUrl: string }
  reasonContent?: string
  avatar?: string
  [key: string]: any
}

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
const uiSettings: any = useStorage('UI_SETTINGS', [])
const realMessage = ref<any>({})
const collapseValue = ref('reasoning')
const showShareModal = ref(false)
const markdownContentRef = ref<HTMLElement | null>(null)

const formatMessage = (val: MessageInput): FormattedMessage => {
  const { content } = val

  try {
    // 处理数组类型的内容
    if (Array.isArray(content)) {
      return handleArrayContent(val, content)
    }

    // 处理音频内容
    if (content && typeof content === 'object' && content.type === 'audio') {
      return handleAudioContent(val, content)
    }

    // 处理字符串内容
    if (typeof content === 'string') {
      return handleStringContent(val, content)
    }

    // 默认情况直接返回原值
    return val as FormattedMessage
  } catch (error) {
    console.error('Error formatting message:', error)
    return val as FormattedMessage
  }
}

const handleArrayContent = (val: MessageInput, content: MessageContent[]): FormattedMessage => {
  const textInfo = content.find((item) => item.type === 'text')
  const imageList = content
    .filter((item) => item.type === 'image_url')
    .map((item) => item.image_url?.url)
    .filter(Boolean) as string[]

  // 处理推理内容
  const reasonContent = content.find((item) => item.type === 'reasoning')
  if (reasonContent) {
    let processedContent = textInfo?.content || ''

    // 在推理逻辑中添加SVG处理
    processedContent = processSvgContent(processedContent)

    return {
      ...val,
      reasonContent: reasonContent?.content,
      content: processedContent
    }
  }

  // 处理图片内容
  if (imageList.length > 0) {
    const imgs = imageList.map((url) => `![image](${url})`).join('\n')

    return {
      ...val,
      content: `${imgs}\n${textInfo?.text || ''}`
    }
  }

  return val as FormattedMessage
}

const handleAudioContent = (val: MessageInput, content: AudioContent): FormattedMessage => {
  return {
    avatar: val.avatar,
    content: {
      type: 'audio',
      audioUrl: content.audioUrl
    }
  }
}

const handleStringContent = (val: MessageInput, content: string): FormattedMessage => {
  // 处理artifact标签
  if (content.includes('<artifact type=')) {
    const modifiedContent = processArtifactContent(content)
    return {
      ...val,
      content: modifiedContent
    }
  }

  // 处理SVG标签
  if (content.includes('<svg')) {
    const modifiedContent = processSvgContent(content)
    return {
      ...val,
      content: modifiedContent
    }
  }
  return val as FormattedMessage
}

const processArtifactContent = (content: string): string => {
  return content.replace(/(<artifact[^>]*>)([\s\S]*?)(<\/artifact>)/g, '$1\n```xml\n$2\n```\n$3').replace(/<\/?artifact[^>]*>/g, '')
}

const processSvgContent = (content: string): string => {
  // 检查SVG标签是否已经被代码块包裹，如果没有则添加包裹
  return content.replace(/(?<!```[\s\S]*?)(<svg[\s\S]*?<\/svg>)(?![\s\S]*?```)/g, '```xml\n$1\n```')
}

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

// 修改SVG处理方法，隐藏代码块直接替换为图像
const processSvgInContent = async () => {
  await nextTick()
  if (!markdownContentRef.value) return
  const codeBlocks = markdownContentRef.value.querySelectorAll('pre code')
  codeBlocks.forEach((codeBlock) => {
    const codeContent = codeBlock.textContent || ''

    // 检测是否为SVG代码
    if (codeContent.trim().startsWith('<svg') && codeContent.includes('</svg>')) {
      // 清理SVG代码中可能存在的HTML注释
      const cleanedSvgCode = codeContent.replace(/<!--[\s\S]*?-->/g, '')

      // 创建SVG Blob URL
      const svgBlob = new Blob([cleanedSvgCode], { type: 'image/svg+xml' })
      const svgUrl = URL.createObjectURL(svgBlob)

      // 创建图像容器
      const svgContainer = document.createElement('div')
      svgContainer.className = 'svg-rendered-container'

      // 直接将SVG代码渲染到容器中
      svgContainer.innerHTML = cleanedSvgCode

      // 确保SVG元素具有正确的属性
      const svgElement = svgContainer.querySelector('svg')
      if (svgElement) {
        svgElement.setAttribute('width', '100%')
        // svgElement.setAttribute('height', 'auto')
        svgElement.classList.add('svg-rendered-image')
      }

      // 添加下载按钮
      const downloadButton = document.createElement('button')
      downloadButton.className = 'svg-download-button'
      downloadButton.textContent = '下载SVG'
      downloadButton.onclick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        const a = document.createElement('a')
        a.href = svgUrl
        a.download = 'image.svg'
        a.click()
        URL.revokeObjectURL(svgUrl) // 清理URL对象
      }
      svgContainer.appendChild(downloadButton)

      // 在代码块后添加SVG图像
      // const preElement = codeBlock.parentElement
      // if (preElement && preElement.parentElement) {
      //   preElement.parentElement.insertBefore(svgContainer, preElement.nextSibling)
      // }
      // 获取包含代码块的pre元素
      const preElement = codeBlock.closest('pre')
      if (preElement && preElement.parentElement) {
        // 替换代码块为SVG图像
        preElement.parentElement.replaceChild(svgContainer, preElement)
      }
    }
  })
}
watch(
  () => props.message,
  (val) => {
    realMessage.value = formatMessage(val)
    processSvgInContent()
  },
  { immediate: true, deep: true }
)
</script>

<style lang="less" scoped>
.theme-dark {
  .closeAI-message {
    .content {
      color: var(--app-text-color) !important;
      background-color: #3a3a3c !important;
    }
    .content-assistant {
      color: var(--app-text-color) !important;
      background-color: var(--app-card-bg) !important;
    }
  }
}
.closeAI-quote-container {
  display: flex;
  flex-direction: row-reverse;
  padding: 8px 44px 8px 8px;

  .quote-content {
    max-width: 90%;
    padding: 6px 12px;
    font-size: 13px;
    color: #666666;
    border-radius: 8px;
    border: 1px solid #f5f6f7;
    background-color: #fafafa;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  }
}

.closeAI-message {
  &:not(:last-child) {
    margin-bottom: 16px;
  }
  display: flex;
  align-items: flex-start;
  transition: transform 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);

  &:hover {
    transform: translateY(-1px);

    .actions {
      opacity: 1;
    }
  }
  :deep(.hljs) {
    margin: 8px 0;
    padding: 12px 10px;
    white-space: pre-wrap;
    border-radius: 8px;
  }

  .avatar-left {
    margin-left: 8px;
  }

  .content-assistant {
    background-color: transparent !important;
    color: #1a1a1a !important;
  }
  .avatar {
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
  .content-container {
    max-width: 88%;
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .content-container.is-self {
    flex: none;
    max-width: 84%;
    justify-content: flex-end;
  }
  .content {
    font-size: 14px;
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
    line-height: 1.5;
    letter-spacing: -0.01em;
    color: #333333;
    background-color: #f7f8f9;
    padding: 4px 10px;
    border-radius: 8px;
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
        margin-top: 4px;
      }

      .download-link {
        font-size: 13px;
        color: #007aff;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        padding: 4px 0;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .markdown-content {
      :deep(p) {
        margin: 0;
        padding: 6px 0;
        line-height: 1.5;
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
        height: 100px;
        width: auto;
      }
      :deep(hr) {
        margin-bottom: 4px;
      }
      :deep(.closeai-collapse) {
        border-top: none;
        .closeai-collapse-item__header {
          height: 34px;
        }
      }
      :deep(table) {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
        background-color: #fff;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        overflow: hidden;
        th {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-weight: 600;
          padding: 15px 12px;
          text-align: left;
          font-size: 14px;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #5a67d8;
        }

        td {
          padding: 12px 12px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 13px;
          line-height: 1.5;
          color: #2d3748;
          vertical-align: top;
        }

        tr:nth-child(even) {
          background-color: #f8fafc;
        }

        tr:nth-child(odd) {
          background-color: #ffffff;
        }

        tr:hover {
          background-color: #edf2f7;
          transition: all 0.2s ease;
        }

        td:first-child {
          font-weight: 600;
          color: #2b6cb0;
          background-color: rgba(59, 130, 246, 0.05);
          border-right: 2px solid #3b82f6;
        }

        td strong {
          color: #e53e3e;
          font-weight: 700;
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
          table {
            font-size: 12px;
          }

          th,
          td {
            padding: 8px 6px;
          }

          th {
            font-size: 12px;
          }
        }
        /* 边框圆角处理 */
        th:first-child {
          border-top-left-radius: 8px;
        }

        th:last-child {
          border-top-right-radius: 8px;
        }

        tr:last-child td:first-child {
          border-bottom-left-radius: 8px;
        }

        tr:last-child td:last-child {
          border-bottom-right-radius: 8px;
        }
      }
    }

    .loading-icon {
      margin-top: 6px;
      font-size: 16px;
      animation: rotate 2s linear infinite;
    }
  }

  .actions {
    display: flex;
    transition: opacity 0.2s;
    .closeai-button + .closeai-button {
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
}

.closeAI-message.is-self {
  flex-direction: row-reverse;
}

// 改为一直同速度旋转
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

// 确保样式穿透
:deep(.svg-rendered-container) {
  margin: 16px 0;
  padding: 16px;
  border-radius: 8px;
  background-color: #36393f;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #eaeaea;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

:deep(.svg-rendered-image) {
  width: 100%;
  height: auto !important;
  object-fit: contain;
  margin: 8px 0;
}

:deep(.svg-download-button) {
  margin-top: 12px;
  padding: 6px 12px;
  background-color: #e6f7ff;
  color: #0066cc;
  border: 1px solid #91caff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;

  &:hover {
    background-color: #bae0ff;
  }
}
</style>
