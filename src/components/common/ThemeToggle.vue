<template>
  <button 
    type="button" 
    class="theme-toggle" 
    @click="toggleTheme" 
    :aria-label="themeLabel"
  >
    <Transition name="theme-icon" mode="out-in">
      <component :is="themeIcon" class="theme-icon" />
    </Transition>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStorage, useMediaQuery } from '@vueuse/core'

// Import icons from element-plus
import { 
  Sunny as IconLight,
  Moon as IconDark,
  MagicStick as IconAuto
} from '@element-plus/icons-vue'

const props = defineProps({
  size: {
    type: String,
    default: 'medium' // small, medium, large
  }
})

const emit = defineEmits(['change'])

const defaultThemeSettings = {
  theme: 'light', // light, dark, auto
}

const themeSettings = useStorage('UI_SETTINGS', defaultThemeSettings, localStorage, { mergeDefaults: true })
const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')

// Compute actual theme based on setting and system preference
const actualTheme = computed(() => {
  if (themeSettings.value.theme === 'auto') {
    return prefersDark.value ? 'dark' : 'light'
  }
  return themeSettings.value.theme
})

// Icon to show based on current theme setting
const themeIcon = computed(() => {
  switch (themeSettings.value.theme) {
    case 'light': return IconLight
    case 'dark': return IconDark
    case 'auto': return IconAuto
    default: return IconLight
  }
})

// Accessible label for the button
const themeLabel = computed(() => {
  switch (themeSettings.value.theme) {
    case 'light': return '切换到深色模式'
    case 'dark': return '切换到自动模式'
    case 'auto': return '切换到浅色模式'
    default: return '切换主题'
  }
})

// Function to cycle through themes
function toggleTheme() {
  const themes = ['light', 'dark', 'auto']
  const currentIndex = themes.indexOf(themeSettings.value.theme)
  const nextIndex = (currentIndex + 1) % themes.length
  themeSettings.value.theme = themes[nextIndex]
  
  // Apply theme immediately
  if (themeSettings.value.theme === 'auto') {
    document.documentElement.setAttribute(
      'data-theme', 
      prefersDark.value ? 'dark' : 'light'
    )
  } else {
    document.documentElement.setAttribute('data-theme', themeSettings.value.theme)
  }
  
  emit('change', themeSettings.value.theme)
}
</script>

<style scoped>
.theme-toggle {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--app-text-color);
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.theme-toggle:hover {
  background-color: rgba(var(--app-text-color-rgb, 0, 0, 0), 0.05);
}

.theme-toggle:active {
  transform: scale(0.95);
}

.theme-icon {
  width: 20px;
  height: 20px;
  transition: color 0.2s ease;
}

/* Size variations */
.theme-toggle.small .theme-icon {
  width: 16px;
  height: 16px;
}

.theme-toggle.large .theme-icon {
  width: 24px;
  height: 24px;
}

/* Icon transition */
.theme-icon-enter-active,
.theme-icon-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.theme-icon-enter-from,
.theme-icon-leave-to {
  opacity: 0;
  transform: rotate(90deg);
}
</style>
