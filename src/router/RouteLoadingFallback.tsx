/**
 * Tiny route-level Suspense fallback.
 *
 * Shown while React.lazy chunks for a route are loading. Phase 6 keeps this
 * intentionally minimal — no progress bar, no skeleton mocks of fake content.
 * The Phase 8 component library may replace it once a `Spinner` primitive
 * exists.
 */
export function RouteLoadingFallback(): JSX.Element {
  return (
    <div
      className="flex min-h-dvh items-center justify-center bg-motionly-bg-light px-6 py-10 text-motionly-neutral-500 dark:bg-motionly-bg-dark dark:text-motionly-neutral-400"
      role="status"
      aria-live="polite"
    >
      <span className="text-caption">Loading route…</span>
    </div>
  );
}
