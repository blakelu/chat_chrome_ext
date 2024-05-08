<template>
  <div class="message" :class="{ 'is-self': isUser }">
    <div class="avatar" :class="{ 'avatar-left': isUser, 'avatar-right': isAssistant }">
      <img :src="realMessage.avatar" />
    </div>
    <div class="content" :class="{ 'content-assistant': isAssistant }">
      <div v-if="realMessage.content?.type == 'audio'">
        <audio controls>
          <source :src="realMessage.content.audioUrl" type="audio/mpeg" />
        </audio>
        <a :href="realMessage.content.audioUrl" target="_blank" download="audio.mp3" class="block mt-2 pl-2 font-[500] text-[#2761ff]"
          >下载音频(暂不支持历史记录)</a
        >
      </div>
      <div v-else v-html="md.render(realMessage.content)"></div>
      <el-icon v-if="isAssistant && loading" style="margin-top: 4px" class="is-loading" color="#333">
        <ep-loading />
      </el-icon>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { md } from '@/composables/markdown'

const props = defineProps({
  message: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: true
  }
})
const realMessage = ref<any>({})

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
</script>

<style lang="less" scoped>
.avatar-left {
  margin-left: 10px;
}

.avatar-right {
  margin-right: 10px;
}

.content-assistant {
  background-color: #d9e8f5 !important;
}

.message {
  &:not(:last-child) {
    margin-bottom: 14px;
  }
  display: flex;
  align-items: center;
  // margin-bottom: 14px;
}

.message.is-self {
  flex-direction: row-reverse;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar img {
  width: 100%;
  height: 100%;
}

.content {
  font-size: 13px;
  font-family: PingFangSC-Regular;
  color: #333333;
  background-color: #ffffff;
  padding: 8px 12px;
  border-radius: 10px;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.1);
  max-width: 85%;
  word-wrap: break-word;
  overflow-x: auto;
}

.content.is-self {
  background-color: #efefef;
}

.content.is-self:before {
  content: '';
  display: inline-block;
  position: relative;
  bottom: -1px;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 10px 10px 0;
  border-color: transparent #efefef transparent transparent;
  margin-right: 10px;
}
</style>
