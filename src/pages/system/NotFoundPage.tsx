import { Link } from 'react-router-dom';

import { ROUTE_PATHS } from '@router/routePaths';

export default function NotFoundPage(): JSX.Element {
  return (
    <section
      className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10 sm:px-8"
      aria-labelledby="not-found-heading"
    >
      <header className="flex flex-col gap-2">
        <p className="text-label uppercase tracking-wide text-motionly-neutral-500 dark:text-motionly-neutral-400">
          404
        </p>
        <h1
          id="not-found-heading"
          className="text-h1 text-motionly-neutral-900 dark:text-motionly-neutral-50"
        >
          Route not found
        </h1>
      </header>
      <p className="text-body text-motionly-neutral-600 dark:text-motionly-neutral-300">
        No Motionly route matches this URL. Routes registered so far are part of the Phase 6 routing
        skeleton — real screens land in their respective later phases.
      </p>
      <Link
        to={ROUTE_PATHS.home}
        className="self-start rounded-md border border-motionly-neutral-300 px-3 py-1.5 text-label text-motionly-neutral-700 transition-colors hover:bg-motionly-neutral-100 dark:border-motionly-neutral-700 dark:text-motionly-neutral-200 dark:hover:bg-motionly-neutral-900"
      >
        Back to Home
      </Link>
    </section>
  );
}
