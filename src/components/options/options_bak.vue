<template>
  <div class="options-container">
    <header class="options-header">
      <div class="logo-container">
        <img src="@/assets/icons/ROBOT.png" alt="Logo" class="app-logo" />
        <h1>CloseAI 设置</h1>
      </div>
    </header>

    <main class="options-content">
      <el-tabs v-model="activeTab" tabPosition="left" class="settings-tabs">
        <el-tab-pane label="API设置" name="api">
          <div class="tab-content">
            <ApiSettings @confirm="onApiConfirm" />
          </div>
        </el-tab-pane>
        <el-tab-pane label="模型设置" name="model">
          <div class="tab-content">
            <ModelSettings />
          </div>
        </el-tab-pane>
        <el-tab-pane label="界面设置" name="ui">
          <div class="tab-content">
            <UiSettings :themeSettings="themeSettings" @updateTheme="setTheme" />
          </div>
        </el-tab-pane>
        <el-tab-pane label="快捷键" name="shortcuts">
          <div class="tab-content">
            <ShortcutsSettings />
          </div>
        </el-tab-pane>
        <el-tab-pane label="角色设置" name="role">
          <div class="tab-content">
            <RolePrompt :show="true" />
          </div>
        </el-tab-pane>
        <el-tab-pane label="关于" name="about">
          <div class="tab-content about-tab">
            <AboutSection />
          </div>
        </el-tab-pane>
      </el-tabs>
    </main>

    <footer class="options-footer">
      <div class="footer-content">
        <span>© {{ new Date().getFullYear() }} CloseAI Team</span>
      </div>
    </footer>
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

const activeTab = ref('api')

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
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--app-bg-color, #f8fafc);
}

.options-header {
  padding: 16px 24px;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  z-index: 10;

  .logo-container {
    display: flex;
    align-items: center;
    gap: 12px;

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
}

.options-content {
  flex: 1;
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;

  .settings-tabs {
    height: 100%;

    :deep(.el-tabs__header) {
      margin-bottom: 24px;

      .el-tabs__item {
        font-size: 16px;
        padding: 0 24px;
      }
    }

    :deep(.el-tabs__content) {
      background-color: #fff;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }

    .tab-content {
      min-height: 50vh;
    }

    .about-tab {
      display: flex;
      justify-content: center;
    }
  }
}

.options-footer {
  padding: 16px 24px;
  background-color: #fff;
  border-top: 1px solid #e2e8f0;

  .footer-content {
    text-align: center;
    color: #64748b;
    font-size: 14px;
  }
}
</style>
