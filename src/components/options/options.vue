<template>
  <div class="options-container">
    <div class="tabs">
      <div class="logo-container">
        <img src="@/assets/icons/ROBOT.png" alt="Logo" class="app-logo" />
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
          {{ item.label }}
        </div>
      </div>
    </div>
    <div class="options-content">
      <div class="font-bold text-[24px] text-[#333]">{{ activeTitle }}</div>
      <component :is="activeComponent" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useStorage } from '@vueuse/core'
import { ElMessage } from 'element-plus'
// Import composable
import { useChat } from '@/composables/useChat.ts'
import ApiSettings from '@/components/settings/ApiSettings.vue'
import ModelSettings from '@/components/settings/ModelSettings.vue'
import UiSettings from '@/components/settings/UiSettings.vue'
import ShortcutsSettings from '@/components/settings/ShortcutsSettings.vue'
import RolePrompt from '@/components/settings/RolePrompt.vue'
import AboutSection from '@/components/settings/AboutSection.vue'

const activeTab = ref('ApiSettings')
const tabs = [
  { label: 'API配置', name: 'ApiSettings', component: ApiSettings },
  { label: '模型配置', name: 'ModelSettings', component: ModelSettings },
  { label: '界面设置', name: 'UiSettings', component: UiSettings },
  { label: '快捷键', name: 'ShortcutsSettings', component: ShortcutsSettings },
  { label: '角色设置', name: 'RolePrompt', component: RolePrompt },
  { label: '关于', name: 'AboutSection', component: AboutSection }
]
const activeTitle = computed(() => {
  return tabs.find((tab) => tab.name === unref(activeTab))?.label
})
const activeComponent = computed(() => {
  return tabs.find((tab) => tab.name === unref(activeTab))?.component
})
// UI theme settings
const themeSettings = useStorage(
  'UI_SETTINGS',
  {
    theme: 'light',
    fontSize: 'medium',
    density: 'comfortable',
    smoothScrolling: true,
    animations: true,
    highContrast: false,
    reducedMotion: false
  },
  localStorage,
  { mergeDefaults: true }
)

const setTheme = (theme: string) => {
  themeSettings.value.theme = theme
  document.documentElement.setAttribute('data-theme', theme)
  ElMessage.success(`已切换至${theme === 'light' ? '浅色' : theme === 'dark' ? '深色' : '自动'}模式`)
}
const { API_URL, API_KEY } = useChat()
// Apply theme on component mount
onMounted(() => {
  const theme = themeSettings.value.theme
  if (theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
  } else {
    document.documentElement.setAttribute('data-theme', theme)
  }
})

const onApiConfirm = (data: any) => {
  API_URL.value = data.API_URL
  API_KEY.value = data.API_KEY
  chrome.storage.local.set({ GPT_API_KEY: data.API_KEY, GPT_API_URL: data.API_URL })
}
</script>

<style lang="less" scoped>
.options-container {
  display: flex;
  height: 100vh;
  overflow-y: hidden;
  padding: 0 100px;
  background-color: #ffffff;
}
.tabs {
  width: 290px;
  border-right: 1px solid #e2e8f0;
  padding: 0 16px;

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
    width: 258px;
    padding: 8px 12px;
    margin: 6px 0;
    border-radius: 12px;
    font-size: 16px;
    color: #333333;
    cursor: pointer;
    &:hover {
      background-color: #f0f0f0;
    }
  }
  .tab-active {
    background-color: rgba(0, 122, 255, 0.2);
    color: #1b64ef;
    font-weight: 600;
  }
}
.options-content {
  flex: 1;
  padding: 24px;
  width: 100%;
  overflow-y: auto;
}
</style>
