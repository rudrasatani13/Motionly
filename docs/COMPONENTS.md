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

## 8. Intentionally Deferred to Phase 9 and Later

The following components are explicitly **not** part of Phase 8 and
must not be back-ported into the primitive library:

- `CircularProgress` — animated SVG form-score ring (Phase 9).
- `LinearProgress` — workout / rep progress bar (Phase 9).
- `ScoreBadge` — color-coded numeric form score (Phase 9).
- `FormCueCard` — animated coaching-cue card (Phase 9).
- `RepCounter` — animated rep number (Phase 9).
- `WorkoutTimer` — countdown / elapsed timer (Phase 9).
- `Toast` — toast / notification queue (Phase 9).
- `SkeletonLoader` — async placeholder (Phase 9).
- `EmptyState` — first-session / no-data empty state (Phase 9).
- `ErrorBoundary` — graceful error recovery wrapper (Phase 9).
- `ConfidenceIndicator` — "camera view unclear" banner (Phase 9).

These belong to Phase 9 — Core UI Component Library: Feedback & Status
Components. They land alongside the animation and motion infrastructure
that those components need.

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
