# 🌉 ContextBridge — Privacy-First AI Conversation Continuity Workspace

> **Seamlessly maintain project state, architectural decisions, code artifacts, and next actions across long AI chats, new sessions, and multiple LLMs.**

[![Tests](https://img.shields.io/badge/tests-16%20passed-brightgreen.svg)]()
[![Manifest](https://img.shields.io/badge/Manifest-V3-blue.svg)]()
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Local-purple.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()

---

## 🌟 What is ContextBridge?

When working on software projects, research, or complex workflows, conversations with AI assistants (ChatGPT, Claude, Gemini) quickly accumulate vital context: **decisions, requirements, resolved bugs, configurations, and pending tasks**.

When threads become too long, reach context limits, or require switching to another model or fresh chat, users typically resort to manually scrolling, copying transcripts, or losing track of key decisions.

**ContextBridge** solves this by turning messy conversations into a **structured, user-reviewable Continuation Brief**:
- 📌 **Evidence-Linked Project State:** Clear sections for Goal, Current State, Decisions, Requirements, Technical Context, Code/Errors, Open Questions, and Next Actions.
- ⏱️ **Signature Feature: Project State Timeline:** Chronological milestone roadmap (Goal Defined → Architecture Chosen → Requirements Set → Debugged Errors → Next Task) with source evidence provenance.
- 🔀 **Signature Interaction: State Diff & Review:** Compares new conversations against your approved project baseline to highlight **New Facts**, **Changed Statements**, **Potential Conflicts**, and **Outdated Tasks**.
- 🎛️ **Compression Guardrails:** Switch between **Compact**, **Balanced**, and **Detailed** brief modes with live token estimation. Pinned items are protected from eviction.
- 🔒 **100% Local-First & Zero-Telemetry:** All parsing, extraction, and storage use local browser IndexedDB. No external servers or API keys required.
- 🚀 **Multi-Model Bridging:** 1-click continuation prompt generation and automatic tab opening for **ChatGPT**, **Claude**, and **Gemini**.

---

## 🏗️ Architecture & Key Features

```
┌──────────────────────────────────────────────────────────┐
│                   ContextBridge Architecture             │
├──────────────────────────┬───────────────────────────────┤
│ Surface                  │ Capabilities                  │
├──────────────────────────┼───────────────────────────────┤
│ Quick Popup              │ Active page detector,         │
│ (popup.html)             │ 1-click capture, recent       │
│                          │ briefs, quick bridge buttons  │
├──────────────────────────┼───────────────────────────────┤
│ Full Continuity          │ 3-Column Studio:              │
│ Workspace                │ • Sidebar: Library & Search   │
│ (workspace.html)         │ • Center: Brief Editor,       │
│                          │   Timeline, State Diff        │
│                          │ • Right Drawer: Prompt output,│
│                          │   Evidence & Export           │
├──────────────────────────┼───────────────────────────────┤
│ Deterministic Extraction │ Offline rule engine for goals,│
│ Engine                   │ decisions, errors, and code   │
├──────────────────────────┼───────────────────────────────┤
│ Local Storage            │ IndexedDB (unlimited local    │
│                          │ capacity, instant search)     │
└──────────────────────────┴───────────────────────────────┘
```

---

## 🚀 Installation & Quick Start

### 1. Load Extension in Chrome / Edge / Brave
1. Clone or download this repository.
2. Open your Chromium-based browser and navigate to:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
   - Brave: `brave://extensions/`
3. Enable **Developer mode** (toggle in top right).
4. Click **Load unpacked**.
5. Select the `e:\ContextBridge` root directory.
6. ContextBridge will appear in your extension toolbar! Pin it for quick access.

### 2. Running Automated Unit Tests
ContextBridge includes unit tests using Node.js's built-in test runner:
```bash
npm test
```
All 16 unit tests verify normalization, extraction, state diffing, prompt assembly, and search with 100% pass rate.

---

## 📖 Usage Walkthrough

### 1. Capturing a Live Conversation
1. Open any active chat on [ChatGPT](https://chatgpt.com), [Claude](https://claude.ai), or [Gemini](https://gemini.google.com).
2. Click the **ContextBridge** toolbar icon.
3. You'll see the detected provider, conversation title, and visible message count.
4. Click **Capture Conversation Brief**.
5. ContextBridge normalizes the dialogue, extracts structured facts, and opens the full **Continuity Workspace**.

### 2. Manual Paste or File Import (Universal Fallback)
If working on unsupported websites, local LLM interfaces (Ollama, LM Studio), or offline transcripts:
1. Open the ContextBridge workspace or popup.
2. Click **Import Conversation**.
3. Paste your raw transcript or drop a `.txt`, `.md`, or `.json` export file.
4. The auto-detector normalizes speaker roles and immediately builds your Continuation Brief.

### 3. Reviewing & Editing Your Continuation Brief
- **Inline Editing:** Edit any section directly. Your edits are saved locally and protected across regeneration.
- **Section Inclusion:** Use toggle sliders to include or exclude specific sections from the prompt.
- **Project State Timeline:** Navigate chronological project milestones. Click **View Original Message** to inspect exact source dialogue.
- **State Diff & Review:** Compare consecutive chats. Approve or reject newly discovered facts and resolve highlighted conflicts.

### 4. Resuming Work in a New Chat
1. In the right drawer, select your destination assistant (**ChatGPT**, **Claude**, or **Gemini**).
2. Click **Copy Continuation Prompt** (or **Bridge & Open New Tab**).
3. The continuation prompt begins with clear directives for the receiving AI to acknowledge prior state, adhere to confirmed decisions, and immediately proceed with Next Action #1.

---

## 📁 Repository Structure

```
ContextBridge/
├── manifest.json                     # Chrome Manifest V3 configuration
├── background.js                     # Background service worker (bridging & tabs)
├── content.js                        # Multi-provider DOM adapter & injector
├── popup.html / popup.css / popup.js # Compact popup interface
├── workspace.html                    # Full 3-column Continuity Workspace
├── workspace.css                     # Editorial workspace design system
├── workspace.js                      # Master workspace controller
├── src/
│   ├── domain/                       # Core business logic & models
│   │   ├── types.js                  # Data contracts and enums
│   │   ├── normalize.js              # Message normalizer & transcript parser
│   │   ├── extract.js                # Fact, code, error, & milestone extractor
│   │   ├── state-diff.js             # State diffing & conflict detection
│   │   ├── build-brief.js            # Brief assembler & compression modes
│   │   ├── build-prompt.js           # Formatted continuation prompt builder
│   │   └── quality-checks.js         # Secret detection & completeness audits
│   ├── storage/                      # Persistence layer
│   │   ├── db.js                     # IndexedDB engine with memory fallback
│   │   ├── conversation-repository.js# Conversation CRUD
│   │   ├── brief-repository.js       # Brief CRUD
│   │   └── settings-repository.js    # Preferences repository
│   ├── adapters/                     # Isolated provider DOM logic
│   │   └── index.js                  # ChatGPT, Claude, Gemini adapters
│   ├── search/                       # Client-side search
│   │   └── local-search.js           # Keyword & facet search
│   └── export/                       # Export generators
│       ├── markdown.js               # Markdown export
│       └── json.js                   # JSON export & validator
├── tests/                            # Automated test suite
│   ├── normalize.test.js
│   ├── extract.test.js
│   ├── state-diff.test.js
│   ├── build-prompt.test.js
│   ├── search.test.js
│   └── export.test.js
├── docs/                             # Engineering documentation
│   ├── architecture.md
│   ├── privacy-and-threat-model.md
│   └── provider-adapters.md
├── ContextBridge_Project_Documentation/ # Full project research & PRD pack
└── package.json
```

---

## ⚖️ Privacy Statement
ContextBridge does not track users, inject ads, or transmit conversation data to remote servers. All conversation extraction, state diffing, and indexing run client-side in the user's browser. ContextBridge does not bypass model context windows or usage limits; it optimizes and organizes context so new sessions resume efficiently.

---

## 📜 License
MIT License. Created for the ContextBridge Project.
