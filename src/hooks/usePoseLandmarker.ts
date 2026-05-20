/**
 * Phase 17 — Pose inference React hook.
 *
 * Owns the lifecycle of a `MotionlyPoseLandmarker` and the
 * `requestAnimationFrame` inference loop for one mounted page.
 *
 * Responsibilities:
 * - Lazily initialize the MediaPipe wrapper after a user-initiated
 *   action (the hook is mounted but does not start inference until
 *   `start()` is called).
 * - Run at most one detection per animation frame.
 * - Skip frames that have no new `currentTime` so MediaPipe never
 *   sees duplicate timestamps.
 * - Measure live FPS and inference timing into the pose store.
 * - Tear down cleanly on unmount, errors, route changes, and
 *   external camera stops.
 *
 * Out of scope (intentionally deferred to later phases):
 * - Smoothing, normalization, joint angle math, rep state machines.
 * - Worker / OffscreenCanvas. The hook keeps a tight boundary so a
 *   worker version can replace this implementation later without
 *   rewriting consumers. See `docs/ARCHITECTURE.md` for the note.
 */

import { useCallback, useEffect, useRef } from 'react';

import { MotionlyPoseLandmarker } from '@ml/pose/PoseLandmarker';
import { POSE_MIN_FRAME_INTERVAL_MS } from '@ml/pose/pose-model-config';
import { usePoseStore } from '@store/usePoseStore';
import type {
  PoseDelegate,
  PoseFrame,
  PoseInferenceError,
  PoseInferenceStats,
  PoseInferenceStatus,
  PoseModelVariant,
} from '@/types/pose';

type StartOptions = {
  variant?: PoseModelVariant;
  delegate?: PoseDelegate;
};

export type UsePoseLandmarkerControls = {
  status: PoseInferenceStatus;
  error: PoseInferenceError | null;
  stats: PoseInferenceStats;
  latestFrame: PoseFrame | null;
  modelVariant: PoseModelVariant | null;
  delegate: PoseDelegate | null;
  /** Initialize MediaPipe and start the inference loop. */
  start: (video: HTMLVideoElement, options?: StartOptions) => Promise<void>;
  /** Stop the loop and dispose the MediaPipe task. */
  stop: () => void;
};

type FrameSamples = {
  values: number[];
  capacity: number;
};

function pushSample(buffer: FrameSamples, value: number): void {
  buffer.values.push(value);
  if (buffer.values.length > buffer.capacity) {
    buffer.values.shift();
  }
}

function average(values: ReadonlyArray<number>): number {
  if (values.length === 0) {
    return 0;
  }
  let total = 0;
  for (const value of values) {
    total += value;
  }
  return total / values.length;
}

export function usePoseLandmarker(): UsePoseLandmarkerControls {
  const landmarkerRef = useRef<MotionlyPoseLandmarker | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const mountedRef = useRef(true);
  const lastVideoTimeRef = useRef<number>(-1);
  const lastFrameClockRef = useRef<number>(0);
  const frameCounterRef = useRef(0);
  const framesSkippedRef = useRef(0);
  const inferenceMsSamplesRef = useRef<FrameSamples>({ values: [], capacity: 30 });
  const frameIntervalSamplesRef = useRef<FrameSamples>({ values: [], capacity: 30 });
  const tickRef = useRef<() => void>(() => undefined);

  const setStoreStatus = usePoseStore((s) => s.setStatus);
  const setStoreError = usePoseStore((s) => s.setError);
  const setStoreFrame = usePoseStore((s) => s.setLatestFrame);
  const setStoreStats = usePoseStore((s) => s.setStats);
  const setStoreModelVariant = usePoseStore((s) => s.setModelVariant);
  const setStoreDelegate = usePoseStore((s) => s.setDelegate);
  const resetPoseState = usePoseStore((s) => s.resetPoseState);

  const status = usePoseStore((s) => s.status);
  const error = usePoseStore((s) => s.error);
  const stats = usePoseStore((s) => s.stats);
  const latestFrame = usePoseStore((s) => s.latestFrame);
  const modelVariant = usePoseStore((s) => s.modelVariant);
  const delegate = usePoseStore((s) => s.delegate);

  // Keep `tick` updated on each render so callbacks always see the
  // latest closures, while `requestAnimationFrame` schedules through
  // `tickRef` to avoid the self-reference lint pitfall.
  useEffect(() => {
    tickRef.current = (): void => {
      if (!runningRef.current) {
        return;
      }

      const video = videoRef.current;
      const landmarker = landmarkerRef.current;
      if (video === null || landmarker === null) {
        return;
      }

      const now = performance.now();
      if (
        lastFrameClockRef.current !== 0 &&
        now - lastFrameClockRef.current < POSE_MIN_FRAME_INTERVAL_MS
      ) {
        rafRef.current = requestAnimationFrame(() => tickRef.current());
        return;
      }

      const videoReady =
        video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0;
      const videoTime = video.currentTime;
      if (!videoReady || videoTime === lastVideoTimeRef.current) {
        framesSkippedRef.current += 1;
        rafRef.current = requestAnimationFrame(() => tickRef.current());
        return;
      }
      lastVideoTimeRef.current = videoTime;

      const result = landmarker.detectForVideo(video, now);
      if (result === null) {
        if (mountedRef.current) {
          setStoreError({
            kind: 'inference-failed',
            message: 'A pose inference call failed for this frame.',
          });
        }
        rafRef.current = requestAnimationFrame(() => tickRef.current());
        return;
      }

      const frameId = frameCounterRef.current + 1;
      frameCounterRef.current = frameId;

      if (lastFrameClockRef.current !== 0) {
        pushSample(frameIntervalSamplesRef.current, now - lastFrameClockRef.current);
      }
      lastFrameClockRef.current = now;
      pushSample(inferenceMsSamplesRef.current, result.inferenceMs);

      const averageIntervalMs = average(frameIntervalSamplesRef.current.values);
      const fps = averageIntervalMs > 0 ? 1000 / averageIntervalMs : 0;

      const frame: PoseFrame = {
        frameId,
        timestampMs: result.timestampMs,
        landmarks: result.landmarks,
        worldLandmarks: result.worldLandmarks,
        inferenceMs: result.inferenceMs,
        fps,
      };

      if (mountedRef.current) {
        setStoreFrame(frame);
        setStoreStatus(landmarker.getStatus());
        setStoreStats({
          fps,
          lastInferenceMs: result.inferenceMs,
          averageInferenceMs: average(inferenceMsSamplesRef.current.values),
          framesProcessed: frameCounterRef.current,
          framesSkipped: framesSkippedRef.current,
          modelLoadMs: landmarker.getModelLoadMs(),
        });
      }

      rafRef.current = requestAnimationFrame(() => tickRef.current());
    };
  }, [setStoreError, setStoreFrame, setStoreStats, setStoreStatus]);

  const cancelRaf = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const stop = useCallback((): void => {
    runningRef.current = false;
    cancelRaf();
    if (landmarkerRef.current !== null) {
      landmarkerRef.current.close();
      landmarkerRef.current = null;
    }
    videoRef.current = null;
    lastVideoTimeRef.current = -1;
    lastFrameClockRef.current = 0;
    frameCounterRef.current = 0;
    framesSkippedRef.current = 0;
    inferenceMsSamplesRef.current = { values: [], capacity: 30 };
    frameIntervalSamplesRef.current = { values: [], capacity: 30 };
    if (mountedRef.current) {
      resetPoseState();
    }
  }, [cancelRaf, resetPoseState]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stop();
    };
  }, [stop]);

  const start = useCallback(
    async (video: HTMLVideoElement, options: StartOptions = {}): Promise<void> => {
      if (runningRef.current) {
        return;
      }

      videoRef.current = video;
      setStoreError(null);
      setStoreStatus('loading-model');

      const landmarker = new MotionlyPoseLandmarker();
      landmarkerRef.current = landmarker;

      const result = await landmarker.initialize(options);

      if (!mountedRef.current) {
        landmarker.close();
        landmarkerRef.current = null;
        return;
      }

      if (result.kind === 'error') {
        landmarker.close();
        landmarkerRef.current = null;
        setStoreError(result.error);
        setStoreStatus('error');
        return;
      }

      setStoreModelVariant(result.variant);
      setStoreDelegate(result.delegate);
      setStoreStatus('ready');
      setStoreStats({
        fps: 0,
        lastInferenceMs: 0,
        averageInferenceMs: 0,
        framesProcessed: 0,
        framesSkipped: 0,
        modelLoadMs: result.modelLoadMs,
      });

      runningRef.current = true;
      rafRef.current = requestAnimationFrame(() => tickRef.current());
    },
    [setStoreDelegate, setStoreError, setStoreModelVariant, setStoreStats, setStoreStatus],
  );

  return {
    status,
    error,
    stats,
    latestFrame,
    modelVariant,
    delegate,
    start,
    stop,
  };
}
