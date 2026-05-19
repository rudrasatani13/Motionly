# Motionly — Development Environment Setup

This guide gets a new developer from a fresh machine to a ready Motionly development environment in about 10 minutes. It corresponds to **Phase 1 — Development Environment Setup** of `MOTIONLY_MASTER_PLAN.md`.

---

## 1. Project Context

Motionly is a **PWA-first** fitness app.

- Stack (planned): **Vite + React + TypeScript**, installable as a Progressive Web App.
- Primary device target: **Android Chrome** on a real phone.
- Secondary targets: desktop Chrome / Edge for development and DevTools.
- The repository is currently in Phase 1 (developer environment only). The Vite app itself is scaffolded in Phase 2.

**You do not need any of the following:**

- Android Studio
- Xcode
- Android or iOS emulators
- Native mobile SDKs
- Java / JDK

If a tutorial tells you to install any of those for Motionly, ignore it. Motionly runs entirely in the browser.

---

## 2. Required Tooling

| Tool | Purpose | Notes |
|---|---|---|
| Node.js LTS **v20+** | JavaScript runtime for Vite, scripts, tooling | Use the version pinned in `.nvmrc` |
| pnpm | Fast, disk-efficient package manager | Required — `npm` and `yarn` are not used in this project |
| VS Code | Editor with first-class TS/React/Tailwind support | Any editor works, but examples assume VS Code |
| Chrome or Edge (latest) | Primary development browser, DevTools, Lighthouse | Used for performance profiling and remote device debugging |
| A physical Android phone | Real-device testing over LAN | Required — no emulator is used |

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
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`) — Tailwind class autocompletion (used from Phase 2 onward)
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
