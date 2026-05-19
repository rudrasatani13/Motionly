# Motionly — User Flows

Phase 7 deliverable. This document describes the five user journeys Motionly must support end-to-end. It is paired with the per-screen wireframes in [`./wireframes/`](./wireframes/) and the Mermaid diagrams in [`./wireframes/flow-diagrams.md`](./wireframes/flow-diagrams.md).

These flows are documentation-only. Nothing here is wired up in code. Implementation lands in the later phases of [`../MOTIONLY_MASTER_PLAN.md`](../MOTIONLY_MASTER_PLAN.md).

Flows covered:

- [A. First-time user](#a-first-time-user-flow)
- [B. Returning user](#b-returning-user-flow)
- [C. Subscription conversion](#c-subscription-conversion-flow)
- [D. Camera permission failure](#d-camera-permission-failure-flow)
- [E. Low-confidence AI](#e-low-confidence-ai-flow)

The hard target across all flows is honest, calm, privacy-first UX. See [`./wireframes/00-design-principles.md`](./wireframes/00-design-principles.md) for the principles every flow must respect.

---

## A. First-time user flow

**Goal:** From "URL opens" to "user's first coached rep" in **under 3 minutes**.

This is the most important flow in the product. Every other flow is downstream of trust earned here.

### Steps + target timing

| #   | Step                              | Route / state                        | Target time          | Wireframe                                                                |
| --- | --------------------------------- | ------------------------------------ | -------------------- | ------------------------------------------------------------------------ |
| 1   | URL opens (cold)                  | HTML splash (paint-time)             | 0–1.5 s              | [01-splash-launch](./wireframes/01-splash-launch.md)                     |
| 2   | React splash + first-launch check | `/welcome`                           | 1.5–3 s              | [01-splash-launch](./wireframes/01-splash-launch.md)                     |
| 3   | Welcome                           | `/onboarding` (step 1)               | 5–15 s               | [02-onboarding §Welcome](./wireframes/02-onboarding.md)                  |
| 4   | Goal                              | `/onboarding` (step 2)               | 10–20 s              | [02-onboarding §Goal](./wireframes/02-onboarding.md)                     |
| 5   | Fitness level                     | `/onboarding` (step 3)               | 5–10 s               | [02-onboarding §Fitness Level](./wireframes/02-onboarding.md)            |
| 6   | Limitations                       | `/onboarding` (step 4)               | 10–20 s              | [02-onboarding §Limitations](./wireframes/02-onboarding.md)              |
| 7   | Camera tutorial                   | `/onboarding` (step 5)               | 10–15 s              | [02-onboarding §Camera Tutorial](./wireframes/02-onboarding.md)          |
| 8   | Pick first workout                | `/workouts/:id` (auto-routed)        | 5–10 s               | [05-workout-detail](./wireframes/05-workout-detail.md)                   |
| 9   | Camera permission                 | `/permissions`                       | 5–10 s               | [06-camera-permission](./wireframes/06-camera-permission.md)             |
| 10  | Camera setup / silhouette         | `/workout/:id/setup`                 | 15–30 s              | [07-camera-setup-silhouette](./wireframes/07-camera-setup-silhouette.md) |
| 11  | Start active workout              | `/workout/:id/active`                | <2 s                 | [08-active-workout](./wireframes/08-active-workout.md)                   |
| 12  | First coached rep                 | (sub-state of `/workout/:id/active`) | first 10 s of active | [09-mid-workout-feedback](./wireframes/09-mid-workout-feedback.md)       |

Total budget: ~2:00–2:30 with deliberate motion, well under 3 minutes.

After step 12, the user has experienced the product's core promise. Everything beyond this point — sets 2 and 3, the summary, the dashboard — is retention.

### Decision points

- **Returning user re-running the URL:** if `hasOnboarded` is true, step 3 is skipped and the user is routed to `/` (this is the returning user flow, §B).
- **First workout pick:** the system auto-routes to a beginner-friendly workout (Phase 33 plan). The user can swap before hitting Start, but the default is opinionated.
- **Permission previously granted on another visit:** step 9 is short-circuited and the user goes straight to `/workout/:id/setup`.
- **Camera unsupported or insecure context:** see flow §D.

### Failure / recovery paths

- **Onboarding interrupted (page close):** restored state on next visit; the user resumes at the step after their last completed selection.
- **Permission denied:** branches into flow §D.
- **Camera setup never passes (lighting, frame):** the user can tap "Get help" for tips and continue trying; there is no skip button in MVP. Setup is a hard gate.
- **Pose detection silent for 30 s on active screen:** the low-confidence flow (§E) takes over; cues are suppressed; setup guidance shows.

### Privacy reassurance moments

The privacy line ("Video is processed on your device and never uploaded") appears at four distinct moments in this flow:

1. **Welcome (step 3):** as part of the hero sub-headline.
2. **Camera tutorial (step 7):** as a footnote above the CTA.
3. **Workout detail (step 8):** in the "Privacy reminder" block.
4. **Camera permission (step 9):** as bullet points in the explainer.

Repetition is intentional. Trust is built by consistency, not by burying the message.

### Where users can skip

- **Limitations (step 6):** optional; users can tap "None" or leave chips empty.
- **Camera tutorial (step 7):** an optional "Skip tutorial" link below the CTA is acceptable for users who have seen it before.
- **Goal and Fitness Level:** not skippable. Without these, the recommended workout cannot be personalized.

### What must not block the first rep

- Account creation. The MVP supports a local-only first session; auth (Phase 32) is offered later in the user's journey, not before their first session.
- Email or phone verification.
- Theme selection.
- Language selection.
- Notification permission.
- Newsletter signup. (None exists; do not invent one.)
- Subscription decision. Free tier covers the first session and several beyond it.

---

## B. Returning user flow

**Goal:** From PWA icon tap to ongoing workout in **under 30 seconds** of friction.

### Steps

```
Open Motionly icon / URL
       │
       ▼
HTML splash + React splash             (≤ 2 s)
       │
       ▼
Dashboard (/)                          [03-home-dashboard]
       │
       ├── Tap "Start workout" (today's suggested)
       │       │
       │       ▼
       │   /workout/:id/setup           [07-camera-setup-silhouette]
       │       │
       │       ▼
       │   /workout/:id/active          [08-active-workout]
       │       │
       │       ▼
       │   /workout/:id/summary         [11-post-workout-summary]
       │       │
       │       ▼
       │   /  (dashboard, updated)
       │
       ├── Tap "Explore workouts"
       │       │
       │       ▼
       │   /workouts                    [04-workout-library]
       │       │
       │       ▼
       │   /workouts/:id                [05-workout-detail]
       │       (then converges with the "Start workout" branch above)
       │
       └── Tap "Progress" tab
               │
               ▼
           /progress                    [12-progress-history]
```

### Optimizations vs. first-time flow

- **Camera permission already granted:** the camera-permission explainer is skipped. The user lands directly on `/workout/:id/setup`.
- **Camera setup remembers good frames:** if landmark detection passes within ~1.5 seconds of arriving, the CTA auto-enables — no manual fiddling.
- **Today's workout is pre-selected:** dashboard surfaces the suggested workout from the user's program (Phase 33+). One tap.

### Offline considerations

The PWA is offline-capable for all returning-user steps except subscription state refresh and content updates:

- **Dashboard:** works offline; all KPIs and recent activity are local.
- **Workout library:** works offline; the seeded library lives in IndexedDB.
- **Workout detail:** works offline.
- **Camera setup / active workout / summary:** fully offline; the entire ML stack runs on-device.
- **Progress:** works offline; all queries are local.
- **Profile / paywall:** profile renders offline; subscription management requires connectivity.

When the network returns, derived metrics sync to Supabase in the background (Phase 31+). The user is never blocked on sync.

### Decision points

- **Auth session expired (Phase 32+):** the dashboard requests re-auth via a non-blocking banner. The user can still browse local content.
- **Pending service worker update:** a "Refresh to update" toast appears on the dashboard after the user arrives. It never auto-reloads mid-session.

### Failure / recovery paths

- **Persisted state corrupt:** degrade to first-time flow.
- **Camera permission revoked since last session:** the camera-setup route detects this and redirects to `/permissions`.
- **Subscription downgrade since last session (Pro → Free):** locked features become locked; an unobtrusive banner explains why.

---

## C. Subscription conversion flow

**Goal:** Convert a free user to Motionly Pro **ethically**. No urgency, no fake scarcity, no dark patterns.

### Steps

```
Free user hits a Pro-only gate
       │
       ├── Weekly session limit reached         (Phase 38)
       ├── Locked workout / exercise tapped     (Phase 14)
       ├── "See plans" tapped in /profile       (Phase 45)
       └── Upgrade banner tapped on dashboard   (Phase 13)
       │
       ▼
/paywall                                        [15-subscription-paywall]
       │
       ├── User dismisses ─────────────┐
       │                                ▼
       │                          Return to caller
       │                          (no penalty)
       │
       ▼
Tap "Subscribe" / "Start free trial"
       │
       ▼
Provider checkout (Stripe / Razorpay)
       │
       ├── Success
       │    │
       │    ▼
       │  Webhook updates entitlement (Supabase)
       │    │
       │    ▼
       │  Success screen + "Continue where you left off"
       │    │
       │    ▼
       │  Caller's next intent (start the gated workout)
       │
       ├── Failure
       │    │
       │    ▼
       │  Paywall returns with a clear "Try again" banner
       │
       └── Cancel
            │
            ▼
          Paywall returns silently; no scolding copy
```

### Ethical guardrails

| Allowed                                             | Not allowed                                     |
| --------------------------------------------------- | ----------------------------------------------- |
| State the free tier limits plainly when they hit    | Hide the close button on the paywall            |
| Show genuine pricing including a localized currency | Show fake countdowns or "limited-time" pressure |
| Explain what's unlocked, exactly                    | Show fake social-proof signups                  |
| Offer a free trial only if the trial is real        | Hide the cancel path or sneak auto-renew copy   |
| Provide a Restore link and a Customer Portal link   | Bury terms in unreadable text                   |
| Return the user to their original intent on success | Block free features after a declined upgrade    |

### Free vs Pro value clarity

Per the master plan free tier (Phase 38):

- **Free:** 3 sessions/week, 5 exercises/session, core 5 exercises, 7-day history.
- **Pro:** unlimited sessions, all 10 MVP exercises, full history, adaptive programming.

Copy must not muddle these.

### Restore / cancel path

- **Restore subscription** is always present on the paywall and reachable from `/profile`. It re-checks Supabase entitlement; useful when a user signs in on a new device.
- **Cancel anytime** opens the provider's customer portal. Motionly does not implement its own billing UI.

### Currency localization

Detection: locale + IP. The visible currency switches between USD (Stripe default) and INR (Razorpay default) based on region. Mismatches are user-resolvable via a "Change region" link in the customer portal.

---

## D. Camera permission failure flow

**Goal:** Recover gracefully from any of the several reasons the camera can refuse to work. The user must always understand _why_, what to do, and that nothing about their video has been uploaded.

### Failure modes the system handles

| Mode                           | Trigger                                            | Recovery path                               |
| ------------------------------ | -------------------------------------------------- | ------------------------------------------- |
| Soft denial                    | User taps "Block" on the first browser prompt      | Re-prompt on the next user gesture          |
| Hard denial                    | Browser records the denial as persistent           | Browser-specific settings instructions      |
| No camera                      | Device exposes no camera (laptops without webcams) | Honest "No camera available"                |
| Camera busy                    | Another tab / app holds the camera                 | "Close other camera apps and try again"     |
| Permission revoked mid-session | OS or browser pulls the stream                     | Auto-pause; route back to `/permissions`    |
| Insecure context               | App served over HTTP without localhost             | "Open Motionly over HTTPS to enable camera" |
| Stream stutters / errors       | Driver / hardware issue                            | Retry with a calmer recovery toast          |

### Steps

```
User attempts to start a workout
       │
       ▼
/permissions  (explainer)               [06-camera-permission]
       │
       ▼
Browser prompts for camera
       │
       ├── Granted
       │    │
       │    ▼
       │  /workout/:id/setup
       │
       ├── Denied (soft)
       │    │
       │    ▼
       │  /permissions  (denied state)
       │  Reassure: nothing was uploaded.
       │  "Try again" CTA re-fires getUserMedia
       │
       ├── Denied (hard / blocked)
       │    │
       │    ▼
       │  /permissions  (browser-settings state)
       │  Browser-specific step-by-step instructions
       │  "Reload after changing"
       │
       ├── No camera / unsupported
       │    │
       │    ▼
       │  Honest end-state: "No camera available"
       │  No retry; offer "Back to workouts"
       │
       └── Other error (busy / driver)
            │
            ▼
          /permissions  (error state)
          Specific suggestion based on the error name
```

### Privacy reassurance

Every error state repeats:

> Nothing was uploaded. Video stays on your device.

Users who deny because they're worried about privacy are exactly the users who need to hear this on the denial screen, not before.

### Alternative path (post-MVP)

A future "read-only workout guidance" path could let users follow exercises with no camera and no live coaching. The wireframe leaves room for this without committing to MVP scope. If it ships, the denial-screen CTA gains a "Continue without coaching" option.

### What must not happen

- The denial screen must not blame the user.
- The screen must not auto-retry on a timer (that's how trust is lost).
- The screen must not offer a "Just skip and pretend" mode.
- The screen must not show fake confidence ("Don't worry — we'll get there!"). Tone is calm, not chipper.

---

## E. Low-confidence AI flow

**Goal:** When the pose / form pipeline is uncertain, the app **says nothing about form** and instead helps the user fix the setup. The worst outcome for trust is a confident wrong cue.

### What "low confidence" means

A combination of signals derived later in the ML phases (17–24):

- Fewer than the required count of major landmarks detected.
- Landmarks detected but heavily smoothed / jittery (lighting, motion blur).
- Body partially out of frame.
- Loose clothing or occlusion (jacket, dark room).
- Exercise-specific orientation mismatch (e.g. user is camera-side-on when the rule set expects facing-camera).

Each exercise's rule set defines its own confidence threshold (Phases 21–24).

### Steps

```
User is on /workout/:id/active
       │
       ▼
Pose pipeline emits landmarks each frame
       │
       ▼
Confidence aggregator (rolling window)
       │
       ├── Confidence ≥ threshold
       │    │
       │    ▼
       │  Form engine emits cues as normal
       │  ([09-mid-workout-feedback])
       │
       └── Confidence < threshold
            │
            ▼
          Form engine suppresses cues
            │
            ▼
          UI shows neutral system banner ("Step into the frame.")
            │
            ├── User corrects setup → confidence climbs → cues resume
            │
            └── Confidence stays low for >30 s
                 │
                 ▼
               Workout auto-pauses with a non-alarming overlay:
               "Your full body isn't in view. Reset your camera setup."
               CTA: "Back to setup" → /workout/:id/setup
```

### What the UI says (banner copy options)

The system banner picks the most actionable cue based on the failure mode:

| Cause                          | Banner copy                             |
| ------------------------------ | --------------------------------------- |
| Body out of frame              | "Step into the frame."                  |
| Some landmarks missing         | "Make sure your whole body is in view." |
| Lighting too dim               | "More light, please."                   |
| Lighting backlit               | "Step away from windows behind you."    |
| Camera angle wrong             | "Turn sideways to the camera."          |
| Loose clothing occlusion       | "Adjust your clothing if you can."      |
| Movement too fast for sampling | "Slow down so we can see you."          |
| Generic / unknown              | "We can't see clearly yet."             |

### What the system never does in this state

- **No fake cues.** Form cues are only emitted when confidence is above threshold.
- **No fake rep counts.** Reps below confidence threshold do not count and the counter does not increment.
- **No fake scores.** No score is computed for an unseen rep.
- **No "We think you might be doing X" guesses.**
- **No medical or injury language.** Even if confidence happens to be high, this rule never breaks.
- **No silent auto-skip to a different exercise.** The user always knows what's happening.

### Recovery

- Confidence improves → banner withdraws (cross-fade out) → form cues resume.
- Auto-pause threshold reached (sustained low confidence) → user is offered a clear path to setup recovery.
- User taps "Back to setup" → `/workout/:id/setup` with the session paused and resumable.

### Privacy / safety implications

The confidence aggregator runs on-device. Nothing about a low-confidence frame leaves the device, and no "we couldn't see you" event is reported externally without opt-in analytics consent (Phase 53). Even with consent, only the _fact_ of low confidence is logged — never a frame, never landmarks.

---

## Related documents

- [`./wireframes/`](./wireframes/) — per-screen wireframes and design principles.
- [`./wireframes/flow-diagrams.md`](./wireframes/flow-diagrams.md) — Mermaid diagrams for each flow.
- [`./ARCHITECTURE.md`](./ARCHITECTURE.md) — layering and adapter rules referenced by these flows.
- [`./CODING_STANDARDS.md`](./CODING_STANDARDS.md) — code-level conventions.
- [`../MOTIONLY_MASTER_PLAN.md`](../MOTIONLY_MASTER_PLAN.md) — phase-by-phase roadmap.
