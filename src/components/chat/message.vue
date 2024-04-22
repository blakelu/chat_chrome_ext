<template>
  <div class="message" :class="{ 'is-self': isUser }">
    <div class="avatar" :class="{ 'avatar-left': isUser, 'avatar-right': isAssistant }">
      <img :src="message.avatar" />
    </div>
    <div class="content" :class="{ 'content-user': isUser, 'content-assistant': isAssistant }">
      <div v-html="md.render(message.content)"></div>
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

.content-user {
  // background: #b0daff !important;
  // color: #00274d !important;
  // background-color: #003366 !important;
  // color: #FFFFFF !important;
}

.content-assistant {
  // background: #e9f0f7 !important;
  // color: #333333 !important;
  // background-color: #cce8cc !important;
  // color: #205520 !important;
  background-color: #d9e8f5 !important;
}

.message {
  display: flex;
  align-items: center;
  margin-bottom: 14px;
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
  background-color: #FFFFFF;
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
