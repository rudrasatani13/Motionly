# `public/models/`

MediaPipe Pose Landmarker model files used by the Phase 17 on-device pose
inference pipeline. Files placed here are reachable at `/models/...` at
runtime.

## Files

| File                        | Variant | Use                                                             |
| --------------------------- | ------- | --------------------------------------------------------------- |
| `pose_landmarker_lite.task` | Lite    | Default mobile-friendly model (lower latency, smaller download) |
| `pose_landmarker_full.task` | Full    | Optional higher-accuracy model for capable devices              |

Both files are official MediaPipe / Google AI Edge model assets:

- Lite: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task`
- Full: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task`

## Caching & offline behavior

- The service worker (`vite.config.ts → workbox.runtimeCaching`) caches
  `/models/*` with a `CacheFirst` strategy so pose inference works offline
  **after the first successful load** of a given model file.
- The first load needs a network connection. If a user opens Motionly
  offline before the model has ever been cached, Phase 17 surfaces an
  honest model-unavailable message instead of pretending inference works.

## Rules

- Use official MediaPipe / Google AI Edge model files only.
- Do not commit placeholder, fake, or renamed `.task` files.
- Do not load from a remote CDN at runtime — Motionly serves models from
  `/models/...` so the service worker can own caching, offline behavior,
  and the on-device privacy promise.
- Do not store video frames, landmarks, or any user-derived data in this
  directory. It is a static asset folder.
