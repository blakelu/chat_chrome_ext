<template>
  <div class="api-settings-container">
    <div ref="apiListRef" class="api-list">
      <div v-for="(item, index) in apiList" :key="index" class="api-card" :class="{ 'is-active': item.selected }">
        <div class="card-header" @click="handleClick(item, index)">
          <div class="selection-indicator truncate">
            <div class="radio-btn" v-if="item.selected">
              <div class="radio-inner"></div>
            </div>
            <span class="card-title">{{ item?.remark || `API配置 ${index + 1}` }}</span>
          </div>

          <div class="card-actions">
            <el-tooltip content="删除" placement="top" append-to="#closeAI-app" v-if="apiList.length > 0">
              <el-button class="action-btn delete-btn" @click.stop="handleDelete(item, index)">
                <el-icon><ep-delete /></el-icon>
              </el-button>
            </el-tooltip>

            <el-tooltip content="拖动排序" placement="top" append-to="#closeAI-app">
              <div class="drag-handle">
                <el-icon><ep-rank /></el-icon>
              </div>
            </el-tooltip>
          </div>
        </div>
      </div>
      <div class="add-card-wrapper">
        <el-button class="add-card-btn" @click="handleAdd">
          <el-icon><ep-plus /></el-icon>
          添加新配置
        </el-button>
      </div>
      <div>
        <el-button @click="handleGetTestConfig"> 获取测试配置 </el-button>
      </div>
    </div>

    <div v-if="apiList[currentIndex]" class="card-body-container">
      <div class="card-body-header">
        <h3 class="config-title">{{ apiList[currentIndex]?.remark || `API配置 ${currentIndex + 1}` }}</h3>
      </div>

      <div class="card-body">
        <div class="form-group">
          <label>配置名称</label>
          <el-input v-model="apiList[currentIndex]?.remark" size="large" placeholder="为此配置设置名称" clearable>
            <template #prefix>
              <el-icon><ep-notebook /></el-icon>
            </template>
          </el-input>
        </div>

        <div class="form-group">
          <label>API 地址</label>
          <el-input v-model="apiList[currentIndex].apiUrl" size="large" placeholder="例如: https://api.openai.com" clearable>
            <template #prefix>
              <el-icon><ep-link /></el-icon>
            </template>
          </el-input>
          <div class="flex justify-between text-[#999]">
            <div class="w-[50%]">{{ realBaseURL }}</div>
            <div class="">以‘/’结尾不自动加v1，以‘#’结尾强制使用输入地址</div>
          </div>
        </div>

        <div class="form-group">
          <label>API 密钥</label>
          <el-input v-model="apiList[currentIndex].apiKey" size="large" placeholder="输入您的API Key" show-password clearable>
            <template #prefix>
              <el-icon><ep-key /></el-icon>
            </template>
          </el-input>
        </div>

        <div class="form-group model-group">
          <div class="model-header">
            <label>可用模型</label>
            <div class="model-actions">
              <el-button type="primary" size="small" @click="handleSelectModel" class="select-model-btn">
                <el-icon><ep-list /></el-icon>选择可用模型
              </el-button>
              <el-button size="small" @click="handleAddModel" class="add-model-btn">
                <el-icon><ep-plus /></el-icon>添加模型
              </el-button>
            </div>
          </div>

          <div class="tags-wrapper">
            <div v-if="!(apiList[currentIndex].modelList?.length > 0)" class="empty-models">
              <el-icon><ep-warning /></el-icon>
              <span>尚未添加任何模型</span>
            </div>

            <div class="tag-item" v-for="(model, index) in apiList[currentIndex].modelList || []" :key="index">
              <span class="tag-text">{{ model }}</span>
              <el-button class="tag-close" circle plain size="small" @click="deleteModel(index)">
                <el-icon><ep-close /></el-icon>
              </el-button>
            </div>

            <div v-if="showModelInput" class="tag-input-wrapper" key="input">
              <el-input
                ref="InputRef"
                v-model="inputValue"
                size="default"
                placeholder="输入模型名称"
                @keyup.enter="handleInputConfirm"
                @blur="handleInputConfirm"
                class="tag-input"
              />
            </div>
          </div>
        </div>
      </div>
    </div v-if="apiList[currentIndex]" class="card-body-container">
  </div>
  <ModelList v-model:visible="showModelDialog" :modelInfo="apiList[currentIndex]" @confirm="handleConfirm" />
</template>

<script setup lang="ts">
import { useDraggable } from 'vue-draggable-plus'
import { useAppStorage } from '@/composables/useAppStorage.ts'
import { ElLoading, ElMessage, ElMessageBox } from 'element-plus'
import { getTestConfig } from '@/api/index.ts'

const emit = defineEmits(['confirm'])
const apiListRef = ref<any>()
const apiList: any = useAppStorage('apiList', [
  {
    apiUrl: 'https://api.openai.com',
    apiKey: '',
    remark: 'OpenAI API',
    modelList: [],
    selected: true
  }
])
const currentIndex = ref(0)
const showModelDialog = ref(false)
const showModelInput = ref(false)
const inputValue = ref('')
const InputRef = ref()

const realBaseURL = computed(() => {
  const baseURL = apiList.value[currentIndex.value]?.apiUrl
  if (!baseURL) return ''
  if (baseURL.endsWith('/')) {
    return baseURL + 'chat/completions'
  } else if (baseURL.endsWith('#')) {
    return baseURL.slice(0, -1)
  } else {
    return baseURL + '/v1/chat/completions'
  }
})
watch(
  apiList,
  (newList) => {
    if (newList.length > 0) {
      currentIndex.value = newList.findIndex((item: any) => item.selected)
    }
  },
  { deep: true, immediate: true }
)

//@ts-ignore
useDraggable(apiListRef, apiList, {
  animation: 150,
  handle: '.drag-handle',
  ghostClass: 'api-card-ghost',
  chosenClass: 'api-card-chosen'
})

const handleGetTestConfig = () => {
  const loading = ElLoading.service({
    lock: true,
    text: 'Loading',
    background: 'rgba(0, 0, 0, 0.7)'
  })
  getTestConfig({})
    .then((res: any) => {
      console.log(res)
      if (res.apiUrl && res.apiKey) {
        const newItem = {
          apiUrl: res.apiUrl,
          apiKey: res.apiKey,
          remark: res.remark,
          modelList: res.modelList || [],
          selected: false
        }
        apiList.value.push(newItem)
      }
    })
    .finally(() => {
      loading.close()
    })
}
const handleAdd = () => {
  const newItem = {
    apiUrl: '',
    apiKey: '',
    remark: '',
    modelList: [],
    selected: true
  }
  currentIndex.value = apiList.value.length
  apiList.value.forEach((item: any) => {
    item.selected = false
  })
  apiList.value.push(newItem)

  nextTick(() => {
    const container = apiListRef.value
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  })
}

const handleClick = (item: any, index: number) => {
  apiList.value.forEach((item: any) => {
    item.selected = false
  })
  item.selected = true
  currentIndex.value = index
}

const handleDelete = async (item: any, index: number) => {
  try {
    await ElMessageBox.confirm(item.remark ? `确定删除"${item.remark}"配置？` : '确定删除此API配置？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    })

    if (item.selected) {
      const nextIndex = index > 0 ? index - 1 : index + 1
      if (nextIndex < apiList.value.length) {
        const nextSelected = apiList.value[nextIndex]
        nextSelected.selected = true
      }
    }

    apiList.value.splice(index, 1)
    ElMessage.success('已删除API配置')
  } catch {
    // User canceled deletion
  }
}
const handleSelectModel = () => {
  showModelDialog.value = true
}
const handleConfirm = (selectedModels: any) => {
  apiList.value[currentIndex.value].modelList = selectedModels
}
const deleteModel = async (index: number) => {
  await ElMessageBox.confirm(`确定要删除此模型吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  apiList.value[currentIndex.value].modelList.splice(index, 1)
  ElMessage.success('已删除模型')
}
const handleAddModel = () => {
  showModelInput.value = true
  nextTick(() => {
    InputRef.value?.focus()
  })
}
const handleInputConfirm = () => {
  if (inputValue.value) {
    if (apiList.value[currentIndex.value].modelList.includes(inputValue.value)) {
      ElMessage.warning('该模型已存在')
    } else {
      apiList.value[currentIndex.value].modelList.push(inputValue.value)
      ElMessage.success(`已添加模型: ${inputValue.value}`)
    }
  }
  showModelInput.value = false
  inputValue.value = ''
}
</script>

<style lang="less" scoped>
.api-settings-container {
  display: flex;
  gap: 32px;
  padding: 8px;
  margin-top: 8px;
  background-color: #f9fafb;
  border-radius: 16px;
  min-height: 600px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.01);
}

.api-list {
  width: 260px;
  padding: 16px;
  flex-shrink: 0;
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  max-height: 600px;
  overflow-y: auto;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
}

.api-card {
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
  transition: all 0.3s ease;
  border: 1px solid #eaecf0;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  &.is-active {
    border-color: #4f8df5;
    background: linear-gradient(to right, #f0f7ff, #ffffff);
    box-shadow: 0 4px 12px rgba(79, 141, 245, 0.1);

    .card-header {
      background-color: #f0f7ff;
      color: #1e40af;
    }

    .selection-indicator {
      color: #1d4ed8;
    }

    .card-title {
      font-weight: 600;
    }
  }

  &-ghost {
    opacity: 0.7;
    background-color: #f5f8ff;
    border: 1px dashed #4f8df5;
  }

  &-chosen {
    border-color: #4f8df5;
    box-shadow: 0 0 0 2px rgba(79, 141, 245, 0.2);
  }

  .card-header {
    padding: 14px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.2s ease;

    &:hover {
      background-color: #f8fafc;
    }

    .selection-indicator {
      display: flex;
      align-items: center;
      flex: 1;
      gap: 10px;
      font-weight: 500;
      color: #334155;
      cursor: pointer;
      padding: 3px;
      border-radius: 4px;
      transition: background-color 0.2s;

      .radio-btn {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 2px solid #4f8df5;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        flex-shrink: 0;
        background-color: #fff;

        .radio-inner {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: #4f8df5;
        }
      }

      .card-title {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 160px;
        font-size: 14px;
      }
    }

    .card-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      opacity: 0.6;
      transition: opacity 0.2s ease;

      .action-btn {
        color: #64748b;
        font-size: 14px;
        transition: all 0.2s ease;
        height: 28px;
        width: 28px;
        padding: 6px;
        border-radius: 6px;
        border: none;
        background-color: transparent;

        &.delete-btn:hover {
          background-color: #fee2e2;
          color: #ef4444;
        }
      }

      .drag-handle {
        cursor: move;
        padding: 6px;
        border-radius: 6px;
        color: #94a3b8;
        display: flex;

        &:hover {
          background-color: #eef2fd;
          color: #4b63a9;
        }
      }
    }

    &:hover .card-actions {
      opacity: 1;
    }
  }
}

.add-card-wrapper {
  padding: 8px 0 16px;

  .add-card-btn {
    width: 100%;
    height: 48px;
    border: 2px dashed #d0d5dd;
    border-radius: 12px;
    color: #5a7bb6;
    font-weight: 500;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background-color: #f8fafc;

    &:hover {
      border-color: #4f8df5;
      color: #4f8df5;
      background-color: #f0f7ff;
      transform: translateY(-2px);
    }

    .closeai-icon {
      font-size: 18px;
    }
  }
}

.card-body-container {
  flex: 1 0 600px;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.card-body-header {
  padding: 20px 24px;
  border-bottom: 1px solid #eaecf0;
  background: linear-gradient(to right, #f0f7ff, #ffffff);

  .config-title {
    font-size: 18px;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
  }
}

.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 12px 24px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 14px;
    font-weight: 600;
    color: #475569;
    margin-left: 2px;
  }

  :deep(.closeai-input__wrapper) {
    box-shadow: 0 0 0 1px #e2e8f0;
    border-radius: 8px;
    transition: all 0.2s ease;
    padding: 4px 12px;

    &:hover {
      box-shadow: 0 0 0 1px #cbd5e1;
    }

    &:focus-within {
      box-shadow: 0 0 0 2px rgba(79, 141, 245, 0.3);
    }

    .closeai-input__prefix-inner {
      color: #64748b;
      margin-right: 8px;
    }
  }
}

.model-group {
  .model-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .model-actions {
      display: flex;
      gap: 8px;

      .select-model-btn {
        background-color: #4f8df5;
        border-color: #4f8df5;

        &:hover {
          background-color: #3b7de2;
          border-color: #3b7de2;
        }
      }

      .add-model-btn {
        color: #4f8df5;
        border-color: #4f8df5;

        &:hover {
          color: #3b7de2;
          border-color: #3b7de2;
          background-color: #f0f7ff;
        }
      }

      .closeai-icon {
        margin-right: 4px;
      }
    }
  }

  .tags-wrapper {
    background-color: #f8fafc;
    border-radius: 12px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding: 12px;
    border: 1px solid #e2e8f0;
    align-content: flex-start;

    .empty-models {
      width: 100%;
      height: 80px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
      gap: 8px;

      .closeai-icon {
        font-size: 24px;
      }
    }

    .tag-item {
      display: inline-flex;
      align-items: center;
      padding: 2px 6px 2px 12px;
      border-radius: 12px;
      background-color: #fff;
      color: #334155;
      font-size: 12px;
      transition: all 0.2s ease;
      user-select: none;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.08);
      }

      .tag-text {
        margin-right: 8px;
        word-break: break-all;
      }

      .tag-close {
        color: #94a3b8;
        border: none;
        height: 24px;
        width: 24px;
        transition: all 0.3s ease;

        &:hover {
          color: #ef4444;
          background-color: #fee2e2;
          transform: rotate(90deg);
        }
      }
    }

    .tag-input-wrapper {
      min-width: 200px;

      .tag-input {
        :deep(.closeai-input__wrapper) {
          box-shadow: 0 0 0 1px #4f8df5;
        }
      }
    }
  }
}

// Transition animations
.api-card-enter-active,
.api-card-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.api-card-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.api-card-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
