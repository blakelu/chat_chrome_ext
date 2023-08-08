<template>
  <div class="message" :class="{ 'is-self': isUser }">
    <div class="avatar" :class="{ 'avatar-left': isUser, 'avatar-right': isAssistant }">
      <img :src="message.avatar" />
    </div>
    <div class="content" :class="{ 'content-user': isUser, 'content-assistant': isAssistant }">
      <div v-html="md.render(message.content)"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { md } from '@/composables/markdown'

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
})

const isUser = computed(() => props.message.role === 'user')

const isAssistant = computed(() => props.message.role === 'assistant')

</script>

<style lang="less" scoped>
.avatar-left {
  margin-left: 10px;
}

.avatar-right {
  margin-right: 10px;
}

.content-user {
  background: #5d5cde;
  color: white !important;
}

.content-assistant {
  background: #efefef;
}

.message {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.message.is-self {
  flex-direction: row-reverse;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar img {
  width: 100%;
  height: 100%;
}

.content {
  color: #333;
  padding: 0 10px;
  border-radius: 10px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  max-width: 80%;
  word-wrap: break-word;
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
