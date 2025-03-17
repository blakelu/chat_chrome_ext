<template>
  <div class="keyboard-shortcut">
    <span 
      v-for="(key, index) in keys" 
      :key="index"
      class="key"
    >
      {{ formatKey(key) }}
      <span v-if="index < keys.length - 1" class="separator">+</span>
    </span>
    <span v-if="title" class="shortcut-title">{{ title }}</span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  keys: {
    type: Array,
    required: true
  },
  title: {
    type: String,
    default: ''
  }
})

// Format key for display
const formatKey = (key: string) => {
  // Special key mappings
  const keyMap = {
    'ctrl': '⌃',
    'shift': '⇧',
    'alt': '⌥',
    'meta': '⌘',
    'enter': '↩',
    'tab': '⇥',
    'esc': 'Esc',
    'escape': 'Esc',
    'arrowup': '↑',
    'arrowdown': '↓',
    'arrowleft': '←',
    'arrowright': '→',
    'backspace': '⌫',
    'delete': 'Del',
  }

  const lowercaseKey = key.toLowerCase()
  return keyMap[lowercaseKey] || key
}
</script>

<style scoped>
.keyboard-shortcut {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue';
}

.key {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  background-color: var(--app-keyshortcut-bg, #f1f5f9);
  border: 1px solid var(--app-keyshortcut-border, #cbd5e1);
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: var(--app-keyshortcut-color, #475569);
  min-width: 20px;
  justify-content: center;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.04);
}

.separator {
  margin-left: 4px;
  color: var(--app-text-secondary, #64748b);
  font-weight: normal;
}

.shortcut-title {
  margin-left: 8px;
  font-size: 12px;
  color: var(--app-text-secondary, #64748b);
}
</style>
