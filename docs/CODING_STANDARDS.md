# Motionly — Coding Standards

This document defines the day-to-day rules for writing code in the Motionly repository. It corresponds to **Phase 4 — Project Folder Structure & Architecture Standards** of [`MOTIONLY_MASTER_PLAN.md`](../MOTIONLY_MASTER_PLAN.md) and is the companion to [`ARCHITECTURE.md`](./ARCHITECTURE.md) (folders, layering, platform adapters).

If two rules conflict, **`ARCHITECTURE.md` wins on structure, this file wins on style.** When neither is clear, prefer the simpler option.

---

## 1. TypeScript

- **`strict` is non-negotiable.** `tsconfig.app.json` enables `strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `noImplicitOverride`, and `noUncheckedSideEffectImports`. Do not weaken these to make code compile.
- **No broad `any`.** If you genuinely need to escape the type system (rare), use `unknown` and narrow with a type guard, or use a typed escape hatch (e.g. `as` to a precise type) with a one-line comment explaining why. Drive-by `any` is a code-review block.
- **Prefer explicit domain types.** Once a concept is shared by more than one module, lift it into `src/types/`. Component prop types stay local to the component.
- **`unknown` over `any`** at module boundaries (parsing JSON, browser events, third-party callbacks).
- **No `// @ts-ignore`** without a one-line justification and ideally a linked issue. `// @ts-expect-error` is preferred when the suppression should disappear once a related fix lands.
- **`type` over `interface`** for unions, intersections, and most domain types. `interface` is fine for object shapes that are expected to be extended.
- **Avoid `enum`.** Use string-literal unions (`type Side = 'left' | 'right'`) — they tree-shake cleanly and serialize naturally.

---

## 2. React Components

- **Functional components only.** No class components.
- **Typed props.** Every component declares its props type explicitly:
  ```tsx
  type ButtonProps = { label: string; onPress: () => void; disabled?: boolean };
  export function Button({ label, onPress, disabled }: ButtonProps) { … }
  ```
- **Small components.** If a component file grows past ~200 lines, look for a primitive to extract into `src/components/`.
- **Separate primitives from pages.** Anything reusable lives in `src/components/`; page-level composition lives in `src/pages/`.
- **No fake UI states.** Loading and empty states must reflect real data states. Do not render fabricated stats, fabricated streaks, fabricated AI feedback, or claims that imply unfinished features are live.
- **Side effects in `useEffect` only.** Don't run effects inside render. Keep effect dependencies honest (don't suppress the deps warning to silence it).
- **One default export per file or none.** Prefer named exports for components, hooks, and utilities — easier to refactor and search.

---

## 3. Hooks

- **Live in `src/hooks/`** when shared across components. Hooks used by a single component can stay colocated.
- **Name as `useThing.ts`.** The leading `use` is required by React's rules-of-hooks linter and is non-negotiable.
- **Don't hide privacy-sensitive APIs.** A hook may _consume_ a platform adapter, but it must not bypass it. If a hook needs camera, TTS, storage, or notification access, it goes through the adapter in `src/platform/` (see `ARCHITECTURE.md` §6).
- **No conditional hooks.** Same hook order on every render — this is the React rule, surfaced by ESLint.
- **Memoize on purpose, not by default.** `useMemo` / `useCallback` only when there is a measurable reason (stable identity for a dep array, expensive computation). Premature memoization adds noise.

---

## 4. Services

- **Owns business / integration logic.** API clients, auth/session helpers, billing, persistence orchestration, opt-in analytics.
- **Lives in `src/services/`.** Do not implement Supabase, Stripe, Razorpay, or any backend integration outside this folder.
- **No direct Supabase implementation yet.** Supabase is introduced in Phase 31. Phase 4 must not ship Supabase calls.
- **No JSX inside services.** Services return data, promises, or observables — never React elements.
- **Test the service, not the page that uses it.** Pure services are far easier to unit-test (Phase 49 introduces Vitest).

---

## 5. Platform Adapters

- **Browser-only APIs are confined to `src/platform/`.** This includes (at least) camera, TTS, audio playback, storage, notifications, haptics, wake lock, and any future capability.
- **Each adapter defines a TypeScript interface and a web implementation.** Product code imports the interface, not the implementation directly.
- **The future Capacitor swap must be possible.** Don't leak browser concepts (e.g. `MediaStream`) through interface signatures more than necessary; prefer Motionly-domain types (`CameraStreamHandle`).
- **Don't reach for `navigator.*`, `window.*`, `document.*`** from components, pages, hooks, services, or ML modules. Add or extend an adapter instead.

---

## 6. ML

- **Pose engine, joint angles, exercise state machines** live in `src/ml/`. Web Worker entry points live in `src/workers/`.
- **No fake ML outputs.** Do not fabricate rep counts, form scores, or pose landmarks anywhere — not in stories, not in demos, not in tests' fixtures that get rendered as if real.
- **No medical or injury-prediction claims.** Motionly is a movement coach. Do not phrase form feedback in clinical or diagnostic terms ("injury risk", "diagnosis", "treatment"). Use coaching language.
- **Inference runs off the main thread** once Phase 19 lands. Until then, no inference exists.

---

## 6a. Routing (Phase 6)

- **Pages live in `src/pages/`.** One file per top-level URL; subfolders by domain (`auth/`, `main/`, `workout/`, `progress/`, `profile/`, `modal/`, `system/`). The router never imports another page; pages never import the router.
- **Route constants and types live in `src/router/`.** Import paths from `ROUTE_PATHS` in `src/router/routePaths.ts`. Use the `buildWorkout*Path(id)` helpers for URLs with dynamic segments. Never inline route strings in components, hooks, or services.
- **Programmatic navigation uses `useNavigation()`** from `src/hooks/useNavigation.ts`. Do not import `useNavigate()` directly outside that hook — it bypasses the typed surface and makes future renames painful.
- **`useParams` is typed.** Reach for the `Workout*RouteParams` aliases in `src/router/routeTypes.ts` instead of writing inline `Record<string, string>` shapes.
- **Routes are lazy.** Every entry in `routes.tsx` uses `React.lazy()`. New routes follow the same pattern.
- **`<RequireAuth>` is structural only.** Real auth lands in Phase 32; Phase 6 must not introduce fake users, fake sessions, or `localStorage`-pretend-auth on its behalf.

---

## 6b. UX Documentation Discipline (Phase 7)

Phase 7 shipped UX planning docs under [`../wireframes/`](./wireframes) and [`../USER_FLOWS.md`](./USER_FLOWS.md). When you implement a screen in a later phase:

- **Read the relevant wireframe first.** Before opening a file under `src/pages/`, find its wireframe (`docs/wireframes/0X-*.md`) and the user flow it participates in (`docs/USER_FLOWS.md`). Treat them as the agreed design intent.
- **Update docs when implementation diverges.** If you make a deliberate change to the layout, copy, or flow, edit the wireframe in the same PR. Stale documentation that says one thing while the code does another is worse than no documentation.
- **Do not turn documentation placeholders into runtime fake data.** Sample names ("Lower Body Foundations"), numbers ("avg form 72"), and per-rule scores in the wireframes are illustrative documentation only. They are not seed data, mocks, or fixtures — and they must not be copied into product code as if real workouts, users, or stats existed.
- **Carry the design principles forward.** [`docs/wireframes/00-design-principles.md`](./wireframes/00-design-principles.md) is normative. Implementation choices that conflict with those principles are a review block, not a discussion.

---

## 6c. Primitive Components (Phase 8)

Phase 8 introduced Motionly's reusable UI primitives under `src/components/primitives/`. They are the canonical building blocks for product screens, and the full inventory lives in [`COMPONENTS.md`](./COMPONENTS.md).

- **Use the primitives first.** Before reaching for raw Tailwind on a `<button>`, `<input>`, `<div>`, or `<span>` in a product screen, check whether `Button`, `Input`, `Card`, `Row`, `Column`, `Badge`, `Tag`, `Chip`, `Icon`, or `Avatar` already covers the case. Three similar lines is better than a premature abstraction, but a fourth occurrence should be composed from the primitive.
- **Do not bypass `Button` / `Input` / `Card` for basic UI in future screens.** Raw `<button>` / `<input>` elements show up in product code only when the primitive genuinely doesn't fit — and that is rare. If you need new behavior, extend the primitive instead of re-implementing it inline.
- **Use the `Icon` wrapper instead of raw lucide imports in product screens** unless there is a clear reason (e.g. the icon is rendered inside another lucide-aware primitive). The wrapper enforces size + tone tokens and accessibility defaults.
- **Compose with `Row` / `Column`** instead of sprinkling `flex items-* justify-* gap-*` across pages. Reserve raw flex utilities for one-off layouts inside the primitive itself.
- **No hardcoded colors.** Primitives and their consumers use Motionly Tailwind tokens (`bg-motionly-*`, `text-motionly-*`, `border-motionly-*`). Hex values stay in `tailwind.config.ts`.
- **No fake data in primitive examples or callers.** `Avatar` never invents initials; `Badge`, `Tag`, `Chip` never invent labels; `Button` never shows fabricated success or progress text. If you find yourself reaching for placeholder users / workouts / stats / AI feedback to demo a primitive, build the demo with copy that is obviously generic ("Field label", "Action") rather than fabricating product data.
- **Browser APIs stay behind `src/platform/`.** `Button`'s optional haptic feedback calls `triggerLightHaptic()` from `@platform/haptics`. Do not call `navigator.vibrate` (or any other browser global) from a component, hook, or page.
- **Phase 9 components are out of scope.** `CircularProgress`, `LinearProgress`, `ScoreBadge`, `FormCueCard`, `RepCounter`, `WorkoutTimer`, `Toast`, `SkeletonLoader`, `EmptyState`, `ErrorBoundary`, and `ConfidenceIndicator` ship in their own phase. Do not back-port them into the Phase 8 primitive library.

---

## 6d. Feedback & Status Components (Phase 9)

Phase 9 introduced the feedback / status / progress component library under `src/components/feedback/`. The full inventory and rules live in [`COMPONENTS.md`](./COMPONENTS.md) §8.

- **Feedback components are presentational.** Do **not** fabricate, generate, or invent values inside them. Scores, progress percentages, rep counts, elapsed times, confidence ratings, cue messages, toast text, and empty-state copy must all come from the caller (a future engine / store / handler). If the caller has no real value yet, do not render the component.
- **Keep numeric helpers centralized.** Score tone mapping lives in `@utils/score` (`clampScore`, `clampProgress`, `scoreTone`). Duration formatting lives in `@utils/formatDuration` (`formatDurationSeconds`, `formatDurationMs`). Do not inline thresholds or format strings in components — extend the helper.
- **Compose Phase 8 primitives.** When a feedback component needs a button, card, text, icon, row, or column, import from `@components/primitives`. Do not rewrite or shadow primitives.
- **Use `aria-live` carefully.** `assertive` interrupts the user — reserve it for mid-workout cues and errors. `polite` is the right default for rep counters, progress updates, and non-error toasts. Components that already provide a live region must not be wrapped in another one by the caller.
- **Respect reduced motion.** Every animated feedback component honors `prefers-reduced-motion` via `useReducedMotion()` from `framer-motion` or Tailwind's `motion-reduce:*` utilities. New animated components must do the same.
- **No medical / injury claims.** Cue copy, confidence messaging, toast text, and empty-state copy must follow Design Principle 6 — no "injury risk", "diagnosis", "treatment", or related vocabulary. Use coaching language only.
- **Toasts are UI notifications.** `ToastProvider` / `useToast` is the only toast API. Do not import third-party toast libraries directly; do not conflate toasts with Web Push notifications (Phase 44 is separate and unimplemented).
- **`ErrorBoundary` is local recovery.** It does not send errors to Sentry or any analytics service; do not add that integration as a side-effect of Phase 9.

---

## 6e. Launch Experience (Phase 10)

Phase 10 ships the launch orchestration layer under `src/launch/`, the launch UI under `src/components/launch/`, the read-only `hasOnboarded` reader in `src/platform/onboarding-storage.ts`, and the inline pre-React splash in `index.html`. Full module map and rationale live in [`ARCHITECTURE.md`](./ARCHITECTURE.md) §10f.

- **No fake auth / onboarding state at launch.** Neither `<LaunchGate>`, `useLaunchDecision`, `getLaunchAuthState`, nor `readHasOnboarded` may seed fake users, fake sessions, fake tokens, or fake `hasOnboarded` writes. The truthful answers today are `'not-implemented'` and `false`; do not paper over them.
- **No fake loading copy on the splash or launch screen.** Brand reveal only — wordmark + tagline. No "Loading AI…", no "Analyzing movement…", no "Connecting to server…", no fake progress bar.
- **Launch decisions use route constants.** Import `ROUTE_PATHS` from `@router/routePaths` everywhere in `src/launch/`. Do not inline `'/welcome'`, `'/'`, or any other route string.
- **Do not bypass `src/platform/` for storage.** The launch gate may use `window.history.replaceState` once (it's the documented touch point for URL reconciliation before the router mounts), but any onboarding / theme / session storage access goes through an adapter in `src/platform/`.
- **Read-only `hasOnboarded` in Phase 10.** Writing the flag belongs to Phase 12 once the onboarding completion step exists. Do not back-port a write helper into `@platform/onboarding-storage` until Phase 12.
- **Future-safe auth only.** `getLaunchAuthState` returns `{ status: 'not-implemented', reason: 'auth-deferred-to-backend-phase' }` until Phase 32 lands real Supabase session rehydration. Do not install Supabase, fake tokens, or mock currentUser objects ahead of that phase.
- **Toast actions extend, don't replace, the Phase 9 system.** The `ToastAction` type is a minimal opt-in. Toasts remain UI notifications; do not extend them into a parallel router, dialog, or push-notification system.
- **SW update prompt never auto-reloads.** `useServiceWorkerUpdatePrompt` only reloads when the user taps the "Refresh" action. Do not call `window.location.reload()` from the event handler or from any other launch surface without user input.

---

## 6f. Onboarding Screens 1–3 (Phase 11)

Phase 11 introduces `/welcome`, the first three internal `/onboarding` steps, and the in-memory Zustand onboarding draft store. The rules here protect the phase boundary until screens 4–5 and completion land.

- **No fake onboarding completion.** Do not write `hasOnboarded = true`, do not navigate to Home as if onboarding is done, and do not create fake completion flags in memory, `localStorage`, IndexedDB, Supabase, or route state.
- **No fake personalization.** Goal and fitness selections may be stored as draft inputs only. Do not generate workout recommendations, form scores, first workouts, streaks, stats, or AI feedback from them.
- **No weight or body-shame prompts.** Do not ask for current weight, target weight, body composition, calories, diet goals, or "ideal body" framing in onboarding.
- **No camera prompt yet.** Do not call `navigator.mediaDevices.getUserMedia`, request camera permission, render a fake camera preview, or imply the camera / ML stack is active before the planned camera phases.
- **Selection state stays local and honest.** Phase 11 onboarding state is in-memory Zustand only. Selections persist while moving back and forward inside `/onboarding`, but refresh persistence, IndexedDB writes, Supabase sync, and completion writes wait for later phases.

---

## 6g. Onboarding Screens 4–5 + Completion (Phase 12)

Phase 12 completes onboarding with the limitations screen, the camera tutorial / permission primer, and the IndexedDB completion write. The rules below protect the phase boundary.

- **No medical claims, no diagnosis, no injury-prevention promises.** The limitations screen is a comfort-driven check-in, not a medical form. Do not ask for pain severity, diagnoses, surgical history, medications, or treatment details. Do not imply Motionly can prevent injury or replace medical care.
- **No fake adaptation logic yet.** Selecting a limitation must not change workouts, recommendations, exercise lists, or coaching copy in Phase 12 — adaptation belongs to later workout-library / pre-workout phases.
- **Camera permission must be user-initiated.** `navigator.mediaDevices.getUserMedia` may only be called from `src/platform/camera-permission.ts`, and only after the user taps the primary CTA on the camera tutorial step. Never auto-prompt on page load, on step entry, or during a transition.
- **Video stream must be stopped immediately in Phase 12.** The adapter requests video only, never audio, and calls `track.stop()` on every track before returning. No `MediaStream`, frame, or `MediaRecorder` reference may outlive the adapter call in this phase.
- **No raw video storage or upload.** Phase 12 must not write frames, recordings, snapshots, or screenshots to any storage, blob URL, server, or analytics. The completion record persists user answers only.
- **No fake "camera ready" state.** Only set `cameraPermissionStatus` to `granted` when the browser actually returns a stream. Denial, unavailable, and error states must remain visibly distinct from granted; do not collapse them to a single "good to go" message.
- **No live preview, silhouette, or skeleton overlay.** The tutorial cards are static (with optional reduced-motion-aware entrance animations). Live video, ML preview, and pose overlay are deferred to later camera phases.
- **Honest "Continue without camera for now" exit.** This path writes the completion record with `cameraPermissionGranted: false` and is the only acceptable way to bypass a failed prompt; it must not claim the camera was granted.
- **Onboarding storage stays minimal.** `src/platform/onboarding-storage.ts` may persist `hasOnboarded = true` plus a minimal completion record (timestamp, goals, fitness level, limitations, notes, camera-granted boolean). It may not store fake users, sessions, accounts, workouts, stats, AI scores, or any camera/media data. Supabase sync is intentionally skipped until backend/auth phases land.

---

## 6h. Home / Dashboard Screen (Phase 13)

Phase 13 turns `/` into the real returning-user dashboard. It is still bounded by the absence of workout, history, stats, and subscription data sources.

- **No fake dashboard metrics.** Do not render fabricated workouts completed, form score, correct reps, streaks, or any other score-like readout.
- **No fake today's workout.** The Phase 14 library exists, but personal recommendations do not. The dashboard may link to `/workouts` and explain that recommendations arrive once workout sessions and history land.
- **No fake recent activity.** Recent activity must stay empty / unavailable until real workout history exists.
- **No fake upgrade banner.** Subscription / free-tier state is not live yet, so dashboard monetization UI stays hidden.
- **Dashboard cards must be honest.** Each card should render one of three states: real data, empty state, or unavailable state. Never use placeholder product data as if it were user data.
- **Onboarding summary may use real stored completion data only.** Goals, fitness level, limitations, and camera permission can be shown if `readOnboardingCompletion()` returns a real record from IndexedDB.
- **Refresh is local only.** The dashboard refresh control re-reads local storage; it does not call a network service.

---

## 6i. Workout Library Screen (Phase 14)

Phase 14 adds the real `/workouts` browsing surface — the Workouts tab, the Exercises tab, filters, search, locked-content treatment, and an in-page exercise quick-detail panel. It is read-only: no sessions, no camera, no ML, no Supabase, no payments.

- **Catalog content is canonical product content.** Workouts and exercises declared in `src/data/workout-library.ts` are real Motionly content (like marketing copy). Do not label them "demo", "mock", "sample", or "placeholder", and do not present them in a way that implies fake user activity.
- **No fake user stats.** The library renders movements and metadata only. Do not add completion counts, ratings, popularity ("used by 10k people"), calories burned, recent activity, form scores, rep counts, AI feedback, or recommendations on library cards.
- **No live AI claims.** Each exercise lists future coaching cues under "What Motionly will coach later" — phrased as future capability, never as live coaching. Phase 14 does not run pose detection.
- **No fake subscription state.** `accessTier: 'pro'` is canonical content metadata, not a user-tier flag. Locked content stays visible behind a `LockedContentBadge`; tapping it routes to the existing `/paywall` placeholder with an honest toast. Do not store or read subscription state in Phase 14.
- **No direct camera or start-workout actions from the library.** Library actions route to `/workouts/:id` (the Phase 15 placeholder) or `/paywall`. Do not navigate to `/workout/:id/setup` or `/workout/:id/active` from the library — those flows belong to later phases.
- **Use route helpers, not raw URLs.** Library code uses `useNavigation()` (`goToWorkoutDetail`, `goToPaywall`) and `ROUTE_PATHS` / `buildWorkoutDetailPath`. Do not inline `/workouts/...` strings in components.
- **Library data lives in `src/data/`.** Catalog content goes in `src/data/workout-library.ts`. Filter/search/sort logic lives in `src/utils/workout-library.ts` as pure functions — no React, no DOM, no network.
- **No photographic media.** Phase 14 ships abstract token-based artwork (gradients + Lucide icons via the `Icon` wrapper). Do not introduce stock photos, athlete imagery, or body-ideal visuals.
- **Cards stay honest about safety.** Beginner copy may suggest stopping if something hurts; do not add medical, injury-prevention, or diagnostic claims.

## 6j. Workout Detail & Pre-Workout Screen (Phase 15)

Phase 15 replaces `/workouts/:id` with the real pre-workout detail screen. It is still local-only: static canonical product content plus real onboarding limitation reads.

- **No fake outcome stats.** Workout detail pages must not show completion counts, fake session history, fake streaks, calories, ratings, popularity, form scores, rep counts, or recent activity.
- **No fake AI feedback.** Exercise sequence previews may show future-tense "Motionly will coach later" cues from the catalog, but must not imply pose detection, live feedback, confidence, scoring, or rep counting is running.
- **Limitation warnings use real onboarding data only.** Read limitations through `readOnboardingCompletion()` / `useWorkoutDetailData()`. Missing records, storage failures, empty limitation lists, and `none` must not produce personalized warnings.
- **Keep limitation copy informational.** Use plain movement language: "may involve your knees", "move slowly", "reduce range", "skip uncomfortable movements". Do not diagnose, score, or make medical claims.
- **Start Workout is only a route handoff.** From a free workout detail page, the CTA may navigate to `/workout/:id/setup`, but it must not call camera APIs, request permission, create a session record, write workout history, start timers, or route to `/workout/:id/active`.
- **Locked Pro workouts stay structural.** `accessTier: 'pro'` is content metadata only. Route to `/paywall` with honest toast copy; do not read or invent subscription state.

## 6k. Camera Permission & Setup Screen (Phase 16)

Phase 16 replaces `/workout/:id/setup` with the real pre-workout camera setup screen. It is camera setup only: no pose inference, no landmark detection, no active workout session, and no generated coaching outputs.

- **Camera calls stay in `src/platform/`.** The live setup stream must be requested only through `src/platform/camera-stream.ts`. Product code may attach the returned stream to a `<video>`, but it must not call `navigator.mediaDevices.getUserMedia` directly.
- **No microphone or audio capture.** Camera setup requests video only. Do not add audio constraints, microphone permission, `MediaRecorder`, screenshots, recording, upload, or video persistence.
- **Stop tracks on cleanup.** Any flow that leaves, retries, cancels, skips, errors, or continues from setup must call the stream cleanup helper and clear the video element's `srcObject`.
- **No fake body detection.** Do not show copy such as "full body detected", "landmarks detected", "skeleton ready", "AI sees you", "view is clear", confidence scores, skeleton joints, landmark dots, or body-detected states until real ML lands in Phase 17+.
- **Silhouette is a positioning guide.** The overlay may guide the user and change tone only from honest setup conditions: camera active, lighting accepted, and explicit user confirmation.
- **Lighting checks are local-only.** The only allowed frame analysis in Phase 16 is in-memory canvas brightness sampling for lighting. Do not store pixels, write frames to IndexedDB/localStorage, or send them anywhere.
- **Manual gates must be explicit.** Alignment and manual lighting override are user actions. The app must not silently auto-pass setup based on no ML signal.
- **Active workout remains later.** Continue from setup may route to `/workout/:id/active`, but it must not create session state, start timers, count reps, score form, or implement the active workout UI.

---

## 6l. MediaPipe Pose Landmarker Integration (Phase 17)

Phase 17 introduces real on-device pose inference for `/workout/:id/active`, but only as the ML foundation — no exercise coaching, no rep counting, no form scoring, no session/history writes are allowed.

- **No fake landmarks.** If MediaPipe returns an empty landmark array, render the honest "no-pose" state. Do not synthesize dots, fall back to a default skeleton, or animate fake limbs.
- **No fake pose confidence.** Never derive or display a `0–100` "confidence" or "AI accuracy" score in Phase 17. Visibility values are only what MediaPipe returns. Phase 18 owns the confidence-filter abstraction.
- **No fake body detection.** Phase 17 does not declare "full body detected", "form ready", "AI is watching", or similar before downstream phases compute those signals from real data.
- **No form feedback or AI coaching.** No `FormCueCard`, "Good form!", "Knees over toes!", "Lower your hips!", or "completed!" UI may render based on Phase 17 landmark output. Those depend on Phase 19+ angle math and Phase 20+ exercise engines.
- **No rep counting.** The 33 landmarks are not turned into a rep counter, set counter, workout timer, or workout completion at any point in Phase 17.
- **No landmark persistence.** Do not write landmarks, world landmarks, frame ids, FPS samples, or model load timings into `localStorage`, IndexedDB, Supabase, or any analytics surface. The Zustand pose store retains only the most recent frame in memory.
- **No video / frame storage or upload.** Phase 17 never records, exports, encodes, or transmits camera frames. The `MediaStream` is video-only and lives only while the active page is mounted.
- **MediaPipe calls live in `src/ml/pose/`.** `@mediapipe/tasks-vision` may only be imported from `src/ml/pose/PoseLandmarker.ts` (and Phase 17+ helpers in the same folder). UI, pages, hooks, and stores consume Motionly's own `PoseFrame` / `PoseDetectionResult` types.
- **Camera calls still live in `src/platform/`.** Active route camera access goes through the existing `src/platform/camera-stream.ts` chokepoint. Do not call `navigator.mediaDevices.getUserMedia` from pages, hooks, or ML modules.
- **Model & WASM URLs must stay app-local.** Models load from `/models/*.task` and WASM loads from `/mediapipe-wasm/*`. Do not silently swap to a remote CDN; the service worker depends on those paths for offline behavior.
- **One inference per frame.** Use `requestAnimationFrame` and skip frames with no new `video.currentTime`. Do not run `detectForVideo` on a synthetic timer at faster-than-display rates.
- **Clean lifecycle.** Camera tracks must be stopped and `PoseLandmarker.close()` must be called on unmount, navigation, stop, and error recovery. Streams must not be stored globally or passed through router state.

---

## 6m. Landmark Data Pipeline & Smoothing (Phase 18)

Phase 18 inserts a smoothing / confidence-filter / torso-scale-normalization layer between raw MediaPipe output and the still-deferred angle / rep / form logic. The same rules that kept Phase 17 honest apply here, plus a handful of pipeline-specific ones.

- **No fake processed landmarks.** Never invent smoothed coordinates for missing landmarks. If MediaPipe did not return 33 landmarks, the smoother resets and the processor emits `processed: null`. Do not pad a missing landmark with the previous frame's coordinates.
- **No fake confidence.** Visibility / presence values pass through unchanged. The Phase 18 filter only restates what MediaPipe reported. Never derive or display a 0–100 "AI accuracy" or "form confidence" score in Phase 18.
- **No fake body visibility.** `isBodyFullyVisible` is `true` only when every configured key landmark cleared the per-landmark threshold. Do not claim "fully visible" from the mean score alone.
- **Smoothing must reset on no-pose.** `LandmarkSmoother.reset()` must be called on no-pose / partial-pose / model restart / camera stop / inference stop / unmount. Stale EMA state must never bleed into a later detected frame.
- **Normalization must fail safely.** When the four torso landmarks (left/right hip, left/right shoulder) are missing, occluded below threshold, or yield a too-small / non-finite torso scale, the normalizer returns a tagged failure (`no-landmarks`, `key-landmarks-occluded`, `invalid-torso-scale`, `numeric-instability`). Do not invent normalized values.
- **No angle calculations until Phase 19.** Do not compute joint angles, trunk angle, knee valgus, or bilateral symmetry in Phase 18 — even as a "quick preview".
- **No reps, scores, or cues until later phases.** Phase 18 must not increment rep counters, score form, throttle cues, render `FormCueCard`, write workout sessions, or start workout timers.
- **No pose history persistence.** The pose store keeps only the latest raw frame and the latest processed frame, in memory. No `localStorage`, no IndexedDB, no Supabase, no analytics, no file writes, no network calls per frame, no unbounded arrays.
- **No new dependencies.** Phase 18 uses plain TypeScript math. Do not add math, pose, charting, analytics, or state libraries.
- **No per-frame side effects.** No per-frame `console.log` / `console.info`, no per-frame toasts, no per-frame DOM writes outside the React render path. Timing measurements via `performance.now()` are the only allowed per-frame side effect.
- **Mutation discipline.** Do not mutate the raw `PoseFrame.landmarks` array. Create a new `ProcessedPoseLandmark[]` per frame.
- **Single processor per session.** The hook owns one `PoseFrameProcessor` per inference session. Do not create a new processor per frame — that would disable smoothing.
- **Processing overhead target.** Aim for less than 2 ms per frame total pipeline overhead. The Phase 18 debug surface flags above-target frames in a warning tone — do not silence the signal.

---

## 7. Styling

- **Tailwind is the styling foundation.** Use Tailwind utilities and the Motionly tokens defined in `tailwind.config.ts` for product styling. Keep global CSS limited to Tailwind directives and app-wide browser defaults.
- **Use theme tokens instead of hardcoded colors.** Hex values belong in `tailwind.config.ts`, generated/public assets, or documentation that explicitly describes the tokens. Application code should use classes such as `bg-motionly-bg-light`, `dark:bg-motionly-bg-dark`, `text-motionly-neutral-500`, and `text-motionly-primary`.
- **Use the Phase 5 typography utilities.** Prefer `text-h1`, `text-h2`, `text-h3`, `text-body`, `text-label`, and `text-caption` over arbitrary font sizes.
- **Keep spacing simple.** Use Tailwind's default spacing scale unless a later phase introduces a documented exception.
- **Dark mode uses a class strategy.** `ThemeProvider` applies or removes the `dark` class on `document.documentElement`; components should use Tailwind `dark:` variants and must not implement their own theme toggling infrastructure.
- **Do not invent component-level design systems before Phase 8.** Phase 8 ships the primitive UI library under `src/components/primitives/`; do not introduce parallel token files, UI libraries, or component kits.

---

## 8. File Naming Conventions

| Kind               | Convention                            | Example                                      |
| ------------------ | ------------------------------------- | -------------------------------------------- |
| React component    | `PascalCase.tsx`                      | `Button.tsx`, `CameraOverlay.tsx`            |
| Hook               | `useThing.ts`                         | `useTheme.ts`, `useReps.ts`                  |
| Service module     | `kebab-case.ts` or `camelCase.ts`     | `supabase-client.ts`, `analytics.ts`         |
| Platform adapter   | `camera-adapter.ts`, `tts-adapter.ts` | adapter suffix is conventional, not required |
| Store (Zustand)    | `useThingStore.ts`                    | `useWorkoutStore.ts`                         |
| Pure utility       | `camelCase.ts` or descriptive name    | `clamp.ts`, `formatDuration.ts`              |
| Domain type module | `kebab-case.ts`                       | `workout.ts`, `pose-landmark.ts`             |
| Test file          | `<source>.test.ts(x)` colocated       | `Button.test.tsx`, `clamp.test.ts`           |

Folder names are always lowercase. Files exporting a single React component use the component's `PascalCase` name.

---

## 9. Imports

- **Prefer aliases:** `import { Button } from '@components/Button'` over `'../../../components/Button'`.
- **Inside a single folder**, relative imports (`./helper`) are fine and often clearer.
- **Order of imports** (Prettier will not reorder these; do it manually or via a future plugin):
  1. Node built-ins / third-party libraries
  2. Aliased internal modules (`@components/...`, `@services/...`, …)
  3. Relative siblings (`./foo`, `../bar`)
  4. Styles / assets
- **Avoid circular dependencies.** If module A imports B and B imports A, extract the shared piece into a third module.
- **No `import * as` for our own code** — explicit named imports are easier to refactor.

---

## 10. Linting and Formatting

- **ESLint** runs over TypeScript, React, React Hooks, and JSX accessibility-friendly rules where reasonable at this stage. The flat config lives at `eslint.config.js`.
- **Prettier** formats TS, TSX, JSON, Markdown, and CSS. Config lives at `.prettierrc`; `.prettierignore` excludes `dist/`, `node_modules/`, `dev-dist/`, and lockfiles.
- **Husky** runs `format:check`, `lint`, and `typecheck` on pre-commit. Fix issues locally — do not commit with `--no-verify` unless the user explicitly asks.
- **`pnpm lint` must pass.** Disabling a rule per-line is occasionally acceptable but requires an inline comment explaining why.

---

## 11. Documentation Standards

- **Update docs when behavior changes.** If you change setup steps, scripts, folder structure, or architectural rules, update `docs/SETUP.md`, `docs/ARCHITECTURE.md`, this file, or `README.md` in the same commit.
- **Be honest.** Documentation must reflect what currently exists. Do not document a feature as live until it works on a phone.
- **No speculative API docs.** Write docs for code that exists, not code that will exist next phase.

---

## 12. No Fake Data / Product Claim Rules

These are hard rules. Code review will block any PR that violates them.

- **No fake users.** No `mockUser`, `placeholderUser`, `johnDoe@example.com` rendered as if a real user is signed in.
- **No fake workouts.** No hardcoded workout libraries, fake exercises, or pre-baked plans masquerading as the product.
- **No fake stats.** No fabricated calorie counts, rep totals, streak days, "weekly progress" numbers, or "form score" readouts when nothing is being scored.
- **No fake AI feedback.** Do not display "Great form!" or "Knees over toes!" cues unless they came from a real ML evaluation of a real movement.
- **No fake analytics.** No dashboards that show invented engagement, retention, or conversion numbers.
- **No placeholder claims.** Copy like "Trusted by 10,000 athletes", "AI-powered injury prevention", or "Coach-grade form analysis" stays out until those claims are demonstrably true.
- **Honest empty states.** When a feature is not yet implemented, say so plainly — or do not render UI for it at all.

The single allowed exception: **example values inside documentation** that are clearly illustrative (e.g. `192.168.1.42` in setup docs). Do not put fabricated runtime data into the running app.

---

## 13. Quick Reference

| If you want to…                   | Put it in…                                        |
| --------------------------------- | ------------------------------------------------- |
| Build a shared UI primitive       | `src/components/`                                 |
| Build a screen with a URL         | `src/pages/` (route wired in `src/router/`)       |
| Add or rename a route URL         | `src/router/routePaths.ts` (then `routes.tsx`)    |
| Navigate programmatically         | `useNavigation()` in `src/hooks/useNavigation.ts` |
| Wrap a browser API                | `src/platform/` (and only there)                  |
| Hit Supabase, Stripe, etc.        | `src/services/` (once those phases land)          |
| Compute a joint angle             | `src/ml/angles/`                                  |
| Count a rep                       | `src/ml/exercises/<exercise>.ts`                  |
| Run inference off the main thread | `src/workers/` (importing from `src/ml/pose/`)    |
| Share React state across screens  | `src/store/` (Zustand, Phase 29+)                 |
| Reuse domain types in 2+ places   | `src/types/`                                      |
| Add a translatable string         | `src/i18n/` (Phase 42+)                           |
| Add a theme token                 | `src/theme/` (Phase 5+)                           |
| Add a pure helper                 | `src/utils/`                                      |

When in doubt, re-read [`ARCHITECTURE.md`](./ARCHITECTURE.md) §3 (folder responsibilities) and §10 (how to add a new feature).
