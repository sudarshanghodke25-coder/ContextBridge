/**
 * ContextBridge Local Search Engine
 * Performs fast, client-side keyword and facet search across conversations,
 * briefs, milestones, decisions, code blocks, and errors.
 */

import { listConversations } from '../storage/conversation-repository.js';
import { listBriefs } from '../storage/brief-repository.js';

export const SearchFilters = {
  ALL: 'all',
  DECISIONS: 'decisions',
  REQUIREMENTS: 'requirements',
  CODE: 'code',
  ERRORS: 'errors',
  NEXT_ACTIONS: 'next-actions'
};

/**
 * Searches local conversations and briefs
 * @param {string} query Search keyword
 * @param {string} filterCategory Filter type from SearchFilters
 * @returns {Promise<Array>} Ranked and highlighted search results
 */
export async function searchLocal(query = '', filterCategory = SearchFilters.ALL) {
  const q = query.trim().toLowerCase();
  const conversations = await listConversations();
  const briefs = await listBriefs();
  const briefsByConvId = new Map(briefs.map(b => [b.conversationId, b]));

  const results = [];

  for (const conv of conversations) {
    const brief = briefsByConvId.get(conv.id);

    // 1. Search in Messages
    if (conv.messages) {
      for (const msg of conv.messages) {
        const text = msg.content;
        const lower = text.toLowerCase();

        let matchesFilter = true;
        let resultType = 'message';

        const isCode = text.includes('```');
        const isError = /(?:error|exception|traceback|failed):/i.test(text);

        if (filterCategory === SearchFilters.CODE && !isCode) matchesFilter = false;
        if (filterCategory === SearchFilters.ERRORS && !isError) matchesFilter = false;
        if (filterCategory === SearchFilters.DECISIONS || filterCategory === SearchFilters.REQUIREMENTS || filterCategory === SearchFilters.NEXT_ACTIONS) {
          matchesFilter = false; // message level filter handled below in brief sections
        }

        if (matchesFilter && (!q || lower.includes(q))) {
          const matchIndex = q ? lower.indexOf(q) : 0;
          const snippetStart = Math.max(0, matchIndex - 40);
          const snippetEnd = Math.min(text.length, matchIndex + (q ? q.length : 0) + 120);
          const snippet = text.slice(snippetStart, snippetEnd);

          results.push({
            id: `res_${msg.id}`,
            conversationId: conv.id,
            conversationTitle: conv.title,
            provider: conv.provider,
            type: isError ? 'error' : (isCode ? 'code' : 'message'),
            role: msg.role,
            sequence: msg.sequence,
            snippet: (snippetStart > 0 ? '...' : '') + snippet + (snippetEnd < text.length ? '...' : ''),
            matchedTerm: q,
            score: q ? (conv.title.toLowerCase().includes(q) ? 10 : 5) : 1
          });
        }
      }
    }

    // 2. Search in Brief Sections
    if (brief && brief.sections) {
      for (const sec of brief.sections) {
        if (!sec.content) continue;
        const text = sec.content;
        const lower = text.toLowerCase();

        let matchesFilter = true;
        if (filterCategory === SearchFilters.DECISIONS && sec.key !== 'decisions') matchesFilter = false;
        if (filterCategory === SearchFilters.REQUIREMENTS && sec.key !== 'requirements') matchesFilter = false;
        if (filterCategory === SearchFilters.NEXT_ACTIONS && sec.key !== 'nextActions') matchesFilter = false;
        if (filterCategory === SearchFilters.CODE && sec.key !== 'codeAndErrors') matchesFilter = false;
        if (filterCategory === SearchFilters.ERRORS && sec.key !== 'codeAndErrors') matchesFilter = false;

        if (matchesFilter && (!q || lower.includes(q))) {
          const matchIndex = q ? lower.indexOf(q) : 0;
          const snippetStart = Math.max(0, matchIndex - 30);
          const snippetEnd = Math.min(text.length, matchIndex + (q ? q.length : 0) + 100);
          const snippet = text.slice(snippetStart, snippetEnd);

          results.push({
            id: `res_sec_${brief.id}_${sec.key}`,
            conversationId: conv.id,
            conversationTitle: conv.title,
            provider: conv.provider,
            type: sec.key,
            role: 'brief',
            snippet: `[${sec.title}] ` + (snippetStart > 0 ? '...' : '') + snippet + (snippetEnd < text.length ? '...' : ''),
            matchedTerm: q,
            score: 8
          });
        }
      }
    }
  }

  // Sort by score
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, 50);
}
