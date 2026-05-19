# `src/assets/`

Static assets that are **imported by application code** (bundled and fingerprinted by Vite).

## What belongs here

- Brand SVGs or logos imported into React components
- Inline illustrations, icons, or sprite sheets used by UI components
- Font files used via `@fontsource` packages can stay in `node_modules`; only put fonts here if you serve a self-hosted file directly

## What does NOT belong here

- Files that must be reachable by **URL** (manifest icons, service-worker-cached models, audio cues, etc.) — those go in `public/` so the browser can fetch them directly
- ML model files — see `public/models/` (Phase 17)
- Voice cue audio — see `public/audio/cues/` (Phase 25)
- Generated build output

## Phase status

Reserved for use by the design system (Phase 5+) and individual feature phases. Currently empty by design — do not seed it with placeholder assets.
