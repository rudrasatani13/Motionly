# `src/platform/`

Thin adapters for browser-only APIs. **The single chokepoint between feature code and the host platform.**

## What belongs here

- Camera adapter (`getUserMedia`, device enumeration) — Phase 16+
- TTS / voice adapter (`speechSynthesis` and/or audio cue playback) — Phase 25+
- Storage adapter (IndexedDB / `localStorage`) — Phase 30+
- Notifications adapter (Web Push / Notifications API) — Phase 44+
- Vibration / haptics adapter — `haptics.ts` (Phase 8)
- Wake Lock, fullscreen, permissions wrappers

## What does NOT belong here

- Anything that isn't a wrapper around a browser API
- React components — adapters return plain values, promises, or observables
- Domain logic — that's `src/services/`

## Why this folder exists (the rule)

> **All browser-only APIs go through interfaces in `src/platform/`.**

This is the **platform-adapter pattern**. Each adapter defines a TypeScript interface and a web implementation. When the app is later wrapped with Capacitor for a native shell, only the implementation file is swapped — every feature, hook, and page that calls the adapter keeps working unchanged.

If you find yourself reaching for `navigator.*`, `window.*`, `document.*`, or any browser global from a component, hook, page, or service: stop and add an adapter here first.

## Phase status

**Phase 8** added the first real adapter, `haptics.ts`, exposing a tiny `triggerLightHaptic()` helper around `navigator.vibrate(10)`. The `Button` primitive uses it through `@platform/haptics`; no component reaches for `navigator.vibrate` directly.

Remaining adapters arrive with their features: camera in Phase 16, voice in Phase 25, storage in Phase 30, notifications in Phase 44.
