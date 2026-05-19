# `public/audio/cues/`

Reserved for **short voice cue audio files** (encouragement, rep counts, form corrections).

## Status

Intentionally empty. Real cues are added in **Phase 25 — Voice Feedback** of `MOTIONLY_MASTER_PLAN.md`.

## Notes

- Files placed here are reachable at `/audio/cues/...` at runtime
- The service worker is configured (`vite.config.ts → workbox.runtimeCaching`) to cache `/audio/*` requests with a `CacheFirst` strategy so cues play offline after first load
- Do **not** commit fake / placeholder audio files
- Real audio (MP3 / Opus) ships in Phase 25 alongside the voice adapter in `src/platform/`
