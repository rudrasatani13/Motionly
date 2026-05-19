import { RoutePlaceholder } from '@components/routing/RoutePlaceholder';

export default function LoginPage(): JSX.Element {
  return (
    <RoutePlaceholder
      routeName="Login"
      routePath="/login"
      phaseNote="Login route is wired. Real authentication (Supabase Auth) is implemented in Phase 32."
    />
  );
}
