/**
 * Content script for the Chrome extension
 * This script runs in the context of web pages and monitors text selection
 */
;(() => {
  let lastSelectedText = ''
  let selectionTimeout = null
  let isOptionKeyPressed = false
  let selectedTextInSidebar = false
  let smartMenuEnabled = false
  let smartMenuKey = 'Option'

  chrome.storage.local.get(['selectedTextInSidebar', 'smartMenuEnabled', 'smartMenuKey'], (result) => {
    if (result.selectedTextInSidebar) {
      selectedTextInSidebar = result.selectedTextInSidebar === 'false' ? false : true
    }
    if (result.smartMenuEnabled) {
      smartMenuEnabled = result.smartMenuEnabled === 'false' ? false : true
    }
    if (result.smartMenuKey) {
      smartMenuKey = JSON.parse(result.smartMenuKey)
      if (smartMenuKey == 'Command') {
        smartMenuKey = 'Meta'
      } else if (smartMenuKey == 'Option') {
        smartMenuKey = 'Alt'
      }
    }
  })
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (changes.selectedTextInSidebar) {
      selectedTextInSidebar = changes.selectedTextInSidebar.newValue === 'false' ? false : true
    }
    if (changes.smartMenuEnabled) {
      smartMenuEnabled = changes.smartMenuEnabled.newValue === 'false' ? false : true
    }
    if (changes.smartMenuKey) {
      smartMenuKey = JSON.parse(changes.smartMenuKey.newValue)
      if (smartMenuKey == 'Command') {
        smartMenuKey = 'Meta'
      } else if (smartMenuKey == 'Option') {
        smartMenuKey = 'Alt'
      }
    }
  })

  // Track option key state
  document.addEventListener('keydown', (e) => {
    if (e.key == smartMenuKey) {
      isOptionKeyPressed = true

      // Show menu if text is already selected
      const selectedText = window.getSelection().toString().trim()
      if (selectedText) {
        notifyTextSelected(selectedText)
      }
    }
  })

  document.addEventListener('keyup', (e) => {
    if (e.key == smartMenuKey) {
      isOptionKeyPressed = false

      // Notify to hide menu when option key is released
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        // First try to notify the injected app
        chrome.runtime
          .sendMessage({
            action: 'showFloatingMenu',
            data: null
          })
          .catch((error) => {
            console.error('Error sending hide menu message:', error)
          })
      }
    }
    if (!selectedTextInSidebar) return
    // Original keyup handler for text selection via keyboard
    if (e.key === 'Shift' || e.key.startsWith('Arrow') || e.key === 'End' || e.key === 'Home') {
      clearTimeout(selectionTimeout)
      selectionTimeout = setTimeout(() => {
        const selectedText = window.getSelection().toString().trim()

        if (selectedText || (!selectedText && lastSelectedText != '')) {
          lastSelectedText = selectedText

          // Notify sidebar as before
          if (typeof chrome !== 'undefined' && chrome.runtime) {
            chrome.runtime
              .sendMessage({
                action: 'textSelected',
                text: selectedText
              })
              .catch((error) => {
                console.error('Error sending selection message:', error)
              })
          }

          // Show menu if option key is pressed
          if (isOptionKeyPressed) {
            notifyTextSelected(selectedText)
          }
        }
      }, 300)
    }
  })

  // Monitor text selection
  document.addEventListener('mouseup', () => {
    // Delay to avoid quick selection issues
    clearTimeout(selectionTimeout)
    if (!selectedTextInSidebar) return
    selectionTimeout = setTimeout(() => {
      const selectedText = window.getSelection().toString().trim()
      if (selectedText || (!selectedText && lastSelectedText != '')) {
        lastSelectedText = selectedText

        // Send to extension sidebar as before
        if (typeof chrome !== 'undefined' && chrome.runtime) {
          chrome.runtime
            .sendMessage({
              action: 'textSelected',
              text: selectedText
            })
            .catch((error) => {
              console.error('Error sending selection message:', error)
            })
        }

        // Show menu if option key is pressed
        if (isOptionKeyPressed) {
          notifyTextSelected(selectedText)
        }
      } else if (!selectedText) {
        // Clear selection if text is empty (user clicked somewhere else)
        lastSelectedText = ''
      }
    }, 300)
  })

  // Function to notify about selected text with position
  function notifyTextSelected(selectedText) {
    if (!smartMenuEnabled) return
    const selection = window.getSelection()
    if (!selection.rangeCount) return

    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    // Get absolute position including scroll
    const position = {
      left: rect.left,
      top: rect.top,
      bottom: rect.bottom,
      right: rect.right,
      // Also send viewport coordinates for positioning popup
      viewportLeft: rect.left,
      viewportTop: rect.top,
      viewportBottom: rect.bottom,
      viewportRight: rect.right
    }

    // First try communicating with injected app directly
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime
        .sendMessage({
          action: 'showFloatingMenu',
          data: {
            text: selectedText,
            position: position
          }
        })
        .catch((error) => {
          console.error('Error sending selection with position:', error)
        })
    }
  }
})()
