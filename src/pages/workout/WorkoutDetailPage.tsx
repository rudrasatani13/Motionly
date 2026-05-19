import { useParams } from 'react-router-dom';

import { RoutePlaceholder } from '@components/routing/RoutePlaceholder';
import type { WorkoutDetailRouteParams } from '@router/routeTypes';

export default function WorkoutDetailPage(): JSX.Element {
  const { id } = useParams<WorkoutDetailRouteParams>();

  return (
    <RoutePlaceholder
      routeName="Workout Detail"
      routePath="/workouts/:id"
      phaseNote="Workout Detail route is wired. Real exercise breakdown, equipment, and difficulty UI is implemented in Phase 15."
      details={
        <>
          Route param <code>id</code>:{' '}
          <code>{id ?? '(missing — route matched without an id)'}</code>
        </>
      }
    />
  );
}
