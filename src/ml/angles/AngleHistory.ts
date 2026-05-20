/**
 * Phase 19 — Bounded angle snapshot history (ring buffer).
 *
 * Holds the last `capacity` `AngleSnapshot`s (default 30 ≈ ~1s at
 * 25–30 FPS) for debug display and as a foundation for future
 * Phase 20+ smoothing / state-machine logic. Critically:
 *
 * - **Bounded.** Implemented as a circular ring buffer. The total
 *   number of stored snapshots never exceeds `capacity`, no matter how
 *   long inference runs.
 * - **No persistence.** Lives in memory only. Never writes to
 *   `localStorage`, `IndexedDB`, the network, or any file. Discarded
 *   on `reset()` / unmount / model restart / pose stop.
 * - **No derived state.** The history does not compute averages, rep
 *   state, form scores, or cues. Those layers (if/when they exist)
 *   build on top.
 */

import { DEFAULT_ANGLE_HISTORY_CAPACITY } from '@ml/angles/angle-config';
import type { AngleHistoryEntry, AngleHistoryState, AngleSnapshot } from '@/types/angles';

export type AngleHistoryConfig = {
  capacity?: number;
};

export class AngleHistory {
  private readonly capacityValue: number;
  private readonly entries: Array<AngleHistoryEntry | undefined>;
  private head = 0;
  private count = 0;

  constructor(config: AngleHistoryConfig = {}) {
    const requested = config.capacity;
    const capacity =
      typeof requested === 'number' && Number.isFinite(requested) && requested > 0
        ? Math.floor(requested)
        : DEFAULT_ANGLE_HISTORY_CAPACITY;
    this.capacityValue = capacity;
    this.entries = new Array<AngleHistoryEntry | undefined>(capacity);
  }

  /** Append a new snapshot. Overwrites the oldest entry once full. */
  push(snapshot: AngleSnapshot): void {
    this.entries[this.head] = {
      pushedAtMs:
        typeof performance !== 'undefined' && typeof performance.now === 'function'
          ? performance.now()
          : Date.now(),
      snapshot,
    };
    this.head = (this.head + 1) % this.capacityValue;
    if (this.count < this.capacityValue) {
      this.count += 1;
    }
  }

  /** Most recent snapshot, or `null` if the buffer is empty. */
  latest(): AngleSnapshot | null {
    if (this.count === 0) {
      return null;
    }
    const lastIndex = (this.head - 1 + this.capacityValue) % this.capacityValue;
    const entry = this.entries[lastIndex];
    return entry?.snapshot ?? null;
  }

  /** All stored entries in insertion order (oldest first). */
  getAll(): ReadonlyArray<AngleHistoryEntry> {
    if (this.count === 0) {
      return [];
    }
    const result: AngleHistoryEntry[] = new Array(this.count);
    const start = (this.head - this.count + this.capacityValue) % this.capacityValue;
    for (let i = 0; i < this.count; i += 1) {
      const idx = (start + i) % this.capacityValue;
      const entry = this.entries[idx];
      if (entry !== undefined) {
        result[i] = entry;
      }
    }
    return result;
  }

  /**
   * The last `count` snapshots (newest last). Useful for future
   * trend / state-machine logic; Phase 19 itself does not call this.
   */
  getRecent(count: number): ReadonlyArray<AngleHistoryEntry> {
    if (!Number.isFinite(count) || count <= 0 || this.count === 0) {
      return [];
    }
    const limit = Math.min(Math.floor(count), this.count);
    const all = this.getAll();
    return all.slice(all.length - limit);
  }

  /** Drop every stored snapshot. */
  clear(): void {
    for (let i = 0; i < this.entries.length; i += 1) {
      this.entries[i] = undefined;
    }
    this.head = 0;
    this.count = 0;
  }

  /** Number of snapshots currently stored. */
  size(): number {
    return this.count;
  }

  /** Maximum number of snapshots this history can hold. */
  capacity(): number {
    return this.capacityValue;
  }

  /** Debug-friendly snapshot of the history's internal state. */
  toState(): AngleHistoryState {
    return {
      capacity: this.capacityValue,
      size: this.count,
      latest: this.latest(),
      entries: this.getAll(),
    };
  }
}
