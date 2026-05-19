# 02 — Onboarding (5 Screens)

## Purpose

Gather the minimum personal context Motionly needs to recommend a safe first workout, while priming the user for the camera setup that follows. Onboarding is the second-largest UX investment after the active workout itself, because it converts strangers into people who trust an app to coach their movement.

## Route

`/onboarding` (Phase 6 placeholder exists). Each of the five screens is a _step inside_ the onboarding flow — they are not separate routes. A future Phase 11 / 12 decision may swap to step-segmented URLs (`/onboarding/welcome`, `/onboarding/goal`, …) for shareability; for now treat them as one route with internal step state.

## Future implementation phase

**Phase 11** — Welcome, Goal, Fitness Level (screens 1–3).
**Phase 12** — Limitations, Camera Tutorial (screens 4–5).

## Entry points

- First-time launch from `/` after the splash (when the persisted `hasOnboarded` flag is absent / false).
- "Get started" CTA on `/welcome` once Phase 11 lands.

## Exit points

- Step 5 completes → `/permissions` (camera permission flow, Phase 16).
- A user with a half-complete onboarding state who returns later should resume at the step after their last completed selection.

## Primary user action

Advance through five short steps with five clear answers. The target is **under 90 seconds total**.

## Secondary actions

- Back navigation between steps (selections persist on back).
- "Skip for now" on optional steps where appropriate (Limitations is optional; Goal and Fitness Level are not).
- Theme is read from the OS / current value; no theme toggle inside onboarding.

## Shared chrome across all 5 steps

```
┌──────────────────────────────────────┐
│  ←                       1 / 5       │  ← back nav + step indicator
├──────────────────────────────────────┤
│  ● ● ○ ○ ○                            │  ← step dots
│                                      │
│  [ screen-specific content ]         │
│                                      │
│                                      │
│                                      │
│                                      │
│                                      │
│                                      │
├──────────────────────────────────────┤
│  ┌────────────────────────────────┐  │
│  │          Continue              │  │  ← primary CTA (disabled until valid)
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

- Step dots are visual progress only; tapping a future dot does **not** skip ahead. Tapping a past dot navigates back to that step.
- Back arrow: returns to the previous step on steps 2–5; on step 1, exits onboarding (returns to `/welcome`).
- Primary CTA copy varies per step. On the final step it reads "Set up camera".

---

## Step 1 — Welcome

### Purpose

Set the tone: calm, honest, privacy-aware. Tell the user what Motionly is in one line.

### Wireframe

```
┌──────────────────────────────────────┐
│  ←                       1 / 5       │
├──────────────────────────────────────┤
│  ● ○ ○ ○ ○                            │
│                                      │
│                                      │
│            [hero illustration]       │
│                                      │
│                                      │
│  Your AI coach lives in              │
│  your camera.                        │  ← text-h1
│                                      │
│  Motionly watches your form on       │
│  your device and gives you one       │  ← text-body, neutral-500
│  cue at a time. Video never          │
│  leaves your phone.                  │
│                                      │
│                                      │
│                                      │
├──────────────────────────────────────┤
│  ┌────────────────────────────────┐  │
│  │           Get started           │  │
│  └────────────────────────────────┘  │
│                                      │
│  Already have an account? Sign in    │  ← link below CTA, small
└──────────────────────────────────────┘
```

### Input type planned

None. Tap to continue.

### Skip / back

- Back exits to `/welcome` (or `/` if `/welcome` is not the entry point).

### Privacy copy

The line "Video never leaves your phone" appears on this very first screen. It is one of the four privacy moments documented in `../USER_FLOWS.md`.

### What not to ask yet

- Do not ask for email, name, or password here. Account creation is deferred to Phase 32 and is optional even then for local-only usage.
- Do not ask the user to agree to ToS / Privacy until immediately before account creation or payment.

---

## Step 2 — Goal

### Purpose

Capture _why_ the user is here, so future programming and copy can be tuned. Multi-select.

### Wireframe

```
┌──────────────────────────────────────┐
│  ←                       2 / 5       │
├──────────────────────────────────────┤
│  ● ● ○ ○ ○                            │
│                                      │
│  What's your goal?                   │  ← text-h2
│  Pick all that apply.                │  ← text-body neutral-500
│                                      │
│  ┌────────────────────────────────┐  │
│  │ ○  Build strength               │  │  ← selectable card
│  ├────────────────────────────────┤  │
│  │ ○  Lose weight                  │  │
│  ├────────────────────────────────┤  │
│  │ ○  Improve mobility             │  │
│  ├────────────────────────────────┤  │
│  │ ○  Start exercising safely      │  │
│  ├────────────────────────────────┤  │
│  │ ○  Get fit at home              │  │
│  └────────────────────────────────┘  │
│                                      │
├──────────────────────────────────────┤
│  ┌────────────────────────────────┐  │
│  │           Continue              │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

### Input type planned

Multi-select. Minimum one selection required to enable Continue.

### Skip / back

- No skip — at least one goal is needed to personalize beginner recommendations.
- Back returns to step 1; selections persist.

### What not to ask yet

- No weight, no current body composition, no calorie targets — Motionly is not a weight-loss calculator.
- No "ideal target weight" or "goal weight" — a body-image trap and unnecessary for movement coaching.

---

## Step 3 — Fitness Level

### Purpose

Choose a starting difficulty so the first workout isn't humiliating or trivial.

### Wireframe

```
┌──────────────────────────────────────┐
│  ←                       3 / 5       │
├──────────────────────────────────────┤
│  ● ● ● ○ ○                            │
│                                      │
│  How active are you right now?       │  ← text-h2
│                                      │
│  ┌────────────────────────────────┐  │
│  │  ○  Just starting               │  │
│  │     I'm new to working out      │  │  ← text-label neutral-500
│  ├────────────────────────────────┤  │
│  │  ○  Some experience             │  │
│  │     I move 1–2 times a week     │  │
│  ├────────────────────────────────┤  │
│  │  ○  Active                      │  │
│  │     I move 3+ times a week      │  │
│  └────────────────────────────────┘  │
│                                      │
├──────────────────────────────────────┤
│  ┌────────────────────────────────┐  │
│  │           Continue              │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

### Input type planned

Single-select from three cards.

### Skip / back

- No skip — one selection required.
- Back returns to step 2; selections persist.

### What not to ask yet

- No "fitness test" — squats-to-failure, plank time, etc. The user has not yet seen the camera flow; making them perform reps without coaching is exactly the experience we don't want.

---

## Step 4 — Limitations

### Purpose

Collect any movement areas the user wants the program to avoid stressing. Optional.

### Wireframe

```
┌──────────────────────────────────────┐
│  ←                       4 / 5       │
├──────────────────────────────────────┤
│  ● ● ● ● ○                            │
│                                      │
│  Anything we should work around?     │  ← text-h2
│                                      │
│  Choose any areas you want us to     │
│  go easier on. Tap "None" if you     │  ← text-body neutral-500
│  don't have anything specific.       │
│                                      │
│  ┌───────────┐ ┌───────────┐         │
│  │ Lower back│ │   Knees   │         │  ← multi-select chips
│  └───────────┘ └───────────┘         │
│  ┌───────────┐ ┌───────────┐         │
│  │ Shoulders │ │   Hips    │         │
│  └───────────┘ └───────────┘         │
│  ┌───────────┐ ┌───────────┐         │
│  │  Ankles   │ │  Wrists   │         │
│  └───────────┘ └───────────┘         │
│  ┌───────────┐                       │
│  │   None    │                       │
│  └───────────┘                       │
│                                      │
│  Anything else? (optional)           │
│  ┌────────────────────────────────┐  │
│  │                                │  │  ← free-text, ≤120 chars
│  └────────────────────────────────┘  │
│                                      │
│  If something hurts during a         │
│  workout, stop. Motionly is a coach, │  ← caption, neutral-500
│  not a medical app.                  │
│                                      │
├──────────────────────────────────────┤
│  ┌────────────────────────────────┐  │
│  │           Continue              │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

### Input type planned

- Multi-select chips. "None" deselects all other chips when chosen.
- Optional free-text field (length-limited).

### Skip / back

- Tapping "None" or leaving everything unselected is allowed — the field is optional. Continue is always enabled.
- Back returns to step 3; selections persist.

### Privacy copy

- The footnote disclaims medical / injury framing in line with Design Principle 6.

### What not to ask yet

- No surgical history, no diagnoses, no medication. Out of scope and out of expertise.
- Do not present a body diagram with tap-to-select hot spots — too easy to misinterpret as a medical workflow.

---

## Step 5 — Camera Tutorial

### Purpose

Prepare the user for the camera permission prompt that follows. This is the only step that has internal animation; it shows three illustrated tips before the explainer for the permission itself.

### Wireframe

```
┌──────────────────────────────────────┐
│  ←                       5 / 5       │
├──────────────────────────────────────┤
│  ● ● ● ● ●                            │
│                                      │
│  Let's set up your camera.           │  ← text-h2
│                                      │
│  Three tips for the best coaching:   │  ← text-body neutral-500
│                                      │
│  ┌────────────────────────────────┐  │
│  │  [tip 1 illustration]           │  │
│  │  Place your phone 2–3 meters    │  │
│  │  away.                          │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │  [tip 2 illustration]           │  │
│  │  Make sure your full body is    │  │
│  │  in view.                       │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │  [tip 3 illustration]           │  │
│  │  Good lighting = better         │  │
│  │  coaching.                      │  │
│  └────────────────────────────────┘  │
│                                      │
│  Motionly will ask for camera        │
│  access next. Video is processed     │  ← caption, neutral-500
│  on your device and never            │
│  uploaded.                           │
│                                      │
├──────────────────────────────────────┤
│  ┌────────────────────────────────┐  │
│  │      Set up camera              │  │  ← CTA changes copy on last step
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

### Input type planned

Tap CTA to continue. The three tip cards can be viewed inline (no carousel needed) or as a vertical scroll on smaller screens.

### Skip / back

- A subtle "Skip tutorial" link can sit below the CTA — recommended for repeat onboarders.
- Back returns to step 4; selections persist.

### Privacy copy

- The line "Video is processed on your device and never uploaded" is the second on-device privacy moment and uses the exact same wording as step 1's hero.

### What not to ask yet

- Do not trigger the browser camera permission prompt on this screen. It happens on the next screen (`/permissions`), once the user has tapped "Set up camera" and confirmed they understand.

---

## Content rules across onboarding

- Copy is conversational, second-person, no jargon. No formal "Please indicate your preferred…" language.
- Every step says **one thing** and asks **one question**.
- Do not pre-select options to bias answers.
- Do not use copy that implies the user is broken ("Let's fix your form", "We'll help you get unstuck").

## Data requirements (future only)

- A future Zustand store (Phase 29) will hold `{ goals: GoalKey[], fitnessLevel: 'beginner' | 'some' | 'active', limitations: LimitationKey[], limitationNote?: string }`.
- Persistence to IndexedDB (Phase 30) and Supabase profile (Phase 31) happens only after step 5 is completed _and_ the user has at least started a session.
- Onboarding state is **structural state**, not analytics; do not log individual answers to a third party.

## States to handle later

- **Resuming partially completed onboarding:** restore last completed step.
- **Reduced motion preference:** disable step-transition slide animation; cross-fade instead.
- **Offline:** onboarding works fully offline; persistence is local-only until network returns.

## Accessibility notes

- Step dots are decorative; they must have `aria-hidden="true"`. The visible "n / 5" text is the screen reader source of truth.
- Card selectors must be implemented as buttons (or radio/checkbox groups), not divs with tap handlers.
- Focus order: back arrow → step indicator (read-only) → first selectable item → Continue CTA.
- Each step's heading should land focus on step entry so screen readers announce the question.
- Free-text field on step 4 is optional and has a visible label, not just a placeholder.

## Privacy / safety notes

- No third-party scripts on onboarding (analytics deferred to Phase 53 and even then opt-in).
- Free-text in step 4 is stored locally only; if it ever syncs to Supabase, it must be encrypted at rest and not used for downstream personalization beyond program adaptation.

## Do not fake

- Do not pre-fill the user's name or detect locale-based defaults that imply Motionly already knows the user.
- Do not show fake "Most users pick: Build strength" badges to bias selection.
- Do not display fake "Estimated calories per week" projections — Motionly does not estimate calories.
- Do not invent a starter workout name or program identity on step 5 ("You've been assigned to the Foundations program!") — program assignment belongs to the actual program engine (Phase 33+).
