import type { ReactNode } from 'react';

/**
 * Routing-only skeleton component used by Phase 6 placeholder pages.
 *
 * This is **not** the Phase 8 component library. It exists so that the
 * routing architecture can be validated end-to-end without shipping fake
 * product UI: every route renders an honest, technical "this URL is wired"
 * marker that names the future phase that will build the real screen.
 *
 * Rules for callers:
 * - Do not render fake user data, fake stats, fake workout cards, or fake
 *   AI feedback through this component.
 * - Keep copy technical: name the route, name the future phase, and stop.
 * - Use the Phase 5 Tailwind tokens (`text-motionly-*`, `bg-motionly-*`,
 *   typography utilities) — no hardcoded colors.
 */
type RoutePlaceholderProps = {
  /** Short, human-readable name of the route, e.g. "Workout Library". */
  routeName: string;
  /** The actual URL pattern, e.g. `/workouts/:id`. */
  routePath: string;
  /** One honest sentence about when the real screen lands. */
  phaseNote: string;
  /** Optional extra technical context (route params, guard status). */
  details?: ReactNode;
};

export function RoutePlaceholder({
  routeName,
  routePath,
  phaseNote,
  details,
}: RoutePlaceholderProps): JSX.Element {
  return (
    <section
      className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10 sm:px-8"
      aria-labelledby="route-placeholder-heading"
    >
      <header className="flex flex-col gap-2">
        <p className="text-label uppercase tracking-wide text-motionly-neutral-500 dark:text-motionly-neutral-400">
          Route wired
        </p>
        <h1
          id="route-placeholder-heading"
          className="text-h1 text-motionly-neutral-900 dark:text-motionly-neutral-50"
        >
          {routeName}
        </h1>
        <code className="self-start rounded-md bg-motionly-neutral-100 px-2 py-1 text-caption text-motionly-neutral-700 dark:bg-motionly-neutral-900 dark:text-motionly-neutral-300">
          {routePath}
        </code>
      </header>

      <p className="text-body text-motionly-neutral-600 dark:text-motionly-neutral-300">
        {phaseNote}
      </p>

      {details ? (
        <div className="rounded-lg border border-motionly-neutral-200 bg-motionly-neutral-50 p-4 text-caption text-motionly-neutral-600 dark:border-motionly-neutral-800 dark:bg-motionly-neutral-900 dark:text-motionly-neutral-300">
          {details}
        </div>
      ) : null}
    </section>
  );
}
