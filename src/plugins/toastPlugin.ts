import { App, createApp, Component, markRaw } from 'vue';
import Toast from '@/components/common/Toast.vue';

// Toast plugin type definitions
interface ToastAction {
  text: string;
  callback: () => void;
}

interface ToastOptions {
  title?: string;
  timeout?: number;
  action?: ToastAction;
}

interface ToastInstance {
  success(message: string, options?: ToastOptions): number;
  info(message: string, options?: ToastOptions): number;
  warning(message: string, options?: ToastOptions): number;
  error(message: string, options?: ToastOptions): number;
  removeToast(id: number): void;
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $toast: ToastInstance;
  }
}

// Create and mount Toast component
const mountToast = (): ToastInstance => {
  const toastApp = createApp(Toast as Component);
  const container = document.createElement('div');
  document.body.appendChild(container);
  
  const toastInstance = toastApp.mount(container) as unknown as ToastInstance;
  return markRaw(toastInstance);
};

// Create plugin
export const ToastPlugin = {
  install(app: App) {
    const toast = mountToast();
    app.config.globalProperties.$toast = toast;
    
    // Also provide toast as a global property
    app.provide('toast', toast);
  }
};

// Composable for using toast in setup
export const useToast = (): ToastInstance => {
  return markRaw(mountToast());
};
