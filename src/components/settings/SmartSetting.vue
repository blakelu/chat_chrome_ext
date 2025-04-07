<template>
  <div class="smart-setting">
    <div class="h-[240px] bg-[#FFF] p-[50px] flex items-center">
      <img src="@/assets/icons/selectedText.png" />
    </div>
    <div class="flex justify-between items-center py-[12px] px-[20px]">
      <div class="text-[16px] text-[#333] font-[600]">在侧边栏中自动引用选中的文本</div>
      <el-switch v-model="selectedTextInSidebar" />
    </div>
  </div>
  <div class="smart-setting !mt-[20px]">
    <div class="h-[240px] bg-[#FFF] p-[60px] flex items-center">
      <img src="@/assets/icons/smartMenu.png" />
    </div>
    <div class="flex justify-between items-center py-[12px] px-[20px]">
      <div class="text-[16px] text-[#333] font-[600]">网页智能菜单</div>
      <el-switch v-model="smartMenuEnabled" />
    </div>
    <div class="pb-[12px] px-[20px] flex items-center gap-1">
      <div class="text-[16px] text-[#333] font-[600]">当选中文本时按下</div>
      <el-select v-model="smartMenuKey" size="small" class="w-[100px]">
        <el-option label="Control" value="Control" />
        <el-option label="Option" value="Option" />
        <el-option label="Command" value="Command" />
      </el-select>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useAppStorage } from '@/composables/useAppStorage.ts'

const selectedTextInSidebar = useAppStorage('selectedTextInSidebar', true)
const smartMenuEnabled = useAppStorage('smartMenuEnabled', true)
const smartMenuKey = useAppStorage('smartMenuKey', 'option')
</script>

<style lang="less" scoped>
.smart-setting {
  width: 680px;
  margin-top: 8px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}
</style>
