/**
 * ContextBridge Domain Types and Enums
 * Defines the core data contracts for messages, conversations, briefs, milestones, and state diffs.
 */

export const MessageRoles = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system',
  TOOL: 'tool',
  UNKNOWN: 'unknown'
};

export const BriefModes = {
  COMPACT: 'compact',
  BALANCED: 'balanced',
  DETAILED: 'detailed'
};

export const ReviewStatuses = {
  NEEDS_REVIEW: 'needs-review',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  PINNED: 'pinned'
};

export const FactCategories = {
  GOAL: 'goal',
  DECISION: 'decision',
  REQUIREMENT: 'requirement',
  MILESTONE: 'milestone',
  ERROR: 'error',
  NEXT_ACTION: 'next-action'
};

export const DiffKinds = {
  NEW: 'new',
  CHANGED: 'changed',
  POSSIBLE_CONFLICT: 'possible-conflict',
  POSSIBLY_OUTDATED: 'possibly-outdated'
};

export const SectionKeys = {
  GOAL: 'goal',
  CURRENT_STATE: 'currentState',
  DECISIONS: 'decisions',
  REQUIREMENTS: 'requirements',
  TECHNICAL_CONTEXT: 'technicalContext',
  CODE_AND_ERRORS: 'codeAndErrors',
  OPEN_QUESTIONS: 'openQuestions',
  NEXT_ACTIONS: 'nextActions',
  SOURCE_REFERENCES: 'sourceReferences'
};

export const SECTION_METADATA = [
  { key: SectionKeys.GOAL, title: 'Project Goal & Outcome', description: 'What the user is trying to accomplish' },
  { key: SectionKeys.CURRENT_STATE, title: 'Current State', description: 'What is already implemented or verified' },
  { key: SectionKeys.DECISIONS, title: 'Key Decisions & Architecture', description: 'Confirmed choices and rationales' },
  { key: SectionKeys.REQUIREMENTS, title: 'Requirements & Constraints', description: 'Must-have behaviors and limitations' },
  { key: SectionKeys.TECHNICAL_CONTEXT, title: 'Technical Context & Stack', description: 'Languages, frameworks, versions, and files' },
  { key: SectionKeys.CODE_AND_ERRORS, title: 'Code Artifacts & Error Logs', description: 'Selected snippets and resolved/active errors' },
  { key: SectionKeys.OPEN_QUESTIONS, title: 'Open Questions & Risks', description: 'Unresolved items and uncertainties' },
  { key: SectionKeys.NEXT_ACTIONS, title: 'Next Immediate Actions', description: 'Ordered, actionable steps to continue work' },
  { key: SectionKeys.SOURCE_REFERENCES, title: 'Source References', description: 'Linked provenance to original transcript messages' }
];
