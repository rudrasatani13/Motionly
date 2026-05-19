import { useParams } from 'react-router-dom';

import { RoutePlaceholder } from '@components/routing/RoutePlaceholder';
import type { WorkoutActiveRouteParams } from '@router/routeTypes';

export default function ActiveWorkoutPage(): JSX.Element {
  const { id } = useParams<WorkoutActiveRouteParams>();

  return (
    <RoutePlaceholder
      routeName="Active Workout"
      routePath="/workout/:id/active"
      phaseNote="Active Workout route is wired. Real pose detection, rep counting, and voice coaching arrive across Phases 17–26."
      details={
        <>
          Route param <code>id</code>:{' '}
          <code>{id ?? '(missing — route matched without an id)'}</code>
        </>
      }
    />
  );
}
