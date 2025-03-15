// Background script for the Chrome extension

// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener(async (tab) => {
  try {
    // First check if we can use the side panel
    if (chrome.sidePanel) {
      // Open the side panel
      await chrome.sidePanel.open({ tabId: tab.id });
      
      // Set the sidebar default width
      if (chrome.sidePanel.setPanelWidth) {
        await chrome.sidePanel.setPanelWidth({ width: 420 });
      }
    } else {
      // Fallback to opening in a popup
      chrome.windows.create({
        url: chrome.runtime.getURL('index.html'),
        type: 'popup',
        width: 420,
        height: 600
      });
    }
  } catch (error) {
    console.error('Error opening side panel:', error);
    // Fallback to popup if sidebar fails
    chrome.windows.create({
      url: chrome.runtime.getURL('index.html'),
      type: 'popup',
      width: 420,
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
    chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') });
  } else if (details.reason === 'update') {
    // Extension was updated - can show update notes if needed
    const currentVersion = chrome.runtime.getManifest().version;
    console.log(`Extension updated to version ${currentVersion}`);
  }
});

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === 'sidePanelOpened') {
    console.log('Side panel was opened');
  }
  
  // Always return false for asynchronous response
  return false;
});
