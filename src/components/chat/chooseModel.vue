<template>
  <div class="model-settings">
    <div class="settings-header">
      <h4 class="settings-title">模型设置</h4>
      <p class="settings-desc">拖动标签排序或添加自定义模型</p>
    </div>

    <div class="tags-container">
      <div class="tags-wrapper" ref="tagsContainer">
        <TransitionGroup name="tag" tag="div" class="tags">
          <div 
            v-for="tag in modelList" 
            :key="tag" 
            class="tag-item"
          >
            <span class="tag-text">{{ tag }}</span>
            <el-button 
              class="tag-close" 
              circle 
              plain
              size="small" 
              @click="handleDelete(tag)"
            >
              <el-icon></el-icon>
            </el-button>
          </div>
          
          <div v-if="inputVisible" class="tag-input-wrapper" key="input">
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
        </TransitionGroup>
      </div>
      
      <div class="tags-actions">
        <el-button 
          class="add-btn" 
          type="primary" 
          plain 
          @click="showInput" 
          v-if="!inputVisible"
        >
          <el-icon></el-icon>
          添加模型
        </el-button>
        
        <el-button 
          class="restore-btn" 
          @click="restoreDefaults" 
          :disabled="restoreDisabled"
        >
          <el-icon></el-icon>
          恢复默认
        </el-button>
      </div>
    </div>
    
    <div class="tips-section">
      <el-alert
        type="info"
        :closable="false"
        show-icon
      >
        <template #title>
          <span>提示</span>
        </template>
        <ul>
          <li>点击并拖动标签可以排序</li>
          <li>点击标签右侧的 × 可以删除模型</li>
          <li>常用模型放在前面方便选择</li>
        </ul>
      </el-alert>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useDraggable } from 'vue-draggable-plus'

const inputValue = ref('')
const modelList = useStorage('modelList', [])
const inputVisible = ref(false)
const InputRef = ref<InstanceType<typeof ElInput>>()
const tagsContainer = ref()

const defaultModels = [
  'o1-preview',
  'o1-mini',
  'gpt-4o-mini',
  'gpt-4o',
  'claude-3-5-sonnet-20240620',
  'dall-e-3',
  'tts-az-1'
]

const restoreDisabled = computed(() => {
  if (modelList.value.length !== defaultModels.length) return false
  return defaultModels.every(model => modelList.value.includes(model))
})

useDraggable(tagsContainer, modelList, { 
  animation: 150, 
  handle: '.tag-item',
  ghostClass: 'tag-ghost',
  chosenClass: 'tag-chosen',
  dragClass: 'tag-drag'
})

const handleDelete = async (tag: string) => {
  try {
    await ElMessageBox.confirm(`确定要删除模型 "${tag}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    modelList.value.splice(modelList.value.indexOf(tag), 1)
    ElMessage.success(`已删除模型: ${tag}`)
  } catch {
    // User cancelled
  }
}

const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    InputRef.value?.focus()
  })
}

const handleInputConfirm = () => {
  if (inputValue.value) {
    if (modelList.value.includes(inputValue.value)) {
      ElMessage.warning('该模型已存在')
    } else {
      modelList.value.push(inputValue.value)
      ElMessage.success(`已添加模型: ${inputValue.value}`)
    }
  }
  inputVisible.value = false
  inputValue.value = ''
}

const restoreDefaults = async () => {
  try {
    await ElMessageBox.confirm('确定要恢复默认模型设置吗？当前的自定义设置将会丢失。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    modelList.value = [...defaultModels]
    ElMessage.success('已恢复默认模型设置')
  } catch {
    // User cancelled
  }
}
</script>

<style lang="less" scoped>
.model-settings {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  
  .settings-header {
    margin-bottom: 8px;
    
    .settings-title {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 6px;
    }
    
    .settings-desc {
      font-size: 14px;
      color: #64748b;
      margin: 0;
    }
  }
  
  .tags-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
    
    .tags-wrapper {
      background-color: #f8fafc;
      border-radius: 12px;
      padding: 16px;
      border: 1px solid #e2e8f0;
      min-height: 200px;
      overflow-y: auto;
      
      .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
      }
      
      .tag-item {
        display: inline-flex;
        align-items: center;
        height: 40px;
        padding: 0 10px;
        border-radius: 8px;
        background-color: #fff;
        color: #334155;
        font-size: 14px;
        border: 1px solid #cbd5e1;
        transition: all 0.2s ease;
        cursor: move;
        user-select: none;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        
        &:hover {
          border-color: #94a3b8;
        }
        
        .tag-text {
          margin-right: 8px;
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
      
      .tag-input-wrapper {
        display: inline-flex;
        min-width: 180px;
        
        .tag-input {
          width: 100%;
          
          :deep(.el-input__wrapper) {
            box-shadow: 0 0 0 1px #3b82f6;
            border-radius: 8px;
          }
        }
      }
    }
    
    .tags-actions {
      display: flex;
      gap: 12px;
      
      .add-btn, .restore-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 10px 16px;
        border-radius: 8px;
        font-weight: 500;
      }
      
      .add-btn {
        flex: 1;
      }
    }
  }
  
  .tips-section {
    margin-top: auto;
    
    :deep(.el-alert__title) {
      font-weight: 600;
      font-size: 15px;
    }
    
    ul {
      margin: 8px 0 0 0;
      padding-left: 20px;
      
      li {
        margin-bottom: 4px;
        color: #475569;
      }
    }
  }
}

// Special classes for dragging
.tag-ghost {
  opacity: 0.6;
  background-color: #f1f5f9;
}

.tag-chosen {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.tag-drag {
  transform: scale(1.05);
}

// Transition animations
.tag-enter-active,
.tag-leave-active {
  transition: all 0.3s ease;
}

.tag-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.tag-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
