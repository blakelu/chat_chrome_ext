<template>
  <div class="chat">
    <div class="mode-select">
      <label>选择模型：</label>
      <el-radio-group v-model="selectMode" placeholder="请选择模型" size="small">
        <el-radio v-for="item in options" :label="item">{{ item }}</el-radio>
      </el-radio-group>
    </div>
    <Chatgpt :model="selectMode" v-if="selectMode != 'gemini'" />
    <Gemini v-else />
  </div>
</template>

<script lang="ts" setup>
import Chatgpt from './chat/index.vue'
import Gemini from './gemini/index.vue'

const options = ['gpt-3.5-turbo', 'gpt-4', 'gemini']

const historyMode = localStorage.mode || 'gpt-3.5-turbo'
const selectMode = ref(historyMode)
watch(selectMode, (val) => {
    console.log(val);

    localStorage.mode = val
})
</script>

<style lang="less" scoped>
:deep(.hljs) {
  padding: 6px;
}

.chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 260px;
  background: linear-gradient(0deg, #abbaab, #ffffff);
  padding: 20px 20px 110px 20px;

  .mode-select {
    display: flex;
    align-items: center;

    label {
      margin-right: 6px;
      color: #666666;
    }
  }
}
</style>
