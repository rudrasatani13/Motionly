import { ChevronRight, Dumbbell } from 'lucide-react';
import { useId } from 'react';

import type { ExerciseSummary } from '@/types/workout-library';
import { Badge, Button, Card, Column, Heading, Icon, Row, Tag, Text } from '@components/primitives';
import { cn } from '@utils/cn';

import { ARTWORK_GRADIENT_CLASS } from './artwork';
import { LockedContentBadge } from './LockedContentBadge';
import { exerciseDifficultyLabel, muscleGroupLabel } from './labels';

type ExerciseCardProps = {
  /** Exercise to render. */
  exercise: ExerciseSummary;
  /** Handler invoked when the user opens the quick-detail panel. */
  onOpenDetail: (exercise: ExerciseSummary) => void;
  /** Handler invoked when a locked exercise is opened. */
  onOpenLocked: (exercise: ExerciseSummary) => void;
};

/**
 * Phase 14 — Card for a single exercise on the Exercises tab.
 *
 * Renders a small abstract artwork tile, name, difficulty, target
 * muscles, equipment, a short description, and a single CTA that
 * opens the in-page quick-detail panel. Locked (Pro) exercises stay
 * visible and route to the locked handler instead of the panel.
 */
export function ExerciseCard({
  exercise,
  onOpenDetail,
  onOpenLocked,
}: ExerciseCardProps): JSX.Element {
  const reactId = useId();
  const isLocked = exercise.accessTier === 'pro';
  const tone = exercise.artworkTone ?? 'accent';

  const headingId = `${reactId}-name`;
  const descriptionId = `${reactId}-description`;
  const actionLabel = isLocked ? 'View Pro details' : 'View exercise';

  const handleClick = (): void => {
    if (isLocked) {
      onOpenLocked(exercise);
      return;
    }
    onOpenDetail(exercise);
  };

  return (
    <Card
      as="article"
      variant="outlined"
      padding="none"
      aria-labelledby={headingId}
      aria-describedby={descriptionId}
      className="overflow-hidden"
    >
      <Column gap="none">
        <div
          aria-hidden="true"
          className={cn(
            'flex h-20 w-full items-center justify-center',
            ARTWORK_GRADIENT_CLASS[tone],
          )}
        >
          <span className="rounded-xl bg-motionly-bg-light/80 p-2 text-motionly-accent shadow-sm backdrop-blur dark:bg-motionly-neutral-900/70">
            <Icon icon={Dumbbell} size="md" />
          </span>
        </div>

        <Column gap="sm" className="p-4">
          <Row align="start" justify="between" gap="sm">
            <Column gap="xs" className="min-w-0">
              <Heading id={headingId} level={3}>
                {exercise.name}
              </Heading>
              <Text variant="caption" tone="muted">
                {exerciseDifficultyLabel(exercise.difficulty)}
              </Text>
            </Column>
            {isLocked ? <LockedContentBadge /> : <Badge variant="accent">Free</Badge>}
          </Row>

          <Text id={descriptionId} variant="caption" tone="muted">
            {exercise.description}
          </Text>

          <Row align="center" gap="xs" wrap>
            {exercise.targetMuscles.map((muscle) => (
              <Tag key={muscle}>{muscleGroupLabel(muscle)}</Tag>
            ))}
          </Row>

          <Text variant="caption" tone="subtle">
            Equipment: {exercise.equipment}
          </Text>

          <Button
            variant="ghost"
            size="sm"
            rightIcon={<Icon icon={ChevronRight} size="sm" />}
            onClick={handleClick}
            aria-label={`${actionLabel}: ${exercise.name}`}
          >
            {actionLabel}
          </Button>
        </Column>
      </Column>
    </Card>
  );
}
