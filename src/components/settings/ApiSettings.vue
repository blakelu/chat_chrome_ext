<template>
  <div class="api-settings">
    <div ref="apiListRef" class="api-list">
      <div v-for="(item, index) in apiList" :key="index" class="api-card" :class="{ 'is-active': item.selected }">
        <div class="card-header" @click="handleClick(item, index)">
          <div class="selection-indicator">
            <span>{{ item.remark || `API配置 ${index + 1}` }}</span>
          </div>

          <div class="card-actions">
            <el-tooltip content="删除" placement="top" v-if="apiList.length > 1">
              <el-button class="action-btn delete-btn" @click="handleDelete(item, index)">
                <el-icon><ep-delete /></el-icon>
              </el-button>
            </el-tooltip>

            <el-tooltip content="拖动排序" placement="top">
              <div class="drag-handle">
                <el-icon><ep-rank /></el-icon>
              </div>
            </el-tooltip>
          </div>
        </div>
      </div>
      <div class="add-card-wrapper">
        <el-button type="dashed" class="add-card-btn" @click="handleAdd">
          <el-icon><ep-plus /></el-icon>
          添加新配置
        </el-button>
      </div>
    </div>
    <div class="card-body">
      <div class="form-group">
        <label>名称</label>
        <el-input v-model="apiList[currentIndex].remark" size="small" placeholder="为此配置设置名称" clearable>
          <template #prefix>
            <el-icon><ep-notebook /></el-icon>
          </template>
        </el-input>
      </div>
      <div class="form-group">
        <label>API地址</label>
        <el-input v-model="apiList[currentIndex].API_URL" size="small" placeholder="例如: https://api.openai.com" clearable>
          <template #prefix>
            <el-icon><ep-link /></el-icon>
          </template>
        </el-input>
      </div>

      <div class="form-group">
        <label>API密钥</label>
        <el-input v-model="apiList[currentIndex].API_KEY" size="small" placeholder="输入您的API Key" show-password clearable>
          <template #prefix>
            <el-icon><ep-key /></el-icon>
          </template>
        </el-input>
      </div>
      <div class="form-group">
        <label>模型</label>
        <div class="tags-wrapper">
          <div class="tag-item" v-for="(model, index) in apiList[currentIndex].modelList" :key="index">
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

        <div class="flex mt-2">
          <el-button type="primary" size="small" @click="handleSelectModel">选择可用模型</el-button>
          <el-button size="small" @click="handleAddModel">添加模型</el-button>
        </div>
      </div>
    </div>
  </div>
  <ModelList v-model:visible="showModelDialog" :modelInfo="apiList[currentIndex]" @confirm="handleConfirm" />
</template>

<script setup lang="ts">
import { useDraggable } from 'vue-draggable-plus'
import { useAppStorage } from '@/composables/useAppStorage.ts'
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ModelList from './modelList.vue'

const emit = defineEmits(['confirm'])
const apiListRef = ref()
const apiList: any = useAppStorage('apiList', [] as any)
const currentIndex = ref(0)
const showModelDialog = ref(false)
const showModelInput = ref(false)
const inputValue = ref('')
const InputRef = ref()

// Initialize with default if empty
onMounted(() => {
  if (apiList.value.length === 0) {
    apiList.value.push({
      API_URL: 'https://api.openai.com',
      API_KEY: '',
      remark: 'OpenAI API',
      modelList: [],
      selected: true
    })
  } else {
    currentIndex.value = apiList.value.findIndex((item: any) => item.selected)
  }
})

useDraggable(apiListRef, apiList, {
  animation: 150,
  handle: '.drag-handle',
  ghostClass: 'api-card-ghost',
  chosenClass: 'api-card-chosen'
})

const handleAdd = () => {
  const newItem = {
    API_URL: '',
    API_KEY: '',
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
  const modifiedModels = selectedModels.filter((model: any) => {
    return !apiList.value[currentIndex.value].modelList.includes(model)
  })
  apiList.value[currentIndex.value].modelList.push(...modifiedModels)
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
.api-settings {
  padding-top: 28px;
  display: flex;
  gap: 42px;

  .api-list {
    scroll-behavior: smooth;
  }

  .api-card {
    width: 200px;
    background-color: #fff;
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 12px;
    transition: all 0.2s ease;

    &:hover {
      border-color: #c8d5e9;
    }

    &.is-active {
      box-shadow: 0 1px 3px rgba(59, 130, 246, 0.1);

      .card-header {
        background-color: #f0f7ff;
        color: #1e40af;
      }

      .selection-indicator {
        color: #1d4ed8;
      }
    }

    &-ghost {
      opacity: 0.8;
      background-color: #f5f8ff;
    }

    &-chosen {
      border-color: #4f8df5;
    }

    .card-header {
      padding: 8px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      &:hover {
        background-color: #f0f7ff;
      }
      .selection-indicator {
        display: flex;
        align-items: center;
        flex: 1;
        gap: 8px;
        font-weight: 500;
        color: #334155;
        cursor: pointer;
        padding: 3px;
        border-radius: 4px;
        transition: background-color 0.2s;

        .radio-btn {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;

          .radio-inner {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: #4f8df5;
          }
        }
      }

      .card-actions {
        display: flex;
        align-items: center;
        gap: 6px;

        .action-btn {
          color: #64748b;
          font-size: 14px;
          transition: all 0.2s ease;
          height: 24px;
          width: 24px;
          padding: 6px;
          border-radius: 6px;
          border: none;
          background-color: transparent;

          &.delete-btn:hover {
            background-color: #eef2fd;
            color: #ef4444;
          }
        }

        .drag-handle {
          cursor: move;
          padding: 4px;
          border-radius: 4px;
          color: #94a3b8;
          display: flex;

          &:hover {
            background-color: #eef2fd;
            color: #4b63a9;
          }
        }
      }
    }
  }
  .card-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px;
    background: rgba(0, 0, 0, 0.02);
    border-radius: 8px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 4px;

    label {
      font-size: 13px;
      font-weight: 500;
      color: #475569;
      margin-left: 2px;
    }

    :deep(.el-input__wrapper) {
      box-shadow: 0 0 0 1px #e0e4ec;
      border-radius: 5px;
      transition: all 0.2s ease;

      &:hover {
        box-shadow: 0 0 0 1px #c0c8d8;
      }

      &:focus-within {
        box-shadow: 0 0 0 1px #4f8df5;
      }

      .el-input__prefix-inner {
        color: #64748b;
      }
    }
    .tags-wrapper {
      background-color: #f8fafc;
      border-radius: 12px;
      padding: 16px;
      border: 1px solid #e2e8f0;
      overflow-y: auto;
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      .tag-item {
        display: inline-flex;
        align-items: center;
        padding: 4px 4px 4px 8px;
        border-radius: 8px;
        background-color: #fff;
        color: #334155;
        font-size: 14px;
        transition: all 0.2s ease;
        user-select: none;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

        &:hover {
          border-color: #94a3b8;
        }

        .tag-text {
          margin-right: 4px;
        }

        .tag-close {
          color: #94a3b8;
          border: none;
          height: 24px;
          width: 24px;
          transition: all 0.2s ease;

          &:hover {
            color: #ef4444;
            background-color: #fee2e2;
            transform: rotate(90deg);
          }
        }
      }
    }
  }
  .add-card-wrapper {
    width: 200px;
    padding: 4px 0 12px;

    .add-card-btn {
      width: 100%;
      height: 42px;
      border: 1px dashed #d0d5dd;
      border-radius: 6px;
      color: #5a7bb6;
      font-weight: 500;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;

      &:hover {
        border-color: #4f8df5;
        color: #4f8df5;
        background-color: #f0f7ff;
      }
    }
  }
}

// Transition animations
.api-card-enter-active,
.api-card-leave-active {
  transition: all 0.3s ease;
}

.api-card-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.api-card-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
