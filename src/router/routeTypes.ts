/**
 * TypeScript types for React Router URL params used in Motionly.
 *
 * Phase 6 declares only the shapes used by the routing skeleton. Real data
 * loading, real workout IDs, and the surrounding service layer arrive in
 * their own later phases.
 *
 * All dynamic segments are typed as `string | undefined` because
 * `useParams()` from react-router-dom always returns optional strings —
 * the router cannot guarantee at compile time that the route matched.
 */

/** A bare `:id` URL segment shared by several workout routes. */
export type RouteIdParam = {
  id: string | undefined;
};

/** `/workouts/:id` */
export type WorkoutDetailRouteParams = RouteIdParam;

/** `/workout/:id/setup` */
export type WorkoutSetupRouteParams = RouteIdParam;

/** `/workout/:id/active` */
export type WorkoutActiveRouteParams = RouteIdParam;

/** `/workout/:id/summary` */
export type WorkoutSummaryRouteParams = RouteIdParam;

/**
 * Union of every dynamic workout route param shape, useful for utilities that
 * need to accept any of them (e.g. a future telemetry hook).
 */
export type WorkoutRouteParams =
  | WorkoutDetailRouteParams
  | WorkoutSetupRouteParams
  | WorkoutActiveRouteParams
  | WorkoutSummaryRouteParams;
