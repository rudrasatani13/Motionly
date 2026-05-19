import { RoutePlaceholder } from '@components/routing/RoutePlaceholder';

export default function ProfilePage(): JSX.Element {
  return (
    <RoutePlaceholder
      routeName="Profile"
      routePath="/profile"
      phaseNote="Profile route is wired. Real settings, subscription management, and privacy controls land in Phases 45–47."
    />
  );
}
