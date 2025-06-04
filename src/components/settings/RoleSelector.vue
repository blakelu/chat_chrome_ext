<template>
  <div class="role-selector-container">
    <el-drawer v-model="visible" direction="btt" size="80%" :show-close="true">
      <template #header>
        <div class="drawer-header">
          <h3>选择角色</h3>
        </div>
      </template>
      <div class="role-selector">
        <div class="role-list">
          <div
            v-for="(role, index) in roleList"
            :key="index"
            class="role-item"
            :class="{ 'is-selected': selectedRole?.id === role.id }"
            @click="selectRole(role)"
          >
            <div class="role-info">
              <div class="role-name">{{ role.name }}</div>
              <div class="role-prompt">{{ role.prompt }}</div>
            </div>
            <div class="role-actions">
              <el-button size="small" type="primary" text @click.stop="editRole(role)">
                <el-icon @click.stop="editRole(role)"><ep-edit /></el-icon>
              </el-button>
              <el-button size="small" type="danger" text @click.stop="deleteRole(index)" v-if="!role.isDefault">
                <el-icon @click.stop="deleteRole(index)"><ep-delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>

        <div class="role-footer">
          <el-button type="primary" @click="handleAddRole">
            <el-icon><ep-plus /></el-icon>
            新增角色
          </el-button>
          <el-button @click="clearRole">取消角色</el-button>
        </div>
      </div>
    </el-drawer>
  </div>

  <RoleDialog v-model:visible="showRoleDialog" :role-data="editingRole" @confirm="handleRoleConfirm" />
</template>

<script setup lang="ts">
import { useAppStorage } from '@/composables/useAppStorage.ts'
import { ElMessage, ElMessageBox } from 'element-plus'
import RoleDialog from './RoleDialog.vue'
import { defaultRoles } from './role.ts'

interface Role {
  id: string
  name: string
  prompt: string
  isDefault?: boolean
}

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  select: [role: Role | null]
}>()

const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const roleList = useAppStorage('roleList', defaultRoles)
const selectedRole = useAppStorage<Role | null>('selectedRole', null)
const showRoleDialog = ref(false)
const editingRole = ref<Role | null>(null)

const selectRole = (role: Role) => {
  selectedRole.value = role
  emit('select', role)
  visible.value = false
  ElMessage.success(`已选择角色: ${role.name}`)
}

const clearRole = () => {
  selectedRole.value = null
  emit('select', null)
  visible.value = false
  ElMessage.success('已清除角色设定')
}

const handleAddRole = () => {
  editingRole.value = null
  showRoleDialog.value = true
}
const editRole = (role: Role) => {
  editingRole.value = { ...role }
  showRoleDialog.value = true
}

const deleteRole = async (index: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这个角色吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const deletedRole = roleList.value[index]
    roleList.value.splice(index, 1)

    // 如果删除的是当前选中的角色，清除选中状态
    if (selectedRole.value?.id === deletedRole.id) {
      selectedRole.value = null
      emit('select', null)
    }

    ElMessage.success('角色已删除')
  } catch {
    // User canceled
  }
}

const handleRoleConfirm = (roleData: Omit<Role, 'id'>) => {
  if (editingRole.value) {
    // 编辑模式
    const index = roleList.value.findIndex((r) => r.id === editingRole.value!.id)
    if (index !== -1) {
      roleList.value[index] = { ...editingRole.value, ...roleData }
      if (selectedRole.value?.id === editingRole.value!.id) {
        selectedRole.value = roleList.value[index]
        emit('select', selectedRole.value)
      }
      ElMessage.success('角色已更新')
    }
  } else {
    // 新增模式
    const newRole: Role = {
      id: Date.now().toString(),
      ...roleData
    }
    roleList.value.push(newRole)
    ElMessage.success('角色已添加')
  }

  editingRole.value = null
  showRoleDialog.value = false
}

watch(visible, (newVal) => {
  if (!newVal) {
    editingRole.value = null
    showRoleDialog.value = false
  }
})
</script>

<style lang="less" scoped>
.role-selector-container {
  :deep(.closeai-drawer__header) {
    margin-bottom: 0;
  }
  .drawer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      font-size: 18px;
      font-weight: 600;
      color: var(--app-text-color);
      margin: 0;
    }
  }
  .role-selector {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .role-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0; // 上下间距缩小
  }

  .role-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px; // 内边距缩小
    margin-bottom: 8px; // 卡片间距缩小
    background: #f8fafc;
    border-radius: 8px; // 圆角更小
    cursor: pointer;
    transition: all 0.2s ease;
    border: 2px solid transparent;
    min-height: 44px; // 卡片最小高度

    &:hover {
      background: #f1f5f9;
      transform: translateY(-1px);
    }

    &.is-selected {
      background: #eff6ff;
      border-color: #3b82f6;
      box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.1);
    }
  }

  .role-info {
    flex: 1;
    min-width: 0;
    margin-right: 8px;
  }

  .role-name {
    font-size: 15px;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 2px;
  }

  .role-prompt {
    font-size: 13px;
    color: #64748b;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .role-actions {
    display: flex;
    margin-left: 8px;
    .closeai-button--small {
      padding: 4px 8px;
      &:hover {
        transform: scale(1.05);
      }
    }
    .closeai-button + .closeai-button {
      margin-left: 0;
    }
  }

  .role-footer {
    padding: 8px 0;
    border-top: 1px solid #e2e8f0;
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }
}
</style>
