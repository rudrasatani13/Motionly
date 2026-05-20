import { Card, Text } from '@components/primitives';
import type {
  PoseDelegate,
  PoseInferenceError,
  PoseInferenceStatus,
  PoseModelVariant,
} from '@/types/pose';

type PoseModelStatusCardProps = {
  status: PoseInferenceStatus;
  modelVariant: PoseModelVariant | null;
  delegate: PoseDelegate | null;
  error: PoseInferenceError | null;
};

function formatModelLabel(variant: PoseModelVariant | null): string {
  if (variant === null) {
    return 'Not loaded';
  }
  return variant === 'lite' ? 'pose_landmarker_lite.task' : 'pose_landmarker_full.task';
}

function formatDelegateLabel(delegate: PoseDelegate | null): string {
  if (delegate === null) {
    return '—';
  }
  return delegate === 'gpu' ? 'GPU (WebGL/WebGPU)' : 'CPU (WASM fallback)';
}

/**
 * Phase 17 — model + delegate + error card for the pose-debug surface.
 *
 * Surfaces honest signals: which `.task` model was loaded, which
 * delegate MediaPipe ended up using (including a transparent CPU
 * fallback note), and the most recent recoverable error if any.
 */
export function PoseModelStatusCard({
  status,
  modelVariant,
  delegate,
  error,
}: PoseModelStatusCardProps): JSX.Element {
  const showCpuFallbackNote =
    delegate === 'cpu' && (status === 'ready' || status === 'running' || status === 'no-pose');

  return (
    <Card variant="outlined" padding="md" className="flex flex-col gap-2">
      <Text variant="label" tone="muted">
        Model & delegate
      </Text>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        <Text variant="caption" tone="muted">
          Model file
        </Text>
        <Text variant="label">{formatModelLabel(modelVariant)}</Text>

        <Text variant="caption" tone="muted">
          Delegate
        </Text>
        <Text variant="label">{formatDelegateLabel(delegate)}</Text>
      </div>

      {showCpuFallbackNote ? (
        <Text variant="caption" tone="warning">
          GPU initialization failed on this device; Motionly fell back to CPU. Inference may be
          slower than on capable GPU-backed browsers.
        </Text>
      ) : null}

      {error !== null ? (
        <Card variant="default" padding="sm" className="mt-1">
          <Text variant="label" tone="danger">
            {error.kind.replace(/-/g, ' ')}
          </Text>
          <Text variant="caption" tone="muted">
            {error.message}
          </Text>
        </Card>
      ) : null}
    </Card>
  );
}
