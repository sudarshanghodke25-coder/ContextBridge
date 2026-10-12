import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeRole, parseRawTranscript, normalizeMessages, estimateTokens } from '../src/domain/normalize.js';
import { MessageRoles } from '../src/domain/types.js';

test('normalizeRole maps diverse role labels correctly', () => {
  assert.equal(normalizeRole('user'), MessageRoles.USER);
  assert.equal(normalizeRole('Human'), MessageRoles.USER);
  assert.equal(normalizeRole('Me'), MessageRoles.USER);
  assert.equal(normalizeRole('chatgpt'), MessageRoles.ASSISTANT);
  assert.equal(normalizeRole('claude'), MessageRoles.ASSISTANT);
  assert.equal(normalizeRole('Gemini'), MessageRoles.ASSISTANT);
  assert.equal(normalizeRole('assistant'), MessageRoles.ASSISTANT);
  assert.equal(normalizeRole('unknown_bot'), MessageRoles.UNKNOWN);
});

test('estimateTokens calculates approximate token size', () => {
  assert.equal(estimateTokens(''), 0);
  assert.equal(estimateTokens('abcd'), 1);
  assert.equal(estimateTokens('Hello, how can I help you today?'), 8);
});

test('parseRawTranscript handles structured conversation headers', () => {
  const transcript = `
User: I want to build a real-time chat application with WebSockets.
Assistant: Sounds great! You should use Node.js and Socket.io for the backend.
User: What database should we pick?
Assistant: We decided to use PostgreSQL for persistent message storage.
`;

  const result = parseRawTranscript(transcript);
  assert.equal(result.messages.length, 4);
  assert.equal(result.messages[0].role, MessageRoles.USER);
  assert.match(result.messages[0].content, /real-time chat application/);
  assert.equal(result.messages[1].role, MessageRoles.ASSISTANT);
  assert.equal(result.messages[2].role, MessageRoles.USER);
  assert.equal(result.messages[3].role, MessageRoles.ASSISTANT);
  assert.equal(result.stats.userMessages, 2);
  assert.equal(result.stats.assistantMessages, 2);
});

test('parseRawTranscript falls back to single message if no delimiters found', () => {
  const plainText = 'Can you review this code for any security bugs?';
  const result = parseRawTranscript(plainText);
  assert.equal(result.messages.length, 1);
  assert.equal(result.messages[0].role, MessageRoles.USER);
  assert.equal(result.messages[0].content, plainText);
  assert.equal(result.warnings.length, 1);
});
