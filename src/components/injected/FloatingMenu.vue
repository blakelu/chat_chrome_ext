<template>
  <div ref="menuRef" class="floating-menu" :style="menuStyle">
    <div class="menu-item" @click="onAsk('explain')">
      <img src="@/assets/icons/speak.png" class="menu-icon" />
      解释
    </div>
    <div class="menu-item" @click="onAsk('translate')">
      <img src="@/assets/icons/translate.png" class="menu-icon" />
      翻译
    </div>
    <div class="menu-item" @click="onAsk('polish')">
      <img src="@/assets/icons/magic.png" class="menu-icon" />
      润色
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  position: {
    type: Object,
    required: true
  },
  selectedText: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close', 'askAI'])
const menuRef = ref(null)

const menuStyle = ref({
  top: `${props.position.bottom + 6}px`,
  left: `${props.position.left}px`
})

const onAsk = (type: string) => {
  // Just emit the event - no need to send message to contentScript
  emit('askAI', type)
  emit('close')
}

// Close menu when clicking outside
const handleClickOutside = (e) => {
  if (menuRef.value && !menuRef.value.contains(e.target)) {
    emit('close')
  }
}

// Close menu on escape key
const handleKeyup = (e) => {
  if (e.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
  document.addEventListener('keyup', handleKeyup)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  document.removeEventListener('keyup', handleKeyup)
})
</script>

<style lang="less" scoped>
.floating-menu {
  position: absolute;
  background: white;
  // width: 240px;
  padding: 0 6px;
  border-radius: 8px;
  box-shadow:
    0 6px 16px rgba(0, 0, 0, 0.12),
    0 3px 6px rgba(0, 0, 0, 0.08);
  z-index: 999999;
  border: 1px solid #e2e8f0;
  display: flex;
  font-family:
    system-ui,
    -apple-system,
    'Segoe UI',
    Roboto,
    sans-serif;
  .menu-item {
    min-width: 62px;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px;
    font-size: 13px;
    cursor: pointer;
    transition: background-color 0.2s;
    color: #333333;
    .menu-icon {
      width: 16px;
      height: 16px;
    }
  }

  .menu-item:hover {
    background-color: #f7fafc;
  }

  .menu-item.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .menu-item .closeai-icon {
    // color: #3b82f6;
    font-size: 16px;
  }
}
</style>
