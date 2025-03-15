<template>
  <div class="api-settings">
    <div class="api-header">
      <h4 class="api-title">API 设置</h4>
      <el-link 
        href="https://burn.hair/register?aff=ac6k" 
        target="_blank" 
        class="api-link"
        :underline="false"
      >
        <el-icon></el-icon>
        获取我的 API Key
      </el-link>
    </div>
    
    <div ref="apiListRef" class="api-list">
      <TransitionGroup name="api-card" tag="div">
        <div 
          v-for="(item, index) in apiList" 
          :key="index" 
          class="api-card" 
          :class="{ 'is-active': item.selected }"
        >
          <div class="card-header">
            <div 
              class="selection-indicator" 
              @click="handleClick(item, index)"
            >
              <div class="radio-btn">
                <div class="radio-inner" v-if="item.selected"></div>
              </div>
              <span>{{ item.remark || `API配置 ${index + 1}` }}</span>
            </div>
            
            <div class="card-actions">
              <el-tooltip content="删除" placement="top" v-if="apiList.length > 1">
                <el-button 
                  class="action-btn delete-btn" 
                  circle 
                  plain
                  @click="handleDelete(item, index)"
                >
                  <el-icon></el-icon>
                </el-button>
              </el-tooltip>
              
              <el-tooltip content="拖动排序" placement="top">
                <div class="drag-handle">
                  <el-icon></el-icon>
                </div>
              </el-tooltip>
            </div>
          </div>
          
          <div class="card-body">
            <div class="form-group">
              <label>API URL</label>
              <el-input 
                v-model="item.API_URL" 
                size="default" 
                placeholder="例如: https://api.openai.com"
                clearable
              >
                <template #prefix>
                  <el-icon></el-icon>
                </template>
              </el-input>
            </div>
            
            <div class="form-group">
              <label>API Key</label>
              <el-input 
                v-model="item.API_KEY" 
                size="default" 
                placeholder="输入您的API Key"
                show-password
                clearable
              >
                <template #prefix>
                  <el-icon></el-icon>
                </template>
              </el-input>
            </div>
            
            <div class="form-group">
              <label>备注名称</label>
              <el-input 
                v-model="item.remark" 
                size="default" 
                placeholder="为此配置添加备注名称"
                clearable
              >
                <template #prefix>
                  <el-icon></el-icon>
                </template>
              </el-input>
            </div>
          </div>
        </div>
      </TransitionGroup>
      
      <div class="add-card-wrapper">
        <el-button type="dashed" class="add-card-btn" @click="handleAdd">
          <el-icon></el-icon>
          添加新配置
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDraggable } from 'vue-draggable-plus'

const emit = defineEmits(['confirm'])
const apiListRef = ref()
const apiList = useStorage('apiList', [] as any)

// Initialize with default if empty
onMounted(() => {
  console.log('执行了吗')
  if (apiList.value.length === 0) {
    apiList.value.push({
      API_URL: 'https://api.openai.com',
      API_KEY: '',
      remark: 'OpenAI API',
      selected: true
    })
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
  
  // Scroll to the newly added item
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
  emit('confirm', {
    API_URL: item.API_URL,
    API_KEY: item.API_KEY
  })
  
  ElMessage({
    message: item.remark ? `已选择: ${item.remark}` : '已选择API配置',
    type: 'success',
    offset: 60,
    duration: 2000
  })
}

const handleDelete = async (item: any, index: number) => {
  try {
    await ElMessageBox.confirm(
      item.remark ? `确定删除"${item.remark}"配置？` : '确定删除此API配置？', 
      '提示', 
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
    
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
  padding: 0 8px 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .api-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 8px;
    
    .api-title {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }
    
    .api-link {
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 4px;
      color: #3b82f6;
      background-color: #eff6ff;
      padding: 6px 12px;
      border-radius: 20px;
      transition: all 0.2s ease;
      
      &:hover {
        background-color: #dbeafe;
        transform: translateY(-1px);
      }
    }
  }
  
  .api-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
    scroll-behavior: smooth;
  }
  
  .api-card {
    background-color: #fff;
    border-radius: 12px;
    margin-bottom: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    border: 1px solid #e2e8f0;
    transition: all 0.25s ease;
    
    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    
    &.is-active {
      border-color: #3b82f6;
      box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.1), 0 4px 12px rgba(59, 130, 246, 0.08);
      
      .card-header {
        border-bottom-color: #bfdbfe;
        background-color: #eff6ff;
      }
      
      .selection-indicator {
        color: #1d4ed8;
      }
    }
    
    &-ghost {
      opacity: 0.8;
      background-color: #f8fafc;
    }
    
    &-chosen {
      box-shadow: 0 0 0 2px #3b82f6, 0 8px 16px rgba(59, 130, 246, 0.1);
    }
    
    .card-header {
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #f1f5f9;
      border-radius: 12px 12px 0 0;
      
      .selection-indicator {
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 500;
        color: #334155;
        cursor: pointer;
        padding: 4px;
        border-radius: 6px;
        transition: background-color 0.2s;
        
        .radio-btn {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
          
          .radio-inner {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background-color: #3b82f6;
          }
        }
        
        &:hover {
          background-color: #f1f5f9;
          
          .radio-btn {
            border-color: #94a3b8;
          }
        }
      }
      
      .card-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .action-btn {
          color: #64748b;
          border-color: transparent;
          font-size: 16px;
          transition: all 0.2s ease;
          
          &.delete-btn:hover {
            color: #ef4444;
            background-color: #fee2e2;
            transform: rotate(8deg);
          }
        }
        
        .drag-handle {
          cursor: move;
          padding: 6px;
          border-radius: 4px;
          color: #94a3b8;
          display: flex;
          
          &:hover {
            background-color: #f1f5f9;
            color: #64748b;
          }
        }
      }
    }
    
    .card-body {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      
      label {
        font-size: 14px;
        font-weight: 500;
        color: #475569;
      }
      
      :deep(.el-input__wrapper) {
        box-shadow: 0 0 0 1px #e2e8f0;
        border-radius: 8px;
        transition: all 0.2s ease;
        
        &:hover {
          box-shadow: 0 0 0 1px #cbd5e1;
        }
        
        &:focus-within {
          box-shadow: 0 0 0 2px #93c5fd;
        }
        
        .el-input__prefix-inner {
          color: #64748b;
        }
      }
    }
  }
  
  .add-card-wrapper {
    padding: 8px 0 16px;
    
    .add-card-btn {
      width: 100%;
      height: 60px;
      border: 2px dashed #cbd5e1;
      border-radius: 12px;
      color: #64748b;
      font-weight: 500;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      
      &:hover {
        border-color: #93c5fd;
        color: #3b82f6;
        background-color: #f8fafc;
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
  transform: translateY(20px);
}

.api-card-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}
</style>
