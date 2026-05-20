# 06 — Camera Permission Request

## Purpose

The bridge between "I picked a workout" and "the camera is rolling." This screen exists to explain _why_ Motionly needs the camera, reassure the user about privacy, and trigger the browser's native permission prompt at the right moment.

Crucially, this screen is **before** the browser prompt — it primes the user so they say yes deliberately, not anxiously.

## Route

`/permissions` — wired in Phase 6 (`@pages/modal/PermissionsPage`) as a modal-style route.

The route is reused across two callers:

1. **Onboarding** (end of step 5) → `/permissions` → on grant, return to onboarding completion → `/`.
2. **Pre-workout** (after tapping "Start workout" on detail) → `/permissions` → on grant, continue to `/workout/:id/setup`.

The "return-to" target is tracked via navigation state, not a query parameter (Phase 6 already exposes typed navigation).

## Future implementation phase

**Phase 16 — Camera Permission & Setup Screen.**

## Phase 16 implementation note

Phase 16 implemented the live pre-workout setup flow directly on `/workout/:id/setup` rather than building a full standalone `/permissions` settings screen. The existing `/permissions` route remains a placeholder and may be linked from denied/error states for lightweight help.

Intentional scope boundary:

- The setup route requests the live stream only after the user taps **Turn on camera**.
- `src/platform/camera-stream.ts` is separate from the Phase 12 onboarding primer in `src/platform/camera-permission.ts`.
- The live stream is video-only, temporary, UI-only, and stopped on cleanup.
- No microphone, recording, screenshots, upload, storage, MediaPipe, landmarks, body detection, or skeleton overlay exists in Phase 16.

## Entry points

- Step 5 of onboarding ("Set up camera" CTA).
- Pre-workout from `/workouts/:id` ("Start workout" CTA) when permission is not yet granted.
- Profile / Settings → "Re-check camera permission" (post-MVP).

## Exit points

- **Grant** → continue to the caller's next route (camera setup or onboarding completion).
- **Deny (soft):** browser will allow re-prompt on a future user gesture → stay on `/permissions` and show retry guidance.
- **Deny (hard):** browser remembers the denial → show "Open settings" instructions; user must change permission in Chrome / Safari and reload.
- **Cancel / back** → previous route (detail or onboarding step 5).
- **Skip (Pro feature, post-MVP):** alternative non-camera path if read-only guidance is added later — out of scope for MVP.

## Primary user action

Tap **Allow camera access**, which fires the in-app explainer one more time and then triggers `navigator.mediaDevices.getUserMedia({ video: true })` (via the future `src/platform/camera-adapter.ts`).

## Secondary actions

- "Why we need the camera" expandable section.
- "Read our privacy approach" link → opens a privacy page (post-MVP; for MVP, link to a static section in `/profile` or to the on-device privacy explainer).
- Cancel.

## Wireframe — pre-prompt explainer

```
┌──────────────────────────────────────┐
│  ←                                   │
├──────────────────────────────────────┤
│                                      │
│            [camera icon]             │
│                                      │
│  Motionly needs your camera          │  ← text-h1
│  to coach your form.                 │
│                                      │
│  ✓  Video is processed on your       │  ← bullet list, text-body
│     device.                          │
│  ✓  Frames are not uploaded.         │
│  ✓  Nothing is recorded or saved.    │
│                                      │
│  Your browser will ask next.         │  ← caption, neutral-500
│  Tap "Allow" to start.               │
│                                      │
│                                      │
├──────────────────────────────────────┤
│  ┌────────────────────────────────┐  │
│  │       Allow camera access       │  │
│  └────────────────────────────────┘  │
│                                      │
│  Not now                             │  ← text link, secondary action
└──────────────────────────────────────┘
```

## Wireframe — permission denied (soft)

```
┌──────────────────────────────────────┐
│  ←                                   │
├──────────────────────────────────────┤
│                                      │
│           [camera-off icon]          │
│                                      │
│  Camera access was blocked.          │  ← text-h2
│                                      │
│  Motionly can't coach your form      │
│  without the camera. Video still     │  ← text-body neutral-500
│  stays on your device — nothing      │
│  is uploaded.                        │
│                                      │
│  Tap below to try again.             │
│                                      │
├──────────────────────────────────────┤
│  ┌────────────────────────────────┐  │
│  │            Try again            │  │
│  └────────────────────────────────┘  │
│                                      │
│  Back                                │
└──────────────────────────────────────┘
```

## Wireframe — permission denied (hard, needs browser settings)

```
┌──────────────────────────────────────┐
│  ←                                   │
├──────────────────────────────────────┤
│                                      │
│           [camera-off icon]          │
│                                      │
│  Camera is off in your browser.      │  ← text-h2
│                                      │
│  Your browser is blocking camera     │  ← text-body neutral-500
│  access for Motionly. Open your      │
│  site settings to turn it back on.   │
│                                      │
│  Chrome on Android                   │  ← collapsible per-browser block
│  1. Tap the lock icon in the         │
│     address bar.                     │
│  2. Tap "Permissions".               │
│  3. Allow Camera.                    │
│  4. Reload Motionly.                 │
│                                      │
│  iOS Safari                          │
│  1. Settings → Safari → Camera.      │
│  2. Choose "Ask" or "Allow".         │
│  3. Reload Motionly.                 │
│                                      │
├──────────────────────────────────────┤
│  ┌────────────────────────────────┐  │
│  │     Reload after changing       │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

## Content rules

- Privacy bullets use the canonical "on your device / not uploaded" language. Same wording across the explainer, onboarding step 5, detail screen, and profile.
- Never use scare language ("Without the camera, you'll get nothing").
- Never imply the camera is already on before the user has granted permission.
- Browser-specific instructions are explicit (Chrome on Android, iOS Safari) because they are the primary targets. Generic "open browser settings" is not enough.

## Data requirements (future only)

- Read current permission state via `navigator.permissions.query({ name: 'camera' })` where supported; treat unsupported as "prompt" and surface the explainer.
- Persist the **fact** that permission was once granted to skip the explainer for subsequent sessions — but never persist or fake the granted state to bypass the browser check.

## States to handle later

- **Prompt (default):** show explainer; CTA triggers `getUserMedia`.
- **Granted on a previous session, still granted:** skip the explainer, route directly to the caller's next step.
- **Denied (soft):** explainer with "Try again" CTA. Re-attempting requires a fresh user gesture.
- **Denied (hard / blocked):** show browser-specific recovery instructions; tap "Reload after changing" calls `window.location.reload()` (via a platform adapter).
- **Unsupported / no camera:** show "This device doesn't expose a camera to your browser." with a back CTA. Frequent on laptops without webcams in dev/testing.
- **Camera busy (other tab / app):** Phase 16 may detect this from the `getUserMedia` error name (`NotReadableError`) and instruct the user to close other camera apps.
- **Insecure context:** if the page is somehow served over HTTP without localhost, the browser refuses camera. Show an honest "Motionly must be opened over HTTPS." copy.
- **Reduced motion:** no animation on this screen; the camera icon is static.

## Accessibility notes

- Heading lands focus on route entry.
- Bullet checks must include screen-reader-friendly text (`<li>`), not icons alone.
- Browser-instruction sections are expandable accordions with proper `aria-expanded` / `aria-controls`.
- Primary CTA height ≥48 dp, reachable in the lower third.
- After tapping "Allow camera access", the browser's own permission prompt takes focus; when the user returns, the result page (granted / denied) lands focus on its heading.

## Privacy / safety notes

- This screen never starts the camera by itself. It only requests permission.
- Even after grant, `getUserMedia` is not called until the next route (`/workout/:id/setup`) needs the live stream. The permission is held, the stream is not.
- The "Privacy approach" link must go to either an in-app explainer or a static doc — never to a third-party tracker.
- Do not log permission outcomes to a remote analytics endpoint without explicit opt-in.

## Do not fake

- Do not show "Camera connected!" before `getUserMedia` resolves successfully.
- Do not display a fake "Permission granted by 92% of users" social-proof line.
- Do not auto-trigger `getUserMedia` on screen load. Permission requests must follow a clear, deliberate user gesture.
- Do not skip the explainer on first request just because it costs a tap — the explainer is the trust artefact.
- Do not show "We're encrypting your video stream" — there is no stream, and even later there will be no upload.
