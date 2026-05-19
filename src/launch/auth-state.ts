import type { LaunchAuthState } from './launch-state';

/**
 * Phase 10 — Future-safe launch-time auth placeholder.
 *
 * The master plan calls for Supabase session rehydration at launch,
 * but Motionly intentionally defers all real auth work (Supabase,
 * sessions, JWT, RLS) to its dedicated backend/auth phase (Phase 32
 * per `MOTIONLY_MASTER_PLAN.md`). Until that phase ships, this
 * module exists so the launch gate has a single, clearly named
 * function to call without leaking the "auth doesn't exist yet"
 * detail across the launch layer.
 *
 * Boundaries:
 * - **Do not** install `@supabase/supabase-js` or any auth SDK here.
 * - **Do not** read fake tokens from `localStorage` / cookies.
 * - **Do not** synthesize a `currentUser`.
 * - **Do not** return `'authenticated'` from Phase 10.
 *
 * When the backend/auth phase ships, this function becomes a real
 * session rehydration call against `src/services/auth/`. Every
 * caller in `src/launch/` continues to await the same Promise and
 * branch on the same `status` field.
 */
export function getLaunchAuthState(): Promise<LaunchAuthState> {
  return Promise.resolve({
    status: 'not-implemented',
    reason: 'auth-deferred-to-backend-phase',
  });
}
