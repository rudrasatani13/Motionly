/**
 * Centralized route path constants for Motionly.
 *
 * Every route URL the app knows about is declared here. Components and hooks
 * should never inline string literals like `'/workouts'` — they should import
 * from this module so that renames stay safe and route inventory stays
 * discoverable.
 *
 * Phase 6 introduces this file. Later phases extend it as new routes land.
 * Real authentication, real screens, and real data are still deferred — these
 * constants describe the URL surface of the routing skeleton, not finished
 * product features.
 */

export const ROUTE_PATHS = {
  // Auth routes
  welcome: '/welcome',
  onboarding: '/onboarding',
  login: '/login',
  register: '/register',

  // Main (will be protected by RequireAuth)
  home: '/',
  workouts: '/workouts',
  workoutDetail: '/workouts/:id',
  workoutSetup: '/workout/:id/setup',
  workoutActive: '/workout/:id/active',
  workoutSummary: '/workout/:id/summary',
  progress: '/progress',
  profile: '/profile',

  // Modal-style routes (still real URLs; full pages today)
  paywall: '/paywall',
  permissions: '/permissions',

  // Fallback
  notFound: '*',
} as const;

export type RoutePathKey = keyof typeof ROUTE_PATHS;
export type RoutePathPattern = (typeof ROUTE_PATHS)[RoutePathKey];

/**
 * Build a concrete URL for a route that has a dynamic `:id` segment.
 *
 * Centralizing this here means feature code never has to remember the exact
 * shape of a URL — it asks for the route by name and passes the id in.
 */
export function buildWorkoutDetailPath(id: string): string {
  return `/workouts/${encodeURIComponent(id)}`;
}

export function buildWorkoutSetupPath(id: string): string {
  return `/workout/${encodeURIComponent(id)}/setup`;
}

export function buildWorkoutActivePath(id: string): string {
  return `/workout/${encodeURIComponent(id)}/active`;
}

export function buildWorkoutSummaryPath(id: string): string {
  return `/workout/${encodeURIComponent(id)}/summary`;
}
