import { NavLink } from 'react-router-dom';

import { ROUTE_PATHS } from '@router/routePaths';

/**
 * Phase 6 mobile bottom tab bar.
 *
 * This is routing infrastructure, not the Phase 8 component library. It
 * intentionally uses plain text labels (no icon library yet) and only the
 * Phase 5 Tailwind tokens. The Phase 8 redesign will replace it with a real
 * primitive when icons, haptics, and final visual treatment land.
 *
 * The bar renders the four top-level main routes. Active state is driven
 * by `<NavLink>` with `end` on the home route so `/workouts` and
 * `/workouts/:id` don't both light up "Home".
 */
type TabDefinition = {
  to: string;
  label: string;
  end?: boolean;
};

const TABS: ReadonlyArray<TabDefinition> = [
  { to: ROUTE_PATHS.home, label: 'Home', end: true },
  { to: ROUTE_PATHS.workouts, label: 'Workouts' },
  { to: ROUTE_PATHS.progress, label: 'Progress' },
  { to: ROUTE_PATHS.profile, label: 'Profile' },
];

const BASE_LINK_CLASS =
  'flex flex-1 flex-col items-center justify-center rounded-lg px-3 py-2 text-label transition-colors';
const INACTIVE_LINK_CLASS =
  'text-motionly-neutral-500 hover:text-motionly-neutral-900 dark:text-motionly-neutral-400 dark:hover:text-motionly-neutral-50';
const ACTIVE_LINK_CLASS =
  'text-motionly-primary bg-motionly-neutral-100 dark:bg-motionly-neutral-900';

export function BottomTabBar(): JSX.Element {
  return (
    <nav
      aria-label="Primary"
      className="flex w-full items-center justify-between gap-1 rounded-2xl border border-motionly-neutral-200 bg-motionly-bg-light/90 p-1 shadow-sm backdrop-blur dark:border-motionly-neutral-800 dark:bg-motionly-bg-dark/90"
    >
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            `${BASE_LINK_CLASS} ${isActive ? ACTIVE_LINK_CLASS : INACTIVE_LINK_CLASS}`
          }
          aria-label={tab.label}
        >
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
