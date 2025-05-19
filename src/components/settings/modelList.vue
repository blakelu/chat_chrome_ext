<template>
  <el-dialog v-model="show" title="选择模型" width="600" @open="handleOpen" modal-class="model-list-dialog">
    <div class="model-list" v-loading="loading">
      <div v-for="(model, index) in modelList" :key="index" class="model-item">
        <el-checkbox v-model="model.selected">
          {{ model.id }}
        </el-checkbox>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="show = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确认</el-button>
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
const modelList = ref<any>([])
const loading = ref(false)

const handleOpen = async () => {
  let baseURL = props.modelInfo.apiUrl
  if (baseURL.endsWith('/')) {
    baseURL = baseURL
  } else if (baseURL.endsWith('#')) {
    baseURL = baseURL.slice(0, -1)
  } else {
    baseURL = baseURL + '/v1'
  }

  const openai = new OpenAI({
    baseURL: baseURL,
    apiKey: props.modelInfo.apiKey,
    dangerouslyAllowBrowser: true
  })
  loading.value = true
  const res: any = await openai.models.list()
  loading.value = false
  if ((res.data && res.data.length > 0) || Array.isArray(res.body)) {
    const data = Array.isArray(res.body) ? res.body.map(item => ({ ...item, id: item.name })) : res.data
    modelList.value = data.sort((a, b) => a.id.localeCompare(b.id))
    if (props.modelInfo.modelList.length > 0) {
      props.modelInfo.modelList.forEach((model) => {
        const foundModel = modelList.value.find((m) => m.id === model)
        if (foundModel) {
          foundModel.selected = true
        } else {
          modelList.value.push({ id: model, selected: true })
        }
      })
    } else {
      modelList.value.forEach((model: any) => {
        model.selected = false
      })
    }
  } else {
    ElMessage.error('获取模型列表失败')
  }
}
const handleConfirm = () => {
  const selectedModels = modelList.value.filter((model: any) => model.selected).map((model: any) => model.id)
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
