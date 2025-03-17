<template>
  <div class="settings-drawer">
    <el-drawer v-model="drawer" size="95%" direction="btt" :destroy-on-close="false">
      <template #header>
        <h3>设置中心</h3>
      </template>
      <div class="drawer-content">
        <el-tabs v-model="activeName" class="settings-tabs">
          <el-tab-pane label="API设置" name="API">
            <div class="tab-content">
              <ApiSettings @confirm="onConfirm" />
            </div>
          </el-tab-pane>
          <el-tab-pane label="模型设置" name="model">
            <div class="tab-content">
              <ModelSettings />
            </div>
          </el-tab-pane>
          <!-- <el-tab-pane label="界面设置" name="ui">
            <div class="tab-content">
              <UiSettings :themeSettings="themeSettings" @updateTheme="setTheme" />
            </div>
          </el-tab-pane>
          <el-tab-pane label="快捷键" name="shortcuts">
            <div class="tab-content">
              <ShortcutsSettings />
            </div>
          </el-tab-pane> -->
          <el-tab-pane label="关于" name="about">
            <div class="tab-content about-tab">
              <AboutSection />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useStorage } from '@vueuse/core'
import ApiSettings from './ApiSettings.vue'
import ModelSettings from './ModelSettings.vue'
import UiSettings from './UiSettings.vue'
import ShortcutsSettings from './ShortcutsSettings.vue'
import AboutSection from './AboutSection.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show', 'confirm'])

const drawer = useVModel(props, 'show', emit)
const activeName = ref('API')

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

const onConfirm = (val: any) => {
  emit('confirm', val)
}
</script>

<style lang="less" scoped>
.settings-drawer {
  :deep(.el-drawer__header) {
    margin-bottom: 10px;
  }

  :deep(.el-drawer__body) {
    padding: 0;
    overflow: hidden;
  }

  h3 {
    font-size: 20px;
    font-weight: 600;
    color: #0f172a;
    margin: 0;
  }

  .drawer-content {
    height: 100%;
    display: flex;
    flex-direction: column;

    .settings-tabs {
      height: 100%;

      :deep(.el-tabs__header) {
        //   background-color: #f8fafc;

        .el-tabs__item {
          font-size: 16px;
          font-weight: 500;
          color: #64748b;
          transition: all 0.3s ease;
          padding: 0 12px;
        }
      }
      //     &.is-active {
      //       color: #3b82f6;
      //       font-weight: 600;
      //     }

      //     &:hover {
      //       color: #3b82f6;
      //     }
      //   }

      //   .el-tabs__active-bar {
      //     background-color: #3b82f6;
      //     height: 3px;
      //     bottom: 0;
      //     border-radius: 3px 3px 0 0;
      //   }
      // }

      :deep(.el-tabs__content) {
        flex: 1;
        overflow-y: auto;

        .el-tab-pane {
          height: 100%;
        }
      }
    }

    .tab-content {
      height: 100%;
      padding: 0;
    }
  }
}
</style>
