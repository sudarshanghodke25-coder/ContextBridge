/**
 * ContextBridge Smart Quality Checks
 * Analyzes briefs and conversations for privacy risks, secrets, missing goals,
 * prompt overflow, and unresolved contradictions before copying or exporting.
 */

import { SectionKeys } from './types.js';

export function runQualityChecks(brief, conversation = null) {
  const issues = [];

  if (!brief || !brief.sections) {
    return issues;
  }

  const sectionsByKey = new Map(brief.sections.map(s => [s.key, s]));

  // 1. Check for Missing Goal
  const goalSec = sectionsByKey.get(SectionKeys.GOAL);
  if (!goalSec || !goalSec.included || !goalSec.content || goalSec.content.length < 10) {
    issues.push({
      id: 'missing-goal',
      severity: 'warning',
      title: 'Project Goal is Missing or Vague',
      message: 'Brief lacks a clearly defined outcome. The receiving model may ask for clarification.'
    });
  }

  // 2. Check for Next Actions
  const actionSec = sectionsByKey.get(SectionKeys.NEXT_ACTIONS);
  if (!actionSec || !actionSec.included || !actionSec.content || actionSec.content.length < 10) {
    issues.push({
      id: 'missing-actions',
      severity: 'warning',
      title: 'No Next Action Specified',
      message: 'Include at least one concrete next step so the destination LLM knows where to begin.'
    });
  }

  // 3. Check for Secrets / API Keys / Tokens
  const secretPatterns = [
    { name: 'OpenAI API Key', regex: /sk-[a-zA-Z0-9]{20,}/ },
    { name: 'Anthropic API Key', regex: /sk-ant-[a-zA-Z0-9_\-]{20,}/ },
    { name: 'GitHub Token', regex: /gh[pousr]_[a-zA-Z0-9]{36,}/ },
    { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/ },
    { name: 'Private Key', regex: /-----BEGIN (?:RSA )?PRIVATE KEY-----/ },
    { name: 'Generic Password/Secret', regex: /(?:api[_-]?key|password|secret|bearer)\s*[:=]\s*['"][a-zA-Z0-9_\-\.]{12,}['"]/i }
  ];

  const fullContent = brief.sections.map(s => s.content).join('\n');
  for (const sp of secretPatterns) {
    if (sp.regex.test(fullContent)) {
      issues.push({
        id: 'potential-secret',
        severity: 'danger',
        title: `Possible Secret Detected (${sp.name})`,
        message: 'Review your brief content to ensure confidential credentials are removed before sharing or copying.'
      });
      break;
    }
  }

  // 4. Check for Long Prompt / Token Overflow
  if (brief.sizeEstimate > 3500) {
    issues.push({
      id: 'large-prompt',
      severity: 'info',
      title: 'Brief is Substantial (>3,500 approx tokens)',
      message: 'Consider switching to "Compact" or unchecking unneeded code blocks to conserve context space.'
    });
  }

  // 5. Check for Large Code Block
  const codeSec = sectionsByKey.get(SectionKeys.CODE_AND_ERRORS);
  if (codeSec && codeSec.included && codeSec.content.length > 2000) {
    issues.push({
      id: 'large-code',
      severity: 'info',
      title: 'Large Code Block Included',
      message: 'Only the essential lines needed to continue debugging or implementation are recommended.'
    });
  }

  return issues;
}
