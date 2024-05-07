<template>
  <div class="flex flex-wrap gap-2">
    <div class="tags">
      <el-tag v-for="tag in modelList" :key="tag" closable :disable-transitions="false" @close="handleClose(tag)">
        {{ tag }}
      </el-tag>
      <el-input
        v-if="inputVisible"
        ref="InputRef"
        v-model="inputValue"
        class="!w-[140px]"
        size="small"
        @keyup.enter="handleInputConfirm"
        @blur="handleInputConfirm"
        />
      <el-button v-else class="button-new-tag" size="small" @click="showInput"> + New Model </el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useDraggable, type UseDraggableReturn } from 'vue-draggable-plus'

const inputValue = ref('')
const modelList = useStorage('modelList', [])
const inputVisible = ref(false)
const InputRef = ref<InstanceType<typeof ElInput>>()

useDraggable<UseDraggableReturn>('.tags', modelList, { animation: 150, handle: '.el-tag' })

const handleClose = async (tag: string) => {
  const res = await ElMessageBox.confirm('Are you sure to delete?', 'tip', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning'
  })
  if (res === 'confirm') {
    modelList.value.splice(modelList.value.indexOf(tag), 1)
  }
}

const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    InputRef.value!.input!.focus()
  })
}

const handleInputConfirm = () => {
  if (inputValue.value) {
    modelList.value.push(inputValue.value)
  }
  inputVisible.value = false
  inputValue.value = ''
}
</script>

<style lang="less" scoped>
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  :deep(.el-tag) {
    cursor: move;
  }
}
</style>
