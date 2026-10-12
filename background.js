/**
 * ContextBridge Service Worker (Manifest V3)
 * Manages extension lifecycle, cross-tab bridging, and workspace tab routing.
 */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // 1. Open Full Continuity Workspace Tab
  if (request.action === 'open_workspace') {
    const workspaceUrl = chrome.runtime.getURL('workspace.html') + (request.query ? `?${request.query}` : '');
    
    // Check if workspace tab is already open to avoid clutter
    chrome.tabs.query({ url: chrome.runtime.getURL('workspace.html') + '*' }, (tabs) => {
      if (tabs && tabs.length > 0) {
        chrome.tabs.update(tabs[0].id, { active: true, url: workspaceUrl }, (updatedTab) => {
          chrome.windows.update(updatedTab.windowId, { focused: true });
          sendResponse({ success: true, tabId: updatedTab.id });
        });
      } else {
        chrome.tabs.create({ url: workspaceUrl }, (newTab) => {
          sendResponse({ success: true, tabId: newTab.id });
        });
      }
    });
    return true; // async sendResponse
  }

  // 2. Bridge Context into Destination LLM Tab
  if (request.action === 'bridge_context') {
    const { target, context, promptText } = request;

    chrome.storage.local.set({
      pendingBridge: {
        target,
        context,
        promptText,
        timestamp: Date.now()
      }
    }, () => {
      let targetUrl = '';
      switch (target) {
        case 'chatgpt':
          targetUrl = 'https://chatgpt.com/';
          break;
        case 'claude':
          targetUrl = 'https://claude.ai/new';
          break;
        case 'gemini':
          targetUrl = 'https://gemini.google.com/app';
          break;
        default:
          sendResponse({ success: false, error: 'Unknown target provider' });
          return;
      }

      chrome.tabs.create({ url: targetUrl }, (tab) => {
        sendResponse({ success: true, tabId: tab.id });
      });
    });

    return true;
  }
});
