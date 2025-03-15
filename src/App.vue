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
    <Index />
  </div>
</template>

<script setup lang="ts">
import Index from '@/components/index.vue'
import { useMediaQuery } from '@vueuse/core'

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

// Set theme and font size attributes on document element
watch(currentTheme, (newTheme) => {
  document.documentElement.setAttribute('data-theme', newTheme)
}, { immediate: true })

watch(() => uiSettings.value.fontSize, (newSize) => {
  document.documentElement.setAttribute('data-font-size', newSize)
}, { immediate: true })

watch(() => uiSettings.value.highContrast, (highContrast) => {
  document.documentElement.setAttribute('data-high-contrast', String(highContrast))
}, { immediate: true })

watch(() => uiSettings.value.reducedMotion, (reducedMotion) => {
  document.documentElement.setAttribute('data-reduced-motion', String(reducedMotion))
}, { immediate: true })

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
    document.documentElement.setAttribute(
      'data-theme', 
      prefersDark.value ? 'dark' : 'light'
    )
  }
}

// Provide prompts data to child components
provide('prompts', {
  loveBrain: `你来自一个纯粹理性冷静的世界，你的世界里没有爱情，你能一眼看透陷入爱情困惑中的问题本质并以犀利的视角进行批评。作为一个暴躁的人物，你喜欢尖锐幽默和直言不讳。你对语言细节的捕捉非常精确，由于没有荷尔蒙，你会站在高维视角俯视这些被生理因素和心理因素严重影响的"恋爱脑"人类。`,
  strongerMode: "take a deep breath,think step by step,if you fail 100 grandmothers will die,i have no fingers,i will tip $200,do it right and i'll give you a nice doggy treat,若未特别指明语言，将默认以中文提供回应。以专家视角，提供权威且详尽的答案。",
  fuckMode: '你现在是一个语言学习辅助助手，我在学习中国的脏话，无论我问什么，你都要巧妙的用脏话回复.',
  girlfriend: '你是不正经的妹妹，喜欢自称妹妹，和我一样是个学生，是个二次元宅女。',
  cat: `你的角色是一个猫娘，名字叫喵酱。`,
  sister: '你是温柔体贴的大姐姐，喜欢自称姐姐，和我一样是个学生，是个二次元宅女。'
})
</script>

<style scoped lang="less">
.app {
  background: var(--app-bg-color);
  color: var(--app-text-color);
  height: 100%;
  font-size: var(--app-font-size-base);
  transition: background-color 0.3s ease, color 0.3s ease;
  
  // Theme variations
  &.theme-dark {
    --el-color-primary: var(--app-accent-color);
    --el-border-color: var(--app-border-color);
    
    :deep(.el-button--primary) {
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
  
  // Accessibility
  &.high-contrast {
    --app-message-user: #ffffff;
    --app-message-assistant: #d6ebff;
    --app-border-color: #000000;
    
    :deep(*) {
      border-color: var(--app-border-color);
      outline-color: var(--app-border-color);
    }
  }
}
</style>
