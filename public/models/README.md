# `public/models/`

Reserved for **MediaPipe Pose Landmarker model files** (e.g. `pose_landmarker_lite.task`, `pose_landmarker_full.task`).

## Status

Intentionally empty. Models are added in **Phase 17 — MediaPipe Pose Landmarker Integration** of `MOTIONLY_MASTER_PLAN.md`.

## Notes

- Files placed here are reachable at `/models/...` at runtime
- The service worker is configured (`vite.config.ts → workbox.runtimeCaching`) to cache `/models/*` requests with a `CacheFirst` strategy so models work offline after first load
- Do **not** commit placeholder / fake model files
- Real model assets will likely be added via Git LFS or downloaded on demand from a trusted CDN — that decision belongs to Phase 17
