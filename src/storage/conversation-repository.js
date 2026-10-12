/**
 * ContextBridge Conversation Repository
 * Handles CRUD operations for saved conversations in local storage.
 */

import { STORES, dbGet, dbGetAll, dbPut, dbDelete, dbClearAll } from './db.js';

export async function saveConversation(conversation) {
  if (!conversation || !conversation.id) {
    throw new Error('Invalid conversation record: ID is required');
  }

  const record = {
    ...conversation,
    updatedAt: Date.now()
  };

  await dbPut(STORES.CONVERSATIONS, record);
  return record;
}

export async function getConversation(id) {
  if (!id) return null;
  return dbGet(STORES.CONVERSATIONS, id);
}

export async function listConversations(query = '') {
  const all = await dbGetAll(STORES.CONVERSATIONS);
  all.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

  if (!query) return all;

  const q = query.toLowerCase();
  return all.filter(c => 
    (c.title && c.title.toLowerCase().includes(q)) ||
    (c.provider && c.provider.toLowerCase().includes(q)) ||
    (c.messages && c.messages.some(m => m.content.toLowerCase().includes(q)))
  );
}

export async function deleteConversation(id) {
  if (!id) return false;
  return dbDelete(STORES.CONVERSATIONS, id);
}

export async function clearAllConversationData() {
  return dbClearAll();
}
