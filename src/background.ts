// 不支持ajax 使用fetch代替
// import { queryLastUnfinishTaskByThirdVerifyId } from '@/api/home'

chrome.commands.onCommand.addListener((command, tab) => {
  if (command === 'openSidePanel') {
    chrome.sidePanel.open({ windowId: tab.windowId })
  }
});

// Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
//   if (!tab.url) return;
//   // Enables the side panel on google.com
//   await chrome.sidePanel.setOptions({
//     tabId,
//     path: 'popup.html',
//     enabled: true
//   });
// });
