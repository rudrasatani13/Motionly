/**
 * Aggregate barrel for `src/components/`.
 *
 * Re-exports:
 * - `./primitives/*` — Phase 8 reusable UI primitives.
 * - `./feedback/*`   — Phase 9 feedback / status / progress components.
 * - `./dashboard/*`  — Phase 13 dashboard composite components.
 * - `./routing/*`    — Phase 6 routing infrastructure components.
 *
 * Prefer importing from the subfolder barrels in product code
 * (`@components/primitives`, `@components/feedback`,
 * `@components/dashboard`, `@components/routing`) so the import path
 * documents intent. This top-level barrel exists for consumers that
 * want a single import surface.
 */

export * from './primitives';
export * from './feedback';
export * from './dashboard';
export { BottomTabBar } from './routing/BottomTabBar';
export { RoutePlaceholder } from './routing/RoutePlaceholder';
export { ServiceWorkerStatusPill } from './routing/ServiceWorkerStatusPill';
