// 不支持ajax 使用fetch代替
// import { queryLastUnfinishTaskByThirdVerifyId } from '@/api/home'
console.log('service worker')

// function queryOrder(thirdVerifyId = '') {
//   const params = { thirdVerifyId }
//   queryLastUnfinishTaskByThirdVerifyId(params).then((res: any) => {
//     console.log('结果:', res)
//   })
// }
// queryOrder('12312312')
const GOOGLE_ORIGIN = 'https://www.google.com';

// Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (!tab.url) return;
  const url = new URL(tab.url);
  // Enables the side panel on google.com
  await chrome.sidePanel.setOptions({
    tabId,
    path: 'popup.html',
    enabled: true
  });
});
