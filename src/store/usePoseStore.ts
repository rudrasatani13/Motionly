/**
 * Phase 17 + 18 + 19 — Pose inference + processing + angle Zustand store.
 *
 * Holds **only**:
 * - The latest emitted raw `PoseFrame` (or `null`).
 * - The latest `ProcessedPoseFrame` from the Phase 18 pipeline.
 * - The latest Phase 19 `AngleSnapshot` (or `null`).
 * - Live Phase 19 angle calculation stats (per-frame ms, history size).
 * - The current high-level inference status.
 * - Live inference performance stats (FPS, last/average inference ms).
 * - Live Phase 18 processing stats (smoothing/filtering/normalization
 *   timings, processed/dropped frame counts).
 * - The latest Phase 18 visibility report (mean/key visibility).
 * - The current Phase 18 processing config.
 * - The active model variant and delegate.
 * - The most recent recoverable error.
 *
 * It deliberately does **not** keep landmark history, the full
 * `AngleHistory` ring buffer (that lives inside the angle processor),
 * rep state, form scores, calories, workout session records, or
 * anything that would create the false impression of a real workout
 * session.
 *
 * Persistence: none. The store keeps everything in memory and resets
 * on unmount. No localStorage, no IndexedDB, no network sync.
 */

import { create } from 'zustand';

import { emptyAngleStats } from '@ml/angles';
import { DEFAULT_POSE_PROCESSING_CONFIG } from '@ml/pose/pose-processing-config';
import { EMPTY_PROCESSING_STATS } from '@ml/pose/processPoseFrame';
import type { AngleCalculationStats, AngleSnapshot } from '@/types/angles';
import type {
  BodyVisibilityStatus,
  PoseDelegate,
  PoseFrame,
  PoseInferenceError,
  PoseInferenceStats,
  PoseInferenceStatus,
  PoseModelVariant,
  PoseProcessingConfig,
  PoseProcessingStats,
  PoseVisibilityReport,
  ProcessedPoseFrame,
} from '@/types/pose';

const EMPTY_STATS: PoseInferenceStats = {
  fps: 0,
  lastInferenceMs: 0,
  averageInferenceMs: 0,
  framesProcessed: 0,
  framesSkipped: 0,
  modelLoadMs: null,
};

const EMPTY_VISIBILITY_REPORT: PoseVisibilityReport = {
  bodyVisibilityScore: 0,
  isBodyFullyVisible: false,
  visibleLandmarkCount: 0,
  evaluatedLandmarkCount: 0,
  occludedKeyLandmarks: [],
  occludedLandmarks: [],
  keyLandmarkVisibility: [],
};

export type PoseStoreState = {
  status: PoseInferenceStatus;
  latestFrame: PoseFrame | null;
  latestProcessedFrame: ProcessedPoseFrame | null;
  latestAngleSnapshot: AngleSnapshot | null;
  angleStats: AngleCalculationStats;
  stats: PoseInferenceStats;
  processingStats: PoseProcessingStats;
  visibilityReport: PoseVisibilityReport;
  bodyVisibilityStatus: BodyVisibilityStatus;
  processingConfig: PoseProcessingConfig;
  error: PoseInferenceError | null;
  modelVariant: PoseModelVariant | null;
  delegate: PoseDelegate | null;
};

export type PoseStoreActions = {
  setStatus: (status: PoseInferenceStatus) => void;
  setLatestFrame: (frame: PoseFrame | null) => void;
  setLatestProcessedFrame: (frame: ProcessedPoseFrame | null) => void;
  setLatestAngleSnapshot: (snapshot: AngleSnapshot | null) => void;
  setAngleStats: (stats: AngleCalculationStats) => void;
  setStats: (stats: PoseInferenceStats) => void;
  setProcessingStats: (stats: PoseProcessingStats) => void;
  setVisibilityReport: (report: PoseVisibilityReport) => void;
  setBodyVisibilityStatus: (status: BodyVisibilityStatus) => void;
  setProcessingConfig: (config: PoseProcessingConfig) => void;
  setError: (error: PoseInferenceError | null) => void;
  setModelVariant: (variant: PoseModelVariant | null) => void;
  setDelegate: (delegate: PoseDelegate | null) => void;
  resetPoseState: () => void;
};

export type PoseStore = PoseStoreState & PoseStoreActions;

const EMPTY_ANGLE_STATS: AngleCalculationStats = emptyAngleStats();

const initialState: PoseStoreState = {
  status: 'idle',
  latestFrame: null,
  latestProcessedFrame: null,
  latestAngleSnapshot: null,
  angleStats: { ...EMPTY_ANGLE_STATS },
  stats: EMPTY_STATS,
  processingStats: { ...EMPTY_PROCESSING_STATS },
  visibilityReport: EMPTY_VISIBILITY_REPORT,
  bodyVisibilityStatus: 'unknown',
  processingConfig: { ...DEFAULT_POSE_PROCESSING_CONFIG },
  error: null,
  modelVariant: null,
  delegate: null,
};

export const usePoseStore = create<PoseStore>((set) => ({
  ...initialState,

  setStatus: (status) => {
    set({ status });
  },

  setLatestFrame: (frame) => {
    set({ latestFrame: frame });
  },

  setLatestProcessedFrame: (frame) => {
    set({ latestProcessedFrame: frame });
  },

  setLatestAngleSnapshot: (snapshot) => {
    set({ latestAngleSnapshot: snapshot });
  },

  setAngleStats: (angleStats) => {
    set({ angleStats });
  },

  setStats: (stats) => {
    set({ stats });
  },

  setProcessingStats: (processingStats) => {
    set({ processingStats });
  },

  setVisibilityReport: (visibilityReport) => {
    set({ visibilityReport });
  },

  setBodyVisibilityStatus: (bodyVisibilityStatus) => {
    set({ bodyVisibilityStatus });
  },

  setProcessingConfig: (processingConfig) => {
    set({ processingConfig });
  },

  setError: (error) => {
    set({ error });
  },

  setModelVariant: (variant) => {
    set({ modelVariant: variant });
  },

  setDelegate: (delegate) => {
    set({ delegate });
  },

  resetPoseState: () => {
    set({
      ...initialState,
      processingConfig: { ...DEFAULT_POSE_PROCESSING_CONFIG },
      angleStats: { ...EMPTY_ANGLE_STATS },
    });
  },
}));
