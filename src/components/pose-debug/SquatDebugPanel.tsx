import { Button, Card, Chip, Column, Row, Text } from '@components/primitives';
import type { UseSquatRepDetectorControls } from '@hooks/useSquatRepDetector';
import type { SquatDepthStatus, SquatRepResult, SquatState } from '@/types/squat';
import type { ExerciseRepRejectionReason } from '@/types/exercise';

/**
 * Phase 20 — Squat rep debug surface.
 *
 * Renders the squat state machine's live output on top of the existing
 * pose / angle debug surfaces. Phase 20 is **debug-only**; this panel
 * deliberately:
 *
 * - never shows a form score (Phase 21+),
 * - never shows a coaching cue (Phase 21+),
 * - never claims the workout is complete (Phase 27+),
 * - never persists rep state.
 *
 * Every value comes from the live `useSquatRepDetector` controls; the
 * panel never invents reps, dwell counts, or angles.
 */

type SquatDebugPanelProps = {
  controls: UseSquatRepDetectorControls;
};

const STATE_LABEL: Record<SquatState, string> = {
  STANDING: 'Standing',
  DESCENDING: 'Descending',
  BOTTOM: 'Bottom',
  ASCENDING: 'Ascending',
  COMPLETE: 'Complete',
};

const DEPTH_LABEL: Record<SquatDepthStatus, string> = {
  unknown: 'Waiting for knees',
  above_depth: 'Above depth threshold',
  reached_beginner_depth: 'Reached beginner depth (< 110°)',
  reached_intermediate_depth: 'Reached intermediate depth (< 90°)',
};

const REJECTION_LABEL: Record<ExerciseRepRejectionReason, string> = {
  half_rep_depth_not_reached: 'Half rep — bottom threshold not reached',
  bottom_dwell_too_short: 'Bottom dwell shorter than 15 frames',
  angles_unavailable: 'Knee angles unavailable mid-rep',
  visibility_lost: 'Visibility lost mid-rep',
  duration_too_short: 'Rep duration too short',
  duration_too_long: 'Rep duration too long',
  not_initialized_from_standing: 'Engine not yet initialized from standing',
};

function formatDegrees(value: number | null): string {
  if (value === null || !Number.isFinite(value)) {
    return '—';
  }
  return `${value.toFixed(1)}°`;
}

function formatRatio(value: number | null): string {
  if (value === null || !Number.isFinite(value)) {
    return '—';
  }
  return value.toFixed(3);
}

function formatMs(value: number | null): string {
  if (value === null || !Number.isFinite(value)) {
    return '—';
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)} s`;
  }
  return `${Math.round(value)} ms`;
}

function repHeading(rep: SquatRepResult): string {
  return `Rep ${rep.repNumber} · ${formatMs(rep.durationMs)}`;
}

function RepDetailCard({
  rep,
  kind,
}: {
  rep: SquatRepResult;
  kind: 'counted' | 'rejected';
}): JSX.Element {
  return (
    <Card variant="default" padding="md" className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <Text variant="label" tone={kind === 'counted' ? 'primary' : 'warning'}>
          {kind === 'counted' ? 'Counted rep' : 'Rejected rep'}
        </Text>
        <Text variant="caption" tone="muted">
          {repHeading(rep)}
        </Text>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        <Text variant="caption" tone="muted">
          Bottom knee angle
        </Text>
        <Text variant="label">{formatDegrees(rep.bottomKneeAngleDegrees)}</Text>

        <Text variant="caption" tone="muted">
          Min L / R knee
        </Text>
        <Text variant="label">
          {formatDegrees(rep.minLeftKneeAngleDegrees)} /{' '}
          {formatDegrees(rep.minRightKneeAngleDegrees)}
        </Text>

        <Text variant="caption" tone="muted">
          Bottom dwell frames
        </Text>
        <Text variant="label">{rep.bottomFrameCount}</Text>

        <Text variant="caption" tone="muted">
          Avg trunk angle
        </Text>
        <Text variant="label">{formatDegrees(rep.averageTrunkAngleDegrees)}</Text>

        <Text variant="caption" tone="muted">
          Max L / R knee valgus ratio
        </Text>
        <Text variant="label">
          {formatRatio(rep.maxLeftKneeValgusRatio)} / {formatRatio(rep.maxRightKneeValgusRatio)}
        </Text>

        <Text variant="caption" tone="muted">
          Difficulty
        </Text>
        <Text variant="label">{rep.difficulty}</Text>
      </div>
      {kind === 'rejected' && rep.rejectionReason !== undefined ? (
        <Text variant="caption" tone="warning">
          {REJECTION_LABEL[rep.rejectionReason]}
        </Text>
      ) : null}
      <Text variant="caption" tone="muted">
        Form score: deferred to Phase 21.
      </Text>
    </Card>
  );
}

export function SquatDebugPanel({ controls }: SquatDebugPanelProps): JSX.Element {
  const {
    enabled,
    state,
    status,
    difficulty,
    repCount,
    latestCountedRep,
    latestRejectedRep,
    debug,
    reset,
    setDifficulty,
  } = controls;

  if (!enabled) {
    return (
      <Card variant="outlined" padding="lg" className="flex flex-col gap-2">
        <Text variant="h3" as="h2">
          Squat rep debug
        </Text>
        <Text variant="caption" tone="muted">
          Squat detector is available for workouts that include the bodyweight squat. Open a workout
          containing squats to enable it.
        </Text>
      </Card>
    );
  }

  return (
    <Card variant="outlined" padding="lg" className="flex flex-col gap-4">
      <Column gap="xs">
        <Text variant="h3" as="h2">
          Squat rep debug
        </Text>
        <Text variant="caption" tone="muted">
          Phase 20 detects bodyweight squat reps using the Phase 19 angle snapshot. Counts only full
          reps with at least a {`15`}-frame bottom dwell. Form scoring, coaching cues, and voice
          feedback are deferred to Phase 21+.
        </Text>
      </Column>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card variant="default" padding="md" className="flex flex-col gap-1">
          <Text variant="label" tone="muted">
            State
          </Text>
          <Text variant="h2" as="p">
            {STATE_LABEL[state]}
          </Text>
          <Text variant="caption" tone="muted">
            Engine status: {status}
          </Text>
        </Card>

        <Card variant="default" padding="md" className="flex flex-col gap-1">
          <Text variant="label" tone="muted">
            Rep count (debug)
          </Text>
          <Text variant="h2" as="p">
            {repCount}
          </Text>
          <Text variant="caption" tone="muted">
            Phase 20 rep count is live-only — never saved, never persisted, never sent anywhere.
          </Text>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        <Text variant="caption" tone="muted">
          Average knee angle
        </Text>
        <Text variant="label">{formatDegrees(debug.averageKneeAngleDegrees)}</Text>

        <Text variant="caption" tone="muted">
          Left / right knee
        </Text>
        <Text variant="label">
          {formatDegrees(debug.leftKneeAngleDegrees)} / {formatDegrees(debug.rightKneeAngleDegrees)}
        </Text>

        <Text variant="caption" tone="muted">
          Trunk angle
        </Text>
        <Text variant="label">{formatDegrees(debug.trunkAngleDegrees)}</Text>

        <Text variant="caption" tone="muted">
          Knee valgus L / R (ratio)
        </Text>
        <Text variant="label">
          {formatRatio(debug.leftKneeValgusRatio)} / {formatRatio(debug.rightKneeValgusRatio)}
        </Text>

        <Text variant="caption" tone="muted">
          Depth status
        </Text>
        <Text variant="label">{DEPTH_LABEL[debug.depthStatus]}</Text>

        <Text variant="caption" tone="muted">
          Bottom dwell frames
        </Text>
        <Text variant="label">{debug.bottomDwellFrames} / 15</Text>
      </div>

      <Column gap="xs">
        <Text variant="label" tone="muted">
          Difficulty
        </Text>
        <Row gap="sm" wrap>
          <Chip selected={difficulty === 'beginner'} onClick={() => setDifficulty('beginner')}>
            Beginner (&lt; 110°)
          </Chip>
          <Chip
            selected={difficulty === 'intermediate'}
            onClick={() => setDifficulty('intermediate')}
          >
            Intermediate (&lt; 90°)
          </Chip>
        </Row>
      </Column>

      <div className="grid gap-3 lg:grid-cols-2">
        {latestCountedRep === null ? (
          <Card variant="default" padding="md">
            <Text variant="label" tone="muted">
              Last counted rep
            </Text>
            <Text variant="caption" tone="muted">
              No rep counted yet. Stand tall first, then perform a full squat.
            </Text>
          </Card>
        ) : (
          <RepDetailCard rep={latestCountedRep} kind="counted" />
        )}
        {latestRejectedRep === null ? (
          <Card variant="default" padding="md">
            <Text variant="label" tone="muted">
              Last rejected rep
            </Text>
            <Text variant="caption" tone="muted">
              No rejections recorded yet.
            </Text>
          </Card>
        ) : (
          <RepDetailCard rep={latestRejectedRep} kind="rejected" />
        )}
      </div>

      <Row gap="sm" wrap>
        <Button variant="ghost" size="sm" onClick={reset}>
          Reset squat detector
        </Button>
      </Row>
    </Card>
  );
}
