<template>
  <div class="choose-dialog">
    <el-dialog v-model="dialogVisible" title="提示" width="80%">
      <el-tabs v-model="apiSelectedValue" type="card" editable @edit="handleTabsEdit">
        <el-tab-pane v-for="item in apiList" :key="item.name" :label="item.title" :name="item.name">
          <el-input v-model="item.API_URL" placeholder="请输入Api url" />
          <el-input v-model="item.API_KEY" placeholder="请输入Api key" />
          <div class="text-[12px] text-[#2761ff]">
            <a href="https://burn.hair/register?aff=ac6k" target="_blank">获取我的API Key</a>
            <a href="https://api1.zhtec.xyz/register?aff=8fuF" target="_blank" class="ml-[10px]">获取我的API Key</a>
            <a href="https://gptgod.online/#/register?invite_code=37n35elx0pt5p99lxoxysiaky" target="_blank" class="ml-[10px]">获取我的API Key</a>
          </div>
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="handleConfirm"> 确认 </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { TabPaneName } from 'element-plus'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['update:show', 'confirm'])

const dialogVisible = useVModel(props, 'show', emit)
const apiList = useStorage('apiList', [
  {
    title: 'api1',
    name: '1',
    API_URL: 'https://chatapi.ylsagi.io',
    API_KEY: '1'
  },
  {
    title: 'api2',
    name: '2',
    API_URL: 'https://chat.flss.world/api/openai',
    API_KEY: 'nk-2311676378'
  }
])
const apiSelectedValue = ref(localStorage.getItem('apiSelectedValue') || '1')
const handleTabsEdit = async (targetName: TabPaneName | undefined, action: 'remove' | 'add') => {
  if (action === 'add') {
    let tabIndex = apiList.value.length
    const newTabName = `${++tabIndex}`
    apiList.value.push({
      title: `api${tabIndex}`,
      name: newTabName,
      API_URL: '',
      API_KEY: ''
    })
    apiSelectedValue.value = newTabName
  } else if (action === 'remove') {
    const res = await ElMessageBox.confirm('确认删除吗?', '提示', {
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      type: 'warning'
    })
    if (res) {
      const tabs = apiList.value
      let activeName = apiSelectedValue.value
      if (activeName === targetName) {
        tabs.forEach((tab, index) => {
          if (tab.name === targetName) {
            const nextTab = tabs[index + 1] || tabs[index - 1]
            if (nextTab) {
              activeName = nextTab.name
            }
          }
        })
      }

      apiSelectedValue.value = activeName
      apiList.value = tabs.filter((tab) => tab.name !== targetName)
    }
  }
}
const handleConfirm = () => {
  dialogVisible.value = false
  localStorage.setItem('apiSelectedValue', apiSelectedValue.value)
  emit('confirm', {
    API_URL: apiList.value[Number(apiSelectedValue.value) - 1].API_URL,
    API_KEY: apiList.value[Number(apiSelectedValue.value) - 1].API_KEY
  })
}
</script>
<style lang="less" scoped>
.choose-dialog {
  :deep(.el-tabs__content) {
    padding: 12px;
    background: #fafafa;
  }
}

.el-input {
  margin-bottom: 10px;
}
</style>
