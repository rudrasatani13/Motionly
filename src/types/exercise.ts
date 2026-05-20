/**
 * Phase 20 — Shared exercise-engine domain types.
 *
 * Cross-feature public types for the per-exercise state-machine layer
 * that consumes Phase 19 `AngleSnapshot`s and emits rep / state events.
 * UI components, hooks, and stores depend on these shapes; the engine
 * implementations in `src/ml/exercises/` never leak vendor or
 * MediaPipe symbols.
 *
 * Phase 20 scope:
 * - Generic engine identity + lifecycle status.
 * - Per-frame input/output envelope shared across future exercises.
 * - Generic rep result base for engines (squat is the first concrete
 *   implementation; push-ups and others come later).
 * - Debug-only state + stats view exposed to the active route.
 *
 * Phase 20 still does NOT introduce:
 * - Form scoring or coaching cues (Phase 21+).
 * - Voice / haptic feedback (Phase 25+).
 * - Workout sessions, timers, summaries, or history (Phase 27+).
 * - Persistence of any rep / engine state.
 */

import type { AngleSnapshot } from './angles';

/** Stable identifier for the per-exercise engine implementation. */
export type ExerciseEngineId = 'squat';

/**
 * High-level lifecycle of an exercise engine. Engines are deliberately
 * stateless on creation — they require at least one frame of pose data
 * before they can decide whether the user is initialized.
 */
export type ExerciseEngineStatus =
  | 'idle'
  | 'waiting-for-pose'
  | 'initializing'
  | 'running'
  | 'reset';

/**
 * Single-frame input handed to an exercise engine. The engine never
 * reads camera / MediaPipe / DOM directly — only the snapshot,
 * timestamp, and frame id.
 */
export type ExerciseFrameInput = {
  snapshot: AngleSnapshot;
  /** Frame id mirrors `AngleSnapshot.frameId`; kept for engine de-dup. */
  frameId: number;
  /** Frame timestamp in ms (matches `AngleSnapshot.timestampMs`). */
  timestampMs: number;
};

/**
 * Why a rep was rejected (or, in the half-rep case, why it did not
 * count). Kept technical and debug-only — Phase 21 owns user-facing
 * coaching copy.
 */
export type ExerciseRepRejectionReason =
  | 'half_rep_depth_not_reached'
  | 'bottom_dwell_too_short'
  | 'angles_unavailable'
  | 'visibility_lost'
  | 'duration_too_short'
  | 'duration_too_long'
  | 'not_initialized_from_standing';

/**
 * Outcome bucket for a completed-or-discarded attempt. Phase 20 only
 * emits these four — `counted` for full reps that pass the engine's
 * hysteresis, the other three for the three discard paths.
 */
export type ExerciseRepStatus =
  | 'counted'
  | 'rejected_half_rep'
  | 'rejected_visibility'
  | 'rejected_unstable_angles';

/**
 * Base fields shared by every concrete `*RepResult`. Per-exercise
 * engines extend this with sport-specific metrics (e.g. squat depth
 * angle, push-up elbow angle).
 *
 * `formScore` is intentionally `null` in Phase 20. The field exists for
 * forward compatibility with Phase 21 form scoring but never carries a
 * fabricated value here — see `docs/CODING_STANDARDS.md` Phase 20 rules.
 */
export type ExerciseRepResultBase = {
  engineId: ExerciseEngineId;
  repNumber: number;
  startedAtMs: number;
  completedAtMs: number;
  durationMs: number;
  status: ExerciseRepStatus;
  counted: boolean;
  rejectionReason?: ExerciseRepRejectionReason;
  /** Deferred to Phase 21 — always `null` in Phase 20. */
  formScore: number | null;
};

/**
 * Generic per-frame output envelope. Concrete engines tighten this with
 * their own `state` / `debug` shapes.
 */
export type ExerciseFrameResult<TState extends string, TDebug, TRepResult> = {
  engineId: ExerciseEngineId;
  status: ExerciseEngineStatus;
  currentState: TState;
  previousState: TState | null;
  /** True only on the frame the engine transitions into a new state. */
  didTransition: boolean;
  /** Cumulative valid rep count since the last reset. */
  repCount: number;
  /** Latest counted rep, if one just completed on this frame. */
  latestCountedRep: TRepResult | null;
  /** Latest rejected rep, if one was discarded on this frame. */
  latestRejectedRep: TRepResult | null;
  /** Debug-only metrics used by the engine for this frame. */
  debug: TDebug;
  /**
   * Optional reason the engine emitted no useful output this frame
   * (e.g. required angles were unavailable). UI may surface this in
   * debug copy — never as user-facing form feedback.
   */
  unavailableReason?: ExerciseRepRejectionReason;
};

/**
 * Generic engine-wide debug view. Concrete engines expose their own
 * `ExerciseEngineDebugState`-shaped object for the debug panel.
 */
export type ExerciseEngineDebugState<TState extends string, TDebug, TRepResult> = {
  engineId: ExerciseEngineId;
  status: ExerciseEngineStatus;
  currentState: TState;
  repCount: number;
  latestCountedRep: TRepResult | null;
  latestRejectedRep: TRepResult | null;
  debug: TDebug;
};

/**
 * Lightweight stats summary — frame counts only. Phase 20 deliberately
 * does not measure per-frame engine overhead in store-visible stats;
 * the engine is sub-millisecond and we don't want to flood the store
 * with new fields just to confirm that.
 */
export type ExerciseEngineStats = {
  framesProcessed: number;
  framesSkipped: number;
  countedReps: number;
  rejectedReps: number;
};
