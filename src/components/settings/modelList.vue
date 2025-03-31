<template>
  <el-dialog v-model="show" title="选择模型" width="600" @open="handleOpen">
    <div class="model-list" v-loading="loading">
      <div v-for="(model, index) in modelList" :key="index" class="model-item">
        <el-checkbox v-model="model.selected">
          {{ model.id }}
        </el-checkbox>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="show = false">Cancel</el-button>
        <el-button type="primary" @click="handleConfirm"> Confirm </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import OpenAI from 'openai'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  modelInfo: {
    type: Object,
    default: () => ({})
  }
})
const emit = defineEmits(['update:visible', 'confirm'])
const show = useVModel(props, 'visible', emit)
const modelList: any = ref([])
const loading = ref(false)

const handleOpen = async () => {
  let baseURL = props.modelInfo.API_URL
  if (baseURL.endsWith('/v1')) {
    baseURL = baseURL.slice(0, -3)
  } else if (baseURL.endsWith('/')) {
    baseURL = baseURL.slice(0, -1)
  } else if (baseURL.endsWith('#')) {
    baseURL = baseURL
  } else {
    baseURL = baseURL + '/v1'
  }

  const openai = new OpenAI({
    baseURL: baseURL,
    apiKey: props.modelInfo.API_KEY,
    dangerouslyAllowBrowser: true
  })
  loading.value = true
  const res: any = await openai.models.list()
  loading.value = false
  if (res.body.success) {
    modelList.value = res.data.sort((a, b) => a.id.localeCompare(b.id))
    if (props.modelInfo.modelList.length > 0) {
      modelList.value.forEach((model) => {
        if (props.modelInfo.modelList.includes(model.id)) {
          model.selected = true
        }
      })
    } else {
      modelList.value.forEach((model) => {
        model.selected = false
      })
    }
  } else {
    ElMessage.error('获取模型列表失败')
  }
}
const handleConfirm = () => {
  const selectedModels = modelList.value.filter((model) => model.selected).map((model) => model.id)
  if (selectedModels.length === 0) {
    ElMessage.error('请至少选择一个模型')
    return
  }
  show.value = false
  emit('confirm', selectedModels)
}
</script>

<style lang="less" scoped>
.model-list {
  height: 500px;
  overflow: auto;
  padding: 0 20px;
}
</style>
