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

## 7. Styling

- **Tailwind is the styling foundation.** Use Tailwind utilities and the Motionly tokens defined in `tailwind.config.ts` for product styling. Keep global CSS limited to Tailwind directives and app-wide browser defaults.
- **Use theme tokens instead of hardcoded colors.** Hex values belong in `tailwind.config.ts`, generated/public assets, or documentation that explicitly describes the tokens. Application code should use classes such as `bg-motionly-bg-light`, `dark:bg-motionly-bg-dark`, `text-motionly-neutral-500`, and `text-motionly-primary`.
- **Use the Phase 5 typography utilities.** Prefer `text-h1`, `text-h2`, `text-h3`, `text-body`, `text-label`, and `text-caption` over arbitrary font sizes.
- **Keep spacing simple.** Use Tailwind's default spacing scale unless a later phase introduces a documented exception.
- **Dark mode uses a class strategy.** `ThemeProvider` applies or removes the `dark` class on `document.documentElement`; components should use Tailwind `dark:` variants and must not implement their own theme toggling infrastructure.
- **Do not invent component-level design systems before Phase 8.** No component kits, UI libraries, parallel token files, or reusable primitives should be introduced before the component-primitives phase asks for them.

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
