import { ArrowRight, Dumbbell, Sparkles, Wind } from 'lucide-react';
import { useId } from 'react';

import type { WorkoutSummary } from '@/types/workout-library';
import { Badge, Button, Card, Column, Heading, Icon, Row, Tag, Text } from '@components/primitives';
import { cn } from '@utils/cn';

import { ARTWORK_GRADIENT_CLASS } from './artwork';
import { LockedContentBadge } from './LockedContentBadge';
import { categoryLabel, workoutDifficultyLabel } from './labels';

type WorkoutCardProps = {
  /** Workout to render. */
  workout: WorkoutSummary;
  /** Called when the primary CTA is pressed. */
  onAction: (workout: WorkoutSummary) => void;
};

/**
 * Pick a thematic icon for the artwork tile from the workout's
 * primary category. Token-only — no photos.
 */
function workoutIcon(workout: WorkoutSummary): typeof Dumbbell {
  if (workout.categories.includes('mobility')) {
    return Wind;
  }
  if (workout.categories.includes('quick')) {
    return Sparkles;
  }
  return Dumbbell;
}

/**
 * Phase 14 — Card for a single workout on the Workouts tab.
 *
 * Tappable surface that surfaces the workout name, short meta line
 * (duration · exercise count · difficulty), a one-line coaching
 * focus, category tags, and the access tier. Locked workouts stay
 * visible (per the wireframe) with a lock badge; the parent decides
 * what `onAction` does for free vs. pro tiers.
 */
export function WorkoutCard({ workout, onAction }: WorkoutCardProps): JSX.Element {
  const reactId = useId();
  const isLocked = workout.accessTier === 'pro';
  const tone = workout.artworkTone ?? 'primary';
  const ArtworkIcon = workoutIcon(workout);

  const headingId = `${reactId}-name`;
  const focusId = `${reactId}-focus`;
  const actionLabel = isLocked ? 'View Pro details' : 'View details';
  const ariaSummary = [
    workout.name,
    `${workout.durationMinutes} minutes`,
    `${workout.exerciseCount} exercises`,
    workoutDifficultyLabel(workout.difficulty),
    isLocked ? 'Locked. Pro tier.' : null,
  ]
    .filter((part): part is string => Boolean(part))
    .join('. ');

  return (
    <Card
      as="article"
      variant="elevated"
      padding="none"
      aria-labelledby={headingId}
      aria-describedby={focusId}
      className="overflow-hidden border border-motionly-neutral-100 dark:border-motionly-neutral-800"
    >
      <Column gap="none">
        <div
          aria-hidden="true"
          className={cn(
            'flex h-28 w-full items-center justify-center',
            ARTWORK_GRADIENT_CLASS[tone],
          )}
        >
          <span className="rounded-2xl bg-motionly-bg-light/80 p-3 text-motionly-primary shadow-sm backdrop-blur dark:bg-motionly-neutral-900/70">
            <Icon icon={ArtworkIcon} size="lg" />
          </span>
        </div>

        <Column gap="md" className="p-4 sm:p-5">
          <Row align="start" justify="between" gap="sm">
            <Column gap="xs" className="min-w-0">
              <Heading id={headingId} level={2} className="text-h3">
                {workout.name}
              </Heading>
              <Text tone="muted">
                {[
                  `${workout.durationMinutes} min`,
                  `${workout.exerciseCount} exercises`,
                  workoutDifficultyLabel(workout.difficulty),
                ].join(' · ')}
              </Text>
            </Column>
            {isLocked ? <LockedContentBadge /> : <Badge variant="accent">Free</Badge>}
          </Row>

          <Text id={focusId} tone="muted" variant="caption">
            {workout.coachingFocus}
          </Text>

          <Text>{workout.description}</Text>

          <Row align="center" gap="xs" wrap>
            {workout.categories.map((category) => (
              <Tag key={category}>{categoryLabel(category)}</Tag>
            ))}
            <Tag>{workout.equipment === 'None' ? 'No equipment' : workout.equipment}</Tag>
          </Row>

          <Button
            variant={isLocked ? 'secondary' : 'primary'}
            size="md"
            fullWidth
            rightIcon={<Icon icon={ArrowRight} size="sm" />}
            onClick={() => onAction(workout)}
            aria-label={`${actionLabel}: ${ariaSummary}`}
          >
            {actionLabel}
          </Button>
        </Column>
      </Column>
    </Card>
  );
}
