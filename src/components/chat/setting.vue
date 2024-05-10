<template>
  <div class="my-drawer">
    <el-drawer v-model="drawer" size="95%" direction="btt">
      <template #header>
        <el-tabs v-model="activeName">
          <el-tab-pane label="API设置" name="API"></el-tab-pane>
          <el-tab-pane label="模型设置" name="model"></el-tab-pane>
        </el-tabs>
      </template>
      <component :is="component[activeName]" @confirm="onConfirm" />
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import chooseApi from './chooseApi.vue'
import chooseModel from './chooseModel.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['update:show', 'confirm'])

const drawer = useVModel(props, 'show', emit)
const activeName = ref('API')
const component: any = {
  API: chooseApi,
  model: chooseModel
}
const onConfirm = (val: any) => {
  emit('confirm', val)
}
</script>
<style lang="less" scoped>
:deep(.el-drawer__header) {
  margin-bottom: 10px;
  padding-top: 10px;
}
:deep(.el-drawer__body) {
  padding-top: 10px;
}
:deep(.el-tabs__header) {
  margin: 0;
  .el-tabs__nav-wrap::after {
    height: 1px;
  }
}
</style>
