/**
 * Phase 17 — Pose model + runtime configuration constants.
 *
 * Centralizes every "where do we load this from?" and "what threshold
 * do we ask MediaPipe for?" value so the rest of the pose code stays
 * declarative.
 */

import type { PoseDelegate, PoseModelVariant } from '@/types/pose';

/**
 * Where the MediaPipe Pose Landmarker `.task` model files live in the
 * built app. Files are under `public/models/` so they are reachable
 * at these stable URLs and are caught by the Phase 17 service-worker
 * `CacheFirst` rule for `/models/`.
 */
export const POSE_MODEL_URLS: Readonly<Record<PoseModelVariant, string>> = {
  lite: '/models/pose_landmarker_lite.task',
  full: '/models/pose_landmarker_full.task',
};

/** Default model variant for Phase 17. Lite keeps latency low on mobile. */
export const DEFAULT_POSE_MODEL_VARIANT: PoseModelVariant = 'lite';

/** Preferred MediaPipe delegate. Wrapper falls back to CPU on failure. */
export const PREFERRED_POSE_DELEGATE: PoseDelegate = 'gpu';

/**
 * Where the Tasks-Vision WASM fileset is served from. Vite copies
 * `node_modules/@mediapipe/tasks-vision/wasm/` into
 * `dist/mediapipe-wasm/` at build time and serves the same path in
 * dev via a middleware (see `vite.config.ts → motionlyMediaPipeWasm`).
 *
 * This keeps WASM loading off remote CDNs in production. After first
 * load the service worker caches these files via the `/mediapipe-wasm/`
 * runtime caching rule, so subsequent loads work offline too.
 */
export const POSE_WASM_BASE_PATH = '/mediapipe-wasm';

/**
 * Threshold defaults Motionly hands to MediaPipe at create-time.
 *
 * These are the same defaults documented in the master plan; Phase 17
 * keeps them static. Per-exercise tuning is Phase 20+.
 */
export const POSE_INFERENCE_DEFAULTS = {
  numPoses: 1,
  minPoseDetectionConfidence: 0.5,
  minPosePresenceConfidence: 0.5,
  minTrackingConfidence: 0.5,
} as const;

/**
 * Cap on inference rate. We never request more than one inference per
 * animation frame anyway — this is a defensive ceiling to keep the
 * loop honest if rAF starts running unusually fast (e.g. 120Hz panels).
 */
export const POSE_MIN_FRAME_INTERVAL_MS = 1000 / 90;
