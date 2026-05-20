import { useEffect, useRef, useState } from 'react';

import { ROUTE_PATHS } from '@router/routePaths';
import { readHasOnboarded } from '@platform/onboarding-storage';

import { getLaunchAuthState } from './auth-state';
import type { LaunchDecision, LaunchInputs } from './launch-state';

/**
 * Minimum visible duration of the React launch screen, in milliseconds.
 *
 * Phase 10 budget: ~1.8 seconds. Long enough for the brand reveal to
 * feel deliberate, short enough that the master plan's "launch-to-home
 * under 2 seconds on mid-range Android Chrome" target stays reachable.
 */
export const LAUNCH_MIN_VISIBLE_MS = 1_800;

/**
 * Result of resolving the launch decision.
 *
 * - `ready === false` while either the minimum brand window or the
 *   underlying readers (`hasOnboarded`, `getLaunchAuthState`) are still
 *   pending.
 * - `ready === true` once both have settled. `decision` is then the
 *   honest destination + reason; consumers decide whether to navigate.
 */
export type LaunchDecisionState =
  | { ready: false }
  | { ready: true; decision: LaunchDecision; inputs: LaunchInputs };

function pickDestination(inputs: LaunchInputs): LaunchDecision {
  // Phase 10 honesty rules:
  // - Real auth is deferred, but a real onboarding completion flag now
  //   exists. Returning users should land on Home `/` regardless of the
  //   auth placeholder status.
  // - Fresh launches still go to `/welcome` because the persisted flag
  //   is absent.
  if (inputs.hasOnboarded) {
    return { destination: ROUTE_PATHS.home, reason: 'returning-onboarded-user' };
  }
  return { destination: ROUTE_PATHS.welcome, reason: 'first-time-user' };
}

/**
 * Rewrite the URL before the router mounts.
 *
 * The router (`<AppRouter>` / `<BrowserRouter>`) reads
 * `window.location.pathname` when it first mounts. The launch gate
 * keeps the React tree on `<LaunchScreen>` until the launch decision
 * resolves, so the router has not yet mounted at this point — we can
 * safely use `history.replaceState` to put the URL into its
 * canonical shape without triggering a router-level navigation.
 *
 * Only `/` is rewritten. Direct deep links (auth routes, workout
 * placeholders, 404 testing) stay where the user opened them so the
 * Phase 6 routing skeleton continues to be testable as documented.
 *
 * The single use of `window.history.replaceState` here is the
 * documented browser-API touch point for the launch layer. Camera /
 * TTS / storage / haptics / notifications still go through
 * `src/platform/`.
 */
function applyLaunchRedirect(decision: LaunchDecision): void {
  if (typeof window === 'undefined') {
    return;
  }
  const currentPathname = window.location.pathname;
  if (currentPathname !== ROUTE_PATHS.home) {
    return;
  }
  if (decision.destination === ROUTE_PATHS.home) {
    return;
  }
  const { search, hash } = window.location;
  window.history.replaceState({}, '', `${decision.destination}${search}${hash}`);
}

/**
 * Hook that resolves the Phase 10 launch decision once per mount.
 *
 * The hook awaits two things in parallel:
 * 1. A minimum visible duration so the brand reveal feels intentional.
 * 2. The underlying readers (`hasOnboarded` from `@platform/`, future
 *    auth state from `./auth-state`). Both fail safely — neither can
 *    leave the launch gate stuck.
 *
 * When both settle, the URL is reconciled with the launch decision
 * **before** `setState` flips `ready` to `true`. That ordering is
 * important: by the time `<AppRouter>` mounts and `<BrowserRouter>`
 * reads `window.location.pathname`, the URL is already canonical.
 *
 * Both inputs run on hook mount. The hook never re-fires after that;
 * future phases that want to rerun the decision (e.g. on sign-out)
 * should add an explicit retry surface instead of mutating this hook.
 */
export function useLaunchDecision(): LaunchDecisionState {
  const [state, setState] = useState<LaunchDecisionState>({ ready: false });
  const hasResolvedRef = useRef(false);

  useEffect(() => {
    if (hasResolvedRef.current === true) {
      return undefined;
    }

    let cancelled = false;

    const minDelay = new Promise<void>((resolve) => {
      window.setTimeout(resolve, LAUNCH_MIN_VISIBLE_MS);
    });
    const readsResolved = Promise.all([readHasOnboarded(), getLaunchAuthState()]);

    Promise.all([minDelay, readsResolved])
      .then(([, [hasOnboarded, auth]]) => {
        if (cancelled === true) {
          return;
        }
        hasResolvedRef.current = true;
        const inputs: LaunchInputs = { hasOnboarded, auth };
        const decision = pickDestination(inputs);
        applyLaunchRedirect(decision);
        setState({ ready: true, decision, inputs });
      })
      .catch(() => {
        if (cancelled === true) {
          return;
        }
        hasResolvedRef.current = true;
        const inputs: LaunchInputs = {
          hasOnboarded: false,
          auth: { status: 'not-implemented', reason: 'auth-deferred-to-backend-phase' },
        };
        const decision = pickDestination(inputs);
        applyLaunchRedirect(decision);
        setState({ ready: true, decision, inputs });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
