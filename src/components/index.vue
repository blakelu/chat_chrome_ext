<template>
  <div class="chat">
    <div class="mode-select">
      <label>选择模型：</label>
      <el-radio-group v-model="selectMode" placeholder="请选择模型" size="small">
        <el-radio v-for="item in options" :label="item.value">
          <el-tooltip class="box-item" effect="dark" :content="item.desc" placement="bottom"> {{ item.value }}</el-tooltip>
        </el-radio>
      </el-radio-group>
    </div>
    <Chatgpt :model="selectMode" v-if="selectMode != 'gemini'" />
    <Gemini v-else />
  </div>
</template>

<script lang="ts" setup>
import Chatgpt from './chat/index.vue'
import Gemini from './gemini/index.vue'

const options = [
  {
    value: 'gpt-3.5-turbo',
    desc: 'GPT-3.5, 速度较快，能力一般'
  },
  {
    value: 'gpt-4',
    desc: '遥遥领先'
  },
  {
    value: 'gpt-4-coze',
    desc: '支持画图，速度相对gpt4较慢'
  },
  {
    value: 'gemini',
    desc: 'google的辣鸡模型，凑活用'
  }
]

const historyMode = localStorage.mode || 'gpt-3.5-turbo'
const selectMode = ref(historyMode)
watch(selectMode, (val) => {
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
  box-sizing: border-box;
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
