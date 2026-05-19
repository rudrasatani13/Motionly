# `src/theme/`

Design system tokens, theming primitives, and motion constants.

## What belongs here

- Theme-facing exports that refer back to `tailwind.config.ts` as the token source of truth
- `ThemeProvider` and `useTheme()` (Phase 5 / Phase 46)
- Animation duration and easing constants (`src/theme/motion.ts`)
- Small theme runtime helpers that apply Tailwind's root `dark` class and persist theme preference

## What does NOT belong here

- Component implementations — those live in `src/components/`
- Page-specific styling — keep that with the page
- Hardcoded hex values once Tailwind tokens land — colors must reference tokens

## Phase status

Phase 5 complete. `tailwind.config.ts` is the source of truth for colors, font family, and typography utilities. This folder contains the React theme provider, hook, types, and motion constants. Later phases may add a user-facing settings UI and broader accessibility audit; do not add product screens or reusable UI primitives here.
