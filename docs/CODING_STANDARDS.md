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
