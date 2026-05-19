# 07 — Camera Setup & Silhouette Guide

## Purpose

The highest-friction moment in the entire UX: helping a user prop their phone in a useful position, with the right lighting, and with their whole body in frame, in under 30 seconds. This screen is the last gate before `/workout/:id/active`.

## Route

`/workout/:id/setup` — wired in Phase 6 (`@pages/workout/CameraSetupPage`).

## Future implementation phase

**Phase 16 — Camera Permission & Setup Screen.**

## Entry points

- `/permissions` → on grant → `/workout/:id/setup`.
- "Back to setup" CTA on `/workout/:id/active` if the user pauses mid-session and wants to reframe.

## Exit points

- "View is clear — Start!" CTA → `/workout/:id/active`.
- Back → `/workouts/:id` (detail).
- "Get help" link → expandable troubleshooting drawer (stays on this route).
- Permission revoked mid-session (rare) → `/permissions`.

## Primary user action

Adjust phone position and lighting until the silhouette turns green; then tap **Start**.

## Secondary actions

- Expand the placement / lighting tips drawer.
- Toggle front / back camera (post-MVP — MVP uses front).
- Skip detection (advanced users with auto-passed checks — Phase 16 may not surface this in MVP).
- Pause voice guidance.

## Wireframe

```
┌──────────────────────────────────────┐
│  ←                                   │  ← back nav, transparent overlay
├──────────────────────────────────────┤
│                                      │
│                                      │
│           ┌─────────┐                │
│           │   o     │                │  ← live camera feed (background)
│           │  /|\\   │                │  ← silhouette overlay (SVG)
│           │  / \\   │                │     white → green when full body
│           └─────────┘                │     landmarks detected
│                                      │
│                                      │
│                                      │
│                                      │
│                                      │
│                                      │
│                                      │
├──────────────────────────────────────┤
│  Step back so your whole body fits.  │  ← status line, text-body
│                                      │
│  ●○○  Body in frame                  │  ← checklist
│  ●●○  Good lighting                  │
│  ●●○  Phone steady                   │
│                                      │
│  Tips ▾                              │  ← expandable
│  ┌────────────────────────────────┐  │
│  │  • Place phone ~2 m away.       │  │
│  │  • Phone at hip height.         │  │
│  │  • Lean it against something.   │  │
│  │  • Face a bright window if      │  │
│  │    possible (don't stand with   │  │
│  │    your back to it).            │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │       View is clear — Start!    │  │  ← disabled until checks pass
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

The silhouette overlay rendering will be SVG over the `<video>` element, fed by future MediaPipe landmarks. None of that ML exists yet — the wireframe documents the layout, not the implementation.

## Content rules

- The single status line at the top of the controls section reflects the _current most important coaching cue_. Only one line at a time (Design Principle 4).
- The checklist below has three items: body in frame, lighting, phone steady. Each shows progress (0 / 1 / 2 dots) so the user understands what changed.
- Tips drawer collapses by default to avoid distracting the user from the live preview.
- The CTA changes copy from "Adjusting…" → "Almost there…" → "View is clear — Start!" as the checks complete.
- Voice guidance (Web Speech API) reads one short instruction at a time, with at least 2 seconds between utterances. Voice is opt-out (Phase 16 settings) — never silent-required.
- No "5… 4… 3… 2… 1…" countdown after the CTA. The user taps Start when ready.

## Data requirements (future only)

| Data point                 | Source (future)                      | Phase |
| -------------------------- | ------------------------------------ | ----- |
| Camera stream              | `camera-adapter.start()`             | 16    |
| Landmark detection         | MediaPipe Pose Landmarker            | 17    |
| Landmark count > threshold | Pose pipeline                        | 18    |
| Frame brightness           | Canvas `getImageData` sampling       | 16    |
| Phone steadiness           | Optional: DeviceMotion gyro variance | 16    |

## States to handle later

- **Loading camera:** show camera-icon placeholder until the first frame paints; do not block input.
- **Detecting:** silhouette stays white; status line guides the user step by step.
- **Detection passes:** silhouette turns green; status line says "You're all set!"; CTA enables; gentle haptic via `navigator.vibrate(20)` once (Android only).
- **Detection regresses (user steps out of frame):** silhouette returns to white; CTA disables; status line points to what broke.
- **Lighting too dark:** "Try moving to a brighter area."
- **Lighting too bright / backlit:** "Move away from windows behind you."
- **Camera busy / lost:** route back to `/permissions` with an explainer that another app released the camera.
- **Permission revoked while on this screen:** detect via stream error and route to `/permissions` denied state.
- **Stream stutters:** keep last detected silhouette state; do not flicker.
- **Reduced motion:** no silhouette "pulse"; color change only.

## Accessibility notes

- The whole-screen layout must keep critical controls in the lower third (one-thumb reach).
- The status line is `aria-live="polite"` so screen reader users hear coaching prompts.
- Voice instructions must be optional and disable-able — and must not start audio without a user gesture (iOS Safari requirement).
- High-contrast mode: silhouette outline switches to a high-contrast color set; the green "ready" state is announced verbally as well as visually.
- The CTA changes its accessible name to reflect whether it is currently enabled and why ("Set up still in progress: body not in frame yet").

## Privacy / safety notes

- The live camera preview is on-screen but is **never** transmitted or stored. Frames go to the pose worker and the canvas, nothing else.
- The screen must not include any "record" or "save" affordance.
- No screenshot of the camera preview is ever uploaded with crash reports — the crash-analytics layer must scrub the camera DOM element (Phase 53).

## Do not fake

- Do not auto-pass the checks regardless of frame content. The detection states must reflect real landmark / brightness signals once Phase 17 lands. In Phase 6 / Phase 7, this screen is documentation only.
- Do not show a fake silhouette overlay before the real ML wiring exists.
- Do not display a fake "AI initialized" indicator.
- Do not invent a "confidence score" line during setup — the score concept belongs to the active session and the form engine, not to setup.
- Do not pre-record a "your body" silhouette image of a model and overlay it as if it were the user.
