/**
 * ContextBridge Content Script
 * Provider detection, DOM conversation capture, and non-intrusive continuation injection.
 */

// Identify the current platform
function getPlatform() {
  const host = window.location.hostname;
  if (host.includes('chatgpt.com')) return 'chatgpt';
  if (host.includes('claude.ai')) return 'claude';
  if (host.includes('gemini.google.com')) return 'gemini';
  return 'unknown';
}

function getPlatformDisplayName(platform) {
  switch (platform) {
    case 'chatgpt': return 'ChatGPT';
    case 'claude': return 'Claude';
    case 'gemini': return 'Gemini';
    default: return 'AI Assistant';
  }
}

// 1. EXTRACT CONVERSATION MESSAGES
function extractMessages() {
  const platform = getPlatform();
  const messages = [];

  try {
    if (platform === 'chatgpt') {
      const elements = document.querySelectorAll('[data-message-author-role]');
      elements.forEach((el, index) => {
        const role = el.getAttribute('data-message-author-role') || 'unknown';
        const text = el.innerText || el.textContent || '';
        if (text.trim()) {
          messages.push({
            role: role === 'user' ? 'user' : 'assistant',
            content: text.trim(),
            sequence: index + 1
          });
        }
      });
    } else if (platform === 'claude') {
      const elements = document.querySelectorAll('.font-user-message, .font-claude-message');
      if (elements.length > 0) {
        elements.forEach((el, index) => {
          const isUser = el.className.includes('user');
          const text = el.innerText || el.textContent || '';
          if (text.trim()) {
            messages.push({
              role: isUser ? 'user' : 'assistant',
              content: text.trim(),
              sequence: index + 1
            });
          }
        });
      } else {
        // Fallback for Claude dynamic container
        const items = document.querySelectorAll('[data-test-render-count]');
        items.forEach((el, index) => {
          const text = el.innerText || el.textContent || '';
          if (text.trim()) {
            messages.push({
              role: index % 2 === 0 ? 'user' : 'assistant',
              content: text.trim(),
              sequence: index + 1
            });
          }
        });
      }
    } else if (platform === 'gemini') {
      const elements = document.querySelectorAll('user-query, message-content, model-response');
      elements.forEach((el, index) => {
        const tag = el.tagName.toLowerCase();
        const role = tag === 'user-query' ? 'user' : 'assistant';
        const text = el.innerText || el.textContent || '';
        if (text.trim()) {
          messages.push({
            role,
            content: text.trim(),
            sequence: index + 1
          });
        }
      });
    }
  } catch (err) {
    console.error('ContextBridge extraction error:', err);
  }

  return messages;
}

function detectPageStatus() {
  const platform = getPlatform();
  if (platform === 'unknown') {
    return { supported: false };
  }

  const messages = extractMessages();
  let title = document.title || `${getPlatformDisplayName(platform)} Conversation`;
  title = title.replace(/\s*-\s*(ChatGPT|Claude|Gemini)$/i, '').trim();

  return {
    supported: true,
    platform,
    providerName: getPlatformDisplayName(platform),
    title: title || `${getPlatformDisplayName(platform)} Chat`,
    messageCount: messages.length,
    url: window.location.href
  };
}

// 2. LISTEN FOR MESSAGES FROM POPUP & WORKSPACE
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'detect_page') {
    const status = detectPageStatus();
    sendResponse(status);
    return false;
  }

  if (request.action === 'extract_context') {
    const status = detectPageStatus();
    const messages = extractMessages();
    sendResponse({
      success: true,
      platform: status.platform,
      provider: status.providerName,
      title: status.title,
      messages
    });
    return false;
  }
});

// 3. TOAST NOTIFICATION
function showToast(message, duration = 4000) {
  const existing = document.getElementById('contextbridge-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'contextbridge-toast';
  toast.textContent = message;
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    backgroundColor: '#1a1b27',
    color: '#b8a0ff',
    border: '1px solid #34364a',
    borderRadius: '10px',
    padding: '12px 20px',
    fontSize: '14px',
    fontFamily: 'system-ui, sans-serif',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
    zIndex: '999999',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
    opacity: '0',
    transform: 'translateY(10px)'
  });

  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// 4. INJECT CONTEXT
async function injectContext(text) {
  const platform = getPlatform();

  // Retry finding the input box for up to 6 seconds
  let inputEl = null;
  for (let attempt = 0; attempt < 12; attempt++) {
    if (platform === 'chatgpt') {
      inputEl = document.querySelector('#prompt-textarea') || document.querySelector('textarea');
    } else if (platform === 'claude') {
      inputEl = document.querySelector('div[contenteditable="true"]');
    } else if (platform === 'gemini') {
      inputEl = document.querySelector('.ql-editor') || document.querySelector('rich-textarea div[contenteditable="true"]');
    }
    if (inputEl) break;
    await new Promise(r => setTimeout(r, 500));
  }

  if (inputEl) {
    if (inputEl.tagName.toLowerCase() === 'textarea') {
      inputEl.value = text;
      inputEl.dispatchEvent(new Event('input', { bubbles: true }));
      inputEl.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (inputEl.getAttribute('contenteditable') === 'true') {
      inputEl.focus();
      document.execCommand('insertText', false, text);
    }
    showToast('🌉 ContextBridge: Continuity prompt injected into prompt box!');
  } else {
    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(text);
      showToast('🌉 ContextBridge: Prompt copied to clipboard! Paste with Ctrl+V (Cmd+V).', 6000);
    } catch {
      showToast('🌉 ContextBridge: Please copy your brief from the extension popup.', 5000);
    }
  }
}

// 5. CHECK FOR PENDING BRIDGE ON PAGE LOAD
chrome.storage.local.get(['pendingBridge'], (result) => {
  const pending = result.pendingBridge;
  if (pending) {
    const now = Date.now();
    const platform = getPlatform();

    if (pending.target === platform && (now - pending.timestamp < 5 * 60 * 1000)) {
      const textToInject = pending.promptText || (
        Array.isArray(pending.context)
          ? pending.context.map(m => `[${m.role.toUpperCase()}]: ${m.content}`).join('\n\n')
          : String(pending.context)
      );

      chrome.storage.local.remove(['pendingBridge'], () => {
        setTimeout(() => injectContext(textToInject), 1200);
      });
    }
  }
});
