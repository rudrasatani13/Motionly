import { Clock3, Dumbbell, ListOrdered, SignalMedium } from 'lucide-react';

import type { WorkoutDetail } from '@/types/workout-library';
import { Icon } from '@components/primitives';
import { workoutDifficultyLabel } from '@components/workout-library';

type WorkoutMetaRowProps = {
  workout: WorkoutDetail;
};

export function WorkoutMetaRow({ workout }: WorkoutMetaRowProps): JSX.Element {
  const equipmentLabel = workout.equipment === 'None' ? 'No equipment' : workout.equipment;
  const items = [
    {
      label: 'Duration',
      value: `${workout.durationMinutes} min`,
      icon: Clock3,
    },
    {
      label: 'Sequence',
      value: `${workout.exerciseCount} exercises`,
      icon: ListOrdered,
    },
    {
      label: 'Difficulty',
      value: workoutDifficultyLabel(workout.difficulty),
      icon: SignalMedium,
    },
    {
      label: 'Equipment',
      value: equipmentLabel,
      icon: Dumbbell,
    },
  ];

  return (
    <dl aria-label="Workout details" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="min-h-24 rounded-2xl border border-motionly-neutral-200 bg-motionly-neutral-50 p-3 dark:border-motionly-neutral-800 dark:bg-motionly-neutral-900"
        >
          <div className="mb-2 text-motionly-primary">
            <Icon icon={item.icon} size="sm" />
          </div>
          <dt className="text-caption text-motionly-neutral-500 dark:text-motionly-neutral-400">
            {item.label}
          </dt>
          <dd className="mt-1 text-label font-semibold text-motionly-neutral-900 dark:text-motionly-neutral-50">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
