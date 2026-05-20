import { useMemo } from 'react';

import type { PoseFrame } from '@/types/pose';
import { POSE_KEY_BODY_INDICES } from '@ml/pose/landmark-names';

type PoseLandmarkOverlayProps = {
  /**
   * Latest emitted pose frame, or null if MediaPipe has not produced
   * landmarks yet. The overlay renders nothing when the frame has
   * no landmarks — it never invents dots.
   */
  frame: PoseFrame | null;
  /**
   * Mirror the dots horizontally so they line up with the front-camera
   * preview, which is rendered as `scaleX(-1)`.
   */
  mirror: boolean;
};

/**
 * Phase 17 — debug-only landmark overlay.
 *
 * Renders the 33 real MediaPipe landmarks as SVG dots over the video
 * preview. Does not connect bones, smooth values, label joints, or
 * derive any "form" cue — those belong to Phases 18–20. The dots are
 * sized down and translucent so the overlay reads as a debug aid, not
 * a finished skeleton.
 */
export function PoseLandmarkOverlay({
  frame,
  mirror,
}: PoseLandmarkOverlayProps): JSX.Element | null {
  const visibleLandmarks = frame?.landmarks ?? [];

  const keyIndexSet = useMemo(() => new Set<number>(POSE_KEY_BODY_INDICES), []);

  if (visibleLandmarks.length === 0) {
    return null;
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      <g transform={mirror ? 'translate(100,0) scale(-1,1)' : undefined}>
        {visibleLandmarks.map((landmark, index) => {
          const cx = landmark.x * 100;
          const cy = landmark.y * 100;
          const isKey = keyIndexSet.has(index);
          return (
            <circle
              key={index}
              cx={cx}
              cy={cy}
              r={isKey ? 0.9 : 0.55}
              className={
                isKey
                  ? 'fill-motionly-primary/80 stroke-motionly-bg-light/90'
                  : 'fill-motionly-accent/70 stroke-motionly-bg-light/60'
              }
              strokeWidth={0.2}
            />
          );
        })}
      </g>
    </svg>
  );
}
