# ContextBridge — Provider Adapters Guide

## Overview
ContextBridge isolates provider-specific DOM selectors from core workspace and extraction logic. Each provider adapter implements the standard adapter contract:
- `id`: Unique identifier (e.g., `chatgpt`, `claude`, `gemini`).
- `displayName`: Human-readable name.
- `matches(url)`: URL pattern validation.
- `detectConversation()`: Checks active thread state, message count, and title.
- `captureMessages()`: Extracts sequence-ordered user and assistant messages.
- `findInputBox()`: Locates prompt text field for automatic continuation injection.

---

## 1. ChatGPT Adapter
- **Host:** `https://chatgpt.com/*`
- **Message Selectors:** `[data-message-author-role]` (`user` or `assistant`).
- **Title Selector:** Document title or `h1` conversation header.
- **Input Field:** `#prompt-textarea`, fallback to `textarea` or `div[contenteditable="true"]`.

---

## 2. Claude Adapter
- **Host:** `https://claude.ai/*`
- **Message Selectors:** `.font-user-message`, `.font-claude-message`, with secondary fallback on conversational `.group` and `[data-is-streaming]`.
- **Title Selector:** Document title or `[data-testid="chat-title"]`.
- **Input Field:** `div[contenteditable="true"]`.

---

## 3. Gemini Adapter
- **Host:** `https://gemini.google.com/*`
- **Message Selectors:** `<user-query>`, `<message-content>`, `<model-response>`.
- **Title Selector:** Document title or active chat item in sidebar.
- **Input Field:** `.ql-editor` or `rich-textarea div[contenteditable="true"]`.

---

## Universal Fallback: Multi-Format Parser
When an adapter cannot locate selectors or when running on unsupported websites/local LLM UIs (e.g. Ollama, Open-WebUI, LM Studio):
- Users paste the chat transcript or drag/drop `.txt`, `.md`, or `.json` exports into the Import Dialog.
- The regex normalizer extracts user/assistant blocks, code fences, and timestamps with 100% reliability.
