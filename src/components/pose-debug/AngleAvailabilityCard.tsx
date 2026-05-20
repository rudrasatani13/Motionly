import { Card, Text } from '@components/primitives';
import type { AngleAvailabilityReport, AngleSnapshot } from '@/types/angles';

/**
 * Phase 19 — angle availability summary.
 *
 * Surfaces the structured availability report from the latest
 * `AngleSnapshot`: how many angles / metrics came back as available,
 * which ones did not, and whether normalization was available for the
 * frame. Honest labelling — unavailable angles list their names rather
 * than showing a fake value.
 */

type AngleAvailabilityCardProps = {
  snapshot: AngleSnapshot | null;
};

const EMPTY_REPORT: AngleAvailabilityReport = {
  availableAngleCount: 0,
  unavailableAngleCount: 0,
  availableMetricCount: 0,
  unavailableMetricCount: 0,
  unavailableAngles: [],
  unavailableMetrics: [],
  normalizationAvailable: false,
};

function formatName(value: string): string {
  return value
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}

export function AngleAvailabilityCard({ snapshot }: AngleAvailabilityCardProps): JSX.Element {
  const report = snapshot?.availability ?? EMPTY_REPORT;
  const totalAngles = report.availableAngleCount + report.unavailableAngleCount;
  const totalMetrics = report.availableMetricCount + report.unavailableMetricCount;

  return (
    <Card variant="outlined" padding="md" className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <Text variant="label" tone="muted">
          Angle availability
        </Text>
        <Text
          variant="label"
          tone={snapshot === null ? 'muted' : report.normalizationAvailable ? 'primary' : 'warning'}
        >
          {snapshot === null
            ? 'Waiting for pose'
            : report.normalizationAvailable
              ? 'Normalization OK'
              : 'Normalization unavailable'}
        </Text>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        <Text variant="caption" tone="muted">
          Angles available
        </Text>
        <Text variant="label">
          {snapshot === null ? '—' : `${report.availableAngleCount} / ${totalAngles}`}
        </Text>

        <Text variant="caption" tone="muted">
          Metrics available
        </Text>
        <Text variant="label">
          {snapshot === null ? '—' : `${report.availableMetricCount} / ${totalMetrics}`}
        </Text>
      </div>

      {snapshot !== null && report.unavailableAngles.length > 0 ? (
        <div className="flex flex-col gap-1 pt-1">
          <Text variant="caption" tone="warning">
            Unavailable angles
          </Text>
          <Text variant="caption" tone="muted">
            {report.unavailableAngles.map(formatName).join(', ')}
          </Text>
        </div>
      ) : null}

      {snapshot !== null && report.unavailableMetrics.length > 0 ? (
        <div className="flex flex-col gap-1 pt-1">
          <Text variant="caption" tone="warning">
            Unavailable metrics
          </Text>
          <Text variant="caption" tone="muted">
            {report.unavailableMetrics.map(formatName).join(', ')}
          </Text>
        </div>
      ) : null}
    </Card>
  );
}
