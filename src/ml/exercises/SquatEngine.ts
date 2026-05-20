/**
 * Phase 20 — Bodyweight squat rep state machine.
 *
 * Consumes Phase 19 `AngleSnapshot`s frame-by-frame and emits a
 * `SquatFrameResult` per frame. Counts only full reps that complete
 * the cycle STANDING → DESCENDING → BOTTOM (≥ 15-frame dwell) →
 * ASCENDING → STANDING. Rejects half-reps and other clearly-not-a-rep
 * paths with a typed reason — never silently undercounts.
 *
 * Phase 20 boundary (strictly enforced):
 * - No form score. `formScore` on every emitted rep is `null`.
 * - No coaching cues, no toast / voice / haptic side-effects.
 * - No "good form" / "bad form" labels.
 * - No persistence — engine state lives in memory only and resets on
 *   `reset()`, on no-snapshot frames sustained, or when the consumer
 *   destroys the engine.
 * - Pure TypeScript — no React, no DOM, no camera, no MediaPipe, no
 *   storage, no logging.
 */

import {
  DEFAULT_SQUAT_ENGINE_CONFIG,
  bottomThresholdForDifficulty,
} from '@ml/exercises/squat-config';
import {
  averageNonNull,
  getAverageKneeAngle,
  getLeftKneeDegrees,
  getLeftKneeValgusRatio,
  getMaxValgusRatio,
  getRightKneeDegrees,
  getRightKneeValgusRatio,
  getTrunkDegrees,
  kneesAboveStanding,
  kneesBelowBottom,
  safeMaxByMagnitude,
  safeMin,
} from '@ml/exercises/squat-utils';
import type { AngleSnapshot } from '@/types/angles';
import type {
  ExerciseEngineStats,
  ExerciseEngineStatus,
  ExerciseRepRejectionReason,
} from '@/types/exercise';
import type {
  SquatDepthStatus,
  SquatDifficulty,
  SquatEngineConfig,
  SquatEngineDebugState,
  SquatFrameDebug,
  SquatFrameResult,
  SquatRepResult,
  SquatState,
  SquatStateTransition,
} from '@/types/squat';

export type SquatEngineOptions = {
  config?: Partial<SquatEngineConfig>;
  difficulty?: SquatDifficulty;
};

/**
 * Caps on rep accumulator arrays. Trunk / valgus samples are collected
 * across the rep so we can emit honest averages / maxes; we bound them
 * so a long stall in BOTTOM doesn't grow unbounded memory before the
 * engine rejects the rep via `maxRepDurationMs`.
 */
const REP_SAMPLE_CAP = 512;

/**
 * Frames without an angle snapshot before the engine drops back to
 * `waiting-for-pose` and discards the current rep. Short enough that
 * a person stepping out of frame can't bank a fake bottom dwell,
 * long enough that a single occluded frame doesn't blow up an
 * otherwise-clean rep.
 */
const NO_POSE_GRACE_FRAMES = 5;

type ActiveRepBuffer = {
  startedAtMs: number;
  bottomFrameCount: number;
  bottomKneeAngleDegrees: number | null;
  minLeftKneeAngleDegrees: number | null;
  minRightKneeAngleDegrees: number | null;
  trunkSamples: number[];
  maxLeftKneeValgusRatio: number | null;
  maxRightKneeValgusRatio: number | null;
  reachedBottom: boolean;
  difficulty: SquatDifficulty;
  bottomThresholdDegrees: number;
  intermediateBottomReached: boolean;
  beginnerBottomReached: boolean;
};

function emptyDebug(difficulty: SquatDifficulty): SquatFrameDebug {
  return {
    difficulty,
    averageKneeAngleDegrees: null,
    leftKneeAngleDegrees: null,
    rightKneeAngleDegrees: null,
    trunkAngleDegrees: null,
    leftKneeValgusRatio: null,
    rightKneeValgusRatio: null,
    depthStatus: 'unknown',
    bottomDwellFrames: 0,
  };
}

export class SquatEngine {
  private readonly config: SquatEngineConfig;
  private difficulty: SquatDifficulty;
  private bottomThresholdDegrees: number;

  private state: SquatState = 'STANDING';
  private previousState: SquatState | null = null;
  private status: ExerciseEngineStatus = 'waiting-for-pose';
  private initializedFromStanding = false;

  private activeRep: ActiveRepBuffer | null = null;
  private repCount = 0;
  private framesProcessed = 0;
  private framesSkipped = 0;
  private countedReps = 0;
  private rejectedReps = 0;

  private noPoseStreak = 0;
  private lastFrameId: number | null = null;

  private latestCountedRep: SquatRepResult | null = null;
  private latestRejectedRep: SquatRepResult | null = null;
  private lastTransition: SquatStateTransition | null = null;
  private lastDebug: SquatFrameDebug;

  constructor(options: SquatEngineOptions = {}) {
    this.config = { ...DEFAULT_SQUAT_ENGINE_CONFIG, ...options.config };
    this.difficulty = options.difficulty ?? this.config.defaultDifficulty;
    this.bottomThresholdDegrees = bottomThresholdForDifficulty(this.difficulty, this.config);
    this.lastDebug = emptyDebug(this.difficulty);
  }

  /** Cumulative valid rep count since the last `reset()`. */
  getRepCount(): number {
    return this.repCount;
  }

  /** Current squat state (or `STANDING` before initialization). */
  getCurrentState(): SquatState {
    return this.state;
  }

  /** Live debug snapshot for the panel even when no rep is mid-flight. */
  getDebugState(): SquatEngineDebugState {
    return {
      engineId: 'squat',
      status: this.status,
      currentState: this.state,
      repCount: this.repCount,
      latestCountedRep: this.latestCountedRep,
      latestRejectedRep: this.latestRejectedRep,
      debug: this.lastDebug,
    };
  }

  /** Lightweight per-engine stats (frame counts). */
  getStats(): ExerciseEngineStats {
    return {
      framesProcessed: this.framesProcessed,
      framesSkipped: this.framesSkipped,
      countedReps: this.countedReps,
      rejectedReps: this.rejectedReps,
    };
  }

  /** Most recent transition observed, or `null`. */
  getLastTransition(): SquatStateTransition | null {
    return this.lastTransition;
  }

  /** Active difficulty (controls the bottom-depth threshold). */
  getDifficulty(): SquatDifficulty {
    return this.difficulty;
  }

  /**
   * Switch difficulty mid-session. Cancels any in-progress rep so a
   * threshold change can't half-count an attempt that was framed under
   * the old threshold.
   */
  setDifficulty(next: SquatDifficulty): void {
    if (next === this.difficulty) {
      return;
    }
    this.difficulty = next;
    this.bottomThresholdDegrees = bottomThresholdForDifficulty(next, this.config);
    this.activeRep = null;
    this.lastDebug = { ...this.lastDebug, difficulty: next };
  }

  /**
   * Drop every accumulator. Called when pose debug stops, the user
   * leaves the route, the workout changes, or the user taps "Reset".
   */
  reset(): void {
    this.state = 'STANDING';
    this.previousState = null;
    this.status = 'waiting-for-pose';
    this.initializedFromStanding = false;
    this.activeRep = null;
    this.repCount = 0;
    this.framesProcessed = 0;
    this.framesSkipped = 0;
    this.countedReps = 0;
    this.rejectedReps = 0;
    this.noPoseStreak = 0;
    this.lastFrameId = null;
    this.latestCountedRep = null;
    this.latestRejectedRep = null;
    this.lastTransition = null;
    this.lastDebug = emptyDebug(this.difficulty);
  }

  /**
   * Process a single frame. Passing `null` represents "no angle
   * snapshot this tick" (no pose detected, occluded, etc.). The engine
   * never invents angle data; it tracks a short no-pose streak and
   * discards any in-flight rep once that streak crosses
   * `NO_POSE_GRACE_FRAMES`.
   */
  process(snapshot: AngleSnapshot | null): SquatFrameResult {
    if (snapshot === null) {
      return this.processNoSnapshot();
    }

    if (this.lastFrameId !== null && snapshot.frameId === this.lastFrameId) {
      // Same frame seen twice — don't double-count.
      this.framesSkipped += 1;
      return this.buildFrameResult(null, null, undefined);
    }
    this.lastFrameId = snapshot.frameId;
    this.framesProcessed += 1;
    this.noPoseStreak = 0;

    const debug = this.buildDebug(snapshot);
    this.lastDebug = debug;

    const leftKnee = getLeftKneeDegrees(snapshot);
    const rightKnee = getRightKneeDegrees(snapshot);
    const kneesAvailable = leftKnee !== null && rightKnee !== null;

    if (!kneesAvailable) {
      // Knees are the load-bearing signal for the squat engine — abort
      // any in-progress rep and wait for both sides to be readable.
      const rejected = this.discardActiveRep(
        'angles_unavailable',
        'rejected_unstable_angles',
        snapshot.timestampMs,
      );
      this.status = 'waiting-for-pose';
      return this.buildFrameResult(null, rejected, 'angles_unavailable');
    }

    if (this.config.visibilityRequired && !this.areRequiredAnglesVisible(snapshot)) {
      const rejected = this.discardActiveRep(
        'visibility_lost',
        'rejected_visibility',
        snapshot.timestampMs,
      );
      this.status = 'waiting-for-pose';
      return this.buildFrameResult(null, rejected, 'visibility_lost');
    }

    // Initialization: don't start counting reps until the user is
    // standing tall. Starting from crouched should NOT count the
    // first stand-up as rep 1.
    if (!this.initializedFromStanding) {
      if (kneesAboveStanding(snapshot, this.config)) {
        this.initializedFromStanding = true;
        this.state = 'STANDING';
        this.previousState = null;
        this.status = 'running';
      } else {
        this.status = 'initializing';
        return this.buildFrameResult(null, null, 'not_initialized_from_standing');
      }
    } else {
      this.status = 'running';
    }

    const previous = this.state;
    let counted: SquatRepResult | null = null;
    let rejected: SquatRepResult | null = null;

    switch (this.state) {
      case 'STANDING': {
        if (
          leftKnee < this.config.standingKneeAngleDegrees ||
          rightKnee < this.config.standingKneeAngleDegrees
        ) {
          this.beginRep(snapshot.timestampMs);
          this.transitionTo('DESCENDING', snapshot.timestampMs, snapshot.frameId);
        }
        break;
      }
      case 'DESCENDING': {
        this.recordRepSample(snapshot);
        if (kneesBelowBottom(snapshot, this.bottomThresholdDegrees)) {
          this.markBottomReached(snapshot);
          this.transitionTo('BOTTOM', snapshot.timestampMs, snapshot.frameId);
        } else if (kneesAboveStanding(snapshot, this.config)) {
          // Bounced back up without ever reaching bottom — half rep.
          rejected = this.discardActiveRep(
            'half_rep_depth_not_reached',
            'rejected_half_rep',
            snapshot.timestampMs,
          );
          this.transitionTo('STANDING', snapshot.timestampMs, snapshot.frameId);
        }
        break;
      }
      case 'BOTTOM': {
        this.recordRepSample(snapshot);
        this.recordBottomFrame(snapshot);
        const avgKnee = getAverageKneeAngle(snapshot);
        if (avgKnee !== null && avgKnee > this.bottomThresholdDegrees) {
          this.transitionTo('ASCENDING', snapshot.timestampMs, snapshot.frameId);
        }
        break;
      }
      case 'ASCENDING': {
        this.recordRepSample(snapshot);
        if (kneesAboveStanding(snapshot, this.config)) {
          counted = this.completeRep(snapshot.timestampMs);
          if (counted === null) {
            // Returned to standing but the rep failed validation
            // (e.g. bottom dwell too short). Engine has already
            // recorded the rejection inside `completeRep`.
          }
          this.transitionTo('STANDING', snapshot.timestampMs, snapshot.frameId);
        } else if (kneesBelowBottom(snapshot, this.bottomThresholdDegrees)) {
          // User went back down before finishing the rep — re-enter
          // BOTTOM and keep accumulating.
          this.recordBottomFrame(snapshot);
          this.transitionTo('BOTTOM', snapshot.timestampMs, snapshot.frameId);
        }
        break;
      }
      case 'COMPLETE':
        // Phase 20 never permanently parks the engine in COMPLETE; this
        // case is reserved for future workouts with a target rep count.
        break;
    }

    if (counted !== null) {
      rejected = null;
    }

    return this.buildFrameResult(counted, rejected, undefined, previous !== this.state);
  }

  // ------------------------------------------------------------------
  // Internal helpers
  // ------------------------------------------------------------------

  private processNoSnapshot(): SquatFrameResult {
    this.framesSkipped += 1;
    this.noPoseStreak += 1;
    this.status = 'waiting-for-pose';
    if (this.noPoseStreak > NO_POSE_GRACE_FRAMES) {
      const rejected = this.discardActiveRep('visibility_lost', 'rejected_visibility', Date.now());
      this.state = 'STANDING';
      this.previousState = null;
      this.initializedFromStanding = false;
      this.lastDebug = emptyDebug(this.difficulty);
      return this.buildFrameResult(null, rejected, 'visibility_lost');
    }
    return this.buildFrameResult(null, null, 'visibility_lost');
  }

  private areRequiredAnglesVisible(snapshot: AngleSnapshot): boolean {
    return snapshot.leftKnee.status === 'available' && snapshot.rightKnee.status === 'available';
  }

  private beginRep(timestampMs: number): void {
    this.activeRep = {
      startedAtMs: timestampMs,
      bottomFrameCount: 0,
      bottomKneeAngleDegrees: null,
      minLeftKneeAngleDegrees: null,
      minRightKneeAngleDegrees: null,
      trunkSamples: [],
      maxLeftKneeValgusRatio: null,
      maxRightKneeValgusRatio: null,
      reachedBottom: false,
      difficulty: this.difficulty,
      bottomThresholdDegrees: this.bottomThresholdDegrees,
      intermediateBottomReached: false,
      beginnerBottomReached: false,
    };
  }

  private recordRepSample(snapshot: AngleSnapshot): void {
    if (this.activeRep === null) {
      return;
    }
    const left = getLeftKneeDegrees(snapshot);
    const right = getRightKneeDegrees(snapshot);
    if (left !== null) {
      this.activeRep.minLeftKneeAngleDegrees = safeMin(
        this.activeRep.minLeftKneeAngleDegrees,
        left,
      );
    }
    if (right !== null) {
      this.activeRep.minRightKneeAngleDegrees = safeMin(
        this.activeRep.minRightKneeAngleDegrees,
        right,
      );
    }
    const trunk = getTrunkDegrees(snapshot);
    if (trunk !== null && this.activeRep.trunkSamples.length < REP_SAMPLE_CAP) {
      this.activeRep.trunkSamples.push(trunk);
    }
    const leftValgus = getLeftKneeValgusRatio(snapshot);
    if (leftValgus !== null) {
      this.activeRep.maxLeftKneeValgusRatio = safeMaxByMagnitude(
        this.activeRep.maxLeftKneeValgusRatio,
        leftValgus,
      );
    }
    const rightValgus = getRightKneeValgusRatio(snapshot);
    if (rightValgus !== null) {
      this.activeRep.maxRightKneeValgusRatio = safeMaxByMagnitude(
        this.activeRep.maxRightKneeValgusRatio,
        rightValgus,
      );
    }

    // Track each difficulty threshold separately so depth-status copy
    // stays honest even when we're running beginner mode.
    const left2 = left;
    const right2 = right;
    if (
      left2 !== null &&
      right2 !== null &&
      left2 < this.config.beginnerBottomKneeAngleDegrees &&
      right2 < this.config.beginnerBottomKneeAngleDegrees
    ) {
      this.activeRep.beginnerBottomReached = true;
    }
    if (
      left2 !== null &&
      right2 !== null &&
      left2 < this.config.intermediateBottomKneeAngleDegrees &&
      right2 < this.config.intermediateBottomKneeAngleDegrees
    ) {
      this.activeRep.intermediateBottomReached = true;
    }
  }

  private markBottomReached(snapshot: AngleSnapshot): void {
    if (this.activeRep === null) {
      return;
    }
    this.activeRep.reachedBottom = true;
    this.recordBottomFrame(snapshot);
  }

  private recordBottomFrame(snapshot: AngleSnapshot): void {
    if (this.activeRep === null) {
      return;
    }
    this.activeRep.bottomFrameCount += 1;
    const avgKnee = getAverageKneeAngle(snapshot);
    if (avgKnee !== null) {
      this.activeRep.bottomKneeAngleDegrees = safeMin(
        this.activeRep.bottomKneeAngleDegrees,
        avgKnee,
      );
    }
  }

  private completeRep(timestampMs: number): SquatRepResult | null {
    if (this.activeRep === null) {
      return null;
    }
    const rep = this.activeRep;
    const duration = timestampMs - rep.startedAtMs;

    if (!rep.reachedBottom) {
      return this.finalizeRejected('half_rep_depth_not_reached', timestampMs, 'rejected_half_rep');
    }
    if (rep.bottomFrameCount < this.config.minimumBottomDwellFrames) {
      return this.finalizeRejected('bottom_dwell_too_short', timestampMs, 'rejected_half_rep');
    }
    if (duration < this.config.minRepDurationMs) {
      return this.finalizeRejected('duration_too_short', timestampMs, 'rejected_half_rep');
    }
    if (duration > this.config.maxRepDurationMs) {
      return this.finalizeRejected('duration_too_long', timestampMs, 'rejected_half_rep');
    }

    const counted: SquatRepResult = {
      engineId: 'squat',
      repNumber: this.repCount + 1,
      startedAtMs: rep.startedAtMs,
      completedAtMs: timestampMs,
      durationMs: duration,
      status: 'counted',
      counted: true,
      formScore: null,
      difficulty: rep.difficulty,
      quality: 'counted',
      bottomFrameCount: rep.bottomFrameCount,
      bottomKneeAngleDegrees: rep.bottomKneeAngleDegrees,
      minLeftKneeAngleDegrees: rep.minLeftKneeAngleDegrees,
      minRightKneeAngleDegrees: rep.minRightKneeAngleDegrees,
      averageTrunkAngleDegrees: averageNonNull(rep.trunkSamples),
      maxLeftKneeValgusRatio: rep.maxLeftKneeValgusRatio,
      maxRightKneeValgusRatio: rep.maxRightKneeValgusRatio,
    };

    this.repCount += 1;
    this.countedReps += 1;
    this.latestCountedRep = counted;
    this.activeRep = null;
    return counted;
  }

  private finalizeRejected(
    reason: ExerciseRepRejectionReason,
    timestampMs: number,
    status: 'rejected_half_rep' | 'rejected_visibility' | 'rejected_unstable_angles',
  ): SquatRepResult {
    if (this.activeRep === null) {
      // Synthesize a minimal rejected rep so the debug UI still has
      // something honest to display when nothing was being tracked yet.
      const rejected: SquatRepResult = {
        engineId: 'squat',
        repNumber: this.repCount + 1,
        startedAtMs: timestampMs,
        completedAtMs: timestampMs,
        durationMs: 0,
        status,
        counted: false,
        rejectionReason: reason,
        formScore: null,
        difficulty: this.difficulty,
        quality: status,
        bottomFrameCount: 0,
        bottomKneeAngleDegrees: null,
        minLeftKneeAngleDegrees: null,
        minRightKneeAngleDegrees: null,
        averageTrunkAngleDegrees: null,
        maxLeftKneeValgusRatio: null,
        maxRightKneeValgusRatio: null,
      };
      this.rejectedReps += 1;
      this.latestRejectedRep = rejected;
      return rejected;
    }
    const rep = this.activeRep;
    const rejected: SquatRepResult = {
      engineId: 'squat',
      repNumber: this.repCount + 1,
      startedAtMs: rep.startedAtMs,
      completedAtMs: timestampMs,
      durationMs: timestampMs - rep.startedAtMs,
      status,
      counted: false,
      rejectionReason: reason,
      formScore: null,
      difficulty: rep.difficulty,
      quality: status,
      bottomFrameCount: rep.bottomFrameCount,
      bottomKneeAngleDegrees: rep.bottomKneeAngleDegrees,
      minLeftKneeAngleDegrees: rep.minLeftKneeAngleDegrees,
      minRightKneeAngleDegrees: rep.minRightKneeAngleDegrees,
      averageTrunkAngleDegrees: averageNonNull(rep.trunkSamples),
      maxLeftKneeValgusRatio: rep.maxLeftKneeValgusRatio,
      maxRightKneeValgusRatio: rep.maxRightKneeValgusRatio,
    };
    this.rejectedReps += 1;
    this.latestRejectedRep = rejected;
    this.activeRep = null;
    return rejected;
  }

  private discardActiveRep(
    reason: ExerciseRepRejectionReason,
    status: 'rejected_half_rep' | 'rejected_visibility' | 'rejected_unstable_angles',
    timestampMs: number,
  ): SquatRepResult | null {
    if (this.activeRep === null) {
      return null;
    }
    return this.finalizeRejected(reason, timestampMs, status);
  }

  private transitionTo(next: SquatState, atMs: number, frameId: number): void {
    if (next === this.state) {
      return;
    }
    this.previousState = this.state;
    this.state = next;
    this.lastTransition = {
      from: this.previousState,
      to: next,
      atMs,
      frameId,
    };
  }

  private buildDebug(snapshot: AngleSnapshot): SquatFrameDebug {
    const left = getLeftKneeDegrees(snapshot);
    const right = getRightKneeDegrees(snapshot);
    const trunk = getTrunkDegrees(snapshot);
    const leftValgus = getLeftKneeValgusRatio(snapshot);
    const rightValgus = getRightKneeValgusRatio(snapshot);
    const average = getAverageKneeAngle(snapshot);
    const maxValgus = getMaxValgusRatio(snapshot);
    void maxValgus; // reserved for Phase 21 cues; surfaced only via per-rep result

    const depthStatus = this.computeDepthStatus(left, right);
    return {
      difficulty: this.difficulty,
      averageKneeAngleDegrees: average,
      leftKneeAngleDegrees: left,
      rightKneeAngleDegrees: right,
      trunkAngleDegrees: trunk,
      leftKneeValgusRatio: leftValgus,
      rightKneeValgusRatio: rightValgus,
      depthStatus,
      bottomDwellFrames: this.activeRep === null ? 0 : this.activeRep.bottomFrameCount,
    };
  }

  private computeDepthStatus(left: number | null, right: number | null): SquatDepthStatus {
    if (left === null || right === null) {
      return 'unknown';
    }
    if (
      left < this.config.intermediateBottomKneeAngleDegrees &&
      right < this.config.intermediateBottomKneeAngleDegrees
    ) {
      return 'reached_intermediate_depth';
    }
    if (
      left < this.config.beginnerBottomKneeAngleDegrees &&
      right < this.config.beginnerBottomKneeAngleDegrees
    ) {
      return 'reached_beginner_depth';
    }
    return 'above_depth';
  }

  private buildFrameResult(
    counted: SquatRepResult | null,
    rejected: SquatRepResult | null,
    unavailableReason: ExerciseRepRejectionReason | undefined,
    didTransition: boolean = false,
  ): SquatFrameResult {
    return {
      engineId: 'squat',
      status: this.status,
      currentState: this.state,
      previousState: this.previousState,
      didTransition,
      repCount: this.repCount,
      latestCountedRep: counted,
      latestRejectedRep: rejected,
      debug: this.lastDebug,
      ...(unavailableReason !== undefined ? { unavailableReason } : {}),
    };
  }
}
