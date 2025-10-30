<template>
  <el-dialog
    v-model="visible"
    :title="roleData ? '编辑角色' : '新增角色'"
    width="86%"
    append-to="#closeAI-app"
    :close-on-click-modal="false"
  >
    <el-form ref="formRef" :model="form" :rules="rules" labelPosition="top" label-width="80px">
      <el-form-item label="角色名称" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入角色名称"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>
      
      <el-form-item label="角色描述" prop="prompt">
        <el-input
          v-model="form.prompt"
          type="textarea"
          placeholder="请输入角色的提示词描述..."
          :rows="16"
          maxlength="3000"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
interface Role {
  id: string
  name: string
  prompt: string
  isDefault?: boolean
}

const props = defineProps<{
  visible: boolean
  roleData?: Role | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'confirm': [data: { name: string; prompt: string }]
}>()

const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const formRef = ref()
const form = ref({
  name: '',
  prompt: ''
})

const rules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 1, max: 50, message: '角色名称长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  prompt: [
    { required: true, message: '请输入角色描述', trigger: 'blur' },
    { min: 1, max: 3000, message: '角色描述长度在 1 到 3000 个字符', trigger: 'blur' }
  ]
}

const handleConfirm = async () => {
  try {
    await formRef.value.validate()
    emit('confirm', {
      name: form.value.name,
      prompt: form.value.prompt
    })
  } catch {
    // Validation failed
  }
}

watch(visible, (newVal) => {
  if (newVal && props.roleData) {
    // 编辑模式，填充数据
    form.value.name = props.roleData.name
    form.value.prompt = props.roleData.prompt
  } else if (newVal) {
    // 新增模式，清空表单
    form.value.name = ''
    form.value.prompt = ''
  }
  
  // 清除验证状态
  nextTick(() => {
    formRef.value?.clearValidate()
  })
})
</script>

<style lang="less" scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
