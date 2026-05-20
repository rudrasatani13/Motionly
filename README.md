# Motionly

> **Move Better.**

Motionly is a PWA-first, privacy-first AI fitness coach foundation. The MVP roadmap targets browser-based real-time movement coaching using on-device pose estimation in later phases.

---

## Current Status

- **Phase 1 — Development Environment Setup:** complete.
- **Phase 2 — PWA Foundation (Vite + React + TypeScript):** complete.
- **Phase 3 — Git Repository & Branching Strategy Setup:** complete.
- **Phase 4 — Project Folder Structure & Architecture Standards:** complete.
- **Phase 5 — Design System Foundation: Tokens & Theme:** complete.
- **Phase 6 — Routing Architecture Setup:** complete.
- **Phase 7 — Wireframing & User Flow Documentation:** complete (docs only; no app screens were built).
- **Phase 8 — Core UI Component Library (Primitives):** complete. Reusable primitives (`Button`, `Input`, `Text`/`Heading`, `Card`, `Divider`, `Spacer`, `Row`, `Column`, `Badge`, `Tag`, `Chip`, `Icon`, `Avatar`) live under `src/components/primitives/` and are documented in [`docs/COMPONENTS.md`](./docs/COMPONENTS.md). No product screens, data-backed UI, or fake stats were introduced.
- **Phase 9 — Core UI Component Library (Feedback & Status):** complete. Reusable feedback / status / progress components (`CircularProgress`, `LinearProgress`, `ScoreBadge`, `FormCueCard`, `RepCounter`, `WorkoutTimer`, `ToastProvider` / `useToast`, `SkeletonLoader`, `EmptyState`, `ErrorBoundary`, `ConfidenceIndicator`) live under `src/components/feedback/`. They compose the Phase 8 primitives, are token-coded via `@utils/score`, honor `prefers-reduced-motion`, and are documented in [`docs/COMPONENTS.md`](./docs/COMPONENTS.md) §8. No product screens, no real workouts, no real ML outputs, no real camera, no fake users / workouts / stats / AI feedback / scores / reps / timers / confidence / streaks / subscriptions / analytics were introduced.
- **Phase 10 — Splash & App Launch Experience:** complete. An inline pre-React HTML splash paints in `index.html` on a dark `#0A0A0F` canvas; a React `<LaunchScreen>` (Framer Motion scale + fade, reduced-motion aware) takes over after hydration; `<LaunchGate>` + `useLaunchDecision` (in `src/launch/`) hold the launch screen for ~1.8s while a read-only `hasOnboarded` reader (`src/platform/onboarding-storage.ts`) and a future-safe `getLaunchAuthState()` placeholder resolve, then release `<AppRouter>` on the canonical pathname. A `useServiceWorkerUpdatePrompt` hook (`src/components/launch/`) listens for the existing `motionly:sw` `update-available` event and surfaces a Phase 9 toast with a `Refresh` action — no auto reload. `ShowToastInput` gained an optional `action` field as a minimal Phase 9 extension. Real Supabase auth, real session rehydration, real `hasOnboarded` writes, onboarding completion, dashboards, cameras, ML, payments, and analytics are still intentionally deferred to their later phases.
- **Phase 11 — Onboarding Flow: Screens 1–3:** complete. `zustand` is installed for the first in-memory onboarding draft store (`src/store/useOnboardingStore.ts`), with stable domain types in `src/types/onboarding.ts`. `/welcome` is now a real mobile-first onboarding entry page, and `/onboarding` renders the first three internal steps only: welcome, multi-select goals, and single-select fitness level. The flow includes five-dot progress, back navigation, selection persistence while moving through the in-memory flow, and Framer Motion step transitions that respect `prefers-reduced-motion`. Step 3 stops at an honest Phase 12 handoff panel; screens 4–5, camera permission, onboarding completion, persistence, auth, Supabase, dashboard, workouts, camera, ML, payments, and analytics remain deferred.
- **Phase 12 — Onboarding Flow: Screens 4–5 (Limitations & Camera Tutorial):** complete. `/onboarding` now renders all five screens: welcome, goals, fitness level, movement limitations (multi-select chips for lower back, knees, shoulders, hips, ankles, wrists, none, plus an optional ≤120-character "anything else" note with safety copy), and a camera tutorial / permission primer (3-step setup walkthrough with Framer Motion entrance, reduced-motion aware). A new `src/platform/camera-permission.ts` adapter is the only Phase 12 caller of `navigator.mediaDevices.getUserMedia`; it requests **video only**, stops every track immediately after permission resolves, returns a typed `granted | denied | unavailable | error` result, and never keeps a stream, frame, or preview alive. `src/platform/onboarding-storage.ts` gained a write path (`completeOnboardingStorage`) that creates the IndexedDB store on demand and persists `hasOnboarded = true` alongside a minimal completion record (timestamp, goals, fitness level, limitations, optional notes, whether camera was granted). On the camera step the primary CTA is user-initiated, has a loading state while the browser prompt resolves, navigates to Home `/` on grant, and offers an honest "Continue without camera for now" path for denial / unavailable / error states that still completes onboarding locally without pretending the camera was granted. **No fake users, sessions, workouts, stats, AI feedback, scores, streaks, subscriptions, or analytics were added; Supabase sync is intentionally skipped until backend/auth phases land; no live camera preview, no skeleton overlay, and no ML are implemented.**

### Honest scope note

This repository is an early-stage foundation. The following are **planned for later phases of [`MOTIONLY_MASTER_PLAN.md`](./MOTIONLY_MASTER_PLAN.md) and do NOT exist yet**:

- Real dashboard with today's workout, streaks, and stats (Phase 13)
- Live camera preview, silhouette setup, and pose detection (Phase 16+)
- On-device pose estimation, skeleton overlay, form scoring
- Real-time AI coaching, voice cues, rep counting
- Workout library, workout plans, adaptive difficulty
- Authentication, user accounts, profiles
- Supabase backend, sync, history, analytics
- Subscriptions, paywall, free-tier enforcement
- Settings UI, accessibility audit, i18n

Phase 6 introduced React Router 6 and a routing skeleton: every route a future phase will need now has an honest placeholder page that names the route, the URL pattern, and the future phase that will build the real screen. There is **no fake user state, no fake workouts, no fake stats, no fake AI feedback, and no fake subscription state anywhere in the repo.** Protected routes are wrapped in a structural-only `<RequireAuth>` guard; real authentication is still deferred to Phase 32.

Phase 7 added UX planning documentation only — wireframes for every planned screen, user-flow narratives, and Mermaid diagrams of the five key journeys. Wireframes live in [`docs/wireframes/`](./docs/wireframes/) and user-flow narratives in [`docs/USER_FLOWS.md`](./docs/USER_FLOWS.md). **No runtime app code changed in Phase 7.** Sample names and numbers in the wireframes are clearly labeled illustrative documentation and must not be pasted into product code as if real workouts, users, or stats existed.

Phase 8 added Motionly's primitive UI library under `src/components/primitives/` plus a tiny `triggerLightHaptic()` adapter in `src/platform/haptics.ts` (the chokepoint the `Button` uses instead of touching `navigator.vibrate` directly). The full primitive inventory, accessibility rules, and the list of components previously deferred to Phase 9 (`CircularProgress`, `LinearProgress`, `ScoreBadge`, `FormCueCard`, `RepCounter`, `WorkoutTimer`, `Toast`, `SkeletonLoader`, `EmptyState`, `ErrorBoundary`, `ConfidenceIndicator`) are documented in [`docs/COMPONENTS.md`](./docs/COMPONENTS.md). The primitives are presentational only — no real app screens, data-backed UI, or fake users / workouts / stats / AI feedback ship in this phase.

Phase 9 added the feedback / status / progress component library under `src/components/feedback/` plus the `@utils/score` (`clampScore`, `scoreTone`) and `@utils/formatDuration` helpers. `framer-motion` was added as a production dependency for the score-ring sweep, cue-card slide / fade, rep-counter pulse, toast and confidence-banner transitions — all gated by `prefers-reduced-motion`. The toast system (`ToastProvider`, `ToastViewport`, `useToast`) is an **in-house Motionly queue**; no `react-hot-toast` or similar third-party dependency was added, and Phase 44 Web Push notifications remain unimplemented. Every feedback component is presentational — none of them generate scores, reps, timers, cues, confidence readings, toasts, or empty-state copy on their own. The future engines / stores supply real values; if the caller has nothing real to render, the component is omitted.

Phase 10 added Motionly's launch experience. The inline pre-React splash in `index.html` paints the dark `#0A0A0F` canvas + wordmark + tagline before any JS / CSS bundle resolves, so there is no white flash on any system theme. The React `<LaunchScreen>` under `src/components/launch/` takes over on the same canvas with a Framer Motion `0.9 → 1.0` scale + fade on the wordmark and a delayed tagline fade — both gated by `prefers-reduced-motion`. `<LaunchGate>` (in `src/launch/`) holds the launch screen for ≈ 1.8 seconds while `useLaunchDecision` resolves the read-only `readHasOnboarded()` reader from `src/platform/onboarding-storage.ts` and the future-safe `getLaunchAuthState()` placeholder, then reconciles the URL (only `/` → `/welcome`) before releasing `<AppRouter>`. Direct deep links into Phase 6 placeholders remain testable. The Phase 9 toast system gained an optional `action` field on `ShowToastInput`; the new `useServiceWorkerUpdatePrompt` hook listens for the existing `motionly:sw` `update-available` event and surfaces "Refresh to use the latest version." with a `Refresh` action that only reloads on user input. **No fake users, fake sessions, fake tokens, fake `hasOnboarded` writes, fake camera, fake ML, fake workouts, fake stats, fake AI feedback, fake subscriptions, or fake analytics were introduced.** Real Supabase auth (Phase 32), real onboarding completion writes (Phase 12), and the real IndexedDB schema (Phase 30) are still deferred.

Phase 11 added the first half of onboarding. `/welcome` now introduces Motionly honestly with a primary "Get Started" CTA to `/onboarding` and a secondary sign-in link to the still-placeholder `/login` route. `/onboarding` remains a single route with internal step state for the first three screens from the wireframe: welcome, goal selection, and fitness level. The Zustand store is intentionally local and in-memory only: selections persist when moving back and forward inside the flow, but a full browser refresh may reset them. Step 3 does not write `hasOnboarded`, does not navigate home, and does not fake completion; it shows a Phase 12 handoff for limitations and the camera tutorial.

Phase 12 completed onboarding. `/onboarding` now renders all five screens with five-dot progress that lights up step-by-step. Screen 4 (Limitations) is a multi-select chip list (lower back, knees, shoulders, hips, ankles, wrists, none) with mutually-exclusive "None" semantics handled in the store and an optional ≤120-character free-text note carrying a clear safety message — Motionly is a coach, not medical care. Screen 5 (Camera Tutorial) is a 3-step setup primer rendered as cards with subtle Framer Motion entrance animations gated by `prefers-reduced-motion`; it does **not** request camera permission until the user taps the primary CTA. `src/platform/camera-permission.ts` is the single chokepoint that calls `navigator.mediaDevices.getUserMedia({ video: true })`, stops every track immediately after permission resolves, and returns a typed `granted | denied | unavailable | error` result — no stream, frame, preview, or recording leaves the adapter. `src/platform/onboarding-storage.ts` gained a write path (`completeOnboardingStorage`) that creates the IndexedDB schema on demand and persists `hasOnboarded = true` alongside a minimal completion record (timestamp, goals, fitness level, limitations, optional notes, whether camera was granted). After a granted prompt — or an honest "Continue without camera for now" exit on denial / unavailable / error — the page writes the flag and navigates to Home `/`. On a fresh launch the LaunchGate now routes returning users past `/welcome` because the real flag exists. Supabase sync is intentionally skipped until backend/auth phases land. No fake users, sessions, workouts, stats, AI feedback, scores, streaks, subscriptions, or analytics were added; the camera platform code never stores or uploads video.

---

## Tech Stack (currently present)

- **[Vite](https://vitejs.dev/)** — dev server and bundler
- **[React](https://react.dev/) 18** with **TypeScript** (strict mode)
- **[React Router](https://reactrouter.com/) 6** — route table, route guards, layouts, route-level code splitting (Phase 6)
- **PWA tooling** via [`vite-plugin-pwa`](https://vite-pwa-org.netlify.app/) + [`workbox-window`](https://developer.chrome.com/docs/workbox/) (service worker, precache, runtime caching)
- **[Tailwind CSS](https://tailwindcss.com/)** via PostCSS for Motionly theme tokens and utility styling
- **[clsx](https://github.com/lukeed/clsx)** for class composition (used by every primitive through `@utils/cn`)
- **[lucide-react](https://lucide.dev/)** icon set, wrapped by `<Icon>` so size + tone stay tokenized
- **[Framer Motion](https://www.framer.com/motion/)** for the Phase 9 feedback animations (ring sweep, cue slide, rep pulse, toast / banner transitions), all gated by `prefers-reduced-motion`
- **[Zustand](https://zustand-demo.pmnd.rs/)** for the Phase 11 in-memory onboarding draft store
- **Fontsource** packages for Inter Variable and Noto Sans Devanagari font loading
- **[pnpm](https://pnpm.io/)** as the package manager (Node 20+)

Future stack additions (Supabase, MediaPipe, etc.) are introduced in their own phases per `MOTIONLY_MASTER_PLAN.md` and are not present yet.

---

## Setup

See **[`docs/SETUP.md`](./docs/SETUP.md)** for the full developer environment guide — Node, pnpm, VS Code, real-phone LAN testing, and troubleshooting.

Quick start once Node 20+ and pnpm are installed:

```bash
nvm use           # match the Node version pinned in .nvmrc
pnpm install
pnpm dev          # http://localhost:5173 + LAN URL
```

---

## Common Commands

| Command             | What it does                                                                |
| ------------------- | --------------------------------------------------------------------------- |
| `pnpm install`      | Install dependencies (uses `pnpm-workspace.yaml`)                           |
| `pnpm dev`          | Vite dev server bound to LAN (`--host`) so a phone can reach it             |
| `pnpm dev:local`    | Vite dev server bound to `localhost` only                                   |
| `pnpm lint`         | ESLint over `src/` + tooling files (TypeScript, React, hooks, a11y, format) |
| `pnpm lint:fix`     | ESLint with `--fix` (auto-applies safe fixes)                               |
| `pnpm format`       | Prettier write across the repo                                              |
| `pnpm format:check` | Prettier check only (no writes) — used by the pre-commit hook               |
| `pnpm typecheck`    | Strict TypeScript check across app + Vite config                            |
| `pnpm build`        | `tsc -b` then `vite build` → `dist/` with PWA artifacts                     |
| `pnpm preview`      | Serve the production build from `dist/` (http://localhost:4173)             |

---

## Testing the PWA

> Service workers and PWA install prompts only run against the **production build**, not the dev server (`devOptions.enabled: false` in `vite.config.ts`).

```bash
pnpm build && pnpm preview
```

Then open http://localhost:4173/ and check DevTools → Application → Manifest and Service Workers. See `docs/SETUP.md` §15–§18 for the full PWA / offline test procedure.

---

## Repository Standards

This repository follows lightweight conventions documented in **[`docs/REPOSITORY_STANDARDS.md`](./docs/REPOSITORY_STANDARDS.md)**:

- **Conventional Commits** (`feat:`, `fix:`, `docs:`, `chore:`, …)
- **Current workflow:** solo developer working directly on `main`. Commits are kept small, scoped to one phase, and checked locally with `pnpm format:check`, `pnpm lint`, `pnpm typecheck` (a Husky pre-commit hook enforces these), and `pnpm build` before pushing.
- **Future workflow** (from the master plan, adopted when collaboration or staging deployment requires it):
  - `main` — production releases
  - `develop` — integration / staging
  - `feature/phase-XX-description` — phase-scoped work
  - `fix/issue-description` — bug fixes
  - PR reviews + branch protection on `main` once CI exists

A practical PR template lives at [`.github/PULL_REQUEST_TEMPLATE.md`](./.github/PULL_REQUEST_TEMPLATE.md) and will activate once contributors start opening pull requests on GitHub.

---

## Architecture & Coding Standards

Phase 4 added the scalable folder structure and standards that everything else builds on. Phase 5 added the design-system foundation:

- **[`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)** — folder layout, layering rules, the platform-adapter pattern, privacy architecture, and a checklist for adding new features.
- **[`docs/CODING_STANDARDS.md`](./docs/CODING_STANDARDS.md)** — TypeScript, React, hook, service, ML, styling, naming, and import rules.
- **[`docs/COMPONENTS.md`](./docs/COMPONENTS.md)** — Phase 8 primitive component library: what each primitive is for, accessibility rules, light/dark expectations, and what is deferred to Phase 9.
- **[`docs/wireframes/`](./docs/wireframes/)** — Phase 7 low-fidelity UX blueprints for every planned screen plus a Mermaid `flow-diagrams.md`.
- **[`docs/USER_FLOWS.md`](./docs/USER_FLOWS.md)** — Phase 7 narratives for the five critical user journeys (first-time, returning, subscription conversion, permission failure, low-confidence AI).
- **[`tailwind.config.ts`](./tailwind.config.ts)** — Motionly brand colors, neutral scale, font stack, and typography utilities.

Lint and format are wired up via ESLint + Prettier and enforced by a Husky pre-commit hook (`pnpm format:check && pnpm lint && pnpm typecheck`). Run `pnpm lint` / `pnpm format` manually whenever you want.

The `src/` folders created in Phase 4 are populated only when their phase arrives. As of Phase 11, `src/theme/` holds the design-system foundation, `src/router/` holds the routing skeleton (route table, guards, layouts, lazy loading), `src/pages/` holds route pages including the Phase 11 welcome/onboarding screens, `src/hooks/` adds a typed `useNavigation()` wrapper, `src/store/` holds the in-memory onboarding draft store, `src/types/` holds the onboarding domain types, `src/components/primitives/` holds the Phase 8 primitive UI library, `src/components/feedback/` holds the Phase 9 feedback / status / progress library, `src/components/onboarding/` holds the Phase 11 onboarding screen components, `src/components/routing/` holds the Phase 6 routing-infrastructure components, `src/platform/haptics.ts` is the first platform adapter (vibration), `src/utils/cn.ts` is the shared `clsx` wrapper, `src/utils/score.ts` defines the canonical 0–100 clamp + `scoreTone` helper, and `src/utils/formatDuration.ts` formats clock-style durations. Data-backed features, real authentication, onboarding completion, and later product screens are still deferred to their later phases.

---

## Privacy & Product Principle

Motionly is designed so that **no raw video ever leaves the device**. All future pose estimation, form analysis, and coaching logic is intended to run on-device in the browser. Network calls in later phases are expected to carry only derived signals (rep counts, form scores, anonymous analytics where opted in) — never camera frames or video.

This principle constrains architectural decisions in every later phase and should not be compromised for convenience.

---

## Master Plan

The single source of truth for scope, ordering, and deliverables across all phases is **[`MOTIONLY_MASTER_PLAN.md`](./MOTIONLY_MASTER_PLAN.md)**. Read the relevant phase before making changes; do not implement features outside the current phase's scope.
