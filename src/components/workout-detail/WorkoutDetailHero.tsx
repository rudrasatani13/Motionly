import { Dumbbell, Sparkles, Wind } from 'lucide-react';

import type { WorkoutDetail } from '@/types/workout-library';
import { Badge, Column, Heading, Icon, Row, Tag, Text } from '@components/primitives';
import {
  ARTWORK_GRADIENT_CLASS,
  LockedContentBadge,
  workoutDifficultyLabel,
} from '@components/workout-library';
import { cn } from '@utils/cn';

type WorkoutDetailHeroProps = {
  workout: WorkoutDetail;
  locked: boolean;
};

function workoutIcon(workout: WorkoutDetail): typeof Dumbbell {
  if (workout.categories.includes('mobility')) {
    return Wind;
  }
  if (workout.categories.includes('quick')) {
    return Sparkles;
  }
  return Dumbbell;
}

export function WorkoutDetailHero({ workout, locked }: WorkoutDetailHeroProps): JSX.Element {
  const tone = workout.artworkTone ?? 'primary';
  const ArtworkIcon = workoutIcon(workout);
  const equipmentLabel = workout.equipment === 'None' ? 'No equipment' : workout.equipment;

  return (
    <section
      aria-labelledby="workout-detail-heading"
      className="overflow-hidden rounded-2xl border border-motionly-neutral-100 bg-motionly-bg-light shadow-sm dark:border-motionly-neutral-800 dark:bg-motionly-neutral-900"
    >
      <div
        aria-hidden="true"
        className={cn(
          'relative flex min-h-44 items-center justify-center overflow-hidden',
          ARTWORK_GRADIENT_CLASS[tone],
        )}
      >
        <div className="absolute inset-x-8 top-8 h-px bg-motionly-bg-light/70 dark:bg-motionly-neutral-700/50" />
        <div className="absolute inset-x-14 bottom-10 h-px bg-motionly-bg-light/60 dark:bg-motionly-neutral-700/40" />
        <div className="grid h-24 w-24 place-items-center rounded-2xl border border-motionly-bg-light/70 bg-motionly-bg-light/85 text-motionly-primary shadow-sm backdrop-blur dark:border-motionly-neutral-700/70 dark:bg-motionly-neutral-950/70">
          <Icon icon={ArtworkIcon} size="xl" />
        </div>
      </div>

      <Column gap="md" className="p-5 sm:p-6">
        <Row align="start" justify="between" gap="md">
          <Column gap="xs" className="min-w-0">
            <Heading id="workout-detail-heading" level={1}>
              {workout.name}
            </Heading>
            <Text tone="muted">{workout.description}</Text>
          </Column>
          <div className="shrink-0">
            {locked ? <LockedContentBadge /> : <Badge variant="accent">Free</Badge>}
          </div>
        </Row>

        <Row align="center" gap="xs" wrap>
          <Tag selected>{workoutDifficultyLabel(workout.difficulty)}</Tag>
          <Tag>{workout.durationMinutes} min</Tag>
          <Tag>
            {workout.exerciseCount} {workout.exerciseCount === 1 ? 'exercise' : 'exercises'}
          </Tag>
          <Tag>{equipmentLabel}</Tag>
        </Row>
      </Column>
    </section>
  );
}
