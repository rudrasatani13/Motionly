import type { ReactNode } from 'react';

import { LaunchScreen } from '@components/launch/LaunchScreen';

import { useLaunchDecision } from './useLaunchDecision';

/**
 * Phase 10 — Launch gate.
 *
 * Wraps the app's routing tree with the React launch screen.
 * Responsibilities:
 *
 * - While the launch decision is pending, render `<LaunchScreen>` so
 *   the brand reveal stays on screen for the minimum window. The
 *   inline HTML splash painted by `index.html` is replaced as soon as
 *   React mounts; the React launch screen takes over with no white
 *   flash because both use the same `#0A0A0F` canvas.
 * - Once the decision resolves, mount `children` (the routing tree)
 *   exactly once.
 *
 * The URL is rewritten inside `useLaunchDecision` **before**
 * `state.ready` flips to `true`, so by the time `<AppRouter>` mounts
 * and `<BrowserRouter>` reads `window.location.pathname`, the URL is
 * already in its canonical shape. Direct deep links (auth routes,
 * Phase 6 workout placeholders, 404 testing) are preserved — only
 * the bare `/` entry is collapsed to the launch destination
 * (currently `/welcome` while real auth + onboarding are deferred).
 *
 * The gate intentionally sits **outside** the router. It does not
 * read or write fake auth state, does not invent fake onboarding
 * state, and does not announce a fake "checking session…" status.
 */
type LaunchGateProps = {
  children: ReactNode;
};

export function LaunchGate({ children }: LaunchGateProps): JSX.Element {
  const state = useLaunchDecision();

  if (state.ready === false) {
    return <LaunchScreen />;
  }
  return <>{children}</>;
}
