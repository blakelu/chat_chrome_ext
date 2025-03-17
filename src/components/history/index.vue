<template>
  <div class="history-drawer">
    <el-drawer v-model="drawer" title="历史会话记录" direction="btt" size="90%">
      <template #header>
        <div class="drawer-header">
          <h3>历史会话记录</h3>
          <el-button v-if="historyInfoList.length > 0" size="small" type="danger" @click="clearAllHistory"> 清空历史 </el-button>
        </div>
      </template>
      <div class="history-content">
        <div
          v-for="(item, index) in historyInfoList"
          :key="index"
          class="history-item"
          :class="{ current: item.sessionId === sessionId }"
          @click="navToHistory(item)"
        >
          <div class="item-content">
            <div class="item-header">
              <div class="item-title">{{ truncateText(item.title, 40) }}</div>
              <!-- <div class="item-model">{{ item.mode }}</div> -->
            </div>
            <div class="item-body">
              <div class="item-desc">{{ truncateText(item.desc, 80) }}</div>
            </div>
            <div class="item-footer">
              <div class="item-time">{{ formatTime(item.timeStr) }}</div>
              <el-button text type="danger" size="small" class="delete-btn" @click.stop="confirmDelete(index, item)">
                <el-icon><ep-delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
        <div v-if="historyInfoList.length === 0" class="empty-history">
          <el-empty description="暂无历史记录" :image-size="120">
            <template #image>
              <img src="@/assets/icons/robot.svg" class="empty-icon" />
            </template>
            <el-button type="primary" @click="createNewChat">开始新对话</el-button>
          </el-empty>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const props = defineProps({
  drawer: Boolean,
  sessionId: String
})

const drawer = useVModel(props, 'drawer')
const historyInfoList = ref([])

watch(drawer, (val) => {
  if (val) {
    loadHistoryData()
  }
})

const loadHistoryData = () => {
  historyInfoList.value = JSON.parse(localStorage.historyInfo || '[]')
}

// Format time to relative or absolute based on how recent
const formatTime = (timeStr) => {
  const date = dayjs(timeStr)
  const now = dayjs()

  // If the date is from today, show relative time (e.g. "3 hours ago")
  if (date.isAfter(now.subtract(24, 'hour'))) {
    return date.fromNow()
  }

  // If within the last week, show day and time
  if (date.isAfter(now.subtract(7, 'day'))) {
    return date.format('ddd HH:mm')
  }

  // Otherwise show full date
  return date.format('YYYY-MM-DD HH:mm')
}

// Truncate long text with ellipsis
const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

const emit = defineEmits(['navToHistory', 'reload'])

const navToHistory = (item) => {
  emit('navToHistory', item)
  drawer.value = false
}

const confirmDelete = async (index, item) => {
  try {
    await ElMessageBox.confirm('确定要删除这条历史记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    removeItem(index, item)
  } catch (e) {
    // User canceled deletion
  }
}

const removeItem = (index, item) => {
  historyInfoList.value.splice(index, 1)
  localStorage.historyInfo = JSON.stringify(historyInfoList.value)
  emit('reload')
}

const clearAllHistory = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有历史记录吗？此操作无法撤销', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    })

    localStorage.historyInfo = JSON.stringify([])
    historyInfoList.value = []
    emit('reload')
  } catch (e) {
    // User canceled
  }
}

const createNewChat = () => {
  drawer.value = false
  emit('navToHistory', { isNew: true })
}
</script>

<style lang="less" scoped>
.history-drawer {
  :deep(.el-drawer__header) {
    margin-bottom: 0;
    padding-bottom: 10px;

    .el-drawer__close {
      color: #64748b;
    }
  }

  :deep(.el-drawer__body) {
    padding: 0;
    overflow: hidden;
  }

  .drawer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-right: 10px;

    h3 {
      font-size: 18px;
      font-weight: 600;
      color: #0f172a;
      margin: 0;
    }
  }

  .history-content {
    height: 100%;
    padding: 10px;
    overflow-y: auto;
  }

  .history-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .history-item {
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    transition: all 0.3s ease;
    cursor: pointer;
    border: 1px solid #f1f5f9;
    &:not(:last-child) {
      margin-bottom: 10px;
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      border-color: #bae6fd;
    }

    &.current {
      border-left: 4px solid #3b82f6;
      background-color: #f0f9ff;
    }

    .item-content {
      padding: 14px 16px;
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;

      .item-title {
        font-weight: 600;
        color: #1e293b;
        font-size: 15px;
        line-height: 1.4;
      }

      .item-model {
        font-size: 12px;
        color: #64748b;
        background-color: #f1f5f9;
        padding: 2px 8px;
        border-radius: 12px;
        font-weight: 500;
      }
    }

    .item-body {
      margin-bottom: 10px;

      .item-desc {
        color: #64748b;
        font-size: 13px;
        line-height: 1.5;
        max-height: 3em;
        overflow: hidden;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
      }
    }

    .item-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .item-time {
        font-size: 12px;
        color: #94a3b8;
      }

      .delete-btn {
        opacity: 0.7;
        transition: all 0.2s ease;
        padding: 4px 8px;
        border-radius: 6px;

        &:hover {
          opacity: 1;
          background-color: #fee2e2;
          color: #ef4444;
        }
      }
    }
  }

  .empty-history {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .empty-icon {
      width: 80px;
      height: 80px;
      opacity: 0.7;
    }
  }
}
</style>
