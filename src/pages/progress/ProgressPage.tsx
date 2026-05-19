import { RoutePlaceholder } from '@components/routing/RoutePlaceholder';

export default function ProgressPage(): JSX.Element {
  return (
    <RoutePlaceholder
      routeName="Progress"
      routePath="/progress"
      phaseNote="Progress route is wired. Real workout history, charts, and form score trends are implemented in Phase 28."
    />
  );
}
