import { ref, watch, Ref } from 'vue';

type StorageType = 'local' | 'session' | 'chrome';

export function useAppStorage<T>(
  key: string,
  initialValue: T,
  options: {
    storage?: StorageType;
    serialize?: (value: T) => string;
    deserialize?: (value: string) => T;
    deep?: boolean;
    onError?: (error: Error) => void;
  } = {}
): Ref<T> {
  const {
    storage = 'local',
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    deep = true,
    onError = console.error
  } = options;
  
  // Create a reactive reference with initial value
  const storedValue = ref<T>(initialValue) as Ref<T>;
  
  // Try to get value from storage on mount
  try {
    let value: string | null = null;
    console.log(storage,chrome.storage)
    if (storage === 'local' && typeof chrome !== 'undefined' && chrome.storage) {
      // Use Chrome storage API if available
      chrome.storage.local.get([key], (result) => {
        if (result[key]) {
          try {
            storedValue.value = deserialize(result[key]);
          } catch (error) {
            onError(new Error(`Failed to parse stored value: ${error}`));
          }
        }
      });
    } else {
      // Use web storage API
      const storageObj = storage === 'local' ? localStorage : sessionStorage;
      value = storageObj.getItem(key);
      
      if (value) {
        storedValue.value = deserialize(value);
      }
    }
  } catch (error) {
    onError(new Error(`Failed to get stored value: ${error}`));
  }
  
  // Watch for changes and update storage
  watch(
    storedValue,
    (newValue) => {
      try {
        const serialized = serialize(newValue);
        
        if (storage === 'local' && typeof chrome !== 'undefined' && chrome.storage) {
          // Use Chrome storage API if available
          chrome.storage.local.set({ [key]: serialized });
        } else {
          // Use web storage API
          const storageObj = storage === 'local' ? localStorage : sessionStorage;
          storageObj.setItem(key, serialized);
        }
      } catch (error) {
        onError(new Error(`Failed to store value: ${error}`));
      }
    },
    { deep }
  );
  
  return storedValue;
}
