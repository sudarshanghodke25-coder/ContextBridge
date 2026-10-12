import { test } from 'node:test';
import assert from 'node:assert/strict';
import { saveConversation, clearAllConversationData } from '../src/storage/conversation-repository.js';
import { saveBrief } from '../src/storage/brief-repository.js';
import { searchLocal, SearchFilters } from '../src/search/local-search.js';

test('searchLocal finds keywords and filters across conversations', async () => {
  await clearAllConversationData();

  await saveConversation({
    id: 'c1',
    title: 'PostgreSQL Migration',
    provider: 'ChatGPT',
    messages: [
      { id: 'm1', role: 'user', sequence: 1, content: 'We need to migrate our database to PostgreSQL 16.' },
      { id: 'm2', role: 'assistant', sequence: 2, content: 'Error: connection refused on port 5432 during pg_dump.' }
    ]
  });

  await saveBrief({
    id: 'b1',
    conversationId: 'c1',
    title: 'PostgreSQL Migration Brief',
    sections: [
      { key: 'decisions', title: 'Decisions', content: 'Migrate to PostgreSQL 16 with pg_dump', included: true }
    ]
  });

  const allResults = await searchLocal('postgresql');
  assert.ok(allResults.length > 0);
  assert.ok(allResults[0].snippet.toLowerCase().includes('postgresql'));

  const errorResults = await searchLocal('', SearchFilters.ERRORS);
  assert.ok(errorResults.length > 0);
  assert.equal(errorResults[0].type, 'error');
});
