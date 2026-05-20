import { Card, Text } from '@components/primitives';
import type { AngleCalculationStats } from '@/types/angles';

/**
 * Phase 19 — angle calculation overhead card.
 *
 * Surfaces the per-frame timing for the angle layer plus the current
 * size / capacity of the bounded `AngleHistory` ring buffer. All
 * values come from real `performance.now()` samples on the latest
 * frame; never fabricated, never averaged in the UI.
 *
 * Target: angle calculation overhead under 1ms per frame.
 */

type AngleStatsCardProps = {
  stats: AngleCalculationStats;
};

const TARGET_TOTAL_MS = 1;

function formatMs(value: number): string {
  if (!Number.isFinite(value) || value < 0) {
    return '—';
  }
  if (value < 0.01) {
    return '< 0.01 ms';
  }
  return `${value.toFixed(2)} ms`;
}

export function AngleStatsCard({ stats }: AngleStatsCardProps): JSX.Element {
  const hasFrames = stats.snapshotsProduced > 0;
  const totalTone = !hasFrames
    ? 'muted'
    : stats.totalCalculationMs <= TARGET_TOTAL_MS
      ? 'primary'
      : 'warning';

  return (
    <Card variant="outlined" padding="md" className="flex flex-col gap-2">
      <Text variant="label" tone="muted">
        Angle calculation overhead
      </Text>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        <Text variant="caption" tone="muted">
          Latest frame
        </Text>
        <Text variant="label" tone={totalTone}>
          {formatMs(stats.totalCalculationMs)}
        </Text>

        <Text variant="caption" tone="muted">
          Snapshots produced
        </Text>
        <Text variant="label">{stats.snapshotsProduced}</Text>

        <Text variant="caption" tone="muted">
          Frames skipped
        </Text>
        <Text variant="label">{stats.framesSkipped}</Text>

        <Text variant="caption" tone="muted">
          Angle history
        </Text>
        <Text variant="label">
          {stats.historySize} / {stats.historyCapacity}
        </Text>
      </div>

      <Text variant="caption" tone="muted">
        Phase 19 targets &lt; {TARGET_TOTAL_MS} ms per frame. History is a bounded ring buffer; it
        resets on stop, model restart, or when no pose is detected.
      </Text>
    </Card>
  );
}
