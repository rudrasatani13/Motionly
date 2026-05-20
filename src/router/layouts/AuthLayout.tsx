import { Outlet } from 'react-router-dom';

/**
 * Layout used by auth-related routes (welcome, login, register, onboarding)
 * and modal-style routes (paywall, permissions).
 *
 * Phase 6 keeps this layout deliberately bare — there is no real auth, no
 * branding shell, and no onboarding state.
 */
export function AuthLayout(): JSX.Element {
  return (
    <div className="min-h-dvh bg-motionly-bg-light text-motionly-neutral-900 dark:bg-motionly-bg-dark dark:text-motionly-neutral-50">
      <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-2 py-2 sm:px-4">
        <main className="flex flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
