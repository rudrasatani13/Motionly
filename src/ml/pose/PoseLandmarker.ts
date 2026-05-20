/**
 * Phase 17 — MediaPipe Pose Landmarker wrapper.
 *
 * The single place in Motionly that imports from
 * `@mediapipe/tasks-vision`. Everything outside `src/ml/pose/`
 * consumes Motionly's own `PoseDetectionResult` / `PoseFrame` types
 * so that vendor symbols do not leak into UI, stores, or hooks.
 *
 * Phase 17 scope:
 * - Initialize the Tasks-Vision WASM fileset from the app-local
 *   `/mediapipe-wasm/` URL.
 * - Load the lite or full `.task` model file from `/models/`.
 * - Run inference in `VIDEO` running mode at one detection per frame.
 * - Prefer the GPU delegate; transparently fall back to CPU on init
 *   failure and surface that fact via `getDelegate()`.
 *
 * Phase 17 does NOT:
 * - Smooth, normalize, or filter landmarks (Phase 18).
 * - Compute joint angles (Phase 19).
 * - Detect reps, score form, or persist any output (Phase 20+).
 */

import {
  FilesetResolver,
  PoseLandmarker as MediaPipePoseLandmarker,
  type PoseLandmarkerResult,
} from '@mediapipe/tasks-vision';

import {
  DEFAULT_POSE_MODEL_VARIANT,
  POSE_INFERENCE_DEFAULTS,
  POSE_MODEL_URLS,
  POSE_WASM_BASE_PATH,
  PREFERRED_POSE_DELEGATE,
} from '@ml/pose/pose-model-config';
import { POSE_LANDMARK_COUNT } from '@ml/pose/landmark-names';
import type {
  PoseDelegate,
  PoseDetectionResult,
  PoseInferenceError,
  PoseInferenceErrorKind,
  PoseInferenceStatus,
  PoseLandmark,
  PoseLandmarks,
  PoseModelVariant,
  PoseWorldLandmark,
  PoseWorldLandmarks,
} from '@/types/pose';

export type MotionlyPoseLandmarkerInitOptions = {
  variant?: PoseModelVariant;
  delegate?: PoseDelegate;
};

export type MotionlyPoseLandmarkerInitResult =
  | {
      kind: 'ready';
      delegate: PoseDelegate;
      variant: PoseModelVariant;
      modelLoadMs: number;
    }
  | {
      kind: 'error';
      error: PoseInferenceError;
    };

function buildError(kind: PoseInferenceErrorKind, message: string): PoseInferenceError {
  return { kind, message };
}

function classifyInitError(error: unknown): PoseInferenceError {
  if (typeof error !== 'object' || error === null) {
    return buildError('unknown', 'MediaPipe Pose Landmarker failed to initialize.');
  }
  const message = (error as { message?: string }).message ?? '';
  const lowered = message.toLowerCase();

  if (lowered.includes('webgl') || lowered.includes('gpu')) {
    return buildError('gpu-init-failed', message || 'GPU delegate failed to start.');
  }
  if (lowered.includes('wasm')) {
    return buildError('wasm-load-failed', message || 'MediaPipe WASM failed to load.');
  }
  if (lowered.includes('fetch') || lowered.includes('network')) {
    return buildError('model-fetch-failed', message || 'Model file could not be downloaded.');
  }
  if (lowered.includes('not found') || lowered.includes('404')) {
    return buildError('model-missing', message || 'Model file was not found.');
  }
  return buildError('unknown', message || 'MediaPipe Pose Landmarker failed to initialize.');
}

function convertLandmark(landmark: {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}): PoseLandmark {
  return {
    x: landmark.x,
    y: landmark.y,
    z: landmark.z,
    visibility: typeof landmark.visibility === 'number' ? landmark.visibility : 0,
    // Tasks-Vision does not expose a separate "presence" channel on the
    // public NormalizedLandmark type today, so we mirror visibility here
    // and let later phases tune semantics. We never invent a value the
    // model did not produce.
    presence: typeof landmark.visibility === 'number' ? landmark.visibility : 0,
  };
}

function convertWorldLandmark(landmark: {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}): PoseWorldLandmark {
  return {
    x: landmark.x,
    y: landmark.y,
    z: landmark.z,
    visibility: typeof landmark.visibility === 'number' ? landmark.visibility : 0,
    presence: typeof landmark.visibility === 'number' ? landmark.visibility : 0,
  };
}

function toMotionlyResult(
  result: PoseLandmarkerResult,
  timestampMs: number,
  inferenceMs: number,
): PoseDetectionResult {
  const firstPoseLandmarks = result.landmarks[0];
  const firstWorldLandmarks = result.worldLandmarks[0];

  const landmarks: PoseLandmarks =
    Array.isArray(firstPoseLandmarks) && firstPoseLandmarks.length === POSE_LANDMARK_COUNT
      ? firstPoseLandmarks.map(convertLandmark)
      : [];

  const worldLandmarks: PoseWorldLandmarks | null =
    Array.isArray(firstWorldLandmarks) && firstWorldLandmarks.length === POSE_LANDMARK_COUNT
      ? firstWorldLandmarks.map(convertWorldLandmark)
      : null;

  return { timestampMs, inferenceMs, landmarks, worldLandmarks };
}

/**
 * Motionly's pose landmarker wrapper. Single instance per active
 * workout debug session. Always close it on unmount.
 */
export class MotionlyPoseLandmarker {
  private landmarker: MediaPipePoseLandmarker | null = null;
  private status: PoseInferenceStatus = 'idle';
  private delegate: PoseDelegate = PREFERRED_POSE_DELEGATE;
  private variant: PoseModelVariant = DEFAULT_POSE_MODEL_VARIANT;
  private modelLoadMs: number | null = null;

  async initialize(
    options: MotionlyPoseLandmarkerInitOptions = {},
  ): Promise<MotionlyPoseLandmarkerInitResult> {
    if (this.landmarker !== null) {
      return {
        kind: 'ready',
        delegate: this.delegate,
        variant: this.variant,
        modelLoadMs: this.modelLoadMs ?? 0,
      };
    }

    this.variant = options.variant ?? DEFAULT_POSE_MODEL_VARIANT;
    const requestedDelegate = options.delegate ?? PREFERRED_POSE_DELEGATE;

    this.status = 'loading-model';

    const loadStart = performance.now();
    let fileset;
    try {
      fileset = await FilesetResolver.forVisionTasks(POSE_WASM_BASE_PATH);
    } catch (error) {
      this.status = 'error';
      return { kind: 'error', error: classifyInitError(error) };
    }

    const tryCreate = async (
      delegate: PoseDelegate,
    ): Promise<MediaPipePoseLandmarker | PoseInferenceError> => {
      try {
        return await MediaPipePoseLandmarker.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath: POSE_MODEL_URLS[this.variant],
            delegate: delegate === 'gpu' ? 'GPU' : 'CPU',
          },
          runningMode: 'VIDEO',
          numPoses: POSE_INFERENCE_DEFAULTS.numPoses,
          minPoseDetectionConfidence: POSE_INFERENCE_DEFAULTS.minPoseDetectionConfidence,
          minPosePresenceConfidence: POSE_INFERENCE_DEFAULTS.minPosePresenceConfidence,
          minTrackingConfidence: POSE_INFERENCE_DEFAULTS.minTrackingConfidence,
          outputSegmentationMasks: false,
        });
      } catch (error) {
        return classifyInitError(error);
      }
    };

    let created = await tryCreate(requestedDelegate);
    if (!(created instanceof MediaPipePoseLandmarker) && requestedDelegate === 'gpu') {
      // Auto-fallback: try CPU once. Surface the fact via getDelegate().
      const cpuResult = await tryCreate('cpu');
      if (cpuResult instanceof MediaPipePoseLandmarker) {
        created = cpuResult;
        this.delegate = 'cpu';
      } else {
        this.status = 'error';
        return {
          kind: 'error',
          error: {
            kind: 'cpu-init-failed',
            message: cpuResult.message,
          },
        };
      }
    } else if (created instanceof MediaPipePoseLandmarker) {
      this.delegate = requestedDelegate;
    } else {
      this.status = 'error';
      return { kind: 'error', error: created };
    }

    this.landmarker = created;
    this.modelLoadMs = performance.now() - loadStart;
    this.status = 'ready';

    return {
      kind: 'ready',
      delegate: this.delegate,
      variant: this.variant,
      modelLoadMs: this.modelLoadMs,
    };
  }

  detectForVideo(video: HTMLVideoElement, timestampMs: number): PoseDetectionResult | null {
    if (this.landmarker === null) {
      return null;
    }

    const start = performance.now();
    let rawResult: PoseLandmarkerResult;
    try {
      rawResult = this.landmarker.detectForVideo(video, timestampMs);
    } catch {
      // We do not throw out to the loop — the loop will surface the
      // status / error through the store. Returning null here keeps
      // the loop alive enough to attempt cleanup.
      return null;
    }
    const inferenceMs = performance.now() - start;

    this.status = rawResult.landmarks.length > 0 ? 'running' : 'no-pose';
    return toMotionlyResult(rawResult, timestampMs, inferenceMs);
  }

  close(): void {
    if (this.landmarker !== null) {
      try {
        this.landmarker.close();
      } catch {
        // Ignore: closing an already-closed task is harmless.
      }
      this.landmarker = null;
    }
    this.status = 'idle';
    this.modelLoadMs = null;
  }

  getStatus(): PoseInferenceStatus {
    return this.status;
  }

  getDelegate(): PoseDelegate {
    return this.delegate;
  }

  getModelVariant(): PoseModelVariant {
    return this.variant;
  }

  getModelLoadMs(): number | null {
    return this.modelLoadMs;
  }

  isReady(): boolean {
    return this.landmarker !== null;
  }
}
