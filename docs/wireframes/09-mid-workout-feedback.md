# 09 — Mid-Workout Form Feedback

## Purpose

Document how _one_ form correction surfaces during an active set — the single most important interaction in the entire product. This wireframe is not a separate screen; it is a state of the active workout screen (`08-active-workout.md`). It deserves its own document because the safety, tone, and timing of these cues is the difference between a coach and a noisy app.

## Route

Sub-state of `/workout/:id/active` (no dedicated route).

## Future implementation phase

**Phase 23+** introduces multi-exercise form rule sets and the cue dispatching logic. The visual component (`FormCueCard`) is built in Phase 9.

## Entry points

- Form engine emits a cue with priority above current threshold (or no current cue exists).

## Exit points

- Cue auto-dismisses after a short duration (~3 seconds typical, exact value tuned in Phase 23).
- Replaced by a higher-priority cue.
- User completes a rep cleanly and the cue is no longer relevant.
- Confidence drops → cue is withdrawn; UI returns to neutral.

## Primary user action

None — cues are non-interactive. The user's only job is to keep moving and incorporate the cue.

## Secondary actions

- Tap the cue card to dismiss it manually (rarely needed; mostly a power-user affordance).
- Mute voice via the top HUD (cues still appear visually).

## Wireframe — no cue (neutral)

```
┌──────────────────────────────────────┐
│ ⏸  Set 1 / 3 · 02:14    🔊        ✕ │
├──────────────────────────────────────┤
│                                      │
│         [camera + skeleton]          │
│                                      │
│                                      │
│                                      │
│                                      │  ← no cue card; quiet state
│                                      │
│                                      │
├──────────────────────────────────────┤
│  Bodyweight squat                    │
│                  07                  │
│                / 10                  │
└──────────────────────────────────────┘
```

## Wireframe — single cue

```
┌──────────────────────────────────────┐
│ ⏸  Set 1 / 3 · 02:14    🔊        ✕ │
├──────────────────────────────────────┤
│                                      │
│         [camera + skeleton]          │
│                                      │
│                                      │
│   ┌────────────────────────────┐     │
│   │  ↳  Keep your chest up.    │     │  ← cue card, slides in
│   └────────────────────────────┘     │     dwell ~3s, slide out
│                                      │
│                                      │
├──────────────────────────────────────┤
│  Bodyweight squat                    │
│                  07                  │
│                / 10                  │
└──────────────────────────────────────┘
```

## Wireframe — low confidence (no cue, helpful banner)

```
┌──────────────────────────────────────┐
│ ⏸  Set 1 / 3 · 02:14    🔊        ✕ │
├──────────────────────────────────────┤
│                                      │
│         [camera, dimmer]             │
│                                      │
│   ┌────────────────────────────┐     │
│   │ ⓘ  Step into the frame.    │     │  ← system banner (not a form cue)
│   └────────────────────────────┘     │     identical position, neutral color
│                                      │
│                                      │
├──────────────────────────────────────┤
│  Bodyweight squat                    │
│                  07                  │
│                / 10                  │
└──────────────────────────────────────┘
```

## Wireframe — replacement cue (cross-fade)

```
┌──────────────────────────────────────┐
│ ⏸  Set 1 / 3 · 02:14    🔊        ✕ │
├──────────────────────────────────────┤
│                                      │
│         [camera + skeleton]          │
│                                      │
│   ┌────────────────────────────┐     │
│   │  ↳  Slow down going down.  │     │  ← higher-priority cue
│   └────────────────────────────┘     │     replaces previous via cross-fade
│                                      │
│                                      │
├──────────────────────────────────────┤
│  Bodyweight squat                    │
│                  07                  │
│                / 10                  │
└──────────────────────────────────────┘
```

## Cue dispatch rules

1. **One cue, never a stack.** When a new cue arrives:
   - If no current cue is showing, slide the new cue in (200ms ease-out).
   - If a current cue is showing, cross-fade to the new cue (200ms cross-fade).
   - Never overlap; never queue more than one at a time.
2. **Priority order is set by the exercise rule set.** A safety-related cue (e.g. lower back rounding) always outranks a tempo cue (e.g. going too fast).
3. **Cool-off.** After a cue dwells and fades, do not re-fire the same cue for at least 5 seconds, even if the underlying rule continues to fire. Repetition is nagging.
4. **Silent on uncertainty.** If pose confidence drops below threshold, the form engine emits no cue. Instead, the _system banner_ (different visual style — neutral icon, no movement arrow) suggests setup adjustments (Design Principle 12, low-confidence flow in `../USER_FLOWS.md` §E).
5. **Praise sparingly.** Optional positive cue ("Nice rep.") only fires after a streak of clean reps and at most once per set. Not on every rep.
6. **Voice mirrors visual.** If voice is enabled, the cue is spoken once via `speechSynthesis`. Voice is muted when the user disables it; visual cues continue.

## Content rules

- Cue copy is **short, corrective, present tense, second person.**
- Allowed structure: `<verb> <object>` ("Keep your chest up", "Push through your heels"), or `<comparator>` ("Slow down going down").
- Maximum length: 6 words. Anything longer means the cue is doing two things and needs splitting.
- No exclamation marks. The product never shouts.
- No medical, injury, or risk language (Design Principle 6).
- No emojis inside cue copy.
- The cue icon (`↳`) communicates "adjust this"; it is distinct from the system info icon (`ⓘ`) used for low-confidence banners.

## Data requirements (future only)

| Data point           | Source (future)               | Phase |
| -------------------- | ----------------------------- | ----- |
| Active cue           | Per-exercise form rule output | 21–24 |
| Confidence threshold | Pose pipeline                 | 18    |
| Cue priority         | Rule definition               | 21+   |
| Voice playback       | TTS adapter                   | 25    |
| Cue history per set  | Session store                 | 29    |

## States to handle later

- **No cue** → quiet camera; rep counter only.
- **Cue active** → card visible.
- **Cue replaced** → cross-fade.
- **Cue dismissed manually** → tap-to-hide; rule engine may re-fire later if condition persists past cool-off.
- **Low confidence** → suppress form cues; show system banner.
- **Voice unavailable** → continue with visual cues only; do not block.
- **Audio focus interrupted (incoming call, OS notification)** → pause voice without pausing the workout; resume when audio focus returns.
- **Reduced motion** → cue card appears without slide; cross-fade still allowed (opacity transition is gentle).

## Accessibility notes

- Cue card region is `aria-live="assertive"` because the timing matters during movement.
- System banner is `aria-live="polite"` (less urgent).
- Cue icon must include an accessible name ("Form cue").
- If voice is enabled, screen reader voice and TTS voice can collide — Phase 25 must mute the screen reader for the cue text (or vice versa) depending on the user's preference; honest default is "screen reader wins" and Motionly's TTS does not fire.

## Privacy / safety notes

- Cues are derived from the on-device form engine; nothing is sent to any server to generate a cue.
- Cue history may be saved per session for the summary; landmarks themselves are not stored.
- If the form engine emits a cue tagged as a safety override (e.g. severe lower back rounding sustained), it may be displayed regardless of cool-off — but its copy still avoids medical language ("Reset your back" rather than "Risk of injury").

## Do not fake

- Do not display a cue when the form engine has produced nothing. A blank cue card slot is correct.
- Do not display "Great form!" simply because no negative cue is active. Praise is intentional, sparse, and earned.
- Do not loop the same cue every rep; that is nagging, not coaching.
- Do not invent a "form score" overlay number mid-rep — scoring is a per-rep computation surfaced at set / session level, not as a live overlay.
- Do not use language that names body parts in clinical ways ("lumbar flexion", "valgus collapse"). Plain language only.
