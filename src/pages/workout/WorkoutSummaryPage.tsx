import { useParams } from 'react-router-dom';

import { RoutePlaceholder } from '@components/routing/RoutePlaceholder';
import type { WorkoutSummaryRouteParams } from '@router/routeTypes';

export default function WorkoutSummaryPage(): JSX.Element {
  const { id } = useParams<WorkoutSummaryRouteParams>();

  return (
    <RoutePlaceholder
      routeName="Workout Summary"
      routePath="/workout/:id/summary"
      phaseNote="Workout Summary route is wired. Real post-workout metrics, form review, and history saving land in Phase 27."
      details={
        <>
          Route param <code>id</code>:{' '}
          <code>{id ?? '(missing — route matched without an id)'}</code>
        </>
      }
    />
  );
}
