// Background script for the Chrome extension
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => console.error(error))
// 保存当前激活的侧边栏信息
let activeSidePanelInfo = {
  tabId: null,
  windowId: null
}

// 在侧边栏打开时存储其ID
function registerSidePanel(tabId, windowId) {
  activeSidePanelInfo.tabId = tabId
  activeSidePanelInfo.windowId = windowId
}

// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener(async (tab) => {
  try {
    // First check if we can use the side panel
    if (chrome.sidePanel) {
      // Open the side panel
      await chrome.sidePanel.open({ windowId: tab.windowId })

      // Set the sidebar default width
      if (chrome.sidePanel.setPanelWidth) {
        await chrome.sidePanel.setPanelWidth({ width: 500 })
      }
      registerSidePanel(tab.id, tab.windowId)
    } else {
      // Fallback to opening in a popup
      openPopup()
    }
  } catch (error) {
    console.error('Error opening side panel:', error)
    // Fallback to popup if sidebar fails
    openPopup()
  }
})

// Helper function to open popup
function openPopup() {
  chrome.windows.create({
    url: chrome.runtime.getURL('index.html'),
    type: 'popup',
    width: 500,
    height: 600
  })
}

// Monitor extension installation and updates
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // First time installation
    console.log('Extension installed')
  } else if (details.reason === 'update') {
    // Extension was updated - can show update notes if needed
    const currentVersion = chrome.runtime.getManifest().version
    console.log(`Extension updated to version ${currentVersion}`)
  }

  // Create context menu items
  chrome.contextMenus.create({
    id: 'mainContextMenu',
    title: 'closeAI',
    contexts: ['all']
  })

  chrome.contextMenus.create({
    id: 'addToBlinko',
    parentId: 'mainContextMenu',
    title: '添加到Blinko笔记',
    contexts: ['selection']
  })
  chrome.contextMenus.create({
    id: 'summarizePage',
    parentId: 'mainContextMenu',
    title: '总结页面',
    contexts: ['all']
  })
  chrome.contextMenus.create({
    id: 'summarizePageWithSVG',
    parentId: 'mainContextMenu',
    title: '总结页面并结合SVG展示',
    contexts: ['all']
  })
})

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'summarizePage' || info.menuItemId === 'summarizePageWithSVG') {
    const ensureSidePanelOpen = async () => {
      if (chrome.sidePanel) {
        try {
          await chrome.sidePanel.open({ windowId: tab.windowId })
          if (chrome.sidePanel.setPanelWidth) {
            await chrome.sidePanel.setPanelWidth({ width: 500 })
          }
          registerSidePanel(tab.id, tab.windowId)
          return true // Side panel successfully opened
        } catch (error) {
          console.error('Error ensuring side panel is open:', error)
          return false // Failed to open side panel
        }
      }
      // return true // Side panel is already open
    }

    const fetchPageContent = () =>
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: getPageContent
      })

    // 确保侧边栏打开后发送页面内容
    ensureSidePanelOpen()
      .then(async (isPanelOpen) => {
        if (isPanelOpen) {
          return fetchPageContent()
        }
      })
      .then((injectionResults) => {
        console.log('injectionResults', injectionResults)
        if (injectionResults && injectionResults[0]) {
          const pageContent = injectionResults[0].result
          sendToExtension({
            action: info.menuItemId,
            content: pageContent,
            url: tab.url,
            title: tab.title,
            tabId: tab.id
          })
        }
      })
      .catch((error) => {
        console.error('Error processing summarizePage:', error)
      })
  }

  // 处理添加到Blinko笔记
  if (info.menuItemId === 'addToBlinko' && info.selectionText) {
    addSelectedTextToBlinko(info.selectionText, tab)
  }
})

// Function to get page content - will be injected into the active tab
function getPageContent() {
  console.log('getPageContent: Attempting to extract page content...');

  let contentElement = null;
  // Prioritized list of selectors for finding the main content area
  const selectors = [
    'article',
    'main',
    '[role="main"]',
    '.main-content',
    '#main-content',
    '.post-content',
    '.entry-content',
    '.article-body',
    '#articleBody',
    '.content',
    '#content',
    // Add more selectors if specific site structures are common targets
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    // Check if element exists and has a reasonable amount of text content
    if (element && element.innerText && element.innerText.trim().length > 200) {
      contentElement = element;
      console.log(`getPageContent: Found content using selector: ${selector}`);
      break;
    }
  }

  if (!contentElement) {
    console.log('getPageContent: No specific content element found, falling back to document.body.');
    contentElement = document.body;
  }

  // Clone the selected element to avoid modifying the live page
  const clone = contentElement.cloneNode(true);

  // Remove common non-content elements from the clone
  const elementsToRemoveSelectors = [
    'script', // Scripts
    'style', // Stylesheets
    'noscript', // Noscript content
    'iframe', // Embedded frames
    'nav', // Navigation bars
    'header', // Page or section headers (if not the main content itself)
    'footer', // Page or section footers
    'aside', // Sidebars or complementary content
    '[aria-hidden="true"]', // Elements explicitly hidden from assistive technologies
    '[hidden]', // Elements with the HTML 'hidden' attribute
    '[style*="display:none"]', // Elements hidden via inline style
    '[style*="visibility:hidden"]', // Elements hidden via inline style
    '.advertisement', // Common class for ads
    '.ad',
    '.ads',
    '.banner',
    '.skyscraper',
    '.sidebar', // Often contains non-primary content
    '.popup', // Pop-up elements
    '.cookie-banner', // Cookie consent banners
    '#comments', // Comment sections
    '.comments-area'
  ];

  clone.querySelectorAll(elementsToRemoveSelectors.join(', ')).forEach(el => el.remove());

  let content = clone.innerText || clone.textContent || ""; // Fallback to textContent if innerText is empty

  // Clean up whitespace:
  // 1. Replace multiple newlines/whitespace chars with a single newline.
  // 2. Trim leading/trailing whitespace.
  content = content.replace(/(\s\s+|\n\n+)/g, '\n').trim();

  console.log('getPageContent: Extracted raw content length:', content.length);
  const maxLength = 15000; // Limit to 15k chars
  if (content.length > maxLength) {
    console.log(`getPageContent: Content truncated to ${maxLength} characters.`);
    content = content.slice(0, maxLength);
  }

  console.log('getPageContent: Final content snippet:', content.substring(0, 200) + "...");
  return content;
}

// Track if the side panel is ready
let isSidePanelReady = false

// Listen for messages from the side panel to confirm readiness
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message && message.action === 'sidePanelReady') {
    isSidePanelReady = true
    sendResponse({ status: 'acknowledged' })
  } else if (message && message.action === 'textSelected' && message.text) {
    // Try sending to the side panel
    // sendToActiveTabOrBroadcast(message)
    sendResponse({ status: 'received' })
  } else if (message && message.action === 'showFloatingMenu' && message.data) {
    const { text, position } = message.data

    // If message came from a specific tab, try sending directly to that tab
    if (sender && sender.tab && sender.tab.id) {
      chrome.tabs
        .sendMessage(sender.tab.id, {
          action: 'showFloatingMenu',
          data: { text, position }
        })
        .catch(() => {
          // Ignore errors if content script isn't ready
        })
    }

    sendResponse({ status: 'received' })
  }

  // Enable async response
  return true
})

// Ensure side panel is ready before sending messages
function sendToExtension(message) {
  if (isSidePanelReady) {
    // If active side panel info is available, send there
    if (activeSidePanelInfo.tabId !== null) {
      chrome.tabs.sendMessage(activeSidePanelInfo.tabId, message).catch(() => {
        broadcastMessage(message)
      })
    } else {
      broadcastMessage(message)
    }
  } else {
    // Retry sending after a short delay if the side panel is not ready
    setTimeout(() => sendToExtension(message), 100)
  }
}

// Broadcast message to all extension pages
function broadcastMessage(message) {
  chrome.runtime.sendMessage(message).catch(() => {
    // Ignore receiver errors
  })
}
chrome.runtime.onConnect.addListener(function (port) {
  if (port.name === 'mySidepanel') {
    port.onDisconnect.addListener(async () => {
      isSidePanelReady = false
      activeSidePanelInfo.tabId = null
      activeSidePanelInfo.windowId = null
    });
  }
});

// 添加选中文字到Blinko笔记
async function addSelectedTextToBlinko(text, tab) {
  try {
    // 从 chrome.storage.local 获取 Blinko 配置
    const result = await chrome.storage.local.get('COMMON_SETTINGS')
    const settings = JSON.parse(result?.COMMON_SETTINGS)

    if (!settings || !settings.blinkoUrl || !settings.blinkoToken) {
      // 显示错误提示
      showNotificationInTab(tab.id, '请先在设置中配置 Blinko 地址和 Token', 'error')
      // 打开设置页面
      chrome.runtime.openOptionsPage()
      return
    }

    const blinkoUrl = settings.blinkoUrl
    const blinkoToken = settings.blinkoToken

    // 调用 Blinko API
    const response = await fetch(`${blinkoUrl}/api/v1/note/upsert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${blinkoToken}`
      },
      body: JSON.stringify({
        content: text,
        type: 0
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (data && data.id) {
      showNotificationInTab(tab.id, '已添加到 Blinko 笔记', 'success')
    } else {
      throw new Error('添加失败，未返回有效结果')
    }
  } catch (error) {
    console.error('添加到 Blinko 笔记失败:', error)
    showNotificationInTab(tab.id, '添加到 Blinko 笔记失败: ' + error.message, 'error')
  }
}

// 在页面中显示通知提示
function showNotificationInTab(tabId, message, type) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: (msg, notificationType) => {
      // 移除已存在的通知
      const existingNotification = document.getElementById('closeai-blinko-notification')
      if (existingNotification) {
        existingNotification.remove()
      }

      // 创建通知元素
      const notification = document.createElement('div')
      notification.id = 'closeai-blinko-notification'
      notification.textContent = msg
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        z-index: 2147483647;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition: opacity 0.3s ease, transform 0.3s ease;
        transform: translateX(0);
        opacity: 1;
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
        ${notificationType === 'success'
          ? 'background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white;'
          : 'background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white;'
        }
      `

      document.body.appendChild(notification)

      // 3秒后自动消失
      setTimeout(() => {
        notification.style.opacity = '0'
        notification.style.transform = 'translateX(100px)'
        setTimeout(() => notification.remove(), 300)
      }, 3000)
    },
    args: [message, type]
  }).catch(error => {
    console.error('显示通知失败:', error)
  })
}
