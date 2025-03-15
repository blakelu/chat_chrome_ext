<template>
  <div class="keyboard-shortcut" :title="title">
    <span 
      v-for="(key, index) in parsedKeys" 
      :key="index" 
      class="key"
      :class="{ 'modifier': isModifier(key) }"
    >
      {{ formatKey(key) }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  keys: {
    type: [String, Array],
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  platform: {
    type: String,
    default: () => {
      const isMac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
      return isMac ? 'mac' : 'windows';
    }
  }
});

// Parse the keys string or array into an array of individual keys
const parsedKeys = computed(() => {
  if (Array.isArray(props.keys)) {
    return props.keys;
  }
  
  return props.keys.includes('+') 
    ? props.keys.split('+').map(key => key.trim()) 
    : [props.keys];
});

// Check if a key is a modifier key
const isModifier = (key: string): boolean => {
  const modifiers = ['ctrl', 'command', 'cmd', 'shift', 'alt', 'option', 'meta'];
  return modifiers.includes(key.toLowerCase());
};

// Format key for display
const formatKey = (key: string): string => {
  const keyLower = key.toLowerCase();
  
  // Platform-specific key mapping
  if (props.platform === 'mac') {
    if (keyLower === 'ctrl') return '⌃';
    if (keyLower === 'cmd' || keyLower === 'command' || keyLower === 'meta') return '⌘';
    if (keyLower === 'alt' || keyLower === 'option') return '⌥';
    if (keyLower === 'shift') return '⇧';
    if (keyLower === 'escape' || keyLower === 'esc') return 'Esc';
    if (keyLower === 'backspace') return '⌫';
    if (keyLower === 'delete') return '⌦';
    if (keyLower === 'enter') return '↩';
    if (keyLower === 'return') return '⏎';
    if (keyLower === 'tab') return '⇥';
  } else {
    if (keyLower === 'meta' || keyLower === 'cmd' || keyLower === 'command') return 'Win';
    if (keyLower === 'alt') return 'Alt';
    if (keyLower === 'shift') return 'Shift';
    if (keyLower === 'ctrl') return 'Ctrl';
    if (keyLower === 'escape' || keyLower === 'esc') return 'Esc';
    if (keyLower === 'backspace') return 'Backspace';
    if (keyLower === 'delete') return 'Del';
    if (keyLower === 'enter' || keyLower === 'return') return 'Enter';
  }
  
  // Capitalize first letter for single character keys
  return key.length === 1 ? key.toUpperCase() : key.charAt(0).toUpperCase() + key.slice(1);
};
</script>

<style scoped>
.keyboard-shortcut {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  user-select: none;
}

.key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: var(--app-card-bg);
  border: 1px solid var(--app-border-color);
  border-radius: var(--app-border-radius-sm);
  min-width: 20px;
  height: 20px;
  padding: 2px 6px;
  font-size: var(--app-font-size-small);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace;
  color: var(--app-text-color);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
}

.key:not(:last-child)::after {
  content: "+";
  margin-left: 4px;
  color: var(--app-text-secondary);
  font-weight: 400;
}

.key.modifier {
  background-color: var(--app-bg-color);
  font-weight: 600;
}

/* Responsive styles for small screens */
@media (max-width: 768px) {
  .key {
    min-width: 16px;
    height: 16px;
    padding: 1px 4px;
    font-size: calc(var(--app-font-size-small) - 1px);
  }
}
</style>
