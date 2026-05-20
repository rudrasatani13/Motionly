import { Card, Text } from '@components/primitives';
import type { PoseVisibilityReport } from '@/types/pose';

/**
 * Phase 18 — body visibility card for the pose-debug surface.
 *
 * Shows the mean key-landmark visibility, the per-key-landmark detail
 * computed by `ConfidenceFilter.buildVisibilityReport`, and the list of
 * key landmarks that did not clear the configured threshold this
 * frame. All values come from real MediaPipe confidences — the card
 * never invents a "confidence score" or claims the body is fully
 * visible when only the mean is high.
 */

type PoseVisibilityCardProps = {
  report: PoseVisibilityReport;
  visibilityThreshold: number;
};

function formatScore(score: number): string {
  if (!Number.isFinite(score)) {
    return '—';
  }
  return `${(score * 100).toFixed(0)}%`;
}

function formatLandmarkName(name: string): string {
  return name.toLowerCase().replace(/_/g, ' ');
}

export function PoseVisibilityCard({
  report,
  visibilityThreshold,
}: PoseVisibilityCardProps): JSX.Element {
  const evaluated = report.evaluatedLandmarkCount;
  const hasReport = evaluated > 0;
  const allKeyLandmarksPass = report.occludedKeyLandmarks.length === 0;
  const bodyTone = !hasReport ? 'muted' : report.isBodyFullyVisible ? 'primary' : 'warning';

  return (
    <Card variant="outlined" padding="md" className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <Text variant="label" tone="muted">
          Body visibility
        </Text>
        <Text variant="label" tone={bodyTone}>
          {hasReport
            ? report.isBodyFullyVisible
              ? 'Fully visible'
              : 'Partial'
            : 'Waiting for pose'}
        </Text>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Text variant="caption" tone="muted">
          Mean key landmark visibility
        </Text>
        <Text variant="label">{hasReport ? formatScore(report.bodyVisibilityScore) : '—'}</Text>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Text variant="caption" tone="muted">
          Visibility threshold
        </Text>
        <Text variant="label">{formatScore(visibilityThreshold)}</Text>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Text variant="caption" tone="muted">
          Visible landmarks
        </Text>
        <Text
          variant="label"
          tone={hasReport && report.visibleLandmarkCount === 33 ? 'primary' : 'muted'}
        >
          {hasReport ? `${report.visibleLandmarkCount} / 33` : '—'}
        </Text>
      </div>

      {hasReport && report.keyLandmarkVisibility.length > 0 ? (
        <div className="flex flex-col gap-1 pt-2">
          <Text variant="caption" tone="muted">
            Key landmark detail
          </Text>
          <ul className="grid grid-cols-1 gap-x-3 gap-y-0.5 sm:grid-cols-2">
            {report.keyLandmarkVisibility.map((entry) => (
              <li key={entry.name} className="flex items-center justify-between gap-2">
                <Text variant="caption" tone="muted">
                  {formatLandmarkName(entry.name)}
                </Text>
                <Text variant="caption" tone={entry.isVisible ? 'primary' : 'warning'}>
                  {formatScore(entry.visibility)}
                </Text>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {hasReport && !allKeyLandmarksPass ? (
        <div className="flex flex-col gap-1 pt-1">
          <Text variant="caption" tone="warning">
            Occluded key landmarks
          </Text>
          <Text variant="caption" tone="muted">
            {report.occludedKeyLandmarks.map(formatLandmarkName).join(', ')}
          </Text>
        </div>
      ) : null}
    </Card>
  );
}
