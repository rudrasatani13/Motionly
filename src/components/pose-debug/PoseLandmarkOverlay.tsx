import { useMemo } from 'react';

import type { NormalizedPoseLandmarks, PoseFrame, ProcessedPoseFrame } from '@/types/pose';
import { POSE_KEY_BODY_INDICES } from '@ml/pose/landmark-names';

/**
 * Which set of landmarks the overlay draws. Phase 18 keeps the raw
 * MediaPipe dots as the default debug view and adds the smoothed +
 * normalized variants for visual comparison.
 *
 * - `raw` — original MediaPipe dots in normalized image space.
 * - `smoothed` — Phase 18 EMA-smoothed coordinates, same image space.
 * - `normalized` — torso-scale-normalized coordinates, drawn in a
 *   debug-only coordinate space (origin at the hip midpoint, ±1.5
 *   units per side). It is **not** a camera-space overlay; the label
 *   `(debug)` is rendered so a reader cannot mistake it for the final
 *   skeleton overlay.
 */
export type PoseOverlayMode = 'raw' | 'smoothed' | 'normalized';

type PoseLandmarkOverlayProps = {
  /**
   * Latest raw pose frame, or null if MediaPipe has not produced
   * landmarks yet. The overlay renders nothing when the frame has
   * no landmarks — it never invents dots.
   */
  frame: PoseFrame | null;
  /**
   * Latest processed pose frame. Required for `smoothed` and
   * `normalized` overlay modes.
   */
  processedFrame: ProcessedPoseFrame | null;
  /** Which set of landmarks to render. */
  mode: PoseOverlayMode;
  /**
   * Mirror the dots horizontally so they line up with the front-camera
   * preview, which is rendered as `scaleX(-1)`. Ignored in
   * `normalized` mode because the normalized coordinate space is
   * already detached from the camera frame.
   */
  mirror: boolean;
};

/**
 * Phase 17 + 18 — debug-only landmark overlay.
 *
 * Renders one set of real landmarks as SVG dots over the video
 * preview. Never connects bones, never invents dots, never labels
 * joints, never derives any "form" cue. Normalized mode is clearly
 * marked as a debug projection so a reader does not mistake it for
 * the final skeleton overlay (Phase 26).
 */
export function PoseLandmarkOverlay({
  frame,
  processedFrame,
  mode,
  mirror,
}: PoseLandmarkOverlayProps): JSX.Element | null {
  const keyIndexSet = useMemo(() => new Set<number>(POSE_KEY_BODY_INDICES), []);

  if (mode === 'raw') {
    const landmarks = frame?.landmarks ?? [];
    if (landmarks.length === 0) {
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
          {landmarks.map((landmark, index) => {
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

  if (mode === 'smoothed') {
    const landmarks = processedFrame?.smoothedLandmarks ?? [];
    if (landmarks.length === 0) {
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
          {landmarks.map((landmark, index) => {
            const cx = landmark.x * 100;
            const cy = landmark.y * 100;
            const isKey = keyIndexSet.has(index);
            const isVisible = landmark.isVisible;
            return (
              <circle
                key={index}
                cx={cx}
                cy={cy}
                r={isKey ? 0.9 : 0.55}
                className={
                  isVisible
                    ? isKey
                      ? 'fill-motionly-primary stroke-motionly-bg-light/90'
                      : 'fill-motionly-accent stroke-motionly-bg-light/60'
                    : 'fill-motionly-neutral-400/60 stroke-motionly-bg-light/40'
                }
                strokeWidth={0.2}
              />
            );
          })}
        </g>
      </svg>
    );
  }

  // mode === 'normalized'
  const normalizedLandmarks: NormalizedPoseLandmarks | null =
    processedFrame?.normalizedLandmarks ?? null;
  if (normalizedLandmarks === null || normalizedLandmarks.length === 0) {
    return null;
  }
  // Project normalized coords (origin at hip midpoint, ±~1.5 torso
  // units typical) into the same 0..100 viewBox so the overlay is
  // visually comparable. Scale chosen so a full-body subject roughly
  // fills the box. This is a debug projection only.
  const scale = 25;
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      <g>
        <text x={2} y={5} className="fill-motionly-bg-light/70" fontSize="3">
          normalized debug projection
        </text>
        {normalizedLandmarks.map((landmark, index) => {
          const cx = 50 + landmark.normalizedX * scale;
          const cy = 50 + landmark.normalizedY * scale;
          const isKey = keyIndexSet.has(index);
          const isVisible = landmark.isVisible;
          return (
            <circle
              key={index}
              cx={cx}
              cy={cy}
              r={isKey ? 0.9 : 0.55}
              className={
                isVisible
                  ? isKey
                    ? 'fill-motionly-primary stroke-motionly-bg-light/90'
                    : 'fill-motionly-accent stroke-motionly-bg-light/60'
                  : 'fill-motionly-neutral-400/60 stroke-motionly-bg-light/40'
              }
              strokeWidth={0.2}
            />
          );
        })}
      </g>
    </svg>
  );
}
