# 00 — Design Principles

These are the UX principles every Motionly wireframe and every future implementation phase must respect. They are deliberately short and absolute: if a design or copy choice cannot defend itself against this list, it does not ship.

Audience: future-me (and any future contributor) picking up a screen for the first time. These are the constraints you do not get to renegotiate without updating this file.

---

## 1. Trust over hype

Motionly competes on credibility, not on flashy claims. Copy should describe what the app actually does, in plain words. Marketing-flavored numbers ("Trusted by 10,000 athletes"), unverified outcomes ("Lose 5kg in 14 days"), and aspirational AI superlatives ("World's most accurate form analysis") are banned from product UI. If a number, claim, or testimonial cannot be backed by something the user can verify, it does not appear.

## 2. First coached rep in under three minutes

The core promise of the first session is: open the URL, get coached on a real rep, in under three minutes. Every screen that sits between "URL opens" and "first rep coached" must justify its existence against that budget. Animations, sign-up walls, marketing copy, optional surveys, and decorative loading screens are all suspect by default.

Steps allowed in the critical path:

```
URL → Splash → Welcome → Goal → Fitness → Limitations → Camera tutorial
    → Pick a starter workout → Camera permission → Camera setup → First rep
```

Anything else added to this path must demonstrably help the rep happen, not delay it.

## 3. Privacy-first camera messaging

Whenever the camera is mentioned, the privacy story must be co-located. Default phrasing:

> Motionly needs your camera to coach your movement. **Video is processed on your device and never uploaded.**

Camera permission screens, onboarding camera tutorials, profile/settings, and the paywall all repeat this message in essentially the same words. Consistency is the point — users should recognize the line by the third time they see it.

Do not use:

- "Cloud-powered analysis" — we don't do that and never will for video.
- "We may use your video to improve our model" — we don't.
- "Video is encrypted in transit" — implies upload.

## 4. One cue at a time

Real-time coaching is a single short sentence on the screen, not a list. Stacking cues ("Drop hips lower • Knees over toes • Brace core") is cognitive overload mid-movement and exactly what bad fitness apps do. The form-assessment engine ranks cues by priority and emits one. The UI displays one. If a second cue is more important, it replaces the first; it does not append.

## 5. Correction, not criticism

Cue copy is corrective and short:

- "Keep your chest up."
- "Drive through your heels."
- "Slow down on the way down."

Never:

- "Wrong."
- "Bad form."
- "You're going to hurt yourself."
- "That's terrible."

The tone is a calm coach, not a drill sergeant. Praise is rare and earned — a single "Nice rep" once a few clean reps have stacked beats a stream of "Great job!"s.

## 6. No medical or injury prediction claims

Motionly is a movement coach. It is not a physiotherapist, a diagnostic tool, or an injury risk model. Banned vocabulary in product UI:

- "Injury risk" / "risk of injury"
- "Diagnose" / "diagnosis"
- "Treatment" / "prescribe" / "prescription"
- "Pain assessment"
- "Medical advice"

Acceptable adjacent phrasing:

- "Adjust this workout based on your limitations."
- "If something hurts, stop and consult a professional."
- "This program is for general fitness, not medical care."

## 7. Beginner-friendly language

Default reading level is "person who has never been to a gym." Anatomy terms (`glute`, `quad`, `hip hinge`) are fine — they are the actual vocabulary — but jargon (`eccentric tempo`, `RPE 8`, `concentric phase`) needs either a one-line explanation in context or a replacement with plainer language.

Numbers stay simple. "3 sets of 10" beats "3×10 @ RPE 7." "Stand for 30 seconds" beats "30s isometric hold."

## 8. Android Chrome first

The primary device target is **mid-range Android phones on Chrome**. Every wireframe assumes:

- Portrait orientation by default.
- Touch interactions (no hover-only affordances).
- Single-thumb reach for primary CTAs (place them in the lower half of the screen).
- ~5.5"–6.7" screen range; designs must remain usable on the small end.
- iOS Safari is a supported secondary target — wireframes must not rely on Chrome-only behavior.

## 9. Small-space home workout assumptions

The default user is exercising in a living room, a hotel room, or a small bedroom — not a gym. Equipment requirements are zero for the MVP exercise set. Camera setup wireframes plan for ~2–3 meters of clear space, not a full studio. Workout copy avoids assuming barbells, racks, benches, or pull-up bars.

## 10. Inclusive across body types, lighting, clothing, and fitness level

Wireframes must accommodate:

- A wide range of body types — illustrations and silhouettes must not imply a single body shape is the "correct" one.
- Skin tones — never use a skin color as a "correct pose" signal.
- Clothing — loose clothing can occlude landmarks; the system communicates uncertainty rather than guessing.
- Lighting — dim or backlit rooms are common; the camera-setup flow guides the user without scolding them.
- Fitness level — modifications and regressions are offered for users new to movement.

If a screen could shame a beginner, a larger body, a dimly lit room, or a hijabi user, it is not finished.

## 11. Clear empty, loading, error, and offline states

Every data-backed screen must specify all four states _before_ implementation begins:

- **Loading** — short skeleton; never a spinner alone on a blank page.
- **Empty** — first-session users should see a friendly explanation of what will populate this view once they have data, plus a CTA to do the thing that populates it.
- **Error** — explain what failed, in plain language, and offer the next step (retry, switch network, sign in again).
- **Offline** — the app continues to function for any feature that does not require network. Screens that need the network say so plainly and offer to retry when connection returns.

Permission-denied is a fifth state for any screen that touches camera, microphone, notifications, or storage.

## 12. No fake stats or motivational manipulation

Never:

- Fake streak numbers to push the user.
- Fake "X people just signed up" social proof.
- Fake countdowns ("Offer expires in 04:59").
- Fake difficulty progression ("You're 87% to your next level!").

If a number is shown, it represents a real measurement of the user's real activity. If the activity hasn't happened, the screen says so honestly (empty state).

Real motivation comes from showing the user their actual progress over time — "Your squat form score went from 58 to 76 over three weeks" is more motivating than any fabricated badge.

---

## How to use this document

- When writing a wireframe, scan this list first. Every "do" and "do not" in a screen-level doc should trace back to one of these principles.
- When reviewing an implementation, treat any violation here as a blocker, not a nit.
- When in doubt about a copy or layout choice, choose the option that is _more_ honest, _more_ private, _more_ inclusive, and _less_ manipulative.
