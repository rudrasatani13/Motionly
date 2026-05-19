# Motionly — Wireframes

Phase 7 deliverable. These are **low-fidelity UX blueprints**, not implemented screens. No real app screen has been built yet, and nothing in this directory is shipped to runtime app code.

If `MOTIONLY_MASTER_PLAN.md` is the source of truth for **what** Motionly will build, this folder is the source of truth for **how each screen should feel** once a future phase finally builds it.

---

## What lives here

| File                                                               | Screen / topic                                        |
| ------------------------------------------------------------------ | ----------------------------------------------------- |
| [`00-design-principles.md`](./00-design-principles.md)             | UX principles every wireframe must respect            |
| [`01-splash-launch.md`](./01-splash-launch.md)                     | Brand splash / launch moment (Phase 10)               |
| [`02-onboarding.md`](./02-onboarding.md)                           | 5-screen onboarding flow (Phases 11–12)               |
| [`03-home-dashboard.md`](./03-home-dashboard.md)                   | Authenticated home screen (Phase 13)                  |
| [`04-workout-library.md`](./04-workout-library.md)                 | Browse / filter / search workouts (Phase 14)          |
| [`05-workout-detail.md`](./05-workout-detail.md)                   | Pre-workout detail screen (Phase 15)                  |
| [`06-camera-permission.md`](./06-camera-permission.md)             | Browser camera permission request (Phase 16)          |
| [`07-camera-setup-silhouette.md`](./07-camera-setup-silhouette.md) | Camera setup and silhouette guide (Phase 16)          |
| [`08-active-workout.md`](./08-active-workout.md)                   | Camera + skeleton + cue HUD (Phase 17+ / Phase 27)    |
| [`09-mid-workout-feedback.md`](./09-mid-workout-feedback.md)       | Real-time form cues during a set (Phase 23+)          |
| [`10-post-set-summary.md`](./10-post-set-summary.md)               | Brief between-set summary (Phase 27+)                 |
| [`11-post-workout-summary.md`](./11-post-workout-summary.md)       | End-of-session summary (Phase 28+)                    |
| [`12-progress-history.md`](./12-progress-history.md)               | Trends, streaks, session history (Phase 34+)          |
| [`13-form-score-details.md`](./13-form-score-details.md)           | Score breakdown + confidence (Phase 35+)              |
| [`14-profile-settings.md`](./14-profile-settings.md)               | Profile, settings, subscription, language (Phase 45+) |
| [`15-subscription-paywall.md`](./15-subscription-paywall.md)       | Paywall and upgrade flow (Phase 37+)                  |
| [`flow-diagrams.md`](./flow-diagrams.md)                           | Mermaid flow diagrams for the 5 key user journeys     |

Companion document: [`../USER_FLOWS.md`](../USER_FLOWS.md) — narrative descriptions of the critical user journeys (first-time, returning, subscription, permission failure, low-confidence AI).

---

## Phase 7 purpose

> Document Motionly's complete user experience as wireframes and user-flow diagrams **before** building real UI.

This phase is documentation-only. It exists because the cost of redesigning a flow on paper is minutes; the cost of redesigning it after the camera, ML, and state layers are wired together is days. Future UI phases consult these wireframes first; if the implementation differs in a meaningful way, the wireframe is updated in the same change set.

---

## What these wireframes are not

- **Not runtime data.** Wireframes describe _what could appear_, never _what currently does_. Sample copy ("Beginner Lower Body • 12 min") is illustrative documentation only — it must not be pasted into the app as if real workouts exist.
- **Not pixel-accurate.** The ASCII blocks describe regions and hierarchy. Real visual styling will come from Phase 5 Tailwind tokens (`bg-motionly-bg-*`, `text-motionly-neutral-*`, `text-h1`/`text-body`/`text-label`, etc.) and the typography utilities already in `tailwind.config.ts`.
- **Not a re-routing plan.** Phase 6 already shipped the route surface. Where a wireframe describes a screen that doesn't yet have a route, the wireframe says whether it is a sub-state of an existing route, a modal, or a future routing decision.
- **Not a backend contract.** Data requirements that appear in wireframes (sessions, streaks, scores) are marked as _future signals_. Phase 7 does not introduce stores, IndexedDB schemas, or APIs.

---

## How future phases should use this folder

1. **Before opening a screen file** in `src/pages/`, read the wireframe for that screen.
2. **Follow Phase 5 tokens.** Visual styling should pull from `tailwind.config.ts` (colors, font sizes, font families). Do not introduce hex literals or one-off type scales.
3. **Follow the clean Apple-style minimal direction.** Lots of whitespace, soft hierarchy, restrained color usage, no decorative chrome. Information density is earned by content, not by ornament.
4. **Don't fake what the wireframe defers.** If a wireframe says "real signals arrive in Phase 27", do not render fabricated reps, scores, or streaks earlier just because the layout has a slot for them.
5. **Update the wireframe when reality diverges.** If you change a flow during implementation, edit the corresponding markdown file in the same PR. Phase 7 documents the _agreed_ design; staleness is worse than absence.

---

## Format conventions

Every per-screen wireframe document uses the same section structure so they are easy to skim:

- **Purpose** — what the screen is for, in one or two sentences.
- **Route** — the URL it maps to (or "future routing decision" / "modal state").
- **Future implementation phase** — phase number(s) from `MOTIONLY_MASTER_PLAN.md`.
- **Entry points** — where the user arrives from.
- **Exit points** — where the user goes next.
- **Primary user action** — the single most important thing the screen enables.
- **Secondary actions** — anything else the screen exposes.
- **Wireframe** — ASCII layout block(s).
- **Content rules** — copy guidelines, dos and don'ts.
- **Data requirements (future only)** — what real signals would be needed; marked deferred.
- **States to handle later** — loading, empty, error, offline, permission-denied where relevant.
- **Accessibility notes** — focus order, contrast, motion, screen reader hints.
- **Privacy / safety notes** — for any screen that touches camera, ML, or sensitive copy.
- **Do not fake** — explicit list of items that must not be invented before the real signal exists.

ASCII blocks use a single mobile-portrait viewport metaphor. Real implementations should still be responsive, but mobile-first is the design intent.

---

## Related documents

- [`../USER_FLOWS.md`](../USER_FLOWS.md) — user journey narratives
- [`../ARCHITECTURE.md`](../ARCHITECTURE.md) — layering and folder rules
- [`../CODING_STANDARDS.md`](../CODING_STANDARDS.md) — TypeScript, React, styling rules
- [`../../MOTIONLY_MASTER_PLAN.md`](../../MOTIONLY_MASTER_PLAN.md) — phase ordering and scope
