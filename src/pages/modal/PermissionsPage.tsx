import { RoutePlaceholder } from '@components/routing/RoutePlaceholder';

export default function PermissionsPage(): JSX.Element {
  return (
    <RoutePlaceholder
      routeName="Permissions"
      routePath="/permissions"
      phaseNote="Permissions route is wired. Real camera and notification permission requests are implemented when their platform adapters land (Phases 16 and 44)."
    />
  );
}
