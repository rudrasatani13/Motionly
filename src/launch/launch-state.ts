/**
 * Phase 10 — Launch state types.
 *
 * These types describe the inputs the launch gate considers (auth
 * placeholder, onboarding flag) and the destination it decides. They
 * are intentionally narrow — Phase 10 only needs enough surface to
 * make an honest "first-time vs. returning" decision while real auth
 * and real onboarding writes are still deferred.
 */

import type { ROUTE_PATHS } from '@router/routePaths';

/**
 * Honest result of `getLaunchAuthState()`.
 *
 * - `not-implemented` — real auth (Supabase / sessions / JWT) is still
 *   deferred to the planned backend/auth phase (Phase 32 per the
 *   master plan). The launch gate treats this as "no signed-in user."
 * - `authenticated` — reserved for the future real implementation.
 *   Phase 10 never returns this.
 * - `unauthenticated` — reserved for the future real implementation
 *   once an honest signed-out state exists (cleared session). Phase 10
 *   never returns this either; it returns `not-implemented` instead.
 */
export type LaunchAuthStatus = 'not-implemented' | 'authenticated' | 'unauthenticated';

export type LaunchAuthState = {
  status: LaunchAuthStatus;
  /**
   * Short, lowercase, machine-readable reason. Used by `LaunchGate`
   * for routing decisions and surfaced in dev logs / tests so the
   * "why" of a destination is auditable. Never user-facing copy.
   */
  reason: string;
};

/**
 * Inputs the launch gate aggregates before picking a destination.
 * Both fields are resolved on every cold launch; neither is cached
 * across launches by `useLaunchDecision`.
 */
export type LaunchInputs = {
  hasOnboarded: boolean;
  auth: LaunchAuthState;
};

/**
 * The destination route the launch gate would prefer, plus the
 * "why" for that destination. `LaunchGate` may decline to navigate
 * if the user already deep-linked into a non-`/` route.
 */
export type LaunchDecision = {
  destination: (typeof ROUTE_PATHS)['welcome'] | (typeof ROUTE_PATHS)['home'];
  reason: 'first-time-user' | 'auth-not-implemented' | 'returning-authenticated-user';
};
