/**
 * ContextBridge Continuation Brief Repository
 * Handles CRUD operations for saved continuation briefs and timelines.
 */

import { STORES, dbGet, dbGetAll, dbPut, dbDelete } from './db.js';

export async function saveBrief(brief) {
  if (!brief || !brief.id) {
    throw new Error('Invalid brief: ID is required');
  }

  const record = {
    ...brief,
    updatedAt: Date.now()
  };

  await dbPut(STORES.BRIEFS, record);
  return record;
}

export async function getBrief(id) {
  if (!id) return null;
  return dbGet(STORES.BRIEFS, id);
}

export async function getBriefByConversationId(conversationId) {
  if (!conversationId) return null;
  const all = await dbGetAll(STORES.BRIEFS);
  return all.find(b => b.conversationId === conversationId) || null;
}

export async function listBriefs() {
  const all = await dbGetAll(STORES.BRIEFS);
  return all.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

export async function deleteBrief(id) {
  if (!id) return false;
  return dbDelete(STORES.BRIEFS, id);
}
