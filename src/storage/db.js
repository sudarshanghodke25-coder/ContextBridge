/**
 * ContextBridge Local IndexedDB Database
 * Provides fast, high-capacity, privacy-first local storage for conversations and briefs.
 * Includes headless/test fallback for test runners.
 */

const DB_NAME = 'ContextBridgeDB';
const DB_VERSION = 1;

const STORES = {
  CONVERSATIONS: 'conversations',
  BRIEFS: 'briefs',
  SETTINGS: 'settings'
};

// In-memory fallback if IndexedDB is unavailable (e.g. in Node.js test environment)
class MemoryStore {
  constructor() {
    this.data = new Map();
  }
  async get(storeName, key) {
    const store = this.data.get(storeName) || new Map();
    return store.get(key) || null;
  }
  async getAll(storeName) {
    const store = this.data.get(storeName) || new Map();
    return Array.from(store.values());
  }
  async put(storeName, value) {
    if (!this.data.has(storeName)) {
      this.data.set(storeName, new Map());
    }
    const store = this.data.get(storeName);
    store.set(value.id || value.key, value);
    return value;
  }
  async delete(storeName, key) {
    const store = this.data.get(storeName);
    if (store) store.delete(key);
  }
  async clear(storeName) {
    if (storeName) {
      const store = this.data.get(storeName);
      if (store) store.clear();
    } else {
      this.data.clear();
    }
  }
}

let memoryFallback = null;

function isIndexedDBAvailable() {
  return typeof indexedDB !== 'undefined';
}

function openDB() {
  if (!isIndexedDBAvailable()) {
    if (!memoryFallback) memoryFallback = new MemoryStore();
    return Promise.resolve(null);
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORES.CONVERSATIONS)) {
        const convStore = db.createObjectStore(STORES.CONVERSATIONS, { keyPath: 'id' });
        convStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        convStore.createIndex('provider', 'provider', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.BRIEFS)) {
        const briefStore = db.createObjectStore(STORES.BRIEFS, { keyPath: 'id' });
        briefStore.createIndex('conversationId', 'conversationId', { unique: false });
        briefStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function dbGet(storeName, key) {
  if (!isIndexedDBAvailable()) {
    if (!memoryFallback) memoryFallback = new MemoryStore();
    return memoryFallback.get(storeName, key);
  }
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function dbGetAll(storeName) {
  if (!isIndexedDBAvailable()) {
    if (!memoryFallback) memoryFallback = new MemoryStore();
    return memoryFallback.getAll(storeName);
  }
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function dbPut(storeName, item) {
  if (!isIndexedDBAvailable()) {
    if (!memoryFallback) memoryFallback = new MemoryStore();
    return memoryFallback.put(storeName, item);
  }
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.put(item);
    req.onsuccess = () => resolve(item);
    req.onerror = () => reject(req.error);
  });
}

export async function dbDelete(storeName, key) {
  if (!isIndexedDBAvailable()) {
    if (!memoryFallback) memoryFallback = new MemoryStore();
    return memoryFallback.delete(storeName, key);
  }
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.delete(key);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

export async function dbClearAll() {
  if (!isIndexedDBAvailable()) {
    if (!memoryFallback) memoryFallback = new MemoryStore();
    return memoryFallback.clear();
  }
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORES.CONVERSATIONS, STORES.BRIEFS, STORES.SETTINGS], 'readwrite');
    tx.objectStore(STORES.CONVERSATIONS).clear();
    tx.objectStore(STORES.BRIEFS).clear();
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export { STORES };
