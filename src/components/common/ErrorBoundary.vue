<template>
  <div v-if="error" class="error-boundary">
    <div class="error-content">
      <div class="error-icon">
        <el-icon></el-icon>
      </div>
      <h3 class="error-title">出现了一些问题</h3>
      <p class="error-message">{{ error.message || '应用程序遇到了未知错误' }}</p>
      <div class="error-actions">
        <el-button type="primary" @click="resetError">重试</el-button>
        <el-popover 
          placement="top"
          :width="300"
          trigger="click"
          popper-class="error-details-popover"
        >
          <template #reference>
            <el-button>查看详情</el-button>
          </template>
          <template #default>
            <div class="error-details">
              <h4>错误详情</h4>
              <pre>{{ error.stack || JSON.stringify(error, null, 2) }}</pre>
            </div>
          </template>
        </el-popover>
      </div>
    </div>
  </div>
  <slot v-else></slot>
</template>

<script lang="ts">
export default {
  name: 'ErrorBoundary',
  data() {
    return {
      error: null as Error | null,
    };
  },
  methods: {
    resetError() {
      this.error = null;
      window.location.reload();
    },
  },
  errorCaptured(err: Error, vm: any, info: string) {
    this.error = err;
    console.error(`Error captured in ErrorBoundary: ${err.message} in ${info}`);
    return false; // Prevent error from propagating further
  },
};
</script>

<script setup lang="ts">
// This component uses both Options API (for error handling) and Composition API
</script>

<style scoped>
.error-boundary {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  padding: 24px;
  background-color: var(--app-bg-color);
}

.error-content {
  width: 100%;
  max-width: 500px;
  background-color: var(--app-card-bg);
  border-radius: var(--app-border-radius-lg);
  box-shadow: var(--app-shadow-md);
  padding: 32px 24px;
  text-align: center;
  border: 1px solid var(--app-border-color);
}

.error-icon {
  font-size: 56px;
  color: var(--app-danger);
  margin-bottom: 16px;
}

.error-title {
  font-size: var(--app-font-size-xl);
  font-weight: 600;
  margin: 0 0 8px 0;
  color: var(--app-text-color);
}

.error-message {
  font-size: var(--app-font-size-base);
  color: var(--app-text-secondary);
  margin: 0 0 24px 0;
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

/* For error details popover */
:deep(.error-details) {
  h4 {
    font-size: 14px;
    margin-top: 0;
    margin-bottom: 8px;
    color: var(--app-text-color);
  }
  
  pre {
    white-space: pre-wrap;
    font-size: 12px;
    background-color: var(--app-bg-color);
    padding: 8px;
    border-radius: var(--app-border-radius-sm);
    overflow-x: auto;
    color: var(--app-text-secondary);
    margin: 0;
  }
}
</style>
