# ContextBridge --- UX and Technical Design

**Purpose:** Design specification for the ContextBridge browser
extension\
**Design direction:** Editorial workspace + intelligent utility; calm,
precise, premium, and clearly distinct from the Capsule extension.

## 1. Design concept: "Conversation Continuity Workspace"

The current popup uses a dark surface, purple accent, and a single
empty-state card. Keep the useful compactness, but evolve the product
from a tiny detector popup into a miniature workspace with a strong
visual hierarchy.

### Visual identity

-   **Mood:** focused, trustworthy, technical, calm---not sci-fi and not
    overloaded with glowing gradients.
-   **Primary surfaces:** deep ink/navy, layered charcoal, soft lavender
    accent, restrained teal for successful states.
-   **Typography:** system UI or Inter-like sans-serif; clear
    heading/body contrast; use monospace only for code and technical
    metadata.
-   **Shape language:** medium-radius cards, thin borders, compact
    chips, subtle separators.
-   **Motion:** short transitions for panel changes and progress;
    respect reduced-motion settings.
-   **Icons:** consistent line icons; never use an icon without a label
    for an important action.
-   **Accessibility:** readable contrast, visible keyboard focus, no
    status communicated by color alone.

### Example design tokens

``` css
:root {
  --bg: #11121a;
  --surface: #1a1b27;
  --surface-raised: #242638;
  --border: #34364a;
  --text: #f2f2fa;
  --muted: #b3b5c9;
  --accent: #b8a0ff;
  --accent-strong: #9476f5;
  --success: #72d6bd;
  --warning: #f1c879;
  --danger: #ff858f;
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 20px;
}
```

These are starting values, not a rigid brand constraint. Test contrast
and refine in the actual browser.

## 2. Differentiate from "Capsule"

ContextBridge and Capsule should not look or behave like two versions of
the same summarizer.

  -----------------------------------------------------------------------
  Dimension               ContextBridge           Capsule
  ----------------------- ----------------------- -----------------------
  Main metaphor           Bridge / workspace /    A portable,
                          project timeline        self-contained capsule

  Main job                Maintain and retrieve   Quick capture/package
                          continuity across       of context
                          conversations           

  Default surface         Workspace with          Lightweight quick
                          conversation library    action, if that matches
                          and structured editor   its separate product
                                                  scope

  Signature interaction   Review a structured     Create or open a
                          project-state timeline  portable capsule
                          and trace details to    
                          source messages         

  Signature visual        Connected nodes,        Compact sealed-package
                          section rail,           / saved-item motif
                          source-linked facts     

  Success feeling         "I know where my        "I have a portable
                          project stands and what bundle ready."
                          to do next."            
  -----------------------------------------------------------------------

Avoid using "capsule" as the name of every ContextBridge screen. Use
**Continuation Brief**, **Project State**, or **Bridge Draft** in the
interface. The word "capsule" can remain in the internal data schema if
needed.

## 3. Information architecture

### Browser action popup

Designed for quick decisions, not the whole product.

``` text
┌─────────────────────────────────────┐
│ ContextBridge            [Settings] │
│ CONTINUITY WORKSPACE                │
├─────────────────────────────────────┤
│ [Provider icon] Chat detected       │
│ Conversation title                  │
│ 42 messages · Last updated recently │
│                                     │
│ [ Capture conversation ]            │
│                                     │
│ Continue a project                  │
│ [ Search saved conversations... ]   │
│ Recent:                             │
│  • SmartGate requirements     Open  │
│  • ContextBridge architecture Open  │
│                                     │
│ Import conversation                 │
└─────────────────────────────────────┘
```

### Unsupported page state

``` text
┌─────────────────────────────────────┐
│ ContextBridge            [Settings] │
├─────────────────────────────────────┤
│ A conversation isn't detected here. │
│ You can still bring your context in.│
│                                     │
│ [ Paste conversation ]              │
│ [ Import TXT / MD / JSON ]           │
│                                     │
│ Recent projects                     │
│ [ Open Continuity Workspace ]       │
└─────────────────────────────────────┘
```

The key change from the current UI: "not detected" is a recoverable
state with clear next actions, not a dead end.

### Full workspace

Use an extension side panel when supported by the chosen browser, or
open a dedicated extension tab as the dependable fallback.

``` text
┌───────────────────────────────────────────────────────────────────┐
│ ContextBridge  Search everything...       New brief   Settings     │
├───────────────────┬──────────────────────────────┬────────────────┤
│ WORKSPACES        │ PROJECT STATE                │ SOURCES        │
│ + New workspace  │ Goal                          │ 42 messages    │
│                   │ [editable text]              │                │
│ Recent chats      │ Current state                │ Selected facts │
│ • SmartGate       │ [editable text]              │ • Decision...  │
│ • ContextBridge   │ Decisions                    │ • Error...     │
│ • AI Assistant    │ [editable list]              │                │
│                   │ Requirements                 │ Source message │
│ FILTERS           │ [editable list]              │ preview        │
│ Code / Errors     │ Next actions                 │                │
│ Decisions         │ [editable checklist]         │                │
├───────────────────┴──────────────────────────────┴────────────────┤
│ Compact  Balanced  Detailed    ~1,200 tokens   [Preview prompt]   │
└───────────────────────────────────────────────────────────────────┘
```

## 4. Signature feature: Project State Timeline

Add a distinctive "Project State Timeline" that makes ContextBridge more
than a summarizer: - Show meaningful milestones extracted from a
conversation: **Goal defined → Architecture chosen → Feature implemented
→ Error encountered → Next task**. - Each milestone has a short summary,
timestamp/message reference when available, and a "View source"
action. - Let users pin milestones to keep them in future continuation
briefs. - Clearly label uncertain or model-inferred milestones. - Allow
users to edit/remove a milestone. - Do not pretend the timeline is
complete; show "suggested milestones" until reviewed.

This feature is visually memorable and demonstrates useful information
architecture in a final-year project presentation.

## 5. Capsule Studio / Continuation Brief editor

### Main editor sections

1.  **Goal** --- what outcome the user wants.
2.  **Current state** --- what has been completed and what works.
3.  **Decisions** --- choices already made and constraints.
4.  **Requirements** --- must-have behavior and quality constraints.
5.  **Technical context** --- language, framework, versions,
    environment, files.
6.  **Code and errors** --- only the snippets/errors needed to continue.
7.  **Open questions and risks** --- unresolved items and uncertain
    details.
8.  **Next actions** --- specific tasks in a sensible order.
9.  **Source references** --- links to selected source messages where
    available.

### Editing behavior

-   Every section has an include toggle, editable content, and optional
    "show source" control.
-   Pinned user-selected facts are protected from automatic removal
    during regeneration.
-   Regeneration must not silently overwrite edits; offer **Regenerate
    draft**, then show a diff or ask whether to keep edited sections.
-   Empty sections collapse or show a gentle "Nothing extracted yet"
    placeholder.
-   A prompt preview shows the exact content that will be copied.
-   Size estimate is approximate and labeled as an estimate, not an
    exact provider token count.

### Smart quality checks

Display small, actionable checks: - Goal missing - No next action
found - Potential contradiction detected - Large code block included -
Possible secret/API key detected - Long prompt; consider Compact mode -
Summary has unverified inferred items

Do not block the user unless a real security or validation requirement
demands it.


## 5A. Signature interaction: State Diff and Evidence Review

This is the primary design differentiator. A continuity tool should not merely create another summary; it should help the user decide what has changed since the last approved project state.

### State Diff view
When a new conversation is added to an existing project, show a review list with four categories:
- **New:** a new requirement, decision, milestone, or task.
- **Changed:** a previously recorded fact appears to have changed.
- **Possible conflict:** two source passages appear inconsistent.
- **Possibly outdated:** an earlier task or technical assumption may no longer apply.

Each item shows:
- the proposed fact;
- its previous approved version, if any;
- source excerpts for both versions when available;
- status such as `Needs review`, `Accepted`, `Rejected`, or `Pinned`;
- actions to accept, edit, reject, or open the source message.

Do not automatically overwrite the approved project state. Users must confirm state changes. If evidence is missing, label the item as unverified rather than fabricating a source link.

### Evidence drawer
Selecting a brief section or timeline milestone opens an evidence drawer containing the original message excerpt, speaker, and timestamp/sequence if available. If source metadata was not captured, display “Source reference unavailable” rather than a fake link.

### Compression guardrails
- Pinned facts are retained unless the user explicitly unpins or removes them.
- When the brief is too large, recommend what could be excluded instead of silently dropping important items.
- Keep unresolved conflicts visible in the final brief unless the user resolves or excludes them.
- The prompt preview must show the exact text that will be copied.

## 6. Capture and import UX

### Capture review

Before saving: - Show detected title/provider and message count. - Show
counts by role if available. - Provide a preview of a few beginning/end
messages. - Allow selection of message ranges or pinned messages for MVP
if feasible. - Warn that provider page structure can change and offer
manual import. - Confirm save/cancel before persistent storage.

### Import flow

1.  Paste text or select a supported file.
2.  Detect likely role labels and code blocks.
3.  Show a preview and parsing warnings.
4.  Let the user choose a title and save.
5.  Continue to extraction/editor.

Never render imported HTML as trusted markup. Treat files and text as
untrusted data.

## 7. Search experience

Search should work like a small project memory: - Global search across
titles, messages, capsule sections, code, and errors. - Results show a
snippet, conversation title, role, and date if available. - Filters:
All, Decisions, Requirements, Code, Errors, Next actions. - Search
should be local by default. - Clicking a result opens the source
conversation or capsule and highlights the matching excerpt. - If
semantic search is not in MVP, do not label keyword search as "AI
search."

## 8. Interaction and state model

Represent UI states explicitly: - `unsupported` - `detecting` -
`supported_idle` - `capturing` - `capture_review` - `importing` -
`summarizing` - `editing` - `previewing` - `saved` - `error`

Each state needs a title, explanation, available action, and recovery
path. Avoid endless spinners; long tasks must show progress or
cancellation.

## 9. Architecture overview

``` text
Browser page
   │
   ▼
Provider Adapter ──► Normalized Messages
   │                       │
   │                       ▼
   │                Local Conversation Store
   │                       │
   ▼                       ▼
Page Detection        Extraction Pipeline
                           │
                           ▼
                    Continuation Brief
                           │
                ┌──────────┴──────────┐
                ▼                     ▼
          Local Rule Engine      Optional LLM Adapter
                └──────────┬──────────┘
                           ▼
                     Schema Validator
                           ▼
                    User Review / Editor
                           ▼
                   Prompt Builder + Export
```

### Suggested technical stack

Choose the stack the existing extension already uses where practical.
For a new Chromium-first build: - TypeScript - React for popup and
workspace - Vite or a browser-extension build tool compatible with
Manifest V3 - Manifest V3 service worker - Content scripts for supported
page adapters - `chrome.storage.local` or IndexedDB for local
conversation data; IndexedDB is preferable for large message
collections - Vitest for unit tests; Playwright or browser automation
for end-to-end tests - CSS modules or a small token-based styling system

Avoid adding a large UI component library unless it materially speeds
development.

## 10. Component map

``` text
App
├── PopupShell
│   ├── PageStatusCard
│   ├── CaptureButton
│   ├── QuickImportActions
│   └── RecentBriefs
├── WorkspaceShell
│   ├── GlobalSearch
│   ├── WorkspaceSidebar
│   ├── ConversationLibrary
│   ├── ProjectTimeline
│   ├── BriefEditor
│   │   ├── BriefSection
│   │   ├── SourceReference
│   │   └── QualityCheckList
│   ├── PromptPreview
│   └── ExportMenu
├── ImportDialog
├── CaptureReview
└── SettingsPage
```

## 11. Common data contracts

``` ts
type MessageRole = "user" | "assistant" | "system" | "tool" | "unknown";

interface NormalizedMessage {
  id: string;
  role: MessageRole;
  content: string;
  sequence: number;
  timestamp?: number;
  sourceUrl?: string;
  selected: boolean;
  pinned: boolean;
}

interface ConversationRecord {
  id: string;
  title: string;
  provider: string;
  sourceUrl?: string;
  captureMethod: "adapter" | "paste" | "file" | "json";
  createdAt: number;
  updatedAt: number;
  messages: NormalizedMessage[];
}

type BriefSectionKey =
  | "goal" | "currentState" | "decisions" | "requirements"
  | "technicalContext" | "codeAndErrors" | "openQuestions"
  | "nextActions" | "sourceReferences";

interface BriefSection {
  key: BriefSectionKey;
  title: string;
  content: string;
  included: boolean;
  editedByUser: boolean;
  needsReview: boolean;
  sourceMessageIds: string[];
}

interface ContinuationBrief {
  id: string;
  conversationId: string;
  title: string;
  schemaVersion: 1;
  sections: BriefSection[];
  createdAt: number;
  updatedAt: number;
  generationMethod: "rules" | "configured-model" | "hybrid";
}
```

## 12. Provider adapter contract

Keep provider-specific DOM selectors out of shared logic.

``` ts
interface ProviderAdapter {
  id: string;
  displayName: string;
  matches(url: URL): boolean;
  detectConversation(): Promise<{
    title?: string;
    messageCount?: number;
  }>;
  captureMessages(): Promise<NormalizedMessage[]>;
}
```

Rules: - Only activate adapters on explicit supported hostnames. - Use
stable semantic attributes where possible; isolate selectors and
document them. - Fail gracefully when no messages are found. - Never
execute arbitrary code obtained from the page or conversation. - Keep
manual import fully functional when an adapter breaks. - Review each
provider's terms and technical constraints before implementing capture.

## 13. Security and privacy design

-   Request only the browser permissions needed for the supported
    domains and core extension behavior.
-   Prefer optional host permissions or user-initiated access where
    possible.
-   Never transmit conversation text unless the user has enabled a
    provider and explicitly confirmed the action.
-   Do not include conversation text, API keys, or full source URLs in
    analytics/logs.
-   Render content as text; sanitize Markdown/HTML previews.
-   Treat conversation text as data, not as instructions to the
    extension. A chat message must never trigger privileged extension
    actions.
-   Check for possible API keys, passwords, tokens, and personal data
    before export or remote processing; provide warnings and user
    control.
-   Keep secrets out of source control. Explain the risks of storing
    user-supplied API keys in browser extension storage.
-   Provide a visible "Delete all local data" control.
-   Use schema validation and size limits for imported JSON and files.

## 14. Error and empty-state copy

-   **Unsupported:** "No supported conversation detected on this page.
    You can still import a chat or open your saved workspace."
-   **No messages:** "We found the page, but couldn't read its messages.
    Try refreshing, or use manual import."
-   **Capture failed:** "Capture couldn't finish. Your existing saved
    conversations are safe."
-   **No model configured:** "You can create a basic brief now. Connect
    a summarization option in Settings for model-assisted extraction."
-   **Remote request failed:** "The summary service didn't respond. Your
    source conversation is unchanged; try again or use the rule-based
    draft."
-   **Empty library:** "Your project memory starts here. Capture a chat
    or import a conversation to create your first brief."
-   **Potential secret:** "This content may contain a key or secret.
    Review it before copying or exporting."

## 15. Definition of done for design

-   [ ] Popup has supported, unsupported, loading, error, and
    recent-item states.
-   [ ] Unsupported state offers import and workspace actions.
-   [ ] Workspace has library, editor, source references, preview, and
    export.
-   [ ] Project State Timeline is prototyped and source-linked.
-   [ ] Keyboard navigation and focus states are implemented.
-   [ ] Dark theme contrast is checked.
-   [ ] Long text and large code blocks remain usable.
-   [ ] Regeneration preserves user edits or offers a diff.
-   [ ] Privacy and delete-data controls are easy to find.
