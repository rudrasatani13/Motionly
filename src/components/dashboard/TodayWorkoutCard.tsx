import { ArrowRight, Dumbbell } from 'lucide-react';

import type { DashboardWorkoutSummaryState } from '@/types/dashboard';
import { Badge, Button, Card, Column, Heading, Icon, Row, Text } from '@components/primitives';

type TodayWorkoutCardProps = {
  state: DashboardWorkoutSummaryState;
  onExploreWorkouts: () => void;
};

export function TodayWorkoutCard({ state, onExploreWorkouts }: TodayWorkoutCardProps): JSX.Element {
  const badgeLabel =
    state.status === 'available'
      ? 'Workout ready'
      : state.status === 'empty'
        ? 'No workout selected'
        : 'Coming in Phase 14';

  return (
    <Card
      as="section"
      variant="elevated"
      padding="lg"
      aria-labelledby="today-workout-heading"
      className="overflow-hidden border border-motionly-neutral-100 bg-gradient-to-br from-motionly-primary/10 via-motionly-bg-light to-motionly-bg-light dark:border-motionly-neutral-800 dark:via-motionly-neutral-900 dark:to-motionly-neutral-900"
    >
      <Column gap="lg">
        <Row align="start" justify="between" gap="md">
          <Column gap="sm">
            <Badge variant="primary">{badgeLabel}</Badge>
            <Heading id="today-workout-heading" level={2}>
              Today&apos;s workout
            </Heading>
          </Column>
          <span className="rounded-2xl bg-motionly-bg-light p-3 text-motionly-primary shadow-sm dark:bg-motionly-neutral-800">
            <Icon icon={Dumbbell} size="lg" />
          </span>
        </Row>

        {state.status === 'available' ? (
          <Column gap="sm">
            <Heading level={3}>{state.name}</Heading>
            <Text tone="muted">
              {[
                state.durationMinutes !== null ? `${state.durationMinutes} min` : null,
                state.exerciseCount !== null ? `${state.exerciseCount} exercises` : null,
                state.difficulty,
              ]
                .filter((part): part is string => part !== null)
                .join(' · ')}
            </Text>
          </Column>
        ) : (
          <Column gap="sm">
            <Text tone="muted">
              Workout recommendations arrive with the workout library in Phase 14.
            </Text>
            <Text variant="caption" tone="subtle">
              No workout has been selected yet.
            </Text>
          </Column>
        )}

        <Button
          variant="primary"
          size="lg"
          fullWidth
          rightIcon={<Icon icon={ArrowRight} size="sm" />}
          onClick={onExploreWorkouts}
        >
          Explore workouts
        </Button>
      </Column>
    </Card>
  );
}
