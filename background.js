chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "bridge_context") {
    const { target, context } = request;
    
    // Store context and target intention
    chrome.storage.local.set({
      pendingBridge: {
        target: target,
        context: context,
        timestamp: Date.now()
      }
    }, () => {
      // Determine target URL
      let targetUrl = "";
      switch(target) {
        case "chatgpt":
          targetUrl = "https://chatgpt.com/";
          break;
        case "claude":
          targetUrl = "https://claude.ai/new";
          break;
        case "gemini":
          targetUrl = "https://gemini.google.com/app";
          break;
        default:
          sendResponse({ success: false, error: "Unknown target" });
          return;
      }
      
      // Open new tab
      chrome.tabs.create({ url: targetUrl }, (tab) => {
        sendResponse({ success: true, tabId: tab.id });
      });
    });
    
    return true; // Keep message channel open for async sendResponse
  }
});
