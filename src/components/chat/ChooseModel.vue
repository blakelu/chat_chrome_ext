<template>
  <el-dialog v-model="show" title="选择模型" width="90%" :close-on-click-modal="false">
    <div class="search-container">
      <el-input v-model="searchQuery" placeholder="搜索模型..." prefix-icon="el-icon-search" clearable>
        <template #prefix>
          <el-icon><ep-search /></el-icon>
        </template>
      </el-input>
    </div>

    <div class="models-container">
      <div v-for="(api, index) in filteredApiList" :key="index" class="api-list">
        <div class="header">
          <span>{{ api.remark }}</span>
        </div>
        <div class="models-grid">
          <div v-for="(model, modelIndex) in api.modelList" :key="modelIndex" class="model-item" @click="selectModel(api, model)">
            <span class="model-name">{{ model }}</span>
          </div>
          <div v-if="api.modelList?.length === 0 || !api.modelList" class="text-center pt-12px">
            <el-button @click="navToConfig(api)">此api下无可用模型，立即配置</el-button>
          </div>
        </div>
      </div>

      <div v-if="filteredApiList?.length === 0" class="no-results">
        <el-empty description="没有找到匹配的模型" />
      </div>
    </div>
  </el-dialog>
</template>

<script lang="ts" setup>
import { useAppStorage } from '@/composables/useAppStorage.ts'
import { DefaultApiList } from '@/composables/statistics'

const props = defineProps<{
  showModal: boolean
}>()

const emit = defineEmits<{
  (e: 'update:showModal', value: boolean): void
  (e: 'selectModel', api: any, model: string): void
  (e: 'navToConfig', api: any): void
}>()

const show = useVModel(props, 'showModal')
const searchQuery = ref('')
const apiList: any = useAppStorage('apiList', DefaultApiList)

// 过滤模型列表
const filteredApiList = computed(() => {
  if (!searchQuery.value) return apiList.value

  return apiList.value
    .map((api: any) => {
      const filteredModels = api.modelList.filter((model: string) => model.toLowerCase().includes(searchQuery.value.toLowerCase()))

      if (filteredModels.length === 0) return null

      return {
        ...api,
        modelList: filteredModels
      }
    })
    .filter((api: any) => api !== null)
})

const selectModel = (api: any, model: string) => {
  emit('selectModel', api, model)
  show.value = false
}
const navToConfig = (api: any) => {
  emit('navToConfig', api)
}
</script>

<style lang="less" scoped>
.search-container {
  padding: 0 8px 10px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.models-container {
  max-height: 60vh;
  overflow-y: auto;
  padding: 0 16px 16px;
}

.api-list {
  margin: 16px 0;
}
.theme-dark {
  .header {
    background-color: #40444b;
    color: #f4f5f6;
  }
  .model-item {
    background-color: #2f3136;
    color: #f4f5f6;
    &:hover {
      background-color: #40444b;
      color: #ffffff;
      border: none;
      box-shadow: none;
    }
  }
  .models-container {
    &::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      border: 2px solid transparent;
      background-clip: content-box;
    }
  }
}
.header {
  font-weight: 600;
  padding: 12px 16px;
  background-color: #f5f7fa;
  border-radius: 6px 6px 0 0;
  color: #606266;
  font-size: 14px;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.model-item {
  padding: 8px 12px;
  background-color: #ffffff;
  color: #303133;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;

  &:hover {
    background-color: #eeeeee;
    transform: translateY(-1px);
    border-color: #c6e2ff;
  }

  .model-name {
    font-size: 13px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.no-results {
  padding: 40px 0;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
