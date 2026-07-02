# Waya — XP System, Subjects, Conversations & Visual Polish

Read `.agents/rules/design-system.md` before starting.
This prompt covers five distinct areas — complete them in order.

---

## 1. XP System Recalibration

### 1.1 New XP Values
Replace all existing XP award logic with this system:

| Action | XP |
|---|---|
| Start a session (submit any topic) | +5 XP |
| Receive full explanation (stream complete) | +5 XP |
| Submit synthesis answer (any answer) | +5 XP |
| Synthesis answer correct (Waya confirms) | +10 XP bonus |
| First session of the day | +5 XP bonus |
| **Maximum per session** | **25 XP** |

### 1.2 Level Thresholds
Update `lib/gamification.ts` (or wherever levels are defined):

```typescript
export const LEVELS = [
  { name: 'Curious',   minXP: 0,    maxXP: 149  },
  { name: 'Explorer',  minXP: 150,  maxXP: 399  },
  { name: 'Connector', minXP: 400,  maxXP: 799  },
  { name: 'Architect', minXP: 800,  maxXP: 1499 },
  { name: 'Polymath',  minXP: 1500, maxXP: Infinity },
]

export function getLevelForXP(xp: number) {
  return LEVELS.findLast(l => xp >= l.minXP) ?? LEVELS[0]
}

export function getProgressToNextLevel(xp: number) {
  const current = getLevelForXP(xp)
  const next = LEVELS[LEVELS.indexOf(current) + 1]
  if (!next) return 100 // Polymath = always full bar
  return Math.round(((xp - current.minXP) / (next.minXP - current.minXP)) * 100)
}
```

### 1.3 Fix XP Persistence Bug
After a session completes, XP must be written to the database AND the
dashboard must re-fetch user data when returning to the Study home.
The current bug: XP flash shows "+50 XP" but the pill stays at 0 and the
XP bar doesn't update after returning from session.

Fix: after `POST /api/sessions` (or wherever session completion is saved),
invalidate/refetch the user profile query so the top nav XP pill and the
XP progress bar on the Study home both reflect the new total immediately.
Use SWR mutate, React Query invalidation, or a Zustand store update —
whichever pattern is already in use. Test by completing a session and
confirming the XP pill number increases before the page is refreshed.

### 1.4 XP Display in Top Nav
The XP pill currently shows a number. Add the level name as a tooltip or
small label: "Explorer · 215 XP" format, or separate the level badge into
its own pill: `[Lv.2 Explorer]` to the right of the XP pill.

---

## 2. Streak System

### 2.1 Streak Pill is Missing from Top Nav
The streak pill (flame icon + streak count) is specified in the nav but
not rendering. Fix: the top nav should show three items on the right:
1. Streak pill: `🔥 4` — background `--color-streak-container`,
   text `--color-streak`, flame icon left of number
2. XP pill: `⚡ 215` — background `--color-xp-container`,
   text `--color-xp`, bolt icon left of number  
3. Avatar circle — opens dropdown with Profile / Settings / Sign out

### 2.2 Streak Logic
A streak increments when the user completes at least one session on a
calendar day. It resets to 0 if a full calendar day passes with no session.
Store `lastSessionDate` (date string, not timestamp) on the `User` model.
On each session completion:
```typescript
const today = new Date().toISOString().split('T')[0]
const lastDate = user.lastSessionDate
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

let newStreak = user.streak
if (lastDate === today) {
  // already studied today, streak unchanged
} else if (lastDate === yesterday) {
  newStreak = user.streak + 1 // extends streak
} else {
  newStreak = 1 // streak broken, restart
}

await prisma.user.update({
  where: { id: user.id },
  data: { streak: newStreak, lastSessionDate: today }
})
```

---

## 3. Visual Polish — The 3D Feel

### 3.1 Primary Button — 3D Press Effect (EVERYWHERE)
Every primary action button must use this exact pattern:
```html
<button className="
  bg-brand-primary text-brand-on-primary
  px-6 py-3 rounded-full font-body text-label-lg
  border-b-4 border-[#0b8585]
  transition-all duration-[100ms]
  hover:brightness-105
  active:translate-y-[2px] active:border-b-0 active:border-t-[4px] active:border-t-transparent
  focus-visible:outline-2 focus-visible:outline-brand-primary
  disabled:opacity-50 disabled:cursor-not-allowed
">
```
Apply to: Ask Waya button, session answer submit button, welcome modal
"Let's Go" button, all onboarding Continue buttons. This is non-negotiable —
it's the tactile signature of the product.

### 3.2 Hero Card Background — Warm Teal Tint
The Ask Waya card background is currently grey. Change to a light teal
tint: `background: #E6F8F8` (or add `--color-ask-card-bg: #E6F8F8` to
globals.css and reference it). The rest of the page stays on
`--color-bg-primary` (#FCFAFF). The card should feel like a distinct,
warm, inviting space — not a grey box.

### 3.3 Interactive Card Hover States
Every clickable card (subject cards, session rows, history rows) must have:
- `hover:-translate-y-1` (1px lift)
- `hover:border-brand-primary` (border highlights to teal)  
- `transition-all duration-[200ms]`
- `cursor-pointer`

### 3.4 Synthesis Challenge Card — More Visual Presence
Currently just a thin left border. Upgrade to:
```html
<div className="
  bg-[#E6F8F8] border-l-4 border-brand-primary
  rounded-r-xl p-5 my-4
">
  <p className="text-label-md text-brand-primary mb-2 uppercase tracking-wide">
    Synthesis Challenge
  </p>
  <p className="text-body-md text-text-primary">{question}</p>
</div>
```

### 3.5 Session View — Waya Message Styling
Waya's explanation messages need a distinct visual identity:
- Small teal spark icon (ti-sparkles, 16px, brand-primary color) in a
  32px circle left of the message (matches the icon on the Ask Waya card)
- Message bubble: white background, `--border-radius-lg`, 1px border
  `--color-border-default`, generous padding (20px 24px)
- User messages: right-aligned, `--color-bg-secondary` background,
  same border radius, no icon

---

## 4. Subjects Tab — Full Subject View

### 4.1 Subject Cards Are Now Clickable
Each of the 4 subject cards on the Subjects tab and the Study home
subjects strip must navigate to a subject detail view when clicked.

### 4.2 Subject Detail Page: `/dashboard/subjects/[subject]`
Create a dedicated page for each subject. Layout:

**Header:**
- Large subject icon (48px) in a circle using subject container color
- Subject name in `headline-lg`
- Stats row: "{N} sessions" · "{N} XP earned" · "Your focus" badge if
  this is the user's `preferredSubject`
- "Start a new session" button (primary, 3D press style) that navigates
  to Study tab with the subject pre-selected as context

**Session History for This Subject:**
List of all sessions in this subject, newest first. Each row:
- Date (`body-sm`, muted)
- Topic/question (`title-md`)
- XP earned (`+N XP` in `--color-success`)
- Chevron right icon
- Clicking a row opens the conversation view (Section 5 below)

**Empty State:**
If no sessions yet:
- Subject icon (large, muted)
- "No sessions yet in {Subject}"
- "Try: {suggestedTopic}" chip that pre-fills Ask Waya and navigates
  to Study tab

---

## 5. Conversation History — Read-Only Session View

### 5.1 Session Detail: `/dashboard/sessions/[sessionId]`
When a user taps any past session (from History tab, Subject detail, or
Study home recent sessions), open a read-only conversation view showing
the full exchange.

Layout mirrors the active session view but with:
- "← Back" at top left (returns to wherever they came from)
- Subject tag center (same pill style as active sessions)
- Date + "COMPLETED" badge replacing the XP counter
- The full conversation rendered in order:
  1. User's original question (right-aligned bubble)
  2. Waya's explanation (left-aligned, with teal icon)
  3. Synthesis Challenge card (same styled card as in active sessions)
  4. User's answer (right-aligned bubble)
  5. Waya's feedback/response if any (left-aligned)
- "XP earned: +{N} XP" summary banner at the bottom
- "Study this topic again →" button that pre-fills Ask Waya with the
  same topic

### 5.2 Data Requirements
Sessions must store the full conversation content to render this view.
Verify `Session` model has (or add):
```prisma
model Session {
  id              String   @id @default(cuid())
  userId          String
  topic           String
  subject         String
  explanation     String   @db.Text
  synthesisQuestion String @db.Text
  userAnswer      String   @db.Text
  xpEarned        Int      @default(0)
  completedAt     DateTime @default(now())
  user            User     @relation(fields: [userId], references: [id])
}
```
If `explanation`, `synthesisQuestion`, or `userAnswer` are missing from
the current schema, add them via a Prisma migration.

---

## 6. Recent Sessions on Study Home

After returning from a session, the Study home must show a "Recent sessions"
section between the Ask Waya hero card and the Subjects strip. This was
specified in the original dashboard spec but isn't rendering.

Show the 3 most recent sessions, each as a card with:
- Subject icon badge (40px circle, subject container color + icon)
- Topic name (`title-md`)
- Relative date (`body-sm`, muted) — "Yesterday", "2 days ago", etc.
- `+N XP` in `--color-success`
- Hover lift + border highlight
- Clicking opens the session detail view (Section 5)

Section header: "Recent sessions" (`title-lg`) with "See all →" linking
to History tab.

---

## 7. Definition of Done

- [ ] XP per session is max 25 (not 50), correctly broken into components
- [ ] XP updates immediately in the top nav pill after session completes
      (without requiring a page refresh)
- [ ] Streak pill is visible in top nav with correct count
- [ ] Streak increments daily and resets on missed days
- [ ] Ask Waya button has 3D press effect (`border-b-4`, `active:translate-y-[2px]`)
- [ ] Ask Waya hero card has teal tint background (#E6F8F8), not grey
- [ ] Synthesis Challenge card has teal-tinted background and stronger styling
- [ ] Subject cards on Subjects tab navigate to `/dashboard/subjects/[subject]`
- [ ] Subject detail page shows session history for that subject + empty state
- [ ] Past sessions are viewable in full conversation read-only view
- [ ] Recent sessions section appears on Study home after first session
- [ ] All session rows across the app are clickable and open conversation view

---

## 8. Profile, Settings & Sign Out Pages

The avatar dropdown in the top nav links to three destinations. All three
must be fully functional — not placeholders or 404s.

### 8.1 Profile Page: `/dashboard/profile`

This is the "reward" page — the place a user goes to feel proud of their
progress. It must feel celebratory and personal.

**Layout (top to bottom):**

Avatar circle (64px, brand-primary bg, user initial, centered) + display
name in `headline-lg` + "Member since {month year}" in `body-sm` muted.

Level card: large teal-tinted card (`#E6F8F8` bg, `--border-radius-xl`,
generous padding). Shows current level name in `display-sm` (e.g.
"Explorer"), XP bar filling left to right with "{current} / {next} XP"
label, and a motivational line ("Keep going — Connector is {N} XP away").

Stats row: three compact metric cards side by side — total sessions (bolt
icon, XP color), current streak (flame icon, streak color), preferred
subject (subject icon, subject color).

Streak calendar: last 30 days as a 6-row × 5-col grid of small circles
(8px). Filled in `--color-streak` = studied that day. Empty in
`--color-border-default` = no session. Label: "Your streak history".

Badge grid: section title "Badges". 3-column grid. Earned = full color,
badge name below. Locked = 30% opacity, lock icon overlay, unlock
condition visible on hover. Use the 9 badges from the dashboard spec.

"← Back to Study" at top left.

### 8.2 Settings Page: `/dashboard/settings`

Three sections — Account, Preferences, Danger Zone.

**Account:**
- Display name: editable input + "Save" button (3D press style)
- Email: read-only display (no edit — MVP scope)
- Password: "Change password" sends Supabase password reset email +
  success toast ("Check your inbox")

**Preferences:**
- Sound effects toggle — connects to `lib/sounds.ts` global mute,
  persisted to `localStorage` key `waya_sound_enabled`
- Email reminders toggle — store in `user.emailReminders` boolean,
  backend email logic deferred post-MVP
- Theme: Light / Dark / System — sets `data-theme` on `<html>`,
  persisted to `localStorage` key `waya_theme`

**Danger Zone:**
- "Delete my account" — `border-2 border-error text-error` button
  (never use the primary teal style for destructive actions).
  Confirmation modal: "This will permanently delete your account, all
  sessions, and XP. This cannot be undone." → Cancel + red Delete button.
  On confirm: `DELETE /api/account` → sign out → redirect to `/`.

"← Back to Study" at top left.

### 8.3 Sign Out

Not a page — an immediate action from the dropdown:
1. Brief "Signing out..." disabled state on the menu item
2. `supabase.auth.signOut()`
3. Clear Zustand/localStorage state
4. `router.push('/')`

### 8.4 Avatar Dropdown Styling

- White bg, `--border-radius-lg`, `border border-border-default`
- `shadow-sm` (one of the few places a shadow is appropriate — dropdowns
  need depth to feel above the page content)
- Items: Profile / Settings / divider / Sign out
- Each item: `px-4 py-2.5`, `body-md`, hover `bg-bg-secondary`
- "Sign out" in `text-error` to signal destructive action
- Closes on outside click and Escape key

---

## 9. Updated Definition of Done

- [ ] XP per session is max 25, broken into correct components
- [ ] XP updates immediately in top nav pill after session (no refresh needed)
- [ ] Streak pill visible in top nav with correct daily count
- [ ] Streak logic: increments on consecutive days, resets on missed day
- [ ] Ask Waya button has 3D press effect on all primary buttons
- [ ] Ask Waya hero card has teal tint (#E6F8F8), not grey
- [ ] Synthesis Challenge card has teal background and clear visual weight
- [ ] Subject cards navigate to `/dashboard/subjects/[subject]`
- [ ] Subject detail shows session history + stats + empty state
- [ ] Past sessions openable as full read-only conversation views
- [ ] Recent sessions section on Study home after first session
- [ ] `/dashboard/profile` fully built with level, XP bar, streak calendar, badges
- [ ] `/dashboard/settings` built with Account, Preferences, Danger Zone sections
- [ ] Sign out works and redirects to landing page
- [ ] Avatar dropdown styled correctly and closes on outside click / Escape

---

## 10. Theme Switcher — Detailed Spec

The theme preference in Settings > Preferences must be a premium,
visually satisfying experience — not three radio buttons.

### 10.1 Component: ThemeSwitcher

Build as `components/settings/ThemeSwitcher.tsx`. A segmented control
with three options, each as a card:

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   ☀️  Light  │  │   🌙  Dark  │  │  ⚙️  System  │
│             │  │             │  │             │
│  [preview]  │  │  [preview]  │  │  [preview]  │
└─────────────┘  └─────────────┘  └─────────────┘
```

Each card (160px wide on desktop, equal thirds on mobile):
- Icon at top: `ti-sun` (Light), `ti-moon` (Dark), `ti-device-laptop`
  (System) — 24px, centered
- Label below icon: "Light" / "Dark" / "System" in `label-lg`
- Small preview strip below label: a tiny 3-color swatch showing what
  that theme looks like — for Light: white bg + dark text + teal accent.
  For Dark: near-black bg + light text + teal accent. For System: split
  diagonally, light on one side, dark on the other.
- Selected state: `border-2 border-brand-primary` + `bg-bg-secondary`
  background. A small teal checkmark badge top-right corner of the card.
- Unselected: `border border-border-default` + white bg.
- Hover: `border-border-strong` + `-translate-y-0.5` lift.
- Transition between selected/unselected: 200ms, same easing as all
  other interactions.

### 10.2 Instant Preview — Critical

When the user clicks a theme option, the theme MUST apply immediately
to the entire page — before they click any Save button. This is what
makes it feel premium vs. generic.

Implementation:
```typescript
function applyTheme(theme: 'light' | 'dark' | 'system') {
  const root = document.documentElement

  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
  } else {
    root.setAttribute('data-theme', theme)
  }

  localStorage.setItem('waya_theme', theme)
}
```

Call `applyTheme()` immediately on card click — no confirm step, no save
button needed for this setting. The preference is already persisted to
localStorage. Show a subtle "Saved" toast (2000ms expiry, bottom of
screen) so the user knows it stuck.

### 10.3 System Theme — Respects OS Setting

When "System" is selected:
- Apply the theme based on `prefers-color-scheme` immediately
- Add a `MediaQueryList` listener so if the user changes their OS theme
  while the app is open, Waya switches automatically:
  ```typescript
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  mq.addEventListener('change', (e) => {
    if (localStorage.getItem('waya_theme') === 'system') {
      document.documentElement.setAttribute(
        'data-theme', e.matches ? 'dark' : 'light'
      )
    }
  })
  ```
- The ThemeSwitcher card for "System" should show a small indicator of
  what the current OS setting is: "Currently: Dark" or "Currently: Light"
  in `label-sm` muted text below the label.

### 10.4 Theme Persistence on Load

In `app/layout.tsx` (or a top-level client component), read the saved
theme preference before first render to prevent a flash of wrong theme:

```typescript
// Inline script in <head> — runs before React hydration
<script dangerouslySetInnerHTML={{ __html: `
  (function() {
    const theme = localStorage.getItem('waya_theme') || 'light'
    if (theme === 'system') {
      const dark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    } else {
      document.documentElement.setAttribute('data-theme', theme)
    }
  })()
` }} />
```

This prevents the dreaded "flash of light mode" when a dark mode user
loads the page.

### 10.5 Dark Mode — Verify All Surfaces

Before calling this done, switch to dark mode and check every surface:
- Top nav: dark bg, light text, teal stays teal ✓
- Study home hero card: dark teal tint (use `#0D3333` or similar dark
  teal, not the light `#E6F8F8`)
- Session view: dark bg, light message bubbles
- All `--color-*` variables in `globals.css` dark block must render
  correctly — if any surface shows a hardcoded hex that doesn't respond
  to `[data-theme="dark"]`, flag it

### 10.6 Quick-Access Theme Toggle in Top Nav

In addition to the full settings page control, add a small theme icon
button to the top nav (between the XP pill and avatar):
- Icon: `ti-sun` in light mode, `ti-moon` in dark mode
- 32px clickable area, `--color-text-muted` color
- Clicking toggles between light and dark only (not system — system is
  set from Settings). Updates both the DOM and localStorage.
- Tooltip on hover: "Switch to dark mode" / "Switch to light mode"

This gives users a fast way to toggle without going into settings —
essential for a 10-16 year old audience who will want to switch modes
frequently.