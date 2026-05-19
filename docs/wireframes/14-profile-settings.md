# 14 — Profile / Settings

## Purpose

The home for everything user-account-shaped: identity, preferences, privacy controls, subscription, language, and support. It also serves as the recovery path for camera permission and notification permission.

## Route

`/profile` — wired in Phase 6 (`@pages/profile/ProfilePage`).

## Future implementation phase

**Phase 45 — Settings Screen** consolidates this view. Sub-sections land across **Phases 32** (auth), **36** (subscription), **42–43** (i18n), **44** (notifications), **45** (settings UI), **46** (theme toggle), and **47** (accessibility).

## Entry points

- Bottom tab bar → "Profile" tab.
- Notification settings deep link.
- "Open settings" path from the camera permission denied flow.

## Exit points

- Sub-section taps drill into their own pages or modals: Account, Privacy, Notifications, Theme, Language, Subscription, About.
- "Sign out" returns to `/welcome`.
- "Delete account" → confirmation modal → on confirm, returns to `/welcome`.

## Primary user action

Configure one specific thing. The screen is a directory.

## Secondary actions

- View / change avatar (post-MVP).
- View account email.
- Open the help / contact channel.
- View app version + privacy policy.

## Wireframe

```
┌──────────────────────────────────────┐
│  Profile                             │  ← text-h2
├──────────────────────────────────────┤
│                                      │
│  ┌──┐                                │
│  │  │   Display name                 │  ← avatar (initials fallback)
│  └──┘   email or "Local-only"        │
│                                      │
│                                      │
│  Plan                                │  ← section header
│  ┌────────────────────────────────┐  │
│  │  Free                            │  │
│  │  Upgrade to Pro for unlimited    │  │  ← collapsible benefit teaser
│  │  workouts and full coaching.     │  │
│  │  See plans →                     │  │  ← navigates to /paywall
│  └────────────────────────────────┘  │
│                                      │
│  Workout                             │
│  ┌────────────────────────────────┐  │
│  │  Coaching intensity        ▸    │  │
│  │  Voice cues               on    │  │
│  │  Camera permission        on    │  │  ← shows current browser state
│  │  Camera tutorial         redo   │  │
│  └────────────────────────────────┘  │
│                                      │
│  App                                 │
│  ┌────────────────────────────────┐  │
│  │  Theme              system  ▾   │  │  ← light / dark / system
│  │  Language               EN  ▾   │  │  ← English / Hindi (Phase 43)
│  │  Notifications            ▸    │  │
│  │  Reduce motion           off    │  │
│  └────────────────────────────────┘  │
│                                      │
│  Privacy                             │
│  ┌────────────────────────────────┐  │
│  │  Privacy approach          ▸    │  │  ← on-device summary
│  │  Analytics              opt-in  │  │  ← off by default (Phase 53)
│  │  Export my data            ▸    │  │  ← local-only export
│  │  Delete my data            ▸    │  │
│  └────────────────────────────────┘  │
│                                      │
│  Account                             │
│  ┌────────────────────────────────┐  │
│  │  Email                     ▸    │  │
│  │  Change password           ▸    │  │
│  │  Sign out                  ▸    │  │
│  │  Delete account            ▸    │  │
│  └────────────────────────────────┘  │
│                                      │
│  About                               │
│  ┌────────────────────────────────┐  │
│  │  Version 0.0.0                  │  │
│  │  Privacy policy            ▸    │  │
│  │  Terms of service          ▸    │  │
│  │  Help & contact            ▸    │  │
│  └────────────────────────────────┘  │
│                                      │
├──────────────────────────────────────┤
│  Home  Workouts  Progress [ Profile ]│
└──────────────────────────────────────┘
```

## Content rules

- Sections in this order: identity, plan, workout, app, privacy, account, about. Privacy must always sit above generic account settings.
- A user without an account (local-only) sees "Local-only" instead of an email. Sign-out is hidden; "Sign in to back up" replaces it.
- Camera permission row mirrors the current browser state. Tapping it routes to `/permissions` for the recovery flow.
- "Privacy approach" is the canonical explainer page (or modal) that summarizes the on-device story. Used as the trust artefact across the app.
- Analytics is **opt-in** and clearly labeled as such; default is off.
- "Export my data" creates a local JSON file with session history and profile — no upload.
- "Delete my data" wipes local IndexedDB; if the user has an account, it also enqueues a server-side delete.
- "Delete account" is a separate row from "Sign out"; both require confirmations.
- Version line is the build version, not a marketing label.
- Privacy policy + Terms link to internal pages; they must exist before they are linked, even as stubs.

## Data requirements (future only)

| Data point           | Source (future)                              | Phase |
| -------------------- | -------------------------------------------- | ----- |
| Display name + email | Supabase profile / local-only fallback       | 31/32 |
| Subscription plan    | `useSubscriptionStore`                       | 36    |
| Voice toggle         | `useSettingsStore`                           | 29/45 |
| Camera permission    | Platform adapter query                       | 16    |
| Theme                | `ThemeProvider` (already shipped in Phase 5) | 5/46  |
| Language             | `i18n` runtime                               | 42/43 |
| Notifications        | Push adapter                                 | 44    |
| Analytics opt-in     | `useSettingsStore`                           | 53    |
| Data export / delete | Database service                             | 30    |

## States to handle later

- **Loading:** skeletons per section header + per row.
- **Local-only user:** auth-shaped rows replaced by "Sign in to back up" CTA.
- **Pro user:** "Plan" row reads "Pro · renews on …" and offers "Manage subscription" (opens Stripe / Razorpay customer portal).
- **Trial user:** "Trial · ends in N days" with a clear "Cancel before charge" affordance.
- **Camera permission denied:** the camera row turns into a clear "Off — open setup" affordance that routes to recovery copy.
- **Notifications denied at OS level:** notification row shows the OS state and gives platform-specific instructions to enable.
- **Offline:** sub-rows that require network (manage subscription, change password) gray out with an offline tooltip; the rest of the screen works.
- **Reduced motion:** no row-tap ripples or marketing animations.

## Accessibility notes

- Each section uses a proper heading hierarchy (`h3` for section labels).
- Toggle controls expose state to screen readers ("Voice cues, on").
- Lists are keyboard navigable; row arrows are decorative.
- The "Privacy approach" link opens an in-app explainer, not an external URL — keeps the user inside the trust frame.

## Privacy / safety notes

- Privacy controls **must sit above** account controls. The order communicates priorities.
- Analytics row default state is **off**; copy makes that visible without scolding.
- "Delete my data" is real, not a no-op stub — even before Supabase ships, the local-data delete must actually delete.
- The screen must not expose third-party tracker URLs or fetch external SDKs to render.

## Do not fake

- Do not display a fake email or display name for users who have not signed in.
- Do not display a fake "Profile photo" upload UI before the storage path exists.
- Do not show fake plan upgrades ("Just $4.99 today!").
- Do not invent fake notification counts or "We've sent you 12 nudges this week" badges.
- Do not show fake "Active devices" lists (post-MVP if at all, and only with real session-tracking data).
- Do not display "We sent you a coupon" cells without a real coupon system.
