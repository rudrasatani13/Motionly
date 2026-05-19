import { RoutePlaceholder } from '@components/routing/RoutePlaceholder';

export default function WelcomePage(): JSX.Element {
  return (
    <RoutePlaceholder
      routeName="Welcome"
      routePath="/welcome"
      phaseNote="Welcome route is wired. The real first-launch / splash experience is implemented in Phase 10."
    />
  );
}
