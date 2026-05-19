# MOTIONLY — Master Development Plan (PWA Edition)

---

**Version:** 2.0.0
**Last Updated:** May 2026
**Status:** Active — MVP Build
**App Name:** Motionly
**Tagline:** Move Better.
**Framework:** Progressive Web App (Vite + React + TypeScript)
**Primary Targets:** Mobile Web (Android Chrome first), Desktop Web, iOS Safari (best-effort)
**Future Path:** Capacitor wrap for native app stores via cloud builds (no local Xcode/Android Studio needed)

---

## Why PWA Instead of React Native

The original plan called for React Native bare workflow + Android Studio + Xcode. That toolchain consumes 40–55 GB of disk, hangs mid-range MacBooks, and adds zero value to the core product promise.

The hard part of Motionly — real-time on-device pose estimation — has a first-class browser implementation that uses the **same MediaPipe BlazePose model with the same 33 keypoints** as the native SDK. Browsers also expose camera, voice synthesis, persistent storage, and installable app shells. So we can ship the entire MVP as a PWA, install it to the home screen on Android, and skip the heavy native toolchain entirely.

**Disk footprint:** Node.js + VS Code + Chrome ≈ 2–3 GB total (vs ~45 GB for the native path).

**Tradeoffs accepted:**
- iOS Safari has reduced background audio and notification support. Acceptable for a workout app the user is actively looking at.
- ~10–20% performance gap vs native on mid-range Android. Acceptable for MVP (still 20–30 FPS on Redmi-class devices).
- No app store presence on day one. Distribute via URL + "Add to Home Screen." Wrap with Capacitor + cloud builds when revenue justifies it.

---

## Table of Contents

1. [Product Overview](#product-overview)
2. [Core Product Identity](#core-product-identity)
3. [Product Principles](#product-principles)
4. [Target Users & Use Cases](#target-users--use-cases)
5. [MVP Definition](#mvp-definition)
6. [Detailed Phase-by-Phase Roadmap](#detailed-phase-by-phase-roadmap)
7. [Suggested Build Stages](#suggested-build-stages)
8. [Recommended Tech Stack & Architecture](#recommended-tech-stack--architecture)
9. [Monetization Integration Plan](#monetization-integration-plan)
10. [Future Features & Expansion Roadmap](#future-features--expansion-roadmap)
11. [Hard Truths, Risks & Mitigation Strategies](#hard-truths-risks--mitigation-strategies)

---

## Product Overview

Motionly is a privacy-first, camera-only AI personal fitness trainer that runs in the browser. It transforms any phone (and any modern laptop) into a real-time movement coach — no wearables, no gym equipment, no app store install required.

Using on-device pose estimation (MediaPipe BlazePose / Pose Landmarker, 33 keypoints) running in the browser via WebAssembly + WebGL, Motionly watches how users move, counts reps, calculates joint angles, scores form quality, flags repeated technique risk patterns, and delivers instant voice and visual coaching feedback in real time. The core experience requires only a phone, a small open space, and a browser.

Motionly is designed from day one for global reach: inclusive across diverse body types, clothing styles (including modest and loose-fitting), lighting environments, mid-range Android devices, and multiple languages. Privacy is non-negotiable — all video processing happens on-device in the browser, raw video never leaves the device, and the app works fully offline after first load.

The MVP focuses on 8–12 core bodyweight exercises, beginner-to-intermediate users, and home workout environments. The business model is freemium subscription with localized pricing, including an India-first emerging-market tier.

---

## Core Product Identity

| Attribute     | Value                                                                 |
|---------------|-----------------------------------------------------------------------|
| **App Name**  | Motionly                                                              |
| **Tagline**   | Move Better.                                                          |
| **Category**  | Health & Fitness / AI Personal Trainer                                |
| **Platform**  | Installable PWA (Android-first for emerging markets, iOS Safari, Desktop) |
| **Core Hook** | Real-time form correction via browser camera — no install, no hardware |
| **Differentiator** | Execution-quality AI coaching, not just workout content          |
| **Privacy Promise** | Video never leaves the device. Only movement metrics are saved. |

---

## Product Principles

1. **Trust over features.** If the AI is uncertain, it stays silent. Bad feedback destroys trust faster than no feedback.
2. **Speed of first value.** A user must complete their first coached rep within 3 minutes of opening the link.
3. **Correction, not criticism.** All feedback is instructional and encouraging, never shaming.
4. **One cue at a time.** Never overwhelm users with multiple simultaneous corrections.
5. **Privacy by default.** On-device inference in the browser, no raw video upload, minimal data collection.
6. **Global from day one.** Architecture, UI, pricing, and content must support multiple languages, body types, currencies, and cultural contexts without major rework.
7. **Performance on the median device.** Every feature must work smoothly on a mid-range Android from 2023–2024 running Chrome.
8. **Safety over hype.** No injury prediction, no medical claims. Use: "technique risk signals," "form consistency," "movement quality cues."
9. **Progress is the product.** Users must see their form improve over time. The metric is "correct reps," not calories burned.
10. **Build narrow, validate deeply.** 10 exercises done exceptionally well beats 100 exercises done poorly.
11. **Web-first, not web-only.** Architecture must allow a future Capacitor wrap without rewrite — keep all platform-specific code behind thin adapters.

---

## Target Users & Use Cases

### Primary Segments

| Segment | Core Need | Market Fit |
|---------|-----------|------------|
| **Beginners / Return-to-fitness** | Safe form, simple routines, confidence to start | Very strong — largest addressable group |
| **Home workout users** | No equipment, small space, self-correction | Very strong — phone-only ideal |
| **Busy professionals** | Short, efficient, accountable workouts | Strong — India metros, US, Europe, UAE |
| **Women training at home** | Privacy, safety, progressive programming | High — India, MENA, Southeast Asia |
| **Gym-goers without trainers** | Form checks for bodyweight lifts | Strong — especially for squats, lunges, push-ups |

### Secondary Segments (Post-MVP)

- Older adults (balance, mobility, low-impact strength)
- Corporate wellness users
- Fitness creators building AI-powered program content
- Physiotherapy-adjacent (with clinical partner validation)

### Use Case Scenarios

- A 28-year-old in Mumbai opening motionly.app on a Redmi phone at 6am, doing a home workout before work
- A 35-year-old woman in Dubai training privately at home, wearing loose clothing, on her tablet
- A 22-year-old college student in Bangalore doing bodyweight squats in a small dorm room
- A 40-year-old professional in Chicago doing 15-minute lunch workouts at home on a laptop or phone
- A 55-year-old in Germany rediscovering exercise after years of inactivity
- A 30-year-old in São Paulo following a fitness creator's program with AI form-check

---

## MVP Definition

### Must-Have MVP Features

| Feature | Description |
|---------|-------------|
| **Real-time pose estimation** | On-device via MediaPipe Tasks Vision (browser), 33 keypoints, 20–30 FPS on mid-range Android Chrome |
| **Camera calibration UX** | Silhouette guide, placement instructions, lighting check, visibility confirmation |
| **Rep counting** | Accurate rep detection for all 8–12 core exercises via state machines |
| **Joint angle calculation** | Knee, hip, shoulder, elbow angles computed per frame |
| **Form scoring** | Per-rep and per-set form quality score (0–100) |
| **Rule-based form correction** | 1–3 corrections per exercise, cued when confidence is high |
| **Real-time voice feedback** | Web Speech API + pre-recorded audio cues delivered during reps |
| **Visual skeleton overlay** | Landmark skeleton drawn over live camera preview via HTML Canvas |
| **Confidence system** | "Camera view unclear" state — no cue given if confidence is low |
| **Post-set summary** | Reps, form score, top issue, best rep highlight |
| **Basic adaptive programming** | Adjust reps, rest, difficulty based on form score trends |
| **Beginner workout plans** | Structured 4-week plan using the 10 core exercises |
| **Multilingual architecture** | English default; i18n system ready for expansion |
| **Privacy-first design** | On-device video in browser, no video upload, opt-in only for data sharing |
| **Freemium paywall** | Free tier (3 sessions/week) + paid tier (unlimited) |
| **Onboarding flow** | Goal, fitness level, limitations, camera tutorial |
| **Installable PWA** | Web manifest, service worker, offline support, "Add to Home Screen" prompt |

### MVP Exercise List (10 Core)

1. Bodyweight Squat
2. Push-up
3. Plank (hold)
4. Reverse Lunge
5. Glute Bridge
6. Hip Hinge / Good Morning
7. Wall Sit (hold)
8. Dead Bug
9. Bird Dog
10. Mountain Climber

### Out of Scope for MVP

- Barbell / heavy lifting
- Yoga pose library
- Running gait analysis
- AR avatar coach
- Social community
- Wearable integration
- Human coach marketplace
- Nutrition tracking
- Clinical rehab mode
- Native app store distribution (deferred to post-launch Capacitor wrap)

---

## Detailed Phase-by-Phase Roadmap

---

### STAGE A — PROJECT FOUNDATION & ENVIRONMENT SETUP

---

#### Phase 1 — Development Environment Setup

**Purpose:** Establish a minimal, fast, low-footprint development environment. No Android Studio. No Xcode. No emulators.

**Main Focus Areas:**
- Node.js LTS, package manager
- VS Code with web-focused extensions
- Modern Chrome / Edge for development
- Physical phone for real-device testing (over LAN)

**Key Tasks / Deliverables:**
- Install Node.js LTS (v20+) and pnpm (faster than npm/yarn)
- Install VS Code with extensions: ESLint, Prettier, Tailwind CSS IntelliSense, GitLens, Todo Tree, Vitest
- Install latest Chrome / Edge for DevTools (Lighthouse, Web Vitals, Performance profiler)
- Pin Node version in `.nvmrc`
- Set up `docs/SETUP.md` with step-by-step instructions
- Configure phone for real-device testing:
  - Connect phone and laptop to the same Wi-Fi
  - Use Vite's network URL (e.g. `http://192.168.1.x:5173`) to open the dev server on the phone's browser
  - For Chrome on Android: enable USB debugging and use `chrome://inspect` for full remote DevTools
- No emulators required. No platform SDKs required.

**Expected Outcome:** Any developer can clone the repo and run the app in the browser within 10 minutes by following `SETUP.md`.

**Success Criteria / Testing Notes:**
- Dev server runs in < 2 seconds (`pnpm dev`)
- App loads on phone browser via LAN URL with hot reload
- Total tooling disk footprint: < 3 GB

---

#### Phase 2 — PWA Project Initialization

**Purpose:** Scaffold the Motionly project as a Vite + React + TypeScript app with PWA support.

**Main Focus Areas:**
- Vite scaffolding
- PWA plugin configuration
- TypeScript strict mode
- Initial app shell

**Key Tasks / Deliverables:**
- Initialize project: `pnpm create vite@latest motionly -- --template react-ts`
- Install PWA support: `pnpm add -D vite-plugin-pwa workbox-window`
- Configure `vite.config.ts` with `VitePWA` plugin:
  - Manifest: name "Motionly", short_name "Motionly", theme_color `#0A0A0F`, background_color `#0A0A0F`
  - Icons: 192x192, 512x512, maskable
  - `display: "standalone"` (looks like an app when launched from home screen)
  - Workbox runtime caching: model files, audio, fonts cached for offline use
- Enable TypeScript strict mode in `tsconfig.json`
- Configure absolute imports via `vite-tsconfig-paths` and matching `paths` in `tsconfig.json`
- Verify the app loads, installs as PWA on Android Chrome ("Add to Home Screen" works), and shows offline page when network is killed

**Expected Outcome:** A clean, named, installable PWA running on phone browsers with hot reload.

**Success Criteria / Testing Notes:**
- Lighthouse PWA score ≥ 90 on first build
- App installable on Android Chrome (install icon appears in address bar)
- TypeScript compiles without errors

---

#### Phase 3 — Git Repository & Branching Strategy Setup

**Purpose:** Establish version control, branching conventions, and commit standards before any real code is written.

**Main Focus Areas:**
- Git initialization and remote setup
- Branch strategy
- Commit message conventions
- `.gitignore` configuration
- PR template

**Key Tasks / Deliverables:**
- Initialize GitHub repository: `motionly`
- Add comprehensive `.gitignore`: `node_modules/`, `dist/`, `.env`, `.env.local`, `coverage/`, `.vite/`
- Branch strategy:
  - `main` — production releases (auto-deploys to motionly.app)
  - `develop` — integration branch (auto-deploys to staging.motionly.app)
  - `feature/phase-XX-description` — feature branches
  - `fix/issue-description` — bug fixes
- Conventional Commits: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`
- Create `.github/PULL_REQUEST_TEMPLATE.md`
- Create `README.md` with project overview and setup link
- Protect `main` branch: require PR reviews, no direct push, CI must pass

**Expected Outcome:** A well-structured repository that supports clean collaboration and release history.

**Success Criteria / Testing Notes:**
- First meaningful commit follows Conventional Commits
- README renders cleanly on GitHub

---

#### Phase 4 — Project Folder Structure & Architecture Standards

**Purpose:** Define and implement the folder architecture, module boundaries, and code organization standards before building any features.

**Main Focus Areas:**
- Scalable folder structure for a PWA
- Separation of concerns (UI, logic, services, ML, state)
- Platform-adapter pattern (so future Capacitor wrap is trivial)
- Documentation standards

**Key Tasks / Deliverables:**
- Implement folder structure:
  ```
  src/
    assets/         # fonts, images, icons, sounds
    components/     # shared UI components
    pages/          # route-level components (React Router)
    router/         # React Router config + route guards
    hooks/          # custom React hooks
    store/          # Zustand stores
    services/       # API, analytics, subscriptions, storage
    platform/       # thin adapters for camera, TTS, storage, notifications
    ml/             # pose engine, exercise logic
      pose/         # MediaPipe wrapper, landmark processing
      exercises/    # per-exercise state machines
      angles/       # joint angle calculations
    i18n/           # translations and locale config
    theme/          # Tailwind config + design tokens
    utils/          # math helpers, formatters, constants
    types/          # TypeScript interfaces and types
    workers/        # Web Workers (pose inference, heavy compute)
  public/
    models/         # MediaPipe model files (cached by service worker)
    audio/cues/     # voice cue MP3s
    manifest.webmanifest
  docs/
  ```
- Configure TypeScript path aliases: `@components/`, `@ml/`, `@services/`, `@platform/`, etc.
- Create `docs/ARCHITECTURE.md` explaining each folder's purpose
- Create `docs/CODING_STANDARDS.md`: naming conventions, component patterns, hook patterns
- Set up ESLint + Prettier with strict React + TypeScript rules
- Set up Husky pre-commit hooks: lint + format + typecheck on commit
- **Platform adapter pattern:** All browser-only APIs (camera, TTS, storage, notifications) go through interfaces in `src/platform/`. Today they're implemented with web APIs; later they can be swapped to Capacitor native equivalents without touching feature code.

**Expected Outcome:** A professional, scalable project structure that prevents architectural drift and keeps the future native path trivial.

**Success Criteria / Testing Notes:**
- Path aliases resolve correctly
- Husky blocks malformed commits
- New developer can understand the structure from `ARCHITECTURE.md` alone

---

#### Phase 5 — Design System Foundation: Tokens & Theme

**Purpose:** Define Motionly's visual design language before writing a single UI component.

**Main Focus Areas:**
- Brand color palette
- Typography scale
- Spacing system
- Dark mode support
- Motion/animation constants

**Key Tasks / Deliverables:**
- Install Tailwind CSS: `pnpm add -D tailwindcss postcss autoprefixer @tailwindcss/forms`
- Define brand color palette in `tailwind.config.ts`:
  - Primary: Electric Blue `#2563EB`
  - Accent: Vibrant Green `#16A34A`
  - Warning: Amber `#D97706`
  - Danger: Red `#DC2626`
  - Neutral: Slate scale (`#0F172A` → `#F8FAFC`)
  - Background Dark: `#0A0A0F`
  - Background Light: `#FFFFFF`
- Typography: Use `Inter` (variable font) loaded via `@fontsource-variable/inter` (excellent multilingual support, Devanagari fallback via `Noto Sans Devanagari`)
- Define typography utility classes via Tailwind:
  - `text-h1` (32px Bold), `text-h2` (24px SemiBold), `text-h3` (20px SemiBold), `text-body` (16px), `text-caption` (12px), `text-label` (14px Medium)
- Spacing scale: Tailwind defaults (`4`, `8`, `12`, `16`, `20`, `24`, `32`, `40`, `48`, `64` map to 1, 2, 3, 4, 5, 6, 8, 10, 12, 16)
- Implement dark mode via Tailwind `dark:` variant + `class` strategy
- Implement `ThemeProvider` using React Context: `light` / `dark` / `system`
- Create `useTheme()` hook
- Create `src/theme/motion.ts` for animation durations and easing curves

**Expected Outcome:** A consistent visual language ready to be applied to every component. No hardcoded colors or font sizes anywhere outside Tailwind config.

**Success Criteria / Testing Notes:**
- Toggle between light and dark mode programmatically — all colors switch correctly
- Typography renders correctly across browsers
- No hardcoded hex values outside `tailwind.config.ts`

---

#### Phase 6 — Routing Architecture Setup

**Purpose:** Set up the routing structure for the app using React Router 6 before building any screens.

**Main Focus Areas:**
- Route hierarchy (auth, main, modal)
- Authentication route guards
- Deep linking via URLs (a free PWA benefit — every screen is shareable)
- Route-level code splitting

**Key Tasks / Deliverables:**
- Install: `react-router-dom`
- Define route hierarchy:
  - **Auth routes:** `/welcome`, `/onboarding`, `/login`, `/register`
  - **Main routes (protected):**
    - `/` — Dashboard
    - `/workouts` — Library
    - `/workouts/:id` — Workout Detail
    - `/workout/:id/setup` — Camera Setup
    - `/workout/:id/active` — Active Workout Session
    - `/workout/:id/summary` — Post-Workout Summary
    - `/progress` — Progress / History
    - `/profile` — Settings, Subscription, Privacy
  - **Modal routes** (overlays, not full screens): `/paywall`, `/permissions`
- Define TypeScript `RouteParams` types for all dynamic segments
- Create `<RequireAuth>` route guard component
- Use `React.lazy()` for route-level code splitting (keeps initial bundle < 200 KB gzipped)
- Build a `useNavigation()` wrapper for programmatic navigation
- Implement bottom tab bar for mobile width (Home, Workouts, Progress, Profile) using `<NavLink>`
- Test browser back button works correctly on Android Chrome

**Expected Outcome:** Complete routing skeleton. Every screen has a URL, even if it shows a placeholder.

**Success Criteria / Testing Notes:**
- Direct URL navigation works for every route (refresh stays on same screen — SPA fallback configured in deploy)
- Browser back button works correctly
- Code-splitting verified via Network panel (initial JS bundle < 200 KB)

---

### STAGE B — UI/UX DESIGN & COMPONENT LIBRARY

---

#### Phase 7 — Wireframing & User Flow Documentation

**Purpose:** Document the complete user experience as wireframes and user flow diagrams before building any real UI.

**Main Focus Areas:**
- All primary user journeys
- Onboarding flow
- Camera setup flow
- Active workout flow
- Post-workout summary flow

**Key Tasks / Deliverables:**
- Create wireframes (Figma or paper) for all screens:
  - Splash / Launch screen
  - Onboarding (5 screens): Welcome, Goal, Fitness Level, Limitations, Camera Tutorial
  - Home / Dashboard
  - Workout Library
  - Workout Detail
  - Camera Permission Request
  - Camera Setup & Silhouette Guide
  - Active Workout (camera preview + overlay + cues + rep counter)
  - Mid-workout form feedback
  - Post-set summary
  - Post-workout summary
  - Progress / History screen
  - Form score details
  - Profile / Settings
  - Subscription / Paywall screen
- Create user flow diagrams for:
  - First-time user (open URL → first coached rep): target < 3 minutes
  - Returning user (open PWA → workout session)
  - Subscription conversion flow
- Export all wireframes to `docs/wireframes/`
- Create `docs/USER_FLOWS.md` documenting the critical paths

**Expected Outcome:** A clear visual blueprint of every screen and interaction.

**Success Criteria / Testing Notes:**
- All major user journeys documented
- Product advisor or test user can walk through flow and confirm it makes sense before a line of UI code is written

---

#### Phase 8 — Core UI Component Library: Primitives

**Purpose:** Build the foundational UI primitives that all screens compose from.

**Main Focus Areas:**
- Button variants
- Text components
- Input components
- Container primitives
- Icon integration

**Key Tasks / Deliverables:**
- Build `Button` component (Tailwind + `clsx`):
  - Variants: `primary`, `secondary`, `ghost`, `danger`, `icon`
  - States: default, hover, pressed, disabled, loading
  - Full width option
  - Haptic feedback via `navigator.vibrate(10)` on press (supported on Android Chrome)
- Build `Input` component: label + error message + password visibility toggle
- Build `Card`, `Divider`, `Spacer`, `Row`, `Column` layout primitives
- Build `Badge`, `Tag`, `Chip` components
- Install icons: `lucide-react`
- Build `Icon` wrapper with size + color props
- Build `Avatar` component (initials fallback)
- Document props with TSDoc comments

**Expected Outcome:** A documented, reusable primitive component library.

**Success Criteria / Testing Notes:**
- Every primitive renders correctly in light and dark mode
- All interactive components have visible hover and pressed states
- All components fully typed

---

#### Phase 9 — Core UI Component Library: Feedback & Status Components

**Purpose:** Build feedback, progress, and status components — critical for the workout and coaching experience.

**Main Focus Areas:**
- Score displays
- Progress indicators
- Form feedback UI elements
- Toast / notification system
- Empty states

**Key Tasks / Deliverables:**
- `CircularProgress` (SVG + Framer Motion) for form score — animated, color-coded by range
- `LinearProgress` (Tailwind + transition) for rep / workout progress
- `ScoreBadge`: color-coded (green ≥80, amber 50–79, red <50)
- `FormCueCard`: icon + message for real-time corrections
- `RepCounter`: large animated number, scale pulse on each rep
- `WorkoutTimer`: countdown + elapsed time
- `Toast` system using a lightweight queue (react-hot-toast or in-house)
- `SkeletonLoader` placeholder for async content
- `EmptyState` with illustration slot + CTA
- `ErrorBoundary` wrapper for graceful error recovery
- `ConfidenceIndicator`: "camera view unclear" warning banner

**Expected Outcome:** All feedback, status, and data display components exist before screens are built.

**Success Criteria / Testing Notes:**
- `CircularProgress` animates smoothly from 0–100
- `FormCueCard` slides in/out smoothly
- `RepCounter` increment animation feels instant (< 100ms)

---

#### Phase 10 — Splash & App Launch Experience

**Purpose:** Implement the first visual impression of Motionly.

**Main Focus Areas:**
- HTML splash (shows before React loads)
- Animated brand screen (after JS loads)
- Initial data loading / state rehydration
- Service worker registration with update prompt

**Key Tasks / Deliverables:**
- HTML splash: inline `<style>` in `index.html` shows dark background + Motionly wordmark before React hydrates (avoids white flash)
- React-side animated brand screen:
  - Motionly logo scales 90% → 100% with fade
  - "Move Better." fades in 200ms delay
  - Transitions to Auth or Home after 1.8 seconds
- Detect first-launch (IndexedDB `hasOnboarded` flag) — show onboarding or home accordingly
- Auth state rehydration via Supabase session
- Service worker update prompt: if a new build is available, show a "Refresh to update" toast (don't force reload)

**Expected Outcome:** A polished, fast, brand-appropriate launch.

**Success Criteria / Testing Notes:**
- HTML splash shows for < 500ms before JS brand screen
- Total launch-to-home under 2 seconds on mid-range Android Chrome
- No white flash between HTML splash and React screen
- Service worker update prompt works (test by deploying new build while old PWA is open)

---

#### Phase 11 — Onboarding Flow: Screens 1–3 (Welcome, Goal, Fitness Level)

**Purpose:** Build the first half of the onboarding flow.

**Main Focus Areas:**
- Welcome screen design
- Goal selection
- Fitness level assessment
- Progress indicator across onboarding steps

**Key Tasks / Deliverables:**
- Build onboarding progress indicator (step dots)
- **Screen 1: Welcome** — hero illustration, headline "Your AI fitness coach lives in your camera.", CTA "Get Started", "Already have an account? Sign in" link
- **Screen 2: Goal Selection** — selectable cards (lose weight, build strength, mobility, start exercising safely, get fit at home), multi-select
- **Screen 3: Fitness Level** — Beginner / Intermediate / Active cards, single select
- Store selections to onboarding state (Zustand `useOnboardingStore`)
- Smooth slide transition between steps (Framer Motion `AnimatePresence`)

**Expected Outcome:** Users feel personally welcomed and understood within the first 60 seconds.

**Success Criteria / Testing Notes:**
- "Get Started" to Screen 3 takes < 20 seconds
- All selections persist if user navigates back
- UI looks correct on small (5.0") and large (6.7") screens

---

#### Phase 12 — Onboarding Flow: Screens 4–5 (Limitations & Camera Tutorial)

**Purpose:** Complete onboarding by collecting injury data and preparing the user for the camera setup.

**Main Focus Areas:**
- Movement limitations check-in
- Camera tutorial UX
- Camera permission priming
- Onboarding completion

**Key Tasks / Deliverables:**
- **Screen 4: Limitations** — multi-select chips (lower back, knees, shoulders, hips, ankles, wrists, none), optional free-text field, subtext explaining adaptation
- **Screen 5: Camera Tutorial** — 3-step animated walkthrough:
  1. "Place your phone 2–3 meters away"
  2. "Make sure your full body is visible"
  3. "Good lighting = better coaching"
- Pre-permission explainer screen ("Motionly needs your camera to analyze your movement. Video is processed on your device and never uploaded.") before triggering `navigator.mediaDevices.getUserMedia({ video: true })`
- Browser permission flow handled gracefully:
  - Denial → show settings redirect prompt with platform-specific instructions (Chrome on Android, Safari on iOS)
- Save completed onboarding profile to IndexedDB + Supabase (if connected)
- Mark `hasOnboarded = true`
- Navigate to Home

**Expected Outcome:** User understands camera setup before their first workout.

**Success Criteria / Testing Notes:**
- Camera permission prompt shows with clear justification
- Denial handled gracefully with retry option
- Tutorial animations smooth on mid-range Android

---

#### Phase 13 — Home / Dashboard Screen

**Purpose:** Build the main dashboard returning users see every session.

**Main Focus Areas:**
- Today's workout card
- Quick-start button
- Streak and progress summary
- Recent activity

**Key Tasks / Deliverables:**
- Header: "Good morning, [Name]" + current date
- **Today's Workout Card:** name, duration, exercise count, "Start Workout" primary CTA
- **Streak Display:** "5-day streak" badge
- **Quick Stats Row:** total workouts, avg form score this week, correct reps this week
- **Recent Activity:** 2–3 recent workout summary cards
- **Explore CTA:** link to Workout Library
- **Upgrade Banner** (free tier only): "Unlock unlimited workouts"
- Pull-to-refresh (`react-pull-to-refresh` or custom touch handler)
- Skeleton loading states for all data sections

**Expected Outcome:** A motivating, data-rich home screen.

**Success Criteria / Testing Notes:**
- All sections load within 1.5 seconds
- Streak display accurate
- Empty state renders well for brand new users

---

#### Phase 14 — Workout Library Screen

**Purpose:** Allow users to browse, filter, and select workouts and exercises.

**Main Focus Areas:**
- Workout listing
- Filter and search
- Exercise detail views
- Free vs paid content gating

**Key Tasks / Deliverables:**
- Tab switcher: "Workouts" | "Exercises"
- **Workouts Tab:** filter chips (All, Beginner, Intermediate, Quick ≤15min, Strength, Mobility), workout cards with thumbnail
- **Exercises Tab:** grid of exercise cards, muscle group + difficulty filter, debounced search
- **Exercise Detail Screen:** name, target muscles, difficulty, step-by-step instructions, "What the AI coaches" list, camera placement guide, "Add to workout" + "Try it now" CTAs
- Paywall intercept for locked content

**Expected Outcome:** Users can discover, understand, and launch any exercise in under 30 seconds.

**Success Criteria / Testing Notes:**
- Filter chips update list in < 200ms
- Search returns partial matches
- Locked content shows lock icon but does not hide the card

---

#### Phase 15 — Workout Detail & Pre-Workout Screen

**Purpose:** Show the full details of a workout before the user starts.

**Main Focus Areas:**
- Workout overview
- Exercise sequence preview
- Estimated time and difficulty
- Start workout flow

**Key Tasks / Deliverables:**
- Header: workout name + hero illustration
- Meta: duration, exercise count, difficulty, equipment (none for MVP)
- Exercise list with order, sets × reps, thumbnails
- "What you'll work" — muscle group chips
- Coach's note
- "Start Workout" → camera permission check → camera setup → active workout
- Limitation check: warn if workout conflicts with flagged limitations

**Expected Outcome:** Users start their workout feeling informed and prepared.

**Success Criteria / Testing Notes:**
- "Start Workout" navigates to camera setup without errors
- Limitation warnings show for relevant users

---

#### Phase 16 — Camera Permission & Setup Screen

**Purpose:** Guide the user through positioning their device correctly. The highest-friction moment in the UX.

**Main Focus Areas:**
- Browser camera permission handling
- Phone placement UI
- Lighting check
- Silhouette guide

**Key Tasks / Deliverables:**
- Use `navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } })`
- Render camera stream in `<video autoplay playsinline muted>` (the `playsinline` is critical for iOS Safari)
- **Silhouette Overlay:** SVG silhouette over the video, white outline → green when full-body landmarks detected
- **Placement Instructions Panel** (collapsible):
  - "Step back until your full body is visible"
  - "Place phone at hip height facing you"
  - Animated diagram showing correct placement
- **Lighting Check:** analyze average frame brightness (sample pixels via `<canvas>` `getImageData` every 500ms)
  - Too dark → "Try moving to a brighter area"
  - Too bright/backlit → "Move away from windows behind you"
- **Body Detection Confirmation:**
  - All 17 major landmarks detected → "You're all set!"
  - < 10 landmarks → "Make sure your full body is in view"
- "View is clear — Start!" CTA enabled only when detection passes
- Skip detection option for advanced users
- Voice instruction via Web Speech API: "Step back until your full body is visible."

**Expected Outcome:** 70%+ of users complete camera setup successfully on first attempt.

**Success Criteria / Testing Notes:**
- Silhouette turns green within 5 seconds when correctly positioned
- Lighting warnings appear within 1 second
- Setup screen does not freeze on mid-range Android Chrome
- Voice instruction plays correctly (test on iOS — requires user gesture to start audio)

---

### STAGE C — CORE ML ENGINE (BROWSER)

---

#### Phase 17 — MediaPipe Pose Landmarker Integration (Browser)

**Purpose:** Integrate MediaPipe Pose Landmarker via the Tasks Vision JavaScript SDK to deliver 33 keypoints in real time from the camera feed. Single implementation for all platforms — browser handles Android, iOS, desktop.

**Main Focus Areas:**
- MediaPipe Tasks Vision JS SDK
- Camera → canvas → inference pipeline
- WebGL backend acceleration
- Model file caching (offline support)

**Key Tasks / Deliverables:**
- Install: `pnpm add @mediapipe/tasks-vision`
- Download `pose_landmarker_lite.task` and `pose_landmarker_full.task` model files; serve from `/public/models/`
- Configure service worker to cache model files (so app works offline after first load)
- Create `src/ml/pose/PoseLandmarker.ts`:
  - Initialize `PoseLandmarker.createFromOptions()` with WebAssembly fileset
  - Configure: `numPoses: 1`, `minPoseDetectionConfidence: 0.5`, `minPosePresenceConfidence: 0.5`, `minTrackingConfidence: 0.5`, `runningMode: "VIDEO"`, `delegate: "GPU"` (uses WebGL on mobile, WebGPU on supporting desktops)
  - Auto-fallback to CPU delegate if GPU init fails
  - Method: `detectForVideo(videoElement, timestamp)` returns landmarks
- Wire camera stream → `requestAnimationFrame` loop → `detectForVideo()` → callback with landmarks
- Set camera resolution: 640×480 for inference, separate higher-res stream optional for display
- Emit landmarks via an event emitter / Zustand store consumed by ML pipeline
- **Performance:** run inference in a Web Worker via `OffscreenCanvas` to keep the main thread responsive (target 25–30 FPS on Redmi-class device, 60 FPS on desktop)

**Expected Outcome:** Live pose landmarks (33 points with visibility scores) flowing from the camera to the ML pipeline at 20–30 FPS on mid-range Android Chrome.

**Success Criteria / Testing Notes:**
- Log landmark array for a standing person — confirm all 33 landmarks present
- Frame rate ≥ 20 FPS on Redmi Note 12 / Chrome
- Frame rate ≥ 24 FPS on iPhone 12 / Safari (Safari has weaker GPU delegate — measure)
- App does not crash or leak memory after 10 minutes of continuous inference
- Works offline once model is cached

---

#### Phase 18 — Landmark Data Pipeline & Smoothing

**Purpose:** Raw MediaPipe landmark output is noisy. Implement a smoothing and normalization pipeline before any angle or rep logic runs.

**Main Focus Areas:**
- Temporal smoothing (Exponential Moving Average)
- Coordinate normalization
- Visibility/confidence thresholding
- TypeScript types

**Key Tasks / Deliverables:**
- Define `Landmark` type: `{ x: number, y: number, z: number, visibility: number }`
- Define `PoseLandmarks` type: array of 33 Landmark objects + named index constants (`LANDMARK.LEFT_KNEE = 25`, etc.)
- Implement `src/ml/pose/LandmarkSmoother.ts`:
  - Exponential Moving Average: `smoothed = alpha * raw + (1 - alpha) * previous`
  - Default alpha 0.5, tunable per exercise
  - Apply per axis per landmark
- Implement `src/ml/pose/ConfidenceFilter.ts`:
  - Per-landmark visibility threshold: `visibility ≥ 0.6` = visible
  - Whole-body visibility score: average of key landmark visibilities
  - `isBodyFullyVisible(landmarks)` → boolean
  - `getOccludedLandmarks(landmarks)` → string[]
- Implement `src/ml/pose/LandmarkNormalizer.ts`:
  - Normalize to torso scale (hip-to-shoulder distance = 1.0 unit)
  - Center on hip midpoint
- Wire smoother + filter + normalizer into single `processPoseFrame(rawLandmarks)` function

**Expected Outcome:** Stable, normalized, confidence-tagged landmark data flowing at 20–30 FPS, ready for joint angle and exercise logic.

**Success Criteria / Testing Notes:**
- Smoothed landmarks do not jitter visibly on skeleton overlay
- Confidence filter correctly flags occluded joints (test by hiding knee with hand)
- Normalized coordinates consistent across users of different heights
- Smoothing pipeline overhead < 2ms per frame

---

#### Phase 19 — Joint Angle Calculation Engine

**Purpose:** Compute biomechanically relevant joint angles from landmark positions.

**Main Focus Areas:**
- Vector-based angle calculation
- Key joint angle definitions for MVP exercises
- Bilateral symmetry tracking
- Angle history buffer

**Key Tasks / Deliverables:**
- Implement `src/ml/angles/AngleCalculator.ts`:
  - `calculateAngle(pointA, vertex, pointC)` → degrees (0–180) using dot product
  - `calculateAngle3D(...)` for depth-aware angles
- Define key angles in `src/ml/angles/JointAngles.ts`:
  - `kneeAngle(side)`, `hipAngle(side)`, `ankleAngle(side)`, `elbowAngle(side)`, `shoulderAngle(side)`
  - `trunkAngle()` — vertical deviation
  - `kneeValgus(side)` — knee lateral deviation
  - `hipSymmetry()` — left/right hip height difference
- Implement `AngleHistory` ring buffer: last 30 frames per joint
- `AngleSnapshot` type: `{ timestamp, leftKnee, rightKnee, leftHip, ... }`
- Wire into main pose processing pipeline: every frame produces an AngleSnapshot
- Validate: log AngleSnapshot for a bodyweight squat — confirm biomechanically reasonable

**Expected Outcome:** Every frame delivers a complete set of named joint angles, ready for exercise-specific state machines.

**Success Criteria / Testing Notes:**
- Knee angle at full squat depth ≈ 70–100°
- Knee valgus increases when knees intentionally cave
- Angle calculation overhead < 1ms per frame

---

#### Phase 20 — Squat Exercise State Machine & Rep Detection

**Purpose:** Implement the first complete exercise module — the template for all other exercises.

**Main Focus Areas:**
- State machine (Standing → Descending → Bottom → Ascending → Standing)
- Rep count with hysteresis
- Depth detection
- Rep quality classification

**Key Tasks / Deliverables:**
- Implement `src/ml/exercises/SquatEngine.ts`:
  - States: `STANDING`, `DESCENDING`, `BOTTOM`, `ASCENDING`, `COMPLETE`
  - Standing threshold: knee angle > 160°
  - Bottom threshold: knee angle < 110° (beginner), < 90° (intermediate)
  - Hysteresis: minimum 15-frame dwell at BOTTOM before rep counts
  - Reject half-reps
- `SquatRepResult` type: `{ repNumber, kneeAngle_bottom, trunkAngle_avg, kneeValgus_max, duration_ms, formScore }`
- Test: 10 squats → 10 counted, in 3 separate runs

**Expected Outcome:** Accurate rep counting for bodyweight squat. Foundation for all other exercises.

**Success Criteria / Testing Notes:**
- 10 squats → 10 counted (±0) in 3 test runs
- Half-reps not counted
- Works at slow (4s/rep), medium (2s/rep), fast (1s/rep) paces

---

#### Phase 21 — Form Assessment Engine: Squat Rule Set

**Purpose:** Rule-based form assessment for squats — produces real-time coaching cues and per-rep form score.

**Main Focus Areas:**
- Knee valgus detection
- Depth adequacy
- Trunk lean assessment
- Heel lift detection
- Asymmetry detection
- Cue prioritization

**Key Tasks / Deliverables:**
- Implement `src/ml/exercises/SquatFormRules.ts`:
  - **Rule 1: Knee Valgus** → cue: "Push your knees out"
  - **Rule 2: Insufficient Depth** → cue: "Try to squat a little deeper"
  - **Rule 3: Excessive Forward Lean** → cue: "Keep your chest more upright"
  - **Rule 4: Heel Rise** → cue: "Keep heels flat on the floor"
  - **Rule 5: Asymmetric Shift** → cue: "Keep weight centered on both feet"
  - **Rule 6: Too Fast** → cue: "Slow it down — control the movement"
- Cue priority: safety-critical first, technique second
- Implement `FormScorer.ts`: start at 100, deduct per violation
- Implement `CueThrottler.ts`: same cue blocked for 3 reps
- Confidence gate: rule fires only if relevant landmark visibility ≥ 0.65
- Return `FormResult`: `{ score, activeCues: string[], primaryCue: string | null }`

**Expected Outcome:** Form score + at most 1 primary cue per rep, only when AI is confident.

**Success Criteria / Testing Notes:**
- Intentional knee cave → "Push your knees out" fires consistently
- Perfect squat → score ≥ 90, no cues
- Poor camera angle → no false cues (confidence gate working)

---

#### Phase 22 — Push-Up Exercise Engine

**Purpose:** Complete push-up module (state machine + rep detection + form rules).

**Main Focus Areas:**
- Push-up state machine
- Elbow angle tracking
- Hip sag / pike detection

**Key Tasks / Deliverables:**
- Implement `PushUpEngine.ts`:
  - States: `HIGH_PLANK`, `DESCENDING`, `BOTTOM`, `ASCENDING`, `COMPLETE`
  - Elbow angle at top > 150°, at bottom < 90°
  - Camera placement: side view recommended
- Implement `PushUpFormRules.ts`:
  - Hip Sag → "Lift your hips — keep a straight line"
  - Hip Pike → "Lower your hips slightly"
  - Incomplete Range → "Lower your chest to the floor"
  - Neck Position → "Keep your neck neutral"
  - Elbow Flare → "Keep elbows closer to body"
- Side-view note in setup guide: "For push-ups, place your phone to your side"

**Expected Outcome:** Complete push-up exercise module.

**Success Criteria / Testing Notes:**
- 10 push-ups from side view → 10 counted
- Hip sag cue fires when deliberately sagging
- Score ≥ 85 for good-form push-ups

---

#### Phase 23 — Plank, Glute Bridge, Dead Bug Engines

**Purpose:** Implement three hold/simpler exercises.

**Key Tasks / Deliverables:**
- **PlankEngine.ts:** states `START`, `HOLDING`, `BREAK`, `COMPLETE`. Duration tracked. Form rules: hip sag, hip pike, shoulder alignment. Score based on duration + form consistency.
- **GluteBridgeEngine.ts:** states `LYING`, `ASCENDING`, `TOP`, `DESCENDING`, `COMPLETE`. Hip extension angle at top. Rules: full extension, tempo, symmetry.
- **DeadBugEngine.ts:** states `NEUTRAL`, `EXTENDING`, `EXTENDED`, `RETURNING`, `COMPLETE`. Tracks alternating arm-leg pairs. Rules: lower back stability (via hip angle), tempo.
- Shared interface: `processFrame(landmarks, angles)` → `ExerciseResult`

**Expected Outcome:** Three more complete exercise modules.

**Success Criteria / Testing Notes:**
- Plank timer accurate
- Plank hip sag cue fires correctly
- Glute bridge: 10 reps counted accurately
- Dead bug: alternating pairs counted correctly

---

#### Phase 24 — Reverse Lunge, Bird Dog, Mountain Climber, Hip Hinge Engines

**Purpose:** Complete the remaining MVP exercises.

**Key Tasks / Deliverables:**
- **ReverseLungeEngine.ts:** detects step-back from hip/knee angle changes. Left/right alternation. Form rules: front knee tracking, torso upright, step length.
- **BirdDogEngine.ts:** alternating arm-leg extension. Counts left+right pairs as 1 rep. Rules: hip rotation, back flatness.
- **MountainClimberEngine.ts:** high-pace knee drive detection. Each knee drive = 0.5 rep. Lower scrutiny (pace compromises precision).
- **HipHingeEngine.ts:** hip-dominant fold detection. Rules: hip-vs-knee initiation, back angle, head position. Key cue: "This is a hinge, not a squat — push hips back first."
- `ExerciseRegistry.ts`: maps exercise IDs to engine + rules + camera placement recommendation.

**Expected Outcome:** Full 10-exercise library operational.

**Success Criteria / Testing Notes:**
- Each exercise: 10-rep test → 10 counted (±1 for mountain climbers at pace)
- All major form rules fire when intentionally violated
- Hip hinge correctly distinguished from squat

---

#### Phase 25 — Real-Time Voice Feedback System

**Purpose:** Voice coaching system delivering spoken form cues without the user looking at the screen.

**Main Focus Areas:**
- Browser TTS via Web Speech API
- Pre-recorded MP3 fallback for low latency / non-English
- Cue queue management
- Multilingual foundation

**Key Tasks / Deliverables:**
- Two-tier audio strategy:
  - **Tier 1 (preferred):** Pre-recorded MP3 cues. Lowest latency, best quality, works offline, supports all browsers. Use Web Audio API for playback.
  - **Tier 2 (fallback):** `window.speechSynthesis` (Web Speech API). Useful for dynamic strings (rep counts, encouragements).
- Record ~30 form cues in English using a natural, encouraging voice. Plus encouragements ("Good job", "Keep going", "Last few reps") and rep milestones ("5 reps", "10 reps", "Halfway")
- Store at `/public/audio/cues/en/[exercise]_[cue_id].mp3` — cached by service worker
- Implement `src/services/VoiceCoach.ts`:
  - Priority queue: high-priority cues interrupt low-priority
  - Cooldown: same cue cannot fire within 8 seconds
  - Volume respects user setting
  - `speak(cueId, priority)`, `clearQueue()`
- **iOS quirk:** audio playback requires user gesture to initialize — start the AudioContext on first tap of the workout, document this constraint
- Create `src/i18n/cues/en.ts` mapping cue IDs to text strings (used for on-screen captions + TTS fallback)
- Wire `VoiceCoach` to exercise engines

**Expected Outcome:** Clear, timely, non-repetitive voice coaching during exercise. Multilingual-ready.

**Success Criteria / Testing Notes:**
- Cue plays within 300ms of detection
- Same cue does not repeat within 8 seconds
- High-priority cues interrupt low-priority
- Audio works in PWA standalone mode on Android
- Audio works in PWA standalone mode on iOS Safari (validate carefully — known fragile area)

---

#### Phase 26 — Skeleton Overlay & Visual Feedback Rendering

**Purpose:** Real-time skeleton overlay on the camera preview. Builds user trust by showing exactly what the AI sees.

**Main Focus Areas:**
- Landmark-to-screen coordinate mapping
- Skeleton line drawing
- Joint circle rendering
- Color-coded form feedback
- Performance on mid-range Android Chrome

**Key Tasks / Deliverables:**
- Use HTML `<canvas>` layered over the `<video>` element (absolute positioning, same dimensions)
- Implement `src/components/camera/SkeletonOverlay.tsx`:
  - Each animation frame: clear canvas, map normalized landmark coordinates (0.0–1.0) to canvas pixels, draw
  - Draw skeleton connections (17 major) as lines:
    - White by default
    - Amber for flagged joints
    - Red for critical violations
  - Draw landmark joint circles (5px radius):
    - Green: good form
    - Amber: warning
    - Red: risk
    - Grey: low confidence / occluded
  - Animate color transitions (50ms)
  - Only draw landmarks with `visibility ≥ 0.5`
- Implement `src/components/camera/FormOverlay.tsx`:
  - `FormCueCard` slides in from top, fades after 2.5s
  - `RepCounter` top-right, pulses on rep count
  - Form score ring bottom-left, updates after each rep
  - "Camera unclear" banner top when confidence low
- Performance target: drawing < 5ms per frame on mid-range Android
- Optional escalation: if 2D canvas underperforms on target devices, switch to WebGL via PixiJS for the skeleton layer (one-week swap-out via existing component interface)

**Expected Outcome:** Visually clear real-time skeleton overlay without degrading performance.

**Success Criteria / Testing Notes:**
- Skeleton renders at same frame rate as pose detection (no visual lag)
- Color changes correctly reflect violations
- No dropped frames on Redmi Note 12 / Chrome during 5-minute squat session

---

#### Phase 27 — Active Workout Screen (Full Assembly)

**Purpose:** Assemble all ML, voice, and visual components into the complete Active Workout screen.

**Main Focus Areas:**
- Screen layout during workout
- Camera + overlays layering
- Workout controls (pause, stop, next exercise)
- Exercise sequence management
- Real-time stats bar

**Key Tasks / Deliverables:**
- Screen layout (portrait + landscape support):
  - Full-screen camera (`<video>`) background
  - Skeleton overlay canvas
  - Form overlay UI (top layer)
  - Bottom HUD: exercise name, set X of Y, reps, rest timer
  - Top HUD: pause, stop, elapsed time
- Implement `WorkoutSession` Zustand store: current exercise, set, rep counts, scores, timer, start/pause/resume/stop, automatic rest timer, auto-advance
- Exercise transitions: rest countdown screen + "Next up" preview, camera stays active
- Pause screen: blurred camera + Resume / Skip / End buttons
- Voice cues for progression: "Starting set 2 of 3", "Rest for 30 seconds", "Next exercise: push-ups"
- Use `screen.orientation.lock()` where supported to keep portrait/landscape stable mid-session
- Wake lock: `navigator.wakeLock.request('screen')` so the screen doesn't sleep during a workout (critical for the experience; gracefully degrade if unsupported)
- Wire camera → pose → angles → exercise engine → form rules → voice coach + visual overlay

**Expected Outcome:** A fully functional workout session from start to finish, with real-time coaching throughout.

**Success Criteria / Testing Notes:**
- Complete 3-exercise session end-to-end without crashes
- All voice cues fire at correct moments
- Skeleton overlay stays smooth
- Pause/resume works
- Screen stays awake during full session

---

#### Phase 28 — Post-Workout Summary Screen

**Purpose:** Deliver a satisfying, data-rich summary that reinforces progress and motivates the next session.

**Main Focus Areas:**
- Session statistics
- Form score breakdown
- Top coaching insights
- Streak and progress update

**Key Tasks / Deliverables:**
- Subtle confetti animation + "Workout Complete!" headline
- **Session Stats Card:** total reps, correct reps (score ≥ 80), avg form score (animated ring), duration, best exercise
- **Per-Exercise Score Cards:** scrollable list with score + top cue
- **Top Insight:** "Your most common pattern this session: Knee valgus in squats."
- **Improvement Note:** "Your squat form score improved from 68 → 74 this week."
- **Next Session Preview**
- Streak update animation
- "Done" → navigates to Home

**Expected Outcome:** Users end every workout feeling accomplished and informed.

**Success Criteria / Testing Notes:**
- Form score animation completes in < 1 second
- All session data accurate
- Streak increments correctly

---

### STAGE D — STATE MANAGEMENT, DATA, & BACKEND

---

#### Phase 29 — Local State Management with Zustand

**Purpose:** Implement all client-side state via Zustand stores.

**Main Focus Areas:**
- Zustand store architecture
- Persistence
- Workout session state
- User profile state

**Key Tasks / Deliverables:**
- Install: `pnpm add zustand idb-keyval`
- Stores:
  - `useUserStore`: profile, goals, fitness level, limitations, language, onboarding status
  - `useWorkoutSessionStore`: active workout state (NOT persisted — fresh each session)
  - `usePoseStore`: ephemeral landmarks/angles
  - `useProgressStore`: history, trends, streaks
  - `useSettingsStore`: theme, coaching intensity, voice volume, notifications
  - `useSubscriptionStore`: plan, expiry, trial status
- Configure Zustand `persist` middleware with custom IndexedDB storage adapter (using `idb-keyval`) for user/progress/settings stores
- Configure `devtools` middleware for dev builds
- `StoreProvider` initializing all stores on app launch
- Unit tests for critical actions

**Expected Outcome:** All app state typed, tested, and persisted. Survives app restart.

**Success Criteria / Testing Notes:**
- App reopen → profile and progress restore correctly
- Active workout does NOT persist (fresh on each open)
- All store actions pass unit tests

---

#### Phase 30 — Local Database: IndexedDB via Dexie

**Purpose:** Implement a structured local database for workout history, session data, and progress. IndexedDB is the only browser-native option with sufficient capacity (gigabytes) and query power.

**Main Focus Areas:**
- Dexie schema design
- Session recording
- Progress queries
- Migration system

**Key Tasks / Deliverables:**
- Install: `pnpm add dexie`
- Design schema (`src/services/db/MotionlyDB.ts`):
  ```ts
  users: 'id, name, email, language, createdAt'
  workouts: 'id, name, difficulty, exerciseIds, duration'
  exercises: 'id, name, category, cameraSide'
  sessions: '++id, userId, workoutId, startedAt, completedAt, totalReps, avgFormScore'
  exerciseResults: '++id, sessionId, exerciseId, reps, correctReps, avgScore, topCue'
  repResults: '++id, exerciseResultId, repNumber, score, cuesGiven, kneeAngle, hipAngle'
  ```
- Implement `DatabaseService.ts`:
  - `saveSession()`, `getRecentSessions(limit)`, `getExerciseHistory(exerciseId)`, `getFormTrend(exerciseId, days)`, `getCurrentStreak()`
- Dexie's built-in version migration system: `db.version(N).stores({...}).upgrade(tx => ...)`
- Seed with 10 core exercises + 4-week beginner plan on first launch

**Expected Outcome:** All workout data stored locally and queryable. Progress graphs, streaks, history all powered by real data.

**Success Criteria / Testing Notes:**
- Complete workout → all tables populated
- `getFormTrend('squat', 30)` returns correct trend
- Database survives PWA reload + browser restart
- Schema migrations run without data loss

---

#### Phase 31 — Backend API Setup (Supabase)

**Purpose:** Set up a lightweight cloud backend for auth, cloud sync, subscription status, and future features.

**Main Focus Areas:**
- Supabase project creation
- Auth configuration
- Database schema (mirrors local)
- Row-level security
- Environment configuration

**Key Tasks / Deliverables:**
- Create Supabase projects: `motionly-prod`, `motionly-staging`
- Auth providers: email/password, Google OAuth, Apple Sign-In via Supabase's `signInWithOAuth`
- `.env` files: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (Vite exposes `VITE_*` to client — never put secrets here, anon key is safe by design when RLS is configured)
- Install: `pnpm add @supabase/supabase-js`
- Cloud schema (matches local + `user_id` foreign keys):
  - `profiles` (id, user_id, name, language, goals, fitness_level, subscription_tier)
  - `sessions` (id, user_id, workout_id, completed_at, avg_form_score, total_reps)
  - `exercise_results` (aggregated only — never raw rep data for privacy)
- Row Level Security: users can only access their own data
- Implement `src/services/api/SupabaseService.ts`:
  - `signUp()`, `signIn()`, `signInWithGoogle()`, `signInWithApple()`, `signOut()`
  - `syncSession()` — upload session summary only (never raw video / joint angles)
  - `getUserProfile()`, `updateUserProfile()`
- Offline-first: IndexedDB is source of truth; Supabase syncs in background via a queue (retry on reconnect using `navigator.onLine` + `online` event)

**Expected Outcome:** Cloud backend ready. App works fully offline; syncs when connected.

**Success Criteria / Testing Notes:**
- Sign up → profile created in Supabase
- Complete workout offline → syncs when connection restored
- RLS policies tested: user A cannot read user B's data

---

#### Phase 32 — Authentication Screens (Login, Register, Forgot Password)

**Purpose:** Build complete auth UI connected to Supabase.

**Main Focus Areas:**
- Login / Register / Forgot Password
- Social auth (Google, Apple)
- Auth state management
- Guest mode

**Key Tasks / Deliverables:**
- **Register:** name, email, password, password strength indicator, ToS/Privacy checkboxes, Google + Apple buttons, link to Login
- **Login:** email/password, forgot password link, social auth, link to Register
- **Forgot Password:** email → triggers Supabase reset email
- **Email verification screen** (if enabled)
- Handle auth errors: wrong password, unverified email, rate limiting
- Persist session via Supabase's auto-refresh
- **Guest mode:** allow using the app without account (no cloud sync). Prompt "Create account to save progress" after first workout.
- OAuth callbacks: redirect URLs configured in Supabase dashboard for both staging and production domains

**Expected Outcome:** Complete polished auth flow. Guest mode reduces signup friction.

**Success Criteria / Testing Notes:**
- Full signup → login → session → logout works
- Google OAuth works on Android Chrome and iOS Safari
- Apple Sign-In works on iOS
- Session persists across PWA restarts

---

### STAGE E — PERSONALIZATION & ADAPTIVE WORKOUTS

---

#### Phase 33 — Beginner 4-Week Workout Plan

**Purpose:** Create and implement the first structured workout plan.

**Main Focus Areas:**
- 4-week progressive plan design
- Weekly structure (3 sessions/week)
- Progressive overload logic
- Plan data schema

**Key Tasks / Deliverables:**
- Design 4-week beginner plan with certified fitness advisor review:
  - Week 1: 3 sessions, 3 exercises, 2 sets × 8 reps
  - Week 2: 3 sessions, 4 exercises, 2 sets × 10 reps
  - Week 3: 3 sessions, 5 exercises, 3 sets × 10 reps
  - Week 4: 3 sessions, 5 exercises, 3 sets × 12 reps
- JSON seed at `src/data/plans/beginner_4week.json`
- Implement `WorkoutPlanService.ts`:
  - `getTodaysWorkout(userId)`, `markWorkoutComplete()`, `getPlanProgress()`
- Handle missed days: plan does not skip — user does the missed workout next
- Handle plan completion: congrats + next-plan recommendation

**Expected Outcome:** Every beginner has a 12-session structured plan from day one.

**Success Criteria / Testing Notes:**
- Week 1 Day 1 → next session is Week 1 Day 2
- "Today's Workout" on Home always shows correct day
- Plan progress persists

---

#### Phase 34 — Adaptive Difficulty Engine

**Purpose:** Adjust workout difficulty in real time based on the user's form score trends.

**Main Focus Areas:**
- Form score trend analysis
- Difficulty adjustment rules
- Rep/set modification
- Exercise alternative suggestions

**Key Tasks / Deliverables:**
- Implement `src/ml/AdaptiveEngine.ts`:
  - After each session: analyze last 3 sessions per exercise
  - Decrease if avg score < 60 for last 2 sessions (reduce reps 20%)
  - Maintain if 60–80
  - Increase if > 85 for last 2 sessions (add 20% reps or +1 set)
  - Flag if < 40 single exercise → add "Focus exercise" next session
- Exercise variant system: easier and harder variants per exercise
- Limitation-aware substitution: knee issue → replace lunge; lower back issue → replace hinge
- Log decisions transparently: "We adjusted your squat reps because your form score was below 65 last session."

**Expected Outcome:** Workouts stay in the user's skill zone.

**Success Criteria / Testing Notes:**
- 3 low-score sessions → difficulty decreases
- 3 high-score sessions → difficulty increases
- Limitation substitution works for all flags

---

#### Phase 35 — Progress & History Screen

**Purpose:** Where users see their improvement over time — the key retention mechanic.

**Main Focus Areas:**
- Form score trend charts
- Session history list
- Per-exercise deep dive
- Streak calendar

**Key Tasks / Deliverables:**
- Install: `recharts` (React-friendly, ~30KB gzipped, no heavy native bridge)
- **Overview Tab:** 7-day form score line chart, total sessions, current + longest streak, "Most improved exercise" badge
- **Exercise Progress Tab:** exercise selector + line chart of avg form score, top cue history, insights ("You're 8% more consistent at squats than last month.")
- **Session History Tab:** chronological cards → Session Detail screen
- **Streak Calendar:** GitHub-style heatmap (build with CSS grid + Tailwind)

**Expected Outcome:** Users can see improvement. "Your squat form score improved from 58 to 76 over 3 weeks" is visible and motivating.

**Success Criteria / Testing Notes:**
- Charts render correctly with 0 data, 3 data points, and 30 data points
- All data matches what was recorded

---

### STAGE F — MONETIZATION & SUBSCRIPTION

---

#### Phase 36 — Web Subscription System (Stripe + Razorpay)

**Purpose:** Implement the complete subscription system for the web. Stripe globally, Razorpay for India (UPI / cards / wallets — far better conversion than international card flows).

**Main Focus Areas:**
- Stripe Checkout (global)
- Razorpay Checkout (India)
- Region detection
- Webhook → Supabase entitlement
- Customer portal

**Key Tasks / Deliverables:**
- Create Stripe account; set up products + prices:
  - `motionly_plus_monthly` — $9.99/month
  - `motionly_plus_annual` — $59.99/year (with 7-day free trial)
- Create Razorpay account; matching products:
  - `motionly_plus_monthly_in` — ₹299/month
  - `motionly_plus_annual_in` — ₹1,499/year
- Detect region from browser locale + IP geolocation (Supabase Edge Function calling a free geo API) → choose Stripe or Razorpay
- Use Stripe Checkout (hosted page — saves PCI compliance burden); Razorpay Checkout modal
- Implement Supabase Edge Functions:
  - `create-checkout-session` (Stripe)
  - `create-razorpay-order`
  - `stripe-webhook` and `razorpay-webhook` → update `subscriptions` table in Supabase on payment events
- Implement `src/services/SubscriptionService.ts`:
  - `getOfferings()` — return locale-aware pricing
  - `purchase(planId)` — open checkout
  - `checkEntitlement('pro_access')` → boolean (reads from Supabase profile)
  - `openCustomerPortal()` — Stripe billing portal for cancel/update
- `useSubscription()` hook
- Wire entitlement checks to all gated content
- **Why not RevenueCat:** RevenueCat is built for native IAP. On the web, Stripe + Razorpay direct is simpler, cheaper (no extra cut), and avoids platform IAP fees entirely (~30% saved). When we wrap with Capacitor later, we'll add RevenueCat for native IAP at that point.

**Expected Outcome:** Working subscription system with Stripe (global) + Razorpay (India), webhook-driven entitlement updates, customer portal for self-service.

**Success Criteria / Testing Notes:**
- Test purchase on both providers completes successfully (Stripe test card, Razorpay test mode)
- Entitlement check gates content correctly
- Webhook delivers events to Supabase reliably (verify with Stripe CLI / Razorpay test events)
- Cancel via customer portal works

---

#### Phase 37 — Paywall Screen & Upgrade Flow

**Purpose:** Build a compelling, conversion-optimized paywall.

**Key Tasks / Deliverables:**
- **Paywall layout:**
  - Header: "Unlock Motionly Pro" with gradient
  - Benefits list:
    - Unlimited workouts every week
    - Full real-time form correction on all exercises
    - Adaptive programming that learns your form
    - Detailed progress analytics
    - New workouts added regularly
  - Pricing toggle: Monthly | Annual (annual shows "Save 50%")
  - Monthly: `$9.99/month` (or `₹299/month` for India)
  - Annual: `$59.99/year` with "= $5.00/month" breakdown (or `₹1,499/year`)
  - "Start 7-Day Free Trial" for annual
  - "Cancel anytime. No commitment."
  - ToS + Privacy links
  - "Restore Subscription" link (handles edge case where user signed in on different device)
- Show paywall at: weekly session limit reached, locked content tap, upgrade button
- A/B test: benefits-first vs social-proof-first (Phase 2)

**Expected Outcome:** Clear, trust-building paywall that converts free → paid.

**Success Criteria / Testing Notes:**
- Annual plan shows "Save 50%" correctly
- Purchase completes in < 4 taps from paywall open
- Dismiss is easy (X button)
- Localized currency shows for Indian users (₹) via Razorpay path

---

#### Phase 38 — Free Tier Enforcement & Usage Limits

**Purpose:** Implement free tier logic that demonstrates value while leaving room for Pro upgrade.

**Key Tasks / Deliverables:**
- Track weekly session count in `useSubscriptionStore`
- Weekly reset: Monday 00:00 in user's local timezone
- Free tier limits:
  - 3 sessions / week
  - 5 exercises max / session
  - Core 5 exercises unlocked (squat, push-up, plank, glute bridge, mountain climber)
  - Advanced 5 locked (hip hinge, lunge, dead bug, bird dog, wall sit)
  - Progress history: last 7 days only
  - Adaptive planning: disabled
- Show "2 free sessions remaining this week" on dashboard
- 4th session attempt → paywall (not hard block — explain limit)
- Lock indicators: Pro badge on locked exercises

**Expected Outcome:** Free tier delivers real value but leaves clear room for Pro.

**Success Criteria / Testing Notes:**
- 3rd free session completes normally
- 4th attempt → paywall
- Weekly counter resets on Monday
- Free user cannot access advanced exercises

---

### STAGE G — PRIVACY, PERFORMANCE & LOCALIZATION

---

#### Phase 39 — Privacy-First Architecture Audit

**Purpose:** Review and implement privacy controls — Motionly should never process or store data it doesn't need.

**Key Tasks / Deliverables:**
- **On-device processing confirmation:**
  - Audit all pose paths — confirm zero video frames sent anywhere
  - Audit Supabase payloads — only aggregate metrics, never raw coordinates
  - Use Chrome DevTools Network tab during dev to confirm no video/pose in payloads
- **Consent system:**
  - Explicit consent: account creation, push notifications, optional analytics, optional model improvement
  - Privacy policy in-app (not just external link)
  - "What data does Motionly collect?" explainer screen in Settings
- **Data minimization:**
  - Do not store raw `repResults` with joint angles beyond current session unless user opts in
  - Cloud stores only session-level summaries
- **Deletion flow:**
  - "Delete my account" → deletes all Supabase data + IndexedDB + analytics ID
  - Response within 30 days for manual requests
- **Compliance:**
  - `docs/PRIVACY_COMPLIANCE.md` covering GDPR Art. 5/13/17, DPDP Rules 2025, CCPA
  - Cookie banner (only if we use any non-essential cookies; PostHog can be configured cookie-free)
- **Biometric data:** Pose landmarks may be considered biometric-adjacent under GDPR Art. 9. Treat as health data requiring explicit consent. Note for legal review.

**Expected Outcome:** Motionly is genuinely privacy-first, not just labeled.

**Success Criteria / Testing Notes:**
- Network inspector shows zero pose data in outbound requests
- Delete account removes all data from Supabase (verify via dashboard)
- Privacy policy readable, accurate, accessible in-app

---

#### Phase 40 — Performance Optimization: Mid-Range Android Chrome

**Purpose:** Ensure Motionly runs smoothly on the median global Android device — Redmi-class, Chrome browser.

**Main Focus Areas:**
- Camera pipeline optimization
- Pose inference frame rate
- Memory management
- Battery usage
- Initial page load

**Key Tasks / Deliverables:**
- Target device: Redmi Note 12 (Snapdragon 685, 4GB, Chrome on Android 13) as performance floor
- **Camera resolution:** 640×480 for inference; user-toggleable 480×360 for battery saver
- **Adaptive frame rate:**
  - Full inference (target 25–30 FPS) during active movement
  - Reduced (10 FPS) during rest timer and idle
  - Skip frames if `requestVideoFrameCallback` reports lag
- **MediaPipe model selection:**
  - `LITE` model default
  - `FULL` model for devices with WebGPU available
  - Detect via `navigator.gpu` and benchmark on first launch; store preference
- **Memory:** circular landmark buffer (last 30 frames), no unbounded history. Profile via Chrome DevTools Memory tab: target < 200 MB heap during session.
- **Battery:** reduce inference rate during rest; release wake lock when paused; release camera tracks when navigating away (`stream.getTracks().forEach(t => t.stop())`). Target: 20-minute session uses < 12% battery on Redmi-class.
- **Initial load:**
  - Route-level code splitting (already from Phase 6)
  - Lazy load MediaPipe SDK only when entering Camera Setup (saves ~1MB on initial bundle)
  - Lighthouse mobile target: Performance ≥ 90, PWA ≥ 95, Best Practices ≥ 95, Accessibility ≥ 95
  - Target: First Contentful Paint < 1.5s on simulated Slow 4G
- Profile with Chrome DevTools Performance panel + Lighthouse mobile audits

**Expected Outcome:** Smooth 20+ FPS inference, < 300ms feedback latency, no thermal throttling during 20-minute session on Redmi Note 12.

**Success Criteria / Testing Notes:**
- 15-minute squat session: no overheating notification
- FPS ≥ 20 throughout (Stats.js overlay in dev)
- Memory stable (no linear growth — leak test)
- App interactive in < 2s from cold load on simulated Slow 4G

---

#### Phase 41 — Performance Optimization: iOS Safari

**Purpose:** Optimize iOS Safari path. iPhone 12+ baseline.

**Main Focus Areas:**
- Safari-specific quirks
- WebGL backend on iOS
- Audio context initialization
- PWA behavior in standalone mode

**Key Tasks / Deliverables:**
- Validate WebGL delegate works on iOS Safari (Safari has weaker GPU acceleration than Chrome — measure FPS gap)
- Use MediaPipe `LITE` on iPhone 11–12, `FULL` on iPhone 14+
- Handle iOS Safari audio: AudioContext must be created on user gesture; document and handle in workout start flow
- PWA standalone mode considerations:
  - No URL bar — provide in-app back button on every screen
  - No system back gesture override needed (Safari handles)
- Background behavior: when PWA goes to background, pause workout (visibility API: `document.visibilityState`)
- Test on real iPhone 12 — iOS Simulator does NOT have camera access, so physical device testing is required
- Target: 20 FPS on iPhone 12 Safari, 25+ on iPhone 14+

**Expected Outcome:** Smooth, energy-efficient iOS Safari experience.

**Success Criteria / Testing Notes:**
- 20-minute session on iPhone 12: no thermal warning
- No memory leaks (Safari Web Inspector → Timelines)
- Audio cues fire correctly after user gesture initialization

---

#### Phase 42 — Internationalization (i18n) Architecture

**Purpose:** Multilingual architecture that makes adding new languages a content task, not a code task.

**Key Tasks / Deliverables:**
- Install: `pnpm add react-i18next i18next i18next-browser-languagedetector`
- Translation structure:
  ```
  src/i18n/
    locales/
      en/
        common.json
        onboarding.json
        workout.json
        coaching.json
        progress.json
        settings.json
    cues/
      en.ts             # cue ID → audio file mapping
    index.ts
  ```
- Configure i18next:
  - Fallback: `en`
  - Detection: device locale → user preference → `en`
  - Namespace lazy loading
- Use `useTranslation()` hook throughout components
- Extract all hardcoded English strings to `en/`
- Locale-aware date/number formatting via native `Intl.*` APIs (zero dependencies)
- RTL support: `dir="rtl"` on `<html>` toggled by language (Arabic-ready)
- Language picker in Settings

**Expected Outcome:** All UI text from translation files. Adding Hindi is content-only.

**Success Criteria / Testing Notes:**
- Every visible string sourced from translations (grep for hardcoded strings)
- Switching language updates UI immediately without reload
- Date formatting correct for en-US, en-IN, de-DE
- Currency correct: ₹ for `hi`

---

#### Phase 43 — Hindi / Hinglish Language Pack

**Purpose:** First non-English language. Highest priority for India market.

**Key Tasks / Deliverables:**
- Translate all `en/` JSON to `hi/` with native speaker review
- Use natural Hinglish for coaching cues ("Apne ghutne bahar rakho" mixed with English fitness terms — what real Indian trainers say)
- Record Hindi/Hinglish voice cue MP3s (~30 cues) with natural Indian voice, store at `/public/audio/cues/hi/`
- Add Devanagari font fallback (`Noto Sans Devanagari`) — already loaded in Phase 5
- Test on Hindi-locale Android Chrome
- Add `hi` to language picker
- Auto-detect Hindi/Indian English locale → offer Hindi as first-run suggestion

**Expected Outcome:** Complete Hindi/Hinglish experience for Indian users.

**Success Criteria / Testing Notes:**
- Full onboarding → post-workout in Hindi without broken strings
- Voice cues play in Hindi when selected
- Devanagari renders cleanly
- Native Hindi speaker can navigate without the English version

---

### STAGE H — NOTIFICATIONS, SETTINGS & POLISH

---

#### Phase 44 — Notifications: Web Push + Email

**Purpose:** Smart, non-intrusive notifications. Acknowledging web push limitations.

**Main Focus Areas:**
- Web Push API for Android Chrome and desktop
- Email reminders (universal, works on iOS too)
- Scheduled in-app reminders for installed PWAs
- Preferences

**Key Tasks / Deliverables:**
- **Channel strategy:**
  - **Android Chrome + Desktop:** Web Push API (push notifications work even when PWA is closed). Use Supabase Edge Function as push sender + `web-push` library + VAPID keys.
  - **iOS 16.4+ installed PWAs:** Web Push works ONLY for PWAs installed to home screen. Not in regular Safari tabs. Document this limitation.
  - **iOS regular Safari + fallback for all:** Email reminders via Supabase + Resend (transactional email service).
- Notification types:
  - **Daily reminder:** user-configured time
  - **Streak saver:** if no workout by 8pm on active day
  - **Weekly summary:** Sunday evening
  - **Plan milestone:** completing Week 1
- Granular preferences in Settings: per-type toggles, time picker, "All off" one-tap
- Permission request: clear justification screen BEFORE the browser permission prompt
- Smart throttle: don't send streak saver if already worked out today
- Supabase scheduled triggers (pg_cron) for daily push job

**Expected Outcome:** Timely, relevant reminders without notification fatigue. iOS users still get reminders via email.

**Success Criteria / Testing Notes:**
- Scheduled push fires on Android Chrome (test with time 2 minutes in future)
- Streak saver does not fire if workout completed that day
- Email fallback fires for iOS users without installed PWA
- Opt-out in Settings stops everything immediately

---

#### Phase 45 — Settings Screen

**Purpose:** Complete Settings covering preferences, account, subscription, legal.

**Key Tasks / Deliverables:**
- **Profile Section:** name, email, edit
- **Workout Preferences:** coaching intensity (Gentle/Standard/Strict), voice on/off, voice volume slider, preferred camera side, units (cm/kg vs inches/lbs)
- **Plan & Goals:** view/edit onboarding answers
- **Notifications:** type toggles + time picker
- **Appearance:** Light / Dark / System
- **Language:** picker
- **Subscription:** current plan, "Upgrade to Pro" or "Manage Subscription" (opens Stripe portal / Razorpay portal)
- **Privacy & Data:** "What data we collect" explainer, Privacy Policy, ToS, "Opt in to help improve Motionly" toggle, "Delete my account" (confirmation dialog → cascade delete)
- **About:** app version, "Contact Support" email link, "Rate Motionly" prompts native install/review
- **Sign Out** button

**Expected Outcome:** Full user control. Settings complete for store submission readiness.

**Success Criteria / Testing Notes:**
- All toggles persist after reload
- Delete account removes all data (verify Supabase + IndexedDB)
- Language switch updates UI immediately
- Customer portal link opens correctly

---

#### Phase 46 — Dark Mode Implementation

**Purpose:** Complete dark mode via Tailwind `dark:` variants.

**Key Tasks / Deliverables:**
- Implement system theme detection via `prefers-color-scheme` media query
- Wire to ThemeProvider: `system` follows device, `light`/`dark` overrides
- Persist preference to settings store
- Add `dark` class to `<html>` based on resolved theme
- Audit components for hardcoded colors → replace with Tailwind dark variants
- Camera screens: always dark (camera preview inherently dark)
- Status bar / theme-color meta tag matches mode
- Test every screen in both modes

**Expected Outcome:** Complete dark mode that looks intentional.

**Success Criteria / Testing Notes:**
- All screens correct in dark mode (no white boxes, no invisible text)
- System theme change → app theme changes immediately
- Camera screens always dark regardless of theme

---

#### Phase 47 — Accessibility Implementation

**Purpose:** Make Motionly usable for people with visual, motor, and cognitive differences.

**Key Tasks / Deliverables:**
- Add `aria-label`, `aria-describedby`, semantic HTML throughout
- Test with screen readers: VoiceOver on iOS, TalkBack on Android, NVDA on desktop
- Respect `prefers-reduced-motion` — disable animations when set
- Color contrast: all text passes WCAG AA (4.5:1 normal, 3:1 large)
- Touch targets ≥ 44×44pt
- Dynamic font scaling: layout doesn't break at 1.5× zoom (browser zoom is universal on web)
- Focus management: modal screens trap focus correctly (use `focus-trap-react`)
- Keyboard navigation: tab order makes sense; all interactive elements reachable

**Expected Outcome:** Motionly meets WCAG AA. Usable with assistive tech.

**Success Criteria / Testing Notes:**
- TalkBack/VoiceOver user can navigate onboarding without visual reference
- All buttons pass 44pt minimum
- All color combinations pass contrast checker (axe DevTools)
- Browser zoom to 200% does not break any screen

---

#### Phase 48 — Animations & Micro-interactions

**Purpose:** Motion design that makes Motionly feel premium.

**Key Tasks / Deliverables:**
- Install: `pnpm add framer-motion`
- Use Framer Motion for:
  - Route transitions via `AnimatePresence`
  - Component entry/exit (FormCueCard slide, RepCounter pulse)
  - Form score ring fill animation (1s smooth)
  - Streak badge bounce-in
  - Empty state illustration breathing
- Use CSS transitions for cheap effects (hover, active states)
- Button press: scale 0.95 + `navigator.vibrate(10)` on supported devices
- Skeleton overlay: smooth landmark interpolation between frames (already in Phase 26)
- All animations respect `prefers-reduced-motion`: instant state changes with no animation

**Expected Outcome:** App feels smooth and premium.

**Success Criteria / Testing Notes:**
- Animations complete in < 300ms
- ReduceMotion mode shows instant state changes
- No jank during workout session (animations don't compete with pose inference for main thread — pose runs in Worker)

---

### STAGE I — TESTING, QA & BETA

---

#### Phase 49 — Unit Testing Framework Setup

**Purpose:** Test infrastructure + unit tests for all core logic.

**Key Tasks / Deliverables:**
- Install: `pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom`
- Configure Vitest with TypeScript + jsdom environment
- Unit tests for:
  - `AngleCalculator.ts` — known angles with geometric inputs
  - `LandmarkSmoother.ts` — EMA convergence
  - `ConfidenceFilter.ts` — low-visibility exclusion
  - `SquatEngine.ts` — rep count, state transitions
  - `SquatFormRules.ts` — each rule at correct threshold
  - `FormScorer.ts` — score deductions
  - `CueThrottler.ts` — cooldown enforcement
  - `AdaptiveEngine.ts` — difficulty adjustments
  - All Zustand stores — actions and transitions
- Target: ≥ 80% coverage on `src/ml/`
- Integrate in GitHub Actions CI

**Expected Outcome:** Core logic tested and regression-protected.

**Success Criteria / Testing Notes:**
- `pnpm test` passes all tests in < 30 seconds
- Coverage ≥ 80% on `src/ml/`
- All 10 exercise engines have rep-count accuracy tests

---

#### Phase 50 — Integration Testing & E2E

**Purpose:** Test complete user flows end-to-end.

**Key Tasks / Deliverables:**
- Install Playwright: `pnpm create playwright`
- E2E tests for:
  - Onboarding flow (no camera required)
  - Login → workout selection → camera setup mock → summary
  - Free user hits limit → paywall shown
  - Subscribe flow with Stripe test mode
- Mock pose data via fixtures (pre-recorded landmark streams as JSON) — feed directly into ML pipeline bypassing camera
- Create `src/tests/fixtures/` with recorded landmark sequences per exercise
- Test mobile viewports (Pixel 5, iPhone 12 emulation)
- Test offline scenario: kill network → session saves to IndexedDB → sync queued

**Expected Outcome:** Major flows regression-protected.

**Success Criteria / Testing Notes:**
- All Playwright tests pass in CI
- Mock pose data produces expected rep counts
- Offline → online sync works correctly

---

#### Phase 51 — Device & Browser Compatibility Matrix

**Purpose:** Test across a representative matrix of real devices.

**Key Tasks / Deliverables:**
- Test device + browser matrix:
  - **Android:** Redmi Note 12 / Chrome (primary floor), Samsung A54 / Chrome, OnePlus Nord 3 / Chrome, Samsung S23 / Chrome, Galaxy S23 / Samsung Internet
  - **iOS:** iPhone 12 / Safari, iPhone 14 / Safari, iPad Air / Safari
  - **Desktop:** MacBook (Chrome, Safari, Firefox), Windows (Chrome, Edge)
- Checklist per device:
  - [ ] PWA installs ("Add to Home Screen" works)
  - [ ] Camera permission flow works
  - [ ] Pose detection runs ≥ 20 FPS
  - [ ] Skeleton overlay renders correctly
  - [ ] Voice cues play
  - [ ] 10-minute session without crash
  - [ ] All screens render correctly
  - [ ] Dark mode correct
- Use BrowserStack for devices not physically available
- Document findings in `docs/DEVICE_TESTING_MATRIX.md`

**Expected Outcome:** Confidence Motionly works on the devices your users will actually own.

**Success Criteria / Testing Notes:**
- All tier-1 devices pass all checklist items
- No critical bugs on tier-2
- Documented known issues with workarounds for tier-3

---

#### Phase 52 — Diverse User Testing: Body Types, Clothing, Lighting

**Purpose:** Test pose detection accuracy across the diversity of real users — the most critical quality gate before launch.

**Key Tasks / Deliverables:**
- Recruit 15–25 test users covering:
  - **Body types:** petite, average, tall, heavy-set, older adult
  - **Clothing:** tight athletic, loose t-shirt + shorts, modest full-length, dark, light
  - **Lighting:** bright natural, dim artificial, mixed, backlit
  - **Backgrounds:** plain wall, cluttered, patterned
  - **Skin tones:** wide range (MediaPipe has known performance variations — document and mitigate)
- Protocol per user: 10 squats, 10 push-ups, 30s plank — record rep accuracy, top cue, false-positive count
- Calculate false-positive rate by clothing/lighting category
- Tune confidence thresholds for worst-performing combinations
- Target: < 10% false-positive form cues per category
- Document in `docs/DIVERSITY_TEST_RESULTS.md`

**Expected Outcome:** Quantified understanding of where AI works well and where it struggles. Confidence thresholds tuned to real-world diversity.

**Success Criteria / Testing Notes:**
- False-positive rate < 10% across all clothing categories
- Rep accuracy ≥ 90% across all body type categories
- No systematic failure for any skin tone (flag if found — requires immediate model upgrade)

---

#### Phase 53 — Crash Analytics & Error Monitoring

**Purpose:** Production monitoring so crashes are immediately visible.

**Key Tasks / Deliverables:**
- Install: `pnpm add @sentry/react`
- Configure Sentry:
  - Environments: dev, staging, production
  - Source map upload via Vite plugin
  - Session replay: disabled by default (privacy)
  - Custom tags: device, browser, app version, pose model
- Implement `src/services/analytics/AnalyticsService.ts`:
  - Track key events (no PII):
    - `onboarding_completed`
    - `first_workout_started`
    - `workout_completed` (+ avg score, exercise count, duration)
    - `paywall_shown`, `paywall_dismissed`, `subscription_started`
    - `form_cue_fired` (+ cue type, exercise)
    - `camera_setup_failed` (+ reason)
    - `pose_detection_error`
- Install PostHog for product analytics (privacy-respecting, can disable cookies)
- Funnel: install → onboarding → first workout → subscription

**Expected Outcome:** Production issues caught immediately.

**Success Criteria / Testing Notes:**
- Forced crash → Sentry report within 30 seconds
- All events fire correctly (verify in PostHog debug mode)
- No PII in any event payload

---

#### Phase 54 — Closed Beta (Invite-Only URL)

**Purpose:** First external beta. No app store, no waiting period — just a private URL.

**Main Focus Areas:**
- Staging deployment
- Beta URL distribution
- Feedback collection
- Crash monitoring

**Key Tasks / Deliverables:**
- Deploy to `beta.motionly.app` from `develop` branch via Vercel / Netlify / Cloudflare Pages (auto-deploy on push)
- Access control: Supabase email allow-list OR an unguessable URL token (`/?invite=abc123`)
- Version bump: `1.0.0-beta.1`
- Recruit 15–25 beta users matching target segments
- Create beta feedback form (Google Form or Tally):
  - Camera setup ease (1–5)
  - Form feedback accuracy (1–5)
  - Voice cue timing (1–5)
  - Overall (1–5)
  - "Any cue felt wrong or unhelpful?" (open)
  - "What's missing?" (open)
- Beta channel: Slack/Discord/WhatsApp for rapid communication
- Daily Sentry review during beta

**Expected Outcome:** First external validation. No store delays.

**Success Criteria / Testing Notes:**
- Zero crash issues blocking > 10% of users
- Camera setup success ≥ 70%
- Form feedback rated ≥ 3.5/5
- At least 5 beta users complete full sessions

---

#### Phase 55 — Beta Feedback Analysis & Iteration Sprint

**Purpose:** Analyze feedback systematically; ship fixes before public launch.

**Key Tasks / Deliverables:**
- Collect feedback: Sentry crashes, form responses, in-app reports
- Categorize:
  - **P0 (block launch):** crashes, data loss, broken core flow
  - **P1 (fix before launch):** major UX friction, frequent false cues
  - **P2 (post-launch):** nice-to-haves
- Fix all P0; prioritize top 3–5 P1; document P2 in backlog
- Regression tests after fixes
- Optional 2nd beta round with 5 new users

**Expected Outcome:** Significantly improved product based on real user feedback.

**Success Criteria / Testing Notes:**
- Zero P0 in updated build
- Top P1 issues resolved
- Beta satisfaction improves by ≥ 0.5 points

---

### STAGE J — PUBLIC LAUNCH

---

#### Phase 56 — Production Deployment & Domain Setup

**Purpose:** Public production deployment.

**Main Focus Areas:**
- Domain + DNS
- Production hosting
- CI/CD pipeline
- SSL + HTTPS (PWA requirement)

**Key Tasks / Deliverables:**
- Acquire `motionly.app` domain (or available variant)
- Choose hosting (any of these work for a Vite SPA + Supabase Edge Functions backend):
  - **Vercel** — easiest, generous free tier, great DX, auto-preview deploys
  - **Cloudflare Pages** — best performance globally, generous limits, slightly more config
  - **Netlify** — solid alternative
- Recommend **Vercel** for speed of setup
- Configure:
  - `main` branch → `motionly.app` (production)
  - `develop` branch → `beta.motionly.app` or `staging.motionly.app`
  - SPA fallback (`/*` → `/index.html`) so direct URLs work
  - HTTPS enforced (required for camera, service worker, install prompt)
  - Caching headers: model files long-cached (content-hashed), HTML short-cached
- Environment variables in hosting provider dashboard (Supabase URL, Stripe public key, etc.)
- Set up GitHub Actions: lint + typecheck + test on PR; auto-deploy via hosting provider
- Configure deploy previews (every PR gets a unique URL)
- Set up custom error pages (404, 500)

**Expected Outcome:** Production hosting live on a custom domain with auto-deploy.

**Success Criteria / Testing Notes:**
- `motionly.app` loads in < 2s globally (test via WebPageTest)
- Every PR gets a preview URL
- Lighthouse PWA ≥ 95 on production build

---

#### Phase 57 — Launch Assets & Marketing Page

**Purpose:** Marketing page + launch assets (no app store assets needed for PWA — the URL IS the listing).

**Key Tasks / Deliverables:**
- **Marketing landing page** at `motionly.app`:
  - Hero: "Your AI fitness coach lives in your camera." + demo video
  - Demo video (30s): bad form → real-time AI correction → improvement
  - Features grid
  - Privacy section: "Your video never leaves your device"
  - Pricing
  - FAQ
  - CTA: "Try Motionly free → install in one tap"
  - Footer: ToS, Privacy, Contact
- Same React app serves landing + app (different routes), OR separate static landing at `motionly.app/` + app at `motionly.app/app/` (TBD)
- **PWA manifest already done in Phase 2** — defines name, icons, theme color when installed
- **Open Graph + Twitter Card** meta tags for social sharing previews:
  - `og:image` — branded share preview (1200×630)
  - `og:title`, `og:description`
- **Demo video** (30s):
  - 0–5s: user opens motionly.app and grants camera
  - 5–15s: active squat session with skeleton + form cue
  - 15–25s: rep counter + form score
  - 25–30s: post-workout summary score reveal
- App icon: Motionly "M" mark with motion arc, dark background, electric blue + white
  - Generate full icon set: 192, 512, maskable, favicon, apple-touch-icon
  - Use `pwa-asset-generator` or RealFaviconGenerator
- "How to install" mini-guide for users new to PWAs:
  - Android Chrome: tap menu → "Install app" or "Add to Home Screen"
  - iOS Safari: tap Share → "Add to Home Screen"

**Expected Outcome:** A compelling landing page + complete brand assets. URL itself becomes the conversion surface.

**Success Criteria / Testing Notes:**
- Landing page Lighthouse Performance ≥ 95
- Social share preview renders correctly on Twitter, WhatsApp, LinkedIn
- Install prompt appears on Android Chrome after 30 seconds of engagement

---

#### Phase 58 — Soft Launch & Public Launch Strategy

**Purpose:** Staged public launch.

**Key Tasks / Deliverables:**
- **Soft Launch (Week 1–2):** India + UK/US with limited promotion
  - Observe: crash rate, conversion, camera setup success, D1 retention
  - Fix any production issues
- **Full Launch (Week 3):** activate all marketing channels
- **Launch day checklist:**
  - [ ] Supabase auto-scaling verified
  - [ ] Sentry alert thresholds set (alert if error rate > 1%)
  - [ ] Stripe + Razorpay webhooks live
  - [ ] Support email monitored
  - [ ] Social accounts ready (Instagram, TikTok)
  - [ ] Product Hunt launch prepared
  - [ ] 5 micro-influencer demos scheduled
- **Day-1 KPIs:**
  - 500+ unique visitors
  - PWA install rate ≥ 20% of visitors
  - D1 retention ≥ 30% of installs
  - Camera setup success ≥ 65%
  - Zero P0 crashes

**Expected Outcome:** A monitored, measured launch.

**Success Criteria / Testing Notes:**
- App live and stable
- No P0 crash affecting > 1% within 48 hours
- At least one organic social mention

---

### STAGE K — POST-LAUNCH, ANALYTICS & GROWTH

---

#### Phase 59 — Post-Launch Analytics Dashboard

**Key Tasks / Deliverables:**
- PostHog dashboard:
  - **Acquisition:** daily uniques, source breakdown
  - **Activation:** install rate, onboarding completion, first workout completion, camera setup success
  - **Retention:** D1, D7, D30
  - **Revenue:** MRR, ARPU, trial-to-paid, churn
  - **Engagement:** sessions/user/week, avg duration, form score trend
  - **Quality:** false-positive cue rate (from 👍/👎), crash-free session rate
- Weekly KPI email (automated via PostHog or Zapier)
- Success thresholds:
  - D7 retention ≥ 20%
  - Trial-to-paid ≥ 30%
  - Camera setup success ≥ 70%
  - Avg form feedback ≥ 4.0
- Alerts: any metric drops > 20% week-over-week

**Expected Outcome:** Full visibility into product health within 48 hours of any issue.

**Success Criteria / Testing Notes:**
- Dashboard updates daily
- Weekly KPI email arrives Monday morning
- Funnel numbers match expected test counts

---

#### Phase 60 — SEO & Discovery Optimization

**Purpose:** Drive organic discovery via search (the web equivalent of ASO).

**Key Tasks / Deliverables:**
- SEO meta tags on landing page: title, description, keywords (where still indexed), structured data (FAQ schema, SoftwareApplication schema)
- Sitemap.xml + robots.txt
- Submit to Google Search Console
- Content strategy: blog at `motionly.app/blog/` covering "how to fix squat form", "push-up form mistakes", etc. — captures fitness-form search intent
- Backlinks from fitness review sites, Product Hunt, Hacker News
- Track keyword rankings via Ahrefs / Search Console
- A/B test landing hero copy + above-the-fold layout

**Expected Outcome:** Growing organic traffic from search.

**Success Criteria / Testing Notes:**
- At least 3 target keywords ranking in top 20 after 60 days
- Organic traffic ≥ 30% of total traffic after 90 days
- Landing page conversion (visitor → install) ≥ 15%

---

#### Phase 61 — Creator Partnership Program

**Purpose:** Fitness creator partnerships driving organic acquisition through authentic demos.

**Key Tasks / Deliverables:**
- Identify 10–20 micro-creators (10K–200K followers) across TikTok / Reels / YouTube Shorts
- Include regional-language creators (Hindi, Tamil)
- Creator Program Brief: what to demonstrate (bad form → real-time AI correction → improvement), hashtag `#MoveBetter`, disclosure requirements
- Creator tiers:
  - **Affiliate:** free Pro + 30% revenue share via referral code
  - **Partner:** paid flat fee + affiliate
- Track referrals via URL parameters (`?ref=creatorname`) → attribute via PostHog
- Creator onboarding pack: brand assets, talking points, do/don't guide
- Weekly creator report: installs per creator, conversion, engagement

**Expected Outcome:** 5–10 active creator partnerships within 60 days post-launch.

**Success Criteria / Testing Notes:**
- At least one creator video achieves > 100K views in first 30 days
- Creator-attributed installs ≥ 15% of total in Month 2
- At least one Hindi-language creator for India

---

#### Phase 62 — B2B / Corporate Wellness Pilot

**Purpose:** First corporate wellness pilot.

**Key Tasks / Deliverables:**
- Define "Motionly for Teams" MVP:
  - Admin creates team, invites employees via email
  - Employees get free Pro for contract duration
  - Admin sees aggregate stats (no individual data — privacy)
- Build minimal admin web dashboard (route at `/admin` in same app, gated by `is_admin` flag)
- Price: $4/user/month, minimum 20 users ($80/month minimum)
- Identify 3–5 SMB targets: tech startups, coworking spaces, universities
- B2B one-pager
- Run 2-month pilot with 1 company → testimonial + case study
- Success: ≥ 40% of licensed users complete ≥ 1 workout in Week 1

**Expected Outcome:** Validated B2B product-market fit with one paying corporate customer.

**Success Criteria / Testing Notes:**
- 1 paid corporate pilot signed by Month 3
- Pilot company reports ≥ 3.5/5 employee satisfaction

---

#### Phase 63 — Intermediate Plan & Exercise Library Expansion

**Key Tasks / Deliverables:**
- 4-week intermediate bodyweight plan (trainer-reviewed)
- Add 5 new exercises: sumo squat, pike push-up, side plank, step-up, single-leg glute bridge
- Plan graduation flow: completing beginner → congrats → intermediate plan CTA
- Dumbbell intro plan (light dumbbells, Phase 2)
- Update `ExerciseRegistry` + seed data

**Success Criteria:**
- All 5 new exercises pass 10-rep accuracy test
- Graduation modal shows correctly at Week 4 completion

---

#### Phase 64 — Form Feedback Quality Improvement Loop

**Key Tasks / Deliverables:**
- Add "Was this helpful?" 👍/👎 prompt 3 seconds after each cue
- Track to `cue_feedback` Supabase table (anonymous)
- Weekly automated report: false-positive rate by cue type
- Tuning sprint: any cue > 20% 👎 → review threshold, adjust
- Improve cue language based on negative feedback patterns
- Framework for community data contribution (opt-in clips for model improvement — Phase 3)

**Success Criteria:**
- 👎 rate < 15% across all cues after Month 2
- At least one cue improved per month based on data

---

#### Phase 65 — India Market Launch Optimization

**Key Tasks / Deliverables:**
- **UPI / Razorpay Optimization:** Razorpay already supports UPI, cards, wallets, netbanking natively. Verify all paths in production.
- **Low-Data Mode:**
  - App fully offline for sessions after initial load
  - Model + audio cached via service worker
  - Setting: "Download voice cues only on WiFi"
  - Compressed audio (64kbps MP3 sufficient for voice)
- **Mid-Range Android Optimization:** specific testing on Redmi Note 12, Samsung M34, Realme 11x. Address browser-specific quirks (Samsung Internet, MIUI Browser variants).
- **App size:** total cached size < 50 MB after first visit (model is biggest contributor — Lite model is ~5 MB)
- **Tamil translation** (large South Indian base)
- Partner with 3 Hindi-language creators for India push
- "No-equipment morning routine" workout (popular with Indian home users)
- Small-apartment exercise modifications (< 4 sq meters)

**Success Criteria:**
- Total PWA size < 50 MB cached
- Razorpay UPI completes correctly
- Full Hindi experience without missing strings
- 10-min session completes on Redmi Note 12 without thermal issue

---

#### Phase 66 — Streak & Gamification System

**Key Tasks / Deliverables:**
- **Streak system:**
  - Show on home, profile, post-workout
  - Streak freeze: 1/week for Pro users
  - "Streak at risk" notification if no workout by 7pm
- **Achievement badges:** first workout, 7-day streak, 30-day streak, 100 correct reps, 10 sessions, first form score ≥ 90, "Form Perfectionist"
- Achievement unlock animation
- **Weekly challenge:** every Monday — "This week: 30 squats with score ≥ 75" (Pro feature)
- **Progress milestones:** auto-detected insight cards ("Your squat form score improved 15% over 3 weeks")

**Success Criteria:**
- Streak increments once per calendar day
- Streak freeze saves streak correctly
- Achievements trigger at correct conditions

---

#### Phase 67 — Social Sharing

**Key Tasks / Deliverables:**
- **Post-workout share card:**
  - Generate PNG via `html-to-image` library or server-side via Edge Function + Satori
  - Share via Web Share API (`navigator.share`)
  - Falls back to copy-to-clipboard on desktop
- **Progress share:** "My squat form improved 18% this month" card with chart
- **Referral:** "Share Motionly with a friend — they get 14-day free trial, you get 7 bonus days"
  - Referral codes tracked via URL parameters
- App rating prompt (already in Phase 60)
- Brand kit for UGC: fonts, colors, logo templates

**Success Criteria:**
- Share card generates in < 1 second
- Web Share API works on Android Chrome and iOS Safari
- Referral attribution works correctly

---

#### Phase 68 — Continuous Improvement & Technical Debt Sprint

**Key Tasks / Deliverables:**
- Audit + fix:
  - Hardcoded strings → i18n
  - Untyped components
  - Untested store actions
  - TODO comments > 30 days old
- Re-run Phase 40/41 performance benchmarks — confirm no regressions
- `src/ml/` coverage back to ≥ 80%
- Refactor any exercise engine > 300 lines
- Update `ARCHITECTURE.md`, `CODING_STANDARDS.md`, `SETUP.md`
- Dependency audit: update, remove unused
- Security audit: `.env` keys, none committed

**Success Criteria:**
- Zero TODO > 30 days
- No critical security vulnerabilities
- Documentation reflects current state

---

#### Phase 69 — (Optional) Capacitor Wrap for App Stores

**Purpose:** Once the PWA is validated and revenue justifies it, wrap with Capacitor to ship to App Store and Play Store. **No new local toolchain required if cloud builds are used.**

**Main Focus Areas:**
- Capacitor integration
- Cloud builds (no Xcode/Android Studio locally)
- Native IAP (RevenueCat at this point)
- Store submission

**Key Tasks / Deliverables:**
- Install: `pnpm add @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android`
- Run `npx cap init Motionly com.motionly.app`
- Reuse the same React app — Capacitor wraps it in a native WebView
- Replace web-only APIs with Capacitor plugins behind the existing `src/platform/` adapters:
  - `@capacitor/camera` (already accessible, but native preview is smoother)
  - `@capacitor/local-notifications` for iOS push
  - `@capacitor-community/in-app-purchase` or RevenueCat for native IAP
- **Cloud builds (no local Xcode/Android Studio):**
  - **Ionic Appflow** — paid SaaS, builds iOS + Android in cloud, easiest setup
  - **GitHub Actions with macOS runners** — free for public repos, paid for private; full control
  - **EAS Build** — Expo's cloud build, also works for Capacitor with config
- Submit to App Store + Play Store
- App store assets (now needed): screenshots, app preview video, store descriptions (reuse marketing page copy)

**Expected Outcome:** Native iOS + Android apps shipped from the same codebase, without ever installing Xcode or Android Studio locally.

**Success Criteria / Testing Notes:**
- App approved on both stores
- Native IAP working
- Same UX as PWA, with marginal performance gains
- Build pipeline fully cloud-based

---

## Suggested Build Stages

| Stage | Phases | Milestone | Timeline (Solo Dev) | Timeline (Team of 3) |
|-------|--------|-----------|---------------------|----------------------|
| **A: Foundation** | 1–6 | Project setup complete | Week 1 | Days 1–4 |
| **B: UI/UX** | 7–16 | Full screen library + onboarding | Weeks 2–5 | Weeks 2–3 |
| **C: Core ML** | 17–28 | Full workout session MVP | Weeks 6–13 | Weeks 4–8 |
| **D: Data & Backend** | 29–32 | Auth + persistence + cloud sync | Weeks 14–15 | Weeks 9–10 |
| **E: Personalization** | 33–35 | Adaptive plans + progress | Weeks 16–17 | Week 11 |
| **F: Monetization** | 36–38 | Subscription + paywall | Weeks 18–19 | Week 12 |
| **G: Privacy & Performance** | 39–43 | Optimized + multilingual | Weeks 20–22 | Weeks 13–14 |
| **H: Polish** | 44–48 | Notifications + dark mode + animation | Weeks 23–24 | Week 15 |
| **I: QA & Beta** | 49–55 | Closed beta + iteration | Weeks 25–28 | Weeks 16–18 |
| **J: Launch** | 56–58 | Public launch on motionly.app | Weeks 29–30 | Weeks 19–20 |
| **K: Growth** | 59–68 | Post-launch growth & iteration | Ongoing | Ongoing |
| **K+: Native (optional)** | 69 | App Store + Play Store via Capacitor | +3–4 weeks when justified | +2 weeks when justified |

**Total to MVP Launch:**
- Solo developer: ~30 weeks (~7.5 months) — significantly faster than the native path (was 40 weeks) due to no native bridges and no separate iOS/Android phases
- Team of 3 (web dev + ML + backend/design): ~20 weeks (~5 months)

---

## Recommended Tech Stack & Architecture

### Web Framework

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Vite + React 18 | Fast dev server, instant HMR, modern build pipeline |
| Language | TypeScript (strict mode) | Type safety critical for ML data pipelines |
| Routing | React Router 6 | Industry standard, code-splitting friendly |
| Styling | Tailwind CSS | Utility-first, no runtime, tiny bundle |
| State | Zustand | Lightweight, performant, TypeScript-first |
| Local DB | Dexie (IndexedDB wrapper) | Gigabyte-scale local storage, query-friendly |
| Animations | Framer Motion | Declarative React-friendly motion |
| PWA tooling | vite-plugin-pwa + Workbox | Best-in-class service worker generation |
| Charts | Recharts | React-friendly, tree-shakeable |
| Forms | React Hook Form + Zod | Performant + validated |

### ML & Pose Engine

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Pose Estimation | MediaPipe Tasks Vision (JS) | Same 33-keypoint BlazePose model as native, browser-optimized via WebAssembly + WebGL |
| Model | LITE for mid-range, FULL for WebGPU-capable devices | Balance of accuracy and performance |
| Inference Backend | WebGL delegate (with WebGPU fallback when available) | GPU-accelerated, broad device support |
| Runtime | Web Worker (`OffscreenCanvas`) | Keeps main thread responsive for 60fps UI |
| Angle Calculation | Custom TypeScript | 0 dependencies, < 1ms per frame |
| Exercise Logic | Custom TypeScript state machines | Fully controllable, testable |
| Smoothing | EMA (Exponential Moving Average) | Simple, adjustable per exercise |

### Browser Platform APIs

| Need | API | Notes |
|------|-----|-------|
| Camera | `getUserMedia` | Works in all modern browsers |
| Voice TTS | Web Speech API + pre-recorded MP3 (Web Audio API) | MP3s for low latency, TTS for dynamic strings |
| Storage | IndexedDB (via Dexie) | Gigabyte capacity, structured queries |
| Notifications | Web Push API + email (Resend) | Web Push works on Android Chrome + installed iOS PWAs; email for iOS Safari fallback |
| Wake Lock | Wake Lock API | Keeps screen on during workouts |
| Install | Web App Manifest | "Add to Home Screen" |
| Offline | Service Worker (Workbox) | Cache model, audio, fonts for full offline use |
| Share | Web Share API | Native share sheet on mobile |
| Haptics | `navigator.vibrate()` | Android Chrome; iOS Safari does not support |

### Backend

| Component | Choice | Rationale |
|-----------|--------|-----------|
| BaaS | Supabase (PostgreSQL + Auth) | Open source, PostgreSQL power, strong RLS |
| Edge Logic | Supabase Edge Functions | Serverless, close to user, used for payment webhooks |
| Auth | Supabase Auth (email + Google + Apple) | Built-in OAuth, JWT sessions |
| File Storage | Supabase Storage | If creator content is needed later |
| Subscriptions | Stripe (global) + Razorpay (India) | Direct, no middleman fees, India-native UPI support |
| Email | Resend | Transactional emails (reminders, password reset) |
| Analytics | PostHog | Privacy-respecting, cookie-free option |
| Crash Reporting | Sentry | Best-in-class for React |
| Hosting | Vercel (recommended) or Cloudflare Pages | Global CDN, auto-deploy, generous free tiers |

### Architecture Pattern

```
┌──────────────────────────────────────────────────────┐
│                  React + Vite (PWA)                  │
│         (Pages → Components → Hooks → Stores)        │
└────────────────────────┬─────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────┐
│                   Zustand Stores                     │
│      (User, Session, Pose, Progress, Settings)       │
└──────┬────────────────────────────────────┬──────────┘
       │                                    │
┌──────▼──────┐                  ┌──────────▼──────────┐
│  ML Engine  │                  │   Services Layer    │
│ (Web Worker)│                  │  (API, DB, Sub)     │
│             │                  │                     │
│ PoseLandmark│                  │ SupabaseService     │
│ AngleEngine │                  │ DatabaseService     │
│ ExerciseEngn│                  │ SubscriptionService │
│ FormRules   │                  │ VoiceCoach          │
│ FormScorer  │                  │ AnalyticsService    │
└──────┬──────┘                  └──────────┬──────────┘
       │                                    │
┌──────▼──────────────────┐      ┌──────────▼──────────┐
│  Platform Adapters      │      │   Remote Backend    │
│  (src/platform/*)       │      │                     │
│                         │      │ Supabase Cloud      │
│ Camera (getUserMedia)   │      │ Stripe / Razorpay   │
│ TTS (Web Speech/Audio)  │      │ Sentry / PostHog    │
│ Storage (IndexedDB)     │      │ Resend (email)      │
│ Notifications (Push/Eml)│      │                     │
└─────────────────────────┘      └─────────────────────┘
```

### Folder Structure (Reference)

```
motionly/
├── public/
│   ├── models/                    # MediaPipe .task files
│   ├── audio/cues/{en,hi}/        # Voice cue MP3s
│   ├── icons/                     # PWA icons (192, 512, maskable, favicon)
│   └── manifest.webmanifest
├── src/
│   ├── assets/                    # Imported images, fonts
│   ├── components/
│   │   ├── common/                # Button, Card, Input, etc.
│   │   ├── camera/                # SkeletonOverlay, FormOverlay, SilhouetteGuide
│   │   ├── workout/               # RepCounter, FormCueCard, WorkoutTimer
│   │   └── progress/              # ScoreRing, TrendChart, StreakCalendar
│   ├── pages/
│   │   ├── auth/                  # Login, Register, ForgotPassword
│   │   ├── onboarding/            # Welcome, Goal, Level, Limitations, CameraTutorial
│   │   ├── home/                  # Dashboard
│   │   ├── workout/               # Library, Detail, CameraSetup, ActiveWorkout, Summary
│   │   ├── progress/              # History, ExerciseProgress, SessionDetail
│   │   └── profile/               # Settings, Subscription, Privacy
│   ├── router/
│   │   ├── routes.tsx
│   │   └── RequireAuth.tsx
│   ├── hooks/
│   │   ├── usePose.ts
│   │   ├── useWorkoutSession.ts
│   │   ├── useSubscription.ts
│   │   └── useTheme.ts
│   ├── store/
│   │   ├── useUserStore.ts
│   │   ├── useWorkoutSessionStore.ts
│   │   ├── usePoseStore.ts
│   │   ├── useProgressStore.ts
│   │   └── useSettingsStore.ts
│   ├── services/
│   │   ├── api/SupabaseService.ts
│   │   ├── db/MotionlyDB.ts       # Dexie schema
│   │   ├── db/DatabaseService.ts
│   │   ├── subscription/SubscriptionService.ts
│   │   ├── voice/VoiceCoach.ts
│   │   ├── analytics/AnalyticsService.ts
│   │   └── notifications/PushService.ts
│   ├── platform/                  # thin adapters — swap-points for Capacitor later
│   │   ├── camera.ts
│   │   ├── tts.ts
│   │   ├── storage.ts
│   │   └── notifications.ts
│   ├── ml/
│   │   ├── pose/
│   │   │   ├── PoseLandmarker.ts
│   │   │   ├── PoseWorker.ts            # Web Worker entry
│   │   │   ├── LandmarkSmoother.ts
│   │   │   ├── ConfidenceFilter.ts
│   │   │   └── LandmarkNormalizer.ts
│   │   ├── angles/
│   │   │   ├── AngleCalculator.ts
│   │   │   └── JointAngles.ts
│   │   ├── exercises/
│   │   │   ├── SquatEngine.ts
│   │   │   ├── SquatFormRules.ts
│   │   │   ├── PushUpEngine.ts
│   │   │   ├── PlankEngine.ts
│   │   │   ├── ... (all 10 exercises)
│   │   │   └── ExerciseRegistry.ts
│   │   ├── FormScorer.ts
│   │   ├── CueThrottler.ts
│   │   └── AdaptiveEngine.ts
│   ├── workers/                   # Other Web Workers
│   ├── i18n/
│   │   ├── locales/en/
│   │   ├── locales/hi/
│   │   └── index.ts
│   ├── theme/
│   │   ├── motion.ts
│   │   └── index.ts
│   ├── types/
│   │   ├── pose.ts
│   │   ├── exercise.ts
│   │   └── workout.ts
│   └── utils/
│       ├── math.ts
│       ├── format.ts
│       └── constants.ts
├── docs/
│   ├── SETUP.md
│   ├── ARCHITECTURE.md
│   ├── CODING_STANDARDS.md
│   ├── USER_FLOWS.md
│   ├── PRIVACY_COMPLIANCE.md
│   └── wireframes/
├── tests/
│   ├── unit/
│   └── e2e/                       # Playwright
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Monetization Integration Plan

### Freemium Tier Architecture

| Feature | Free | Pro ($9.99/mo or $59.99/yr) | India Pro (₹299/mo or ₹1,499/yr) |
|---------|------|------------------------------|-----------------------------------|
| Sessions per week | 3 | Unlimited | Unlimited |
| Exercises available | 5 (core) | All 10+ | All 10+ |
| Form feedback | Basic (1 cue/rep) | Full (all rules) | Full (all rules) |
| Voice coaching | Limited | Full | Full |
| Adaptive programming | ✗ | ✓ | ✓ |
| Progress history | 7 days | 90 days | 90 days |
| Workout plans | Beginner Week 1 only | All plans | All plans |
| Achievements & challenges | ✗ | ✓ | ✓ |
| Streak freeze | ✗ | 1/week | 1/week |
| Priority support | ✗ | ✓ | ✓ |
| Free trial | 7 days (annual plan) | — | — |

### Why Web Payments Beat Native IAP (for now)

| Factor | Native IAP (Apple/Google) | Web (Stripe + Razorpay) |
|--------|---------------------------|--------------------------|
| Platform cut | 15–30% | 2.9% + $0.30 (Stripe) / 2% (Razorpay) |
| India payment methods | Cards only, friction-heavy | UPI / cards / wallets / netbanking |
| Refund flexibility | Limited (platform-controlled) | Full control |
| Pricing changes | Slow (store approval) | Instant |
| Customer relationship | Owned by Apple/Google | Direct |
| Subscription portal | Buried in OS settings | Custom branded |

When we add Capacitor + native apps later (Phase 69), we'll need to add RevenueCat for native IAP — but the web version stays as-is.

### Revenue Projections (Conservative/Base/Strong)

| MAU | Conservative MRR | Base MRR | Strong MRR |
|-----|------------------|----------|------------|
| 1,000 | $120 | $500 | $1,200 |
| 10,000 | $1,200 | $5,000 | $12,000 |
| 50,000 | $6,000 | $25,000 | $60,000 |
| 100,000 | $12,000 | $50,000 | $120,000 |

*Assumptions: Conservative = 2% paid conversion, $5.99 ARPPU. Base = 5%, $9.99. Strong = 8%, $14.99.*

### B2B Pricing

| Tier | Price | Minimum | Includes |
|------|-------|---------|----------|
| Starter | $4/user/month | 20 users | All Pro features, basic admin dashboard |
| Growth | $3.50/user/month | 50 users | Above + custom challenges, priority support |
| Enterprise | Custom | 200+ users | Above + SSO, custom content, API access |

### Monetization Key Rules

1. Free tier must deliver real value — not a crippled demo
2. Paywall shown at natural moments (limit reached, not random interruption)
3. Annual plan is the primary push (50% discount + better LTV + retention)
4. India pricing is non-negotiable — $9.99/month is a non-starter for mass India adoption
5. B2B pricing includes SLA-level support
6. Never use dark patterns: no auto-renew without clear notice, easy cancel, clear trial terms

---

## Future Features & Expansion Roadmap

### Phase 2 (Months 7–18 Post-Launch)

| Feature | Description | Priority |
|---------|-------------|----------|
| Capacitor native apps | App Store + Play Store via cloud builds | High |
| Dumbbell workout plans | Goblet squat, row, press — side-view guidance | High |
| "Correct Reps" hero metric | Reps with form score ≥ 80 — flagship metric | High |
| Creator workout programs | Creators build programs; Motionly AI coaches form | High |
| Smart TV / desktop companion | Cast workout to TV while phone is the coach | Medium |
| Progress sharing cards | Auto-generated shareable improvement cards | High |
| Community challenges | Weekly form challenges with leaderboards (aggregate only) | Medium |
| Movement assessment onboarding | 5-exercise baseline → personalized starting level | High |
| Additional languages | Tamil, Telugu, Spanish, Portuguese, German | High |
| Multi-exercise session builder | User-built custom workouts | Medium |

### Phase 3 (Months 19–36 Post-Launch)

| Feature | Description |
|---------|-------------|
| 3D pose / depth estimation | Better depth and rotation assessment via monocular depth models |
| AR coaching overlay | Show target joint path and foot placement as guides |
| Optional wearable integration | Heart rate context from Apple Watch / Garmin (optional) |
| Live AI coaching conversation | "Ask your AI coach" — voice input for advice |
| Rehab/prehab B2B | White-label movement assessment for physio clinics |
| Insurance / employer wellness | Preventive activity programs with adherence tracking |
| Movement API / white-label | License Motionly's movement engine to other apps |
| Running gait analysis | Outdoor running form assessment (treadmill first) |
| Clinical movement reports | For PT/physio-referred users — requires clinical validation |
| On-device LLM coaching summaries | Private, personalized post-workout text |

---

## Hard Truths, Risks & Mitigation Strategies

### Technical Risks

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| Pose estimation fails on diverse body types / clothing | High | Medium | Diverse user testing (Phase 52); confidence gates; "camera unclear" state always available |
| False-positive form cues destroy trust | High | Medium | Strict confidence thresholds; cue throttling; 👍/👎 feedback loop |
| Performance unacceptable on mid-range Android Chrome | High | Medium | Aggressive optimization (Phase 40); LITE model default; adaptive FPS; Web Worker for inference |
| MediaPipe Tasks Vision JS updates break interface | Medium | Low | Pin version; test before upgrading |
| Camera placement friction kills activation | High | High | Silhouette UX (Phase 16); voice instructions; fast calibration target |
| iOS Safari quirks block features (audio init, background, etc.) | High | Medium | Document quirks; require user gesture for audio; visibility API for background; physical iPhone testing |
| Browser camera API inconsistencies | Medium | Medium | Test on Chrome, Safari, Samsung Internet, Edge; feature detection + graceful degradation |

### Business Risks

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| Low D30 retention (fitness motivation fades) | High | High | Adaptive plans; form progress metrics; streaks; weekly challenges |
| "AI personal trainer" branding becomes generic | Medium | High | Own "real-time form correction" as specific differentiator, not "AI" |
| Browsers add native pose APIs | Medium | Low | Years away. Build data moat, localization depth, creator ecosystem. |
| High CAC in US makes unit economics hard | High | Medium | Creator-driven organic; SEO; India-first reduces CAC |
| Injury from following app's guidance | Very High | Low | Conservative progressions; disclaimers; pain check-ins; no medical claims |
| Regulatory: medical device classification | High | Low | Wellness framing; no diagnosis; no treatment claims; legal review |
| PWA discoverability vs native apps | Medium | High | Strong SEO + landing page + creator content compensate; Phase 69 wrap when needed |

### UX Risks

| Risk | Mitigation |
|------|------------|
| Phone placement feels like too much effort | Sub-60-second camera setup as hard design constraint |
| Too many corrections = shame and churn | One cue at a time; cue throttling; coaching intensity setting |
| Users don't trust skeleton overlay accuracy | Show confidence indicator; "camera unclear" state builds trust through honesty |
| App feels generic, not personal | Adaptive plans; named progress metrics; personalized post-workout insights |
| Users don't realize they can "install" the website | Subtle install banner after 30s engagement; "How to install" mini-guide on first visit |
| iOS Safari users get a worse experience | Document limitations transparently; ship email reminders to compensate for limited push |

### Key Founding Principles to Never Violate

1. **No raw video leaves the device.** Ever. This is the foundation of user trust.
2. **No medical claims.** Not "prevents injury" — "flags form patterns that may increase strain."
3. **No cue fires when confidence is low.** Silence is safer than wrong feedback.
4. **One correction at a time.** One cue per rep, maximum. Never overwhelm.
5. **Narrow and excellent beats broad and mediocre.** 10 exercises done perfectly > 100 exercises done poorly.
6. **Retention is the product.** Every feature must serve the weekly habit, or it does not ship.
7. **Platform-portable.** Keep all browser-specific code behind `src/platform/` adapters. The future Capacitor wrap is a swap, not a rewrite.

---

*Motionly Master Development Plan v2.0.0 — PWA Edition — May 2026*
*Move Better.*
