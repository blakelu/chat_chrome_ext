import { createApp } from 'vue';
import App from './App.vue';
import './index.css';

// Storage bridge for accessing Chrome storage from the injected app
const storageBridge = {
  // Track requests with unique IDs
  _requestCounter: 0,
  _pendingRequests: new Map(),
  
  // Get data from storage
  get(keys) {
    return new Promise((resolve) => {
      const requestId = ++this._requestCounter;
      
      // Store the resolve function to call when we get a response
      this._pendingRequests.set(requestId, resolve);
      
      // Send request to content script
      window.postMessage({
        source: 'closeai-injected-app',
        payload: {
          action: 'getStorageData',
          requestId,
          keys
        }
      }, '*');
    });
  },
  
  // Set data in storage
  set(data) {
    return new Promise((resolve) => {
      const requestId = ++this._requestCounter;
      
      // Store the resolve function to call when we get a response
      this._pendingRequests.set(requestId, resolve);
      
      // Send request to content script
      window.postMessage({
        source: 'closeai-injected-app',
        payload: {
          action: 'setStorageData',
          requestId,
          data
        }
      }, '*');
    });
  },
  
  // Handle incoming responses
  _handleResponse(response) {
    const { requestId, data, success } = response;
    const resolve = this._pendingRequests.get(requestId);
    
    if (resolve) {
      resolve(data || success);
      this._pendingRequests.delete(requestId);
    }
  }
};

// Make storageBridge available globally
window.closeAIStorageBridge = storageBridge;

// Set up window message listeners before mounting app
window.addEventListener('message', (event) => {
  // Only accept messages from our content script
  if (event.data.source === 'closeai-content-script') {
    // Handle storage responses
    if (event.data.payload.type === 'storageResponse' || 
        event.data.payload.type === 'storageSetResponse') {
      storageBridge._handleResponse(event.data.payload);
    } else {
      // Simulate chrome.runtime.onMessage for the app
      const customEvent = new CustomEvent('closeai-runtime-message', {
        detail: event.data.payload
      });
      document.dispatchEvent(customEvent);
    }
  }
});

// Execute mounting
const mountApp = () => {
  const appContainer = document.getElementById('closeAI-app');
  if (appContainer) {
    const app = createApp(App);
    app.mount(appContainer);
    console.log('CloseAI Vue app mounted');
  } else {
    console.error('CloseAI app container not found');
  }
};

mountApp();
