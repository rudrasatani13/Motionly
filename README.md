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

### Honest scope note

This repository is an early-stage foundation. The following are **planned for later phases of [`MOTIONLY_MASTER_PLAN.md`](./MOTIONLY_MASTER_PLAN.md) and do NOT exist yet**:

- Camera permissions and live camera preview
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
- **Fontsource** packages for Inter Variable and Noto Sans Devanagari font loading
- **[pnpm](https://pnpm.io/)** as the package manager (Node 20+)

Future stack additions (Zustand, Supabase, MediaPipe, etc.) are introduced in their own phases per `MOTIONLY_MASTER_PLAN.md` and are not present yet.

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

The `src/` folders created in Phase 4 are populated only when their phase arrives. As of Phase 9, `src/theme/` holds the design-system foundation, `src/router/` holds the routing skeleton (route table, guards, layouts, lazy loading), `src/pages/` holds honest skeleton route pages, `src/hooks/` adds a typed `useNavigation()` wrapper, `src/components/primitives/` holds the Phase 8 primitive UI library, `src/components/feedback/` holds the Phase 9 feedback / status / progress library, `src/components/routing/` holds the Phase 6 routing-infrastructure components, `src/platform/haptics.ts` is the first platform adapter (vibration), `src/utils/cn.ts` is the shared `clsx` wrapper, `src/utils/score.ts` defines the canonical 0–100 clamp + `scoreTone` helper, and `src/utils/formatDuration.ts` formats clock-style durations. Data-backed features, real authentication, and product screens are still deferred to their later phases.

---

## Privacy & Product Principle

Motionly is designed so that **no raw video ever leaves the device**. All future pose estimation, form analysis, and coaching logic is intended to run on-device in the browser. Network calls in later phases are expected to carry only derived signals (rep counts, form scores, anonymous analytics where opted in) — never camera frames or video.

This principle constrains architectural decisions in every later phase and should not be compromised for convenience.

---

## Master Plan

The single source of truth for scope, ordering, and deliverables across all phases is **[`MOTIONLY_MASTER_PLAN.md`](./MOTIONLY_MASTER_PLAN.md)**. Read the relevant phase before making changes; do not implement features outside the current phase's scope.
