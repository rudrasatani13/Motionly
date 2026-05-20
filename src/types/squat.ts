/**
 * Phase 20 — Squat exercise domain types.
 *
 * Public types for the bodyweight-squat state machine. UI components,
 * hooks, and the active route depend on these shapes; the engine math
 * in `src/ml/exercises/SquatEngine.ts` never imports React, the DOM,
 * MediaPipe, or storage.
 *
 * Phase 20 scope:
 * - States: STANDING → DESCENDING → BOTTOM → ASCENDING → STANDING
 *   (COMPLETE is reserved for future target-rep configurations).
 * - Difficulty-driven depth threshold (beginner / intermediate).
 * - Bottom-dwell hysteresis (≥ 15 frames before a rep is eligible).
 * - Half-rep rejection.
 * - Raw rep metrics — bottom knee angle, min knee angles, average
 *   trunk angle, max knee valgus ratios, duration, bottom-dwell count.
 *
 * Phase 20 still does NOT introduce:
 * - Form scoring (Phase 21 — `formScore` is always `null` here).
 * - Coaching cues, voice / toast feedback (Phase 21+).
 * - Workout timer / session / completion / history (Phase 27+).
 * - Persistence of squat state or rep history.
 */

import type {
  ExerciseEngineDebugState,
  ExerciseFrameResult,
  ExerciseRepResultBase,
} from './exercise';

/**
 * High-level squat state. `COMPLETE` is reserved for future workouts
 * with a target rep count; Phase 20 stays in the cyclic loop and never
 * permanently parks the engine in `COMPLETE`.
 */
export type SquatState = 'STANDING' | 'DESCENDING' | 'BOTTOM' | 'ASCENDING' | 'COMPLETE';

/**
 * Difficulty preset selecting the bottom-depth threshold. Per-user
 * adaptive tuning is intentionally deferred to Phase 24+.
 */
export type SquatDifficulty = 'beginner' | 'intermediate';

/**
 * How deep the current rep has gone relative to the configured
 * difficulty. Reset between reps; used by the debug UI only — Phase 20
 * never classifies this as "good" or "bad".
 */
export type SquatDepthStatus =
  | 'unknown'
  | 'above_depth'
  | 'reached_beginner_depth'
  | 'reached_intermediate_depth';

/**
 * Outcome bucket for a squat attempt. Mirrors
 * `ExerciseRepStatus` for the squat engine specifically.
 */
export type SquatRepQuality =
  | 'counted'
  | 'rejected_half_rep'
  | 'rejected_visibility'
  | 'rejected_unstable_angles';

/**
 * Knob set for the squat engine. Centralized in `squat-config.ts`;
 * exposed here so the hook / UI can read the resolved values.
 */
export type SquatEngineConfig = {
  /** Knee angle (deg) at or above which the user is treated as standing. */
  standingKneeAngleDegrees: number;
  /** Beginner bottom-depth knee angle (deg). */
  beginnerBottomKneeAngleDegrees: number;
  /** Intermediate bottom-depth knee angle (deg). */
  intermediateBottomKneeAngleDegrees: number;
  /** Required dwell at bottom (in frames) before a rep is eligible. */
  minimumBottomDwellFrames: number;
  /** Lower bound on a counted rep's total duration (ms). */
  minRepDurationMs: number;
  /** Upper bound on a counted rep's total duration (ms). */
  maxRepDurationMs: number;
  /** When true, the engine refuses to count if required visibility drops. */
  visibilityRequired: boolean;
  /** Default difficulty if none is supplied by the caller. */
  defaultDifficulty: SquatDifficulty;
};

/**
 * Per-rep result emitted by the squat engine. Includes the raw metrics
 * Phase 21 will need to compute a real form score — Phase 20 only
 * collects them.
 */
export type SquatRepResult = ExerciseRepResultBase & {
  engineId: 'squat';
  difficulty: SquatDifficulty;
  quality: SquatRepQuality;
  bottomFrameCount: number;
  /** Bottom-frame knee angle (deg) — the minimum during the bottom hold. */
  bottomKneeAngleDegrees: number | null;
  /** Minimum left knee angle (deg) observed during the rep. */
  minLeftKneeAngleDegrees: number | null;
  /** Minimum right knee angle (deg) observed during the rep. */
  minRightKneeAngleDegrees: number | null;
  /** Average trunk angle (deg) sampled during the rep. */
  averageTrunkAngleDegrees: number | null;
  /** Maximum left knee valgus ratio observed during the rep. */
  maxLeftKneeValgusRatio: number | null;
  /** Maximum right knee valgus ratio observed during the rep. */
  maxRightKneeValgusRatio: number | null;
};

/**
 * Debug-only metrics for the current frame. Populated even when the
 * engine isn't initialized so the debug UI never goes blank mid-set.
 */
export type SquatFrameDebug = {
  difficulty: SquatDifficulty;
  averageKneeAngleDegrees: number | null;
  leftKneeAngleDegrees: number | null;
  rightKneeAngleDegrees: number | null;
  trunkAngleDegrees: number | null;
  leftKneeValgusRatio: number | null;
  rightKneeValgusRatio: number | null;
  depthStatus: SquatDepthStatus;
  bottomDwellFrames: number;
};

/** Per-frame engine output specialized for the squat engine. */
export type SquatFrameResult = ExerciseFrameResult<SquatState, SquatFrameDebug, SquatRepResult>;

/** Engine-wide debug view specialized for the squat engine. */
export type SquatEngineDebugState = ExerciseEngineDebugState<
  SquatState,
  SquatFrameDebug,
  SquatRepResult
>;

/**
 * Recorded state transition. Returned alongside `SquatFrameResult` so
 * the debug UI can log transitions without polling state every frame.
 */
export type SquatStateTransition = {
  from: SquatState;
  to: SquatState;
  atMs: number;
  frameId: number;
};
