import { Outlet } from 'react-router-dom';

import { ServiceWorkerStatusPill } from '@components/routing/ServiceWorkerStatusPill';

/**
 * Layout used by auth-related routes (welcome, login, register, onboarding)
 * and modal-style routes (paywall, permissions).
 *
 * Phase 6 keeps this layout deliberately bare — there is no real auth, no
 * branding shell, and no onboarding state. The PWA status pill stays visible
 * as honest foundation feedback because it does not imply any product
 * feature.
 */
export function AuthLayout(): JSX.Element {
  return (
    <div className="min-h-dvh bg-motionly-bg-light text-motionly-neutral-900 dark:bg-motionly-bg-dark dark:text-motionly-neutral-50">
      <div className="mx-auto grid min-h-dvh max-w-2xl grid-rows-[1fr_auto] px-2 py-2 sm:px-4">
        <main className="flex flex-col">
          <Outlet />
        </main>
        <footer className="flex justify-center pb-4 pt-2">
          <ServiceWorkerStatusPill />
        </footer>
      </div>
    </div>
  );
}
