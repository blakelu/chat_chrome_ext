/**
 * Content script for the Chrome extension
 * This script runs in the context of web pages and monitors text selection
 */
(() => {
  let lastSelectedText = '';
  let selectionTimeout = null;
  // 监听文本选择事件
  document.addEventListener('mouseup', () => {
    // 延迟处理以避免快速选择引起的频繁触发
    clearTimeout(selectionTimeout);
    selectionTimeout = setTimeout(() => {
      const selectedText = window.getSelection().toString().trim();
      
      // 只有当选择的文本不为空且与上次不同时才发送
      if (selectedText && selectedText !== lastSelectedText) {
        lastSelectedText = selectedText;
        
        // 在 Chrome 扩展环境中，通过 runtime 发送消息
        if (typeof chrome !== 'undefined' && chrome.runtime) {
          chrome.runtime.sendMessage({
            action: 'textSelected',
            text: selectedText
          }).then(() => {
            console.log('Selection message sent successfully');
          }).catch(error => {
            console.error('Error sending selection message:', error);
          });
        }
      }
    }, 300);
  });

  // 监听键盘选择事件（比如 Shift+箭头）
  document.addEventListener('keyup', (e) => {
    // 如果是用于选择文本的键被释放
    if (e.key === 'Shift' || e.key.startsWith('Arrow') || e.key === 'End' || e.key === 'Home') {
      clearTimeout(selectionTimeout);
      selectionTimeout = setTimeout(() => {
        const selectedText = window.getSelection().toString().trim();
        
        if (selectedText && selectedText !== lastSelectedText) {
          lastSelectedText = selectedText;
          console.log('Text selected via keyboard:', selectedText.substring(0, 50) + '...');
          
          if (typeof chrome !== 'undefined' && chrome.runtime) {
            chrome.runtime.sendMessage({
              action: 'textSelected',
              text: selectedText
            }).then(() => {
              console.log('Selection message sent successfully');
            }).catch(error => {
              console.error('Error sending selection message:', error);
            });
          }
        }
      }, 300);
    }
  });

  console.log('Chat extension content script loaded successfully');
})();
