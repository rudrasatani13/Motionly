import type { ReactNode } from 'react';

/**
 * Structural authentication guard.
 *
 * **IMPORTANT — Phase 6:** Motionly does not have real authentication yet.
 * Real auth (Supabase Auth, sessions, JWT, RLS) lands in Phase 32. Until then
 * this component is a structural placeholder that:
 *
 * - Renders its children unconditionally so every route can be validated
 *   during Phase 6 (open `/workouts`, `/profile`, etc. directly in the
 *   browser and the route's skeleton page will render).
 * - Does **not** read any "current user" from storage, cookies, or memory.
 * - Does **not** mint, accept, or honor fake tokens.
 * - Marks itself as a no-op via a clearly named status so it cannot be
 *   confused for real security in code review.
 *
 * When real auth ships in Phase 32 this component becomes responsible for:
 * - Reading the current session from the auth service in `src/services/auth/`
 * - Redirecting unauthenticated users to the welcome / login route via the
 *   `useNavigation()` helper
 * - Surfacing a small loading state while the session is being resolved
 *
 * Do not lift any auth logic out of `src/services/` into this file. This
 * component is the integration point between routing and the auth service,
 * not the home of auth logic itself.
 */
export const AUTH_GUARD_STATUS = 'auth-not-implemented-yet' as const;

type RequireAuthProps = {
  children: ReactNode;
};

export function RequireAuth({ children }: RequireAuthProps): JSX.Element {
  // Phase 6: structural pass-through. See block comment above for why.
  return <>{children}</>;
}
