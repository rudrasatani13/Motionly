# 07 — Camera Setup & Silhouette Guide

## Purpose

The highest-friction moment in the entire UX: helping a user prop their phone in a useful position, with the right lighting, and with their whole body in frame, in under 30 seconds. This screen is the last gate before `/workout/:id/active`.

## Route

`/workout/:id/setup` — wired in Phase 6 (`@pages/workout/CameraSetupPage`).

## Future implementation phase

**Phase 16 — Camera Permission & Setup Screen.**

## Phase 16 implementation note

Phase 16 deliberately diverges from the original ML-ready copy in this wireframe because real body/landmark detection starts in Phase 17. The implemented screen is honest about the signals it actually has:

- Camera stream available.
- Lighting check from local in-memory canvas brightness sampling.
- Explicit user confirmation via **I'm lined up**.

The silhouette overlay is a positioning guide, not a detector. It turns accent only when camera is active, lighting is good or manually accepted, and the user confirms alignment. It must not say "full body detected", show landmark counts, draw skeleton joints, or imply AI/pose detection is running.

## Entry points

- `/permissions` → on grant → `/workout/:id/setup`.
- "Back to setup" CTA on `/workout/:id/active` if the user pauses mid-session and wants to reframe.

## Exit points

- "Continue to workout" CTA → `/workout/:id/active`.
- Back → `/workouts/:id` (detail).
- "Get help" link → expandable troubleshooting drawer (stays on this route).
- Permission revoked mid-session (rare) → `/permissions`.

## Primary user action

Turn on the camera, adjust phone position and lighting, confirm **I'm lined up**, then tap **Continue to workout**.

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
│           │  / \\   │                │     white → accent only after
│           └─────────┘                │     user confirms setup
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
│  ✓    Camera on                      │  ← checklist
│  ✓    Lighting okay                  │
│  ○    Full body inside guide         │
│  ○    Phone steady                   │
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
│  │       Continue to workout       │  │  ← disabled until checks pass
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

The Phase 16 silhouette overlay is SVG/CSS over the `<video>` element and is not fed by MediaPipe landmarks. Future MediaPipe wiring begins in Phase 17.

## Content rules

- The single status line at the top of the controls section reflects the _current most important coaching cue_. Only one line at a time (Design Principle 4).
- The checklist below has manual/honest items: camera on, lighting okay, full body inside guide, phone steady. Body-in-frame and phone-steady are user-confirmed instructions until real detection/sensors exist.
- Tips drawer collapses by default to avoid distracting the user from the live preview.
- The CTA copy is **Continue to workout**. Do not use "View is clear" until a real visual confidence system exists.
- Voice instruction is optional and user-initiated in Phase 16. It reads one setup instruction via Web Speech when supported. The richer voice cue system is Phase 25.
- No "5… 4… 3… 2… 1…" countdown after the CTA. The user taps Start when ready.

## Data requirements (future only)

| Data point                 | Source (future)                | Phase |
| -------------------------- | ------------------------------ | ----- |
| Camera stream              | `camera-adapter.start()`       | 16    |
| Landmark detection         | MediaPipe Pose Landmarker      | 17    |
| Landmark count > threshold | Pose pipeline                  | 18    |
| Frame brightness           | Canvas `getImageData` sampling | 16    |
| Phone steadiness           | Manual instruction in Phase 16 | 16    |

## States to handle later

- **Loading camera:** show camera-icon placeholder until the first frame paints; do not block input.
- **Setting up:** silhouette stays white; status line guides the user step by step.
- **Setup readiness passes:** silhouette turns accent; CTA enables after camera active, lighting accepted, and user confirms alignment.
- **Setup readiness regresses:** silhouette returns to white; CTA disables; status line points to what needs attention.
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

- The live camera preview is on-screen but is **never** transmitted or stored. In Phase 16, frames are sampled only by the local lighting canvas. Pose workers arrive later.
- The screen must not include any "record" or "save" affordance.
- No screenshot of the camera preview is ever uploaded with crash reports — the crash-analytics layer must scrub the camera DOM element (Phase 53).

## Do not fake

- Do not auto-pass the checks regardless of frame content. Phase 16 readiness must reflect camera stream, local lighting, and user confirmation only.
- Do not present the silhouette guide as real ML detection.
- Do not display a fake "AI initialized" indicator.
- Do not invent a "confidence score" line during setup — the score concept belongs to the active session and the form engine, not to setup.
- Do not pre-record a "your body" silhouette image of a model and overlay it as if it were the user.
