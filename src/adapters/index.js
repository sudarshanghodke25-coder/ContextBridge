/**
 * ContextBridge Provider Adapters
 * Encapsulates provider-specific DOM selectors, page matching, and context extraction.
 */

export const ChatGPTAdapter = {
  id: 'chatgpt',
  displayName: 'ChatGPT',
  matches(url) {
    try {
      const parsed = typeof url === 'string' ? new URL(url) : url;
      return parsed.hostname.includes('chatgpt.com');
    } catch {
      return false;
    }
  },
  detectConversation() {
    let title = document.title ? document.title.replace(/\s*-\s*ChatGPT$/i, '').trim() : '';
    if (!title || title === 'ChatGPT') {
      const h1 = document.querySelector('h1');
      if (h1 && h1.innerText) title = h1.innerText.trim();
    }
    const messageElements = document.querySelectorAll('[data-message-author-role]');
    return {
      title: title || 'ChatGPT Conversation',
      messageCount: messageElements.length,
      ready: messageElements.length > 0
    };
  },
  captureMessages() {
    const messages = [];
    const elements = document.querySelectorAll('[data-message-author-role]');
    elements.forEach((el, index) => {
      const role = el.getAttribute('data-message-author-role') || 'unknown';
      const text = el.innerText || el.textContent || '';
      if (text.trim()) {
        messages.push({
          role,
          content: text.trim(),
          sequence: index + 1
        });
      }
    });
    return messages;
  },
  findInputBox() {
    return document.querySelector('#prompt-textarea') || document.querySelector('textarea') || document.querySelector('div[contenteditable="true"]');
  }
};

export const ClaudeAdapter = {
  id: 'claude',
  displayName: 'Claude',
  matches(url) {
    try {
      const parsed = typeof url === 'string' ? new URL(url) : url;
      return parsed.hostname.includes('claude.ai');
    } catch {
      return false;
    }
  },
  detectConversation() {
    let title = document.title ? document.title.replace(/\s*-\s*Claude$/i, '').trim() : '';
    if (!title || title === 'Claude') {
      const headerTitle = document.querySelector('header button, [data-testid="chat-title"]');
      if (headerTitle && headerTitle.innerText) title = headerTitle.innerText.trim();
    }
    const elements = document.querySelectorAll('.font-user-message, .font-claude-message, [data-is-streaming]');
    return {
      title: title || 'Claude Conversation',
      messageCount: elements.length,
      ready: elements.length > 0
    };
  },
  captureMessages() {
    const messages = [];
    // Claude DOM uses specific classes for user and assistant messages
    const elements = document.querySelectorAll('.font-user-message, .font-claude-message');
    if (elements.length > 0) {
      elements.forEach((el, index) => {
        const isUser = el.className.includes('user');
        const role = isUser ? 'user' : 'assistant';
        const text = el.innerText || el.textContent || '';
        if (text.trim()) {
          messages.push({
            role,
            content: text.trim(),
            sequence: index + 1
          });
        }
      });
    } else {
      // Fallback: look for conversational containers
      const bubbles = document.querySelectorAll('[data-test-render-count], div.group');
      bubbles.forEach((el, index) => {
        const text = el.innerText || el.textContent || '';
        if (text.trim() && text.length > 5) {
          messages.push({
            role: index % 2 === 0 ? 'user' : 'assistant',
            content: text.trim(),
            sequence: index + 1
          });
        }
      });
    }
    return messages;
  },
  findInputBox() {
    return document.querySelector('div[contenteditable="true"]') || document.querySelector('fieldset div[contenteditable="true"]');
  }
};

export const GeminiAdapter = {
  id: 'gemini',
  displayName: 'Gemini',
  matches(url) {
    try {
      const parsed = typeof url === 'string' ? new URL(url) : url;
      return parsed.hostname.includes('gemini.google.com');
    } catch {
      return false;
    }
  },
  detectConversation() {
    let title = document.title ? document.title.replace(/\s*-\s*Gemini$/i, '').trim() : '';
    const queryElements = document.querySelectorAll('user-query, message-content, model-response');
    return {
      title: title || 'Gemini Conversation',
      messageCount: queryElements.length,
      ready: queryElements.length > 0
    };
  },
  captureMessages() {
    const messages = [];
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
    return messages;
  },
  findInputBox() {
    return document.querySelector('.ql-editor') || document.querySelector('rich-textarea div[contenteditable="true"]');
  }
};

export const ALL_ADAPTERS = [ChatGPTAdapter, ClaudeAdapter, GeminiAdapter];

export function getAdapterForUrl(url) {
  return ALL_ADAPTERS.find(adapter => adapter.matches(url)) || null;
}
