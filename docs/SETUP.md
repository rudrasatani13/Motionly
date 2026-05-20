# Motionly — Development Environment Setup

This guide gets a new developer from a fresh machine to a ready Motionly development environment in about 10 minutes. It originated with **Phase 1 — Development Environment Setup** of `MOTIONLY_MASTER_PLAN.md` and now also covers the operational guide for the PWA foundation delivered in Phase 2.

---

## 1. Project Context

Motionly is a **PWA-first** fitness app.

- Stack: **Vite + React + TypeScript + Tailwind CSS**, installable as a Progressive Web App.
- Primary device target: **Android Chrome** on a real phone.
- Secondary targets: desktop Chrome / Edge for development and DevTools.
- Repository status: the initial environment setup (Phase 1), PWA foundation (Phase 2), repository standards (Phase 3), architecture standards (Phase 4), and design-system foundation (Phase 5) phases are complete. Follow `MOTIONLY_MASTER_PLAN.md` for whichever phase is currently active.
- The app is still early-stage: it contains only the PWA foundation and an honest app shell. Features such as camera coaching, pose estimation, workout plans, auth, payments, and backend sync are introduced in their own later phases and are not present unless those phases have been completed.

**You do not need any of the following:**

- Android Studio
- Xcode
- Android or iOS emulators
- Native mobile SDKs
- Java / JDK

If a tutorial tells you to install any of those for Motionly, ignore it. Motionly runs entirely in the browser.

---

## 2. Required Tooling

| Tool                     | Purpose                                           | Notes                                                      |
| ------------------------ | ------------------------------------------------- | ---------------------------------------------------------- |
| Node.js LTS **v20+**     | JavaScript runtime for Vite, scripts, tooling     | Use the version pinned in `.nvmrc`                         |
| pnpm                     | Fast, disk-efficient package manager              | Required — `npm` and `yarn` are not used in this project   |
| VS Code                  | Editor with first-class TS/React/Tailwind support | Any editor works, but examples assume VS Code              |
| Chrome or Edge (latest)  | Primary development browser, DevTools, Lighthouse | Used for performance profiling and remote device debugging |
| A physical Android phone | Real-device testing over LAN                      | Required — no emulator is used                             |

Total expected tooling disk footprint: under 3 GB.

---

## 3. Node.js Setup

Motionly pins its Node version in `.nvmrc` at the repo root. Use a Node version manager so every developer is on the same version.

### Option A — nvm (macOS / Linux / WSL)

Install nvm: https://github.com/nvm-sh/nvm

```bash
cd Motionly
nvm install        # reads .nvmrc and installs that version
nvm use            # switches the current shell to it
node --version     # should match the version in .nvmrc
```

### Option B — fnm (faster, cross-platform)

Install fnm: https://github.com/Schniz/fnm

```bash
cd Motionly
fnm install        # reads .nvmrc
fnm use
node --version
```

### Option C — Volta

Install Volta: https://volta.sh

```bash
cd Motionly
volta install node@$(cat .nvmrc)
node --version
```

If `node --version` does not show v20 or newer, stop and resolve this before continuing.

---

## 4. pnpm Setup

Install pnpm using Corepack (ships with Node) — this is the recommended approach:

```bash
corepack enable
corepack prepare pnpm@latest --activate
pnpm --version
```

Alternatively, install pnpm standalone: https://pnpm.io/installation

Verify:

```bash
pnpm --version    # should print a version (e.g. 9.x or newer)
which pnpm        # should resolve to a real path
```

If you see `command not found: pnpm` after enabling Corepack, restart your shell.

---

## 5. VS Code Setup

Install VS Code: https://code.visualstudio.com

Install these extensions:

- **ESLint** (`dbaeumer.vscode-eslint`) — surface lint errors inline
- **Prettier — Code formatter** (`esbenp.prettier-vscode`) — formatting on save
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`) — Tailwind class autocompletion (used from Phase 5 onward)
- **GitLens** (`eamodio.gitlens`) — git blame, history, inline annotations
- **Todo Tree** (`Gruntfuggly.todo-tree`) — scans the workspace for `TODO` / `FIXME` markers
- **Vitest** (`vitest.explorer`) — test runner integration (used from later phases)

Recommended settings (workspace-level can be added in Phase 2 alongside the app):

- Format on save: on
- Default formatter: Prettier
- ESLint: enabled

---

## 6. Browser & DevTools

Install a current version of Chrome or Edge.

You will use these DevTools features routinely during development:

- **Lighthouse** — PWA, performance, accessibility, best-practices audits
- **Performance panel** — frame timing, jank detection, main-thread profiling
- **Web Vitals** — LCP, INP, CLS measurements (use the Web Vitals extension if you prefer an HUD)
- **Application panel** — service workers, manifest, storage (relevant from Phase 2)
- **Remote devices** (`chrome://inspect`) — debug Chrome on Android from your laptop

Keep the browser updated. Outdated builds will mask real-device behavior.

---

## 7. Real-Phone LAN Testing

Motionly is developed against a real Android phone, not an emulator. The dev server (added in Phase 2) binds to your laptop's LAN address; your phone opens it over Wi-Fi.

### One-time setup

1. Connect your laptop and phone to the **same Wi-Fi network**.
   - Phone must not be on cellular data.
   - Both must be on the same SSID (not the 2.4 GHz vs 5 GHz split of the same router if isolation is enabled).
2. Disable any "client isolation" or "AP isolation" settings on the Wi-Fi network if present.
3. Ensure your laptop firewall permits inbound connections on the dev server port (typically 5173).

### Running the dev server (Phase 2+)

> The commands below depend on the Vite app existing. They will be available **after Phase 2** scaffolds the project.

```bash
pnpm install
pnpm dev --host          # binds to 0.0.0.0 so the LAN can reach it
```

Vite will print two URLs, for example:

```
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.42:5173/
```

The **Network** URL is what you open on the phone. Expected format: `http://<laptop-LAN-IP>:5173/`. The exact IP differs per network — common ranges are `192.168.x.x`, `10.x.x.x`, or `172.16–31.x.x`.

### Remote debugging Android Chrome (Phase 2+)

This gives you full DevTools (console, network, performance) for the page running on your phone:

1. On the phone: enable **Developer Options** (tap Build Number 7 times in Settings → About Phone).
2. Enable **USB debugging** inside Developer Options.
3. Connect the phone to your laptop via USB.
4. Accept the "Allow USB debugging" prompt on the phone.
5. On the laptop, open Chrome and visit `chrome://inspect/#devices`.
6. Your phone should appear under "Remote Target". Click **inspect** next to the Motionly tab.

You can keep using the LAN URL on the phone for the actual session; USB is only the debugging channel.

---

## 8. Troubleshooting

### Phone cannot open the LAN URL

- Confirm both devices are on the same Wi-Fi SSID.
- Confirm the dev server was started with `--host` (otherwise it binds to `localhost` only and the LAN cannot reach it).
- Try pinging the laptop IP from another device on the network. If ping fails, the network has client isolation enabled — switch to a different network or your phone's hotspot.

### Firewall or VPN is blocking the connection

- macOS: System Settings → Network → Firewall → allow incoming connections for Node.
- Windows: Windows Defender Firewall → allow Node.js through private networks.
- Disable any active VPN on the laptop — VPNs frequently route LAN traffic away from the local network and break dev server access.

### Wrong Wi-Fi network

- Some routers expose a separate guest network and a main network. Devices on the guest network usually cannot reach devices on the main network. Put both on the same one.

### Dev server is bound only to localhost

- Vite without `--host` binds to `127.0.0.1` and is not reachable from the LAN.
- Use `pnpm dev --host` or set `server.host: true` in `vite.config.ts` once Phase 2 lands.

### `chrome://inspect` does not show the device

- USB debugging is not enabled on the phone, or the "Allow USB debugging" prompt was dismissed — reconnect the cable and accept it.
- The USB cable is charge-only. Try a different cable.
- On macOS, make sure no other tool (e.g. scrcpy, vendor sync software) is holding the ADB connection.
- Open `chrome://inspect` and toggle "Discover USB devices" off and on.

### `pnpm: command not found`

- Run `corepack enable` and restart the shell.
- If Corepack itself is missing, your Node install is too old — re-run `nvm install` / `fnm install`.

### Node version mismatch

- `node --version` does not match `.nvmrc`: run `nvm use` (or `fnm use`) from the repo root. Some shells require `nvm use` per new terminal — consider an nvm shell hook.

---

## 9. Success Criteria

Before considering your environment ready, confirm:

- [ ] `node --version` reports v20 or newer and matches `.nvmrc`
- [ ] `pnpm --version` prints a version
- [ ] VS Code is installed with the extensions listed in §5
- [ ] Latest Chrome or Edge is installed
- [ ] A physical Android phone is available and on the same Wi-Fi as the laptop
- [ ] You can navigate `chrome://inspect/#devices` (verifies remote debugging is at least reachable; the device list will populate once Phase 2 is running)

Once **Phase 2** completes and the Vite app exists:

- [ ] `pnpm dev --host` starts the dev server quickly
- [ ] The Network URL printed by Vite loads on the phone's browser with hot reload working

---

## 10. What's Next

Phase 1 is complete when the checklist above passes on your machine.

Phase 2 (next) scaffolds the Vite + React + TypeScript app, configures PWA support, and adds the initial app shell. Do not pre-create app code, components, screens, routes, or backend integrations — those each belong to their own phase in `MOTIONLY_MASTER_PLAN.md`.

---

# Phase 2 — Running the App

Phase 2 has been completed: the repository is now a Vite + React + TypeScript Progressive Web App with strict TypeScript, absolute imports, and an installable PWA shell. The sections below are the operational guide for working with that app.

## 11. Installing Dependencies

From the repository root:

```bash
nvm use           # match the Node version pinned in .nvmrc
pnpm install
```

`pnpm install` reads `pnpm-workspace.yaml` and allows the `esbuild` postinstall script (required for Vite). No other package builds are allowed by default.

## 12. Running the Dev Server (Desktop)

```bash
pnpm dev
```

Vite starts on http://localhost:5173. The dev script passes `--host` so the server also binds to your LAN IP. The terminal prints both URLs:

```
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

If you want a strictly local-only dev server (no LAN exposure), use:

```bash
pnpm dev:local
```

## 13. Running on a Physical Phone (LAN)

1. Confirm both laptop and phone are on the same Wi-Fi network (see §7 for prerequisites).
2. Start `pnpm dev`.
3. On the phone, open Chrome and navigate to the **Network** URL printed by Vite (e.g. `http://192.168.x.x:5173/`).
4. The Motionly app shell should load with hot reload working — editing `src/App.tsx` updates the page on the phone within a second.

If the phone cannot reach the URL, revisit §8 (Troubleshooting).

> Note: PWA installation prompts and the service worker only run against the **production build**, not the dev server. Use `pnpm build && pnpm preview` for install / offline testing — see §15.

## 14. Building for Production

```bash
pnpm build
```

This runs the TypeScript project build (`tsc -b`), then `vite build`. Output lands in `dist/`, including:

- `dist/index.html` — entry HTML
- `dist/assets/*` — hashed JS and CSS bundles
- `dist/manifest.webmanifest` — PWA manifest
- `dist/sw.js` + `dist/workbox-*.js` — generated service worker and Workbox runtime
- `dist/favicon.svg`, `dist/favicon.ico`, `dist/favicon-96x96.png`, `dist/apple-touch-icon.png`,
  `dist/web-app-manifest-192x192.png`, `dist/web-app-manifest-512x512.png` — brand icons
- `dist/registerSW.js` — service worker registration helper

If the build prints TypeScript errors, fix them before continuing — strict mode is enabled and `tsc -b` blocks the Vite build on failure.

## 15. Previewing the Production Build

```bash
pnpm preview
```

This serves the `dist/` output on http://localhost:4173 (and your LAN IP, since `preview --host` is set). Use this URL when:

- Installing the PWA on Android Chrome (the install icon does **not** appear on the dev server).
- Testing service-worker behavior and offline caching.
- Running Lighthouse PWA audits.

> Why preview and not dev? `vite-plugin-pwa` is configured with `devOptions.enabled: false`, so the service worker is only generated and registered in the production build. This is intentional — running an SW in dev causes confusing stale-asset behavior during hot reload.

## 16. Type Checking

```bash
pnpm typecheck
```

Runs `tsc -b --noEmit` against both `tsconfig.app.json` (app source) and `tsconfig.node.json` (Vite config). Use it as a fast pre-commit check — `pnpm build` runs the same checks plus the actual bundle.

## 16a. Lint, Format, Pre-commit (Phase 4)

Phase 4 wired up ESLint + Prettier and a Husky pre-commit hook.

```bash
pnpm lint           # ESLint over src/ + tooling files
pnpm lint:fix       # ESLint with safe --fix
pnpm format         # Prettier write across the repo
pnpm format:check   # Prettier check only (no writes)
```

The pre-commit hook at `.husky/pre-commit` runs three steps and blocks the commit if any fail:

1. `pnpm format:check`
2. `pnpm lint`
3. `pnpm typecheck`

`pnpm build` is **not** run on every commit (too slow). Run it manually before pushing:

```bash
pnpm build
```

If you must bypass the hook (emergency commits only), `git commit --no-verify` works, but treat that as a code-smell — the next commit should restore green.

The full repo-wide rule set is documented in:

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — folder layout, layering, platform-adapter pattern, privacy architecture.
- [`CODING_STANDARDS.md`](./CODING_STANDARDS.md) — TypeScript, React, hook, service, ML, styling, naming, and import rules.

## 16b. Tailwind and Theme Foundation (Phase 5)

Tailwind runs through Vite's normal CSS pipeline via `postcss.config.js`; there is no separate Tailwind command to run. `src/index.css` contains the Tailwind directives plus minimal global base styles, and `tailwind.config.ts` is the source of truth for Motionly brand colors, neutral colors, font families, and typography utilities.

Fonts are loaded in `src/main.tsx` with `@fontsource-variable/inter` and `@fontsource/noto-sans-devanagari`. The Devanagari font is present now for future Hindi/Hinglish readiness, but no translations or i18n runtime exist yet.

`ThemeProvider` wraps the React root and persists the user's `light` / `dark` / `system` preference in `localStorage`. It applies Tailwind's class-based dark mode by toggling `dark` on `document.documentElement`; no settings screen or product theme toggle exists yet.

## 16c. Routing Validation (Phase 6)

Phase 6 introduced React Router 6 and a routing skeleton. Each route renders an honest placeholder that names the future phase that will build the real screen — no fake users, workouts, stats, or AI feedback.

After `pnpm install`, validate the routing skeleton in both `pnpm dev` and `pnpm preview`:

### Routes to open manually

| URL                                | Expectation                                                   |
| ---------------------------------- | ------------------------------------------------------------- |
| `/`                                | Phase 13 dashboard with bottom tab bar; "Home" active.        |
| `/workouts`                        | Phase 14 Workout Library; "Workouts" active.                  |
| `/workouts/lower-body-foundations` | Phase 15 Workout Detail / Pre-Workout screen.                 |
| `/workouts/not-real-id`            | Phase 15 Workout Detail not-found state.                      |
| `/workout/test-id/setup`           | Camera Setup placeholder.                                     |
| `/workout/test-id/active`          | Active Workout placeholder.                                   |
| `/workout/test-id/summary`         | Workout Summary placeholder.                                  |
| `/progress`                        | Progress placeholder; "Progress" tab active.                  |
| `/profile`                         | Profile placeholder; "Profile" tab active.                    |
| `/welcome`, `/onboarding`          | Phase 11 onboarding entry and screens 1–3; no bottom tab bar. |
| `/login`, `/register`              | Auth-layout placeholders; no bottom tab bar.                  |
| `/paywall`, `/permissions`         | Modal-style placeholders; no bottom tab bar.                  |
| `/some-unknown-route`              | 404 page with a "Back to Home" link.                          |

`not-real-id` is an example URL string only — there is no fake workout data behind it.

### Direct URL and browser controls

- Refreshing the browser on any of the routes above should re-render the same route. (`pnpm dev` and `pnpm preview` both serve `index.html` for unknown paths, so SPA fallback works locally. Production deployments will need their own SPA-fallback config when that phase lands.)
- Browser back / forward should walk through the navigation history correctly.
- Android Chrome back button (real-device LAN testing) should match desktop behavior.
- The bottom tab bar remains visible on main routes and no PWA status pill overlaps page content.
- Light / dark theme behavior continues to work because `ThemeProvider` still wraps the router in `src/main.tsx`.

### Bundle splitting

After `pnpm build`, inspect `dist/assets/` — there should be one chunk per lazy-loaded page. Confirm in DevTools → Network that navigating to a previously unvisited route fetches its dedicated chunk.

## 16d. UX Documentation Reference (Phase 7)

Phase 7 added planning documentation only — no runtime code changes. Use it as the design source when implementing screens in later phases.

- **Wireframes:** [`./wireframes/`](./wireframes/) — one markdown file per planned screen, plus `00-design-principles.md` and `flow-diagrams.md` (Mermaid renderings of the five core flows).
- **User flows:** [`./USER_FLOWS.md`](./USER_FLOWS.md) — narrative journeys for first-time user, returning user, subscription conversion, camera permission failure, and low-confidence AI.

No additional commands are required for Phase 7. The normal documentation, lint, and format checks already cover Markdown:

```bash
pnpm format:check    # Prettier verifies Markdown
pnpm lint            # ESLint over src + tooling files (Markdown not linted)
pnpm typecheck       # No-op for docs; still part of pre-commit
pnpm build           # Sanity check that nothing in src/ broke
```

GitHub renders the Mermaid diagrams in `wireframes/flow-diagrams.md` inline. To iterate on a diagram visually, copy a single block into [mermaid.live](https://mermaid.live).

## 16e. Primitive Component Library (Phase 8)

Phase 8 added Motionly's reusable UI primitives under `src/components/primitives/`. The full inventory, accessibility rules, and the components intentionally deferred to Phase 9 are documented in [`./COMPONENTS.md`](./COMPONENTS.md).

No new commands are required for Phase 8 beyond the existing checks:

```bash
pnpm format:check    # Prettier verifies the new files
pnpm lint            # ESLint surfaces unused vars / a11y issues
pnpm typecheck       # Strict TS over the new primitives
pnpm build           # Confirms the primitives bundle cleanly
```

Two new dependencies were added: `clsx` (used through `@utils/cn`) and `lucide-react` (wrapped by `<Icon>`). No other package was introduced — the Phase 9 toast/progress libraries and any animation library land in their own phases.

## 16f. Feedback & Status Component Library (Phase 9)

Phase 9 added Motionly's feedback / status / progress components under `src/components/feedback/`. The full inventory, accessibility rules, and the data ownership rules are documented in [`./COMPONENTS.md`](./COMPONENTS.md) §8.

No new commands are required for Phase 9 beyond the existing checks:

```bash
pnpm format:check    # Prettier verifies the new files
pnpm lint            # ESLint surfaces unused vars / a11y issues
pnpm typecheck       # Strict TS over the new components
pnpm build           # Confirms the components bundle cleanly
```

One new dependency was added: `framer-motion` (drives the score-ring sweep, cue-card slide / fade, rep-counter pulse, toast and confidence-banner transitions, all gated by `prefers-reduced-motion`). The toast system is an in-house Motionly queue — no `react-hot-toast` or similar third-party dependency was added. Phase 44 Web Push notifications remain unimplemented.

## 16g. Launch Experience (Phase 10)

Phase 10 added the splash + launch orchestration layer. No new dependencies were introduced. The same checks apply:

```bash
pnpm format:check    # Prettier verifies the new files
pnpm lint            # ESLint surfaces unused vars / a11y issues
pnpm typecheck       # Strict TS over the launch layer
pnpm build           # Confirms the launch + SW prompt bundle cleanly
```

### Dev launch behavior (`pnpm dev`)

1. `pnpm dev` — open the printed URL.
2. On the first paint, the inline pre-React HTML splash should appear on a dark `#0A0A0F` canvas with the **Motionly** wordmark and **Move Better.** tagline. This must paint without a white flash on any system theme (light or dark).
3. As soon as React hydrates, the React `<LaunchScreen>` takes over on the same dark canvas. The wordmark scales `0.9 → 1.0` with a fade-in; the tagline fades in ~200ms after. Total visible launch ≈ 1.8s.
4. After the launch window:
   - At `/` (root) on a fresh profile, the URL is rewritten to `/welcome` because no real onboarding completion exists yet. After onboarding is completed locally, `/` remains Home and the Phase 13 dashboard renders.
   - At a direct deep link (`/welcome`, `/login`, `/onboarding`, `/workouts`, `/workout/test-id/setup`, `/some-unknown-route`, …), the launch screen still shows for ≈ 1.8s and then the same deep link renders. No redirect is applied.
5. Phase 6 routing, the bottom tab bar on main routes, and light / dark theme switching must continue to behave as documented in §16c.

### Reduced motion check

In the browser DevTools' **Rendering** panel, set "Emulate CSS media feature `prefers-reduced-motion`" to `reduce`. Reload. The React launch screen should drop the wordmark scale animation; both wordmark and tagline should appear via a minimal opacity fade. The total launch duration stays ~1.8s.

### Production preview launch behavior (`pnpm build && pnpm preview`)

1. `pnpm build && pnpm preview` — open http://localhost:4173/.
2. Same launch sequence as dev: HTML splash → React `<LaunchScreen>` → destination route.
3. Confirm DevTools → Application → Service workers shows `sw.js` activated (per §17).
4. Theme switching, PWA install, and offline reload must continue to work as documented in §16b, §17, §18.

### Service worker update prompt (production only)

The SW update prompt is wired through the Phase 9 toast system via `useServiceWorkerUpdatePrompt()`. The hook listens for the `motionly:sw` `update-available` custom event dispatched from `src/sw-register.ts` and shows a sticky toast with title "Update available", message "Refresh to use the latest version.", and a "Refresh" action that calls `window.location.reload()`. Toasts only auto-dismiss when the user taps Refresh or the close button — no auto reload.

Because the prompt only fires in production (`import.meta.env.PROD` + `sw-register` only registers in prod builds), the smoke test requires `pnpm build && pnpm preview`:

1. `pnpm build && pnpm preview` — open http://localhost:4173/ once and let the service worker activate (Application → Service workers in DevTools).
2. Keep the preview tab open.
3. In a second terminal, change something trivial in `src/` (e.g. flip a string in a placeholder page).
4. Run `pnpm build && pnpm preview` again. The second `vite build` produces a fresh `sw.js` and bumps the precache manifest.
5. Switch back to the first browser tab. Within a few seconds Workbox detects the new SW and fires the `waiting` event; the toast "Update available — Refresh to use the latest version." appears with a Refresh action.
6. Tapping Refresh reloads the tab and activates the new SW. Tapping the close button leaves the current build running until the next manual reload.

The prompt does **not** fire in `pnpm dev` because no service worker registers there. The prompt is unrelated to Phase 44 Web Push notifications.

### Android Chrome launch timing check

On a physical Android phone over LAN (`pnpm dev`) or a tunneled preview build:

1. Open the URL with the page already cleared from recent apps so the launch is cold.
2. Visually confirm the inline HTML splash paints within the first frame (no white flash on either light or dark system theme).
3. Confirm the React launch screen takes over without a visible re-paint of the background.
4. Confirm total launch-to-destination duration is around 1.8s and within the master plan's 2s mid-range target.
5. Confirm bottom safe-area inset is respected (no content under the nav handle on gesture-bar devices).

## 16h. Onboarding Screens 1–3 Manual QA (Phase 11)

Phase 11 adds one dependency, `zustand`, and uses it only for an in-memory onboarding draft. The same command checks apply:

```bash
pnpm install
pnpm format:check
pnpm lint
pnpm typecheck
pnpm build
pnpm dev
```

Manual checks:

- Open `/`. After the Phase 10 splash, the app should land on `/welcome`.
- Open `/welcome`. Confirm the Motionly brand, "Move Better.", honest intro copy, "Get Started" CTA, and "Already have an account? Sign in" link render without fake account state.
- Tap "Get Started". It should navigate to `/onboarding` and render step 1.
- On `/onboarding`, step 1 should show the welcome headline, visible privacy copy, five progress dots, `1 / 5`, and a primary CTA.
- Step 1 Continue should move to step 2. Step 2 Continue must stay disabled until at least one goal is selected.
- Select multiple goals, go back to step 1, then continue again. The selected goals should still be selected.
- Step 3 Continue must stay disabled until one fitness level is selected. Selecting a second level should replace the first.
- Step 3 back should return to step 2 with all goal selections preserved.
- Step 3 Continue should now navigate to step 4 (Limitations) — see §16i for Phase 12 manual QA. It should never navigate home, fake completion, or request camera permission directly from step 3.
- Refresh behavior is intentionally local: Phase 11 selections may reset after a full browser refresh because persistence is not implemented yet.
- Check 5.0-inch and 6.7-inch mobile viewport sizes. Text should not overlap, and the primary CTA should remain reachable.
- Check keyboard navigation: back button, progress-back dots, goal cards, fitness cards, CTA, and sign-in link should all be reachable with visible focus.
- Check reduced motion in DevTools. Step transitions should become instant or softened.
- Check light and dark themes. All selected states must be visible without relying on color alone.
- Confirm no fake users, workouts, stats, AI feedback, Supabase/auth/camera/ML code, `localStorage`, or IndexedDB writes were added.

## 16i. Onboarding Screens 4–5 + Completion Manual QA (Phase 12)

Phase 12 completes onboarding with the limitations screen, the camera tutorial / permission primer, and the IndexedDB completion write. No new dependencies are added.

```bash
pnpm install
pnpm format:check
pnpm lint
pnpm typecheck
pnpm build
pnpm dev
```

Manual checks (use Chrome DevTools → Application → Storage → Clear site data before starting):

- Open `/`. After the Phase 10 splash, the app should land on `/welcome` (no real `hasOnboarded` flag exists yet).
- Tap "Get Started" and complete steps 1–3 (welcome, goals, fitness level) as in §16h.
- **Step 4 — Limitations:**
  - Heading reads "Anything we should work around?" with supporting copy.
  - Chips: Lower back, Knees, Shoulders, Hips, Ankles, Wrists, None.
  - Continue must stay disabled until at least one chip — including "None" — is selected.
  - Select multiple specific limitations; verify each chip shows the pressed state (border + tone change, not color alone).
  - Tap "None"; verify all other limitations clear and only "None" remains selected.
  - Tap a specific limitation again; verify "None" clears.
  - Type an optional note up to 120 characters; verify the live counter, that input is capped at 120 chars (extra keystrokes are ignored), and that the safety helper text ("If something hurts during a workout, stop. Motionly is a coach, not medical care.") is visible.
  - Tab through chips and the note field — focus rings must be visible.
- **Step 5 — Camera Tutorial / Permission Primer:**
  - Heading reads "Set up your camera safely." with explainer copy clarifying that video is processed on device, never uploaded, and that permission can be changed in browser settings.
  - Exactly three setup points: "Place your phone 2–3 meters away", "Make sure your full body is visible", "Good lighting = better coaching".
  - On step entry, no browser camera prompt fires — the page never auto-requests permission.
  - The primary CTA reads "Allow camera access". Tap it. The browser permission prompt should appear; the button shows a loading state until it resolves.
  - **Granted path:** Accept the prompt. The status message switches to a success tone, IndexedDB receives `hasOnboarded = true` plus a completion record, and the app navigates to Home `/`. Inspect DevTools → Application → IndexedDB → `motionly` → `onboarding` to confirm `hasOnboarded === true` and a `completion` record exists. Confirm the camera indicator (browser tab / system) turns off immediately — Phase 12 stops every track.
  - **Denied path:** Reload, restart the flow, deny the prompt. A warning status appears with retry guidance. The CTA relabels to "Try again". "Continue without camera for now" appears as a secondary action; tapping it writes the completion record (with `cameraPermissionGranted: false`) and navigates Home without claiming the camera was granted.
  - **Unavailable / error path (if practical):** In Chrome DevTools, disable the camera device or load over a non-secure host (e.g. an IP without HTTPS) — the warning explains the situation and "Continue without camera for now" is offered.
- **Persistence check:** After completing onboarding, reload `/`. The launch gate should now route to Home `/` (the Phase 13 dashboard), NOT `/welcome`.
- **Reset check:** Clear site data again. Reload `/`. The launch gate should once again route to `/welcome`.
- **Android Chrome on a real phone (LAN URL printed by `pnpm dev`):** confirm the permission prompt copy is understandable, denial guidance is reasonable, and the "Continue without camera for now" path completes without fake "camera ready" messaging.
- **HTTPS / localhost secure context:** Camera permission only works on `https://` or `http://localhost`. On a plain `http://<ip>` URL the adapter resolves `unavailable` with the insecure-context explainer — verify this rather than treating it as a bug.
- Check reduced motion in DevTools. The camera tutorial card entrance animations should become instant.
- Check light and dark themes. All selected states, status banners, and CTAs must be visible without relying on color alone.
- Confirm no fake users, fake sessions, fake workouts, fake stats, fake AI feedback, no live camera preview, and no skeleton overlay were added.

## 16j. Home / Dashboard Manual QA (Phase 13)

Phase 13 adds the real Home / Dashboard screen, local onboarding completion reads, and honest empty states.

```bash
pnpm install
pnpm format:check
pnpm lint
pnpm typecheck
pnpm build
pnpm dev
```

Manual checks (use Chrome DevTools → Application → Storage → Clear site data before starting):

- Open `/`. After the Phase 10 splash, the app should land on `/welcome` on a fresh profile.
- Complete onboarding.
- Verify the app returns to `/` and renders the Phase 13 dashboard.
- Confirm the header greeting uses local time and does not show a fake user name.
- Confirm the date renders in the browser locale.
- Confirm the Today&apos;s Workout card does not show a fake workout name, duration, or exercise count.
- Confirm the Explore workouts CTA routes to `/workouts`.
- Confirm the quick-start card does not create a fake workout ID or navigate to setup / active workout routes.
- Confirm the progress summary shows honest unavailable copy rather than fake metrics.
- Confirm recent activity stays empty / unavailable rather than showing fake cards.
- Confirm no upgrade banner appears unless backed by real subscription state, which does not exist yet.
- Confirm the onboarding summary card reflects the real IndexedDB completion record: goals, fitness level, limitations, and camera permission.
- Confirm the refresh control re-reads the local dashboard data.
- Check 5.0-inch and 6.7-inch mobile viewport sizes.
- Check light and dark themes.
- Confirm the bottom tab bar remains reachable and unobstructed.
- Confirm no fake users, workouts, stats, streaks, subscriptions, or analytics were added.

## 16k. Workout Library Manual QA (Phase 14)

Phase 14 adds the real `/workouts` browsing surface — Workouts tab, Exercises tab, filters, search, locked-content treatment, and an in-page exercise quick-detail panel. No new dependencies.

```bash
pnpm install
pnpm format:check
pnpm lint
pnpm typecheck
pnpm build
pnpm dev
```

Manual checks (Chrome DevTools → Application → Clear site data first if you want a fresh profile):

- Complete onboarding so `/` opens the Phase 13 dashboard.
- Tap the dashboard **Explore workouts** CTA. `/workouts` should now render the real library, NOT the Phase 6 placeholder.
- Confirm the page has a single `h1` (**Workout Library**) and a "Catalog" badge — no claims that AI coaching is live.
- Verify the **Workouts** tab is selected by default.
- Switch to the **Exercises** tab using the tab control, then switch back. Confirm the selected tab is announced (`aria-selected`) and uses both a color and an underline indicator.
- Use the keyboard: focus the tablist and press **Arrow Right / Arrow Left** to move between tabs. **Home / End** should jump to the first / last tab.

### Workouts tab

- Tap each filter chip in turn: **All**, **Beginner**, **Intermediate**, **Quick ≤15min**, **Strength**, **Mobility**. The list should update visibly in under 200ms.
- Pick a free workout card and tap **View details**. The app should navigate to `/workouts/:id` (Phase 15 placeholder).
- Pick a locked (Pro) workout card and tap **View Pro details**. The app should show an honest "Paid plans are implemented in a later phase" toast and navigate to `/paywall`.
- Confirm locked cards stay visible — they should NEVER be hidden.
- Confirm no card launches camera setup, the active workout screen, or a fake "Start Workout" CTA.

### Exercises tab

- Type partial terms into the search input (e.g. `squ`, `plank`, `hip`). Results should narrow live with a short debounce; clearing the input restores the full list.
- Pick a muscle filter chip (Legs, Glutes, Core, etc.) and confirm the grid narrows.
- Pick a difficulty filter (Beginner / Intermediate / Advanced) and confirm narrowing again.
- Combine search + muscle + difficulty filters. With a combination that has no matches, the empty state should render with a clear title, description, and a **Clear filters** button. Tapping it should reset both filters and the search query.
- Tap **View exercise** on a free exercise. The in-page quick-detail panel should slide in showing target muscles, instructions, "What Motionly will coach later" (future capability copy), a camera placement summary, and a disabled "Add to workout" button with an honest "Custom workout builder arrives in a later phase." note.
- Press **Escape** with the panel open — it should close. The panel close button should also dismiss it.
- Tap **View Pro details** on a locked exercise. The app should show the same paywall toast and navigate to `/paywall`.

### Honest-content checks

- Confirm no fake completion counts, no ratings, no popularity, no calories, no form scores, no rep counts, no AI-generated results appear anywhere on the library.
- Confirm no "Start workout" button starts a session.
- Confirm no card claims AI coaching is live; cues use future-tense language.

### Layout and accessibility

- Resize the viewport to a 5.0-inch (≈ 360×640) and 6.7-inch (≈ 414×896) mobile profile in DevTools and confirm cards stack, the chip rows scroll horizontally when needed, and the bottom tab bar stays reachable and unobstructed.
- Toggle light and dark mode. Cards, locked badges, and the empty state should remain readable with the Motionly token palette.
- Confirm the dashboard still works (no regressions) and the bottom tab bar's "Workouts" entry routes to the real library.

---

## 16l. Workout Detail Manual QA (Phase 15)

Phase 15 adds the real `/workouts/:id` pre-workout screen. It uses the canonical static catalog and reads real Phase 12 onboarding limitations from IndexedDB. No new dependencies.

```bash
pnpm install
pnpm format:check
pnpm lint
pnpm typecheck
pnpm build
pnpm dev
```

Manual checks:

- Complete onboarding if site data is fresh, then open `/workouts`.
- Tap a free workout card's **View details** action. The app should navigate to `/workouts/:id` and render the real detail page, not a placeholder.
- Confirm the hero shows the selected workout name, description, access badge, duration, exercise count, difficulty, and equipment from the catalog.
- Confirm the meta row shows duration, exercise count, difficulty, and equipment. It must not show calories, ratings, popularity, completion counts, history, or form scores.
- Confirm **What you'll work** renders muscle chips from the detail data / exercise sequence.
- Confirm **In this session** is an ordered list and the rows match the detail sequence: order, exercise name, sets x reps or time, rest seconds, target muscles, notes, and future-tense coaching preview.
- Confirm **Coach's note** renders short safety / preparation copy and does not claim live camera or ML is active.
- Tap **Start workout** on a free workout. The app should navigate to `/workout/:id/setup`, which now renders the Phase 16 camera setup screen.
- Confirm no browser camera prompt appears until the user taps **Turn on camera** on the setup screen.
- Open `/workouts/not-real-id`. It should show **Workout not found** with a Back to Workout Library CTA.
- Tap a locked / Pro workout from the library, or open `/workouts/hip-mobility-flow`; the primary action should route to `/paywall` with honest placeholder behavior. It must not implement subscription state.
- Complete or update onboarding with a limitation such as knees or lower back, then open a conflicting workout such as `/workouts/lower-body-foundations` or `/workouts/quick-core-15`. A gentle limitation warning should appear.
- Complete or update onboarding with **None** selected, or clear site data and skip onboarding storage, then open the same workout. No personalized limitation warning should appear.
- Confirm no fake stats, fake workout history, fake ratings, fake calories, fake popularity, fake form scores, fake reps, fake subscriptions, or fake AI feedback appear anywhere on the detail screen.
- Toggle light and dark mode and confirm the page remains readable.
- Check 5.0-inch and 6.7-inch mobile viewport sizes. The sticky action area should stay above the bottom navigation, and the bottom tab bar must remain reachable.
- Confirm the dashboard and Workout Library still work after visiting detail, setup, not-found, and paywall placeholder routes.

---

## 16m. Camera Setup Manual QA (Phase 16)

Phase 16 replaces `/workout/:id/setup` with the real camera permission and setup screen. No new dependencies are added.

```bash
pnpm install
pnpm format:check
pnpm lint
pnpm typecheck
pnpm build
pnpm dev
```

Manual checks:

- Complete onboarding if needed, open `/workouts`, and choose a free workout detail.
- Tap **Start workout**. `/workout/:id/setup` should render the real setup screen, not the old placeholder.
- Confirm the page has one clear `h1`: **Set up your camera**.
- Confirm no browser camera prompt appears on page load.
- Confirm the privacy copy says the video stays on this device and Motionly does not upload or store the camera feed.
- Tap **Turn on camera**. The browser permission prompt should appear from a user gesture only.
- Grant permission. A live preview should appear in a `<video autoplay playsInline muted>` element, with a mirrored front-camera display.
- Confirm no microphone prompt appears.
- Confirm the silhouette/framing guide appears over the preview and says **Fit your full body inside the guide**.
- Confirm the guide does not show skeleton joints, landmark dots, body confidence, or body-detected copy.
- Confirm the lighting status starts checking and updates from the real video frame about every 500ms.
- Cover the camera or use a dim room if practical; the lighting state should report **Try moving to a brighter area**.
- Point toward a bright window if practical; the lighting state should report **Move away from bright windows behind you**.
- Confirm **Looks clear enough** appears only as an explicit manual override when the camera preview is active and lighting needs attention or cannot be read.
- Confirm **I'm lined up** is required before **Continue to workout** becomes enabled.
- Confirm the readiness checklist uses honest/manual items: Camera on, Lighting okay, Full body inside guide, Phone steady.
- Confirm **Play setup instruction** only speaks after tapping the button, or shows **Voice instruction unavailable on this browser** if unsupported.
- Tap **Continue to workout** after readiness passes. The setup stream should stop and the app should navigate to `/workout/:id/active`, which now renders the Phase 17 pose-debug shell.
- Navigate away/back during an active preview via **Back to workout details** and confirm the browser camera indicator turns off.
- Use **Continue without setup check** and confirm it routes to `/workout/:id/active` without claiming setup passed.
- Deny permission in the browser prompt and confirm clear retry/settings guidance appears with **Try again** and **Permissions help**.
- Test no-camera / unsupported path where practical by disabling the camera in browser/OS settings.
- Test insecure context behavior where practical. Camera access requires HTTPS or localhost; plain LAN HTTP may be unavailable depending on browser security.
- Confirm no fake body detection, fake confidence scores, fake reps, fake form scores, fake calories, fake ratings, fake users, subscriptions, analytics, uploads, recordings, screenshots, or frame persistence were added.
- Check light and dark mode.
- Check 5.0-inch and 6.7-inch mobile viewport sizes. Controls should stay reachable and not cover the bottom tab bar.
- Test Android Chrome on a real phone if available, especially camera prompt, live preview, cleanup, and performance.
- Test iOS Safari if available, especially `playsInline`, speech user-gesture behavior, and stream cleanup.

---

## 16n. MediaPipe Pose Landmarker Manual QA (Phase 17)

Phase 17 makes `/workout/:id/active` a minimal pose-debug shell that runs real MediaPipe Pose Landmarker inference. New dependency: `@mediapipe/tasks-vision`. New static assets: `public/models/pose_landmarker_lite.task`, `public/models/pose_landmarker_full.task`. New runtime asset: `/mediapipe-wasm/*` served by the `motionlyMediaPipeWasm` Vite plugin in dev and emitted into `dist/mediapipe-wasm/` at build.

- Run `pnpm install` and confirm `@mediapipe/tasks-vision` appears in `node_modules/@mediapipe/tasks-vision/`.
- Confirm `public/models/pose_landmarker_lite.task` and `public/models/pose_landmarker_full.task` exist on disk and are real MediaPipe model files (multiple MB each, not zero-byte placeholders).
- Run `pnpm build` and confirm `dist/models/` contains both `.task` files **and** `dist/mediapipe-wasm/` contains `vision_wasm_internal.js/.wasm` (plus the module and `nosimd` variants).
- Run `pnpm preview`, open `/`, complete onboarding if needed, open `/workouts`, open a free workout detail page, tap **Start workout**, complete the Phase 16 setup, and **Continue to workout**. The active route should render the Phase 17 pose-debug shell (workout name + Phase 17 scope text + camera-off card + Pose debug panel), not the old placeholder.
- Confirm the active page does **not** request camera access on load. Only the **Start pose debug** CTA should prompt.
- Tap **Start pose debug**, grant the browser camera prompt, and confirm the live preview appears, the **Loading MediaPipe Pose Landmarker…** card surfaces briefly, and the **Pose debug** panel transitions from `Idle` → `Loading model…` → `Ready` → `Running` (or `No pose detected` if nobody is in frame).
- Stand fully in frame and confirm: landmark count reads `33 / 33`, FPS and inference ms in the **Performance** card update each frame, and (with the overlay enabled) real dots appear over the body — never invented dots if MediaPipe returned an empty result.
- Step out of frame and confirm the status switches to `No pose detected` without rendering ghost landmarks.
- Tap **Log current landmarks** with a body in frame and confirm one informative `console.info` entry appears in DevTools with frame id, timestamp, total landmark count, and a sample of the first five named landmarks. Do not expect per-frame log spam.
- Toggle **Show landmark overlay** / **Hide landmark overlay** and confirm the SVG dots show/hide.
- Tap **Stop pose debug** and confirm: inference stops, the camera indicator turns off, the panel returns to `Idle`, the **Performance** card stats reset, and there is no lingering `MediaStream` (check `navigator.mediaDevices` indicator if visible).
- Navigate to **Back to setup** and **Back to workout detail** during an active session and confirm the camera indicator turns off and inference stops.
- Test the denied / unavailable camera paths and confirm the active page shows the **Camera unavailable** card with `Try again` / `Back to setup` controls.
- Test missing model: temporarily rename `public/models/pose_landmarker_lite.task` (after the preview build) and confirm the **Pose debug** panel renders an honest `model fetch failed` / `model missing` error and the **Loading MediaPipe Pose Landmarker…** card does not get stuck.
- Test the GPU → CPU fallback if your device's GPU delegate cannot initialize: the **Model & delegate** card should display `CPU (WASM fallback)` and a transparent fallback note. Force CPU by editing `pose-model-config.ts` locally if you cannot reproduce naturally.
- Test offline once the model has been cached. After the first successful load, go offline (DevTools → Network → Offline), reload, and reopen the active route. The model should re-initialize without a network round-trip via the `motionly-models` + `motionly-mediapipe-wasm` caches.
- Let the active page run inference for ~10 minutes on a real device and confirm no crash, no significant memory growth, and stable FPS.
- Confirm: no rep counter, no workout timer, no form score, no calories, no cues, no completion summary, no workout history write, no fake AI feedback, and no upload/persisted frames appear anywhere in the active route.
- Check light and dark mode.
- Check 5.0-inch and 6.7-inch mobile viewport sizes. Controls and the bottom nav must remain reachable.
- Test Android Chrome on a real phone if available (GPU delegate; FPS target ≥ 20 on a Redmi-class device).
- Test iOS Safari if available (delegate may fall back; FPS target ≥ 24 on iPhone 12).

---

## 16o. Landmark Data Pipeline & Smoothing Manual QA (Phase 18)

Phase 18 inserts an Exponential Moving Average smoother, a confidence/visibility filter, and a torso-scale normalizer between the Phase 17 raw MediaPipe output and the still-deferred angle/rep/form logic. The active route remains a debug shell. No new runtime dependencies were added.

- Run `pnpm install` and confirm no new packages were added since Phase 17 (`@mediapipe/tasks-vision` is still the only new ML dependency).
- Run `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, and `pnpm build` and confirm they all pass.
- Run `pnpm preview`, complete onboarding if needed, open a free workout detail page, **Start workout**, complete camera setup, and **Continue to workout**. The active route should render the Phase 18 pose-debug shell (workout name + "Phase 18 pose debug" caption + Phase 18 scope text + camera-off card + Pose debug panel with the new processing / visibility / processing-stats cards).
- Tap **Start pose debug**, grant the browser camera prompt, and confirm: status transitions `Idle → Loading model → Ready → Running` (or `No pose detected` if nobody is in frame), the **Processed pose** card shows `Processed landmarks 33 / 33` when a body is in frame, smoothing α defaults to `0.50`, and **Body visibility** shows a mean score that reflects the real subject.
- With the **Overlay mode** chips, switch between **Raw landmarks** and **Smoothed landmarks** and confirm the smoothed overlay visibly jitters less than the raw overlay on the same subject. Switch to **Normalized (debug)** and confirm the overlay redraws as a torso-scale projection labelled `normalized debug projection` — this is debug-only and not a camera-space skeleton.
- Hide one knee / ankle / shoulder with your hand (or step partially out of frame) and confirm the **Body visibility** card moves the affected landmark into the **Occluded key landmarks** list, the per-key visibility row turns warning-toned, and the **Processed pose** card flips from `Fully visible` to `Partially visible`. The pipeline keeps emitting frames — Phase 18 does not block inference.
- Hide both shoulders or both hips (or stand so they are out of frame) and confirm the **Processed pose** card switches normalization to `Not normalized` with the matching reason (`Shoulders or hips were not visible enough this frame`). Smoothed landmarks should still update; the normalized overlay should disappear.
- Step closer to / farther from the camera while staying in full view and confirm the normalized overlay coordinates stay roughly stable relative to the body, demonstrating the torso-scale normalization is doing its job. The raw / smoothed overlays will continue to shrink and grow with the camera distance.
- Step fully out of frame and confirm: the status becomes `No pose detected`, the **Processed pose** card shows `Processed landmarks 0 / 33`, the smoother resets (re-entering frame should not leave a stale ghost overlay), and the **Processing overhead** card's `Dropped frames` counter increments.
- Watch the **Processing overhead** card for a few seconds and confirm `Total` stays mostly under `2.00 ms` on a normal device. Above-target frames render in a warning tone but do not block anything.
- Tap **Log current landmarks** and confirm one `console.info` entry in DevTools containing both raw and smoothed first-five samples plus the visibility report, normalization metadata, and processing stats — no per-frame log spam.
- Tap **Stop pose debug** and confirm: inference stops, the camera indicator turns off, the panel returns to `Idle`, the **Performance** and **Processing overhead** stats reset, no lingering `MediaStream` (check `navigator.mediaDevices` indicator), and no ghost dots remain on the next start.
- Navigate to **Back to setup** and **Back to workout detail** during an active session and confirm the camera indicator turns off and the processor + inference stop cleanly.
- Let the active page run with someone in frame for ~10 minutes on a real device and confirm no crash, no significant memory growth, stable FPS, and that the smoothed overlay continues to lag the raw overlay by a frame without freezing.
- Confirm: no rep counter, no workout timer, no form score, no calories, no cues, no completion summary, no workout history write, no fake AI feedback, no fake "fully visible" claims when key landmarks are occluded, and no upload / persisted frames anywhere in the active route.
- Check light and dark mode for the three new debug cards.
- Check 5.0-inch and 6.7-inch mobile viewport sizes. The Phase 18 cards should stack cleanly on small viewports and stay reachable above the bottom nav.

---

## 16p. Joint Angle Calculation Manual QA (Phase 19)

Phase 19 layers a pure-TypeScript joint-angle calculation pipeline on top of the Phase 18 processed frame. The active route remains a debug shell — Phase 19 only adds the angle debug surface. No new runtime dependencies were added.

- Run `pnpm install` and confirm no new packages were added since Phase 18.
- Run `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, and `pnpm build` and confirm they all pass.
- Run `pnpm preview`, complete onboarding if needed, open a free workout detail page, **Start workout**, complete camera setup, and **Continue to workout**. The active route should render the Phase 19 pose + angle debug shell (workout name + "Phase 19 pose + angle debug" caption + Phase 19 scope text + camera-off card + Pose debug panel + Angle debug panel).
- Tap **Start pose debug**, grant the browser camera prompt, and confirm the Phase 17 + 18 surfaces still behave as in §16n / §16o.
- Step into frame standing upright and confirm the **Joint angles** card fills in plausible values: knees and hips near `~170–180°` when extended, elbows and shoulders matching your arm position. Trunk angle should stay near `0–10°` when standing tall facing the camera.
- Squat down and confirm both knee angles drop into the `~70–100°` range at the bottom of the rep. The trunk angle should increase slightly as you hinge at the hips.
- Intentionally let your knees cave inward while squatting and confirm the **Left knee valgus** / **Right knee valgus** ratios increase in magnitude. The card labels them as `ratio`, not degrees.
- Cover one shoulder or hip with your hand and confirm: the affected angles (e.g. trunk, hip on that side) flip to a dashed value with a reason like `occluded`, and the **Angle availability** card lists the unavailable angle names. Knee valgus and hip symmetry should flip to `no normalization` or `occluded` depending on which landmarks went missing.
- Step fully out of frame and confirm: the **Joint angles** card returns to `Waiting for pose`, the **Angle history** counter resets to `0 / 30`, and no stale values remain after re-entering frame.
- Watch the **Angle calculation overhead** card for a few seconds and confirm `Latest frame` stays mostly under `1.00 ms` on a normal device. Above-target frames render in a warning tone but do not block anything.
- Tap **Log current angle snapshot** and confirm one `console.info` entry in DevTools containing the full snapshot (every angle and metric with status, used landmarks, visibility, source space) plus the angle stats — no per-frame log spam. With no body in frame the button toasts that no snapshot is available.
- Confirm: no rep counter, no form score, no calories, no cues, no completion summary, no workout history write, no fake AI feedback, no fake angles, no `NaN` / `Infinity` values anywhere in the angle UI, and no upload / persisted angles anywhere in the active route.
- Tap **Stop pose debug** and confirm: inference stops, the camera indicator turns off, the panel returns to `Idle`, the **Angle calculation overhead** card resets to `Waiting`, and no stale snapshot remains on the next start.
- Navigate to **Back to setup** and **Back to workout detail** during an active session and confirm the camera indicator turns off and the angle processor resets cleanly.
- Check light and dark mode for the new angle debug cards.
- Check 5.0-inch and 6.7-inch mobile viewport sizes. The Phase 19 cards should stack cleanly on small viewports and stay reachable above the bottom nav.

---

## 16q. Squat Rep Detection Manual QA (Phase 20)

Phase 20 layers a bodyweight squat state machine on top of the Phase 19 angle snapshots. The active route remains debug-only — Phase 20 adds the **Squat rep debug** panel. No new runtime dependencies were added.

- Run `pnpm install` and confirm no new packages were added since Phase 19.
- Run `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, and `pnpm build` and confirm they all pass.
- Run `pnpm preview`, complete onboarding if needed, and open a workout that includes the bodyweight squat (e.g. **Lower Body Foundations** or **Full Body Flow**). **Start workout**, complete camera setup, and **Continue to workout**. The active route should render the Phase 17 + 18 + 19 surfaces and the new Phase 20 **Squat rep debug** panel.
- For a workout that does not include a squat (e.g. **Mobility Reset**), confirm the panel shows the honest "Squat detector is available for workouts that include the bodyweight squat" note and the rep counter is not active.
- Tap **Start pose debug**, grant the browser camera prompt, and confirm the existing Phase 17 / 18 / 19 surfaces still behave as in §16n / §16o / §16p.
- Stand upright fully in frame and confirm the squat engine initializes as `Standing` with rep count `0`. The engine status should read `running` (not `initializing`) once both knees clear the standing threshold.
- Start from a crouched / bottom position and confirm no rep counts until you first reach standing — the engine status reads `initializing` until then.
- Perform 10 full squats at a steady pace, 3 separate runs (tap **Reset squat detector** between runs). Each run should reach a rep count of 10 with no missed reps.
- Perform half squats that do not pass the bottom-depth threshold and confirm the **Last rejected rep** card shows `Half rep — bottom threshold not reached` and the rep count is unchanged.
- Perform slow reps (~4 s/rep) and confirm they count.
- Perform medium reps (~2 s/rep) and confirm they count.
- Perform fast reps (~1 s/rep) and confirm they count only when the bottom dwell still clears 15 frames; otherwise the rep is rejected with `Bottom dwell shorter than 15 frames`.
- Step out of frame mid-rep and confirm the in-flight rep is discarded (`Visibility lost mid-rep`), no fake rep is banked, and the **State** card returns to `Standing` / `Waiting for pose`.
- Cover one or both knees mid-rep and confirm the engine refuses to fabricate angle continuation — the in-flight rep is discarded (`Knee angles unavailable mid-rep`) and no rep is counted.
- Toggle between **Beginner (< 110°)** and **Intermediate (< 90°)** chips and confirm the bottom threshold changes accordingly. Switching difficulty cancels any in-flight rep so a threshold change can't half-count an attempt framed under the previous setting.
- Tap **Reset squat detector** and confirm rep count, state, latest counted rep, and latest rejected rep clear.
- Tap **Stop pose debug** and confirm: inference stops, the camera indicator turns off, the squat detector resets cleanly, and no stale rep / state remains on the next start.
- Navigate **Back to setup** and **Back to workout detail** during an active session and confirm the camera indicator turns off and the squat detector resets cleanly.
- Confirm the page contains **no form score, no coaching cue, no voice cue, no workout timer, no completion summary, no workout history write, no calories, no streak update, no "Great form!" / "Bad form" labels, no fake reps, no fake angles, and no `NaN` / `Infinity` values anywhere in the squat UI**. Form score copy must be the explicit "Form score: deferred to Phase 21" reminder on the rep cards.
- Check light and dark mode for the new **Squat rep debug** card.
- Check 5.0-inch and 6.7-inch mobile viewport sizes. The Phase 20 cards should stack cleanly on small viewports and stay reachable above the bottom nav.

---

## 17. Testing PWA Installability (Android Chrome)

PWA installability requires:

- A valid `manifest.webmanifest` linked from the HTML
- A registered, active service worker
- The page served over HTTPS **or** `localhost`/LAN IPs (Chrome treats `http://192.168.x.x` as a secure-enough context for SW + manifest only when the IP is in the local network range and you have already enabled the relevant flags; for reliable phone-side install testing, see the tunneling note below).

Steps:

1. `pnpm build && pnpm preview`
2. On the laptop, open Chrome and navigate to http://localhost:4173/.
3. Open DevTools → **Application** panel → **Manifest**. Confirm name "Motionly", theme color `#0A0A0F`, and the three icons are listed without warnings.
4. Open DevTools → **Application** → **Service workers**. Confirm `sw.js` is **activated and running**.
5. The install icon should appear at the right edge of the URL bar — click it to install Motionly as a desktop PWA. Launch it; the window should open without browser chrome, in standalone mode.

For the phone:

- The easiest path is to use a tunneling tool (`cloudflared tunnel`, `ngrok http 4173`, etc.) to expose `preview` over HTTPS, then open the tunnel URL on the phone. Chrome will offer "Add to Home Screen" / "Install app".
- Alternatively, deploy the `dist/` output to any static host with HTTPS (staging URL recommended in Phase 3).
- Pure LAN install of the PWA on the phone is unreliable across Android versions — use a tunnel or staging URL for that test.

After install:

- Tap the Motionly icon on the home screen. The app should open full-screen with no address bar (standalone display).
- The launch background and theme should match `#0A0A0F`.

## 18. Testing Offline Behavior

1. `pnpm build && pnpm preview`
2. Open http://localhost:4173/ in Chrome and let it load fully (the service worker precaches all build assets on first load).
3. Open DevTools → **Network** → set throttling to **Offline**.
4. Reload the page. The app shell should still render, without a PWA status pill overlapping the route content.
5. Optionally, in DevTools → **Application** → **Service workers**, check **Offline** and reload — same expectation.

> The app still ships only the honest shell, so there is no further product content to verify offline. Runtime caching rules for `/models/`, `/audio/`, and font requests are pre-wired in `vite.config.ts`; fonts are exercised by Phase 5, while models and audio cues arrive later.

## 19. Project Layout (Current)

```
.
├── index.html                  # Vite entry HTML
├── package.json                # scripts and deps
├── pnpm-workspace.yaml         # pnpm-only config (allowBuilds: esbuild)
├── tsconfig.json               # references app + node configs
├── tsconfig.app.json           # strict TS + path aliases for src/
├── tsconfig.node.json          # TS for vite.config.ts
├── vite.config.ts              # React + tsconfig-paths + VitePWA
├── tailwind.config.ts          # Motionly design tokens + Tailwind dark mode
├── postcss.config.js           # Tailwind + Autoprefixer
├── public/
│   ├── favicon.svg             # in-tab Motionly mark (vector)
│   ├── favicon.ico             # legacy / Windows tab icon
│   ├── favicon-96x96.png       # small raster favicon
│   ├── favicon-light-96x96.png # light-mode raster favicon
│   ├── apple-touch-icon.png    # 180×180 iOS home-screen icon
│   ├── web-app-manifest-192x192.png  # PWA icon (any)
│   ├── web-app-manifest-512x512.png  # PWA icon (any + maskable)
│   ├── Motionly.png            # 1024×1024 brand source (not precached)
│   ├── motionly-mark-light.png # 1024×1024 light brand source (not precached)
│   ├── motionly-mark-light-192.png # Light-mode app-shell mark
│   ├── models/                 # Phase 17 MediaPipe Pose Landmarker .task files
│   └── audio/cues/             # reserved for voice cues (Phase 25)
├── src/
│   ├── main.tsx                # React entry, SW registration
│   ├── App.tsx                 # Renders AppRouter
│   ├── index.css               # Tailwind directives + global base styles
│   ├── hooks/useTheme.ts       # Public theme hook re-export
│   ├── hooks/useNavigation.ts  # Typed navigation wrapper (Phase 6)
│   ├── hooks/usePoseLandmarker.ts # Phase 17 inference loop hook
│   ├── theme/                  # ThemeProvider, useTheme, motion constants
│   ├── router/                 # Route table, guards, layouts (Phase 6)
│   ├── pages/                  # Route pages, including real dashboard/workout/detail/setup/active screens
│   ├── components/routing/     # RoutePlaceholder, BottomTabBar, optional status pill
│   ├── components/primitives/  # Phase 8 primitive UI library
│   ├── components/feedback/    # Phase 9 feedback / status / progress library
│   ├── components/camera-setup/ # Phase 16 camera setup composites
│   ├── components/pose-debug/  # Phase 17 pose-debug UI (panel, status, FPS, model, overlay)
│   ├── ml/pose/                # Phase 17 MediaPipe wrapper, config, landmark constants
│   ├── platform/haptics.ts     # Phase 8 haptics adapter (navigator.vibrate)
│   ├── platform/camera-permission.ts # Phase 12 permission-primer adapter
│   ├── platform/camera-stream.ts # Phase 16 live setup stream adapter
│   ├── platform/camera-lighting.ts # Phase 16 local canvas lighting sampler
│   ├── platform/speech.ts      # Phase 16 optional setup speech adapter
│   ├── store/usePoseStore.ts   # Phase 17 latest-frame pose store
│   ├── types/pose.ts           # Phase 17 pose domain types
│   ├── utils/cn.ts             # Phase 8 clsx-based class composer
│   ├── utils/score.ts          # Phase 9 score / tone helpers
│   ├── utils/formatDuration.ts # Phase 9 duration formatting helpers
│   ├── utils/camera-lighting.ts # Phase 16 brightness helpers
│   ├── sw-register.ts          # Workbox SW lifecycle helper
│   └── vite-env.d.ts           # Vite / PWA ambient types
└── docs/SETUP.md               # This file
```

## 20. Absolute Imports

`vite-tsconfig-paths` is wired up so the following aliases resolve in both Vite and TypeScript:

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

> **Phase 11 update:** Phase 4 created the aliased folder skeleton. `src/theme/` contains real theme infrastructure, `src/hooks/useTheme.ts` re-exports the theme hook, `src/store/useOnboardingStore.ts` holds the in-memory onboarding draft, and `src/types/onboarding.ts` holds the Phase 11 onboarding types. The remaining folders stay reserved until their phases arrive. See [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md) for the full map.

## 21. What the Current Foundation Intentionally Still Does NOT Include

Per `MOTIONLY_MASTER_PLAN.md`, the following are still deferred to their own phases. Do **not** add any of these until their phase is active:

- Workout history and programmed plans (Phases 28, 33)
- Joint angle math, exercise engines, rep counting, form scoring, and active workout coaching (Phases 19–26)
- Voice feedback system beyond the one user-initiated setup instruction (Phase 25)
- Durable cross-feature state management and the full IndexedDB storage adapter (Phases 29–30)
- Supabase backend, authentication (Phases 31–32)
- Stripe / Razorpay, paywall, free-tier limits (Phases 36–38)
- i18n, Hindi pack (Phases 42–43)
- Web Push, notifications (Phase 44)
- Settings UI and accessibility audit (Phases 45–47)

> Phase 11 is complete for onboarding screens 1–3. Phase 12 completed screens 4–5 and local onboarding persistence. Real Supabase session rehydration and real protected redirect rules are still deferred to their own phases.

> Phase 16 is complete: free workout detail pages route to a real camera setup screen with user-initiated live preview, local lighting check, silhouette guide, placement instructions, manual alignment confirmation, stream cleanup, and handoff to the active route.

> Phase 17 is complete: `@mediapipe/tasks-vision` is installed, `public/models/pose_landmarker_lite.task` and `pose_landmarker_full.task` ship in-tree, the Tasks-Vision WASM fileset is served app-locally from `/mediapipe-wasm/`, and `/workout/:id/active` now runs real on-device MediaPipe Pose Landmarker inference with a live landmark debug overlay, FPS / inference stats, model + delegate status (GPU → CPU fallback honest), and clean lifecycle. Joint angles, rep counting, form scoring, coaching, session history, Supabase/auth/payments, and analytics remain deferred to later phases.

> Phase 18 is complete: raw MediaPipe landmarks now flow through real EMA smoothing, real confidence/visibility filtering, and real torso-scale normalization. The active route renders processed-landmark status, body-visibility detail, processing-overhead breakdown, and `raw` / `smoothed` / `normalized` overlay modes — all from real per-frame data. Joint angles, rep counting, form scoring, coaching cues, workout timers, completion summaries, workout history/session records, Supabase/auth/payments, and analytics remain deferred to later phases.

> Phase 19 is complete: the Phase 18 processed pose frame now feeds a pure-TypeScript joint-angle layer under `src/ml/angles/`. Per-frame named joint angles (knees, hips, ankles, elbows, shoulders, trunk), geometry-derived metrics (knee valgus ratio, hip symmetry delta), a bounded 30-frame `AngleHistory` ring buffer, a per-frame `AngleCalculationStats` summary, and a debug-only angle panel land on `/workout/:id/active`. Rep counting, form scoring, coaching cues, workout timers, completion summaries, workout history/session records, Supabase/auth/payments, and analytics remain deferred to later phases.

## 22. Phase 2 Success Checklist

Before considering Phase 2 done locally:

- [ ] `pnpm install` succeeds without errors.
- [ ] `pnpm typecheck` passes with no errors (strict mode is on).
- [ ] `pnpm build` produces `dist/` with `sw.js`, `manifest.webmanifest`, and all six brand icons.
- [ ] `pnpm preview` serves the app at http://localhost:4173/.
- [ ] DevTools → Application → Service workers shows `sw.js` activated.
- [ ] DevTools → Application → Manifest shows no warnings.
- [ ] Lighthouse PWA audit ≥ 90 on the preview URL.
- [ ] The same preview URL loads on a physical phone via the LAN IP (install testing may require a tunnel — see §17).
- [ ] Offline reload after first load still renders the app shell.

---

## 23. Repository Standards

Commit conventions, branching strategy (current and future), pre-commit checks, and GitHub branch-protection guidance are documented in **[`REPOSITORY_STANDARDS.md`](./REPOSITORY_STANDARDS.md)**. Read it before opening your first PR.
