# ContextBridge --- Implementation Plan

**Purpose:** Execution roadmap for building ContextBridge in an
IDE/AI-assisted workflow\
**Target:** A reliable final-year project MVP with a distinctive
continuity workspace\
**Recommended approach:** Build the dependable import-to-brief workflow
first; add provider capture after the core pipeline works.

## 1. Delivery strategy

Do not begin by attempting to support every AI website. The most common
failure mode for browser extensions is coupling the entire product to
fragile page selectors before the core value is proven.

Build in this order: 1. Foundation and design system. 2. Manual
paste/import. 3. Normalized message model and local storage. 4.
Rule-based extraction and editable Continuation Brief. 5. Prompt
preview, copy, export, and search. 6. One provider adapter. 7.
Additional provider adapters and advanced features. 8. Privacy/security
hardening, tests, packaging, and demo.

This sequence ensures the project remains demonstrable even if a
provider changes its UI or remote summarization is unavailable.

## 2. Milestones

### Phase 0 --- Repository and product foundation

**Deliverables** - `PRD.md`, `DESIGN.md`, `IMPLEMENTATION_PLAN.md` -
`README.md` - `docs/architecture.md` -
`docs/privacy-and-threat-model.md` - `docs/provider-adapters.md` -
Initial issue/task list

**Tasks** - Inspect the existing extension repository and preserve
working code. - Confirm current framework and Manifest V3 setup before
replacing files. - Define supported browser(s), first provider, and
permissions. - Create architecture decision records for storage, summary
strategy, and host permissions. - Add lint, typecheck, unit-test, and
build scripts.

**Exit criteria** - Clean install and build works. - Manifest is
valid. - The extension can open a functional popup. - No API key or
secret is committed.

### Phase 1 --- Design system and extension shell

**Deliverables** - Token-based theme - Popup with page status and recent
items - Full workspace in side panel or extension tab -
Empty/loading/error states

**Tasks** - Implement reusable buttons, cards, chips, section headers,
dialog, toast, and empty state. - Implement supported/unsupported page
state without relying on capture yet. - Make unsupported state useful
with import and workspace actions. - Add keyboard focus, labels, and
reduced-motion support.

**Exit criteria** - Popup is not a dead end on unsupported pages. - Main
navigation works. - UI can be used at narrow popup width and normal tab
width.

### Phase 2 --- Normalized data and import pipeline

**Deliverables** - Message and conversation types - Plain-text/Markdown
import - JSON import with validation - Import preview and parser
warnings - Local persistence

**Tasks** - Create a normalization layer that maps input to
`NormalizedMessage[]`. - Parse common role labels without assuming every
transcript uses the same format. - Preserve order, code fences, and line
breaks. - Add import size limits and error messages. - Store large
conversation collections in IndexedDB; store small preferences
separately. - Add repository functions instead of accessing storage
directly from UI components.

**Exit criteria** - User can paste a transcript and save it. - User can
reload the extension and find the conversation. - Invalid or oversized
files fail safely with a useful message. - Import content is rendered as
text, not executed HTML.

### Phase 3 --- Extraction engine and Continuation Brief

**Deliverables** - Deterministic extraction engine - Structured brief
schema - Rule-based fallback - Editable brief sections - Source-message
references where possible

**Tasks** - Detect code fences and likely error messages. - Extract
explicit TODOs, requirements, decisions, and key constraints using
conservative rules. - Build a structured draft with empty sections
allowed. - Add optional model summarization behind a provider
interface. - Validate model output against the schema; reject or repair
malformed output. - Mark uncertain inferred items for review. - Preserve
pinned facts and user edits across regeneration.

**Exit criteria** - Brief is created from a manually imported
conversation. - All sections can be edited and included/excluded. - If
no AI provider is configured, the workflow still succeeds. - Generated
content is not treated as authoritative without user review.

### Phase 4 --- Prompt builder, export, and search

**Deliverables** - Compact/Balanced/Detailed controls - Exact prompt
preview - Copy to clipboard - Markdown and JSON export - Local keyword
search and filters

**Tasks** - Build prompt output from included sections in a stable
order. - Include instructions for the receiving AI: treat as prior
context, preserve decisions, ask if important information is missing,
and start from next actions. - Add an approximate size indicator and
trim strategy. - Search titles, message content, and brief sections. -
Highlight matched snippets and open the relevant source. - Add export
confirmation and possible-secret warning. - Add delete-one and
delete-all flows.

**Exit criteria** - Copied prompt exactly matches preview. - Exported
Markdown is human-readable. - Search finds a known term in the test
dataset. - Delete operations remove the data from the library and index.

### Phase 5 --- Provider adapter MVP

**Deliverables** - One supported provider adapter - Detection state and
capture review - Capture progress and recoverable failures - Adapter
fixture tests

**Tasks** - Select one provider based on the user's actual target
website and browser. - Restrict matching to the intended hostname. -
Implement `matches`, `detectConversation`, and `captureMessages`. -
Prefer stable selectors/semantic attributes and isolate selectors in one
module. - Normalize captured messages into the same schema as import. -
Add a review step before saving. - Test no-chat, empty-chat, long-chat,
changed DOM, and partially loaded page cases. - Document limitations and
manual import fallback.

**Exit criteria** - User can capture a supported conversation by
explicit action. - Capture is never silently started. - Adapter failure
does not break import or the saved library. - Unsupported pages do not
receive unnecessary permissions.

### Phase 6 --- Signature feature: Project State Timeline

**Deliverables** - Suggested milestone extraction - Timeline UI -
Pin/edit/remove milestone controls - Source links

**Tasks** - Create a milestone schema: title, summary, category, source
message IDs, confidence/review flag. - Derive candidates from explicit
decisions, completed tasks, errors/fixes, and TODOs. - Sort by source
order or timestamp. - Allow users to pin milestones into the brief. -
Show provenance and avoid implying the timeline is complete. - Add tests
for duplicate and contradictory milestone candidates.

**Exit criteria** - Timeline communicates progress at a glance. -
Selecting a milestone can show its source text. - User can remove an
incorrect milestone. - Pinned milestones survive brief regeneration.

### Phase 7 --- Privacy, security, performance, and accessibility

**Deliverables** - Permission audit - Data deletion and export
verification - Content sanitization - Performance tests - Accessibility
pass - Privacy documentation

**Tasks** - Audit all manifest permissions and host permissions. -
Verify no remote network request sends conversation data by default. -
Verify API keys are not logged or included in exports. - Add schema
validation and size limits. - Check imported HTML/Markdown rendering for
script or unsafe URL injection. - Treat prompt injection in source
messages as untrusted content; it must not trigger extension actions. -
Chunk large parsing jobs and keep UI responsive. - Test keyboard-only
workflows and focus management. - Verify clear-all deletion also clears
derived search indexes.

**Exit criteria** - Privacy behavior matches the UI disclosure. - No
conversation content is present in logs/telemetry. - All data deletion
tests pass. - No critical accessibility issue blocks the core flow.

### Phase 8 --- Testing, packaging, and final-year demonstration

**Deliverables** - Test report - Screenshots or short demo recording -
Installation guide - Known limitations - Final presentation script

**Tasks** - Run unit tests, integration tests, build, and manual
regression checklist. - Test a small dataset and a long transcript. -
Verify extension installation in a clean browser profile. - Prepare a
demo conversation containing requirements, code, an error, a decision,
and next steps. - Demonstrate capture/import → brief → edit → prompt
preview → copy → search/export. - Explain privacy, limitations, and why
this does not bypass model context limits.

**Exit criteria** - A new evaluator can install and run the extension
from the README. - The main demo succeeds without a paid API key. -
Known limitations are honestly documented.

## 3. Suggested repository structure

Adapt to the existing project rather than forcing a rewrite.

``` text
context-bridge/
├── public/
│   └── manifest.json
├── src/
│   ├── background/
│   │   └── service-worker.ts
│   ├── content/
│   │   ├── detector.ts
│   │   └── adapters/
│   │       ├── types.ts
│   │       └── first-provider.ts
│   ├── popup/
│   │   ├── Popup.tsx
│   │   └── popup.css
│   ├── workspace/
│   │   ├── Workspace.tsx
│   │   ├── components/
│   │   └── workspace.css
│   ├── import/
│   │   ├── parse-text.ts
│   │   ├── parse-json.ts
│   │   └── validate-import.ts
│   ├── domain/
│   │   ├── types.ts
│   │   ├── normalize.ts
│   │   ├── extract.ts
│   │   ├── build-brief.ts
│   │   ├── build-prompt.ts
│   │   └── quality-checks.ts
│   ├── storage/
│   │   ├── conversation-repository.ts
│   │   ├── brief-repository.ts
│   │   └── settings-repository.ts
│   ├── search/
│   │   └── local-search.ts
│   ├── export/
│   │   ├── markdown.ts
│   │   └── json.ts
│   ├── settings/
│   └── styles/
│       └── tokens.css
├── tests/
│   ├── fixtures/
│   ├── unit/
│   └── integration/
├── docs/
│   ├── architecture.md
│   ├── privacy-and-threat-model.md
│   └── provider-adapters.md
├── PRD.md
├── DESIGN.md
├── IMPLEMENTATION_PLAN.md
└── README.md
```

### Evidence and project-state contract

```ts
interface EvidenceReference {
  messageId: string;
  excerpt?: string;
  sequence?: number;
  timestamp?: number;
}

type ReviewStatus = "needs-review" | "accepted" | "rejected" | "pinned";

interface ProjectFact {
  id: string;
  category: "goal" | "decision" | "requirement" | "milestone" | "error" | "next-action";
  statement: string;
  evidence: EvidenceReference[];
  reviewStatus: ReviewStatus;
  lastConfirmedAt?: number;
}

interface StateDiffItem {
  id: string;
  kind: "new" | "changed" | "possible-conflict" | "possibly-outdated";
  previousFact?: ProjectFact;
  proposedFact: ProjectFact;
  reviewStatus: ReviewStatus;
}
```

Automated comparison is advisory. Do not describe text-similarity checks as reliable semantic contradiction detection unless validated by tests.

## 4. Core implementation contracts

### Storage boundary

UI components should call repository functions such as: -
`saveConversation(conversation)` - `getConversation(id)` -
`listConversations(query?)` - `deleteConversation(id)` -
`clearAllConversationData()` - `saveBrief(brief)` -
`searchLocal(query, filters)`

Keep storage technology out of UI components so IndexedDB can be changed
or tested independently.

### Extraction boundary

``` ts
interface BriefGenerator {
  generate(input: {
    conversation: ConversationRecord;
    pinnedMessageIds: string[];
    size: "compact" | "balanced" | "detailed";
  }): Promise<ContinuationBrief>;
}
```

Implement `RuleBasedBriefGenerator` first. Add
`ConfiguredModelBriefGenerator` later. The interface must not assume a
particular model vendor.

### Model provider boundary

-   User chooses/configures a provider.
-   Show whether processing is local or remote.
-   Show what data will be sent before the first remote operation.
-   Do not send source content in background or on page load.
-   Provide cancellation and retry behavior.
-   Keep a rule-based path when remote calls fail.

## 5. Prompt construction rules

A continuation prompt should include: 1. A short instruction explaining
that this is context from an earlier conversation. 2. Project goal and
current state. 3. Confirmed decisions and constraints. 4. Relevant
technical environment. 5. Selected code/error details only. 6. Open
questions and uncertainty. 7. Next actions. 8. An instruction to ask
before changing established decisions and to state missing information
rather than inventing it.

Avoid dumping the entire transcript by default. Compact mode should
prioritize the goal, current state, decisions, constraints, blockers,
and next actions. Detailed mode can include more source excerpts.

## 6. Testing plan

### Unit tests

-   Role-label parsing
-   Message ordering and normalization
-   Code block preservation
-   Error/TODO/requirement extraction
-   Empty-section behavior
-   Prompt output ordering
-   Size trimming and pinned-content preservation
-   JSON schema validation
-   Markdown escaping and export
-   Search matching and filters

### Integration tests

-   Import → save → reload → search
-   Import → generate brief → edit → save
-   Edit brief → preview → copy
-   Export → re-import where supported
-   Delete conversation → search no longer returns it
-   Clear all → library and index empty
-   Provider capture → review → save

### Manual browser matrix

-   Supported chat page with many messages
-   Supported page with no conversation open
-   Unsupported website
-   Provider page where selectors no longer match
-   Browser restarted after saving
-   Offline mode
-   No model provider configured
-   Remote summarizer failure
-   Long transcript with many code blocks
-   Import containing HTML, suspicious links, or possible secrets

## 7. AI-assisted IDE workflow

When using an IDE agent, give it one bounded milestone at a time.

### Recommended agent rules

-   Read `PRD.md`, `DESIGN.md`, and this plan before editing.
-   Inspect the existing repository and report its stack before
    proposing changes.
-   Do not rewrite working code without a concrete reason.
-   Implement one phase at a time; run typecheck, tests, and build after
    each phase.
-   Keep provider-specific selectors inside adapters.
-   Keep all conversation processing local unless a clearly documented,
    user-enabled provider is configured.
-   Never add fake integrations, hardcoded success states, or
    placeholder buttons that appear functional.
-   For every new feature, add loading, empty, error, and success
    states.
-   Update README and docs when behavior changes.
-   Report changed files, tests run, known issues, and the next
    recommended task at the end of each milestone.

### First IDE task prompt

> Read PRD.md, DESIGN.md, and IMPLEMENTATION_PLAN.md. Inspect the
> current ContextBridge repository and report the existing framework,
> manifest version, current UI entry points, storage approach, and build
> commands. Do not modify files yet. Identify the smallest safe
> implementation path that preserves existing functionality. Then
> propose Phase 0 and Phase 1 tasks with exact files to create or
> change.

### Follow-up task prompt template

> Implement only Phase \[N\] from IMPLEMENTATION_PLAN.md. First inspect
> the existing code and relevant docs. Preserve working behavior and
> follow the data contracts. Do not implement future phases or add
> unrelated dependencies. Add tests for the behavior, run
> typecheck/tests/build, and fix failures. At the end, list files
> changed, test results, remaining limitations, and the next phase. Do
> not claim a feature works unless it is implemented and verified.

## 8. Project risks and decisions to settle early

-   **Browser target:** Chromium first is a practical student-project
    scope; confirm if Firefox is required.
-   **Provider scope:** choose one initial provider based on real usage
    and permission constraints.
-   **Summarization approach:** start rule-based; add a model adapter
    only after the core workflow works.
-   **Storage:** use IndexedDB for large conversation/message data and a
    small settings store for preferences.
-   **UI shell:** popup for quick actions plus side panel or extension
    tab for the full workspace.
-   **Provider terms:** review the provider's terms and technical
    restrictions before shipping a page adapter.
-   **API keys:** never commit keys; a user-provided key in extension
    storage has security limitations that must be disclosed.
-   **Model accuracy:** source links, pinned facts, review flags, and
    editable sections reduce the cost of summary mistakes.

## 9. Final MVP demo script (3--4 minutes)

1.  Open a long AI conversation and show the detected provider.
2.  Capture it or import a prepared transcript.
3.  Show normalized message count and capture review.
4.  Generate a Continuation Brief.
5.  Show the Project State Timeline with source-linked milestones.
6.  Edit one decision and pin one important fact.
7.  Switch from Balanced to Compact and preview the exact prompt.
8.  Copy the prompt and explain how it can be pasted into a new chat.
9.  Search for a prior error or decision.
10. Export Markdown and show local-data deletion.
11. Explain that ContextBridge preserves useful context but does not
    bypass AI model limits.

## 10. Definition of project completion

The project is ready for evaluation when: - The manual import workflow
works reliably without a paid service. - A user can create, edit, copy,
search, export, and delete a continuation brief. - One provider adapter
works with clear limitations and a manual fallback. - The Project State
Timeline adds a distinctive, source-aware experience. - Privacy behavior
is documented and verified. - Automated tests and a clean-browser demo
pass. - Documentation accurately distinguishes implemented features from
future ideas.
