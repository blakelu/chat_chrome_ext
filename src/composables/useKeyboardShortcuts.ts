import { onMounted, onUnmounted } from 'vue';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  handler: () => void;
  description?: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  function handleKeyDown(event: KeyboardEvent) {
    // Don't trigger shortcuts when typing in input fields
    if (
      event.target instanceof HTMLInputElement || 
      event.target instanceof HTMLTextAreaElement || 
      (event.target as HTMLElement)?.isContentEditable
    ) {
      return;
    }
    
    for (const shortcut of shortcuts) {
      if (
        event.key.toLowerCase() === shortcut.key.toLowerCase() &&
        (shortcut.ctrlKey === undefined || event.ctrlKey === shortcut.ctrlKey) &&
        (shortcut.altKey === undefined || event.altKey === shortcut.altKey) &&
        (shortcut.shiftKey === undefined || event.shiftKey === shortcut.shiftKey) &&
        (shortcut.metaKey === undefined || event.metaKey === shortcut.metaKey)
      ) {
        event.preventDefault();
        shortcut.handler();
        return;
      }
    }
  }
  
  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
  });
  
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
  });
  
  // Return all registered shortcuts (useful for help screens)
  const getShortcuts = () => shortcuts.map(s => ({
    key: s.key,
    ctrlKey: s.ctrlKey || false,
    altKey: s.altKey || false,
    shiftKey: s.shiftKey || false,
    metaKey: s.metaKey || false,
    description: s.description || ''
  }));
  
  return { getShortcuts };
}
