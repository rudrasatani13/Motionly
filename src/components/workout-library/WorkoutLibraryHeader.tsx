import { Badge, Column, Heading, Row, Text } from '@components/primitives';

/**
 * Phase 14 — Header for the Workout Library page.
 *
 * Renders the `h1`, a short honest description of what the catalog
 * is for, and a small "Catalog" badge so the page reads as a
 * browsing surface rather than something that will start a workout
 * for the user.
 *
 * Copy is intentionally conservative — Phase 14 does not implement
 * live coaching or pose detection, and the supporting line says so.
 */
export function WorkoutLibraryHeader(): JSX.Element {
  return (
    <header className="flex flex-col gap-3">
      <Row align="center" gap="sm">
        <Badge variant="primary">Catalog</Badge>
        <Text variant="caption" tone="muted">
          Phase 14
        </Text>
      </Row>
      <Column gap="xs">
        <Heading id="workout-library-heading" level={1}>
          Workout Library
        </Heading>
        <Text tone="muted">
          Browse home-friendly workouts and exercises. Real coaching starts once workout setup and
          pose analysis land in later phases.
        </Text>
      </Column>
    </header>
  );
}
