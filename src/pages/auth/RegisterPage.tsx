import { RoutePlaceholder } from '@components/routing/RoutePlaceholder';

export default function RegisterPage(): JSX.Element {
  return (
    <RoutePlaceholder
      routeName="Register"
      routePath="/register"
      phaseNote="Register route is wired. Real account creation is implemented in Phase 32 alongside authentication."
    />
  );
}
