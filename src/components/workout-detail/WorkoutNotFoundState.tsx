import { ArrowLeft, Dumbbell } from 'lucide-react';

import { Button, Icon } from '@components/primitives';
import { EmptyState } from '@components/feedback';

type WorkoutNotFoundStateProps = {
  onBackToLibrary: () => void;
};

export function WorkoutNotFoundState({ onBackToLibrary }: WorkoutNotFoundStateProps): JSX.Element {
  return (
    <section className="mx-auto flex w-full flex-col px-4 pb-8 pt-6 sm:px-6 sm:pt-8">
      <EmptyState
        headingAs="h1"
        title="Workout not found"
        description="That workout is not in the current Motionly catalog. Head back to the library to choose another one."
        illustration={<Icon icon={Dumbbell} size="xl" />}
        action={
          <Button
            variant="primary"
            leftIcon={<Icon icon={ArrowLeft} size="sm" />}
            onClick={onBackToLibrary}
          >
            Back to Workout Library
          </Button>
        }
      />
    </section>
  );
}
