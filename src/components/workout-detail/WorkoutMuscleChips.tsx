import type { MuscleGroup } from '@/types/workout-library';
import { Column, Heading, Row, Tag, Text } from '@components/primitives';
import { muscleGroupLabel } from '@components/workout-library';

type WorkoutMuscleChipsProps = {
  primaryMuscles: ReadonlyArray<MuscleGroup>;
  secondaryMuscles?: ReadonlyArray<MuscleGroup>;
};

export function WorkoutMuscleChips({
  primaryMuscles,
  secondaryMuscles = [],
}: WorkoutMuscleChipsProps): JSX.Element {
  return (
    <section aria-labelledby="workout-muscles-heading">
      <Column gap="sm">
        <Heading id="workout-muscles-heading" level={2} className="text-h3">
          {"What you'll work"}
        </Heading>
        <Text tone="muted">Primary muscles are highlighted; supporting areas follow.</Text>
        <Row gap="xs" wrap aria-label="Muscles worked">
          {primaryMuscles.map((muscle) => (
            <Tag key={muscle} selected>
              {muscleGroupLabel(muscle)}
            </Tag>
          ))}
          {secondaryMuscles.map((muscle) => (
            <Tag key={muscle}>{muscleGroupLabel(muscle)}</Tag>
          ))}
        </Row>
      </Column>
    </section>
  );
}
