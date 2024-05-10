<template>
  <div class="choose_api">
    <div class="text-[12px] text-[#2761ff]">
      <a href="https://burn.hair/register?aff=ac6k" target="_blank">获取我的API Key</a>
      <a href="https://attractive-bibbie-smnet3-c5142d1c.koyeb.app/register?aff=5B0Y" target="_blank" class="ml-[10px]">获取我的API Key</a>
      <a href="https://api1.zhtec.xyz/register?aff=8fuF" target="_blank" class="ml-[10px]">获取我的API Key</a>
    </div>
    <div ref="apiListRef">
      <div v-for="(item, index) in apiList" :key="index" class="list-item" :class="{ active: item.selected }">
        <img
          :src="item.selected ? selected : unselect"
          class="w-[18px] h-[18px] mr-[10px] cursor-pointer'"
          @click="handleClick(item, index)"
        />
        <div class="flex-1">
          <el-input v-model="item.API_URL" size="small" placeholder="请输入Api Url" />
          <el-input v-model="item.API_KEY" size="small" placeholder="请输入Api Key" class="mt-[8px]" />
          <el-input v-model="item.remark" size="small" placeholder="请输入备注" class="mt-[8px]" />
        </div>
        <el-icon v-if="apiList.length > 1" size="16" color="#666" class="ml-[10px] cursor-pointer" @click="handleDelete(item, index)"
          ><ep-delete
        /></el-icon>
      </div>
      <div class="flex justify-center mt-[10px]">
        <el-button type="primary" @click="handleAdd">添加</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import selected from '@/assets/icons/selected.png'
import unselect from '@/assets/icons/unselect.png'
import { useDraggable, type UseDraggableReturn } from 'vue-draggable-plus'

const emit = defineEmits(['confirm'])
const apiListRef = ref()
const apiList = useStorage('apiList', [
  {
    API_URL: 'https://chatapi.ylsagi.io',
    API_KEY: '1',
    remark: '仅支持gpt-3.5-turbo',
    selected: true
  },
])

useDraggable(apiListRef, apiList, { animation: 150, handle: '.list-item' })

const handleAdd = () => {
  apiList.value.push({
    API_URL: '',
    API_KEY: '',
    remark: '',
    selected: false
  })
}

const handleClick = (item: any, index: number) => {
  apiList.value.forEach((item: any) => {
    item.selected = false
  })
  item.selected = true
  emit('confirm', {
    API_URL: item.API_URL,
    API_KEY: item.API_KEY
  })
}

const handleDelete = async (item: any, index: number) => {
  const res = await ElMessageBox.confirm('Are you sure to delete?', 'tip', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning'
  })
  if (res === 'confirm') {
    if (item.selected) {
      const nextIndex = index > 0 ? index - 1 : index + 1
      const nextSelected = apiList.value[nextIndex]
      nextSelected.selected = true
      emit('confirm', {
        API_URL: nextSelected.API_URL,
        API_KEY: nextSelected.API_KEY
      })
    }
    apiList.value.splice(index, 1)
  }
}
</script>
<style lang="less" scoped>
.list-item {
  margin: 16px 0;
  padding: 12px 10px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  background-color: #fafafa;
  display: flex;
  align-items: center;
  cursor: move;
  &:hover {
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
}
.active {
  border: 1px solid #2da7e0;
}
</style>
