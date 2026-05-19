# `src/workers/`

Web Workers that run heavy compute off the main thread.

## What belongs here

- Pose-inference worker entry point (Phase 19) that imports MediaPipe wrappers from `src/ml/pose/`
- Future workers for other CPU-heavy tasks (batched analytics aggregation, etc.)
- Worker-side message contracts (typed `postMessage` payloads)

## What does NOT belong here

- DOM-touching code (workers have no DOM)
- Business logic — workers should be thin shells around `src/ml/` modules
- React components

## Why this folder exists

Pose inference must not block the UI thread. The worker isolates inference and the main thread receives only landmarks / events. Keeping workers in a dedicated folder makes the boundary explicit and the bundle splits predictable.

## Phase status

Reserved. The pose-inference worker is introduced in **Phase 19 — Web Worker for Pose Inference**. Empty by design.
