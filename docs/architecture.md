# ContextBridge — Architecture Documentation

## 1. System Overview
ContextBridge is a privacy-first browser extension designed for conversation continuity across modern LLM interfaces (ChatGPT, Claude, Gemini) and independent project sessions.

Unlike conventional chat copy-paste extensions, ContextBridge synthesizes dialogue history into an **Evidence-linked Continuation Brief** and **Project State Timeline**, enabling engineers, researchers, and students to seamlessly continue tasks without losing architectural decisions, resolved bugs, or requirements.

```
┌─────────────────────────────────────────────────────────────────┐
│                     Active Browser Tab                          │
│               (ChatGPT / Claude / Gemini / Any)                 │
└───────────────┬─────────────────────────────────┬───────────────┘
                │ (Content Script Adapter)        │ (Manual Import / Paste)
                ▼                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Normalization Layer                          │
│     (normalizeMessages, parseRawTranscript, tokenEstimation)    │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                 Deterministic Extraction Engine                 │
│      - Goal & Outcome Detection                                 │
│      - Decisions & Architecture Extraction                      │
│      - Requirements & Constraints                               │
│      - Code Blocks & Stack Trace Isolation                      │
│      - Milestone Generation                                     │
└───────────────┬─────────────────────────────────┬───────────────┘
                │                                 │
                ▼                                 ▼
┌───────────────────────────────┐ ┌───────────────────────────────┐
│    Local Storage Engine       │ │   State Diff & Review Engine  │
│ - IndexedDB (Conversations)   │ │ - New Facts                   │
│ - IndexedDB (Briefs & Nodes)  │ │ - Changed Statements          │
│ - Local In-Memory Fallback    │ │ - Possible Conflicts (Alerts) │
└───────────────┬───────────────┘ │ - Outdated Assumptions        │
                │                 └───────────────┬───────────────┘
                │                                 │
                ▼                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│            Continuation Brief Studio & Prompt Builder           │
│     - Compact / Balanced / Detailed Compression Modes           │
│     - Section-level Inline Editing & Pinned Preservation        │
│     - Interactive Evidence Drawer (Message Provenance)          │
│     - 1-Click Clipboard Copy / New Tab Injection                │
│     - Markdown / JSON Export                                    │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Directory & Module Structure
- `manifest.json`: Manifest V3 extension configuration.
- `background.js`: Service worker managing cross-tab bridging, context passing, and workspace tab routing.
- `content.js`: Isolated DOM content script injected into ChatGPT, Claude, and Gemini tabs.
- `popup.html / popup.css / popup.js`: Compact quick-action popup with page detection, quick bridge buttons, and recoverable unsupported states.
- `workspace.html / workspace.css / workspace.js`: Full-screen 3-column Continuity Workspace.
- `src/domain/`:
  - `types.js`: Domain interfaces, enumerations, and constants.
  - `normalize.js`: Universal role mapping, multi-format transcript parser, token estimator.
  - `extract.js`: Deterministic extraction for goals, decisions, requirements, errors, code, next actions, milestones.
  - `state-diff.js`: Signature interaction: automated fact comparison and conflict detector.
  - `build-brief.js`: Continuation brief assembler with compression modes.
  - `build-prompt.js`: Formatted continuation prompt generator with target LLM directives.
  - `quality-checks.js`: Security, privacy, credential scanning, and completeness auditing.
- `src/storage/`:
  - `db.js`: IndexedDB engine with memory fallback.
  - `conversation-repository.js`: Conversation CRUD.
  - `brief-repository.js`: Continuation Brief CRUD.
  - `settings-repository.js`: User preferences.
- `src/adapters/`:
  - Provider adapters for ChatGPT, Claude, Gemini.
- `src/search/`:
  - `local-search.js`: Client-side full-text and facet search.
- `src/export/`:
  - `markdown.js`: Markdown documentation generator.
  - `json.js`: Structured JSON export/import validator.
- `tests/`:
  - Comprehensive unit test suite with 100% pass rate.
