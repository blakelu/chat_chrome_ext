import { ref, computed, watch, unref } from 'vue'
import OpenAI from 'openai'
import { useStorage } from '@vueuse/core'
import { ElMessage } from 'element-plus'

// Import assets
import USER_AVATAR from '@/assets/icons/user.png'
import ASSISTANT_AVATAR from '@/assets/icons/ROBOT.png'


export function useChat() {
  // Interfaces
  interface Message {
    id: number
    role: string
    avatar: string
    content: string | any
    errorMessage?: string
  }

  interface SubmitMessage {
    role: string
    content: string | any
  }

  // State
  const chatMessages = ref<Message[]>([])
  const chatContext = ref<SubmitMessage[]>([])
  const inputMessage = ref<string>('')
  const loading = ref(false)
  const initialLoading = ref(false)
  const selectedText = ref('')
  const picList = ref<string[]>([])

  // Storage
  const API_KEY = useStorage('GPT_API_KEY', '')
  const API_URL = useStorage('GPT_API_URL', '')
  const selectMode = useStorage('mode', 'gpt-4o')
  const settings = ref({
    temperature: 0.7,
    limitContext: 6,
    quality: 'standard',
    dalleSize: '1024x1024',
    dalleStyle: 'vivid',
    stream: true,
    prompt: ''
  })
  const commonSettings = useStorage('COMMON_SETTINGS', settings, localStorage, { mergeDefaults: true })

  // OpenAI client
  let openai: any = null
  
  // Initialize OpenAI client
  const initOpenAI = async () => {
    const baseURL = `${API_URL.value}${API_URL.value === 'https://models.inference.ai.azure.com' ? '' : '/v1'}`
    openai = new OpenAI({ 
      baseURL, 
      apiKey: API_KEY.value, 
      dangerouslyAllowBrowser: true 
    })
    return openai
  }

  // Create a message object
  function createMessage(id: number, role: string, avatar: string, content: string | any) {
    return {
      id,
      role,
      avatar,
      content
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

  // Format prompt messages
  function formatPromptMessages(context) {
    let result = []

    for (let i = 0; i < context.length; i++) {
      const isAudio = Object.prototype.toString.call(context[i].content) === '[object Object]' && context[i].content.type === 'audio'
      const isQuote = context[i].content?.isQuote
      const hasNext = i + 1 < context.length
      const isArrayAndWrongModelForNext = hasNext && Array.isArray(context[i].content)

      if (isAudio) {
        if (i > 0) {
          result.pop()
        }
      } else if (isArrayAndWrongModelForNext) {
        i++
      } else if (isQuote) {
        const { role, content: contentObj } = context[i]
        result.push({ role, content: `${contentObj.content}\n${contentObj.quote}` })
      } else {
        result.push(context[i])
      }
    }

    return result
  }

  // Prepare a custom prompt with system instructions and context
  function prepareCustomPrompt() {
    const limitContext = commonSettings.value.limitContext + 1
    const customPrompt = formatPromptMessages([...chatContext.value.slice(-limitContext)])
    if (commonSettings.value.prompt) {
      customPrompt.unshift({ role: 'system', content: commonSettings.value.prompt })
    }
    return customPrompt
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
    const url = `![image](${image.data[0].url})`
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

  // Handle chat completion
  async function handleChatModelResponse(customPrompt: any, temporaryMessageId: number) {
    const completion = await openai.chat.completions.create({
      model: selectMode.value,
      messages: customPrompt,
      temperature: commonSettings.value.temperature,
      stream: commonSettings.value.stream
    })

    if (commonSettings.value.stream) {
      for await (const chunk of completion) {
        const content = chunk.choices[0]?.delta?.content
        if (!content) continue
        if (chunk.choices[0]?.finish_reason === 'stop') break
        chatMessages.value[temporaryMessageId - 1].content += content
      }
      chatContext.value.push({ role: 'assistant', content: chatMessages.value[temporaryMessageId - 1].content })
    } else {
      const content = completion.choices[0]?.message?.content
      updateMessageAndContext(temporaryMessageId - 1, content)
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
      return {
        isQuote: true,
        quote: selectedText.value,
        content: text
      }
    }
    
    return text
  }

  // Add user message to chat
  function addUserMessage(content: any) {
    chatMessages.value.push(createMessage(chatMessages.value.length + 1, 'user', USER_AVATAR, content))
    chatContext.value.push({ role: 'user', content })
    return chatMessages.value.length
  }

  // Add temporary assistant message
  function addAssistantMessage() {
    chatMessages.value.push(createMessage(chatMessages.value.length + 1, 'assistant', ASSISTANT_AVATAR, ''))
    return chatMessages.value.length
  }

  // Process user input and send to AI
  const sendMessage = async (content: string | any, voice: string = 'zh-CN-XiaoxiaoNeural') => {
    if (loading.value) return
    
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
    picList,
    
    // Storage
    API_KEY,
    API_URL,
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
