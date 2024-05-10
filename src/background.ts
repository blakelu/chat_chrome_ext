// 不支持ajax 使用fetch代替
// import { queryLastUnfinishTaskByThirdVerifyId } from '@/api/home'
let sideIsOpen = false
chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command === 'openSidePanel') {
    if (sideIsOpen) {
      chrome.runtime.sendMessage('closeSidePanel')
      sideIsOpen = false
    } else {
      chrome.sidePanel.open({ windowId: tab.windowId })
      sideIsOpen = true
    }
  } else if (command === 'newChat') {
    const currentTab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0]
    chrome.tabs.sendMessage(currentTab.id, { type: 'newChat' })
  }
})

chrome.runtime.onMessage.addListener((message) => {
  if (message === 'sidePanelOpened') {
    sideIsOpen = true
  }
})

// Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error))

// chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
//   if (!tab.url) return;
//   // Enables the side panel on google.com
//   await chrome.sidePanel.setOptions({
//     tabId,
//     path: 'popup.html',
//     enabled: true
//   });
// });
