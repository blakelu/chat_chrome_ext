<template>
  <div class="my-drawer">
    <el-drawer v-model="drawer" title="role setting" size="50%" direction="btt">
      <el-input v-model="commonSettings.prompt" type="textarea" rows="15" />
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['update:show'])

const drawer = useVModel(props, 'show', emit)
const settings = ref({
  temperature: 1,
  limitContext: 6,
  quality: 'standard',
  dalleSize: '1024x1024',
  dalleStyle: 'vivid',
  stream: true,
  prompt: ''
})
const commonSettings = useStorage('COMMON_SETTINGS', settings, localStorage, { mergeDefaults: true })

</script>
<style lang="less" scoped>
:deep(.el-drawer__header) {
  margin-bottom: 10px;
  padding-top: 10px;
}
:deep(.el-drawer__body) {
  padding-top: 10px;
}
:deep(.el-textarea__inner) {
  height: 100%;
}
</style>
