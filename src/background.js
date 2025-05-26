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
        await chrome.sidePanel.setPanelWidth({ width: 460 })
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
    width: 460,
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

  // Create submenu items
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
            await chrome.sidePanel.setPanelWidth({ width: 460 })
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
  }
  // Enable async response
  return true
})

// Ensure side panel is ready before sending messages
function sendToExtension(message) {
  if (isSidePanelReady) {
    // If active side panel info is available, send there
    if (activeSidePanelInfo.windowId) {
      chrome.tabs.sendMessage(activeSidePanelInfo.windowId, message).catch(() => {
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
