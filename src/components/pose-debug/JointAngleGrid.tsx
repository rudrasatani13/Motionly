import { Card, Text } from '@components/primitives';
import type {
  AngleAvailabilityStatus,
  AngleMetricValue,
  AngleSnapshot,
  AngleValue,
} from '@/types/angles';

/**
 * Phase 19 — joint angle grid.
 *
 * Displays every named joint angle from the latest `AngleSnapshot`
 * alongside the geometry-derived metrics. Values come straight from
 * the Phase 19 processor; this card never invents a number, never
 * colors an angle as "good" or "bad", and never displays a coaching
 * cue. Unavailable angles show a typed reason from the snapshot.
 */

type JointAngleGridProps = {
  snapshot: AngleSnapshot | null;
};

const ANGLE_ROWS: ReadonlyArray<{ label: string; key: keyof AngleSnapshot }> = [
  { label: 'Left knee', key: 'leftKnee' },
  { label: 'Right knee', key: 'rightKnee' },
  { label: 'Left hip', key: 'leftHip' },
  { label: 'Right hip', key: 'rightHip' },
  { label: 'Left ankle', key: 'leftAnkle' },
  { label: 'Right ankle', key: 'rightAnkle' },
  { label: 'Left elbow', key: 'leftElbow' },
  { label: 'Right elbow', key: 'rightElbow' },
  { label: 'Left shoulder', key: 'leftShoulder' },
  { label: 'Right shoulder', key: 'rightShoulder' },
  { label: 'Trunk', key: 'trunkAngle' },
];

const METRIC_ROWS: ReadonlyArray<{ label: string; key: keyof AngleSnapshot; unitNote: string }> = [
  { label: 'Left knee valgus', key: 'leftKneeValgusRatio', unitNote: 'ratio' },
  { label: 'Right knee valgus', key: 'rightKneeValgusRatio', unitNote: 'ratio' },
  { label: 'Hip symmetry', key: 'hipSymmetryDelta', unitNote: 'delta' },
];

function statusReason(status: AngleAvailabilityStatus): string {
  switch (status) {
    case 'available':
      return '';
    case 'key-landmarks-missing':
      return 'landmark missing';
    case 'key-landmarks-occluded':
      return 'occluded';
    case 'normalization-unavailable':
      return 'no normalization';
    case 'numeric-instability':
      return 'numeric instability';
    case 'unavailable':
    default:
      return 'unavailable';
  }
}

function formatAngle(angle: AngleValue | undefined): string {
  if (angle === undefined) {
    return '—';
  }
  if (angle.status === 'available' && angle.valueDegrees !== null) {
    return `${angle.valueDegrees.toFixed(1)}°`;
  }
  return `— (${statusReason(angle.status)})`;
}

function formatMetric(metric: AngleMetricValue | undefined): string {
  if (metric === undefined) {
    return '—';
  }
  if (metric.status === 'available' && metric.value !== null) {
    return metric.value.toFixed(3);
  }
  return `— (${statusReason(metric.status)})`;
}

function angleTone(angle: AngleValue | undefined): 'muted' | 'default' {
  if (angle === undefined) {
    return 'muted';
  }
  return angle.status === 'available' ? 'default' : 'muted';
}

function metricTone(metric: AngleMetricValue | undefined): 'muted' | 'default' {
  if (metric === undefined) {
    return 'muted';
  }
  return metric.status === 'available' ? 'default' : 'muted';
}

export function JointAngleGrid({ snapshot }: JointAngleGridProps): JSX.Element {
  return (
    <Card variant="outlined" padding="md" className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <Text variant="label" tone="muted">
          Joint angles (degrees)
        </Text>
        <Text variant="caption" tone="muted">
          {snapshot === null ? 'Waiting for pose' : `frame ${snapshot.frameId}`}
        </Text>
      </div>

      <div className="grid grid-cols-1 gap-x-3 gap-y-1 sm:grid-cols-2">
        {ANGLE_ROWS.map((row) => {
          const angle = snapshot === null ? undefined : (snapshot[row.key] as AngleValue);
          return (
            <div key={row.key} className="flex items-center justify-between gap-2">
              <Text variant="caption" tone="muted">
                {row.label}
              </Text>
              <Text variant="label" tone={angleTone(angle)}>
                {formatAngle(angle)}
              </Text>
            </div>
          );
        })}
      </div>

      <Text variant="label" tone="muted" className="pt-2">
        Metrics (unit-less, normalized)
      </Text>
      <div className="grid grid-cols-1 gap-x-3 gap-y-1 sm:grid-cols-2">
        {METRIC_ROWS.map((row) => {
          const metric = snapshot === null ? undefined : (snapshot[row.key] as AngleMetricValue);
          return (
            <div key={row.key} className="flex items-center justify-between gap-2">
              <Text variant="caption" tone="muted">
                {row.label} ({row.unitNote})
              </Text>
              <Text variant="label" tone={metricTone(metric)}>
                {formatMetric(metric)}
              </Text>
            </div>
          );
        })}
      </div>

      <Text variant="caption" tone="muted">
        Knee valgus and hip symmetry are normalized ratios, not degrees. Phase 19 does not yet
        classify these values as good or bad.
      </Text>
    </Card>
  );
}
