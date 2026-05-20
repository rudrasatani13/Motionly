/**
 * Phase 17 — Pose inference Zustand store.
 *
 * Holds **only**:
 * - The latest emitted `PoseFrame` (or `null`).
 * - The current high-level inference status.
 * - Live performance stats (FPS, last/average inference ms).
 * - The active model variant and delegate.
 * - The most recent recoverable error.
 *
 * It deliberately does **not** keep landmark history, rep state,
 * smoothed/normalized landmarks, joint angles, form scores, calories,
 * workout session records, or anything that would create the false
 * impression of a real workout session in Phase 17.
 *
 * Persistence: none. Phase 17 keeps everything in memory and resets
 * on unmount. No localStorage, no IndexedDB, no network sync.
 */

import { create } from 'zustand';

import type {
  PoseDelegate,
  PoseFrame,
  PoseInferenceError,
  PoseInferenceStats,
  PoseInferenceStatus,
  PoseModelVariant,
} from '@/types/pose';

const EMPTY_STATS: PoseInferenceStats = {
  fps: 0,
  lastInferenceMs: 0,
  averageInferenceMs: 0,
  framesProcessed: 0,
  framesSkipped: 0,
  modelLoadMs: null,
};

export type PoseStoreState = {
  status: PoseInferenceStatus;
  latestFrame: PoseFrame | null;
  stats: PoseInferenceStats;
  error: PoseInferenceError | null;
  modelVariant: PoseModelVariant | null;
  delegate: PoseDelegate | null;
};

export type PoseStoreActions = {
  setStatus: (status: PoseInferenceStatus) => void;
  setLatestFrame: (frame: PoseFrame | null) => void;
  setStats: (stats: PoseInferenceStats) => void;
  setError: (error: PoseInferenceError | null) => void;
  setModelVariant: (variant: PoseModelVariant | null) => void;
  setDelegate: (delegate: PoseDelegate | null) => void;
  resetPoseState: () => void;
};

export type PoseStore = PoseStoreState & PoseStoreActions;

const initialState: PoseStoreState = {
  status: 'idle',
  latestFrame: null,
  stats: EMPTY_STATS,
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

  setStats: (stats) => {
    set({ stats });
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
    set(initialState);
  },
}));
