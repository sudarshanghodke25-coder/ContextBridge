/**
 * ContextBridge Settings Repository
 * Manages user preferences: theme, default brief mode, privacy disclosures, custom model endpoints.
 */

import { STORES, dbGet, dbPut } from './db.js';
import { BriefModes } from '../domain/types.js';

const DEFAULT_SETTINGS = {
  theme: 'dark',
  defaultBriefMode: BriefModes.BALANCED,
  enableRemoteModel: false,
  remoteModelEndpoint: '',
  remoteModelApiKey: '',
  autoExtractMilestones: true,
  privacyAcknowledged: true
};

export async function getSettings() {
  try {
    const record = await dbGet(STORES.SETTINGS, 'user_settings');
    return record ? { ...DEFAULT_SETTINGS, ...record.value } : DEFAULT_SETTINGS;
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export async function updateSettings(newSettings) {
  const current = await getSettings();
  const merged = { ...current, ...newSettings };
  await dbPut(STORES.SETTINGS, { key: 'user_settings', value: merged });
  return merged;
}
