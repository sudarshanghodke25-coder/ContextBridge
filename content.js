// Helper to identify the current platform
function getPlatform() {
  const host = window.location.hostname;
  if (host.includes("chatgpt.com")) return "chatgpt";
  if (host.includes("claude.ai")) return "claude";
  if (host.includes("gemini.google.com")) return "gemini";
  return "unknown";
}

// 1. EXTRACT CONTEXT
function extractContext() {
  const platform = getPlatform();
  let messages = [];

  try {
    if (platform === "chatgpt") {
      const elements = document.querySelectorAll('[data-message-author-role]');
      elements.forEach(el => {
        const role = el.getAttribute('data-message-author-role');
        const text = el.innerText || el.textContent;
        if (text.trim()) {
          messages.push({ role, text: text.trim() });
        }
      });
    } 
    else if (platform === "claude") {
      // Claude DOM changes often. Trying a heuristic approach finding message blocks.
      const elements = document.querySelectorAll('.font-user-message, .font-claude-message');
      elements.forEach(el => {
        const role = el.className.includes('user') ? 'user' : 'assistant';
        const text = el.innerText || el.textContent;
        if (text.trim()) {
          messages.push({ role, text: text.trim() });
        }
      });
    }
    else if (platform === "gemini") {
      const elements = document.querySelectorAll('user-query, message-content');
      elements.forEach(el => {
        const role = el.tagName.toLowerCase() === 'user-query' ? 'user' : 'assistant';
        const text = el.innerText || el.textContent;
        if (text.trim()) {
          messages.push({ role, text: text.trim() });
        }
      });
    }
  } catch (e) {
    console.error("Context Bridge: Error extracting context", e);
  }

  return messages;
}

// Listen for extraction requests from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extract_context") {
    const context = extractContext();
    sendResponse({ success: true, context: context });
  }
});

// 2. INJECT CONTEXT
function formatContextForInjection(contextArray) {
  let formatted = "Here is the context of my previous conversation:\n\n";
  contextArray.forEach(msg => {
    const roleName = msg.role === 'user' ? 'Me' : 'AI';
    formatted += `--- ${roleName} ---\n${msg.text}\n\n`;
  });
  formatted += "--- End of Context ---\n\nPlease continue the conversation from here.";
  return formatted;
}

async function injectContext(text) {
  const platform = getPlatform();
  
  // Wait a bit for the page to fully load UI elements
  await new Promise(r => setTimeout(r, 2000));

  let inputEl = null;

  if (platform === "chatgpt") {
    inputEl = document.querySelector('#prompt-textarea');
  } else if (platform === "claude") {
    inputEl = document.querySelector('div[contenteditable="true"]');
  } else if (platform === "gemini") {
    inputEl = document.querySelector('.ql-editor') || document.querySelector('rich-textarea div[contenteditable="true"]');
  }

  if (inputEl) {
    // Inject text
    if (inputEl.tagName.toLowerCase() === 'textarea') {
      inputEl.value = text;
      // Trigger events
      inputEl.dispatchEvent(new Event('input', { bubbles: true }));
      inputEl.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (inputEl.getAttribute('contenteditable') === 'true') {
      // For contenteditable, setting textContent or innerText
      // It's often safer to use execCommand or simulate paste
      inputEl.focus();
      document.execCommand('insertText', false, text);
    }
    console.log("Context Bridge: Context injected successfully.");
  } else {
    console.log("Context Bridge: Could not find input box to inject context. Copying to clipboard instead.");
    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(text);
      alert("Context Bridge: Could not find the chat input. The context has been copied to your clipboard. You can paste it now.");
    } catch (e) {
      console.error("Context Bridge: Clipboard write failed", e);
    }
  }
}

// On page load, check if we need to inject context
chrome.storage.local.get(['pendingBridge'], (result) => {
  const pending = result.pendingBridge;
  if (pending) {
    const now = Date.now();
    const platform = getPlatform();
    
    // Check if the pending bridge is for this platform and not too old (e.g. < 5 minutes)
    if (pending.target === platform && (now - pending.timestamp < 5 * 60 * 1000)) {
      const formattedText = formatContextForInjection(pending.context);
      
      // Clear the pending state so we don't inject again on refresh
      chrome.storage.local.remove(['pendingBridge'], () => {
        injectContext(formattedText);
      });
    }
  }
});
