/**
 * Phase 20 — Squat rep detector React hook.
 *
 * Owns a single `SquatEngine` instance per active debug session and
 * feeds it the latest Phase 19 `AngleSnapshot` from the pose store.
 * The hook deliberately reads from the existing pose store rather
 * than introducing a new Zustand surface — Phase 20 only adds debug
 * visibility, never persistent squat state.
 *
 * Responsibilities:
 * - Process each new angle snapshot once (de-dup by `frameId`).
 * - Reset the engine when pose debug stops (no snapshot in the store
 *   for a sustained tick), on workout change, on route unmount, and
 *   when the consumer toggles `enabled` off.
 * - Expose `state`, `repCount`, `latestCountedRep`, `latestRejectedRep`,
 *   per-frame debug data, `reset()`, and `setDifficulty()` for the
 *   debug panel.
 *
 * Out of scope (intentionally deferred):
 * - Persistence of any squat state, rep results, or session records.
 * - Form scoring, cues, voice / haptic feedback.
 * - Multi-exercise routing (the active route only runs the squat
 *   engine when the current workout actually includes a squat).
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { SquatEngine } from '@ml/exercises';
import { usePoseStore } from '@store/usePoseStore';
import type {
  SquatDifficulty,
  SquatEngineDebugState,
  SquatFrameDebug,
  SquatFrameResult,
  SquatRepResult,
  SquatState,
} from '@/types/squat';

export type UseSquatRepDetectorOptions = {
  /**
   * When `false` the engine is kept reset and no snapshots are
   * processed. Lets the active route gate the detector on the current
   * workout (e.g. only run for squats) without unmounting the hook.
   */
  enabled: boolean;
  /** Initial squat difficulty; the user can change it via `setDifficulty`. */
  initialDifficulty?: SquatDifficulty;
};

export type UseSquatRepDetectorControls = {
  enabled: boolean;
  state: SquatState;
  status: SquatEngineDebugState['status'];
  difficulty: SquatDifficulty;
  repCount: number;
  latestCountedRep: SquatRepResult | null;
  latestRejectedRep: SquatRepResult | null;
  debug: SquatEngineDebugState['debug'];
  /** Reset the engine — drops state, counters, and rep history. */
  reset: () => void;
  /** Switch beginner / intermediate; cancels any in-flight rep. */
  setDifficulty: (next: SquatDifficulty) => void;
};

const EMPTY_FRAME_RESULT_GUARD = {
  frameId: -1,
};

export function useSquatRepDetector(
  options: UseSquatRepDetectorOptions,
): UseSquatRepDetectorControls {
  const { enabled, initialDifficulty } = options;

  const engineRef = useRef<SquatEngine | null>(null);
  const lastProcessedFrameIdRef = useRef<number>(EMPTY_FRAME_RESULT_GUARD.frameId);

  const latestAngleSnapshot = usePoseStore((s) => s.latestAngleSnapshot);

  const [view, setView] = useState<SquatEngineDebugState>(() => {
    const initialDebug: SquatFrameDebug = {
      difficulty: initialDifficulty ?? 'beginner',
      averageKneeAngleDegrees: null,
      leftKneeAngleDegrees: null,
      rightKneeAngleDegrees: null,
      trunkAngleDegrees: null,
      leftKneeValgusRatio: null,
      rightKneeValgusRatio: null,
      depthStatus: 'unknown',
      bottomDwellFrames: 0,
    };
    return {
      engineId: 'squat',
      status: 'waiting-for-pose',
      currentState: 'STANDING',
      repCount: 0,
      latestCountedRep: null,
      latestRejectedRep: null,
      debug: initialDebug,
    };
  });

  const applyFrameResult = useCallback((frame: SquatFrameResult, engine: SquatEngine): void => {
    setView({
      engineId: 'squat',
      status: frame.status,
      currentState: frame.currentState,
      repCount: frame.repCount,
      latestCountedRep: frame.latestCountedRep ?? engine.getDebugState().latestCountedRep,
      latestRejectedRep: frame.latestRejectedRep ?? engine.getDebugState().latestRejectedRep,
      debug: frame.debug,
    });
  }, []);

  // Lazily create the engine on first effect run and dispose it on
  // unmount. Refs are deliberately not accessed during render; the
  // initial `view` state already reflects the engine's freshly-reset
  // debug state, so no `setView` is required here.
  useEffect(() => {
    const engine = new SquatEngine({ difficulty: initialDifficulty });
    engineRef.current = engine;
    return () => {
      engine.reset();
      engineRef.current = null;
      lastProcessedFrameIdRef.current = EMPTY_FRAME_RESULT_GUARD.frameId;
    };
  }, [initialDifficulty]);

  // Process new snapshots; reset the engine when disabled.
  useEffect(() => {
    const engine = engineRef.current;
    if (engine === null) {
      return;
    }
    if (!enabled) {
      engine.reset();
      lastProcessedFrameIdRef.current = EMPTY_FRAME_RESULT_GUARD.frameId;
      setView(engine.getDebugState());
      return;
    }
    if (latestAngleSnapshot === null) {
      const frame = engine.process(null);
      applyFrameResult(frame, engine);
      return;
    }
    if (latestAngleSnapshot.frameId === lastProcessedFrameIdRef.current) {
      return;
    }
    lastProcessedFrameIdRef.current = latestAngleSnapshot.frameId;
    const frame = engine.process(latestAngleSnapshot);
    applyFrameResult(frame, engine);
  }, [applyFrameResult, enabled, latestAngleSnapshot]);

  const reset = useCallback((): void => {
    const engine = engineRef.current;
    if (engine === null) {
      return;
    }
    engine.reset();
    lastProcessedFrameIdRef.current = EMPTY_FRAME_RESULT_GUARD.frameId;
    setView(engine.getDebugState());
  }, []);

  const setDifficulty = useCallback((next: SquatDifficulty): void => {
    const engine = engineRef.current;
    if (engine === null) {
      return;
    }
    engine.setDifficulty(next);
    setView(engine.getDebugState());
  }, []);

  return {
    enabled,
    state: view.currentState,
    status: view.status,
    difficulty: view.debug.difficulty,
    repCount: view.repCount,
    latestCountedRep: view.latestCountedRep,
    latestRejectedRep: view.latestRejectedRep,
    debug: view.debug,
    reset,
    setDifficulty,
  };
}
