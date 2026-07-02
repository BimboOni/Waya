# Waya — Dashboard Redesign: The Definitive Spec

> This prompt defines what Waya is as a product. It supersedes all previous
> dashboard instructions. Read every word before writing a single line of code.
> Read `.agents/rules/design-system.md` and `onboarding-flow-redesign.md` first.

---

## 1. The Core Mental Model — Read This Twice

Waya is NOT a chatbot. Waya is a study companion with a beautiful home that
you return to. The AI conversation is the engine underneath — but what the
user sees is their progress, their subjects, their growth.

The correct reference is Spotify, not ChatGPT. When you open Spotify you see
YOUR music. When you open Waya you see YOUR learning. The Ask Waya input is
prominent and inviting, but it lives on a home screen full of life and color —
not as a persistent thread on a blank screen.

**Session model:** User arrives at home → sees their dashboard → types a topic
→ enters a session (full conversation with DeepSeek, explanation + synthesis
question) → answers → earns XP → session ends → returns home. Home now
reflects their updated XP, the session appears in history, the knowledge map
has a new node. This cycle IS the product.

---

## 2. Navigation — Top Bar Only, No Sidebar

Delete the dark teal left sidebar entirely. Replace with a clean top navigation:

```
[Waya]    Study  |  Subjects  |  Map  |  History  |  Profile      [🔥 4] [⚡ 350] [Lv.2 ▸]
```

- **Left:** "waya" wordmark in `--color-brand-primary`
- **Center:** 4 tabs — Study / Subjects / Map / History. Active tab has a
  2px bottom border in `--color-brand-primary`. Inactive tabs are
  `--color-text-muted`. Profile moves to a circular avatar at the right.
- **Right:** Streak pill (flame icon + number, `--color-streak-container` bg,
  `--color-streak-text` text), XP pill (bolt icon + number,
  `--color-xp-container` bg, `--color-xp-text` text), then circular avatar
  that opens a dropdown (Profile / Settings / Sign out).
- Bottom border: `--color-border-default`, 1px.
- Height: 64px. Sticky (stays at top on scroll).
- **Mobile (<768px):** Top bar keeps wordmark + avatar only. Bottom bar has
  the 4 navigation tabs (Study / Subjects / Map / History) as icon + label.

---

## 3. Study Tab — The Home Dashboard

This is the most important screen in the app. It must feel like arriving
somewhere beautiful, personal, and alive.

### 3.1 Greeting Header
Full-width, generous top padding (48px). Two lines:
- Line 1: "Good evening, Abimbola" — `headline-lg`, `--color-text-primary`
- Line 2: Contextual subtitle that changes based on state:
  - New user: "Welcome to Waya. Let's start your first session."
  - Has streak: "You're on a 4-day streak. Keep it going 🔥"
  - Returning, no streak today: "Ready to learn something new today?"
- Below the subtitle: a slim XP progress bar, full width, height 6px,
  `--color-xp` fill on `--color-bg-secondary` track, showing progress to
  next level. Label right-aligned: "Explorer · 350 / 500 XP" in `body-sm`.

### 3.2 Ask Waya — The Hero Element
This is the single dominant element of the page. Give it room.

Large card, `--border-radius-xl`, padding 40px, background: a very light tint
of brand primary (use `--color-bg-secondary` — the pale lavender already in
the system). Inside:

- Top: a small teal geometric spark icon (use `ti-sparkles` from Tabler
  Icons as a placeholder — will be replaced with custom icon when assets
  are ready) inline with heading text, rendered in `--color-brand-primary`
- Heading: "What do you want to learn about?" — `headline-md`,
  `--color-text-primary`
- Subline: "I'll explain it through {interest1} and {interest2}, then test
  your understanding." — populate with the user's actual saved interests,
  `body-sm`, `--color-text-muted`
- `<textarea>` below: min-height 80px, white bg, `--border-radius-md`,
  `body-lg` text, placeholder: "e.g. Photosynthesis, The French Revolution,
  Prime numbers..." Auto-expands as user types (no fixed height cap).
- "Ask Waya" button: full width below the textarea, height 56px, large,
  `bg-brand-primary`, `text-brand-on-primary`, `label-lg`, sparkles icon
  left of text. This button must feel like the most important button on the
  page — give it weight.
- Below button: 3 suggested topic chips in a row — small pill buttons, each
  pre-populated based on `preferredSubject` + `interests`. e.g. for Creative
  Arts + Fashion: "History of fashion illustration" / "Colour theory in
  design" / "What is typography?". Clicking a chip fills the textarea.

### 3.3 Recent Sessions
Below the hero card, section title "Recent sessions" (`title-lg`) with "See
all →" right-aligned linking to History tab.

3 most recent sessions as cards. Each card:
- Left: circular icon badge (40px) in subject container color with subject
  icon in subject text color
- Middle: topic name (`title-md`), relative date below (`body-sm`, muted)
- Right: "+50 XP" in `--color-success`, and a "→" chevron
- White bg, `--border-radius-md`, 16px vertical padding, border
  `--color-border-default`
- Hover: slight lift (-2px translateY), border shifts to `--color-brand-primary`
- Clicking opens that session in a read-only view

### 3.4 Subjects Strip
Below recent sessions: a horizontal row of 4 compact subject cards (not the
full Subjects tab — this is a quick glance). Each shows: subject icon, subject
name, "{N} topics" in muted text. Background: the subject's container color.
Clicking navigates to Subjects tab filtered to that subject.

---

## 4. Session View — When the User Asks a Topic

When the user submits a topic from the Ask Waya card, the session view slides
in (Framer Motion: x from 100% to 0, spring physics). This is a full-screen
experience overlaying the dashboard (not a separate route — use a sheet/panel
pattern so the back transition feels instant).

### 4.1 Session Header
- Back arrow ("← Back to Study") top left — returns to dashboard
- Subject tag (e.g. "CREATIVE ARTS") center, in subject container color
- XP counter top right, animating when XP is earned

### 4.2 Conversation Area
- Waya's explanation message renders first (streamed from DeepSeek, typewriter
  effect character by character at ~30ms per character). Waya's messages have
  a light teal-tinted background (`--color-bg-secondary`), a small teal
  spark icon left of the message bubble.
- User messages align right, white bg, brand-primary border.
- After explanation completes, synthesis question appears in a visually
  distinct card: slightly indented, `--color-bg-secondary` background, a
  small "Synthesis Challenge" label in `label-md` above it.

### 4.3 Answer Input
- Same textarea + submit button pattern as home, but smaller (min-height 56px)
- After user submits their answer, Waya responds with feedback, then the
  session ends: a "Session Complete" banner appears at the bottom of the
  conversation with the XP earned and a "Back to Study" button.

---

## 5. New User First Experience

Triggered when `user.totalSessions === 0` (check on dashboard mount).

**Step 1 — Welcome modal:** Full-screen overlay (`bg-black/40` backdrop blur
replaced with `bg-black/30` alpha per design system — no blur filters).
Center card: white background, `--border-radius-xl`, padding 48px, max-width
480px, centered vertically and horizontally.

Inside the card:
- A simple flat geometric illustration at the top: a large rounded square
  in `--color-brand-primary` (80px, border-radius 40%) with two white
  circles as eyes — this is a deliberate placeholder for a future mascot/logo.
  It gives the modal warmth and personality without committing to a character
  design that hasn't been created yet. When the real logo/mascot SVG is ready,
  it replaces this exactly.
- Spring bounce on entry: scale 0 → 1.15 → 1, stiffness 300, damping 18.
- Headline: "Welcome to Waya, {name}! 👋" — `display-sm`, centered,
  `--color-text-primary`
- Subline: "You picked {preferredSubject}. I'll teach you everything through
  {interest1} and {interest2}." — `body-md`, centered, `--color-text-secondary`
- "Let's go →" button: uses the 3D press style — `bg-brand-primary`,
  `text-brand-on-primary`, `border-b-4 border-[color slightly darker than
  primary]`, `active:translate-y-1 active:border-b-0` — this button style
  is the signature interaction of the app, use it consistently everywhere.
- Framer Motion entry: entire card scales from 0.85 → 1, opacity 0 → 1,
  spring physics. Not a linear fade — it should feel like it pops into place.

**Steps 2-4 — Spotlight tooltips:** After welcome modal closes, 3 sequential
guided tooltips. Each tooltip:
- Dark overlay (`bg-black/50`) with a rounded rectangular cutout highlighting
  the target element (use a CSS box-shadow inset technique or SVG clip-path
  to create the spotlight effect)
- Tooltip card positioned adjacent to the spotlight: white bg,
  `--border-radius-lg`, padding 20px, max-width 280px, a small triangle
  pointer toward the spotlight target
- Step counter "2 of 4" in `label-md`, `--color-text-muted`
- Instruction text in `body-md`, `--color-text-primary`, max 2 lines
- "Next →" button (3D press style, smaller: `px-4 py-2`) and "Skip" plain
  text link in `--color-text-muted`
- Transition between steps: tooltip card slides and fades as spotlight moves
  to new target (Framer Motion layout animation)

Spotlight targets:
- Step 2: Ask Waya textarea + button — "Type any topic here. I'll explain
  it using what you love."
- Step 3: XP pill in top nav — "You earn XP for every session. Watch this
  grow as you learn."
- Step 4: Suggested topic chips — "Not sure where to start? These are
  personalised just for you."

**Suggested first topic pre-fill:** After tooltips close, textarea is
pre-filled (not placeholder — actual value, editable) with a topic generated
from `preferredSubject` + `interests`. Store as `user.suggestedFirstTopic`
on account creation:
- Creative Arts + Fashion → "The history of fashion illustration"
- Creative Arts + Music → "How chord progressions create emotion"
- Creative Arts + Gaming → "Visual storytelling in video game design"
- Mathematics + Gaming → "How probability works in video games"
- Mathematics + Sports → "The geometry behind a perfect free kick"
- Mathematics + Music → "Why music and maths are the same language"
- Science & Tech + Sneakers → "The materials science behind Air Max soles"
- Science & Tech + Gaming → "How game physics engines simulate reality"
- Science & Tech + Fashion → "How synthetic fabrics are engineered"
- History & Culture + Music → "How the blues shaped modern music"
- History & Culture + Gaming → "Ancient civilisations that inspired game worlds"
- History & Culture + Fashion → "How fashion reflected political power through history"
- (Build remaining combinations following the same pattern)
The textarea shows this text pre-filled. User can edit freely or hit Ask Waya.

---

## 6. Subjects Tab

2×2 grid of subject cards. Each card:
- Background: subject container color (`--color-subject-{x}-container`)
- Large subject icon (48px), subject name (`headline-sm`),
  "{preferredSubject}" badge if this is their focus (teal pill, top right)
- Stats: "{N} topics explored" and "{N} XP earned" in this subject
  (query via GROUP BY on Session table)
- Zero-state: "Start exploring →" with a suggested starter topic chip
- Clicking navigates to History tab filtered to that subject, OR opens a
  subject-specific Ask Waya modal with the subject pre-selected

---

## 7. Gamification System

### 7.1 XP Rules
- Complete a session (send at least one message): +10 XP
- Answer synthesis question (any answer): +30 XP
- Answer synthesis question correctly (Waya confirms understanding): +50 XP
- 7-day streak: +100 XP bonus
- First session of the day: +20 XP bonus

### 7.2 Levels
Curious (0-500 XP) → Explorer (501-1500 XP) → Connector (1501-3000 XP) →
Architect (3001-6000 XP) → Polymath (6000+ XP)

### 7.3 Feedback Moments

**Every XP earn (in-session):**
- "+{N} XP" badge animates up from the input and fades (y: 0 → -40px,
  opacity 1 → 0, 800ms). Uses `--color-success` color.
- Subtle chime sound (use Tone.js to generate a short sine wave at 880Hz,
  80ms duration, fast attack/release — no audio file needed).

**Session complete:**
- XP bar on dashboard animates: smooth width transition over 1.2s using
  `cubic-bezier(0.34, 1.56, 0.64, 1)` (slight overshoot for satisfying feel).
- No sound for session complete itself — the XP bar animation is enough.

**Level up (when XP crosses threshold):**
- Full-screen celebration modal: the same placeholder logo shape (rounded
  square, brand primary, two white eyes) with a spring scale bounce, plus
  sparkle shapes in `--color-xp` and `--color-milestone` popping radially).
- Confetti burst using `canvas-confetti` library — colors limited to
  `--color-brand-primary`, `--color-xp`, `--color-milestone`, `--color-streak`.
- Heading: "Level Up!" in `display-md`. Subline: "You're now an Explorer."
- Level-up sound: Tone.js three-note ascending chord (C5, E5, G5), each note
  80ms, staggered 100ms apart. Clear, satisfying, not annoying.
- "Keep learning →" button closes modal and returns to dashboard.

**7-day streak milestone:**
- Similar to level-up but streak-themed: flame animation, coral colors.
- Streak sound: two ascending notes (A4, D5).

### 7.4 Streak System
- Streak increments if user completes at least one session per calendar day.
- Streak breaks if a full calendar day passes with no session.
- Show streak freeze option at 5+ day streaks (one free freeze per week) —
  UI only for now, backend logic in a later pass.

---

## 8. History Tab

Session history grouped by subject (expandable sections, like what's already
built — keep this structure, it's correct). Each session row:
- Colored dot in subject color
- Topic name, date, "DONE" badge in `--color-success`
- Clicking expands inline to show the full conversation summary + XP earned

---

## 9. Map Tab

Keep the existing React Flow knowledge map. Improvements:
- Nodes must use the subject color system: Math nodes use
  `--color-subject-math` fill with `--color-subject-math-text` label.
  Science nodes use `--color-subject-science`, etc.
- Node size should reflect session count on that topic (more sessions =
  slightly larger node, max 1.5× base size).
- Empty state: the placeholder logo shape + "Your map grows as you learn. Ask
  Waya your first topic to plant the first seed." + Ask Waya button.

---

## 10. Profile Tab (via avatar dropdown or dedicated route)

- Level badge prominently at top (large, celebratory)
- XP bar showing progress to next level, with level name either side
- Streak calendar (last 30 days, filled dots for days with sessions)
- Badge grid: earned badges full color, locked badges desaturated with lock
  icon. Each badge has a name and unlock condition shown on hover.
- Stats: total sessions, total XP, favorite subject (most sessions),
  member since date.

---

## 11. Sound Implementation

Use Tone.js exclusively — no audio files, no external CDN audio assets.
All sounds are programmatically generated:

```typescript
// lib/sounds.ts
import * as Tone from 'tone'

export async function playXPChime() {
  await Tone.start()
  const synth = new Tone.Synth({ oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 }
  }).toDestination()
  synth.triggerAttackRelease('A5', '64n')
}

export async function playLevelUp() {
  await Tone.start()
  const synth = new Tone.PolySynth(Tone.Synth).toDestination()
  synth.triggerAttackRelease(['C5', 'E5', 'G5'], '8n')
}

export async function playStreak() {
  await Tone.start()
  const synth = new Tone.Synth().toDestination()
  const now = Tone.now()
  synth.triggerAttackRelease('A4', '8n', now)
  synth.triggerAttackRelease('D5', '8n', now + 0.15)
}
```

All sounds respect a global mute toggle stored in user preferences. Add a
small mute/unmute icon in the top nav (speaker icon, right of the streak pill).

---

## 12. Custom Icon Asset Specification

Custom SVG icons are being designed separately and will be added to the
codebase as React SVG components in `components/icons/`. Until they arrive,
use the Tabler Icon placeholders listed below. When the custom assets are
ready, they are drop-in replacements — same component name, same props.

**Do not use emoji as icons anywhere in the app.** Use Tabler Icon placeholders
only, and note every placeholder location in a comment so custom assets can
be swapped efficiently.

### 12.1 Subject Icons (4 required)
| Subject | Placeholder | Final component name |
|---|---|---|
| Mathematics | `ti-math-symbols` | `<MathIcon />` |
| Science & Tech | `ti-flask` | `<ScienceIcon />` |
| History & Culture | `ti-world` | `<HistoryIcon />` |
| Creative Arts | `ti-palette` | `<ArtsIcon />` |

These icons must render in the subject's `-text` color against its `-container`
background. Build them as components that accept a `size` prop (default 24).

### 12.2 Gamification Icons (3 required)
| Concept | Placeholder | Final component name |
|---|---|---|
| XP / Energy | `ti-bolt` | `<XPIcon />` |
| Streak / Flame | `ti-flame` | `<StreakIcon />` |
| Badge / Achievement | `ti-medal` | `<BadgeIcon />` |

### 12.3 UI Icons (use Tabler directly, no custom replacement needed)
- Ask/Submit: `ti-sparkles`
- New session: `ti-plus`
- Back navigation: `ti-arrow-left`
- Settings/gear: `ti-settings`
- Close/dismiss: `ti-x`
- Mute/unmute sound: `ti-volume` / `ti-volume-off`
- Chevron/expand: `ti-chevron-right`
- Check/complete: `ti-check`

### 12.4 Badge Designs (MVP set — 9 badges)
Badges are circular or hexagonal flat shapes built in SVG using design system
colors. Use the `<BadgeIcon />` component as the inner element. Each badge
has a distinct color treatment:

| Badge | Unlock condition | Color |
|---|---|---|
| First Step | Complete first session | `--color-brand-primary` |
| On Fire | 7-day streak | `--color-streak` |
| Unstoppable | 30-day streak | `--color-streak` (deeper tone) |
| Explorer | Complete 10 sessions total | `--color-xp` |
| Math Mind | Complete 5 Mathematics sessions | `--color-subject-math` |
| Science Brain | Complete 5 Science & Tech sessions | `--color-subject-science` |
| History Buff | Complete 5 History & Culture sessions | `--color-subject-history` |
| Creative Soul | Complete 5 Creative Arts sessions | `--color-subject-arts` |
| Polymath | Reach Polymath level (6000 XP) | `--color-milestone` |

Locked badges render at 30% opacity with a `ti-lock` overlay. Earned badges
render at full color with a subtle shimmer animation on first unlock.

### 12.5 Logo Placeholder
Until the real logo/wordmark SVG is delivered, the "waya" text wordmark
(current implementation) is correct and should stay. The geometric placeholder
shape (rounded square, brand primary, two white eyes) described in Section 5
is used ONLY in the welcome modal and empty states as a warmth element — it
is explicitly a placeholder, not a design decision. When the real logo arrives
it replaces it.

---



This section defines the feeling of the product. Every component decision
should be filtered through this.

### 12.1 The Button Style
Every primary action button uses the 3D press effect — this is Waya's
signature interaction and what makes it feel playful and premium simultaneously:
```html
<button className="
  bg-brand-primary text-brand-on-primary
  px-6 py-3 rounded-full
  border-b-4 border-[#0b8585]
  font-body text-label-lg
  transition-all duration-[100ms]
  active:translate-y-1 active:border-b-0
  hover:brightness-105
  focus-visible:outline-2 focus-visible:outline-brand-primary
">
```
The `border-b-4` creates a physical depth — the button looks pressable. The
`active:translate-y-1 active:border-b-0` makes it actually press down when
clicked. This must be on EVERY primary button in the dashboard: Ask Waya,
Let's go, session submit, level-up close. Secondary buttons use the same
shape but `bg-transparent border-2 border-brand-primary text-brand-primary`.

### 12.2 Card Personality
Cards are not just white boxes with borders. They should feel like physical
objects on a surface:
- White cards on `--color-bg-primary` (the pale lavender-white): give them
  `border border-border-default` — the 1px border defines them without shadow.
- Tinted cards (Ask Waya hero, subject strip items): use the exact container
  colors from the design system — these are the moments of color on the page.
- Hover on interactive cards: `-translate-y-1` + border shifts to
  `--color-brand-primary`. This subtle lift is what makes the interface feel
  alive. Every card that can be clicked must have this.
- Corner radius: `--border-radius-xl` (24px) for hero cards and modals.
  `--border-radius-lg` (16px) for content cards. `--border-radius-md` (10px)
  for small elements like chips and badges. Never mix these arbitrarily —
  bigger containers get bigger radii.

### 12.3 Color Usage Rules
Color is the difference between "generic" and "Waya." Rules:
- **Teal (`--color-brand-primary`) is for action only.** Buttons, active tab
  indicator, focus rings, links. Not for decorative fills or backgrounds.
- **Subject colors are for identity.** Math is always purple, Science always
  teal-cyan, History always terracotta, Arts always pink. Use consistently
  everywhere a subject appears — sidebar tag, session header, knowledge map
  node, subjects card, history row dot.
- **Gamification colors are for reward.** XP is lime green. Streak is coral.
  Milestone/badge is purple. These colors should only appear in contexts that
  feel like earning or achievement — not as general decoration.
- **Neutral surfaces dominate.** Most of the screen should be
  `--color-bg-primary` (pale lavender-white) and white. Color appears in
  specific moments: subject cards, gamification pills, CTAs. If you look at
  the screen and color is everywhere, something is wrong.

### 12.4 Typography Hierarchy
Every screen should have exactly ONE `headline-lg` or larger. Everything else
is smaller. If two things are the same visual weight, one of them needs to
be quieter. This is how hierarchy works. Apply it strictly.

### 12.5 Spacing = Luxury
The single fastest way to make something feel premium is more whitespace.
When in doubt, add 8px more padding. Cards breathe. Sections have generous
gaps (32-48px). Nothing feels cramped. If a section looks right, add 8px
more internal padding and look again — it usually looks better.

---



Before calling this done, open Brilliant.org and Waya side by side.
Ask yourself:
- Does Waya's home feel as alive and personal as Brilliant's home?
- Does the XP bar animation feel as satisfying as a progress moment should?
- Is there one dominant element on every screen, or does everything compete?
- Are cards breathing — generous padding, not cramped?
- Does the color feel intentional — teal for action, subject colors for
  identity, gamification colors for reward?

If Waya looks like a developer built it and Brilliant looks like a designer
built it, keep going. This prompt is not done until they're comparable.

---

## 13. Definition of Done

- [ ] Left sidebar is gone. Top navigation with 4 tabs is in place.
- [ ] Study tab has greeting, XP bar, Ask Waya hero card with suggested chips,
      recent sessions, subjects strip
- [ ] Session view slides in over dashboard, supports DeepSeek streaming
- [ ] New user experience: welcome modal → 3 tooltips → pre-filled topic
- [ ] Subjects tab: 2×2 grid with stats per subject, zero-state handled
- [ ] XP earn animation plays in-session after synthesis answer
- [ ] Level-up modal with confetti and Tone.js sound fires when threshold hit
- [ ] Tone.js sounds implemented and respect mute toggle
- [ ] Knowledge Map nodes colored by subject
- [ ] No console errors. No hardcoded hex values. All tokens from design system.
- [ ] Tested at 375px and 1280px.

Send a screen recording walking through: home dashboard → new user experience
→ ask a topic → complete a session → return home → see XP updated.