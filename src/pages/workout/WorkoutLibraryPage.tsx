import { RoutePlaceholder } from '@components/routing/RoutePlaceholder';

export default function WorkoutLibraryPage(): JSX.Element {
  return (
    <RoutePlaceholder
      routeName="Workout Library"
      routePath="/workouts"
      phaseNote="Workout Library route is wired. Real workout browsing and data is implemented in Phase 14."
    />
  );
}
