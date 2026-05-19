/**
 * Phase 10 — Onboarding storage platform adapter.
 *
 * Read-only chokepoint for the `hasOnboarded` flag. Following the
 * platform-adapter rule (`docs/ARCHITECTURE.md` §6), any browser
 * storage access required to resolve the launch decision lives here
 * instead of leaking into product code.
 *
 * Phase 10 boundaries:
 * - **Read only.** No writes. Writing `hasOnboarded = true` belongs
 *   to Phase 12 once the onboarding flow's completion step exists.
 * - **No schema yet.** Phase 30 introduces the real IndexedDB schema
 *   (`useStorageAdapter`, idb-keyval, etc.). Until then this reader
 *   intentionally has nothing to read and resolves to `false`.
 * - **Honest fallback.** If IndexedDB is unavailable (private mode,
 *   unsupported browser, error opening the database, missing
 *   store / key) the reader fails safely to `false` so the launch
 *   gate routes the user to `/welcome`. No fake first-time user is
 *   ever invented; `false` is the truthful answer when no flag has
 *   been written.
 * - **No fake seeds.** This module must not write demo flags, must
 *   not respect a query-string override, and must not surface a UI
 *   toggle to fake onboarding completion.
 *
 * When Phase 30 lands, only the implementation of `readHasOnboarded`
 * changes; every consumer continues to call the same async function.
 */

const ONBOARDING_DB_NAME = 'motionly';
const ONBOARDING_STORE_NAME = 'onboarding';
const ONBOARDING_HAS_ONBOARDED_KEY = 'hasOnboarded';

function canUseIndexedDB(): boolean {
  if (typeof globalThis === 'undefined') {
    return false;
  }
  return typeof (globalThis as { indexedDB?: unknown }).indexedDB !== 'undefined';
}

function openExistingDatabase(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (!canUseIndexedDB()) {
      resolve(null);
      return;
    }
    let request: IDBOpenDBRequest;
    try {
      request = indexedDB.open(ONBOARDING_DB_NAME);
    } catch {
      resolve(null);
      return;
    }
    // Phase 10 must not create the schema — Phase 30 owns that. If the
    // database does not exist yet, abort the open and resolve `null`.
    request.onupgradeneeded = () => {
      try {
        request.transaction?.abort();
      } catch {
        // Ignore — we resolve `null` below.
      }
    };
    request.onerror = () => resolve(null);
    request.onblocked = () => resolve(null);
    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(ONBOARDING_STORE_NAME)) {
        db.close();
        resolve(null);
        return;
      }
      resolve(db);
    };
  });
}

function readBooleanFromStore(db: IDBDatabase, key: string): Promise<boolean> {
  return new Promise((resolve) => {
    let tx: IDBTransaction;
    try {
      tx = db.transaction(ONBOARDING_STORE_NAME, 'readonly');
    } catch {
      resolve(false);
      return;
    }
    const store = tx.objectStore(ONBOARDING_STORE_NAME);
    const getRequest = store.get(key);
    getRequest.onerror = () => resolve(false);
    getRequest.onsuccess = () => {
      const value: unknown = getRequest.result;
      resolve(value === true);
    };
    tx.onerror = () => resolve(false);
    tx.onabort = () => resolve(false);
  });
}

/**
 * Resolve the persisted `hasOnboarded` flag, or `false` when no real
 * flag has been written. Never throws — failures collapse to `false`
 * so the launch gate can route the user to `/welcome` honestly.
 *
 * Until Phase 12 writes the flag and Phase 30 ships the IndexedDB
 * schema, this resolves to `false` for every user.
 */
export async function readHasOnboarded(): Promise<boolean> {
  try {
    const db = await openExistingDatabase();
    if (db === null) {
      return false;
    }
    try {
      return await readBooleanFromStore(db, ONBOARDING_HAS_ONBOARDED_KEY);
    } finally {
      db.close();
    }
  } catch {
    return false;
  }
}
