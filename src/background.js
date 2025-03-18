// Background script for the Chrome extension
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error))
  
// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener(async (tab) => {
  try {
    // First check if we can use the side panel
    if (chrome.sidePanel) {
      // Open the side panel
      await chrome.sidePanel.open({ tabId: tab.id });
      
      // Set the sidebar default width
      if (chrome.sidePanel.setPanelWidth) {
        await chrome.sidePanel.setPanelWidth({ width: 460 });
      }
    } else {
      // Fallback to opening in a popup
      chrome.windows.create({
        url: chrome.runtime.getURL('index.html'),
        type: 'popup',
        width: 460,
        height: 600
      });
    }
  } catch (error) {
    console.error('Error opening side panel:', error);
    // Fallback to popup if sidebar fails
    chrome.windows.create({
      url: chrome.runtime.getURL('index.html'),
      type: 'popup',
      width: 460,
      height: 600
    });
  }
});

// Register keyboard command handling
chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command === "open_side_panel") {
    try {
      if (chrome.sidePanel) {
        await chrome.sidePanel.open({ tabId: tab.id });
      }
    } catch (error) {
      console.error('Error handling command:', error);
    }
  }
});

// Monitor extension installation and updates
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // First time installation
    // chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') });
  } else if (details.reason === 'update') {
    // Extension was updated - can show update notes if needed
    const currentVersion = chrome.runtime.getManifest().version;
    console.log(`Extension updated to version ${currentVersion}`);
  }
});

// 保存当前激活的侧边栏信息
let activeSidePanelInfo = {
  tabId: null,
  windowId: null
};

// 在侧边栏打开时存储其ID
function registerSidePanel(tabId, windowId) {
  activeSidePanelInfo.tabId = tabId;
  activeSidePanelInfo.windowId = windowId;
}

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  if (message === 'sidePanelOpened') {
    if (sender.tab) {
      registerSidePanel(sender.tab.id, sender.tab.windowId);
    }
    sendResponse({ status: 'acknowledged' });
  }
  
  // 处理内容脚本发送的选中文本
  if (message && message.action === 'textSelected' && message.text) {
    // 尝试向侧边栏发送消息的函数
    const sendToSidePanel = () => {
      // 尝试使用 sidePanel API (新版本Chrome)
      if (chrome.sidePanel && chrome.sidePanel.sendMessage) {
        chrome.sidePanel.sendMessage({
          action: 'textSelected',
          text: message.text
        }).catch(err => {
          broadcastMessage();
        });
        return;
      }
      
      // 如果有活跃的侧边栏标签，向它发送消息
      if (activeSidePanelInfo.tabId) {
        chrome.tabs.sendMessage(activeSidePanelInfo.tabId, {
          action: 'textSelected',
          text: message.text
        }).catch(error => {
          broadcastMessage();
        });
      } else {
        broadcastMessage();
      }
    };

    // 广播消息给所有标签页和扩展页面
    const broadcastMessage = () => {
      chrome.runtime.sendMessage({
        action: 'textSelected',
        text: message.text
      }).catch(err => {
        // 忽略接收者不存在的错误
      });
    };

    sendToSidePanel();
    sendResponse({ status: 'received' });
  }
  
  // 要启用异步响应，返回true
  return true;
});

// 监听标签页关闭事件，清理侧边栏引用
chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === activeSidePanelInfo.tabId) {
    activeSidePanelInfo.tabId = null;
    activeSidePanelInfo.windowId = null;
  }
});

// 监听窗口关闭事件
chrome.windows.onRemoved.addListener((windowId) => {
  if (windowId === activeSidePanelInfo.windowId) {
    activeSidePanelInfo.tabId = null;
    activeSidePanelInfo.windowId = null;
  }
});