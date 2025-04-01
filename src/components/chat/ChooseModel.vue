<template>
  <el-dialog v-model="show" title="选择模型" width="400px" :close-on-click-modal="false">
    <div v-for="(api, index) in apiList" :key="index" class="api-list">
      <div class="header">{{ api.remark }}</div>
      <div v-for="(model, modelIndex) in api.modelList" :key="modelIndex" class="model-item" @click="selectModel(api, model)">
        {{ model }}
      </div>
    </div>
  </el-dialog>
</template>

<script lang="ts" setup>
import { useAppStorage } from '@/composables/useAppStorage.ts'

const props = defineProps<{
  showModal: boolean
}>()
const emit = defineEmits<{
  (e: 'update:showModal', value: boolean): void
  (e: 'selectModel', api: any, model: string): void
}>()

const show = useVModel(props, 'showModal')

const apiList: any = useAppStorage('apiList', [])

const selectModel = (api: any, model: string) => {
  emit('selectModel', api, model)
  show.value = false
}
</script>

<style lang="less" scoped>
.api-list {
  margin: 10px 0;
}

.header {
  font-weight: bold;
  margin-bottom: 5px;
  background-color: #999999;
}
.model-item {
  padding: 5px;
  border-radius: 4px;
  background-color: #f0f0f0;
  margin-bottom: 5px;
  cursor: pointer;
}
</style>
