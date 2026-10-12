/**
 * ContextBridge Continuation Prompt Builder
 * Assembles the exact formatted prompt ready to be sent to ChatGPT, Claude, Gemini, or copied.
 * Follows strict prompt construction rules from Section 5 of IMPLEMENTATION_PLAN.md.
 */

import { estimateTokens } from './normalize.js';

export function buildContinuationPrompt(brief, options = {}) {
  if (!brief || !Array.isArray(brief.sections)) {
    return { promptText: '', tokenCount: 0 };
  }

  const { targetName = 'AI Assistant' } = options;
  const sections = brief.sections.filter(s => s.included && s.content && s.content.trim().length > 0);

  const parts = [];

  // 1. Preamble & Continuation Directive
  parts.push(`[CONTEXT BRIDGE: RESUMING PROJECT SESSION]`);
  parts.push(
    `You are continuing an in-progress engineering/research session with me. ` +
    `Below is the verified Continuity Brief representing our project goal, decisions, current status, and next tasks. ` +
    `Treat established decisions as binding unless I ask to revise them. Do not hallucinate missing context; ask if critical details are needed.`
  );
  parts.push(`----------------------------------------`);

  // 2. Ordered Sections
  sections.forEach(sec => {
    parts.push(`### ${sec.title}`);
    parts.push(sec.content.trim());
    parts.push('');
  });

  // 3. Closing Direction
  parts.push(`----------------------------------------`);
  parts.push(
    `[INSTRUCTIONS FOR ${targetName.toUpperCase()}]\n` +
    `1. Acknowledge this context briefly in one sentence.\n` +
    `2. Confirm your understanding of the Next Immediate Actions.\n` +
    `3. Immediately begin addressing Task #1 from the Next Immediate Actions list.`
  );

  const promptText = parts.join('\n\n').trim();
  const tokenCount = estimateTokens(promptText);

  return {
    promptText,
    tokenCount,
    sectionCount: sections.length
  };
}
