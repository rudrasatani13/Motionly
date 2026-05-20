import { Card, Text } from '@components/primitives';
import type { PoseInferenceStats } from '@/types/pose';

type PoseFpsBadgeProps = {
  stats: PoseInferenceStats;
};

function formatFps(fps: number): string {
  if (!Number.isFinite(fps) || fps <= 0) {
    return '—';
  }
  return fps.toFixed(1);
}

function formatMs(value: number): string {
  if (!Number.isFinite(value) || value <= 0) {
    return '—';
  }
  return `${value.toFixed(1)} ms`;
}

/**
 * Phase 17 — compact performance card for the pose-debug surface.
 *
 * Reads stats directly from the inference loop; never fabricates a
 * number. If a value is unavailable (e.g. before the first frame),
 * the card renders an em-dash instead of a fake placeholder.
 */
export function PoseFpsBadge({ stats }: PoseFpsBadgeProps): JSX.Element {
  return (
    <Card variant="outlined" padding="md" className="flex flex-col gap-2">
      <Text variant="label" tone="muted">
        Performance
      </Text>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        <Text variant="caption" tone="muted">
          FPS
        </Text>
        <Text variant="label">{formatFps(stats.fps)}</Text>

        <Text variant="caption" tone="muted">
          Last inference
        </Text>
        <Text variant="label">{formatMs(stats.lastInferenceMs)}</Text>

        <Text variant="caption" tone="muted">
          Avg inference
        </Text>
        <Text variant="label">{formatMs(stats.averageInferenceMs)}</Text>

        <Text variant="caption" tone="muted">
          Frames processed
        </Text>
        <Text variant="label">{stats.framesProcessed}</Text>

        <Text variant="caption" tone="muted">
          Frames skipped
        </Text>
        <Text variant="label">{stats.framesSkipped}</Text>

        <Text variant="caption" tone="muted">
          Model load
        </Text>
        <Text variant="label">
          {stats.modelLoadMs === null ? '—' : `${stats.modelLoadMs.toFixed(0)} ms`}
        </Text>
      </div>
    </Card>
  );
}
