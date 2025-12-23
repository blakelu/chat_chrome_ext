<template>
  <el-config-provider namespace="closeai">
    <div class="options-container">
      <div class="tabs">
        <div class="logo-container">
          <img src="@/assets/icons/icon.png" alt="Logo" class="app-logo" />
          <h1>CloseAI</h1>
        </div>
        <div class="tabs-list">
          <div
            v-for="item in tabs"
            :key="item.label"
            class="tab-item"
            :class="{ 'tab-active': activeTab === item.name }"
            @click="activeTab = item.name"
          >
            <div class="flex items-center gap-2">
              <img :src="item.icon" class="w-[16px]" />
              <div>{{ item.label }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="options-content">
        <div class="font-bold text-[24px] text-[#25263B]">{{ activeTitle }}</div>
        <component :is="activeComponent" />
      </div>
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import ApiSettings from '@/components/settings/ApiSettings.vue'
import ShortcutsSettings from '@/components/settings/ShortcutsSettings.vue'
import AboutSection from '@/components/settings/AboutSection.vue'
import SmartSetting from '@/components/settings/SmartSetting.vue'

import info from '@/assets/icons/info.svg'
import shortCut from '@/assets/icons/command.svg'
import settingConfig from '@/assets/icons/setting-config.svg'
import smartOptimization from '@/assets/icons/smart-optimization.svg'

const activeTab = ref('ApiSettings')
const tabs = [
  { label: 'API配置', name: 'ApiSettings', component: ApiSettings, icon: settingConfig },
  { label: '智能设置', name: 'SmartSetting', component: SmartSetting, icon: smartOptimization },
  { label: '其它设置', name: 'ShortcutsSettings', component: ShortcutsSettings, icon: shortCut },
  { label: '关于', name: 'AboutSection', component: AboutSection, icon: info }
]
const activeTitle = computed(() => {
  return tabs.find((tab) => tab.name === unref(activeTab))?.label
})
const activeComponent = computed(() => {
  return tabs.find((tab) => tab.name === unref(activeTab))?.component
})
</script>

<style lang="less" scoped>
.options-container {
  display: flex;
  justify-content: center;
  height: 100vh;
  overflow-y: hidden;
  background-color: #ffffff;
}
.tabs {
  width: 290px;
  border-right: 1px solid #e2e8f0;
  padding: 0 24px;
  flex-shrink: 0;

  .logo-container {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 24px 0;

    .app-logo {
      width: 36px;
      height: 36px;
      border-radius: 8px;
    }

    h1 {
      font-size: 20px;
      font-weight: 600;
      color: #0f172a;
      margin: 0;
    }
  }
  .tab-item {
    padding: 8px 12px;
    margin: 6px 0;
    border-radius: 12px;
    font-size: 16px;
    color: #333333;
    cursor: pointer;
    transition: background 0.2s ease;
    &:hover {
      background-color: #f0f0f0;
    }
  }
  .tab-active {
    background-color: rgba(0, 122, 255, 0.2);
    color: #4178de;
    font-weight: 600;
  }
}
.options-content {
  width: 960px;
  padding: 24px;
  overflow-y: auto;
}
</style>
