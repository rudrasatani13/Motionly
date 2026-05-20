# 08 — Active Workout

## Purpose

The center of Motionly. The screen the user spends 80% of their session time on. A full-screen camera with a skeleton overlay, a rep counter, exactly one coaching cue at a time, and minimal chrome — every pixel justified.

## Route

`/workout/:id/active` — wired in Phase 6 (`@pages/workout/ActiveWorkoutPage`).

## Future implementation phase

**Phase 17** (MediaPipe), **Phases 18–24** (pose pipeline, angle math, exercise engines), **Phase 25** (voice), **Phase 26** (skeleton overlay), and **Phase 27** (full assembly).

## Phase 16 handoff note

Phase 16 routes to `/workout/:id/active` after the user completes or skips camera setup, but this active route remains an honest placeholder. The setup screen stops its camera stream before navigation and does not pass a stream through router state, create a workout session, start timers, run inference, count reps, or render an active workout HUD.

## Entry points

- `/workout/:id/setup` → "Continue to workout" CTA → here.
- Resume from a paused session (Phase 27): re-enter at the same exercise/set/rep.

## Exit points

- Last rep of last exercise complete → `/workout/:id/summary`.
- Tap "End" → confirm dialog → `/workout/:id/summary` (with partial completion flag).
- Camera lost mid-session → pause modal with retry / end options.
- Permission revoked mid-session → `/permissions`.

## Primary user action

Perform the exercise. The screen itself does most of its work without the user touching it (rep counting, cue selection are automatic).

## Secondary actions

- Pause / resume.
- End workout early.
- Skip to next exercise.
- Mute / unmute voice.

## Wireframe — portrait (default)

```
┌──────────────────────────────────────┐
│ ⏸  Set 1 / 3 · 02:14    🔊        ✕ │  ← top HUD: pause, set, time, voice, end
├──────────────────────────────────────┤
│                                      │
│                                      │
│         ┌─────────┐                  │
│         │   o     │                  │  ← live camera feed
│         │  /|\\   │                  │  ← skeleton overlay (Phase 26)
│         │  / \\   │                  │     drawn on a transparent canvas
│         └─────────┘                  │
│                                      │
│                                      │
│        ┌──────────────────┐          │
│        │ Keep your chest  │          │  ← cue card (Phase 23+)
│        │      up.         │          │     one cue at a time
│        └──────────────────┘          │
│                                      │
│                                      │
│                                      │
├──────────────────────────────────────┤
│  Bodyweight squat                    │  ← exercise name
│                                      │
│                  07                  │  ← rep counter, text-h1 huge
│                / 10                  │  ← target reps, subtitle
│                                      │
│  ████████████░░░░░░░  set 1 of 3     │  ← linear progress bar
│                                      │
│  ⏭  Skip exercise                    │  ← secondary action, small
└──────────────────────────────────────┘
```

## Wireframe — between exercises (rest)

```
┌──────────────────────────────────────┐
│ ⏸  Resting · 0:27        🔊       ✕ │
├──────────────────────────────────────┤
│                                      │
│                                      │
│           [camera dimmed]            │
│                                      │
│                                      │
│           00 : 27                    │  ← countdown timer
│                                      │
│           Up next                    │  ← text-h3 neutral-500
│           Glute bridge               │  ← text-h2
│           3 sets of 12               │  ← text-body
│                                      │
│                                      │
│                                      │
├──────────────────────────────────────┤
│  ┌────────────────────────────────┐  │
│  │       Skip rest                 │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

## Wireframe — pause modal

```
┌──────────────────────────────────────┐
│                                      │
│         [camera blurred]             │
│                                      │
│             Paused                   │  ← text-h1
│                                      │
│  ┌────────────────────────────────┐  │
│  │           Resume                │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │   Skip to next exercise         │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │       End workout               │  │
│  └────────────────────────────────┘  │
│                                      │
└──────────────────────────────────────┘
```

Sample numbers ("07 / 10", "02:14", "Set 1 / 3") and exercise names ("Bodyweight squat", "Glute bridge") are illustrative. Real values come from the exercise engines (Phases 20–24), the rep state machine, and the active workout store. Phase 7 and Phase 6 must not hard-code them.

## Content rules

- **One cue at a time**, always (Design Principle 4). When a higher-priority cue arrives, it replaces the current one with a 200ms cross-fade.
- Cues are short, corrective sentences (Design Principle 5): "Keep your chest up." not "Maintain thoracic extension throughout the eccentric phase."
- The rep counter is the largest single element on screen. It pulses on each new rep (`scale 1.0 → 1.1 → 1.0` over ~180ms, suppressed under `prefers-reduced-motion`).
- The set / time line in the top HUD is small but readable; it must not steal attention.
- Voice cues mirror the on-screen cue but are throttled to avoid stacking. Voice can be muted via the 🔊 button.
- Rest countdown screen previews the next exercise; the user can skip rest with the CTA.
- Pause modal blurs the camera (CSS `filter: blur`) without freezing it — the user can still see the room.

## Data requirements (future only)

| Data point        | Source (future)                  | Phase |
| ----------------- | -------------------------------- | ----- |
| Pose landmarks    | MediaPipe in worker              | 17–18 |
| Joint angles      | `src/ml/angles/`                 | 19    |
| Rep state machine | `src/ml/exercises/<exercise>.ts` | 20–24 |
| Form cues         | Rule sets per exercise           | 21–24 |
| Skeleton render   | Canvas overlay                   | 26    |
| Voice synthesis   | TTS adapter                      | 25    |
| Session state     | `useWorkoutSessionStore`         | 29    |

## States to handle later

- **Pose not detected** → no cues, no rep counts. The screen shows a non-alarming overlay banner "Make sure your whole body is in view" (low-confidence flow, see `../USER_FLOWS.md` §E).
- **Low confidence** → cues are suppressed; the banner appears (Design Principle 12 — no fake feedback).
- **Camera lost** → auto-pause; pause modal with "Reconnect" CTA.
- **Wake lock denied** → fallback: surface a "Keep this tab open" tip; do not abort the session.
- **Battery low / thermal throttle** → if the device throttles, the session continues but the FPS warning surfaces (Phase 40).
- **Network drop** → no effect; the active workout is fully local.
- **App backgrounded** → auto-pause on `visibilitychange`.
- **Reduced motion** → rep pulse is replaced with a static color change; transitions cross-fade only.

## Accessibility notes

- The cue card is `aria-live="assertive"` so visually impaired users hear updates immediately. (Voice mode is the primary channel for them.)
- Rep counter announcements: every rep increment fires an `aria-live="polite"` text update ("Rep 7 of 10").
- The top HUD controls are sized ≥48 dp and have explicit `aria-label`s (Pause, Mute, End).
- High-contrast mode: skeleton overlay switches to high-contrast colors.
- The pause modal traps focus until dismissed.

## Privacy / safety notes

- **Camera frames never leave the device.** The ML pipeline runs in a Web Worker against a `<canvas>`; no frame data goes to any network endpoint, ever.
- Voice synthesis is on-device via `speechSynthesis` API; no audio is uploaded.
- Crash analytics (Phase 53) must redact the active workout screen — never include a screenshot containing the video element.
- The session ID and resulting metrics may sync to Supabase (Phase 31), but only derived numbers: rep counts, scores, durations. No landmarks. No frames.

## Do not fake

- Do not increment the rep counter on a timer. Reps come from the rep state machine, full stop.
- Do not display a form-score number before the form engine has scored anything.
- Do not show a fake cue ("Great form!") on a blank or low-confidence frame.
- Do not draw a fake skeleton on top of the camera feed if MediaPipe is not running.
- Do not pre-record voice cues and play them on a schedule — voice cues respond to the form engine's output.
- Do not display "Calories burned" — out of scope and uncomputable from pose alone.
- Do not show a fake heart-rate readout.
- Do not show a fake "AI is watching" badge.
