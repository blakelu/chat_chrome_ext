<template>
  <div
    class="app"
    :class="[
      `theme-${currentTheme}`,
      `font-${uiSettings.fontSize}`,
      { 'high-contrast': uiSettings.highContrast },
      { 'reduced-motion': uiSettings.reducedMotion }
    ]"
  >
    <el-config-provider namespace="closeai">
      <Index />
    </el-config-provider>
  </div>
</template>

<script setup lang="ts">
import Index from '@/components/index.vue'
import { useMediaQuery, useStorage } from '@vueuse/core' // Added useStorage
import { computed, provide, watch, onMounted, onUnmounted } from 'vue' // Added provide

// Theme settings
const defaultUISettings = {
  theme: 'light', // light, dark, auto
  fontSize: 'medium',
  highContrast: false,
  reducedMotion: false
}

const uiSettings = useStorage('UI_SETTINGS', defaultUISettings, localStorage, { mergeDefaults: true })
const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')

// Compute the current theme based on settings and system preference
const currentTheme = computed(() => {
  if (uiSettings.value.theme === 'auto') {
    return prefersDark.value ? 'dark' : 'light'
  }
  return uiSettings.value.theme
})

const toggleTheme = () => {
  if (currentTheme.value === 'light') {
    uiSettings.value.theme = 'dark'
  } else {
    uiSettings.value.theme = 'light'
  }
}

provide('currentTheme', currentTheme)
provide('toggleTheme', toggleTheme)

// Set theme and font size attributes on document element
watch(
  currentTheme,
  (newTheme) => {
    document.documentElement.setAttribute('data-theme', newTheme)
  },
  { immediate: true }
)

// Check for required permissions
onMounted(() => {
  // Apply initial theme to prevent flash of incorrect theme
  syncThemeWithSystem()

  // Add listener for system theme changes if using auto theme
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', syncThemeWithSystem)

  // Clean up event listener on unmount
  onUnmounted(() => {
    mediaQuery.removeEventListener('change', syncThemeWithSystem)
  })
})

function syncThemeWithSystem() {
  if (uiSettings.value.theme === 'auto') {
    document.documentElement.setAttribute('data-theme', prefersDark.value ? 'dark' : 'light')
  }
  // uiSettings.value.theme = prefersDark.value ? 'dark' : 'light'
}
</script>

<style scoped lang="less">
.app {
  background: var(--app-bg-color);
  color: var(--app-text-color);
  height: 100%;
  font-size: var(--app-font-size-base);
  transition:
    background-color 0.3s ease,
    color 0.3s ease;

  // Theme variations
  &.theme-dark {
    --closeai-color-primary: var(--app-accent-color);
    --closeai-border-color: var(--app-border-color);

    :deep(.closeai-button--primary) {
      background-color: var(--app-accent-color);
      border-color: var(--app-accent-color);
    }
  }

  // Font size variations
  &.font-small {
    font-size: var(--app-font-size-small);
  }

  &.font-large {
    font-size: var(--app-font-size-large);
  }
}
</style>
