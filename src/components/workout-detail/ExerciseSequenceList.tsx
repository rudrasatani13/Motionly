import { Column, Heading, Text } from '@components/primitives';

import { ExerciseSequenceItem, type ResolvedExerciseSequenceItem } from './ExerciseSequenceItem';

type ExerciseSequenceListProps = {
  items: ReadonlyArray<ResolvedExerciseSequenceItem>;
};

export function ExerciseSequenceList({ items }: ExerciseSequenceListProps): JSX.Element {
  return (
    <section aria-labelledby="workout-sequence-heading">
      <Column gap="sm">
        <Heading id="workout-sequence-heading" level={2} className="text-h3">
          In this session
        </Heading>
        <Text tone="muted">Preview the order, target, and rest before you start.</Text>
        <ol className="flex flex-col gap-3">
          {items.map((sequenceItem) => (
            <ExerciseSequenceItem key={sequenceItem.item.exerciseId} sequenceItem={sequenceItem} />
          ))}
        </ol>
      </Column>
    </section>
  );
}
