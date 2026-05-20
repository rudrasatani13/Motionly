import { Outlet } from 'react-router-dom';

import { BottomTabBar } from '@components/routing/BottomTabBar';

/**
 * Layout used by main (protected) routes: dashboard, workouts, progress,
 * profile, workout detail / setup / active / summary.
 *
 * Provides the routing-only bottom tab bar. The real component library
 * and top-level chrome land in later phases.
 */
export function MainLayout(): JSX.Element {
  return (
    <div className="min-h-dvh bg-motionly-bg-light text-motionly-neutral-900 dark:bg-motionly-bg-dark dark:text-motionly-neutral-50">
      <div className="mx-auto flex min-h-dvh max-w-2xl flex-col">
        <main className="flex-1 pb-28">
          <Outlet />
        </main>

        <div className="pointer-events-none fixed inset-x-0 bottom-0 flex flex-col items-center px-4 pb-4">
          <div className="pointer-events-auto w-full max-w-md">
            <BottomTabBar />
          </div>
        </div>
      </div>
    </div>
  );
}
