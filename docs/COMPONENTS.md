# Motionly — Component Primitives

This document covers the Phase 8 primitive UI library: what each
primitive is for, when to reach for it, accessibility expectations,
light / dark behavior, and the rules every consumer must follow.

It is paired with
[`ARCHITECTURE.md`](./ARCHITECTURE.md) (folder layering) and
[`CODING_STANDARDS.md`](./CODING_STANDARDS.md) (TypeScript / React /
styling rules). When this file and the standards disagree, the
standards win.

---

## 1. Phase 8 Purpose

Phase 8 of [`MOTIONLY_MASTER_PLAN.md`](../MOTIONLY_MASTER_PLAN.md)
introduces the **reusable UI primitives** that all future product
screens compose from. The primitives are Tailwind- and token-based,
typed, accessible, and intentionally minimal.

Phase 8 deliberately ships:

- Primitive components only — no product screens, no data-backed UI,
  no fake users / workouts / stats / AI feedback.
- A platform-adapter helper for haptics (`@platform/haptics`) so the
  `Button` does not call `navigator.vibrate` directly.
- A small `cn` utility (`@utils/cn`) wrapping `clsx`.

Phase 8 deliberately does **not** ship:

- Real authentication, real workouts, real AI feedback, real
  subscriptions, or any feature behavior.
- Phase 9 feedback / status components (see §6 below).
- Animation libraries (Framer Motion arrives in a later phase).
- A runtime component gallery / Storybook route.

---

## 2. Component Inventory

| Primitive | Module                           | Use for                                                  |
| --------- | -------------------------------- | -------------------------------------------------------- |
| `Button`  | `@components/primitives/Button`  | Tap targets: primary CTA, destructive, ghost, icon.      |
| `Input`   | `@components/primitives/Input`   | Single-line text fields with label / error / helper.     |
| `Text`    | `@components/primitives/Text`    | Typographic copy mapped to Phase 5 utilities.            |
| `Heading` | `@components/primitives/Text`    | Convenience for `h1` / `h2` / `h3` headings.             |
| `Card`    | `@components/primitives/Card`    | Surface for grouped content; flat / elevated / outlined. |
| `Divider` | `@components/primitives/Divider` | Thin separator (horizontal `<hr>` or vertical span).     |
| `Spacer`  | `@components/primitives/Spacer`  | One-off vertical/horizontal whitespace.                  |
| `Row`     | `@components/primitives/Row`     | Horizontal flex layout with align/justify/gap.           |
| `Column`  | `@components/primitives/Column`  | Vertical flex layout with align/justify/gap.             |
| `Badge`   | `@components/primitives/Badge`   | Small color-coded status / category label.               |
| `Tag`     | `@components/primitives/Tag`     | Static metadata label.                                   |
| `Chip`    | `@components/primitives/Chip`    | Interactive selectable pill (`<button>`).                |
| `Icon`    | `@components/primitives/Icon`    | Lucide-icon wrapper with size + tone tokens.             |
| `Avatar`  | `@components/primitives/Avatar`  | Round avatar with image / initials / icon fallback.      |

The barrel `@components/primitives` re-exports every primitive plus the
relevant type aliases (`ButtonVariant`, `IconTone`, etc.). The
top-level `@components` barrel re-exports primitives **and** the
Phase 6 routing-infrastructure components (`RoutePlaceholder`,
`BottomTabBar`, `ServiceWorkerStatusPill`).

Prefer importing from the subfolder barrel (`@components/primitives`)
in product code so the path documents intent.

---

## 3. Importing

Examples in prose:

- Import a single primitive directly:
  - `import { Button } from '@components/primitives';`
- Import several primitives at once:
  - `import { Card, Column, Heading, Text } from '@components/primitives';`
- Import a lucide icon and wrap it:
  - `import { Eye } from 'lucide-react';`
  - `import { Icon } from '@components/primitives';`
  - `<Icon icon={Eye} tone="muted" label="Visible" />`
- Import the haptics adapter from within feature code (rarely needed —
  `Button` already does this for you):
  - `import { triggerLightHaptic } from '@platform/haptics';`

Do **not** bulk-import all lucide icons. Pull only the icon components
you use so tree-shaking continues to work.

---

## 4. When to Use Each Primitive

- **`Button`** — every tappable surface that performs an action. Pick a
  single `variant="primary"` per screen; reach for `secondary` /
  `ghost` for supporting actions. The `icon` variant needs an
  `aria-label`. Use the `loading` prop for "request in flight" states;
  use `haptic={true}` on actions where a small confirmation pulse
  helps (e.g. "Start Workout").
- **`Input`** — single-line text entry. Always pass a `label`. Use
  `error` to flip into the invalid state and `helperText` for ambient
  guidance. Password fields get a built-in show/hide toggle.
- **`Text` / `Heading`** — every piece of static copy in a screen.
  Choose the visual `variant` and override the semantic element via
  `as` when the heading hierarchy requires it.
- **`Card`** — group related content into a surface. Choose
  `elevated` for emphasis (e.g. "Today's workout") and `outlined` for
  compact list rows where shadows would be visual noise.
- **`Divider`** — separate logically distinct content blocks. Avoid
  using it where spacing or a heading already does the job.
- **`Spacer`** — one-off whitespace. Prefer `Row` / `Column` `gap` and
  Tailwind utilities for most spacing.
- **`Row` / `Column`** — flex containers with constrained, named
  props. Reach for these instead of inlining `flex`, `items-*`,
  `justify-*`, `gap-*` repeatedly.
- **`Badge`** — short, color-coded status / category labels.
- **`Tag`** — static metadata pills (e.g. "Beginner", "10 min").
- **`Chip`** — interactive selectable pills. Always renders as a
  `<button>`; sets `aria-pressed` from the `selected` prop.
- **`Icon`** — wrap every Lucide icon in product screens through this
  component so size and color stay tokenized. Pass `label` when the
  icon carries meaning; omit it for decorative use.
- **`Avatar`** — round avatar slot. Pass `src` + `alt`, or `initials`
  computed from real user data. Omitting both renders a generic
  neutral fallback — never a fabricated identity.

---

## 5. Accessibility Rules

- **Focus visibility** — every interactive primitive (`Button`,
  `Chip`, the password toggle inside `Input`) uses a Tailwind
  `focus-visible` ring that pairs with the global `:focus-visible`
  outline configured in `src/index.css`. Do not strip the ring.
- **Touch targets** — `Button` default size (`md`) renders 44px tall,
  matching the iOS / Android minimum. Use the `sm` size only for
  dense desktop UI where the touch target is not the constraint.
- **Icon-only buttons** — `<Button variant="icon">` requires
  `aria-label`. The same rule applies to bespoke icon-only controls
  built with `Chip` or `Icon`.
- **Form fields** — `Input` always renders a visible label, exposes
  errors and helper text via `aria-describedby`, and sets
  `aria-invalid` when an `error` is provided. The required hint is
  rendered as text (`"(required)"`), not a color-only indicator.
- **Color is never the only signal** — `Badge`, `Tag`, `Chip`, and
  `Input`'s error state always pair their tone with text or icon
  signaling. If you find yourself relying on color alone, add a label
  or icon.
- **Keyboard reach** — `Chip` is a button and inherits keyboard
  focus / activation. Do not wrap it in another interactive element.
- **Reduced motion** — the `Button` loading spinner uses Tailwind's
  `motion-reduce:animate-none` so users with `prefers-reduced-motion`
  do not see the spin animation.
- **Avatar alt text** — when `src` is provided, pass meaningful `alt`
  text (e.g. the user's display name). Pass an empty string when the
  avatar is purely decorative next to a visible name.

---

## 6. Light / Dark Expectations

Every primitive ships paired light and dark Tailwind classes using the
Motionly tokens defined in `tailwind.config.ts`. Specifically:

- Surfaces use `bg-motionly-bg-light` / `bg-motionly-neutral-*` for
  light mode and `dark:bg-motionly-bg-dark` / `dark:bg-motionly-neutral-*`
  for dark mode.
- Text uses `text-motionly-neutral-900` / `text-motionly-neutral-50`
  and the muted / subtle variants drop one or two steps down the
  neutral ramp in each theme.
- Brand colors (`text-motionly-primary`, `text-motionly-accent`,
  `text-motionly-warning`, `text-motionly-danger`) work identically in
  both themes; only their tonal surfaces change.

Theme toggling is handled by `ThemeProvider`. Primitives do not own
their own theme state — they read the ambient `.dark` class from the
document root.

---

## 7. No-Fake-Data Rules

These primitives are presentation only. Callers are responsible for
real data; the primitives must never invent it:

- **`Avatar`** does not derive initials from `alt`. Pass real
  initials, or omit them entirely.
- **`Badge`** / **`Tag`** / **`Chip`** carry whatever label the caller
  passes — they do not invent counts, scores, or selections.
- **`Button`** never renders fake success / progress messaging. The
  `loadingLabel` is an opt-in accessibility label for the current
  request — not a fabricated status.
- **`Input`** has no built-in validation rules; do not wire fake
  validation into the primitive.

If you find yourself wanting to ship a sample workout, a sample form
score, or a sample streak through one of these primitives during
Phase 8, stop and revisit
[`docs/CODING_STANDARDS.md` §12](./CODING_STANDARDS.md#12-no-fake-data--product-claim-rules).

---

## 8. Phase 9 — Feedback & Status Components

Phase 9 adds the feedback / status / progress component library that
the active-workout HUD, post-workout summary, progress screen, and any
async product surface will depend on. The components live under
`src/components/feedback/` and are barrel-exported from
`@components/feedback` — keep that import path in product code so the
intent reads clearly.

### Inventory

| Component             | Module                                     | Use for                                                     |
| --------------------- | ------------------------------------------ | ----------------------------------------------------------- |
| `CircularProgress`    | `@components/feedback/CircularProgress`    | Animated SVG ring for form / session scores.                |
| `LinearProgress`      | `@components/feedback/LinearProgress`      | Workout / rep / session progress bar.                       |
| `ScoreBadge`          | `@components/feedback/ScoreBadge`          | Compact color-coded numeric score in lists and cards.       |
| `FormCueCard`         | `@components/feedback/FormCueCard`         | Animated one-at-a-time coaching cue during active workouts. |
| `RepCounter`          | `@components/feedback/RepCounter`          | Large animated rep number with scale pulse on increment.    |
| `WorkoutTimer`        | `@components/feedback/WorkoutTimer`        | Presentational elapsed / countdown clock readout.           |
| `ToastProvider`       | `@components/feedback/Toast`               | Motionly-owned toast queue + viewport.                      |
| `useToast`            | `@components/feedback/Toast`               | Hook returning `show` / `dismiss` / `dismissAll`.           |
| `SkeletonLoader`      | `@components/feedback/SkeletonLoader`      | Async loading placeholder with token-aware pulse.           |
| `EmptyState`          | `@components/feedback/EmptyState`          | Honest "nothing here yet" surface with CTA slots.           |
| `ErrorBoundary`       | `@components/feedback/ErrorBoundary`       | Render-error boundary with retry fallback.                  |
| `ConfidenceIndicator` | `@components/feedback/ConfidenceIndicator` | "Camera view unclear" / low-confidence banner.              |

`@components/feedback/index.ts` re-exports every component plus the
public type aliases (`ScoreTone` lives in `@utils/score`,
`ToastTone` / `FormCueTone` / `LinearProgressTone` ship from the
component modules).

The top-level barrel `@components` also re-exports the feedback
components alongside the Phase 8 primitives and Phase 6 routing
helpers. Prefer the subfolder barrel in product code so the import
path documents intent.

### Data ownership rules

- **Components display passed props only.** No feedback component
  generates its own score, progress, rep count, time, or confidence
  rating. Real values must arrive from a future store / engine.
- **No internal timers, intervals, or animations driven by fake data.**
  `WorkoutTimer` formats whatever value the caller passes; it never
  starts a `setInterval`. `RepCounter` pulses on prop change; it
  never auto-increments.
- **No fabricated copy.** `FormCueCard`, `Toast`, `EmptyState`,
  `ConfidenceIndicator` carry only the message the caller supplies.
- **Numbers are clamped, not invented.** `CircularProgress`,
  `LinearProgress`, `ScoreBadge` clamp via `clampScore` /
  `clampProgress` in `@utils/score` (range `0–100`). Non-finite inputs
  collapse to `0` so the UI degrades safely.
- **Tone mapping lives in `@utils/score`.** Components never inline
  the thresholds. `scoreTone(value)` returns `'good' | 'warning' |
'danger'` for `>= 80` / `50–79` / `< 50`.

### When to use each component

- **`CircularProgress`** — anchor of the post-workout summary and any
  surface that wants the score to _feel_ like a result. Pass a real
  numeric `value` and a meaningful `label`.
- **`LinearProgress`** — set-of-set, rep-of-rep, free-tier-of-quota,
  onboarding-step-of-N. Pick a `tone` based on what the bar
  represents; defaults to `primary`.
- **`ScoreBadge`** — list rows and dense summary cards where a full
  ring would steal attention.
- **`FormCueCard`** — exactly one rendered at a time, per Design
  Principle 4. Replacement cues swap by passing a new `message`. Use
  `ariaLive="assertive"` during active sets; `polite` elsewhere.
- **`RepCounter`** — the active workout HUD's largest single element.
  Set `animateOnChange={false}` if your caller updates the value
  faster than the animation can complete.
- **`WorkoutTimer`** — top HUD chip (`size="sm"`) and rest countdown
  (`size="xl"`). Mode is informational; the caller decides whether
  the value is increasing or decreasing.
- **`ToastProvider` / `useToast`** — wrap the app root once. Call
  `show({ tone, message })` from product code. `error` tone goes to
  an `aria-live="assertive"` region; everything else is polite.
- **`SkeletonLoader`** — render _the shape_ of upcoming content, not
  a generic spinner. Use `shape="line"` with `lines={n}` for text
  blocks; `shape="circle"` for avatars; `shape="card"` for cards.
- **`EmptyState`** — "no workouts yet", "no progress yet". Title /
  description must be honest; the CTA must perform the action that
  fills the section.
- **`ErrorBoundary`** — wrap a route, a panel, or a single risky
  widget. The default fallback offers a reset button. Pass `onError`
  if you need to log to a future in-house diagnostic (Phase 53);
  Sentry / external logging is **not** wired up.
- **`ConfidenceIndicator`** — only rendered when the caller has a
  real confidence reading. `lost` becomes a `role="alert"`; all
  other statuses are polite `role="status"`.

### Accessibility rules

- **Progressbar semantics.** `CircularProgress` and `LinearProgress`
  expose `role="progressbar"` with `aria-valuemin=0`,
  `aria-valuemax=100`, and a clamped `aria-valuenow`. Always supply
  either a visible label or `aria-label`.
- **`aria-live` discipline.** `FormCueCard` defaults to `polite`;
  active-workout callers should set `assertive` so the cue is
  announced during movement. `RepCounter` is `polite` so rep
  announcements never preempt a form cue. `ConfidenceIndicator`
  picks `assertive` only for the `lost` status. Toasts split the
  viewport into a polite list and an assertive list.
- **Color is never the only signal.** `ScoreBadge` always renders
  the number; `CircularProgress` always renders the central value
  (unless `showValue={false}`, which the caller must justify);
  `ConfidenceIndicator` pairs every state with text + icon.
- **Reduced motion.** Every animated component honors
  `prefers-reduced-motion`. Rings fill instantly, cue cards skip the
  slide, rep counters skip the scale pulse, toasts use opacity only,
  skeleton loaders rely on Tailwind's `motion-reduce:animate-none`.
- **ErrorBoundary fallback is a `role="alert"` region** so screen
  readers announce render failures.

### Toast architecture

The toast system is an **in-house** Motionly implementation — there is
no `react-hot-toast` dependency. `ToastProvider` owns:

- The queue (`useState<Toast[]>`).
- The auto-dismiss timers (`window.setTimeout` per toast).
- The viewport, mounted at the bottom of the provider's subtree.

Product code must:

1. Wrap the app (or the relevant subtree) with `<ToastProvider>`.
2. Use `useToast()` inside components. Never import a third-party
   toast API directly.
3. Treat toasts as UI notifications only. The Phase 44 Web Push
   notification work is unrelated and is not implemented by this
   system.

### Intentionally deferred after Phase 9

- **Real active-workout assembly** (Phase 27). The components exist;
  the screen does not.
- **Real ML outputs** — pose detection, joint angles, exercise
  engines, form rules. Cues, scores, and confidence readings are
  always caller-supplied today; no engine yet.
- **Real workout progress data** — workout library, plans, history,
  streaks all arrive in their own phases.
- **Real analytics dashboards.** Charting libraries are **not**
  introduced in Phase 9.
- **Web Push notifications** (Phase 44). The toast system covers UI
  notifications only.
- **Dashboard / library / detail / camera / paywall product screens.**
  Phase 9 builds the parts; later phases compose them into screens.

---

## 9. Adding a New Primitive

Before introducing a new primitive:

1. Confirm it cannot be composed from the existing primitives plus
   Tailwind utilities. Three similar lines is better than a premature
   abstraction.
2. Follow the naming conventions in
   [`CODING_STANDARDS.md`](./CODING_STANDARDS.md): `PascalCase.tsx`,
   one default visual identity per file.
3. Use the existing `@utils/cn` helper for class composition; do not
   reintroduce `clsx` per file.
4. Use the Motionly Tailwind tokens — never hardcoded hex.
5. Add TSDoc covering: what it is for, variants, accessibility
   expectations, what it is **not** for.
6. Export it from `src/components/primitives/index.ts`.
7. Update this document in the same change set.
