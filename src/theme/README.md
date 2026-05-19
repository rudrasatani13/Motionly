# `src/theme/`

Design system tokens, theming primitives, and motion constants.

## What belongs here

- Tailwind config token re-exports (Phase 5)
- `ThemeProvider` and `useTheme()` (Phase 5 / Phase 46)
- Animation duration and easing constants (`src/theme/motion.ts`)

## What does NOT belong here

- Component implementations — those live in `src/components/`
- Page-specific styling — keep that with the page
- Hardcoded hex values once Tailwind tokens land — colors must reference tokens

## Phase status

Reserved. Tokens are defined in **Phase 5 — Design System Foundation: Tokens & Theme**; dark-mode wiring lands in **Phase 46**. Empty by design.
