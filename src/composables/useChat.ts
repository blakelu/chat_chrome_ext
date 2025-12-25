import { ref, computed, watch, unref } from 'vue'
import OpenAI from 'openai'
import { useAppStorage } from './useAppStorage.ts'
import { ElMessage } from 'element-plus'

// Import assets
import USER_AVATAR from '@/assets/icons/user.png'
import ASSISTANT_AVATAR from '@/assets/icons/ai.png'

export function useChat() {
  // Interfaces
  interface Message {
    id: number
    role: string
    avatar: string
    content: string | any
    title?: string
    errorMessage?: string
  }

  interface SubmitMessage {
    role: string
    content: string | any
    title?: string
  }

  // State
  const chatMessages = ref<Message[]>([])
  const chatContext = ref<SubmitMessage[]>([])
  const inputMessage = ref<string>('')
  const loading = ref(false)
  const initialLoading = ref(false)
  const selectedText = ref('')
  const hiddenText = ref('') // 不展示在聊天记录中的文本
  const picList = ref<string[]>([])
  const selectedRole: any = useAppStorage('selectedRole', null)

  // Storage
  const apiInfo: any = useAppStorage('API_INFO', { apiKey: '', apiUrl: '' })
  const selectMode = useAppStorage('model', '')
  const settings = ref({
    temperature: 0.7,
    limitContext: 6,
    stream: true,
    prompt: '',
    blinkoUrl: '',
    blinkoToken: ''
  })
  const commonSettings = useAppStorage('COMMON_SETTINGS', settings.value)

  // watch(apiInfo, (newValue, oldValue) => {
  //   if (newValue.apiKey !== oldValue.apiKey || newValue.apiUrl !== oldValue.apiUrl) {
  //     initOpenAI()
  //   }
  // })
  // OpenAI client
  let openai: any = null

  // Initialize OpenAI client
  const initOpenAI = async () => {
    let baseURL = unref(apiInfo).apiUrl
    if (baseURL.endsWith('/')) {
      baseURL = baseURL
    } else if (baseURL.endsWith('#')) {
      baseURL = baseURL.slice(0, -1)
    } else {
      baseURL = baseURL + '/v1'
    }
    openai = new OpenAI({
      baseURL,
      apiKey: unref(apiInfo).apiKey,
      dangerouslyAllowBrowser: true
    })
    return openai
  }

  // Create a message object
  function createMessage(id: number, role: string, avatar: string, content: string | any, title: string = '') {
    return {
      id,
      role,
      avatar,
      content,
      title
    }
  }

  // Initialize chat with provided context
  const initChat = (context = []) => {
    chatContext.value = [...context]
    chatMessages.value = context.map((item: any, index: number) => {
      return {
        ...item,
        id: index + 1,
        avatar: item.role === 'user' ? USER_AVATAR : ASSISTANT_AVATAR
      }
    })
  }

  // Clear chat
  const clearChat = () => {
    chatMessages.value = []
    chatContext.value = []
  }
  const toolsObj = new Map([
    ['总结页面', '请阅读以下页面内容，并用简明扼要的语言对其进行总结，要求包括主要观点、重要细节和核心结论，总结应突出页面的重点信息'],
    [
      '总结页面并结合SVG展示',
      '请阅读以下页面内容，并用简明扼要的语言对其进行总结，要求包括主要观点、重要细节和核心结论，总结应突出页面的重点信息，并结合页面内容设计一段精美的SVG代码，svg的x，y尽量用百分比，不要固定值，使得无论多少分辨率的容器都能显示全，用来视觉化表达总结内容。SVG应具备良好的美观性和代表性,整体排版要有呼吸感.'
    ],
    ['解释', 'Please explain clearly and concisely in Chinese'],
    [
      '翻译',
      'Rewrite the text in triple quotes in Chinese. Only give me the translation and nothing else. Do not wrap responses in quotes.'
    ],
    [
      '润色',
      'Please polish and refine the following text to improve its clarity, coherence, and fluency. Correct any grammatical, spelling, or punctuation errors, and enhance the vocabulary and sentence structure where appropriate. Ensure the tone remains [formal/informal/academic/professional, etc.] and the original meaning is preserved。Respond in the same language as the original text'
    ]
  ])
  // Format prompt messages
  function formatPromptMessages(context) {
    if (!Array.isArray(context) || context.length === 0) {
      return []
    }

    const result = []

    for (let i = 0; i < context.length; i++) {
      const { role, content } = context[i]

      // 跳过无效项
      if (!role || content === undefined) {
        continue
      }

      // 处理数组类型内容（推理或多模态）
      if (Array.isArray(content)) {
        const reasoningItem = content.find((item) => item?.type === 'reasoning')
        if (reasoningItem) {
          const textItem = content.find((item) => item?.type === 'text')
          if (textItem) {
            result.push({ role, content: textItem.content })
          }
        } else {
          result.push({ role, content })
        }
        continue
      }

      // 处理对象类型内容
      if (content && typeof content === 'object') {
        const { type, isQuote, isHidden } = content

        // 处理音频内容
        if (type === 'audio') {
          if (result.length > 0) {
            result.pop()
          }
          continue
        }

        // 处理引用内容
        if (isQuote) {
          const { content: text, quote, hiddenText } = content
          const toolText = toolsObj?.get?.(text) || text

          if (isHidden && hiddenText) {
            result.push({ role, content: `${toolText}\n${hiddenText}` })
          } else if (quote) {
            result.push({ role, content: `${toolText}:\n${quote}` })
          } else {
            result.push({ role, content: text })
          }
          continue
        }
      }

      // 处理普通文本内容
      result.push({ role, content })
    }

    return result
  }

  // Prepare a custom prompt with system instructions and context
  function prepareCustomPrompt() {
    const limitContext = commonSettings.value.limitContext + 1
    const customPrompt = formatPromptMessages([...chatContext.value.slice(-limitContext)])
    if (selectedRole.value?.prompt) {
      customPrompt.unshift({ role: 'system', content: selectedRole.value.prompt })
    }
    const list = customPrompt.map((item) => {
      const { title, ...rest } = item
      return rest
    })
    return list
  }

  // Handle different model types
  async function handleModelResponse(content: any, temporaryMessageId: number, customPrompt: any, voice: string = 'zh-CN-XiaoxiaoNeural') {
    if (selectMode.value === 'dall-e-3') {
      await handleDallEModelResponse(content, temporaryMessageId)
    } else if (['tts-1', 'tts-1-hd', 'tts-az-1'].includes(selectMode.value)) {
      await handleTTSModelResponse(content, temporaryMessageId, voice)
    } else {
      await handleChatModelResponse(customPrompt, temporaryMessageId)
    }
  }

  // Handle DALL-E image generation
  async function handleDallEModelResponse(content: any, temporaryMessageId: number) {
    const { dalleSize: size, dalleStyle: style, quality } = commonSettings.value
    const image = await openai.images.generate({ model: selectMode.value, prompt: content, size, style, quality })
    let url = ''
    if (image.data[0].url) {
      url = `![image](${image.data[0].url})`
    } else if (image.data[0].b64_json) {
      url = `![image](data:image/jpeg;base64,${image.data[0].b64_json})`
    }
    updateMessageAndContext(temporaryMessageId - 1, url)
  }

  // Handle TTS audio generation
  async function handleTTSModelResponse(content: any, temporaryMessageId: number, voice: string) {
    const mp3 = await openai.audio.speech.create({
      model: selectMode.value,
      voice: voice,
      input: content
    })
    const response = new Response(mp3.body)
    const audioBlob = await response.blob()
    const audioUrl = URL.createObjectURL(audioBlob)
    const data = { type: 'audio', audioUrl }
    updateMessageAndContext(temporaryMessageId - 1, data)
  }

  // Helper function to initialize reasoning structure
  function initializeReasoningStructure(messageIndex: number, existingContent: string = '') {
    return [
      { type: 'reasoning', content: '' },
      { type: 'text', content: existingContent }
    ]
  }

  // Helper function to add content to message
  function addContentToMessage(messageIndex: number, content: string, isReasoning: boolean, isTextPart: boolean = false) {
    if (isReasoning) {
      const targetIndex = isTextPart ? 1 : 0
      chatMessages.value[messageIndex].content[targetIndex].content += content
    } else {
      if (typeof chatMessages.value[messageIndex].content === 'string') {
        chatMessages.value[messageIndex].content += content
      } else {
        chatMessages.value[messageIndex].content = content
      }
    }
  }

  // Helper function to process think tag content
  function processThinkTagContent(content: string, messageIndex: number, isReasoning: boolean, isInThinkTag: boolean, thinkBuffer: string) {
    let newIsReasoning = isReasoning
    let newIsInThinkTag = isInThinkTag
    let newThinkBuffer = thinkBuffer
    let shouldContinue = false

    // Handle opening <think> tag
    if (content.includes('<think>')) {
      const parts = content.split('<think>')
      if (parts.length > 1) {
        // Process content before <think>
        if (parts[0]) {
          addContentToMessage(messageIndex, parts[0], newIsReasoning, true)
        }

        // Initialize reasoning mode if not already active
        if (!newIsReasoning) {
          newIsReasoning = true
          const existingContent =
            typeof chatMessages.value[messageIndex].content === 'string' ? chatMessages.value[messageIndex].content : ''
          chatMessages.value[messageIndex].content = initializeReasoningStructure(messageIndex, existingContent)
        }

        newIsInThinkTag = true
        newThinkBuffer = parts[1] || ''
        shouldContinue = true
      }
    }

    // Handle closing </think> tag
    if (content.includes('</think>') && !shouldContinue) {
      // const parts = content.split('</think>')
      // if (parts.length > 1) {
      //   // Add final reasoning content
      //   newThinkBuffer += parts[0]
      //   if (newIsReasoning && chatMessages.value[messageIndex].content[0]) {
      //     chatMessages.value[messageIndex].content[0].content += newThinkBuffer
      //   }

      //   newIsInThinkTag = false
      //   newThinkBuffer = ''

      //   // Process content after </think>
      //   if (parts[1]) {
      //     addContentToMessage(messageIndex, parts[1], newIsReasoning, true)
      //   }
      newIsInThinkTag = false
      newThinkBuffer = ''
      shouldContinue = true
      // }
    }

    // Handle content inside think tags
    if (newIsInThinkTag && !shouldContinue) {
      newThinkBuffer += content
      if (newIsReasoning && chatMessages.value[messageIndex].content[0]) {
        chatMessages.value[messageIndex].content[0].content += content
      }
      shouldContinue = true
    }

    return {
      isReasoning: newIsReasoning,
      isInThinkTag: newIsInThinkTag,
      thinkBuffer: newThinkBuffer,
      shouldContinue
    }
  }

  // Handle chat completion
  async function handleChatModelResponse(customPrompt: any, temporaryMessageId: number) {
    const completion = await openai.chat.completions.create({
      model: selectMode.value,
      messages: customPrompt,
      temperature: commonSettings.value.temperature,
      stream: commonSettings.value.stream
    })

    let isReasoning = false
    let isInThinkTag = false
    let thinkBuffer = ''
    const messageIndex = temporaryMessageId - 1

    // 确保消息结构初始化
    if (!chatMessages.value[messageIndex]) {
      chatMessages.value[messageIndex] = { content: '' }
    }

    if (commonSettings.value.stream) {
      for await (const chunk of completion) {
        const reasoning_content = chunk.choices[0]?.delta?.reasoning_content || chunk.choices[0]?.delta?.reasoning
        const content = chunk.choices[0]?.delta?.content

        // Handle reasoning content (original logic)
        if (reasoning_content) {
          if (!isReasoning) {
            isReasoning = true
            chatMessages.value[messageIndex].content = initializeReasoningStructure(messageIndex)
          }
          chatMessages.value[messageIndex].content[0].content += reasoning_content
          continue
        }

        // Handle regular content
        if (content) {
          if (chunk.choices[0]?.finish_reason === 'stop') break

          // Check for <think> tag reasoning content
          const hasThinkTags = content.includes('<think>') || content.includes('</think>') || isInThinkTag

          if (hasThinkTags) {
            const result = processThinkTagContent(content, messageIndex, isReasoning, isInThinkTag, thinkBuffer)
            isReasoning = result.isReasoning
            isInThinkTag = result.isInThinkTag
            thinkBuffer = result.thinkBuffer

            if (result.shouldContinue) {
              continue
            }
          }

          // Handle regular content
          addContentToMessage(messageIndex, content, isReasoning, true)
        }
      }

      // Update context at the end
      chatContext.value.push({
        role: 'assistant',
        content: chatMessages.value[messageIndex].content
      })
    } else {
      const content = completion.choices[0]?.message?.content
      updateMessageAndContext(messageIndex, content)
    }
  }

  // Update message content and add to context
  function updateMessageAndContext(id: number, content: any) {
    chatMessages.value[id].content = content
    chatContext.value.push({ role: 'assistant', content })
  }

  // Prepare content based on type (text, images, quotes)
  function prepareContent(text: string, pics: string[] = []) {
    if (pics.length > 0) {
      const urls = pics.map((item) => ({
        type: 'image_url',
        image_url: {
          url: item,
          detail: 'auto'
        }
      }))
      return [{ type: 'text', text }, ...urls]
    }

    if (selectedText.value) {
      if (!hiddenText.value) {
        return {
          isQuote: true,
          quote: selectedText.value,
          content: text
        }
      } else {
        return {
          isQuote: true,
          isHidden: true,
          quote: selectedText.value,
          hiddenText: hiddenText.value,
          content: text
        }
      }
    }

    return text
  }

  // Add user message to chat
  function addUserMessage(content: any) {
    let title = content
    if (typeof content === 'object' && content?.isQuote) {
      title = content.content
    }
    chatMessages.value.push(createMessage(chatMessages.value.length + 1, 'user', USER_AVATAR, content))
    chatContext.value.push({ role: 'user', content, title })
    return chatMessages.value.length
  }

  // Add temporary assistant message
  function addAssistantMessage() {
    chatMessages.value.push(createMessage(chatMessages.value.length + 1, 'assistant', ASSISTANT_AVATAR, ''))
    return chatMessages.value.length
  }

  // Process user input and send to AI
  const sendMessage = async (content: string | any, voice: string = 'zh-CN-XiaoxiaoNeural') => {
    // if (loading.value) return

    // If no explicit content provided, use the current input message
    const messageContent = content || inputMessage.value
    if (!messageContent) return

    // Add user message
    addUserMessage(messageContent)
    inputMessage.value = ''
    picList.value = []

    // Add temporary assistant message for streaming response
    const temporaryMessageId = addAssistantMessage()

    // Prepare custom prompt
    const customPrompt = prepareCustomPrompt()

    loading.value = true

    try {
      await handleModelResponse(messageContent, temporaryMessageId, customPrompt, voice)
    } catch (error) {
      const errorMessage = error.message || 'something went wrong'
      updateMessageAndContext(temporaryMessageId - 1, errorMessage)
      ElMessage.error('请求失败: ' + errorMessage)
    } finally {
      loading.value = false
    }

    return chatMessages.value[temporaryMessageId - 1]
  }

  // Process a message with content preparation
  const processMessage = async (text: string, pics: string[] = [], voice: string = 'zh-CN-XiaoxiaoNeural') => {
    const content = prepareContent(text, pics)
    const result = await sendMessage(content, voice)

    // Clear selected text after processing
    selectedText.value = ''

    return result
  }

  // Retry a failed message
  const retryMessage = async (message: any, voice: string = 'zh-CN-XiaoxiaoNeural') => {
    // Find the failed message in chatMessages
    const failedMsgIndex = chatMessages.value.findIndex((m) => m.id === message.id)
    if (failedMsgIndex === -1) return

    // Remove the error message
    chatMessages.value.splice(failedMsgIndex, 1)

    // Find the context of the message (user's prompt)
    const userMsgIndex = chatContext.value.findIndex(
      (ctx) =>
        ctx.role === 'user' &&
        (ctx.content === message.content ||
          (Array.isArray(ctx.content) && ctx.content.some((c) => c.type === 'text' && c.text === message.content)))
    )

    if (userMsgIndex !== -1) {
      // Get the user's original prompt
      const userPrompt = chatContext.value[userMsgIndex]

      // Remove all messages after this one in context
      chatContext.value.splice(userMsgIndex + 1)

      // Handle this as a new message from the last user input
      const temporaryMessageId = addAssistantMessage()
      const customPrompt = prepareCustomPrompt()

      loading.value = true

      try {
        await handleModelResponse(userPrompt.content, temporaryMessageId, customPrompt, voice)
      } catch (error) {
        const errorMessage = error.message || 'something went wrong'
        updateMessageAndContext(temporaryMessageId - 1, errorMessage)
        ElMessage.error('重试失败: ' + errorMessage)
      } finally {
        loading.value = false
      }
    }
  }

  return {
    // State
    chatMessages,
    chatContext,
    inputMessage,
    loading,
    initialLoading,
    selectedText,
    hiddenText,
    picList,
    selectedRole,

    // Storage
    apiInfo,
    commonSettings,
    selectMode,

    // Assets
    USER_AVATAR,
    ASSISTANT_AVATAR,

    // Methods
    initOpenAI,
    initChat,
    clearChat,
    prepareContent,
    addUserMessage,
    addAssistantMessage,
    prepareCustomPrompt,
    formatPromptMessages,
    handleModelResponse,
    updateMessageAndContext,
    sendMessage,
    processMessage,
    retryMessage
  }
}
