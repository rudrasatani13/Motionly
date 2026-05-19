import { BrowserRouter, useRoutes } from 'react-router-dom';

import { routes } from '@router/routes';

/**
 * Entry point for the Motionly router.
 *
 * Phase 6 uses `<BrowserRouter>` + `useRoutes()` rather than the data router
 * APIs because the app does not have data loaders yet — those land alongside
 * Supabase in later phases. Switching to `createBrowserRouter` when loaders
 * arrive will only touch this file.
 */
function AppRoutes(): JSX.Element | null {
  return useRoutes(routes);
}

export function AppRouter(): JSX.Element {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
