import { useCallback } from 'react';

import { Button, Card, Column, Row, Text } from '@components/primitives';
import { useToast } from '@components/feedback';
import { POSE_LANDMARK_NAMES } from '@ml/pose/landmark-names';
import type {
  PoseDelegate,
  PoseFrame,
  PoseInferenceError,
  PoseInferenceStats,
  PoseInferenceStatus,
  PoseModelVariant,
} from '@/types/pose';

import { PoseFpsBadge } from './PoseFpsBadge';
import { PoseLandmarkStatus } from './PoseLandmarkStatus';
import { PoseModelStatusCard } from './PoseModelStatusCard';

type PoseDebugPanelProps = {
  status: PoseInferenceStatus;
  stats: PoseInferenceStats;
  latestFrame: PoseFrame | null;
  error: PoseInferenceError | null;
  modelVariant: PoseModelVariant | null;
  delegate: PoseDelegate | null;
  overlayEnabled: boolean;
  onToggleOverlay: () => void;
};

/**
 * Phase 17 — composite debug panel for the active-workout pose surface.
 *
 * Surfaces everything Phase 17 promises and nothing it does not:
 * - real status from the MediaPipe wrapper
 * - real landmark count for the current frame
 * - real FPS / inference timing
 * - real model + delegate state
 * - a debug-only "Log current landmarks" button (no per-frame spam)
 * - an overlay toggle (overlay itself is rendered by the page)
 *
 * It does **not** display rep counts, form scores, calories, cues,
 * "AI feedback," or anything derived from data Motionly has not yet
 * computed.
 */
export function PoseDebugPanel({
  status,
  stats,
  latestFrame,
  error,
  modelVariant,
  delegate,
  overlayEnabled,
  onToggleOverlay,
}: PoseDebugPanelProps): JSX.Element {
  const toast = useToast();
  const landmarkCount = latestFrame?.landmarks.length ?? 0;
  const hasWorldLandmarks =
    latestFrame !== null &&
    latestFrame.worldLandmarks !== null &&
    latestFrame.worldLandmarks.length > 0;

  const handleLogLandmarks = useCallback((): void => {
    if (latestFrame === null || latestFrame.landmarks.length === 0) {
      toast.show({
        tone: 'info',
        title: 'No landmarks to log',
        message: 'Step into frame and wait for MediaPipe to detect a body.',
      });
      return;
    }

    const sample = latestFrame.landmarks.slice(0, 5).map((landmark, index) => ({
      index,
      name: POSE_LANDMARK_NAMES[index],
      x: Number(landmark.x.toFixed(3)),
      y: Number(landmark.y.toFixed(3)),
      z: Number(landmark.z.toFixed(3)),
      visibility: Number(landmark.visibility.toFixed(3)),
    }));

    console.info('[motionly:pose] latest landmarks', {
      frameId: latestFrame.frameId,
      timestampMs: Math.round(latestFrame.timestampMs),
      totalLandmarks: latestFrame.landmarks.length,
      worldLandmarks:
        latestFrame.worldLandmarks === null ? null : latestFrame.worldLandmarks.length,
      firstFive: sample,
    });

    toast.show({
      tone: 'success',
      title: 'Landmark snapshot logged',
      message: 'Open DevTools console to inspect the latest frame.',
    });
  }, [latestFrame, toast]);

  return (
    <Card variant="outlined" padding="lg" className="flex flex-col gap-4">
      <Column gap="xs">
        <Text variant="h3" as="h2">
          Pose debug
        </Text>
        <Text variant="caption" tone="muted">
          Phase 17 surfaces only real MediaPipe output: inference status, landmark count, model,
          delegate, and FPS. No rep counts, form scores, calories, cues, or workout history are
          generated here.
        </Text>
      </Column>

      <div className="grid gap-3 lg:grid-cols-2">
        <PoseLandmarkStatus
          status={status}
          landmarkCount={landmarkCount}
          hasWorldLandmarks={hasWorldLandmarks}
        />
        <PoseModelStatusCard
          status={status}
          modelVariant={modelVariant}
          delegate={delegate}
          error={error}
        />
      </div>

      <PoseFpsBadge stats={stats} />

      <Row gap="sm" wrap>
        <Button
          variant="secondary"
          size="sm"
          onClick={onToggleOverlay}
          aria-pressed={overlayEnabled}
        >
          {overlayEnabled ? 'Hide landmark overlay' : 'Show landmark overlay'}
        </Button>
        <Button variant="ghost" size="sm" onClick={handleLogLandmarks}>
          Log current landmarks
        </Button>
      </Row>
    </Card>
  );
}
