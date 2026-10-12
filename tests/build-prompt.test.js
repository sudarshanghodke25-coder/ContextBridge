import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildContinuationBrief } from '../src/domain/build-brief.js';
import { buildContinuationPrompt } from '../src/domain/build-prompt.js';
import { runQualityChecks } from '../src/domain/quality-checks.js';
import { BriefModes } from '../src/domain/types.js';

test('buildContinuationBrief creates structured sections with Compact and Detailed modes', () => {
  const conversation = {
    id: 'c1',
    title: 'Authentication Setup',
    messages: [
      { id: 'm1', role: 'user', sequence: 1, content: 'I want to build an auth service with JWT.' },
      { id: 'm2', role: 'assistant', sequence: 2, content: 'We decided to use RS256 for signing tokens.\nNext steps: write the token verification middleware.' }
    ]
  };

  const compactBrief = buildContinuationBrief(conversation, { mode: BriefModes.COMPACT });
  assert.equal(compactBrief.mode, BriefModes.COMPACT);
  assert.ok(compactBrief.sections.length >= 8);

  const promptRes = buildContinuationPrompt(compactBrief, { targetName: 'Claude' });
  assert.ok(promptRes.promptText.includes('[CONTEXT BRIDGE: RESUMING PROJECT SESSION]'));
  assert.ok(promptRes.promptText.includes('[INSTRUCTIONS FOR CLAUDE]'));
  assert.ok(promptRes.tokenCount > 0);
});

test('runQualityChecks identifies missing elements or potential secrets', () => {
  const briefWithSecret = {
    sections: [
      { key: 'goal', included: true, content: 'Build a connector' },
      { key: 'nextActions', included: true, content: 'Run test suite' },
      { key: 'codeAndErrors', included: true, content: 'API_KEY = "sk-abcdef12345678901234567890"' }
    ]
  };

  const issues = runQualityChecks(briefWithSecret);
  assert.ok(issues.some(i => i.id === 'potential-secret'));
});
