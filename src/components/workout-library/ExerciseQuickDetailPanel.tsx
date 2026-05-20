import { X } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';

import type { ExerciseSummary } from '@/types/workout-library';
import { Badge, Button, Card, Column, Heading, Icon, Row, Tag, Text } from '@components/primitives';
import { cn } from '@utils/cn';

import { LockedContentBadge } from './LockedContentBadge';
import { exerciseDifficultyLabel, muscleGroupLabel } from './labels';

type ExerciseQuickDetailPanelProps = {
  /** The exercise to render, or `null` when the panel is closed. */
  exercise: ExerciseSummary | null;
  /** Close handler. */
  onClose: () => void;
};

/**
 * Phase 14 — In-page quick-detail panel for an exercise.
 *
 * Renders as a sticky drawer-style card at the bottom of the page so
 * Phase 14 can satisfy the "Exercise Detail View" deliverable
 * without adding a new route (the Phase 15 `/workouts/:id` route is
 * still a placeholder).
 *
 * Honest scope: "Add to workout" is disabled with a note that custom
 * workouts come later. No "Try it now" — that would imply Phase
 * 15/16 work is live.
 */
export function ExerciseQuickDetailPanel({
  exercise,
  onClose,
}: ExerciseQuickDetailPanelProps): JSX.Element | null {
  const reactId = useId();
  const headingId = `${reactId}-heading`;
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (exercise === null) {
      return undefined;
    }
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [exercise, onClose]);

  if (exercise === null) {
    return null;
  }

  const isLocked = exercise.accessTier === 'pro';

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby={headingId}
      className={cn(
        'pointer-events-none fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-2xl px-3 pb-32 sm:px-4',
      )}
    >
      <Card
        as="section"
        variant="elevated"
        padding="lg"
        className="pointer-events-auto max-h-[70vh] overflow-y-auto border border-motionly-neutral-200 dark:border-motionly-neutral-800"
      >
        <Column gap="md">
          <Row align="start" justify="between" gap="sm">
            <Column gap="xs" className="min-w-0">
              <Row align="center" gap="xs" wrap>
                <Badge variant="primary">Exercise</Badge>
                {isLocked ? <LockedContentBadge /> : null}
              </Row>
              <Heading id={headingId} level={2} className="text-h3">
                {exercise.name}
              </Heading>
              <Text variant="caption" tone="muted">
                {exerciseDifficultyLabel(exercise.difficulty)} ·{' '}
                {exercise.equipment === 'None' ? 'No equipment' : exercise.equipment}
              </Text>
            </Column>
            <Button
              ref={closeButtonRef}
              variant="icon"
              size="sm"
              aria-label="Close exercise details"
              onClick={onClose}
            >
              <Icon icon={X} size="md" />
            </Button>
          </Row>

          <Column gap="xs">
            <Text variant="label" as="span">
              Target muscles
            </Text>
            <Row align="center" gap="xs" wrap>
              {exercise.targetMuscles.map((muscle) => (
                <Tag key={muscle}>{muscleGroupLabel(muscle)}</Tag>
              ))}
            </Row>
          </Column>

          {exercise.instructions && exercise.instructions.length > 0 ? (
            <Column gap="xs">
              <Text variant="label" as="span">
                How to do it
              </Text>
              <ol className="ml-5 list-decimal space-y-1 text-body text-motionly-neutral-800 dark:text-motionly-neutral-100">
                {exercise.instructions.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </Column>
          ) : null}

          <Column gap="xs">
            <Text variant="label" as="span">
              What Motionly will coach later
            </Text>
            <Text variant="caption" tone="muted">
              These cues describe what pose detection and form scoring will check for once those
              systems land. Phase 14 does not run live coaching.
            </Text>
            <ul className="ml-5 list-disc space-y-1 text-body text-motionly-neutral-800 dark:text-motionly-neutral-100">
              {exercise.whatMotionlyWillCoach.map((cue, index) => (
                <li key={index}>{cue}</li>
              ))}
            </ul>
          </Column>

          <Column gap="xs">
            <Text variant="label" as="span">
              Camera placement
            </Text>
            <Text tone="muted">{exercise.cameraPlacementSummary}</Text>
          </Column>

          {exercise.estimatedSeconds !== undefined || exercise.estimatedRepsRange ? (
            <Column gap="xs">
              <Text variant="label" as="span">
                Suggested set
              </Text>
              <Text tone="muted">
                {exercise.estimatedSeconds !== undefined
                  ? `Hold for about ${exercise.estimatedSeconds} seconds.`
                  : `Aim for ${exercise.estimatedRepsRange ?? ''} reps.`}
              </Text>
            </Column>
          ) : null}

          <Row align="center" gap="sm" wrap>
            <Button variant="secondary" disabled aria-disabled="true">
              Add to workout
            </Button>
            <Text variant="caption" tone="subtle">
              Custom workout builder arrives in a later phase.
            </Text>
          </Row>
        </Column>
      </Card>
    </div>
  );
}
