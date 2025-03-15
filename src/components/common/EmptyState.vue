<template>
  <div class="empty-state" :class="[`size-${size}`, { 'is-loading': loading }]">
    <div class="empty-icon" v-if="icon || loading">
      <div v-if="loading" class="loading-spinner"></div>
      <component :is="icon" v-else-if="icon" />
      <slot name="icon" v-else></slot>
    </div>
    
    <div class="empty-content">
      <h3 v-if="title" class="empty-title">{{ title }}</h3>
      <p v-if="description" class="empty-description">{{ description }}</p>
      <slot></slot>
    </div>
    
    <div v-if="$slots.actions" class="empty-actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  icon: {
    type: [Object, Function],
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'medium',
    validator: (val: string) => ['small', 'medium', 'large'].includes(val)
  }
});
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px;
  color: var(--app-text-secondary);
}

.empty-icon {
  margin-bottom: 16px;
  color: var(--app-text-secondary);
  opacity: 0.7;
}

.size-small .empty-icon {
  font-size: 32px;
}

.size-medium .empty-icon {
  font-size: 48px;
}

.size-large .empty-icon {
  font-size: 64px;
}

.empty-title {
  color: var(--app-text-color);
  font-weight: 600;
  margin: 0 0 8px 0;
}

.size-small .empty-title {
  font-size: var(--app-font-size-base);
}

.size-medium .empty-title {
  font-size: var(--app-font-size-large);
}

.size-large .empty-title {
  font-size: var(--app-font-size-xl);
}

.empty-description {
  color: var(--app-text-secondary);
  margin: 0 0 16px 0;
  max-width: 300px;
}

.size-small .empty-description {
  font-size: var(--app-font-size-small);
}

.empty-actions {
  margin-top: 16px;
  display: flex;
  gap: 8px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--app-text-secondary);
  border-top-color: transparent;
  animation: spin 1s linear infinite;
}

.size-small .loading-spinner {
  width: 20px;
  height: 20px;
}

.size-medium .loading-spinner {
  width: 32px;
  height: 32px;
}

.size-large .loading-spinner {
  width: 48px;
  height: 48px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
