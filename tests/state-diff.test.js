import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeStateDiff } from '../src/domain/state-diff.js';
import { DiffKinds } from '../src/domain/types.js';

test('computeStateDiff detects new facts correctly', () => {
  const previousFacts = [
    { id: 'f1', category: 'goal', statement: 'Build an extension', reviewStatus: 'accepted' }
  ];

  const proposedFacts = [
    { id: 'f1', category: 'goal', statement: 'Build an extension', reviewStatus: 'accepted' },
    { id: 'f2', category: 'decision', statement: 'Use IndexedDB for local storage', reviewStatus: 'needs-review' }
  ];

  const diffs = computeStateDiff(previousFacts, proposedFacts);
  assert.equal(diffs.length, 1);
  assert.equal(diffs[0].kind, DiffKinds.NEW);
  assert.equal(diffs[0].proposedFact.statement, 'Use IndexedDB for local storage');
});

test('computeStateDiff flags conflicting statements', () => {
  const previousFacts = [
    { id: 'f1', category: 'decision', statement: 'Use SQLite for storage', reviewStatus: 'accepted' }
  ];

  const proposedFacts = [
    { id: 'f2', category: 'decision', statement: 'Use Postgres for storage', reviewStatus: 'needs-review' }
  ];

  const diffs = computeStateDiff(previousFacts, proposedFacts);
  assert.equal(diffs.length, 1);
  assert.equal(diffs[0].kind, DiffKinds.POSSIBLE_CONFLICT);
});

test('computeStateDiff identifies outdated previous tasks', () => {
  const previousFacts = [
    { id: 't1', category: 'next-action', statement: 'Fix initial layout bug', reviewStatus: 'accepted' }
  ];

  const proposedFacts = [
    { id: 't2', category: 'next-action', statement: 'Deploy release package', reviewStatus: 'needs-review' }
  ];

  const diffs = computeStateDiff(previousFacts, proposedFacts);
  assert.ok(diffs.some(d => d.kind === DiffKinds.POSSIBLY_OUTDATED));
});
