# 01 — Splash / Launch Screen

## Purpose

The first visual moment of Motionly. A short, calm brand reveal that signals "the app is loading" without implying that any AI work, camera work, or coaching is already happening in the background.

## Route

No dedicated route. Renders before React routing takes over — see Phase 10 implementation notes for the HTML splash that paints before hydration plus the post-hydration animated brand screen.

## Future implementation phase

**Phase 10 — Splash & App Launch Experience.**

## Entry points

- Cold launch of the PWA (icon tap on home screen / app drawer).
- Cold open of the URL in the browser tab.
- App resume from a fully-killed background state.

## Exit points

- **First-time user:** routes to `/welcome` (Phase 11 onboarding entry).
- **Returning user with completed onboarding:** routes to `/` (Phase 13 dashboard).
- **Returning user with an active auth session expired:** routes to `/login` once Phase 32 ships auth.

Phase 6 has placeholder pages for all three destinations; the splash never assumes a destination exists.

## Primary user action

None. The splash is non-interactive. It must auto-advance.

## Secondary actions

None. Do not add a "Skip" button — the splash is short enough that one is unnecessary, and adding one trains users to look for one.

## Wireframe

```
┌──────────────────────────────────────┐
│                                      │
│                                      │
│                                      │
│                                      │
│                                      │
│                                      │
│                                      │
│                                      │
│             [ logo mark ]            │
│                                      │
│              MOTIONLY                │
│                                      │
│            Move Better.              │
│                                      │
│                                      │
│                                      │
│                                      │
│                                      │
│                                      │
│                                      │
└──────────────────────────────────────┘
```

- Background: solid `bg-motionly-bg-dark` in dark mode, `bg-motionly-bg-light` in light mode (no gradient, no decorative shapes).
- Logo mark: centered vertically (~55% from top), scales 90% → 100% with fade-in on hydration.
- Wordmark: `text-h1` weight, centered under the mark.
- Tagline "Move Better.": `text-body`, neutral-500 in dark mode for low-emphasis, fades in 200ms after the wordmark.

The HTML splash (paint before React hydrates) uses the same layout with `inline <style>` so there is no flash of unstyled content.

## Content rules

- Only the wordmark "Motionly" and the tagline "Move Better." appear on the splash. Nothing else.
- Do not display loading spinners, percentage bars, or "Loading workouts…" text. They are noise.
- Do not display "Powered by AI" or similar copy. The first time the user sees AI is when the AI is doing something.

## Data requirements (future only)

- None on the splash itself.
- During the splash duration, Phase 10 may rehydrate persisted state (onboarding flag, theme preference). These reads run in parallel with the animation and must not block past ~1.8 seconds.

## States to handle later

- **Hydration too slow:** if React has not finished hydrating after ~2 seconds, the HTML splash continues to render the same layout — there is no fallback screen. There must never be a white flash.
- **Service worker update available:** Phase 10 surfaces "Refresh to update" as a toast after navigation completes, **not** on the splash. The splash never blocks for SW.
- **Persisted state corrupt / unreadable:** the app must degrade gracefully to first-time user flow (route to `/welcome`).

## Accessibility notes

- `prefers-reduced-motion` must suppress the scale animation; the logo simply appears.
- Splash must not trap focus. Once the destination route renders, the focus moves to that route's primary heading.
- Aria-live announcements are not appropriate on the splash; it is decorative.
- Color contrast: wordmark on background must pass WCAG AA (Phase 5 tokens already meet this).

## Privacy / safety notes

- The splash does **not** request camera or microphone permission. Permission prompts happen only at the camera setup step.
- The splash does **not** show "Connecting to server…" or any networking copy that would imply a backend call is happening.

## Do not fake

- Do not animate a fake "Loading 47%" progress bar; there is no such measurement.
- Do not write "Welcome back, Rudra" — the splash predates the user identity check, and the app does not yet have real users.
- Do not show a fake streak or "Day 12" badge on the splash.
- Do not display a fake "AI engine initialized" line — the ML stack is still future work and even when it lands, it initializes inside the workout flow, not on launch.
