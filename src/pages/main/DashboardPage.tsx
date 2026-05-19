import { RoutePlaceholder } from '@components/routing/RoutePlaceholder';
import { AUTH_GUARD_STATUS } from '@router/RequireAuth';

export default function DashboardPage(): JSX.Element {
  return (
    <RoutePlaceholder
      routeName="Dashboard (Home)"
      routePath="/"
      phaseNote="Home route is wired. The real dashboard (workout suggestions, progress preview) is implemented in Phase 13."
      details={
        <>
          Protected by <code>RequireAuth</code> structurally. Auth guard status:{' '}
          <code>{AUTH_GUARD_STATUS}</code>.
        </>
      }
    />
  );
}
