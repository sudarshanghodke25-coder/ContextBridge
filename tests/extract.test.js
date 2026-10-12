import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  extractGoal,
  extractDecisions,
  extractRequirements,
  extractTechnicalContext,
  extractCodeBlocks,
  extractErrors,
  extractNextActions,
  extractMilestones
} from '../src/domain/extract.js';

test('extractGoal identifies project goal from user statements', () => {
  const messages = [
    { id: '1', role: 'user', sequence: 1, content: 'I want to build a privacy-first browser extension for AI continuity.' },
    { id: '2', role: 'assistant', sequence: 2, content: 'I can certainly help you with that.' }
  ];

  const goal = extractGoal(messages);
  assert.ok(goal.text.toLowerCase().includes('privacy-first browser extension'));
  assert.equal(goal.sourceMessageId, '1');
});

test('extractDecisions and extractRequirements identify core constraints', () => {
  const messages = [
    { id: '1', role: 'user', sequence: 1, content: 'The system must support local IndexedDB storage and must not send user data remotely.' },
    { id: '2', role: 'assistant', sequence: 2, content: 'Understood. We decided to use Manifest V3 and ES Modules instead of webpack.' }
  ];

  const reqs = extractRequirements(messages);
  assert.ok(reqs.length > 0);
  assert.ok(reqs.some(r => r.text.toLowerCase().includes('must support local indexeddb')));

  const decs = extractDecisions(messages);
  assert.ok(decs.length > 0);
  assert.ok(decs.some(d => d.text.toLowerCase().includes('manifest v3')));
});

test('extractCodeBlocks and extractErrors parse technical artifacts', () => {
  const messages = [
    {
      id: '1',
      role: 'assistant',
      sequence: 1,
      content: 'Here is the helper function:\n```javascript\nfunction test() { return 42; }\n```\nHowever, it failed:\nTypeError: Cannot read properties of undefined'
    }
  ];

  const code = extractCodeBlocks(messages);
  assert.equal(code.length, 1);
  assert.equal(code[0].language, 'javascript');
  assert.equal(code[0].code, 'function test() { return 42; }');

  const errors = extractErrors(messages);
  assert.equal(errors.length, 1);
  assert.match(errors[0].snippet, /TypeError:/);
});

test('extractMilestones generates timeline nodes with categories', () => {
  const messages = [
    { id: '1', role: 'user', sequence: 1, content: 'Goal is to implement ContextBridge continuity workspace.' },
    { id: '2', role: 'assistant', sequence: 2, content: 'We decided to use pure vanilla modern web components.' },
    { id: '3', role: 'assistant', sequence: 3, content: 'Next steps: implement the State Diff engine.' }
  ];

  const milestones = extractMilestones(messages);
  assert.ok(milestones.length >= 2);
  assert.equal(milestones[0].category, 'goal');
  assert.equal(milestones[0].pinned, true);
  assert.ok(milestones.some(m => m.category === 'decision'));
});
