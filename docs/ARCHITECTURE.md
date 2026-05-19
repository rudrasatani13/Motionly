# Motionly — Architecture

This document defines the folder structure, module boundaries, and architectural rules that all Motionly code must follow. It corresponds to **Phase 4 — Project Folder Structure & Architecture Standards** of [`MOTIONLY_MASTER_PLAN.md`](../MOTIONLY_MASTER_PLAN.md) and is the source a new developer should read first.

It is paired with [`CODING_STANDARDS.md`](./CODING_STANDARDS.md) (TypeScript, React, naming, lint/format rules).

---

## 1. PWA-First Philosophy

Motionly is a **Progressive Web App** delivered through Vite + React + TypeScript. Everything ships as web technology and runs in the browser by default. The native shell (Capacitor) is a deferred wrapping decision — not a parallel codebase. Architectural rules are designed so that the future native path requires **swapping platform adapters only**, never rewriting features.

Key consequences that shape every later phase:

- **Single codebase.** No iOS-only or Android-only directories. Differences live behind the platform-adapter pattern (see §6).
- **Offline by default.** The service worker (configured in `vite.config.ts`) precaches the app shell; runtime caching is set up for models, audio cues, fonts, and images.
- **On-device privacy.** Raw video, camera frames, and pose landmarks stay on the device. The architecture treats anything that _could_ exfiltrate them as a bug.

---

## 2. Top-Level Layering

The app is organized into discrete layers. Each layer may depend on the layers below it, never on the layers above.

```
                ┌─────────────────────────────────────┐
   UI layer    │  src/pages/        src/components/   │
                └─────────────────────────────────────┘
                                │
                ┌───────────────┴─────────────────────┐
   React glue  │  src/hooks/        src/store/        │
                └─────────────────────────────────────┘
                                │
                ┌───────────────┴─────────────────────┐
   Domain      │  src/services/     src/ml/           │
                │                    src/workers/      │
                └─────────────────────────────────────┘
                                │
                ┌───────────────┴─────────────────────┐
   Platform    │  src/platform/                       │  ← only layer that
                │  (camera, TTS, storage, push,        │     touches browser
                │   haptics, wake lock, …)             │     globals
                └─────────────────────────────────────┘
                                │
                ┌───────────────┴─────────────────────┐
   Foundation  │  src/utils/   src/types/             │
                │  src/i18n/    src/theme/             │
                │  src/router/  src/assets/            │
                └─────────────────────────────────────┘
```

Higher layers compose lower ones. A page may call a service, a service may call a platform adapter — but a platform adapter never imports a component.

---

## 3. `src/` Folder Responsibilities

Each folder also has its own `README.md` with the in-folder rules. The summary below is the canonical map.

| Folder                       | Responsibility                                                                        | Introduced by                  |
| ---------------------------- | ------------------------------------------------------------------------------------- | ------------------------------ |
| `src/assets/`                | Static assets imported by application code (Vite-bundled).                            | Phase 5+ as needed             |
| `src/components/`            | Shared, reusable UI primitives and composite components. Props in, JSX out.           | Phase 8 — Component primitives |
| `src/components/primitives/` | Phase 8 reusable UI primitives (`Button`, `Input`, `Card`, …).                        | Phase 8 — Component primitives |
| `src/components/routing/`    | Phase 6 routing-infrastructure components (`RoutePlaceholder`, …).                    | Phase 6 — Routing              |
| `src/pages/`                 | Route-level screens. One file per top-level URL.                                      | Phase 10+                      |
| `src/router/`                | React Router 6 config, guards, route params, navigation helpers, and routing layouts. | Phase 6 — Routing              |
| `src/hooks/`                 | Custom React hooks shared across the app.                                             | As needed                      |
| `src/store/`                 | Global state (Zustand stores).                                                        | Phase 29 — State management    |
| `src/services/`              | API clients (Supabase), analytics, subscriptions, persistence orchestration.          | Phase 31+                      |
| `src/platform/`              | Thin adapters around browser-only APIs. The single chokepoint to the host.            | Phase 16+ (camera first)       |
| `src/ml/`                    | On-device ML: pose, joint angles, exercise state machines.                            | Phase 17+                      |
| `src/ml/pose/`               | MediaPipe wrapper, landmark normalization, smoothing.                                 | Phase 17 / 18                  |
| `src/ml/exercises/`          | Per-exercise state machines (rep counting, form cues).                                | Phase 22+                      |
| `src/ml/angles/`             | Pure joint-angle math.                                                                | Phase 20                       |
| `src/i18n/`                  | i18n configuration and translation catalogs.                                          | Phase 42 / 43                  |
| `src/theme/`                 | Theme provider, theme hook, motion constants, and helpers for Tailwind theme mode.    | Phase 5 / 46                   |
| `src/utils/`                 | Pure helpers with no React or DOM dependencies.                                       | As needed                      |
| `src/types/`                 | Cross-feature TypeScript domain types and ambient declarations.                       | As needed                      |
| `src/workers/`               | Web Worker entry points (pose inference, heavy compute).                              | Phase 19                       |

> Phase 4 created the folders and rules. Phase 5 populates the theme foundation, Phase 6 the routing skeleton, Phase 7 the UX planning docs only, and Phase 8 the primitive UI library (`src/components/primitives/`) plus the haptics platform adapter (`src/platform/haptics.ts`) and the `src/utils/cn.ts` class-composition helper. Product screens, state management, and feature logic remain deferred to their own phases.

---

## 4. `public/` Folder Responsibilities

Files in `public/` are reachable by **URL** in the browser. The build copies them as-is to `dist/`.

| Path                                                     | Purpose                                                                                    |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `public/favicon.svg`, `favicon.ico`, `favicon-96x96.png` | Tab icons.                                                                                 |
| `public/favicon-light-96x96.png`                         | Light-mode tab icon selected by `ThemeProvider`.                                           |
| `public/apple-touch-icon.png`                            | iOS home-screen icon (180×180).                                                            |
| `public/web-app-manifest-192x192.png` / `512x512.png`    | Installable PWA icons (`any` and `maskable`).                                              |
| `public/Motionly.png`                                    | 1024×1024 brand source. Excluded from precache via `workbox.globIgnores`.                  |
| `public/motionly-mark-light.png`                         | 1024×1024 light-mode brand source. Excluded from precache via `workbox.globIgnores`.       |
| `public/motionly-mark-light-192.png`                     | Light-mode app-shell mark.                                                                 |
| `public/models/`                                         | **Reserved (Phase 17).** MediaPipe model files. Cached `CacheFirst` by the service worker. |
| `public/audio/cues/`                                     | **Reserved (Phase 25).** Voice cue audio. Cached `CacheFirst` by the service worker.       |

Anything that needs to be imported by JS/TS at build time belongs in `src/assets/` instead.

---

## 5. TypeScript Path Aliases

Configured in `tsconfig.app.json` and resolved in Vite by `vite-tsconfig-paths`.

| Alias          | Resolves to       |
| -------------- | ----------------- |
| `@/`           | `src/`            |
| `@components/` | `src/components/` |
| `@pages/`      | `src/pages/`      |
| `@hooks/`      | `src/hooks/`      |
| `@services/`   | `src/services/`   |
| `@platform/`   | `src/platform/`   |
| `@ml/`         | `src/ml/`         |
| `@store/`      | `src/store/`      |
| `@utils/`      | `src/utils/`      |
| `@types/`      | `src/types/`      |
| `@assets/`     | `src/assets/`     |
| `@theme/`      | `src/theme/`      |
| `@router/`     | `src/router/`     |
| `@i18n/`       | `src/i18n/`       |

**Import rule:** prefer aliases over deep relative paths (`../../../`). Use plain relative imports only within a single folder or for closely sibling files.

---

## 6. Platform Adapter Pattern

> **All browser-only APIs MUST go through `src/platform/`.**

This is the single most important architectural rule in the repo. It is what keeps the future native (Capacitor) path trivial and prevents browser-only assumptions from leaking into product code.

### How it works

For each browser capability we need, define:

1. A **TypeScript interface** that describes the capability in product terms (not browser terms).
2. A **web implementation** of that interface using browser APIs.

Feature code (pages, components, hooks, services, ML modules) calls the interface — never `navigator.*`, `window.*`, `document.*`, or any browser global directly.

When Capacitor wrapping is later approved, only the implementation file is swapped; every consumer stays untouched.

### Adapters we will need (in phase order)

| Adapter       | Web impl                                                    | Future Capacitor impl                                                    |
| ------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------ |
| Camera        | `navigator.mediaDevices.getUserMedia`                       | `@capacitor-community/camera-preview` or equivalent                      |
| TTS / Voice   | `speechSynthesis` + `HTMLAudioElement` for prerecorded cues | `@capacitor-community/text-to-speech` + native audio                     |
| Storage       | IndexedDB (via a wrapper like `idb-keyval`)                 | `@capacitor/preferences` for small KV; native filesystem for large blobs |
| Notifications | Web Push + Notifications API                                | `@capacitor/push-notifications` + `@capacitor/local-notifications`       |
| Haptics       | `navigator.vibrate`                                         | `@capacitor/haptics`                                                     |
| Wake Lock     | `navigator.wakeLock`                                        | `@capacitor-community/keep-awake`                                        |

None of these exist yet. Each lands in its own phase.

### Rule of thumb

If you find yourself reaching for `navigator.*`, `window.*`, `document.*`, `localStorage`, or `indexedDB` from outside `src/platform/`: stop. Add (or extend) an adapter first.

**Narrow Phase 5 exception:** `src/theme/theme-runtime.ts` may use `window`, `document`, `matchMedia`, and `localStorage` to apply the root `dark` class and persist the theme preference. Keep that browser access isolated inside theme infrastructure until a later storage/platform adapter phase exists.

**Phase 8 haptics adapter:** `src/platform/haptics.ts` is the first real platform adapter — a thin wrapper around `navigator.vibrate(10)` exposed as `triggerLightHaptic()`. Components (currently only `Button`, when its `haptic` prop is set) call this helper instead of touching `navigator.*` directly. It no-ops safely on unsupported devices (Safari, iOS) and requires no permissions.

---

## 7. Data Privacy Architecture

The product's privacy story constrains every layer:

1. **No raw video leaves the device.** Camera frames are read into a `<video>` element, optionally rendered to a `<canvas>`, and fed into the pose worker. They are never uploaded, never logged, never stored, never sent to a third party.
2. **Pose/camera work is on-device.** All inference (`src/ml/`) runs in the browser via MediaPipe + Web Workers. Frames are not sent to a server for inference.
3. **Cloud sync uses aggregate metrics only.** When backend sync ships (Phase 31+), payloads contain derived numbers — rep counts, form scores, durations, anonymous opt-in analytics. Never landmarks, never frames.
4. **Telemetry is opt-in.** Analytics (Phase 39) ships disabled by default and asks for consent.
5. **The platform-adapter layer is the privacy boundary.** Camera, microphone, and storage access flow through `src/platform/` — that is where audit, capability gating, and revocation logic live.

If a future change appears to violate any of these, it is a bug, not a trade-off.

---

## 8. Phase Boundaries

This phase (**Phase 4**) delivers:

- The folder skeleton under `src/`
- Each folder's `README.md` describing its purpose and constraints
- TypeScript path aliases (already configured by Phase 2, audited here)
- This architecture document and the companion coding standards
- ESLint + Prettier + Husky tooling so future code is consistent

Phase 5 now additionally delivers:

- Tailwind and PostCSS configuration
- Motionly brand, neutral, typography, and font-family tokens
- `ThemeProvider`, `useTheme`, and root `dark` class strategy
- Motion duration/easing constants
- A tokenized version of the honest app shell

Phase 6 now additionally delivers:

- React Router 6 wiring via `<BrowserRouter>` + a centralized route table (`src/router/routes.tsx`)
- Route-level code splitting through `React.lazy()` + a minimal `RouteLoadingFallback`
- Typed route path constants and URL builders (`src/router/routePaths.ts`)
- `RouteIdParam` / `Workout*RouteParams` types (`src/router/routeTypes.ts`)
- Structural-only `<RequireAuth>` guard (`src/router/RequireAuth.tsx`) — pass-through until Phase 32 ships real authentication
- `AuthLayout` and `MainLayout` (`src/router/layouts/`)
- `useNavigation()` typed navigation wrapper (`src/hooks/useNavigation.ts`)
- Routing-only UI components in `src/components/routing/` (`RoutePlaceholder`, `BottomTabBar`, `ServiceWorkerStatusPill`)
- Honest skeleton pages for every Phase 6 route under `src/pages/{auth,main,workout,progress,profile,modal,system}/`

Phase 8 now additionally delivers:

- Reusable primitive components under `src/components/primitives/` — `Button`, `Input`, `Text` / `Heading`, `Card`, `Divider`, `Spacer`, `Row`, `Column`, `Badge`, `Tag`, `Chip`, `Icon`, `Avatar`
- Barrel exports at `src/components/primitives/index.ts` and `src/components/index.ts`
- Haptics platform adapter `src/platform/haptics.ts` exposing `triggerLightHaptic()`
- `src/utils/cn.ts` — `clsx`-based class composition helper used across all primitives
- `clsx` and `lucide-react` added as production dependencies
- [`docs/COMPONENTS.md`](./COMPONENTS.md) documenting the primitive library

`src/components/routing/` remains the home of the Phase 6 routing-infrastructure components and is intentionally kept separate from `src/components/primitives/`.

These phases **intentionally do not**:

- Implement product screens, fake data, or feature behavior on top of the Phase 6 routing skeleton. Phase 6 wires URLs and route guards only; real screens and real data still arrive in their own phases.
- Implement product screens or data-backed UI on top of the Phase 8 primitive library. Phase 8 ships presentational primitives only — `Button`, `Input`, `Card`, `Avatar`, etc. — with no fake users, workouts, stats, AI feedback, streaks, or subscription state.
- Implement Phase 9 feedback/status components (`CircularProgress`, `LinearProgress`, `ScoreBadge`, `FormCueCard`, `RepCounter`, `WorkoutTimer`, `Toast`, `SkeletonLoader`, `EmptyState`, `ErrorBoundary`, `ConfidenceIndicator`) — those wait for their phase and its animation/motion infrastructure.
- Implement pages (`src/pages/`) — Phase 10+
- Implement state management (`src/store/`) — Phase 29
- Implement camera, TTS, storage, or notification adapters (`src/platform/`) beyond the Phase 8 `haptics.ts` helper — Phase 16+
- Implement pose detection or exercise engines (`src/ml/`, `src/workers/`) — Phase 17+
- Implement Supabase, auth, payments, analytics, notifications, or i18n language packs — their respective phases

Each folder's `README.md` repeats this rule in the context of that folder.

---

## 9. Import Rules

| Rule                                                                                                | Why                                                                      |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Prefer path aliases (`@components/Button`) over deep relative paths (`../../../components/Button`). | Aliases survive file moves and are searchable.                           |
| Shared UI lives in `src/components/`, never in `src/pages/`.                                        | Pages must be free to import shared UI without each importing the other. |
| Business / service logic lives in `src/services/`, never in components.                             | Components can be tested without a network or a database.                |
| Browser-only APIs are used **only** from `src/platform/`.                                           | This is the platform-adapter rule (§6).                                  |
| ML logic lives in `src/ml/`; worker shells live in `src/workers/`.                                  | Inference must be testable headless and runnable off the main thread.    |
| Utilities (`src/utils/`) and types (`src/types/`) are leaf modules.                                 | They must not import from `components/`, `pages/`, or `store/`.          |
| Avoid circular dependencies.                                                                        | If two modules need each other, extract the shared piece.                |

ESLint enforces what is machine-checkable (unused imports, unsafe React patterns); the rest is enforced in code review.

---

## 10. How to Add a New Feature (Checklist)

When a later phase asks you to build a feature, walk this checklist:

1. **Read the phase** in `MOTIONLY_MASTER_PLAN.md`. Confirm the feature belongs to the current phase.
2. **Find or create the page** in `src/pages/`. Pages own the URL and the top-level composition.
3. **Pull shared UI** from `src/components/`. Build new primitives there only if they are reusable; one-off page UI stays with the page.
4. **Put business / data logic** in `src/services/`. Pages and components call services, not the network.
5. **Put browser-API access** behind an adapter in `src/platform/`. Never call `navigator`, `window`, or `document` from anywhere else.
6. **Put ML logic** in `src/ml/` (pure, testable) and run it inside a worker from `src/workers/` if it is heavy.
7. **Define domain types** in `src/types/` when more than one module uses them; keep component prop types local.
8. **Add hooks** in `src/hooks/` when React state needs to be shared across components.
9. **Add stores** in `src/store/` (Zustand) for cross-page state once Phase 29 has introduced state management.
10. **Update docs.** If the feature changes setup, scripts, or architecture, update `docs/SETUP.md`, this file, or `docs/CODING_STANDARDS.md` accordingly.
11. **Run** `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, and `pnpm build` before committing.
12. **No fake data.** Do not ship placeholder users, workouts, stats, AI scores, or claims about features that don't exist.

Following this checklist keeps the architecture coherent across all 50+ phases.

---

## 10a. Routing Architecture (Phase 6)

Motionly uses **React Router 6**. The routing source of truth is `src/router/routes.tsx` and everything related to URLs flows through that module.

### Module map

| File                                                 | Responsibility                                                                        |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `src/router/routePaths.ts`                           | Centralized route path constants and `buildWorkout*Path(id)` URL builders.            |
| `src/router/routeTypes.ts`                           | `RouteIdParam` plus `WorkoutDetail/Setup/Active/Summary` param types for `useParams`. |
| `src/router/routes.tsx`                              | Route table. Every page is `React.lazy()`-loaded and wrapped in `<Suspense>`.         |
| `src/router/AppRouter.tsx`                           | `<BrowserRouter>` shell that renders the route table.                                 |
| `src/router/RequireAuth.tsx`                         | Structural-only auth guard (see §10b).                                                |
| `src/router/RouteLoadingFallback.tsx`                | Minimal Suspense fallback for lazy route chunks.                                      |
| `src/router/layouts/AuthLayout.tsx`                  | Layout for auth + modal-style routes.                                                 |
| `src/router/layouts/MainLayout.tsx`                  | Layout for main routes; renders the bottom tab bar.                                   |
| `src/components/routing/RoutePlaceholder.tsx`        | Skeleton component every Phase 6 page renders.                                        |
| `src/components/routing/BottomTabBar.tsx`            | NavLink-based mobile bottom tab bar.                                                  |
| `src/components/routing/ServiceWorkerStatusPill.tsx` | PWA / service-worker status pill, shown by both layouts.                              |
| `src/hooks/useNavigation.ts`                         | Typed wrapper around `useNavigate()`. Use this — do not inline route strings.         |

### Rules

- **No inline route strings.** Import from `ROUTE_PATHS` or call a `buildWorkout*Path(id)` helper. The same rule covers programmatic navigation — use `useNavigation()` instead of `useNavigate()` + literal URLs.
- **Routes live in `src/router/`.** Page components live in `src/pages/`. The router knows about pages; pages must not know about the router beyond the `useParams` types in `routeTypes.ts`.
- **Every route module is lazy.** All entries in `routes.tsx` use `React.lazy()`. Synchronous route imports defeat the bundle-splitting goal from the master plan.
- **Layouts own chrome.** The bottom tab bar and PWA status pill render once at the layout level, not per page.
- **No fake data in route skeletons.** Phase 6 placeholder pages must not invent users, workouts, stats, AI feedback, streaks, or subscription state.

## 10b. RequireAuth: Structural Only Until Phase 32

`<RequireAuth>` exists for layering, not security. Until Phase 32 ships real authentication (Supabase Auth, sessions, JWT, RLS), the guard:

- Renders its children unconditionally so every protected URL can be exercised during Phase 6 validation.
- Exposes `AUTH_GUARD_STATUS = 'auth-not-implemented-yet'` for honest UI affordances and tests.
- Does **not** read fake users, fake tokens, or pretend-auth state from `localStorage`, cookies, or memory.

When Phase 32 lands, the implementation inside `RequireAuth.tsx` swaps in real session reading and redirects via `useNavigation()`. Every consumer (page, layout) stays unchanged.

---

## 10c. UX Planning Documentation (Phase 7)

Phase 7 introduced **documentation-only** UX artefacts. No runtime code, components, or routes were added or modified.

- **Wireframes** live under [`docs/wireframes/`](./wireframes/). One markdown file per planned screen (splash, onboarding, dashboard, library, detail, camera permission, camera setup, active workout, mid-workout feedback, post-set, summary, progress, score details, profile, paywall). Each file documents purpose, route, future phase, entry / exit points, ASCII low-fidelity layout, content rules, future data requirements, states (loading / empty / error / offline / permission-denied), accessibility, privacy notes, and an explicit "do not fake" list.
- **User flows** live in [`docs/USER_FLOWS.md`](./USER_FLOWS.md). Five end-to-end journeys: first-time user (target: first coached rep under 3 minutes), returning user, subscription conversion, camera permission failure, low-confidence AI.
- **Flow diagrams** live in [`docs/wireframes/flow-diagrams.md`](./wireframes/flow-diagrams.md). Mermaid renderings of the same five flows.

### Rules

- **Future implementation phases consult these docs first.** Before building a screen in `src/pages/`, read the corresponding wireframe. If implementation diverges from the wireframe, update the wireframe in the same change set — staleness is worse than absence.
- **Wireframes are not a runtime source of truth for fake data.** Sample workout names, score numbers, and dates in the markdown are clearly labeled illustrative documentation. They must not be hard-coded into pages, stores, or seed data.
- **Visual styling follows Phase 5 tokens.** Wireframes are deliberately low-fidelity. Real visual styling pulls from `tailwind.config.ts` (Motionly brand colors, neutral scale, typography utilities) and the clean Apple-style minimal direction established for the product.
- **Wireframes do not introduce routes.** Phase 6 already shipped the route surface. Where a wireframed sub-state (e.g. post-set summary, mid-workout feedback) does not have a route today, the wireframe documents whether it is part of an existing route, a modal state, or a future routing decision.

---

## 10d. Primitive Component Library (Phase 8)

Phase 8 adds Motionly's reusable UI primitives under `src/components/primitives/`. They are the canonical building blocks that all future product screens compose from. The full inventory, accessibility rules, light/dark expectations, and deferred Phase 9 components are documented in [`COMPONENTS.md`](./COMPONENTS.md).

### Module map

| File                                    | Responsibility                                                                                                 |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `src/components/primitives/Button.tsx`  | Tappable primitive with primary/secondary/ghost/danger/icon variants, loading state, optional haptic feedback. |
| `src/components/primitives/Input.tsx`   | Single-line text input with label / helper / error / password toggle.                                          |
| `src/components/primitives/Text.tsx`    | `Text` and `Heading` typographic primitives.                                                                   |
| `src/components/primitives/Card.tsx`    | Content surface with `default` / `elevated` / `outlined` variants.                                             |
| `src/components/primitives/Divider.tsx` | Horizontal `<hr>` or vertical separator span.                                                                  |
| `src/components/primitives/Spacer.tsx`  | Decorative whitespace primitive.                                                                               |
| `src/components/primitives/Row.tsx`     | Horizontal flex layout primitive.                                                                              |
| `src/components/primitives/Column.tsx`  | Vertical flex layout primitive.                                                                                |
| `src/components/primitives/flex.ts`     | Shared `align` / `justify` / `gap` types and class composer for `Row` / `Column`.                              |
| `src/components/primitives/Badge.tsx`   | Small color-coded status / category label.                                                                     |
| `src/components/primitives/Tag.tsx`     | Static metadata pill.                                                                                          |
| `src/components/primitives/Chip.tsx`    | Interactive selectable pill (`<button>` with `aria-pressed`).                                                  |
| `src/components/primitives/Icon.tsx`    | Token-aware wrapper around any `lucide-react` icon.                                                            |
| `src/components/primitives/Avatar.tsx`  | Round avatar with image / initials / icon fallback chain.                                                      |
| `src/components/primitives/index.ts`    | Barrel export.                                                                                                 |
| `src/platform/haptics.ts`               | `triggerLightHaptic()` adapter wrapping `navigator.vibrate(10)`.                                               |
| `src/utils/cn.ts`                       | `clsx`-based class composition helper.                                                                         |

### Rules

- **Use primitives before inventing one-off UI.** When you build a screen in a later phase, reach for `Button` / `Input` / `Card` / `Row` / `Column` first. Add a new primitive only when the composition is reused in multiple screens.
- **Routing-infrastructure components stay separate.** `src/components/routing/` is not the primitive library. Keep `RoutePlaceholder`, `BottomTabBar`, and `ServiceWorkerStatusPill` there until they are revisited / refactored.
- **No hardcoded colors.** Primitives use Motionly Tailwind tokens (`bg-motionly-*`, `text-motionly-*`, `border-motionly-*`). Hex values stay in `tailwind.config.ts`.
- **No fake data in primitives.** `Avatar` does not invent initials, `Badge` / `Chip` / `Tag` do not invent labels, and `Button` does not show fabricated success / progress messaging.
- **Browser APIs go through `src/platform/`.** The `Button` triggers haptic feedback by calling `triggerLightHaptic()` from `@platform/haptics`, not `navigator.vibrate` directly.

---

## 11. Things This Document Does Not Cover

- **Coding style, naming, lint rules:** see [`CODING_STANDARDS.md`](./CODING_STANDARDS.md).
- **Setup, dev server, build, preview, real-phone LAN testing:** see [`SETUP.md`](./SETUP.md).
- **Repository hygiene, commit conventions, branching:** see [`REPOSITORY_STANDARDS.md`](./REPOSITORY_STANDARDS.md).
- **Phase scope and ordering:** see [`MOTIONLY_MASTER_PLAN.md`](../MOTIONLY_MASTER_PLAN.md).

Keep this document the **structural** source of truth. If the structure changes, update this file in the same commit.
