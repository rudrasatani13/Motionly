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

| Folder                            | Responsibility                                                                                                                                                                                                                                                                             | Introduced by                  |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------ |
| `src/assets/`                     | Static assets imported by application code (Vite-bundled).                                                                                                                                                                                                                                 | Phase 5+ as needed             |
| `src/data/`                       | Canonical static product content (e.g. the Phase 14 workout/exercise catalog). Read-only; never user data.                                                                                                                                                                                 | Phase 14 — Workout Library     |
| `src/components/`                 | Shared, reusable UI primitives and composite components. Props in, JSX out.                                                                                                                                                                                                                | Phase 8 — Component primitives |
| `src/components/primitives/`      | Phase 8 reusable UI primitives (`Button`, `Input`, `Card`, …).                                                                                                                                                                                                                             | Phase 8 — Component primitives |
| `src/components/feedback/`        | Phase 9 feedback / status / progress components (`CircularProgress`, `Toast`, …).                                                                                                                                                                                                          | Phase 9 — Feedback components  |
| `src/components/dashboard/`       | Phase 13 dashboard cards, header, quick-start, stats, and empty states.                                                                                                                                                                                                                    | Phase 13 — Dashboard screen    |
| `src/components/workout-library/` | Phase 14 workout library composites — header, tab switcher, filter chips, workout/exercise cards, locked-content badge, empty state, and exercise quick-detail panel.                                                                                                                      | Phase 14 — Workout Library     |
| `src/components/workout-detail/`  | Phase 15 workout detail / pre-workout composites — hero, meta, muscles, sequence preview, coach note, limitation warning, actions, loading, and not-found states.                                                                                                                          | Phase 15 — Workout Detail      |
| `src/components/camera-setup/`    | Phase 16 camera setup composites — live preview, silhouette guide, placement instructions, lighting status, checklist, error state, and actions.                                                                                                                                           | Phase 16 — Camera Setup        |
| `src/components/pose-debug/`      | Phase 17 + 18 pose-debug UI — `PoseDebugPanel`, `PoseLandmarkStatus`, `PoseFpsBadge`, `PoseModelStatusCard`, `PoseLandmarkOverlay` (raw / smoothed / normalized modes), `PoseProcessingStatusCard`, `PoseVisibilityCard`, `PoseProcessingStatsCard`. Debug-only; no rep/score/form output. | Phase 17 — MediaPipe Pose      |
| `src/components/launch/`          | Phase 10 launch UI — animated `LaunchScreen` + SW update prompt hook.                                                                                                                                                                                                                      | Phase 10 — Splash & launch     |
| `src/components/onboarding/`      | Phase 11–12 onboarding flow components (welcome, goal, fitness level, limitations, camera tutorial).                                                                                                                                                                                       | Phase 11–12 — Onboarding       |
| `src/components/routing/`         | Phase 6 routing-infrastructure components (`RoutePlaceholder`, …).                                                                                                                                                                                                                         | Phase 6 — Routing              |
| `src/launch/`                     | Phase 10 launch orchestration — `LaunchGate`, `useLaunchDecision`, auth placeholder.                                                                                                                                                                                                       | Phase 10 — Splash & launch     |
| `src/pages/`                      | Route-level screens. One file per top-level URL.                                                                                                                                                                                                                                           | Phase 10+                      |
| `src/router/`                     | React Router 6 config, guards, route params, navigation helpers, and routing layouts.                                                                                                                                                                                                      | Phase 6 — Routing              |
| `src/hooks/`                      | Custom React hooks shared across the app.                                                                                                                                                                                                                                                  | As needed                      |
| `src/store/`                      | Global state (Zustand stores). Phase 11 starts with an in-memory onboarding draft.                                                                                                                                                                                                         | Phase 11+                      |
| `src/services/`                   | API clients (Supabase), analytics, subscriptions, persistence orchestration.                                                                                                                                                                                                               | Phase 31+                      |
| `src/platform/`                   | Thin adapters around browser-only APIs. The single chokepoint to the host.                                                                                                                                                                                                                 | Phase 16+ (camera first)       |
| `src/ml/`                         | On-device ML: pose, joint angles, exercise state machines.                                                                                                                                                                                                                                 | Phase 17+                      |
| `src/ml/pose/`                    | MediaPipe wrapper, landmark constants, and the Phase 18 processing layer — `LandmarkSmoother`, `ConfidenceFilter`, `LandmarkNormalizer`, `PoseFrameProcessor` / `processPoseFrame`, `pose-processing-config`.                                                                              | Phase 17 / 18                  |
| `src/ml/exercises/`               | Per-exercise state machines (rep counting, form cues).                                                                                                                                                                                                                                     | Phase 22+                      |
| `src/ml/angles/`                  | Pure joint-angle math.                                                                                                                                                                                                                                                                     | Phase 20                       |
| `src/i18n/`                       | i18n configuration and translation catalogs.                                                                                                                                                                                                                                               | Phase 42 / 43                  |
| `src/theme/`                      | Theme provider, theme hook, motion constants, and helpers for Tailwind theme mode.                                                                                                                                                                                                         | Phase 5 / 46                   |
| `src/utils/`                      | Pure helpers with no React or DOM dependencies.                                                                                                                                                                                                                                            | As needed                      |
| `src/types/`                      | Cross-feature TypeScript domain types and ambient declarations.                                                                                                                                                                                                                            | As needed                      |
| `src/workers/`                    | Web Worker entry points (pose inference, heavy compute).                                                                                                                                                                                                                                   | Phase 19                       |

> Phase 4 created the folders and rules. Phase 5 populates the theme foundation, Phase 6 the routing skeleton, Phase 7 the UX planning docs only, Phase 8 the primitive UI library (`src/components/primitives/`) plus the haptics platform adapter (`src/platform/haptics.ts`) and the `src/utils/cn.ts` class-composition helper, Phase 9 the feedback / status component library (`src/components/feedback/`) plus the `src/utils/score.ts` and `src/utils/formatDuration.ts` helpers, Phase 10 the launch layer, Phase 11 the first in-memory onboarding store plus screens 1–3, Phase 12 onboarding completion storage, and Phase 13 the Home dashboard. Phase 14 adds the real Workout Library — `src/types/workout-library.ts` (domain types), `src/data/workout-library.ts` (canonical static catalog), `src/utils/workout-library.ts` (pure filter/search/sort helpers), `src/hooks/useDebouncedValue.ts` (generic debounce), and `src/components/workout-library/` (header, tab switcher, filter chips, workout/exercise cards, locked-content badge, empty state, and exercise quick-detail panel). Phase 15 extends that catalog with workout detail sequences, adds `src/utils/workout-limitations.ts`, `src/hooks/useWorkoutDetailData.ts`, and `src/components/workout-detail/` for the real pre-workout screen. Phase 16 adds `src/types/camera-setup.ts`, `src/platform/camera-stream.ts`, `src/platform/camera-lighting.ts`, `src/platform/speech.ts`, `src/utils/camera-lighting.ts`, `src/hooks/useCameraLightingCheck.ts`, and `src/components/camera-setup/` for the live setup flow. Remaining product screens, durable cross-feature persistence, ML/pose detection, and feature logic still land in their own phases.

---

## 4. `public/` Folder Responsibilities

Files in `public/` are reachable by **URL** in the browser. The build copies them as-is to `dist/`.

| Path                                                     | Purpose                                                                                                                                                                                                                            |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `public/favicon.svg`, `favicon.ico`, `favicon-96x96.png` | Tab icons.                                                                                                                                                                                                                         |
| `public/favicon-light-96x96.png`                         | Light-mode tab icon selected by `ThemeProvider`.                                                                                                                                                                                   |
| `public/apple-touch-icon.png`                            | iOS home-screen icon (180×180).                                                                                                                                                                                                    |
| `public/web-app-manifest-192x192.png` / `512x512.png`    | Installable PWA icons (`any` and `maskable`).                                                                                                                                                                                      |
| `public/Motionly.png`                                    | 1024×1024 brand source. Excluded from precache via `workbox.globIgnores`.                                                                                                                                                          |
| `public/motionly-mark-light.png`                         | 1024×1024 light-mode brand source. Excluded from precache via `workbox.globIgnores`.                                                                                                                                               |
| `public/motionly-mark-light-192.png`                     | Light-mode app-shell mark.                                                                                                                                                                                                         |
| `public/models/`                                         | **Phase 17.** MediaPipe Pose Landmarker `.task` files. Served from `/models/`; cached `CacheFirst` by the service worker.                                                                                                          |
| `public/audio/cues/`                                     | **Reserved (Phase 25).** Voice cue audio. Cached `CacheFirst` by the service worker.                                                                                                                                               |
| `/mediapipe-wasm/` _(virtual)_                           | **Phase 17.** Tasks-Vision WASM fileset, served by the `motionlyMediaPipeWasm` Vite plugin from `node_modules/@mediapipe/tasks-vision/wasm/` in dev and emitted into `dist/mediapipe-wasm/` at build. Runtime-cached `CacheFirst`. |

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

**Phase 10 onboarding-storage adapter:** `src/platform/onboarding-storage.ts` exposes the read-only `readHasOnboarded()` so the launch gate has a single chokepoint for the `hasOnboarded` flag. It tries to open the future `motionly` IndexedDB database without creating it; if the database / store / key is missing — or if anything errors — it resolves to `false`. **Phase 12** extended the same adapter with a write path (`completeOnboardingStorage()`) that creates the database / store on demand and persists `hasOnboarded = true` plus a minimal completion record. Phase 30 will replace this small adapter with the real storage layer.

**Phase 12 camera-permission adapter:** `src/platform/camera-permission.ts` is the only Phase 12 caller of `navigator.mediaDevices.getUserMedia`. `requestCameraPermissionForOnboarding()` asks for video only, stops every track immediately after permission resolves, and returns a tagged `granted | denied | unavailable | error` result so callers stay declarative. No stream, frame, preview, recording, or upload ever leaves the adapter. Live preview, silhouette detection, and pose inference belong to later camera / ML phases — Phase 12 deliberately stops at the permission prompt.

**Phase 16 camera setup adapters:** `src/platform/camera-stream.ts` is the only Phase 16 module that requests the live workout setup stream. It requests video only (`facingMode: user`, ideal `640x480`), never requests audio or microphone access, returns typed granted / denied / unavailable / error results, and exposes `stopCameraStream()` so callers stop tracks on unmount, route change, cancel, retry replacement, skip, continue, and error recovery. `src/platform/camera-lighting.ts` owns the browser-only canvas sampling used by the local lighting check; it samples a tiny in-memory frame and never stores, uploads, records, or persists video data. `src/platform/speech.ts` owns the optional, user-initiated Web Speech setup instruction and does not implement the Phase 25 voice-cue system.

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

Phase 9 now additionally delivers:

- Feedback / status / progress components under `src/components/feedback/` — `CircularProgress`, `LinearProgress`, `ScoreBadge`, `FormCueCard`, `RepCounter`, `WorkoutTimer`, `ToastProvider` / `ToastViewport` / `useToast`, `SkeletonLoader`, `EmptyState`, `ErrorBoundary`, `ConfidenceIndicator`
- Barrel export `src/components/feedback/index.ts` and updated `src/components/index.ts`
- Shared score helpers (`clampScore`, `clampProgress`, `scoreTone`) in `src/utils/score.ts`
- Shared duration formatting (`formatDurationSeconds`, `formatDurationMs`) in `src/utils/formatDuration.ts`
- `framer-motion` added as a production dependency
- In-house Motionly-owned toast queue (no third-party toast library)
- [`docs/COMPONENTS.md`](./COMPONENTS.md) §8 documenting the feedback library

Phase 10 now additionally delivers the launch experience under `src/launch/`, `src/components/launch/`, and the read-only `src/platform/onboarding-storage.ts` adapter.

Phase 11 now additionally delivers:

- `/welcome` as the real onboarding entry page
- `/onboarding` screens 1–3 as internal steps under one route
- Onboarding components under `src/components/onboarding/`
- Stable onboarding domain types under `src/types/onboarding.ts`
- An in-memory-only Zustand draft store under `src/store/useOnboardingStore.ts`
- `zustand` as the only state-management dependency introduced in this phase

`src/components/routing/` remains the home of the Phase 6 routing-infrastructure components and is intentionally kept separate from `src/components/primitives/` and `src/components/feedback/`.

These phases **intentionally do not**:

- Implement product screens, fake data, or feature behavior on top of the Phase 6 routing skeleton. Phase 6 wires URLs and route guards only; real screens and real data still arrive in their own phases.
- Implement product screens or data-backed UI on top of the Phase 8 primitive library. Phase 8 ships presentational primitives only — `Button`, `Input`, `Card`, `Avatar`, etc. — with no fake users, workouts, stats, AI feedback, streaks, or subscription state.
- Implement product screens or data-backed UI on top of the Phase 9 feedback library. Phase 9 ships presentational feedback / status / progress components only — `CircularProgress`, `LinearProgress`, `ScoreBadge`, `FormCueCard`, `RepCounter`, `WorkoutTimer`, `ToastProvider` / `useToast`, `SkeletonLoader`, `EmptyState`, `ErrorBoundary`, `ConfidenceIndicator` — with no internal score / rep / timer / confidence generation, no real ML outputs, no real workout data, no Web Push notifications, and no analytics.
- Implement remaining product screens beyond the active phase.
- Implement durable or cross-feature app state beyond the Phase 11 in-memory onboarding draft.
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
9. **Add stores** in `src/store/` (Zustand) only when a phase explicitly introduces shared state. Phase 11's onboarding draft is in-memory only; broader cross-feature state still waits for the planned state-management phase.
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
| `src/components/routing/ServiceWorkerStatusPill.tsx` | Optional PWA / service-worker status pill component, not rendered in current layouts. |
| `src/hooks/useNavigation.ts`                         | Typed wrapper around `useNavigate()`. Use this — do not inline route strings.         |

### Rules

- **No inline route strings.** Import from `ROUTE_PATHS` or call a `buildWorkout*Path(id)` helper. The same rule covers programmatic navigation — use `useNavigation()` instead of `useNavigate()` + literal URLs.
- **Routes live in `src/router/`.** Page components live in `src/pages/`. The router knows about pages; pages must not know about the router beyond the `useParams` types in `routeTypes.ts`.
- **Every route module is lazy.** All entries in `routes.tsx` use `React.lazy()`. Synchronous route imports defeat the bundle-splitting goal from the master plan.
- **Layouts own chrome.** The bottom tab bar renders once at the layout level, not per page.
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
- **Routing-infrastructure components stay separate.** `src/components/routing/` is not the primitive library. Keep `RoutePlaceholder`, `BottomTabBar`, and optional routing/status chrome there until they are revisited / refactored.
- **No hardcoded colors.** Primitives use Motionly Tailwind tokens (`bg-motionly-*`, `text-motionly-*`, `border-motionly-*`). Hex values stay in `tailwind.config.ts`.
- **No fake data in primitives.** `Avatar` does not invent initials, `Badge` / `Chip` / `Tag` do not invent labels, and `Button` does not show fabricated success / progress messaging.
- **Browser APIs go through `src/platform/`.** The `Button` triggers haptic feedback by calling `triggerLightHaptic()` from `@platform/haptics`, not `navigator.vibrate` directly.

---

## 10e. Feedback & Status Component Library (Phase 9)

Phase 9 adds Motionly's feedback / status / progress components under `src/components/feedback/`. They compose Phase 8 primitives and ship with animation infrastructure (`framer-motion`) plus a Motionly-owned toast queue. The full inventory, when-to-use guide, data ownership rules, accessibility rules, and toast architecture live in [`COMPONENTS.md`](./COMPONENTS.md) §8.

### Module map

| File                                              | Responsibility                                                           |
| ------------------------------------------------- | ------------------------------------------------------------------------ |
| `src/components/feedback/CircularProgress.tsx`    | Animated SVG ring for form / session scores. Token-coded by `scoreTone`. |
| `src/components/feedback/LinearProgress.tsx`      | Token-coded horizontal progress bar. Tailwind width transition.          |
| `src/components/feedback/ScoreBadge.tsx`          | Compact color-coded numeric score for list rows / cards.                 |
| `src/components/feedback/FormCueCard.tsx`         | Animated single-cue coaching card with `aria-live`.                      |
| `src/components/feedback/RepCounter.tsx`          | Large rep number with scale-pulse on increment.                          |
| `src/components/feedback/WorkoutTimer.tsx`        | Presentational `m:ss` / `h:mm:ss` clock readout.                         |
| `src/components/feedback/Toast.tsx`               | `ToastProvider`, `ToastViewport`, `useToast` — in-house queue.           |
| `src/components/feedback/SkeletonLoader.tsx`      | Token-aware async placeholder.                                           |
| `src/components/feedback/EmptyState.tsx`          | Honest empty-state surface with illustration / CTA slots.                |
| `src/components/feedback/ErrorBoundary.tsx`       | Render-error class component with retry fallback.                        |
| `src/components/feedback/ConfidenceIndicator.tsx` | Camera / pose confidence banner.                                         |
| `src/components/feedback/index.ts`                | Barrel export.                                                           |
| `src/utils/score.ts`                              | `clampScore`, `clampProgress`, `scoreTone`, `SCORE_*` constants.         |
| `src/utils/formatDuration.ts`                     | `formatDurationSeconds`, `formatDurationMs`.                             |

### Rules

- **Composition, not duplication.** Feedback components compose Phase 8 primitives (`Button`, `Card`, `Icon`) where it makes sense. They never re-implement primitive behavior.
- **No fake values.** No feedback component generates its own score, progress, reps, time, cue, confidence rating, or toast. The future engines / stores supply real values.
- **Tone mapping is centralized.** Scores always use `scoreTone` in `@utils/score`. New tone thresholds must update that helper, not inline ranges in components.
- **Animations honor reduced motion.** Every animated component checks `useReducedMotion()` from Framer Motion or uses Tailwind `motion-reduce:*` so the experience degrades gracefully.
- **Toast system is Motionly-owned.** No third-party toast dependency. Product code imports `useToast` / `ToastProvider` from `@components/feedback`; Phase 44 Web Push remains unimplemented.
- **`ErrorBoundary` does not log externally.** Sentry / analytics wires are deferred to a later phase.
- **No browser APIs leak in.** No `navigator.*` / `window.*` calls from feedback components (the toast viewport's `window.setTimeout` is allowed as a render-side scheduling concern, not a platform capability).

### Boundary between primitives / feedback / routing components

- **`primitives/`** — token-and-Tailwind UI atoms reused everywhere; no animation libraries.
- **`feedback/`** — composite presentational components that need animation, progress semantics, or live regions, but still have **no business logic and no data of their own**.
- **`routing/`** — components specific to the Phase 6 routing infrastructure; not meant to be reused outside layouts.

A component graduates from `primitives/` to `feedback/` when it grows progress / live-region / animation responsibilities that the primitives intentionally avoid.

---

## 10f. Launch Experience (Phase 10)

Phase 10 wires Motionly's launch experience: a pre-React HTML splash in `index.html`, an animated React `<LaunchScreen>`, a launch decision layer that resolves `hasOnboarded` + a future-safe auth placeholder, and an in-house service-worker update prompt that reuses the Phase 9 toast system.

### Module map

| File                                                    | Responsibility                                                                                                                             |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `index.html` (`<style>` + `#root > .motionly-splash`)   | Inline pre-React splash. Dark `#0A0A0F` canvas + wordmark + tagline; replaced cleanly when React mounts.                                   |
| `src/components/launch/LaunchScreen.tsx`                | Animated React launch screen (Framer Motion scale + fade; tagline fades in ~200ms later; reduced-motion aware).                            |
| `src/components/launch/useServiceWorkerUpdatePrompt.ts` | Hook that listens for `motionly:sw` `update-available` and shows the "Refresh to use the latest version." toast.                           |
| `src/components/launch/index.ts`                        | Barrel for the launch UI subpackage.                                                                                                       |
| `src/launch/LaunchGate.tsx`                             | Outer gate. Holds the launch screen on screen until the decision settles; releases `<AppRouter>` afterwards.                               |
| `src/launch/useLaunchDecision.ts`                       | Minimum-brand-window + `hasOnboarded` + auth-placeholder resolver. Applies the URL redirect before `setState`.                             |
| `src/launch/launch-state.ts`                            | `LaunchAuthState`, `LaunchInputs`, `LaunchDecision` types.                                                                                 |
| `src/launch/auth-state.ts`                              | `getLaunchAuthState()` — future-safe Supabase rehydration placeholder; always returns `not-implemented` today.                             |
| `src/launch/index.ts`                                   | Barrel for the launch orchestration subpackage.                                                                                            |
| `src/platform/onboarding-storage.ts`                    | Read-only `readHasOnboarded()` + Phase 12 `completeOnboardingStorage()` write path. Honest IndexedDB chokepoint; Phase 30 will replace it. |

### Responsibilities

- **`<LaunchGate>`** wraps the routing tree. While `useLaunchDecision` is pending it renders `<LaunchScreen>`; once the decision resolves it renders its `children` (the `<AppRouter>`). The gate sits **outside** the router so the URL can be reconciled before `<BrowserRouter>` reads `window.location.pathname` on mount.
- **`useLaunchDecision`** awaits two promises in parallel — a `LAUNCH_MIN_VISIBLE_MS` (≈1.8s) brand window and the underlying reads — then picks the destination. Before `setState` flips `ready` to `true`, it applies an idempotent `history.replaceState` so the router mounts on the canonical pathname. Only `/` is rewritten; direct deep links (Phase 6 placeholders, `/welcome`, `/workouts`, `/workout/test-id/setup`, etc.) stay where the user opened them.
- **`getLaunchAuthState`** is the single named hook for "what does auth say at launch?". It returns `{ status: 'not-implemented', reason: 'auth-deferred-to-backend-phase' }` today. Real Supabase session rehydration lands in the planned backend / auth phase (Phase 32 per the master plan); no fake users, no fake tokens, no mock sessions ship in Phase 10.
- **`readHasOnboarded`** is the read-only IndexedDB chokepoint for the onboarding flag. Phase 10 introduced it as read-only; Phase 12 added the matching `completeOnboardingStorage()` write path that creates the IndexedDB store on demand and persists `hasOnboarded = true` plus a minimal completion record. Phase 30 will replace the small Phase 12 storage with the real schema.

### Rules

- **No fake auth / onboarding state.** Neither the gate, the hook, nor the platform reader may seed fake flags, fake users, or fake sessions. `readHasOnboarded()` returns only the real persisted flag or `false`; auth remains `not-implemented` until Phase 32.
- **No fake loading copy.** Neither splash invents "Analyzing movement…", "Loading AI…", or any other status claim. The brand reveal is the wordmark plus the tagline. Full stop.
- **Launch decisions use route constants.** `useLaunchDecision` and `<LaunchGate>` import `ROUTE_PATHS` — no inline `'/welcome'` / `'/'` strings.
- **Storage stays behind the adapter.** The only filesystem / IndexedDB access in the launch flow is `@platform/onboarding-storage`. `<LaunchGate>` uses `window.history.replaceState` once as the documented browser-API touch point for the launch layer; camera / TTS / storage / haptics / notifications still go through `src/platform/`.
- **No fake first-rep auto-routing.** The launch gate must not silently bypass the welcome / onboarding entry by jumping straight to a workout. It picks Home `/` only when the real local onboarding flag exists.

### Deferred to later phases

- **Durable cross-feature storage.** Phase 12 added the minimal onboarding write path (`completeOnboardingStorage`). Phase 30 (storage adapter) introduces the durable IndexedDB schema that will eventually replace this narrow store.
- **Real session rehydration.** Phase 32 (backend / auth) swaps the `getLaunchAuthState` placeholder for a real Supabase session read.
- **Real protected redirect rules.** `<RequireAuth>` remains structural-only until Phase 32; the launch gate does not pre-implement production-grade redirect logic.

---

## 10g. Onboarding Flow: Screens 1–3 (Phase 11)

Phase 11 turns the `/welcome` and `/onboarding` placeholders into the first half of the real onboarding flow, while keeping completion and persistence out of scope.

### Module map

| File / folder                       | Responsibility                                                                              |
| ----------------------------------- | ------------------------------------------------------------------------------------------- |
| `src/types/onboarding.ts`           | Stable IDs for Phase 11 onboarding goals, fitness levels, steps, and the draft shape.       |
| `src/store/useOnboardingStore.ts`   | Zustand in-memory draft store for current step, selected goals, and selected fitness level. |
| `src/components/onboarding/`        | Shared onboarding shell, progress dots, hero, screens 1–3, and Phase 12 handoff panel.      |
| `src/pages/auth/WelcomePage.tsx`    | Mobile-first onboarding entry page; navigates to `/onboarding` or placeholder `/login`.     |
| `src/pages/auth/OnboardingPage.tsx` | Single-route internal onboarding flow for steps 1–3, with Framer Motion transitions.        |

### Responsibilities

- **`useOnboardingStore`** holds only local draft selections. It does not use `localStorage`, IndexedDB, Supabase, auth state, or any backend. Refreshing the browser may reset the draft in Phase 11.
- **`/onboarding`** keeps all Phase 11 steps inside one route, matching the Phase 7 wireframe. Progress shows all five planned steps, but Phase 11 only allows the user to move among steps 1–3.
- **Step 3 handoff** is an honest temporary state. It explains that movement limitations and the camera tutorial arrive in Phase 12, and it does not mark onboarding complete.

### Deferred to later phases

- **Camera live preview, silhouette detection, ML, auth, Supabase, workouts, payments, analytics.** Phase 11 / Phase 12 do not pre-implement or fake any of these systems.

---

## 10h. Onboarding Flow: Screens 4–5 + Completion (Phase 12)

Phase 12 completes the onboarding flow added in Phase 11. The route surface (`/onboarding`) is unchanged; the new steps live inside the existing single-route internal step machine.

### Module map

| File / folder                                      | Responsibility                                                                                                                            |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `src/types/onboarding.ts`                          | Extended with `MovementLimitation`, `CameraPermissionStatus`, the full 5-entry `OnboardingStep` union, and a wider `OnboardingDraft`.     |
| `src/store/useOnboardingStore.ts`                  | Adds limitations, optional notes, camera-permission status, and the in-memory completion timestamp; mutually-exclusive "None" lives here. |
| `src/components/onboarding/LimitationsStep.tsx`    | Step 4: multi-select chips + optional ≤120-character free-text note with safety copy.                                                     |
| `src/components/onboarding/CameraTutorialStep.tsx` | Step 5: 3-step setup primer, permission status messaging, and "Continue without camera for now" secondary action.                         |
| `src/platform/camera-permission.ts`                | New platform adapter; the only Phase 12 caller of `navigator.mediaDevices.getUserMedia`.                                                  |
| `src/platform/onboarding-storage.ts`               | Gains `completeOnboardingStorage()` write path (creates the IndexedDB store on demand and persists the completion record).                |
| `src/pages/auth/OnboardingPage.tsx`                | Wires all five steps, the camera CTA flow, and navigation to Home `/` on completion.                                                      |

### Responsibilities

- **Camera adapter (`camera-permission.ts`)** is the single chokepoint that touches `navigator.mediaDevices.getUserMedia`. It requests **video only**, stops every track immediately after permission resolves, and returns a tagged result so product code never inspects DOM exceptions. No stream, frame, preview, recording, or upload leaves this module.
- **Onboarding storage (`onboarding-storage.ts`)** keeps the read-only Phase 10 `readHasOnboarded()` and adds `completeOnboardingStorage()`. The writer creates the `motionly` IndexedDB database / `onboarding` object store on demand and persists `hasOnboarded = true` alongside a minimal `OnboardingCompletionRecord` (timestamp, goals, fitness level, limitations, optional notes, whether camera was granted). It returns a typed success/failure result rather than throwing. **No fake user IDs, sessions, or account data; no media data.** This Phase 12 storage is intentionally small and isolated so Phase 30's storage rewrite can replace it cleanly.
- **`/onboarding` completion** runs through the camera step. On grant, the page writes the completion record, flips `hasOnboarded = true`, and navigates to Home `/`. On denial / unavailable / error the page shows clear guidance plus an honest "Continue without camera for now" secondary action that writes the same record (with `cameraPermissionGranted: false`) and navigates Home — it never claims permission was granted.
- **LaunchGate behavior after completion.** `readHasOnboarded()` now returns the real persisted value, so subsequent launches of `/` no longer redirect returning users to `/welcome`. Clearing site data resets the flag and restores first-time behavior.

### Deferred to later phases

- **Supabase sync.** Backend / auth is not connected; Phase 12 intentionally skips Supabase. A short note lives in `onboarding-storage.ts`.
- **Live camera preview, silhouette detection, ML, skeleton overlay, rep counting, form scoring.** Phase 12 only primes the permission; the real camera setup lives in Phase 16.
- **Workout library, workout detail, workout history, streaks, stats, subscriptions, analytics.** Home `/` now renders the Phase 13 dashboard; those data sources remain deferred.
- **IndexedDB schema rewrite.** Phase 30 owns the real storage adapter; the Phase 12 store is the minimum viable persistence to unlock the launch gate.

---

## 10i. Home / Dashboard Screen (Phase 13)

Phase 13 replaces the Home `/` placeholder with an honest dashboard for returning users. It reads the real local onboarding completion record when present, but it does **not** invent workouts, history, stats, or subscription state.

### Module map

| File / folder                        | Responsibility                                                                |
| ------------------------------------ | ----------------------------------------------------------------------------- |
| `src/pages/main/DashboardPage.tsx`   | Route composition for the Phase 13 dashboard.                                 |
| `src/components/dashboard/`          | Presentational dashboard cards, header, quick start, stats, and empty states. |
| `src/hooks/useDashboardData.ts`      | Reads onboarding completion and builds honest dashboard state.                |
| `src/platform/onboarding-storage.ts` | IndexedDB adapter used to read the real Phase 12 completion record.           |
| `src/types/dashboard.ts`             | Dashboard state types for available / empty / unavailable sections.           |

### Responsibilities

- **`DashboardPage`** composes the header, today's workout area, quick-start CTA, summary cards, activity area, and onboarding summary.
- **`useDashboardData`** is the only dashboard data hook. It reads local onboarding storage, exposes loading and refresh state, and returns honest empty / unavailable states for workout, stats, recent activity, and subscription sections.
- **`readOnboardingCompletion()`** lives in `src/platform/onboarding-storage.ts` so product code never touches IndexedDB directly.
- **Dashboard sections never fabricate data.** Workout history, derived stats, and subscription data still do not exist; the UI must show an empty or unavailable state and a route CTA instead of placeholder metrics. The Phase 14 Workout Library is now real and the dashboard's `Explore workouts` CTA opens it.

### Deferred to later phases

- **Workout catalog and selection.** The dashboard links to `/workouts`, which renders the real Phase 14 Workout Library over the canonical static catalog in `src/data/workout-library.ts`. Workout sessions, camera setup, and active workouts still land in their own later phases.
- **Workout detail, setup, and active workout flow.** These remain in Phases 15–16 and later.
- **Workout history, derived stats, subscriptions, analytics.** The dashboard keeps those areas honest until their data sources exist.

---

## 10j. Workout Library Screen (Phase 14)

Phase 14 ships the real Motionly browsing surface at `/workouts`. The library is read-only, local-only, and presentational — no sessions, no camera, no ML, no Supabase, no payments.

### Files

| Path                                       | Responsibility                                                                                                                           |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `src/types/workout-library.ts`             | Domain types: `WorkoutSummary`, `ExerciseSummary`, filter shapes, `LibraryTab`.                                                          |
| `src/data/workout-library.ts`              | Canonical static MVP catalog of workouts and exercises (real product content, not user data).                                            |
| `src/utils/workout-library.ts`             | Pure filter/search/sort helpers — no React, no DOM, no network.                                                                          |
| `src/hooks/useDebouncedValue.ts`           | Generic debounced-value hook used by the exercise search input.                                                                          |
| `src/components/workout-library/`          | Phase 14 composites: header, tab switcher, filter chips, workout/exercise cards, locked badge, empty state, exercise quick-detail panel. |
| `src/pages/workout/WorkoutLibraryPage.tsx` | Route page that wires the catalog through the components.                                                                                |

### Canonical product content vs user data

`src/data/workout-library.ts` is a **canonical static catalog**. It describes the movements Motionly will eventually coach and now includes Phase 15 workout detail sequences. It is the same kind of content a marketing site might call "the exercise library." It is NOT:

- Fake/demo/sample data masquerading as real activity.
- User data (no completions, ratings, popularity, calories, form scores, AI feedback).
- A database. Phase 30 will introduce a real seed/database layer; until then, this file is the single source of truth for library summaries and workout detail records.

### Deferred to later phases

- Camera setup, active workout, summary — Phases 16+.
- Real subscription state — Phase 36+. Phase 14's locked Pro cards are structural only; tapping them routes to the `/paywall` placeholder with an honest toast.
- Workout history, completion records, recommendations — later phases tied to ML and persistence.

## 10k. Workout Detail & Pre-Workout Screen (Phase 15)

Phase 15 replaces the `/workouts/:id` placeholder with a real pre-workout detail screen. It is local-only and presentational, with one async read from the existing onboarding storage adapter for limitation warnings.

### Files

| Path                                      | Responsibility                                                                                                                                  |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/types/workout-library.ts`            | Adds detail sequence types, `WorkoutDetail`, `WorkoutExerciseSequenceItem`, `WorkoutExerciseSet`, and limitation conflict types.                |
| `src/data/workout-library.ts`             | Extends the canonical static catalog with one detail record per workout and helpers such as `findWorkoutDetailById()`.                          |
| `src/utils/workout-limitations.ts`        | Pure helper that compares real onboarding limitations to exercise sequence limitation tags. No React, DOM, network, or scoring.                 |
| `src/hooks/useWorkoutDetailData.ts`       | Reads the static workout detail, reads the real Phase 12 onboarding completion record, and exposes loading / not-found / locked / ready states. |
| `src/components/workout-detail/`          | Presentational components for hero, meta, muscle chips, sequence list, coach note, limitation warning, actions, skeleton, and not-found UI.     |
| `src/pages/workout/WorkoutDetailPage.tsx` | Route composition for `/workouts/:id`, including Start Workout and locked-content navigation behavior.                                          |

### Responsibilities

- **Static canonical content only.** Workout details are authored product content in `src/data/workout-library.ts`; they do not contain completion counts, calories, ratings, popularity, form scores, history, sessions, or generated coaching results.
- **Real limitations only.** Limitation warnings render only when `readOnboardingCompletion()` returns a real Phase 12 record with matching limitation areas. Missing storage, malformed data, empty limitations, or `none` all show no personalized warning.
- **Start Workout handoff only.** Free workouts navigate to `/workout/:id/setup`. Phase 15 itself does not request camera permission, open a live preview, create a workout session, or route directly to the active workout screen.
- **Locked content stays structural.** `accessTier: 'pro'` is catalog metadata, not real subscription state. Locked workouts route to `/paywall` with honest toast copy; payment/subscription logic remains deferred.

### Deferred to later phases

- Camera permission and setup UI — implemented in Phase 16.
- Pose detection, active workout, rep counting, form scoring, and voice cues — Phase 17+.
- Workout session records, history, analytics, Supabase/auth, and real subscription state — later phases.

## 10l. Camera Permission & Setup Screen (Phase 16)

Phase 16 replaces `/workout/:id/setup` with the real camera setup flow for free workouts. It is still pre-ML: no pose landmarks, body detection, skeleton overlay, confidence score, rep counting, form scoring, or active workout UI exists yet.

### Files

| Path                                    | Responsibility                                                                                                             |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `src/types/camera-setup.ts`             | UI-friendly camera stream, lighting, readiness, facing-mode, and setup-error types. No pose / landmark / confidence types. |
| `src/platform/camera-stream.ts`         | Live setup stream adapter; the Phase 16 `getUserMedia` chokepoint for video-only `640x480` user-facing camera requests.    |
| `src/platform/camera-lighting.ts`       | Browser canvas sampler for local in-memory frame brightness analysis.                                                      |
| `src/platform/speech.ts`                | Optional user-initiated Web Speech setup instruction.                                                                      |
| `src/utils/camera-lighting.ts`          | Pure brightness averaging and conservative lighting classification helpers.                                                |
| `src/hooks/useCameraLightingCheck.ts`   | React interval orchestration for 500ms lighting checks while the live preview is active.                                   |
| `src/components/camera-setup/`          | Presentational setup composites for preview, guide, instructions, lighting card, checklist, error state, and actions.      |
| `src/pages/workout/CameraSetupPage.tsx` | Route orchestration: resolve workout, request camera after CTA, own stream cleanup, gate readiness, route to active.       |

### Responsibilities

- **User-initiated camera access.** `/workout/:id/setup` does not prompt on load. Free workouts show `Turn on camera`; locked Pro workouts do not start the camera and route to `/paywall` with honest copy.
- **Temporary UI-only stream.** The setup page owns the live `MediaStream`, attaches it to `<video autoplay playsInline muted>`, mirrors the user-facing preview, and stops tracks before unmount, retry replacement, back, skip, continue, or permission-help navigation. No stream is passed through router state.
- **Lighting is real and local.** The lighting hook samples the current video frame every 500ms through an in-memory canvas and computes average brightness. It can report checking, good, too dark, too bright, or error. Canvas/browser failures are non-blocking and can be manually accepted only by explicit user action.
- **Silhouette is a guide only.** The SVG overlay helps positioning. It turns accent only when the camera is active, lighting is acceptable or manually accepted, and the user taps `I'm lined up`. It is not body detection.
- **Readiness is honest.** Continue is enabled only when the camera stream is active, lighting is good or manually accepted, and the user confirms full-body alignment. The checklist labels phone steadiness as manual instruction, not sensor output.
- **Active route handoff only.** Continue stops the setup stream and navigates to `/workout/:id/active`, which remains the Phase 17+ placeholder. No session records, timers, history, inference, or workout state are created.

### Deferred to later phases

- MediaPipe, model files, pose landmarks, skeleton overlay, body-detected states, confidence scores, rep counting, form scoring, active workout HUD, workout session persistence, history, analytics, Supabase/auth, payments, subscriptions, and backend logic.

---

## 10m. MediaPipe Pose Landmarker Integration (Phase 17)

Phase 17 makes `/workout/:id/active` the minimal pose-debug shell that runs real MediaPipe Pose Landmarker inference. It is the ML foundation only — no smoothing, joint angles, rep counting, form scoring, coaching, or session/history writes ship in this phase.

### Files

| Path                                      | Responsibility                                                                                                                             |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `public/models/pose_landmarker_lite.task` | Official MediaPipe lite Pose Landmarker model (default).                                                                                   |
| `public/models/pose_landmarker_full.task` | Official MediaPipe full Pose Landmarker model (optional, higher accuracy).                                                                 |
| `src/types/pose.ts`                       | Cross-feature pose domain types: `PoseLandmark`, `PoseFrame`, `PoseInferenceStatus`, `PoseInferenceError`, `PoseInferenceStats`, etc.      |
| `src/ml/pose/landmark-names.ts`           | 33-point MediaPipe Pose Landmarker name → index map plus `POSE_LANDMARK_COUNT` and key body indices.                                       |
| `src/ml/pose/pose-model-config.ts`        | Model URLs, default variant, delegate preference, MediaPipe confidence thresholds, WASM base path.                                         |
| `src/ml/pose/PoseLandmarker.ts`           | Single MediaPipe Tasks-Vision boundary in the app. Owns `FilesetResolver`, `createFromOptions`, `detectForVideo`, GPU/CPU fallback, close. |
| `src/hooks/usePoseLandmarker.ts`          | React hook that owns the `requestAnimationFrame` inference loop, FPS / timing stats, and clean teardown.                                   |
| `src/store/usePoseStore.ts`               | Zustand store holding only the latest `PoseFrame`, status, stats, model variant, delegate, and recoverable error. No history, no playback. |
| `src/components/pose-debug/`              | Debug-only UI: `PoseDebugPanel`, `PoseLandmarkStatus`, `PoseFpsBadge`, `PoseModelStatusCard`, `PoseLandmarkOverlay`.                       |
| `src/pages/workout/ActiveWorkoutPage.tsx` | Minimal active-route shell: camera lifecycle, model lifecycle, live preview, debug overlay, debug panel, navigation, no fake state.        |
| `vite.config.ts → motionlyMediaPipeWasm`  | Vite plugin that serves and emits the Tasks-Vision WASM fileset under `/mediapipe-wasm/` so production never hits a remote CDN.            |

### Responsibilities

- **Single MediaPipe boundary.** `@mediapipe/tasks-vision` is imported in exactly one file (`src/ml/pose/PoseLandmarker.ts`). UI, hooks, stores, and pages consume Motionly's own `PoseFrame` / `PoseDetectionResult` types so vendor symbols do not leak.
- **User-initiated inference.** The active page does not request camera access or load the model on mount. The "Start pose debug" CTA triggers `requestCameraStreamForSetup('user')` (the Phase 16 platform chokepoint) and then `usePoseLandmarker.start()`.
- **One detection per animation frame.** The inference loop checks `video.currentTime` and skips frames with no new data so MediaPipe never sees duplicate timestamps. It measures rolling FPS, last/average inference ms, and frames skipped — all from real observations.
- **GPU first, CPU fallback.** The wrapper requests `delegate: GPU` and transparently retries with `CPU` if GPU initialization fails. The UI surfaces the fallback honestly via `PoseModelStatusCard`.
- **Local-only WASM.** The Tasks-Vision WASM fileset ships from `/mediapipe-wasm/` (served via dev middleware and copied into `dist/` by the custom Vite plugin) so production stays on-origin and the service-worker `/mediapipe-wasm/` `CacheFirst` rule actually caches the bytes.
- **Worker boundary (deferred).** Phase 17 keeps inference on the main thread but isolates it behind `MotionlyPoseLandmarker` + `usePoseLandmarker`. Moving to a Web Worker + `OffscreenCanvas` later requires swapping those two files, not rewriting consumers. The boundary, abstraction, and TODO are intentional.

### Privacy and honesty rules (Phase 17)

- No raw frames, landmarks, or world landmarks are stored beyond the latest `PoseFrame`.
- No video, image, landmark, or stats data is uploaded, persisted, or transmitted anywhere.
- No fake landmarks, fake confidence scores, fake landmark counts, fake FPS, or fake "AI feedback" exist anywhere in the pose pipeline. If MediaPipe returned an empty result, the UI renders the honest "no-pose" state instead of inventing dots.

### Deferred to later phases

- Phase 18 smoothing / normalization / confidence filtering.
- Phase 19 joint angle math.
- Phase 20 squat state machine and rep counting.
- Workout session records, timers, history, summary screens, calories, form scoring, voice coaching, analytics, Supabase/auth, payments, and subscriptions.
- Web Worker + `OffscreenCanvas` inference. The Phase 17 boundary is designed to make this swap clean.

---

## 10n. Landmark Data Pipeline & Smoothing (Phase 18)

Phase 18 inserts a real landmark processing layer between MediaPipe's
raw inference (Phase 17) and the still-deferred angle / rep / form
logic. The processing layer smooths, confidence-tags, and torso-scale
normalizes each frame, then publishes both the raw and the processed
result so the Phase 17 debug surfaces stay intact and Phase 19+ can
consume a stable input.

### Files

| Path                                      | Responsibility                                                                                                                                                                                                                                           |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/types/pose.ts`                       | Extends Phase 17 types with `PoseProcessingConfig`, `PoseProcessingStats`, `ProcessedPoseLandmark`, `NormalizedPoseLandmark`, `PoseVisibilityReport`, `PoseNormalizationMetadata`, `BodyVisibilityStatus`, `ProcessedPoseFrame`, `PoseProcessingResult`. |
| `src/ml/pose/pose-processing-config.ts`   | Default smoothing α (`0.5`), per-landmark visibility threshold (`0.6`), body-visibility threshold (`0.6`), minimum torso scale (`1e-3`), key body landmark indices, safe clamp helpers, and `resolvePoseProcessingConfig`.                               |
| `src/ml/pose/LandmarkSmoother.ts`         | Exponential Moving Average per axis. Resets on no-pose / partial-pose / model restart. Never invents landmarks.                                                                                                                                          |
| `src/ml/pose/ConfidenceFilter.ts`         | Tags each landmark visible-or-not, computes mean key-landmark visibility, builds the per-frame `PoseVisibilityReport`. Never invents "form confidence".                                                                                                  |
| `src/ml/pose/LandmarkNormalizer.ts`       | Centers on hip midpoint and divides by hip-to-shoulder torso scale. Returns tagged failure when torso landmarks are missing / occluded / numerically unsafe.                                                                                             |
| `src/ml/pose/processPoseFrame.ts`         | `PoseFrameProcessor` class owns the smoother instance, runs the per-frame pipeline, measures stage timings, exposes `process()` / `reset()` / `updateConfig()`. Plus the functional `processPoseFrame(processor, frame)` wrapper.                        |
| `src/hooks/usePoseLandmarker.ts`          | Owns a per-session `PoseFrameProcessor`. Stores raw + processed frames + processing stats + visibility report. Resets the processor on stop / unmount / no-pose / model restart.                                                                         |
| `src/store/usePoseStore.ts`               | Extended to hold the latest raw frame + latest processed frame + processing stats + visibility report + body visibility status + processing config. Latest-only, in-memory, no history.                                                                  |
| `src/components/pose-debug/`              | Adds `PoseProcessingStatusCard`, `PoseVisibilityCard`, `PoseProcessingStatsCard`, and `raw` / `smoothed` / `normalized` overlay modes to `PoseLandmarkOverlay`.                                                                                          |
| `src/pages/workout/ActiveWorkoutPage.tsx` | Wires the Phase 18 state into the debug shell: processed landmark status, body visibility, occluded landmarks, smoothing / normalization status, pipeline overhead, overlay mode toggle.                                                                 |

### Pipeline

For each raw `PoseFrame` the processor:

1. Builds a `PoseVisibilityReport` from the raw landmarks (per-key-landmark detail + occlusion list + mean score).
2. Runs the EMA smoother on the raw landmarks (returns `null` on partial / no-pose, which resets the smoother).
3. Re-tags each smoothed landmark with the per-landmark confidence filter so `isVisible` matches the report.
4. Asks the normalizer to project the tagged landmarks into torso-scale coordinates. The normalizer returns a tagged failure (`no-landmarks`, `key-landmarks-occluded`, `invalid-torso-scale`, `numeric-instability`) when the torso reference is unavailable; the smoothed landmarks remain usable on a normalization failure.
5. Returns a `ProcessedPoseFrame` with stage timings (`smoothingMs`, `filteringMs`, `normalizationMs`, `totalProcessingMs`) and processed/dropped frame counts.

### Privacy and honesty rules (Phase 18)

- No raw or processed landmarks, visibility scores, or processing stats are persisted. The store keeps `latestFrame` and `latestProcessedFrame` only.
- No video, frame, or landmark data is uploaded, persisted, or transmitted.
- No "form confidence", "workout readiness", or 0–100 AI accuracy is derived. Visibility values are only what MediaPipe returned and what the filter then tagged.
- No fake landmarks. If MediaPipe returns fewer than 33 landmarks, the processor resets the smoother and emits `processed: null`; the UI surfaces an honest "no pose" state.
- No fake "fully visible" claims. `isBodyFullyVisible` is `true` only when every configured key landmark cleared the per-landmark visibility threshold for that frame.
- No medical or injury claims. The visibility card uses plain "fully visible" / "partial" / "no pose detected" language.

### Deferred to later phases

- Phase 19 joint angle math (uses Phase 18 normalized landmarks).
- Phase 20+ squat state machine, rep counting, and per-exercise smoothing α tuning.
- Phase 21+ form scoring and coaching cue rules.
- Phase 25 voice feedback. Phase 26 final skeleton overlay.
- Workout session records, timers, history, summary screens, calories, Supabase/auth, payments, subscriptions, and analytics.
- Web Worker + `OffscreenCanvas` migration — the Phase 17 boundary plus the Phase 18 processor remain swap-friendly for that future move.

---

## 11. Things This Document Does Not Cover

- **Coding style, naming, lint rules:** see [`CODING_STANDARDS.md`](./CODING_STANDARDS.md).
- **Setup, dev server, build, preview, real-phone LAN testing:** see [`SETUP.md`](./SETUP.md).
- **Repository hygiene, commit conventions, branching:** see [`REPOSITORY_STANDARDS.md`](./REPOSITORY_STANDARDS.md).
- **Phase scope and ordering:** see [`MOTIONLY_MASTER_PLAN.md`](../MOTIONLY_MASTER_PLAN.md).

Keep this document the **structural** source of truth. If the structure changes, update this file in the same commit.
