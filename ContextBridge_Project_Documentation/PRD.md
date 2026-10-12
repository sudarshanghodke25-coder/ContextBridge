# ContextBridge --- Product Requirements Document (PRD)

**Document status:** Draft for final-year project implementation\
**Product:** ContextBridge\
**Product type:** Privacy-first browser extension for AI conversation
continuity\
**Primary audience:** Students, developers, researchers, and frequent
users of AI assistants\
**Version:** 1.0

## 1. Product vision

ContextBridge helps people continue meaningful work across long AI
conversations, new chats, browser sessions, and supported AI
platforms---without manually copying huge transcripts or losing
important decisions.

It turns a conversation into a **user-reviewable Continuation Capsule**:
a structured, compact package containing the project's goal, current
state, decisions, requirements, useful code and errors, and next
actions. The user can inspect and edit every section before copying or
inserting it into a new chat.

ContextBridge does **not** bypass model context windows, usage limits,
provider policies, authentication, or paywalls. It prepares relevant
context so a new conversation can resume efficiently.

## 2. Problem statement

AI conversations often accumulate valuable context, but that context
becomes difficult to reuse when: - a thread becomes long or slow; - a
provider's context or usage limit is reached; - a user changes to a new
chat, model, or supported provider; - important decisions are buried in
many messages; - users need to find an earlier code snippet,
requirement, or error; - users want a portable, local copy of their AI
project history.

Existing manual workflows require scrolling, selecting, copying,
editing, and pasting. This is time-consuming and can omit critical
details.

## 3. Goals and non-goals

### Goals

1.  Detect whether the current page contains a supported AI conversation
    and explain the result clearly.
2.  Capture or import conversation content through explicit,
    understandable user actions.
3.  Convert conversation history into a structured project state and
    continuation prompt.
4.  Let users choose which information to preserve, edit it, and preview
    the final prompt.
5.  Search saved conversations and retrieve relevant messages,
    decisions, code, and errors.
6.  Export user-selected data in practical formats.
7.  Prefer local processing and local storage; make any external AI
    processing opt-in and transparent.
8.  Provide a distinctive, polished experience that is more useful than
    a small popup.

### Non-goals

-   Bypassing AI provider limits or unlocking paid capabilities.
-   Guaranteeing automatic access to every provider or every private
    conversation.
-   Sending messages to an AI provider without the user's knowledge.
-   Running hidden scraping, background surveillance, or collecting
    browsing history.
-   Replacing the AI assistant or acting as a general-purpose chatbot.
-   Claiming that generated summaries are perfectly accurate.

## 4. Target users and use cases

### Primary personas

-   **Student/project builder:** needs to preserve project requirements,
    architecture decisions, code, errors, and pending tasks across
    chats.
-   **Developer:** needs reliable handoff context for debugging and
    implementation.
-   **Researcher/writer:** needs decisions, findings, sources, and
    unresolved questions retained.
-   **Multi-model user:** wants a portable continuation prompt across
    supported assistants.

### Core user stories

-   As a user, I can see whether ContextBridge recognizes the current
    page and why.
-   As a user, I can capture a conversation only after choosing to do
    so.
-   As a user, I can import text or a supported export when direct
    capture is unavailable.
-   As a user, I can create a continuation capsule and review its
    sections.
-   As a user, I can remove sensitive details and edit inaccurate
    summary content before reuse.
-   As a user, I can open a new chat and copy or insert the approved
    continuation prompt.
-   As a user, I can search past conversations by keyword and filter by
    type.
-   As a user, I can export a conversation, a selected message range, or
    a capsule.
-   As a user, I can delete stored data and understand where it is
    stored.
-   As a user, I can use core features without creating an account.

## 5. Product principles

1.  **User control first:** capture, external processing, insertion, and
    export require clear user intent.
2.  **Show your work:** every capsule section should be reviewable and
    editable.
3.  **No magic claims:** clearly distinguish extracted facts from
    inferred or uncertain content.
4.  **Portable by design:** the capsule is plain text/Markdown and can
    be used on another supported model.
5.  **Local-first:** no account or cloud sync is required for the MVP.
6.  **Progressive disclosure:** simple default flow; advanced controls
    are available when needed.
7.  **Accessible and fast:** keyboard support, readable contrast, clear
    status, and responsive layouts.

## 6. Scope and release strategy

### MVP --- must have

-   Chromium Manifest V3 extension, with a browser-compatible
    architecture.
-   Supported-page detection for an explicitly defined initial list of
    AI chat websites.
-   User-triggered capture of visible/available conversation messages
    using provider-specific adapters.
-   Manual paste/import as a reliable fallback.
-   Local conversation library and metadata.
-   Structured capsule generation using deterministic extraction and a
    pluggable summarization provider.
-   Capsule editor with sections: Goal, Current State, Decisions,
    Requirements, Key Details/Code, Errors, Open Questions, Next
    Actions.
-   Copy-to-clipboard and Markdown export.
-   Search across saved conversation titles and message text.
-   Delete individual conversations and clear all local data.
-   Helpful empty, unsupported, loading, error, and success states.
-   Privacy settings and clear disclosure before any remote AI
    processing.

### Release 1.1 --- should have

-   Provider adapters for additional supported chat sites.
-   Import from `.txt`, `.md`, and JSON formats where practical.
-   Message-level selection and pinning.
-   Duplicate/related conversation detection.
-   Search filters for code, error, decision, requirement, and date.
-   Prompt-size estimate and adjustable capsule length.
-   Versioned capsule history so users can compare changes.

### Future --- could have

-   Optional local-model summarization through a user-configured local
    endpoint.
-   Optional encrypted backup/export and user-controlled sync.
-   Semantic search with a local embedding model.
-   Cross-conversation project workspace.
-   Capsule comparison and change timeline.
-   Optional project handoff templates for debugging, coding, research,
    and study.
-   Import/export compatibility with other tools through documented
    formats.

### Explicitly out of scope for MVP

-   Automatic cross-device synchronization.
-   Always-on background capture.
-   Automatic submission of a prompt without preview and confirmation.
-   Paid API usage hidden inside the extension.
-   A proprietary account system unless a later validated need justifies
    it.

## 7. Key differentiator: Continuation Capsule

A capsule is not merely a generic paragraph summary. It is a structured,
editable snapshot of work.

Recommended schema: - `project_goal`: What the user is trying to
accomplish. - `current_state`: What is already implemented or known. -
`decisions`: Chosen approaches and the reason, when available. -
`requirements`: Functional and non-functional requirements. -
`important_details`: Constraints, terminology, environment, links, and
assumptions. - `code_artifacts`: Selected snippets, filenames, language,
and explanation. - `errors_and_fixes`: Error text, attempted fixes, and
known resolution. - `open_questions`: Unresolved questions or
uncertainty. - `next_actions`: Ordered, concrete next steps. -
`source_references`: Message identifiers or timestamps supporting
extracted details. - `excluded_items`: Optional count/reason for content
intentionally omitted. - `generated_at`, `source_conversation_id`,
`schema_version`.

Each section must be editable. When feasible, important extracted items
should link back to their source message. The interface should label
uncertain items and never silently turn guesses into facts.


## 7A. Related work, research gap, and proposed contribution

This section supports the project's literature survey and should be validated against the latest versions of the cited tools before final submission. Product feature descriptions are based on publicly available product pages, while academic claims are based on the cited papers.

### Related work

**Long-term conversational memory.** Wang et al. (2023) describe recursive summarization as a way to maintain useful dialogue memory over long conversations. Maharana et al. (2024) introduce LoCoMo and report that long-term dialogue tasks remain difficult, including temporal and causal consistency across sessions. These works motivate preserving more than a generic paragraph summary: the system should retain decisions, chronology, unresolved tasks, and relevant source evidence.

**Memory mechanisms for LLM agents.** Zhang et al. (2024) survey memory mechanisms in LLM-based agents and discuss design patterns and evaluation challenges. ContextBridge applies the broad memory problem to a user-facing browser workflow, with explicit user review and portable continuation prompts.

**Conversation saving and retrieval products.** ChatSaver publicly describes manual saving of visible conversations, local storage, search/filtering, and export. MemoryBase describes cross-platform conversation memory, project/timeline views, and context packs. These examples show that saving, searching, categorizing, and reusing conversation context are already established capabilities. ContextBridge must not claim those capabilities alone as its novelty.

### Research gap

The reviewed research and product examples suggest a practical design opportunity: a lightweight, privacy-focused workflow that joins structured project-state extraction with visible source evidence, user approval, change review, and portable handoff. This is a **project-specific design gap to investigate**, not a claim that no existing tool has any of these features. A broader competitor review and hands-on testing should be completed before asserting uniqueness.

### Proposed contribution: Evidence-linked Continuity Brief

ContextBridge will be designed around five connected mechanisms:

1. **Evidence-linked facts:** Each important decision, requirement, completed task, error, or next action should retain a reference to the source message(s) when available. Users can inspect the evidence before accepting the item.
2. **Change-aware project state:** When a new conversation is added to an existing project, compare the new draft with the previously approved state and show additions, changed statements, possible contradictions, and items that may now be outdated. The user chooses what to accept.
3. **Uncertainty and contradiction review:** Flag statements that appear inconsistent or insufficiently supported. Do not silently resolve conflicts; show both source snippets and let the user decide.
4. **User-governed compression:** Allow users to pin facts, exclude sections, edit generated text, and choose Compact/Balanced/Detailed output. Pinned facts must not be silently discarded to meet a size target.
5. **Portable, privacy-first handoff:** Generate a plain-text/Markdown continuation brief that can be pasted into a new chat or used with another supported assistant. Remote model processing is optional and disclosed; a rule-based fallback remains available.

The distinguishing idea is the **combination and evaluation** of provenance, state-diff review, conflict handling, user-governed compression, and portability—not any single feature in isolation.

### Research questions

- **RQ1:** Does an evidence-linked structured brief help users recover key project decisions and next actions more accurately than a plain conversation summary?
- **RQ2:** Does showing state changes and possible contradictions reduce the number of outdated or conflicting facts carried into a new chat?
- **RQ3:** Can a local-first workflow provide useful continuation briefs without requiring a paid API or uploading conversation content?
- **RQ4:** How much source information can be reduced while preserving the facts users judge essential for continuing a task?

### Proposed evaluation method

Create a small, documented test set of consented or synthetic conversations representing student software projects. Include explicit requirements, decisions, code, errors, corrections, and pending tasks. Avoid using private chats without informed consent.

Compare two outputs for each test conversation:
- **Baseline:** a plain chronological or generic summary.
- **ContextBridge:** an evidence-linked Continuity Brief with editable sections, source references, state-change review, and pinned facts.

Measure:
- **Key-fact retention:** proportion of pre-labelled essential facts retained.
- **Source traceability:** proportion of included claims with a valid source reference.
- **Contradiction handling:** number of seeded contradictions flagged and number missed.
- **Compression ratio:** brief size divided by source transcript size, using the same approximate token-counting method for both outputs.
- **Task resumption:** whether a participant can identify the current state and next action from the brief.
- **User effort:** time to review and prepare the brief, plus a short usability questionnaire.
- **Privacy verification:** confirm that the no-provider configuration sends no conversation content over the network.

Report sample size, test cases, limitations, and results honestly. Do not claim that the system improves accuracy until the evaluation supports that conclusion.

### Novelty statement for the project report

> ContextBridge proposes a privacy-focused AI conversation continuity workflow that converts long conversations into structured, user-editable project-state briefs. In addition to compression and retrieval, the proposed design emphasizes source-linked facts, reviewable changes between project states, explicit handling of uncertain or conflicting information, and user-controlled preservation of important context. The project will evaluate whether these mechanisms help users resume work more reliably than a plain summary.

This statement describes the intended contribution. It is not a claim of global first invention or a patent-level novelty finding.

### References

1. Wang, Q., Ding, L., Cao, Y., Tian, Z., Wang, S., Tao, D., & Guo, L. (2023). *Recursively Summarizing Enables Long-Term Dialogue Memory in Large Language Models*. arXiv:2308.15022. https://arxiv.org/abs/2308.15022
2. Maharana, A., Lee, D.-H., Tulyakov, S., Bansal, M., Barbieri, F., & Fang, Y. (2024). *Evaluating Very Long-Term Conversational Memory of LLM Agents*. Proceedings of ACL 2024, 13851–13870. https://aclanthology.org/2024.acl-long.747/
3. Zhang, Z., Bo, X., Ma, C., Li, R., Chen, X., Dai, Q., Zhu, J., Dong, Z., & Wen, J.-R. (2024). *A Survey on the Memory Mechanism of Large Language Model based Agents*. arXiv:2404.13501. https://arxiv.org/abs/2404.13501
4. ChatSaver. (Accessed 12 October 2026). *Chrome Web Store listing*. https://chromewebstore.google.com/detail/chatsaver/efkoioeobkjefbdhooalmhfllacemjca
5. MemoryBase. (Accessed 12 October 2026). *Chrome Web Store listing*. https://chromewebstore.google.com/detail/memorybase/bbdkfffldjdhpndnpcljnfccdhhacjma

Before submitting the report, verify that the product listings still describe the same features and add access dates required by your college's citation style.

## 8. Functional requirements

  -------------------------------------------------------------------------------
  ID                Requirement        Priority          Acceptance criteria
  ----------------- ------------------ ----------------- ------------------------
  FR-01             Detect supported   Must              The extension displays a
                    AI chat pages                        recognized provider/page
                                                         state or a useful
                                                         unsupported-page
                                                         explanation.

  FR-02             Capture a          Must              Capture starts only
                    conversation on                      after the user initiates
                    user request                         it; the UI shows
                                                         progress and a result
                                                         count.

  FR-03             Import             Must              User can paste text or
                    conversation                         choose a supported file
                    text/file                            and preview it before
                                                         saving.

  FR-04             Normalize messages Must              Messages retain role,
                                                         text, order, and
                                                         available
                                                         timestamp/source
                                                         metadata.

  FR-05             Generate           Must              The system creates the
                    structured capsule                   defined sections and
                                                         handles empty sections
                                                         gracefully.

  FR-06             Review and edit    Must              User can edit, remove,
                    capsule                              or restore each section
                                                         before use.

  FR-07             Create             Must              User can preview the
                    continuation                         exact final prompt and
                    prompt                               copy it.

  FR-08             Local conversation Must              Saved conversations
                    library                              persist locally across
                                                         browser restarts.

  FR-09             Search             Must              Search returns matching
                    conversations                        conversations/messages
                                                         and highlights the
                                                         matching text when
                                                         possible.

  FR-10             Export             Must              User can export a
                                                         capsule as Markdown and
                                                         conversation data as
                                                         JSON or plain text.

  FR-11             Delete data        Must              User can delete one
                                                         conversation or clear
                                                         all local data with
                                                         confirmation.

  FR-12             Privacy disclosure Must              Remote processing is
                                                         clearly disclosed and
                                                         never enabled silently.

  FR-13             Unsupported-page   Must              User can still use
                    fallback                             paste/import and the
                                                         capsule workflow.

  FR-14             Capsule size       Should            User can select compact,
                    control                              balanced, or detailed
                                                         output and see an
                                                         approximate size.

  FR-15             Pin key facts      Should            User can mark selected
                                                         messages/items as
                                                         important and preserve
                                                         them during
                                                         regeneration.

  FR-16             Search filters     Should            User can filter results
                                                         by code, error,
                                                         decision, requirement,
                                                         or conversation.

  FR-17             Provider adapters  Must              Provider-specific DOM
                                                         logic is isolated from
                                                         the main product logic.
  -------------------------------------------------------------------------------

## 9. Non-functional requirements

-   **Privacy:** minimum permissions, local-first storage, no analytics
    by default, no conversation content in diagnostic logs.
-   **Security:** sanitize imported/rendered content, avoid unsafe HTML
    insertion, validate message and import sizes, protect against prompt
    injection in imported content.
-   **Reliability:** manual import must work even if provider page
    markup changes.
-   **Performance:** popup/panel should open promptly; searching a
    typical local library should feel immediate; long processing should
    be asynchronous with progress feedback.
-   **Accessibility:** keyboard navigability, visible focus, meaningful
    labels, accessible contrast, reduced-motion support.
-   **Maintainability:** typed data models, adapter interface, modular
    storage/summary/search layers, automated tests.
-   **Portability:** export format must remain human-readable and
    versioned.
-   **Transparency:** clearly mark summary as AI-generated or rule-based
    and allow source inspection.

## 10. User experience requirements

The current popup's "No supported LLM chat found on this page" message
is informative but too much of a dead end. The next design should turn
this state into a useful starting point.

### Main surfaces

1.  **Compact popup:** current-page status, one primary action, recent
    capsules, quick import.
2.  **Workspace side panel or extension tab:** full library, search,
    capsule editor, settings, and export.
3.  **Capture review screen:** message count, role breakdown, optional
    message selection, and save/cancel.
4.  **Capsule studio:** section-based editor, source references, size
    meter, preview, copy/export.
5.  **Settings:** privacy, provider support, local model/AI provider
    configuration, data management.

### Supported-page state

-   Show provider name and detected conversation title when available.
-   Primary action: **Capture conversation**.
-   Secondary actions: **Open Capsule Studio**, **Import conversation**.
-   Show a short privacy statement and where the data will be stored.

### Unsupported-page state

-   Explain that direct capture is unavailable on this page.
-   Offer **Paste conversation**, **Import file**, and **Open saved
    capsules**.
-   Never leave the user at a dead end.

### Capsule Studio layout

-   Left: conversation outline and capsule sections.
-   Center: editable structured sections.
-   Right or collapsible drawer: source messages, quality checks, size
    estimate, and preview.
-   Primary action: **Prepare continuation prompt**.
-   Secondary actions: **Copy**, **Export Markdown**, **Save capsule**.

## 11. Suggested user journey

1.  User opens a long supported AI conversation.
2.  User opens ContextBridge and sees the detected
    provider/conversation.
3.  User clicks **Capture conversation** and reviews the detected
    message count.
4.  User optionally selects important messages or excludes sensitive
    content.
5.  ContextBridge normalizes messages and builds a draft capsule.
6.  User reviews/edit sections, resolves uncertainty, and chooses
    Compact/Balanced/Detailed.
7.  User previews the exact continuation prompt.
8.  User copies it, opens a new chat, and pastes it---or uses a clearly
    confirmed insert action where supported.
9.  User saves the capsule and can later search, revise, or export it.

## 12. Summary and extraction strategy

Use a layered approach rather than relying on a single opaque AI
call: 1. **Normalize:** convert captured/imported content into a common
message schema. 2. **Deterministic extraction:** identify code blocks,
error-like text, explicit TODOs, headings, requirements, decisions, and
user-pinned messages. 3. **Summarization:** optionally use a configured
model to organize the extracted information. 4. **Validation:** enforce
schema, length limits, source references where available, and section
types. 5. **Review:** user edits and approves before the prompt is used.
6. **Fallback:** if no model is configured or a request fails, provide a
rule-based summary and let the user edit it.

Do not send all content to a remote provider without clear opt-in. Keep
provider/API credentials out of source code and browser storage where
possible; explain the limitations of storing a user-supplied API key in
an extension.

## 13. Data model overview

-   **Conversation:** id, title, provider, source URL (optional),
    createdAt, updatedAt, messages, tags, captureMethod.
-   **Message:** id, conversationId, role, content, timestamp
    (optional), sequence, selected, pinned, sourceMetadata.
-   **Capsule:** id, conversationId, title, schemaVersion, sections,
    promptText, createdAt, updatedAt, sizeEstimate, generationMethod.
-   **CapsuleSection:** key, title, content, sourceMessageIds,
    confidence/needsReview, included.
-   **Settings:** theme, default capsule size, privacy preferences,
    provider adapter settings, optional model endpoint configuration.
-   **SearchIndex:** derived local index that can be rebuilt from stored
    data.

Treat source URLs and imported content as untrusted. Store only data
needed for the user-facing features.

## 14. Success metrics

For a student project, measure quality with a small usability test
rather than collecting user data remotely: - At least 8/10 test users
can create and copy a capsule without help. - At least 90% of test runs
can complete the manual import-to-capsule workflow. - Users can find a
known keyword in a saved conversation in under 10 seconds on the test
dataset. - No conversation is sent to a remote service without explicit
consent. - Users can delete a conversation and verify it no longer
appears in the library. - Testers rate continuation usefulness and
clarity with a short feedback form.

## 15. Risks and mitigations

-   **Provider DOM changes:** keep adapters small, versioned, and
    covered by fixture tests; always provide manual import.
-   **Summary omits a critical detail:** include pinned facts, source
    references, editable sections, and a detailed mode.
-   **Hallucinated summary details:** distinguish source-backed content
    from inference; require review.
-   **Sensitive data exposure:** local-first default, clear
    remote-processing consent, data deletion, and no content telemetry.
-   **Large conversations freeze the UI:** process in chunks, use Web
    Workers where appropriate, show progress, enforce configurable size
    limits.
-   **Model/API cost:** rule-based fallback; BYO key or local endpoint
    only as optional configuration; show provider/cost implications.
-   **Extension store permission concerns:** request minimal host
    permissions and explain each permission.

## 16. Acceptance checklist for MVP

-   [ ] Supported-page detection and unsupported-page fallback work.
-   [ ] Manual paste/import works without any provider integration.
-   [ ] Capture is user-triggered and reviewable.
-   [ ] Messages are normalized and stored locally.
-   [ ] Structured capsule is generated with a deterministic fallback.
-   [ ] Every section can be edited and excluded.
-   [ ] Exact continuation prompt can be previewed and copied.
-   [ ] Search, Markdown export, JSON export, and deletion work.
-   [ ] No remote processing occurs without explicit consent.
-   [ ] Empty, loading, error, success, and permission states are
    designed.
-   [ ] Automated tests cover normalization, extraction, storage, and
    prompt building.
-   [ ] README explains installation, privacy, limitations, and test
    procedure.

## 17. Final product statement

ContextBridge is a **conversation continuity workspace**, not just a
summarizer. Its core value is turning long, messy conversations into a
transparent, editable, source-aware package of project state and next
actions that users can carry into their next AI chat.
