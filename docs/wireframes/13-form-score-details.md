# 13 — Form Score Details

## Purpose

The "what does my score actually mean" screen. When a user wants to understand why their squat scored 72 instead of 80, this is the screen they reach. It must be transparent about the rules used to score, the confidence of the measurement, and the limitations of automated form analysis.

## Route

No dedicated route yet. Surfaced as either:

- A modal launched from a per-exercise card on `12-progress-history.md`.
- A sub-state of `/workout/:id/summary` for the exercise the user tapped.

A future Phase 35 decision may grant it a route like `/progress/exercises/:exerciseId` if shareability becomes a need.

## Future implementation phase

**Phase 35+** — surfaced alongside the Progress screen.

## Entry points

- Tap on a per-exercise card on the post-workout summary.
- Tap on a per-exercise card on the progress screen.
- Tap on a single session card in history and choose "See score details" (post-MVP).

## Exit points

- Back → previous screen.
- "Try this exercise" → `/workouts/:id` for a workout featuring this exercise.

## Primary user action

Read. The screen is informational.

## Secondary actions

- Toggle to view a specific session's per-rep breakdown.
- Read the form rules used to score this exercise.
- Open a short tutorial on what "form score" means.

## Wireframe

```
┌──────────────────────────────────────┐
│  ←                                   │
├──────────────────────────────────────┤
│  Squat                               │  ← exercise name, text-h1
│  Last session                        │  ← context line, text-body neutral-500
│                                      │
│   ┌────────────────────────────┐     │
│   │           ◯◯◯              │     │
│   │            74              │     │  ← session form score ring
│   │       form score            │     │
│   └────────────────────────────┘     │
│                                      │
│  What we measured                    │  ← text-h3
│  ┌────────────────────────────────┐  │
│  │  Knee tracking          82      │  │  ← per-rule sub-scores
│  │  Depth                  68      │  │
│  │  Tempo                  72      │  │
│  │  Back position          76      │  │
│  └────────────────────────────────┘  │
│                                      │
│  Where you can improve               │
│  ┌────────────────────────────────┐  │
│  │  ↳  Squat a little deeper.      │  │  ← actionable, plain language
│  └────────────────────────────────┘  │
│                                      │
│  Confidence                          │  ← text-h3
│  ┌────────────────────────────────┐  │
│  │  ●●●●○  High                    │  │  ← confidence indicator
│  │  Most of your reps were clearly │  │
│  │  visible. Two were partial.     │  │
│  └────────────────────────────────┘  │
│                                      │
│  How we score                        │  ← collapsible explainer
│  ┌────────────────────────────────┐  │
│  │  Each rep is scored against     │  │
│  │  rules for that exercise. We    │  │
│  │  combine the rule scores into a │  │
│  │  single number from 0 to 100.   │  │
│  │  See the rules ▾                │  │  ← expand for the rule list
│  └────────────────────────────────┘  │
│                                      │
│  Limitations                         │  ← text-h3
│  ┌────────────────────────────────┐  │
│  │  Motionly estimates form from   │  │
│  │  what your camera can see. It   │  │
│  │  is not a medical assessment.   │  │
│  │  If something hurts, stop.      │  │
│  └────────────────────────────────┘  │
│                                      │
├──────────────────────────────────────┤
│  ┌────────────────────────────────┐  │
│  │       Try this exercise         │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

All sample numbers are illustrative documentation only.

## Content rules

- Headline names the exercise; the context line names the slice ("Last session", "Last 30 days").
- The session ring is the same component used on the workout summary.
- Per-rule sub-scores list at most four rules; longer rule sets collapse extras behind "See more."
- "Where you can improve" surfaces at most one actionable cue. Plain language only. No medical terms.
- Confidence indicator uses 5 dots and a short sentence explaining what drove the rating.
- "How we score" explainer is short and collapsible. Expanding reveals the rule list and brief plain-language descriptions of each rule.
- Limitations block is non-negotiable: every form-score detail surface must state the limits of the measurement (Design Principle 6). Wording can be tightened but never removed.

## Data requirements (future only)

| Data point          | Source (future)                          | Phase |
| ------------------- | ---------------------------------------- | ----- |
| Session score       | `getSessionScore(sessionId, exerciseId)` | 30    |
| Per-rule sub-scores | Form engine rule outputs                 | 21+   |
| Top cue             | Mode of cues in this slice               | 21+   |
| Confidence rating   | Aggregate pose confidence across reps    | 18    |
| Rule descriptions   | Authored copy bundled with the rule sets | 21+   |

## States to handle later

- **No reps tracked:** show the limitations block first and a quiet message — "We couldn't track enough reps to score this one. Check your camera setup and try again."
- **Low confidence overall:** the confidence block dominates; sub-scores hidden behind "Show anyway" because they aren't reliable.
- **Borderline reps:** count is shown plus how many were partial. No fake "perfect" claims.
- **Loading:** skeletons for the ring, the rule list, and the confidence block.
- **Older data with retired rule version:** show the version stamp ("Scored with squat rules v2") and a note that newer rules might score differently.
- **Reduced motion:** the ring fills without animation.

## Accessibility notes

- The ring number is the source of truth for screen readers.
- Each sub-score row is a list item that announces "Knee tracking: 82 out of 100."
- The collapsible explainer uses `aria-expanded` / `aria-controls`.
- Color is never the only signal — every score has an adjacent number.
- The limitations block is always rendered; it must not be hidden behind a tap.

## Privacy / safety notes

- All score computations happen on-device; nothing about the user's body is uploaded.
- The exercise rule descriptions explain _how_ the system assesses form — they do not pathologize movement patterns.
- The screen never displays an image of the user's body, posed or otherwise. No comparison illustration of "your body vs. ideal body."

## Do not fake

- Do not display a per-rule score that wasn't computed by the rule.
- Do not show an "AI confidence: 99%" rating without a real confidence pipeline.
- Do not display fake "elite athletes score 92+ on this" comparison badges.
- Do not phrase improvement cues in medical terms ("Anterior pelvic tilt detected").
- Do not display a personalized "injury risk" gauge — banned vocabulary.
- Do not invent the "How we score" rules; reference the actual rules in the codebase.
