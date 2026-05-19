<!--
  Motionly Pull Request Template
  Keep this PR short, scoped to a single phase of MOTIONLY_MASTER_PLAN.md,
  and honest about what is and isn't implemented.
-->

## Summary

<!-- 1–3 sentences. What changed and why. -->

## Phase / Scope

<!-- Which phase of MOTIONLY_MASTER_PLAN.md does this PR belong to? e.g. "Phase 3 — Git Repository & Branching Strategy Setup" -->

## Changes Made

<!-- Bullet list of concrete changes. Reference file paths where helpful. -->

-

## Out of Scope

<!-- Anything you intentionally did NOT do in this PR, so reviewers don't expect it. -->

-

## Testing Completed

<!-- What you actually ran and saw. Be specific. -->

- [ ] `pnpm install` succeeds
- [ ] `pnpm format:check` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` succeeds
- [ ] Manual smoke test in browser (describe below if UI changed)

Notes:

## Screenshots or Recordings (if UI changed)

<!-- Drop screenshots, GIFs, or short screen recordings here. Omit if no UI change. -->

## Privacy / Data Safety Check

- [ ] No raw video, camera frames, or audio leaves the device
- [ ] No new third-party SDK that collects user data was added without explicit discussion
- [ ] No new telemetry or analytics was added without opt-in

## No Fake Data Check

- [ ] No fake users, fake workouts, fake stats, fake AI scores, fake streaks, or fake analytics
- [ ] No placeholder copy that claims unfinished product features as live
- [ ] Any "coming in a later phase" status is clearly labeled as such

## Manual QA Checklist

- [ ] I read the relevant phase in `MOTIONLY_MASTER_PLAN.md`
- [ ] I kept this change within the current phase scope
- [ ] I followed the rules in `docs/ARCHITECTURE.md` (folder layout, platform-adapter pattern, layering)
- [ ] I followed the rules in `docs/CODING_STANDARDS.md` (TypeScript, React, naming, imports)
- [ ] I did not add fake/demo data
- [ ] I did not add fake users, fake workouts, fake stats, or fake analytics
- [ ] I did not add unfinished product claims
- [ ] I did not introduce raw video upload or privacy-risky behavior
- [ ] I ran `pnpm format:check`
- [ ] I ran `pnpm lint`
- [ ] I ran `pnpm typecheck`
- [ ] I ran `pnpm build`
- [ ] I updated docs (`README.md`, `docs/SETUP.md`, `docs/ARCHITECTURE.md`, `docs/CODING_STANDARDS.md`, `docs/REPOSITORY_STANDARDS.md`, etc.) if behavior or setup changed
