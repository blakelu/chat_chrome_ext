// Remove direct Vue imports - we'll use a self-contained bundle approach
;(() => {
  // Function to add the mount point for our app
  const addAppContainer = () => {
    // const appContainer = document.createElement('div');
    // appContainer.id = 'closeAI-app';
    // document.body.appendChild(appContainer);
    // return appContainer
    const el = document.querySelector('body')
    if (el) {
      el.insertAdjacentHTML('afterend', '<div id="closeAI-app"></div>')
    }
  }

  // Create a messaging bridge between content script and injected app
  const setupMessageBridge = () => {
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('Content script received message:', message)

      // Forward message to the injected app
      window.postMessage(
        {
          source: 'closeai-content-script',
          payload: { message, sender }
        },
        '*'
      )

      // Keep the channel open for async responses
      return true
    })

    // Listen for messages from injected app to relay back to extension
    window.addEventListener('message', (event) => {
      // Only accept messages from our injected app
      if (event.data.source === 'closeai-injected-app') {
        console.log('Content script received message from injected app:', event.data.payload)

        // Handle storage requests from the injected app
        if (event.data.payload.action === 'getStorageData') {
          chrome.storage.local.get(event.data.payload.keys, (result) => {
            // Send the storage data back to the injected app
            window.postMessage(
              {
                source: 'closeai-content-script',
                payload: {
                  type: 'storageResponse',
                  requestId: event.data.payload.requestId,
                  data: result
                }
              },
              '*'
            )
          })
        }

        // Handle storage set requests
        if (event.data.payload.action === 'setStorageData') {
          chrome.storage.local.set(event.data.payload.data, () => {
            window.postMessage(
              {
                source: 'closeai-content-script',
                payload: {
                  type: 'storageSetResponse',
                  requestId: event.data.payload.requestId,
                  success: true
                }
              },
              '*'
            )
          })
        }

        // Forward other messages to the appropriate extension component
        if (event.data.payload.responseToBackground) {
          chrome.runtime.sendMessage(event.data.payload.data).catch((err) => console.error('Error sending message to background:', err))
        }
      }
    })
  }

  // Main initialization
  const initializeApp = () => {
    // Make sure we have a body
    if (document.body) {
      addAppContainer()

      // Set up messaging before loading the app
      setupMessageBridge()

      // Load the bundled app script dynamically
      const script = document.createElement('script')
      script.src = chrome.runtime.getURL('components/injected/injected-app.js')
      script.onload = () => {
        // This will be called after the injected-app.js is loaded
        console.log('CloseAI injected app loaded')
      }
      document.head.appendChild(script)
    }
  }

  // Initialize when the page is ready
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initializeApp)
  } else {
    initializeApp()
  }
})()
