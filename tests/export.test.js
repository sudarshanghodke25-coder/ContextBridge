import { test } from 'node:test';
import assert from 'node:assert/strict';
import { exportBriefToMarkdown } from '../src/export/markdown.js';
import { exportToJSON, validateAndParseJSON } from '../src/export/json.js';

test('exportBriefToMarkdown produces structured markdown with milestones and sections', () => {
  const brief = {
    title: 'Distributed System Design',
    mode: 'balanced',
    sizeEstimate: 320,
    updatedAt: Date.now(),
    milestones: [
      { title: 'Chose Raft Consensus', category: 'decision', summary: 'Use Raft for leader election' }
    ],
    sections: [
      { title: 'Project Goal', content: 'Build a distributed KV store', included: true },
      { title: 'Excluded Section', content: 'Should not appear', included: false }
    ]
  };

  const md = exportBriefToMarkdown(brief);
  assert.ok(md.includes('# Continuation Brief: Distributed System Design'));
  assert.ok(md.includes('Chose Raft Consensus'));
  assert.ok(md.includes('Build a distributed KV store'));
  assert.ok(!md.includes('Should not appear'));
});

test('exportToJSON and validateAndParseJSON maintain data integrity', () => {
  const conv = {
    id: 'c100',
    title: 'ML Pipeline',
    provider: 'Claude',
    messages: [
      { id: 'm1', role: 'user', content: 'Train model' }
    ]
  };

  const jsonStr = exportToJSON(conv);
  const parsed = validateAndParseJSON(jsonStr);

  assert.equal(parsed.valid, true);
  assert.equal(parsed.type, 'contextbridge');
  assert.equal(parsed.conversation.id, 'c100');
  assert.equal(parsed.conversation.provider, 'Claude');
});
