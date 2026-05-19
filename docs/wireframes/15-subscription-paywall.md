# 15 — Subscription / Paywall

## Purpose

Convert a free user to a paying user — **ethically**. The paywall explains what Pro unlocks, shows transparent pricing, and offers a clean exit. It must never use urgency, scarcity, fake countdowns, or dark patterns.

## Route

`/paywall` — wired in Phase 6 (`@pages/modal/PaywallPage`) as a modal-style route.

## Future implementation phase

**Phase 36** introduces Stripe + Razorpay infrastructure. **Phase 37 — Paywall Screen & Upgrade Flow** builds this screen. **Phase 38** wires the free-tier enforcement that opens it.

## Entry points

- Free-tier weekly session limit reached → paywall.
- Tap on a locked workout / exercise in the library.
- "See plans" row in `/profile`.
- "Unlock unlimited workouts" upgrade banner on the dashboard.
- Manual deep link from web push / email reminders (Phase 44).

## Exit points

- "Subscribe" → checkout flow (Stripe or Razorpay) → success → return to caller.
- "Not now" or back → previous route. Always available.
- "Restore subscription" → triggers entitlement re-check.
- "Cancel anytime" link → opens the customer portal.

## Primary user action

Subscribe to Motionly Pro.

## Secondary actions

- Switch between Monthly and Annual.
- Restore subscription.
- Read what Pro unlocks (already on the page).
- Open ToS and Privacy links.

## Wireframe

```
┌──────────────────────────────────────┐
│  ✕                                   │  ← clear close affordance
├──────────────────────────────────────┤
│                                      │
│           [Motionly mark]            │
│                                      │
│  Unlock Motionly Pro                 │  ← text-h1
│  Keep moving every day.              │  ← text-body neutral-500
│                                      │
│  What's included                     │
│  ┌────────────────────────────────┐  │
│  │  ✓  Unlimited workouts          │  │
│  │  ✓  Full coaching on every       │  │
│  │     exercise                    │  │
│  │  ✓  Adaptive programming that   │  │
│  │     learns your form            │  │
│  │  ✓  All-time progress history   │  │
│  │  ✓  New workouts as we add them │  │
│  └────────────────────────────────┘  │
│                                      │
│  Choose a plan                       │
│                                      │
│  [ Monthly ] | [ Annual · save 50% ] │  ← toggle (annual highlighted)
│                                      │
│  ┌────────────────────────────────┐  │
│  │  Annual                         │  │
│  │  $59.99 / year                  │  │  ← localized; ₹1,499 in IN
│  │  Works out to $5.00 / month     │  │
│  │  7-day free trial               │  │
│  │  Cancel anytime                 │  │
│  └────────────────────────────────┘  │
│                                      │
├──────────────────────────────────────┤
│  ┌────────────────────────────────┐  │
│  │     Start 7-day free trial      │  │  ← primary CTA, copy adapts to plan
│  └────────────────────────────────┘  │
│                                      │
│  Restore subscription                │  ← text link
│                                      │
│  By continuing, you agree to our     │
│  Terms and Privacy.                  │  ← caption
└──────────────────────────────────────┘
```

## Wireframe — purchase in progress

```
┌──────────────────────────────────────┐
│  ✕                                   │
├──────────────────────────────────────┤
│                                      │
│   ┌────────────────────────────┐     │
│   │     [opens checkout]        │     │  ← Stripe / Razorpay checkout
│   └────────────────────────────┘     │
│                                      │
│  After payment, you'll return here   │  ← caption
│  automatically.                      │
│                                      │
└──────────────────────────────────────┘
```

## Wireframe — purchase success

```
┌──────────────────────────────────────┐
│                                      │
│             [checkmark]              │
│                                      │
│  You're in.                          │  ← text-h1
│  Welcome to Motionly Pro.            │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  Continue where you left off    │  │  ← returns to triggering context
│  └────────────────────────────────┘  │
│                                      │
└──────────────────────────────────────┘
```

## Content rules

- Headline: "Unlock Motionly Pro" — clear, not breathless.
- Benefits list: 4–5 items, each one sentence, present tense. No vague marketing language.
- Plan toggle: Monthly | Annual. Annual highlights "save 50%" only if the math actually works out to that — never inflated.
- Pricing: localized currency based on Stripe / Razorpay region detection. Tax disclosure where required by jurisdiction.
- Trial: shown only on plans that actually carry a trial. Trial copy must be unambiguous about end date and renewal.
- Primary CTA copy adapts: "Start 7-day free trial" for trialed plans, "Subscribe — $9.99 / month" for direct.
- "Cancel anytime" appears near the CTA.
- "Restore subscription" is always visible (essential for cross-device users).
- ToS + Privacy links are required by app store and payment policy.
- The screen has a clear close (`✕`) at top-left. Never hidden, never sub-pixel.

## Data requirements (future only)

| Data point         | Source (future)                                  | Phase |
| ------------------ | ------------------------------------------------ | ----- |
| Region             | Locale + IP geolocation                          | 36    |
| Pricing            | Stripe / Razorpay offerings API                  | 36    |
| Entitlement status | Supabase profile + webhook                       | 36    |
| Trial eligibility  | Stripe metadata                                  | 36    |
| Trigger context    | Navigation state (which gate opened the paywall) | 37    |

## States to handle later

- **Loading offerings:** skeletons for the plan card and CTA disabled.
- **Network error fetching offerings:** retry banner; the user can still close the paywall and try later.
- **Already Pro:** the paywall should not open. Defensive case: if it does, show "You're already on Pro" with a CTA to the customer portal.
- **Trial used previously:** trial copy is removed; CTA reads "Subscribe — $59.99 / year."
- **Region without payment provider:** show "Subscriptions are not available in your region yet." with a contact link. Never silently fall back to a wrong region.
- **Checkout failure:** return from provider with a clear failure message and a "Try again" CTA. Do not blame the user.
- **Checkout cancel:** silent return to the paywall, no scolding.
- **Restore success:** entitlement updates; return to the caller's context.
- **Restore failure:** clear next step ("Sign in with the email used at purchase").
- **Offline:** the paywall renders the last cached offerings (read-only) and the CTA explains that a connection is needed to subscribe.

## Accessibility notes

- Close button is the first focusable element on screen entry.
- Toggle uses `role="tablist"`.
- Plan card is a single accessible block ("Annual plan, 59.99 dollars per year, works out to 5 dollars per month, 7-day free trial, cancel anytime").
- Primary CTA height ≥48 dp and reachable in the lower third.
- Color is never the sole signal for "selected" state on the toggle.
- The "save 50%" tag is decorative; the underlying math is also announced.

## Privacy / safety notes

- Payment data never touches the Motionly origin — it lives inside the provider's checkout flow.
- Receipts and invoices are issued by the provider directly.
- The paywall must not embed third-party trackers; the only outbound calls are to the payment provider on user action.
- No analytics event names referencing the user's identity until consent is granted (Phase 53).

## Do not fake

- Do not invent prices the system can't actually charge.
- Do not show fake "Limited time offer expires in 04:59" countdowns.
- Do not show fake "X people just upgraded" social proof.
- Do not display fake reviews or testimonials.
- Do not hide the close button or place it under the safe-area inset.
- Do not auto-dismiss the paywall on a timer; the user closes it deliberately.
- Do not pre-check upsells the user did not opt into ("Add a $4.99/mo nutrition pack").
- Do not block a user who declines from continuing to use free features.
- Do not invent "Save 90% just for you" personalized discounts unless the discount engine exists.
- Do not show fake "Pro user" badges before the entitlement is granted.
