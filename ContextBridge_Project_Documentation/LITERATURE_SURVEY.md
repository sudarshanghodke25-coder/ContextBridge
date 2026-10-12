# ContextBridge — Literature Survey and Research Gap

**Purpose:** A report-ready starting point for the literature survey section of the final-year project.  
**Important:** This is a focused initial survey, not an exhaustive systematic literature review. Verify citations, product features, and access dates before final submission.

## 1. Introduction

Long AI conversations contain project goals, decisions, requirements, code, errors, and unfinished tasks. When users move to a new conversation or model, a generic summary may omit details needed to continue the work. ContextBridge addresses this practical problem by preparing a structured, editable, portable continuation brief.

## 2. Review of related research and systems

### 2.1 Recursive summarization for long-term dialogue memory

Wang et al. (2023) proposed recursively summarizing dialogue to maintain long-term memory for language models. Their work motivates compact memory representations as a way to support longer conversations. For ContextBridge, the relevant lesson is that conversation continuity needs a maintained representation rather than repeatedly copying a full transcript. However, a user-facing browser extension also needs editing, source inspection, and portable handoff.

### 2.2 Evaluation of long-term conversational memory

Maharana et al. (2024) introduced LoCoMo, a benchmark for very long-term conversational memory, with long conversations spanning multiple sessions. Their findings report continuing challenges in long-range consistency and temporal/causal understanding. This motivates ContextBridge's emphasis on retaining chronology, marking uncertainty, and testing whether a brief preserves essential facts—not simply whether it sounds fluent.

### 2.3 Memory mechanisms in LLM-based agents

Zhang et al. (2024) surveyed memory mechanisms for LLM-based agents, reviewing approaches and evaluation challenges. This provides broader context for designing a memory layer. ContextBridge focuses on an explicit human-controlled workflow in which extracted information is reviewed before it becomes the approved state used for future continuation.

### 2.4 Existing conversation-saving and memory extensions

Public product descriptions show that features such as saving chats locally, searching conversations, exporting history, grouping conversations, timeline views, and reusable context packs already exist in the ecosystem. ChatSaver describes local saving, search/filtering, import, and export. MemoryBase describes cross-platform AI memory, project/timeline views, and context packs. These capabilities are useful prior art and should be acknowledged. ContextBridge should not claim that basic conversation capture, search, export, or context packaging alone is novel.

## 3. Comparative summary

| Related work/system | Main focus described in source | Relevance to ContextBridge | Opportunity for ContextBridge |
|---|---|---|---|
| Wang et al. (2023) | Recursive summarization for long-term dialogue memory | Supports the idea of compact conversation memory | Add source-linked, user-approved project facts and practical browser handoff |
| Maharana et al. (2024) / LoCoMo | Evaluation of very long-term conversational memory | Shows long-range consistency is a meaningful challenge | Evaluate fact retention, task resumption, and conflict handling |
| Zhang et al. (2024) | Survey of LLM-agent memory mechanisms | Provides a conceptual view of memory design | Apply memory concepts to a transparent user-facing extension workflow |
| ChatSaver product listing | Local conversation saving, search/filter, import/export | Establishes that local archive features already exist | Go beyond archive/search toward state-aware continuation review |
| MemoryBase product listing | Cross-platform memory, project/timeline views, context packs | Establishes that project organization and context packaging already exist | Focus on explicit evidence traceability, reviewable state changes, and measured portability |

This comparison is based on selected public sources and is not a full feature-by-feature benchmark. Product features can change.

## 4. Identified research gap

The reviewed sources establish that dialogue summarization, long-term memory evaluation, conversation archives, search, timelines, and context packs are existing areas. A useful project-specific opportunity is to combine the following in one privacy-conscious, user-reviewed continuation workflow:

1. **Evidence-linked facts:** important claims link back to source messages.
2. **Change-aware state:** newly imported conversations are compared with a previously approved project state.
3. **Conflict review:** potentially inconsistent facts are shown side by side instead of being silently merged.
4. **User-governed compression:** pinned facts and selected sections remain under user control.
5. **Portable handoff:** the approved brief can be copied into a new supported AI chat without depending on a single provider.
6. **Evaluated usefulness:** compare this workflow with a plain-summary baseline using defined metrics.

This is a proposed design and evaluation gap, not proof that no existing product implements similar capabilities. A full competitor review and prototype testing are needed before making stronger novelty claims.

## 5. Proposed system and contribution

ContextBridge is proposed as a browser extension that captures or imports AI conversations, normalizes messages, extracts a structured project state, and produces an editable Continuation Brief. The distinctive design emphasis is not merely reducing transcript length; it is preserving the provenance and review status of important facts while making changes between project states visible.

The system should:
- store conversation data locally by default;
- work with manual import even when a provider adapter is unavailable;
- support a rule-based fallback without a paid API;
- allow the user to review and edit every brief section;
- link extracted items to source messages where possible;
- show changes and possible contradictions before updating approved project state;
- generate a plain-text/Markdown continuation prompt;
- never claim to bypass the underlying AI model's context or usage limits.

## 6. Research questions and evaluation

### Research questions
- RQ1: Does source-linked structure help users identify key decisions and next actions more accurately than a plain summary?
- RQ2: Does state-diff review help users notice changed or contradictory information before continuing a project?
- RQ3: Can a useful workflow operate locally without sending conversation content to a remote service?
- RQ4: What reduction in transcript size is possible while retaining the facts users consider essential?

### Suggested evaluation
Use a small set of synthetic or consented conversations with labelled essential facts, explicit decisions, errors, code, and seeded conflicts. Compare a plain-summary baseline against a ContextBridge brief.

Measure:
- essential fact retention;
- percentage of included claims with valid source references;
- seeded-conflict detection and missed conflicts;
- brief-to-transcript size ratio;
- participant success in identifying current state and next action;
- time required to review and prepare a continuation brief;
- confirmation that no content is transmitted in no-provider mode.

Report the dataset size, evaluation procedure, limitations, and observed results. Do not claim that the proposed design is superior until the results support the claim.

## 7. Conclusion

Prior research supports the need for long-term conversational memory and shows that consistency across long interactions remains challenging. Existing products also demonstrate that saving, searching, exporting, organizing, and packaging AI conversations are established capabilities. ContextBridge's proposed contribution is therefore a user-controlled continuity workflow centered on evidence-linked facts, reviewable state changes, conflict visibility, privacy, and portability. The contribution should be validated through a prototype and a transparent comparison against a plain-summary baseline.

## References

1. Wang, Q., Ding, L., Cao, Y., Tian, Z., Wang, S., Tao, D., & Guo, L. (2023). *Recursively Summarizing Enables Long-Term Dialogue Memory in Large Language Models*. arXiv:2308.15022. https://arxiv.org/abs/2308.15022
2. Maharana, A., Lee, D.-H., Tulyakov, S., Bansal, M., Barbieri, F., & Fang, Y. (2024). *Evaluating Very Long-Term Conversational Memory of LLM Agents*. Proceedings of the 62nd Annual Meeting of the Association for Computational Linguistics, 13851–13870. https://aclanthology.org/2024.acl-long.747/
3. Zhang, Z., Bo, X., Ma, C., Li, R., Chen, X., Dai, Q., Zhu, J., Dong, Z., & Wen, J.-R. (2024). *A Survey on the Memory Mechanism of Large Language Model based Agents*. arXiv:2404.13501. https://arxiv.org/abs/2404.13501
4. ChatSaver. *Chrome Web Store listing*. https://chromewebstore.google.com/detail/chatsaver/efkoioeobkjefbdhooalmhfllacemjca
5. MemoryBase. *Chrome Web Store listing*. https://chromewebstore.google.com/detail/memorybase/bbdkfffldjdhpndnpcljnfccdhhacjma

Use the citation format required by your institution. Verify all web sources and access dates at the time of submission.
