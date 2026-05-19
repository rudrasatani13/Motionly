/**
 * Phase 10 — Launch orchestration barrel.
 *
 * `src/launch/` owns the boot-time decision layer: minimum brand
 * window, future-safe auth placeholder, `hasOnboarded` reader wiring,
 * and the gate that holds the React launch screen on screen until the
 * destination route is decided. See each module for the per-file
 * contract and the documentation in `docs/ARCHITECTURE.md` §10f.
 */

export { LaunchGate } from './LaunchGate';
export { useLaunchDecision, LAUNCH_MIN_VISIBLE_MS } from './useLaunchDecision';
export type { LaunchDecisionState } from './useLaunchDecision';
export { getLaunchAuthState } from './auth-state';
export type {
  LaunchAuthState,
  LaunchAuthStatus,
  LaunchDecision,
  LaunchInputs,
} from './launch-state';
