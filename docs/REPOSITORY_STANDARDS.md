# Motionly — Repository Standards

This document defines the repository hygiene, commit standards, and branching guidance for Motionly. It corresponds to **Phase 3 — Git Repository & Branching Strategy Setup** of [`MOTIONLY_MASTER_PLAN.md`](../MOTIONLY_MASTER_PLAN.md).

It is intentionally lightweight: it codifies what is actually being done today (solo developer, direct-on-main) and documents the heavier workflow we'll adopt when collaboration or production deployment begins.

---

## 1. Current Workflow (Solo, Direct-on-Main)

Until there is a second contributor or a deployed environment, the workflow is deliberately minimal:

- The solo developer may commit directly to `main`.
- No `develop` branch yet.
- No feature branches yet.
- No mandatory PR reviews yet (the PR template at `.github/PULL_REQUEST_TEMPLATE.md` is in place for when reviews start).
- Commits should be **small, scoped to a single phase**, and follow Conventional Commits (see §3).
- Run the pre-commit checklist (see §5) before every push.

This is a conscious trade-off: heavy workflow overhead on a one-person, no-CI repo slows things down without protecting anything real. It will be upgraded the moment that changes (see §2).

---

## 2. Future Workflow (Adopted When Collaboration / Deployment Begins)

When any of the following becomes true — a second active contributor, a deployed staging or production environment, or CI being wired up — switch to the workflow from `MOTIONLY_MASTER_PLAN.md` Phase 3:

### Branches

| Branch | Purpose | Auto-deploy target (when configured) |
|---|---|---|
| `main` | Production releases | motionly.app (future) |
| `develop` | Integration / staging | staging.motionly.app (future) |
| `feature/phase-XX-description` | Phase-scoped feature work | — |
| `fix/issue-description` | Bug fixes | — |

### Rules

- Open a pull request into `develop` (or `main` if no staging branch yet exists).
- Keep PRs small — one phase deliverable, or one fix, per PR.
- Use the PR template at [`.github/PULL_REQUEST_TEMPLATE.md`](../.github/PULL_REQUEST_TEMPLATE.md).
- Squash-merge by default; preserve a clean linear history on `main`.
- Delete branches after merge.

---

## 3. Conventional Commit Standard

All commits follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <short imperative summary>

[optional body]

[optional footer(s)]
```

### Allowed types

| Type | When to use |
|---|---|
| `feat` | A user-visible feature or capability |
| `fix` | A bug fix |
| `docs` | Documentation-only changes |
| `style` | Whitespace, formatting, missing semicolons — no logic change |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test` | Adding or correcting tests |
| `chore` | Tooling, config, dependency, repo hygiene |

### Examples of good Motionly commit messages

```
docs: add setup guide for Phase 1
feat: initialize PWA shell for Phase 2
chore: add repository standards for Phase 3
fix: correct service worker registration path
refactor: extract Vite PWA options into named constants
```

### Rules of thumb

- Keep the summary under ~72 characters.
- Use imperative mood ("add", not "added" or "adds").
- One logical change per commit. If you find yourself writing "and" in the summary, split the commit.
- Reference the phase number in the body when it adds clarity (e.g., "Phase 2 — PWA Foundation").

---

## 4. Branching Naming Conventions (For Future Use)

Once feature branches are in play:

- `feature/phase-04-folder-structure`
- `feature/phase-05-design-tokens`
- `fix/sw-stale-cache`
- `chore/upgrade-vite-6`
- `docs/architecture-overview`

Avoid personal prefixes (`rudra/...`) and ticket numbers without context — phase- or behavior-based names age much better.

---

## 5. Pre-Commit Checklist

Run these locally before every push (no Git hook enforces this yet — that lands in a later phase along with Husky):

1. **`pnpm typecheck`** — strict TypeScript must pass.
2. **`pnpm build`** — production build (`tsc -b && vite build`) must succeed.
3. **No fake/demo data** — no fake users, workouts, stats, AI scores, streaks, analytics, screenshots, or feature claims that aren't implemented.
4. **Phase scope** — the change belongs to the current phase of `MOTIONLY_MASTER_PLAN.md`. Out-of-phase work moves to its own commit/PR.
5. **Documentation accuracy** — if behavior, setup, or scripts changed, `README.md` / `docs/SETUP.md` / this file is updated to match. Honesty about what does and does not exist is non-negotiable.

---

## 6. GitHub Branch Protection (Recommended When Ready)

These settings are **deferred** until either (a) collaborators join, or (b) CI is wired up. Configuring them now would only slow the solo workflow without protecting anything real.

When you enable branch protection on `main` in the GitHub UI, configure at least:

- **Require a pull request before merging** (with at least 1 approving review).
- **Require status checks to pass before merging** — once CI exists, list the typecheck/build jobs as required checks.
- **Require branches to be up to date before merging** — prevents stale merges once multiple PRs are flowing.
- **Restrict force pushes** to `main` (and `develop` once it exists).
- **Restrict deletions** of `main` and `develop`.
- Optionally: **Require linear history** if you commit to squash-merge.

These need to be configured manually in the GitHub UI (Settings → Branches → Branch protection rules); they cannot be set from this repository.

---

## 7. Continuous Integration

Motionly does **not** ship a GitHub Actions workflow yet. Adding a half-finished CI workflow now would create the false impression that quality gates exist when they don't.

When CI is added in a later phase, the workflow should at minimum run:

- `pnpm install` (with frozen lockfile)
- `pnpm typecheck`
- `pnpm build`

Once that workflow exists and is green on `main`, mark those jobs as required status checks in branch protection (see §6).

Until then, the pre-commit checklist in §5 is the only gate, and the solo developer is responsible for it.

---

## 8. What This Document Is Not

- Not a coding-standards document. Naming, component patterns, ESLint/Prettier config, and Husky hooks land in **Phase 4 — Project Folder Structure & Architecture Standards** (see `MOTIONLY_MASTER_PLAN.md`).
- Not an architecture document. That arrives as `docs/ARCHITECTURE.md` in Phase 4.
- Not a deployment runbook. Production deployment, staging, and tunneling for PWA install testing are covered in their own phases.

Keep this file focused on **repository hygiene, commit standards, and branching** so it stays short and useful.
