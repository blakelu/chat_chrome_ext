<template>
  <teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div 
          v-for="toast in toasts" 
          :key="toast.id" 
          class="toast-item"
          :class="[`toast-${toast.type}`, { 'with-action': toast.action }]"
        >
          <div class="toast-icon" v-if="getIcon(toast.type)">
            <el-icon>
              <component :is="getIcon(toast.type)" />
            </el-icon>
          </div>
          <div class="toast-content">
            <div v-if="toast.title" class="toast-title">{{ toast.title }}</div>
            <div class="toast-message">{{ toast.message }}</div>
          </div>
          <div v-if="toast.action" class="toast-action">
            <button @click="toast.action.callback">{{ toast.action.text }}</button>
          </div>
          <button class="toast-close" @click="removeToast(toast.id)">
            <!-- <el-icon><ep-close /></el-icon> -->
          </button>
        </div>
      </TransitionGroup>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, defineExpose } from 'vue';
import type { Component } from 'vue';
import { WarningFilled, SuccessFilled, InfoFilled, CircleCloseFilled } from '@element-plus/icons-vue';

interface ToastAction {
  text: string;
  callback: () => void;
}

interface Toast {
  id: number;
  message: string;
  title?: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timeout: number;
  action?: ToastAction;
}

const toasts = ref<Toast[]>([]);
let toastId = 0;

const getIcon = (type: string): Component => {
  switch (type) {
    case 'success': return SuccessFilled;
    case 'info': return InfoFilled;
    case 'warning': return WarningFilled;
    case 'error': return CircleCloseFilled;
    default: return InfoFilled;
  }
};

const addToast = (
  message: string,
  options: {
    title?: string;
    type?: 'success' | 'info' | 'warning' | 'error';
    timeout?: number;
    action?: ToastAction;
  } = {}
) => {
  const id = ++toastId;
  
  const toast: Toast = {
    id,
    message,
    title: options.title,
    type: options.type || 'info',
    timeout: options.timeout ?? 3000,
    action: options.action
  };
  
  toasts.value.push(toast);
  
  if (toast.timeout > 0) {
    setTimeout(() => removeToast(id), toast.timeout);
  }
  
  return id;
};

const removeToast = (id: number) => {
  const index = toasts.value.findIndex(toast => toast.id === id);
  if (index !== -1) {
    toasts.value.splice(index, 1);
  }
};

defineExpose({
  success: (message: string, options = {}) => addToast(message, { ...options, type: 'success' }),
  info: (message: string, options = {}) => addToast(message, { ...options, type: 'info' }),
  warning: (message: string, options = {}) => addToast(message, { ...options, type: 'warning' }),
  error: (message: string, options = {}) => addToast(message, { ...options, type: 'error' }),
  addToast,
  removeToast
});
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 9999;
  width: 320px;
  max-width: calc(100% - 32px);
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}

.toast-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 16px;
  background-color: var(--app-card-bg);
  border-left: 4px solid;
  border-radius: var(--app-border-radius-md);
  box-shadow: var(--app-shadow-md);
  pointer-events: auto;
  animation: slideIn 0.3s ease-out;
  position: relative;
}

.toast-item.toast-success {
  border-left-color: var(--app-success);
}

.toast-item.toast-info {
  border-left-color: var(--app-info);
}

.toast-item.toast-warning {
  border-left-color: var(--app-warning);
}

.toast-item.toast-error {
  border-left-color: var(--app-danger);
}

.toast-icon {
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 20px;
}

.toast-success .toast-icon {
  color: var(--app-success);
}

.toast-info .toast-icon {
  color: var(--app-info);
}

.toast-warning .toast-icon {
  color: var(--app-warning);
}

.toast-error .toast-icon {
  color: var(--app-danger);
}

.toast-content {
  flex: 1;
  min-width: 0;
  margin-right: 8px;
}

.toast-title {
  font-weight: 600;
  font-size: var(--app-font-size-base);
  color: var(--app-text-color);
  margin-bottom: 4px;
}

.toast-message {
  font-size: var(--app-font-size-small);
  color: var(--app-text-secondary);
  line-height: 1.5;
  word-break: break-word;
}

.toast-action {
  margin-top: 8px;
}

.toast-action button {
  background: none;
  border: none;
  color: var(--app-accent-color);
  font-size: var(--app-font-size-small);
  font-weight: 600;
  padding: 4px 8px;
  cursor: pointer;
  border-radius: var(--app-border-radius-sm);
  transition: background-color 0.2s;
}

.toast-action button:hover {
  background-color: rgba(var(--app-accent-color-rgb, 59, 130, 246), 0.1);
}

.toast-close {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  color: var(--app-text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  font-size: 16px;
}

.toast-close:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Transition group animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease-out;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* Dark mode adjustments */
:root[data-theme="dark"] .toast-close:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
