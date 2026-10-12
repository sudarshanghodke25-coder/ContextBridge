# ContextBridge — Privacy & Threat Model

## 1. Core Privacy Principles
ContextBridge is architected around a strict **Local-First, Zero-Telemetry** privacy model:
1. **Local Processing by Default:** All conversation transcript normalization, fact extraction, milestone generation, and prompt assembly happen entirely in-browser.
2. **Zero Third-Party Data Transmission:** The extension makes zero background network requests to telemetry services, third-party analytics, or external API endpoints.
3. **No Unannounced AI Uploads:** No user conversation content is transmitted over the network unless the user explicitly configures an optional custom endpoint.
4. **Local IndexedDB Persistence:** Conversations and continuation briefs are stored strictly in the client's local browser profile (`ContextBridgeDB`).
5. **Complete User Deletion:** Users have 1-click capability to delete individual conversations or wipe the entire local IndexedDB database at any time.

## 2. Threat Analysis & Mitigations

### Threat: Malicious Prompt Injection in Transcripts
- **Risk:** An untrusted conversation transcript could attempt to trick the extension into executing malicious browser actions.
- **Mitigation:**
  - Chat transcripts are treated strictly as passive data, never executed as code.
  - All previews, messages, and diff strings are rendered using text nodes and strict HTML escaping (`escapeHtml`).
  - Content scripts communicate with the extension via tightly scoped `chrome.runtime` messaging.

### Threat: Sensitive Credentials & Secret Leakage
- **Risk:** User pastes or captures conversations containing API keys, AWS tokens, passwords, or private certificates.
- **Mitigation:**
  - Automated **Quality Checks** scan active briefs for OpenAI keys (`sk-...`), GitHub tokens (`ghp_...`), AWS keys (`AKIA...`), and generic bearer secrets.
  - Highlighting alerts notify the user before prompt copy or file export.

### Threat: Provider UI Scraping Brittleness
- **Risk:** LLM web interfaces (ChatGPT, Claude, Gemini) frequently update their CSS classes and DOM structure.
- **Mitigation:**
  - Direct DOM adapters use resilient attribute fallbacks (`[data-message-author-role]`, `.font-user-message`, `user-query`).
  - Provider capture failure never blocks the user: the popup immediately presents a friendly, recoverable unsupported state with direct **Manual Paste** and **File Import** options.
