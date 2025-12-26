import { ref, watch, onScopeDispose } from 'vue'

const STORAGE_KEY = 'historyInfo'

// Shared state (singleton)
const historyData = ref<any[]>([])
const isReady = ref(false)
let isInitialized = false

// Initialize from chrome.storage.local
async function initializeStorage() {
  if (isInitialized) return
  isInitialized = true

  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    return new Promise<void>((resolve) => {
      chrome.storage.local.get([STORAGE_KEY], (result: any) => {
        if (result[STORAGE_KEY]) {
          try {
            const data = typeof result[STORAGE_KEY] === 'string' ? JSON.parse(result[STORAGE_KEY]) : result[STORAGE_KEY]
            historyData.value = Array.isArray(data) ? data : []
          } catch (e) {
            console.warn('Failed to parse historyInfo:', e)
            historyData.value = []
          }
        }
        isReady.value = true
        resolve()
      })
    })
  } else {
    // Fallback to localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      historyData.value = stored ? JSON.parse(stored) : []
    } catch (e) {
      historyData.value = []
    }
    isReady.value = true
  }
}

// Save function
function saveToStorage() {
  const serialized = JSON.stringify(historyData.value)

  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    chrome.storage.local.set({ [STORAGE_KEY]: serialized })
  } else {
    localStorage.setItem(STORAGE_KEY, serialized)
  }
}

// Watch for changes and save
let stopWatch: (() => void) | null = null

export function useHistoryStorage() {
  // Initialize on first use
  if (!isInitialized) {
    initializeStorage()

    // Setup watcher once
    stopWatch = watch(
      historyData,
      () => {
        saveToStorage()
      },
      { deep: false }
    )
  }

  return {
    data: historyData,
    isReady,
    // Helper to wait for ready
    waitForReady: () =>
      new Promise<void>((resolve) => {
        if (isReady.value) {
          resolve()
        } else {
          const unwatch = watch(isReady, (val) => {
            if (val) {
              unwatch()
              resolve()
            }
          })
        }
      })
  }
}
