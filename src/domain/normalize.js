/**
 * ContextBridge Message Normalization
 * Standardizes messages from various providers, text formats, and files into NormalizedMessage objects.
 */

import { MessageRoles } from './types.js';

/**
 * Generate a unique ID
 */
export function generateId(prefix = 'msg') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
}

/**
 * Estimate token count approximately (1 token ~= 4 characters for English text/code)
 */
export function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

/**
 * Clean and normalize a role string to valid MessageRole
 */
export function normalizeRole(rawRole) {
  if (!rawRole) return MessageRoles.UNKNOWN;
  const role = String(rawRole).toLowerCase().trim();
  
  if (['user', 'human', 'me', 'you', 'prompt', 'student'].includes(role)) {
    return MessageRoles.USER;
  }
  if (['assistant', 'ai', 'model', 'chatgpt', 'claude', 'gemini', 'bot', 'system_response'].includes(role)) {
    return MessageRoles.ASSISTANT;
  }
  if (['system', 'instruction', 'context'].includes(role)) {
    return MessageRoles.SYSTEM;
  }
  if (['tool', 'function', 'output', 'terminal', 'code_interpreter'].includes(role)) {
    return MessageRoles.TOOL;
  }
  return MessageRoles.UNKNOWN;
}

/**
 * Normalizes an array of raw message objects
 * @param {Array} rawMessages 
 * @param {Object} options 
 * @returns {Array} Array of NormalizedMessage objects
 */
export function normalizeMessages(rawMessages, options = {}) {
  if (!Array.isArray(rawMessages)) return [];

  return rawMessages.map((msg, index) => {
    const content = (msg.content || msg.text || '').trim();
    const role = normalizeRole(msg.role || msg.author || msg.sender);
    
    return {
      id: msg.id || generateId(`msg_${index + 1}`),
      role,
      content,
      sequence: typeof msg.sequence === 'number' ? msg.sequence : index + 1,
      timestamp: msg.timestamp || options.defaultTimestamp || Date.now(),
      sourceUrl: msg.sourceUrl || options.sourceUrl || '',
      selected: msg.selected !== false,
      pinned: Boolean(msg.pinned)
    };
  }).filter(msg => msg.content.length > 0);
}

/**
 * Parses raw copied transcript text into NormalizedMessage objects.
 * Supports patterns like:
 * - "User: ... \nAssistant: ..."
 * - "Human: ... \nAI: ..."
 * - "Me: ... \nChatGPT: ..."
 * - "--- User --- \n... \n--- AI ---"
 * - "[12:30 PM] User: ..."
 */
export function parseRawTranscript(rawText, options = {}) {
  if (!rawText || typeof rawText !== 'string') {
    return { messages: [], warnings: ['Empty transcript text provided.'] };
  }

  const text = rawText.replace(/\r\n/g, '\n');
  const warnings = [];
  const parsed = [];

  // Patterns for delimiter lines
  // e.g. "User:", "Human:", "### User", "--- Me ---", "ChatGPT:", "Claude:", "Gemini:"
  const headerRegex = /^(?:---|###|\*\*\*|\s*\[.*?\])?\s*(user|human|me|assistant|ai|chatgpt|claude|gemini|system|bot):\s*(?:---|###|\*\*\*|\s*)?$/im;
  
  // Or inline style at start of line: "User: Hello world"
  const inlineRegex = /^(?:---|###|\*\*\*|\s*\[.*?\])?\s*(user|human|me|assistant|ai|chatgpt|claude|gemini|system|bot):\s*(.*)$/i;

  const lines = text.split('\n');
  let currentRole = null;
  let currentContent = [];
  let explicitHeaderFound = false;

  function flushCurrent() {
    if (currentRole && currentContent.length > 0) {
      const content = currentContent.join('\n').trim();
      if (content) {
        parsed.push({
          role: currentRole,
          content
        });
      }
    }
    currentContent = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for delimiter line
    const headerMatch = line.match(headerRegex);
    if (headerMatch) {
      flushCurrent();
      explicitHeaderFound = true;
      currentRole = normalizeRole(headerMatch[1]);
      continue;
    }

    // Check for inline header line: "User: How do I do X?"
    const inlineMatch = line.match(inlineRegex);
    if (inlineMatch) {
      flushCurrent();
      explicitHeaderFound = true;
      currentRole = normalizeRole(inlineMatch[1]);
      if (inlineMatch[2] && inlineMatch[2].trim()) {
        currentContent.push(inlineMatch[2]);
      }
      continue;
    }

    // If we haven't encountered any role header yet
    if (!currentRole) {
      // If line is non-empty, assume user began speaking
      if (line.trim()) {
        currentRole = MessageRoles.USER;
        currentContent.push(line);
      }
    } else {
      currentContent.push(line);
    }
  }

  flushCurrent();

  // If no explicit headers matched, note that it was parsed as default user input
  if (!explicitHeaderFound && parsed.length > 0) {
    warnings.push('No speaker headers detected. Parsed as a single user message.');
  }

  const normalized = normalizeMessages(parsed, options);
  
  return {
    messages: normalized,
    warnings,
    stats: {
      totalMessages: normalized.length,
      userMessages: normalized.filter(m => m.role === MessageRoles.USER).length,
      assistantMessages: normalized.filter(m => m.role === MessageRoles.ASSISTANT).length,
      totalTokensApprox: normalized.reduce((acc, m) => acc + estimateTokens(m.content), 0)
    }
  };
}
