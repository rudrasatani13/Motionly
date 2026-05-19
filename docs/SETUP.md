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
4. Reload the page. The app shell should still render. The status pill at the bottom should read "PWA foundation initialized · offline ready".
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
│   ├── models/                 # reserved for ML models (Phase 17)
│   └── audio/cues/             # reserved for voice cues (Phase 25)
├── src/
│   ├── main.tsx                # React entry, SW registration
│   ├── App.tsx                 # Minimal app shell
│   ├── index.css               # Tailwind directives + global base styles
│   ├── hooks/useTheme.ts       # Public theme hook re-export
│   ├── theme/                  # ThemeProvider, useTheme, motion constants
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

> **Phase 5 update:** Phase 4 created the aliased folder skeleton. `src/theme/` now contains real theme infrastructure and `src/hooks/useTheme.ts` re-exports the theme hook. The remaining folders stay reserved until their phases arrive. See [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md) for the full map.

## 21. What the Current Foundation Intentionally Does NOT Include

Per `MOTIONLY_MASTER_PLAN.md`, the following are deferred to their own phases. Do **not** add any of these until their phase is active:

- Routing (Phase 6)
- Splash / launch experience (Phase 10)
- Onboarding screens (Phases 11–12)
- Dashboard, workout library, workout detail (Phases 13–15)
- Camera permissions, MediaPipe, pose detection, exercise engines (Phases 16–24)
- Voice feedback, skeleton overlay (Phases 25–26)
- State management (Zustand) and IndexedDB (Phases 29–30)
- Supabase backend, authentication (Phases 31–32)
- Stripe / Razorpay, paywall, free-tier limits (Phases 36–38)
- i18n, Hindi pack (Phases 42–43)
- Web Push, notifications (Phase 44)
- Settings UI and accessibility audit (Phases 45–47)

The current `src/App.tsx` is **only** an honest app shell with the Motionly name, tagline, and a single status pill that reflects PWA / service-worker readiness. There is no fake user state, fake stats, fake AI claim, or placeholder workout content.

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
