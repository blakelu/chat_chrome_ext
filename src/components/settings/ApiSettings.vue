<template>
  <div class="api-settings">
    <div ref="apiListRef" class="api-list">
      <div v-for="(item, index) in apiList" :key="index" class="api-card" :class="{ 'is-active': item.selected }">
        <div class="card-header">
          <div class="selection-indicator" @click="handleClick(item, index)">
            <div class="radio-btn">
              <div class="radio-inner" v-if="item.selected"></div>
            </div>
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
          <el-icon></el-icon>
          添加新配置
        </el-button>
      </div>
    </div>
    <div class="card-body">
      <div class="form-group">
        <label>API URL</label>
        <el-input v-model="apiList[currentIndex].API_URL" size="small" placeholder="例如: https://api.openai.com" clearable>
          <template #prefix>
            <el-icon><ep-link /></el-icon>
          </template>
        </el-input>
      </div>

      <div class="form-group">
        <label>API Key</label>
        <el-input v-model="apiList[currentIndex].API_KEY" size="small" placeholder="输入您的API Key" show-password clearable>
          <template #prefix>
            <el-icon><ep-key /></el-icon>
          </template>
        </el-input>
      </div>

      <div class="form-group">
        <label>备注名称</label>
        <el-input v-model="apiList[currentIndex].remark" size="small" placeholder="为此配置添加备注名称" clearable>
          <template #prefix>
            <el-icon><ep-notebook /></el-icon>
          </template>
        </el-input>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDraggable } from 'vue-draggable-plus'
import { useStorage } from '@vueuse/core'
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const emit = defineEmits(['confirm'])
const apiListRef = ref()
const apiList: any = useStorage('apiList', [] as any)
const currentIndex = ref(0)

// Initialize with default if empty
onMounted(() => {
  if (apiList.value.length === 0) {
    apiList.value.push({
      API_URL: 'https://api.openai.com',
      API_KEY: '',
      remark: 'OpenAI API',
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
    selected: false
  }

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
  emit('confirm', {
    API_URL: item.API_URL,
    API_KEY: item.API_KEY
  })

  // ElMessage({
  //   message: item.remark ? `已选择: ${item.remark}` : '已选择API配置',
  //   type: 'success',
  //   offset: 60,
  //   duration: 2000
  // })
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
        emit('confirm', {
          API_URL: nextSelected.API_URL,
          API_KEY: nextSelected.API_KEY
        })
      }
    }

    apiList.value.splice(index, 1)
    ElMessage.success('已删除API配置')
  } catch {
    // User canceled deletion
  }
}
</script>

<style lang="less" scoped>
.api-settings {
  padding-top: 10px;
  display: flex;
  gap: 24px;

  .api-list {
    scroll-behavior: smooth;
  }

  .api-card {
    width: 200px;
    background-color: #fff;
    border-radius: 6px;
    margin-bottom: 12px;
    border: 1px solid #e4e9f0;
    transition: all 0.2s ease;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);

    &:hover {
      border-color: #c8d5e9;
    }

    &.is-active {
      border-color: #4f8df5;
      background-color: #f8fbff;
      box-shadow: 0 1px 3px rgba(59, 130, 246, 0.1);

      .card-header {
        border-bottom-color: #e0ecfd;
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
      border-bottom: 1px solid #f0f4f9;
      border-radius: 6px 6px 0 0;
      background-color: #f8fafd;

      .selection-indicator {
        display: flex;
        align-items: center;
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

        &:hover {
          background-color: #f0f5ff;

          .radio-btn {
            border-color: #6b8cce;
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
