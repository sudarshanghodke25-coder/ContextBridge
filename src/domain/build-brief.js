/**
 * ContextBridge Continuation Brief Builder
 * Constructs a structured, editable ContinuationBrief according to schema,
 * with Compact, Balanced, and Detailed modes, and preservation of pinned items.
 */

import { SectionKeys, BriefModes } from './types.js';
import { generateId, estimateTokens } from './normalize.js';
import {
  extractGoal,
  extractDecisions,
  extractRequirements,
  extractTechnicalContext,
  extractCodeBlocks,
  extractErrors,
  extractOpenQuestions,
  extractNextActions,
  extractMilestones
} from './extract.js';

/**
 * Builds a structured ContinuationBrief from a conversation record
 */
export function buildContinuationBrief(conversation, options = {}) {
  const {
    mode = BriefModes.BALANCED,
    pinnedMessageIds = [],
    existingBrief = null
  } = options;

  const messages = conversation.messages || [];
  const activeMessages = messages.filter(m => m.selected !== false);

  // Run deterministic extractions
  const goalObj = extractGoal(activeMessages);
  const decisions = extractDecisions(activeMessages);
  const requirements = extractRequirements(activeMessages);
  const techStack = extractTechnicalContext(activeMessages);
  const codeBlocks = extractCodeBlocks(activeMessages);
  const errors = extractErrors(activeMessages);
  const questions = extractOpenQuestions(activeMessages);
  const nextActions = extractNextActions(activeMessages);
  const milestones = extractMilestones(activeMessages);

  // Build section contents based on mode
  const isCompact = mode === BriefModes.COMPACT;
  const isDetailed = mode === BriefModes.DETAILED;

  // 1. Goal Content
  let goalContent = goalObj.text || 'Continue current software implementation.';
  const goalSources = goalObj.sourceMessageId ? [goalObj.sourceMessageId] : [];

  // 2. Current State Content
  const stateItems = [];
  if (milestones.length > 0) {
    stateItems.push(`Milestones identified: ${milestones.length} major progression steps.`);
  }
  if (techStack.length > 0) {
    stateItems.push(`Configured environment: ${techStack.join(', ')}.`);
  }
  if (activeMessages.length > 0) {
    const lastMsg = activeMessages[activeMessages.length - 1];
    stateItems.push(`Last discussion focused on: ${lastMsg.content.slice(0, 120).trim()}...`);
  }
  const currentStateContent = stateItems.join('\n');

  // 3. Decisions Content
  const decisionLimit = isCompact ? 3 : (isDetailed ? 10 : 6);
  const decisionLines = decisions.slice(0, decisionLimit).map(d => `• ${d.text}`);
  const decisionsContent = decisionLines.length > 0 
    ? decisionLines.join('\n') 
    : 'No explicit architectural choices recorded yet.';
  const decisionSources = decisions.slice(0, decisionLimit).map(d => d.sourceMessageId).filter(Boolean);

  // 4. Requirements Content
  const reqLimit = isCompact ? 2 : (isDetailed ? 10 : 5);
  const reqLines = requirements.slice(0, reqLimit).map(r => `• ${r.text}`);
  const requirementsContent = reqLines.length > 0 
    ? reqLines.join('\n') 
    : 'Standard project conventions and user specifications.';
  const reqSources = requirements.slice(0, reqLimit).map(r => r.sourceMessageId).filter(Boolean);

  // 5. Technical Context Content
  const techContextContent = techStack.length > 0
    ? `Stack: ${techStack.join(', ')}\nArchitecture: Browser Extension / Client Workspace`
    : 'Web environment / Standard runtime';

  // 6. Code & Errors Content
  const codeLines = [];
  if (errors.length > 0) {
    codeLines.push(`### Relevant Errors:\n${errors.map(e => `• ${e.snippet}`).slice(0, isCompact ? 1 : 3).join('\n')}`);
  }
  if (!isCompact && codeBlocks.length > 0) {
    const selectedCode = codeBlocks.slice(0, isDetailed ? 3 : 1);
    selectedCode.forEach(cb => {
      codeLines.push(`\n\`\`\`${cb.language}\n${cb.code.slice(0, isDetailed ? 600 : 250)}\n\`\`\``);
    });
  }
  const codeAndErrorsContent = codeLines.length > 0 ? codeLines.join('\n') : 'No blocking errors recorded.';
  const codeAndErrorSources = [
    ...errors.map(e => e.sourceMessageId),
    ...codeBlocks.slice(0, 2).map(c => c.sourceMessageId)
  ].filter(Boolean);

  // 7. Open Questions Content
  const questionLines = questions.slice(0, isCompact ? 1 : 4).map(q => `• ${q.text}?`);
  const openQuestionsContent = questionLines.length > 0 ? questionLines.join('\n') : 'None recorded.';
  const questionSources = questions.map(q => q.sourceMessageId).filter(Boolean);

  // 8. Next Actions Content
  const actionLimit = isCompact ? 3 : (isDetailed ? 8 : 5);
  const actionLines = nextActions.slice(0, actionLimit).map((a, idx) => `${idx + 1}. ${a.text}`);
  const nextActionsContent = actionLines.length > 0 
    ? actionLines.join('\n') 
    : '1. Review current implementation\n2. Proceed to next feature checkpoint';
  const actionSources = nextActions.slice(0, actionLimit).map(a => a.sourceMessageId).filter(Boolean);

  // 9. Source References Content
  const sourceRefLines = activeMessages
    .filter(m => m.pinned || pinnedMessageIds.includes(m.id))
    .map(m => `[Pinned Message #${m.sequence}] (${m.role}): "${m.content.slice(0, 80).replace(/\n/g, ' ')}..."`);
  const sourceReferencesContent = sourceRefLines.length > 0
    ? sourceRefLines.join('\n')
    : `Total transcript: ${activeMessages.length} messages analyzed.`;

  // Assemble sections
  const initialSections = [
    {
      key: SectionKeys.GOAL,
      title: 'Project Goal & Outcome',
      content: goalContent,
      included: true,
      editedByUser: false,
      needsReview: !goalObj.text,
      sourceMessageIds: goalSources
    },
    {
      key: SectionKeys.CURRENT_STATE,
      title: 'Current State',
      content: currentStateContent,
      included: true,
      editedByUser: false,
      needsReview: false,
      sourceMessageIds: []
    },
    {
      key: SectionKeys.DECISIONS,
      title: 'Key Decisions & Architecture',
      content: decisionsContent,
      included: true,
      editedByUser: false,
      needsReview: decisions.length === 0,
      sourceMessageIds: decisionSources
    },
    {
      key: SectionKeys.REQUIREMENTS,
      title: 'Requirements & Constraints',
      content: requirementsContent,
      included: !isCompact,
      editedByUser: false,
      needsReview: false,
      sourceMessageIds: reqSources
    },
    {
      key: SectionKeys.TECHNICAL_CONTEXT,
      title: 'Technical Context & Stack',
      content: techContextContent,
      included: true,
      editedByUser: false,
      needsReview: false,
      sourceMessageIds: []
    },
    {
      key: SectionKeys.CODE_AND_ERRORS,
      title: 'Code Artifacts & Error Logs',
      content: codeAndErrorsContent,
      included: errors.length > 0 || codeBlocks.length > 0,
      editedByUser: false,
      needsReview: false,
      sourceMessageIds: codeAndErrorSources
    },
    {
      key: SectionKeys.OPEN_QUESTIONS,
      title: 'Open Questions & Risks',
      content: openQuestionsContent,
      included: questions.length > 0,
      editedByUser: false,
      needsReview: false,
      sourceMessageIds: questionSources
    },
    {
      key: SectionKeys.NEXT_ACTIONS,
      title: 'Next Immediate Actions',
      content: nextActionsContent,
      included: true,
      editedByUser: false,
      needsReview: nextActions.length === 0,
      sourceMessageIds: actionSources
    },
    {
      key: SectionKeys.SOURCE_REFERENCES,
      title: 'Source References',
      content: sourceReferencesContent,
      included: !isCompact,
      editedByUser: false,
      needsReview: false,
      sourceMessageIds: pinnedMessageIds
    }
  ];

  // If existing brief exists with user edits, preserve user edits!
  const mergedSections = initialSections.map(newSec => {
    if (existingBrief && existingBrief.sections) {
      const prevSec = existingBrief.sections.find(s => s.key === newSec.key);
      if (prevSec && prevSec.editedByUser) {
        return {
          ...newSec,
          content: prevSec.content,
          included: prevSec.included,
          editedByUser: true
        };
      }
    }
    return newSec;
  });

  const allText = mergedSections.filter(s => s.included).map(s => s.content).join('\n');
  const sizeEstimate = estimateTokens(allText);

  return {
    id: existingBrief?.id || generateId('brief'),
    conversationId: conversation.id,
    title: conversation.title || 'Conversation Continuity Brief',
    schemaVersion: 1,
    mode,
    sections: mergedSections,
    milestones,
    sizeEstimate,
    generationMethod: 'rules',
    createdAt: existingBrief?.createdAt || Date.now(),
    updatedAt: Date.now()
  };
}
