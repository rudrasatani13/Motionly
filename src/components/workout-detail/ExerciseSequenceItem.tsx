import { ChevronsRight, TimerReset } from 'lucide-react';

import type { ExerciseSummary, WorkoutExerciseSequenceItem } from '@/types/workout-library';
import { Card, Column, Icon, Row, Tag, Text } from '@components/primitives';
import { muscleGroupLabel } from '@components/workout-library';

export type ResolvedExerciseSequenceItem = {
  item: WorkoutExerciseSequenceItem;
  exercise: ExerciseSummary;
};

type ExerciseSequenceItemProps = {
  sequenceItem: ResolvedExerciseSequenceItem;
};

function formatSet(item: WorkoutExerciseSequenceItem): string {
  if (item.set.type === 'timed') {
    return `${item.set.sets} x ${item.set.seconds}s`;
  }
  return `${item.set.sets} x ${item.set.reps}`;
}

export function ExerciseSequenceItem({ sequenceItem }: ExerciseSequenceItemProps): JSX.Element {
  const { item, exercise } = sequenceItem;
  const muscles = item.targetMuscles ?? exercise.targetMuscles;
  const firstCoachCue = exercise.whatMotionlyWillCoach[0];

  return (
    <Card
      as="li"
      variant="outlined"
      padding="md"
      className="list-none"
      aria-label={`${item.order}. ${exercise.name}. ${formatSet(item)}. Rest ${item.restSeconds} seconds.`}
    >
      <Row align="start" gap="md">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-motionly-primary/10 text-label font-semibold text-motionly-primary">
          {item.order}
        </div>

        <Column gap="sm" className="min-w-0 flex-1">
          <Row align="start" justify="between" gap="sm">
            <Column gap="xs" className="min-w-0">
              <Text variant="label" className="font-semibold">
                {exercise.name}
              </Text>
              <Row gap="xs" wrap>
                <Tag selected>{formatSet(item)}</Tag>
                <Tag>
                  <Icon icon={TimerReset} size="sm" />
                  Rest {item.restSeconds}s
                </Tag>
              </Row>
            </Column>
            <div
              aria-hidden="true"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-motionly-accent/10 text-motionly-accent"
            >
              <Icon icon={ChevronsRight} size="sm" />
            </div>
          </Row>

          <Row gap="xs" wrap aria-label={`Target muscles for ${exercise.name}`}>
            {muscles.map((muscle) => (
              <Tag key={muscle}>{muscleGroupLabel(muscle)}</Tag>
            ))}
          </Row>

          {item.note ? (
            <Text tone="muted" variant="caption">
              {item.note}
            </Text>
          ) : null}

          {firstCoachCue ? (
            <Text tone="subtle" variant="caption">
              Motionly will coach later: {firstCoachCue}
            </Text>
          ) : null}
        </Column>
      </Row>
    </Card>
  );
}
