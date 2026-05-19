import { useParams } from 'react-router-dom';

import { RoutePlaceholder } from '@components/routing/RoutePlaceholder';
import type { WorkoutSetupRouteParams } from '@router/routeTypes';

export default function CameraSetupPage(): JSX.Element {
  const { id } = useParams<WorkoutSetupRouteParams>();

  return (
    <RoutePlaceholder
      routeName="Camera Setup"
      routePath="/workout/:id/setup"
      phaseNote="Camera Setup route is wired. Real camera permission, framing guide, and silhouette flow is implemented in Phase 16."
      details={
        <>
          Route param <code>id</code>:{' '}
          <code>{id ?? '(missing — route matched without an id)'}</code>
        </>
      }
    />
  );
}
