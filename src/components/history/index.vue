import { before } from 'lodash'; import { remove } from 'lodash'; import { emitChangeFn } from 'element-plus';
<template>
  <div class="my_drawer">
    <el-drawer v-model="drawer" title="历史会话记录" direction="btt">
      <div class="list_content">
        <div v-for="(item, index) in historyInfoList" :key="index" class="item_wrap" @click="navToHistory(item)">
          <div class="item_wrap_row">
            <div class="title">{{ item.title }}</div>
            <div class="time">{{ item.timeStr }}</div>
          </div>
          <div class="item_wrap_row">
            <div class="desc">{{ item.desc }}</div>
            <div>
              <el-button text type="danger" @click.stop="removeItem(index, item)">
                <el-icon><ep-delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
        <el-empty v-if="historyInfoList.length === 0" description="无更多历史记录" />
      </div>
    </el-drawer>
  </div>
</template>
<script lang="ts" setup>
import { useVModel } from '@vueuse/core'
const props = defineProps({
  drawer: Boolean,
  sessionId: String
})
const drawer = useVModel(props, 'drawer')
// const list = ref([])
const historyInfoList = ref([]) // [{uuid:'随机的唯一id', mode: '选中的模型', timeStr: '上一次时间', title: '历史记录标题', 'desc': '取context最后一条', context: '对话内容'}]
watch(drawer, (val) => {
  if (val) {
    historyInfoList.value = JSON.parse(localStorage.historyInfo || '[]')
  }
})
const emit = defineEmits(['navToHistory', 'reload'])
const navToHistory = (item) => {
  console.log('navToHistory', item)
  emit('navToHistory', item)
  drawer.value = false
}
const removeItem = (index, item) => {
  historyInfoList.value.splice(index, 1)
  localStorage.historyInfo = JSON.stringify(historyInfoList.value)
  emit('reload')
}
</script>
<style lang="less" scoped>
.my_drawer {
  color: #333;
  --el-dialog-padding-primary: 15px;
  :deep(.el-drawer) {
    height: 50% !important;
  }
  .list_content {
  }
  .item_wrap {
    font-size: 14px;
    padding: 10px;
    position: relative;
    cursor: pointer;
    &:hover {
      background: #f8f8f8;
      border-radius: 10px;
    }
    & + .item_wrap {
      &:before {
        content: '';
        left: 5px;
        right: 5px;
        top: 0;
        height: 1px;
        background: #f8f8f8;
        position: absolute;
      }
    }
    .title {
      font-weight: bold;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .time {
      color: #888;
      font-size: 12px;
      flex-shrink: 0;
    }
    .desc {
      color: #888;
      -webkit-line-clamp: 2; // 设置两行文字溢出
      display: -webkit-box; /** 对象作为伸缩盒子模型显示 **/
      -webkit-box-orient: vertical; /** 设置或检索伸缩盒对象的子元素的排列方式 **/
      overflow: hidden; /** 隐藏超出的内容 **/
    }
    .item_wrap_row {
      display: flex;
      justify-content: space-between;
    }
  }
}
</style>
