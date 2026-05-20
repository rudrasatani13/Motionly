import { Card, Text } from '@components/primitives';
import type { PoseProcessingStats } from '@/types/pose';

/**
 * Phase 18 — processing-overhead card.
 *
 * Surfaces the per-frame timing breakdown the Phase 18 processor
 * measures: smoothing, filtering, normalization, and total pipeline
 * overhead, plus the running processed / dropped frame counters. All
 * values come from real `performance.now()` samples on the latest
 * processed frame; never fabricated.
 *
 * Target: total pipeline overhead under 2ms per frame on a normal
 * device. The card flags above-target frames in a warning tone so the
 * threshold is visible without screaming about an occasional spike.
 */

type PoseProcessingStatsCardProps = {
  stats: PoseProcessingStats;
};

const TARGET_TOTAL_MS = 2;

function formatMs(value: number): string {
  if (!Number.isFinite(value) || value < 0) {
    return '—';
  }
  if (value < 0.01) {
    return '< 0.01 ms';
  }
  return `${value.toFixed(2)} ms`;
}

export function PoseProcessingStatsCard({ stats }: PoseProcessingStatsCardProps): JSX.Element {
  const hasFrames = stats.processedFrames > 0;
  const totalTone = !hasFrames
    ? 'muted'
    : stats.totalProcessingMs <= TARGET_TOTAL_MS
      ? 'primary'
      : 'warning';

  return (
    <Card variant="outlined" padding="md" className="flex flex-col gap-2">
      <Text variant="label" tone="muted">
        Processing overhead
      </Text>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        <Text variant="caption" tone="muted">
          Total
        </Text>
        <Text variant="label" tone={totalTone}>
          {formatMs(stats.totalProcessingMs)}
        </Text>

        <Text variant="caption" tone="muted">
          Smoothing
        </Text>
        <Text variant="label">{formatMs(stats.smoothingMs)}</Text>

        <Text variant="caption" tone="muted">
          Filtering
        </Text>
        <Text variant="label">{formatMs(stats.filteringMs)}</Text>

        <Text variant="caption" tone="muted">
          Normalization
        </Text>
        <Text variant="label">{formatMs(stats.normalizationMs)}</Text>

        <Text variant="caption" tone="muted">
          Processed frames
        </Text>
        <Text variant="label">{stats.processedFrames}</Text>

        <Text variant="caption" tone="muted">
          Dropped frames
        </Text>
        <Text variant="label">{stats.droppedFrames}</Text>
      </div>

      <Text variant="caption" tone="muted">
        Phase 18 targets &lt; {TARGET_TOTAL_MS} ms per frame for the full smoothing + filtering +
        normalization pipeline.
      </Text>
    </Card>
  );
}
