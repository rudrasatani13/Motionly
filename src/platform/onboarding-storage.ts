/**
 * Phase 10 → Phase 12 — Onboarding storage platform adapter.
 *
 * Single chokepoint for the `hasOnboarded` flag and the minimal
 * onboarding completion payload. Following the
 * platform-adapter rule (`docs/ARCHITECTURE.md` §6), any browser
 * storage access for the launch decision lives here instead of
 * leaking into product code.
 *
 * Boundaries:
 * - **Read** path (`readHasOnboarded`) was introduced in Phase 10 to
 *   resolve the launch destination. It fails safely to `false`.
 * - **Write** path (`completeOnboardingStorage`) was added in Phase
 *   12 for the onboarding completion step. It writes
 *   `hasOnboarded = true` plus a minimal completion payload
 *   (timestamp, goals, fitness level, limitations, optional notes).
 *   It must not write fake user IDs, sessions, accounts, workouts,
 *   stats, or camera/media data. Supabase sync is deferred until
 *   backend/auth phases — see master plan Phase 12 notes.
 * - **No long-term schema.** Phase 30 will replace this with the
 *   real IndexedDB schema (`useStorageAdapter`, idb-keyval, etc.).
 *   This Phase 12 adapter is intentionally small and isolated so
 *   the swap is a localized refactor.
 * - **Honest fallback.** Failures collapse to typed result objects —
 *   no throwing — so callers always know whether the flag was
 *   persisted.
 */

const ONBOARDING_DB_NAME = 'motionly';
const ONBOARDING_DB_VERSION = 1;
const ONBOARDING_STORE_NAME = 'onboarding';
const ONBOARDING_HAS_ONBOARDED_KEY = 'hasOnboarded';
const ONBOARDING_COMPLETION_KEY = 'completion';

/**
 * Shape persisted alongside the `hasOnboarded` flag in Phase 12.
 *
 * Everything in this payload comes from the user's onboarding
 * answers. No fake or synthesized fields. Phase 30 may extend or
 * rename this once it owns the storage layer.
 */
export type OnboardingCompletionRecord = {
  completedAt: string;
  goals: string[];
  fitnessLevel: string | null;
  limitations: string[];
  limitationNotes: string;
  cameraPermissionGranted: boolean;
};

export type CompleteOnboardingResult =
  | { ok: true }
  | { ok: false; reason: 'storage-unavailable' | 'write-failed' };

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
    // Reader must not create the schema. If the database does not
    // exist or lacks the store, abort the open and resolve `null`.
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

function openOrCreateDatabase(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (!canUseIndexedDB()) {
      resolve(null);
      return;
    }
    let request: IDBOpenDBRequest;
    try {
      request = indexedDB.open(ONBOARDING_DB_NAME, ONBOARDING_DB_VERSION);
    } catch {
      resolve(null);
      return;
    }
    request.onupgradeneeded = () => {
      try {
        const db = request.result;
        if (!db.objectStoreNames.contains(ONBOARDING_STORE_NAME)) {
          db.createObjectStore(ONBOARDING_STORE_NAME);
        }
      } catch {
        // Ignore — error/blocked handlers below resolve null.
      }
    };
    request.onerror = () => resolve(null);
    request.onblocked = () => resolve(null);
    request.onsuccess = () => resolve(request.result);
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

function readUnknownFromStore(db: IDBDatabase, key: string): Promise<unknown | null> {
  return new Promise((resolve) => {
    let tx: IDBTransaction;
    try {
      tx = db.transaction(ONBOARDING_STORE_NAME, 'readonly');
    } catch {
      resolve(null);
      return;
    }

    let getRequest: IDBRequest<unknown>;
    try {
      const store = tx.objectStore(ONBOARDING_STORE_NAME);
      getRequest = store.get(key);
    } catch {
      resolve(null);
      return;
    }

    getRequest.onerror = () => resolve(null);
    getRequest.onsuccess = () => {
      resolve(getRequest.result ?? null);
    };
    tx.onerror = () => resolve(null);
    tx.onabort = () => resolve(null);
  });
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isOnboardingCompletionRecord(value: unknown): value is OnboardingCompletionRecord {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.completedAt === 'string' &&
    isStringArray(record.goals) &&
    (typeof record.fitnessLevel === 'string' || record.fitnessLevel === null) &&
    isStringArray(record.limitations) &&
    typeof record.limitationNotes === 'string' &&
    typeof record.cameraPermissionGranted === 'boolean'
  );
}

function writeCompletionToStore(
  db: IDBDatabase,
  completion: OnboardingCompletionRecord,
): Promise<boolean> {
  return new Promise((resolve) => {
    let tx: IDBTransaction;
    try {
      tx = db.transaction(ONBOARDING_STORE_NAME, 'readwrite');
    } catch {
      resolve(false);
      return;
    }
    const store = tx.objectStore(ONBOARDING_STORE_NAME);
    try {
      store.put(true, ONBOARDING_HAS_ONBOARDED_KEY);
      store.put(completion, ONBOARDING_COMPLETION_KEY);
    } catch {
      resolve(false);
      return;
    }
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => resolve(false);
    tx.onabort = () => resolve(false);
  });
}

/**
 * Resolve the persisted `hasOnboarded` flag, or `false` when no real
 * flag has been written. Never throws — failures collapse to `false`
 * so the launch gate can route the user to `/welcome` honestly.
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

/**
 * Read the real Phase 12 onboarding completion payload, if one exists.
 * Never creates storage, writes defaults, or throws to callers. Missing,
 * unavailable, errored, or malformed data all collapse to `null`.
 */
export async function readOnboardingCompletion(): Promise<OnboardingCompletionRecord | null> {
  try {
    const db = await openExistingDatabase();
    if (db === null) {
      return null;
    }
    try {
      const value = await readUnknownFromStore(db, ONBOARDING_COMPLETION_KEY);
      return isOnboardingCompletionRecord(value) ? value : null;
    } finally {
      db.close();
    }
  } catch {
    return null;
  }
}

/**
 * Persist the Phase 12 onboarding completion payload and flip
 * `hasOnboarded` to `true`. Returns a typed result rather than
 * throwing so the UI can react honestly when IndexedDB is missing
 * (private mode, unsupported browser).
 *
 * The payload is intentionally minimal — it does not contain a user
 * account, session, workouts, stats, or any media data. Phase 30
 * will replace this storage layer with the real one.
 */
export async function completeOnboardingStorage(
  completion: OnboardingCompletionRecord,
): Promise<CompleteOnboardingResult> {
  try {
    const db = await openOrCreateDatabase();
    if (db === null) {
      return { ok: false, reason: 'storage-unavailable' };
    }
    try {
      const wrote = await writeCompletionToStore(db, completion);
      return wrote ? { ok: true } : { ok: false, reason: 'write-failed' };
    } finally {
      db.close();
    }
  } catch {
    return { ok: false, reason: 'write-failed' };
  }
}
