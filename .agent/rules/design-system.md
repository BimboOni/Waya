---
trigger: always_on
---

# .agents/rules/design-system.md
## Waya — Design System Rules

> Single source of truth for tokens, verified against `waya-color-tokens.json` and `waya-typography-tokens.json`.
> Added `--color-on-brand-primary` for Primary Button text (flips with the theme-dependent button fill). Reverted `--color-text-inverse` to constant `#FFFFFF` for the Toast's fixed charcoal background, which doesn't change with theme.

---

## 1. Design Paradigm
*   **Mode:** Light default. Supports full theme inheritance (Light, Dark, System) via global CSS variables.
*   **Aesthetic:** Flat, matte, clean. Gradients on surfaces/backgrounds are strictly prohibited. Zero drop shadows on cards (use 1px borders instead).
*   **UX:** Demographics ages 10–16. Generous whitespace, min 44px targets, rounded corners.

---

## 2. Color Tokens
Variables mapped in `app/globals.css`:

```css
:root {
  --color-brand-primary: #4B5DFB;
  --color-on-brand-primary: #FFFFFF;
  --color-brand-secondary: #0EA4A4;
  --color-brand-hover: #3648E7;

  --color-bg-primary: #FCFAFF;
  --color-bg-secondary: #F1F0FF;
  --color-bg-card: #FFFFFF;
  --color-border-default: #C3C5E5;
  --color-border-strong: #737691;
  --color-text-primary: #181A25;
  --color-text-secondary: #434660;
  --color-text-muted: #8F909E;
  --color-text-inverse: #FFFFFF;

  --color-subject-math: #895AF6;
  --color-subject-science: #07B6D5;
  --color-subject-history: #D97959;
  --color-subject-arts: #EC4699;
  --color-subject-math-container: #E8DBFF;
  --color-subject-science-container: #ADECFF;
  --color-subject-history-container: #FFDCD1;
  --color-subject-arts-container: #FFDBE7;
  --color-subject-math-text: #23005C;
  --color-subject-science-text: #001D24;
  --color-subject-history-text: #380B00;
  --color-subject-arts-text: #3D0022;

  --color-xp: #82CB15;
  --color-xp-container: #ACF849;
  --color-streak: #FB6F84;
  --color-streak-container: #FFDBDD;
  --color-success: #21C45D;
  --color-success-container: #6CFE90;
  --color-error: #B81924;
  --color-error-container: #FFB3AD;
  --color-warning: #FCA103;
  --color-warning-container: #FFDCB8;
  --color-info: #3C83F6;
  --color-info-container: #D6E0FF;
  --color-milestone: #BF27D3;
  --color-milestone-container: #FFD6FC;

  --transition-default: 400ms ease;
  --transition-fast: 400ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1);
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;
}

[data-theme="dark"] {
  --color-brand-primary: #BDC2FF;
  --color-on-brand-primary: #0D0E11;
  --color-brand-secondary: #5FD8D8;
  --color-brand-hover: #E0E1FF;
  --color-bg-primary: #0D0E11;
  --color-bg-secondary: #181A25;
  --color-bg-card: #191B24;
  --color-border-default: #434660;
  --color-border-strong: #8C8FAB;
  --color-text-primary: #E0E0F0;
  --color-text-secondary: #C3C5E5;
  --color-text-muted: #8F909E;
  --color-text-inverse: #FFFFFF;
  --color-subject-math: #D1BDFF;
  --color-subject-science: #4BD7F7;
  --color-subject-history: #FFB69E;
  --color-subject-arts: #FFB2D0;
  --color-subject-math-container: #5415C1;
  --color-subject-science-container: #004C5C;
  --color-subject-history-container: #793016;
  --color-subject-arts-container: #8A0053;
  --color-subject-math-text: #E8DBFF;
  --color-subject-science-text: #ADECFF;
  --color-subject-history-text: #FFDCD1;
  --color-subject-arts-text: #FFDBE7;
  --color-xp: #91DB29;
  --color-xp-container: #2E4C00;
  --color-streak: #FFB2B9;
  --color-streak-container: #8B1833;
  --color-success: #4CE176;
  --color-success-container: #005221;
  --color-error: #FFB3AD;
  --color-error-container: #940014;
  --color-warning: #FFBA61;
  --color-warning-container: #663F00;
  --color-info: #ADC6FF;
  --color-info-container: #004594;
  --color-milestone: #FEA8FF;
  --color-milestone-container: #7C008A;
}
```

---

## 3. Typography Scales
`tokenSet: Waya Typography` | `baseFontSize: 16px`
`fontFamily.heading: Poppins (500, 600, 700)` | `fontFamily.body: Inter (400, 500)`

### 3.1 App Scaling Map (`contexts.app`)
| Style Name | Size | Line Height | Letter Spacing | Weight | Family |
|---|---|---|---|---|---|
| display-lg | 2.5rem | 3rem | −0.0125em | 600 | Poppins |
| display-md | 2.125rem | 2.625rem | −0.0074em | 600 | Poppins |
| display-sm | 1.75rem | 2.25rem | 0em | 600 | Poppins |
| headline-lg | 1.5rem | 2rem | 0em | 600 | Poppins |
| headline-md | 1.25rem | 1.75rem | 0em | 600 | Poppins |
| headline-sm | 1.125rem | 1.5rem | 0em | 500 | Poppins |
| title-lg | 1rem | 1.5rem | 0em | 500 | Poppins |
| title-md | 0.875rem | 1.25rem | 0.0107em | 500 | Poppins |
| title-sm | 0.8125rem | 1.125rem | 0.0077em | 500 | Poppins |
| body-lg | 1rem | 1.625rem | 0.0094em | 400 | Inter |
| body-md | 0.875rem | 1.375rem | 0.0179em | 400 | Inter |
| body-sm | 0.75rem | 1.125rem | 0.025em | 400 | Inter |
| label-lg | 0.875rem | 1.25rem | 0.0071em | 500 | Inter |
| label-md | 0.75rem | 1rem | 0.0333em | 500 | Inter |
| label-sm | 0.6875rem | 0.875rem | 0.0455em | 500 | Inter |

### 3.2 Responsive Marketing Core (`contexts.marketing`)
| Style Name | Mobile (<768px) | Tablet (≥768px) | Desktop (≥1280px) | Weight | Family |
|---|---|---|---|---|---|
| hero-lg | 2.5rem / 3rem lh | 3.5rem / 4rem lh | 4.5rem / 5rem lh | 700 | Poppins |
| hero-md | 2rem / 2.5rem lh | 2.75rem / 3.25rem lh | 3.5rem / 4rem lh | 700 | Poppins |
| hero-sm | 1.75rem / 2.25rem lh | 2.25rem / 2.75rem lh | 2.75rem / 3.25rem lh | 700 | Poppins |

---

## 4. Tailwind Configuration Abstraction
File: `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--color-brand-primary)',
          'on-primary': 'var(--color-on-brand-primary)',
          secondary: 'var(--color-brand-secondary)',
          hover: 'var(--color-brand-hover)'
        },
        bg: { primary: 'var(--color-bg-primary)', secondary: 'var(--color-bg-secondary)', card: 'var(--color-bg-card)' },
        border: { default: 'var(--color-border-default)', strong: 'var(--color-border-strong)' },
        text: { primary: 'var(--color-text-primary)', secondary: 'var(--color-text-secondary)', muted: 'var(--color-text-muted)', inverse: 'var(--color-text-inverse)' },
        xp: { DEFAULT: 'var(--color-xp)', container: 'var(--color-xp-container)' },
        streak: { DEFAULT: 'var(--color-streak)', container: 'var(--color-streak-container)' },
        success: { DEFAULT: 'var(--color-success)', container: 'var(--color-success-container)' },
        error: { DEFAULT: 'var(--color-error)', container: 'var(--color-error-container)' },
        warning: { DEFAULT: 'var(--color-warning)', container: 'var(--color-warning-container)' },
        info: { DEFAULT: 'var(--color-info)', container: 'var(--color-info-container)' },
        milestone: { DEFAULT: 'var(--color-milestone)', container: 'var(--color-milestone-container)' },
        subject: {
          math: { DEFAULT: 'var(--color-subject-math)', container: 'var(--color-subject-math-container)', text: 'var(--color-subject-math-text)' },
          science: { DEFAULT: 'var(--color-subject-science)', container: 'var(--color-subject-science-container)', text: 'var(--color-subject-science-text)' },
          history: { DEFAULT: 'var(--color-subject-history)', container: 'var(--color-subject-history-container)', text: 'var(--color-subject-history-text)' },
          arts: { DEFAULT: 'var(--color-subject-arts)', container: 'var(--color-subject-arts-container)', text: 'var(--color-subject-arts-text)' }
        }
      },
      fontSize: {
        'display-lg': ['2.5rem', { lineHeight: '3rem', letterSpacing: '-0.0125em', fontWeight: '600' }],
        'display-md': ['2.125rem', { lineHeight: '2.625rem', letterSpacing: '-0.0074em', fontWeight: '600' }],
        'display-sm': ['1.75rem', { lineHeight: '2.25rem', letterSpacing: '0em', fontWeight: '600' }],
        'headline-lg': ['1.5rem', { lineHeight: '2rem', letterSpacing: '0em', fontWeight: '600' }],
        'headline-md': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '0em', fontWeight: '600' }],
        'headline-sm': ['1.125rem', { lineHeight: '1.5rem', letterSpacing: '0em', fontWeight: '500' }],
        'title-lg': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0em', fontWeight: '500' }],
        'title-md': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.0107em', fontWeight: '500' }],
        'title-sm': ['0.8125rem', { lineHeight: '1.125rem', letterSpacing: '0.0077em', fontWeight: '500' }],
        'body-lg': ['1rem', { lineHeight: '1.625rem', letterSpacing: '0.0094em', fontWeight: '400' }],
        'body-md': ['0.875rem', { lineHeight: '1.375rem', letterSpacing: '0.0179em', fontWeight: '400' }],
        'body-sm': ['0.75rem', { lineHeight: '1.125rem', letterSpacing: '0.025em', fontWeight: '400' }],
        'label-lg': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.0071em', fontWeight: '500' }],
        'label-md': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.0333em', fontWeight: '500' }],
        'label-sm': ['0.6875rem', { lineHeight: '0.875rem', letterSpacing: '0.0455em', fontWeight: '500' }],
        'hero-lg': ['2.5rem', { lineHeight: '3rem', letterSpacing: '-0.0125em', fontWeight: '700' }],
        'hero-md': ['2rem', { lineHeight: '2.5rem', letterSpacing: '-0.0078em', fontWeight: '700' }],
        'hero-sm': ['1.75rem', { lineHeight: '2.25rem', letterSpacing: '0em', fontWeight: '700' }],
      },
      transitionDuration: { default: '400ms', slow: '500ms' },
      transitionTimingFunction: { waya: 'cubic-bezier(0.4, 0, 0.2, 1)' },
      fontFamily: { heading: ['var(--font-heading)', 'sans-serif'], body: ['var(--font-body)', 'sans-serif'] },
      borderRadius: { sm: 'var(--radius-sm)', md: 'var(--radius-md)', lg: 'var(--radius-lg)', xl: 'var(--radius-xl)' },
    },
  },
  plugins: [],
};
export default config;
```

---

## 5. Interaction & Component Blueprinting
*   **Speed:** Interactions locked to 400ms–500ms bounds using `cubic-bezier(0.4, 0, 0.2, 1)`.
*   **Button Primitives:** `<button className="px-6 py-3 rounded-lg bg-brand-primary text-brand-on-primary font-body text-label-lg transition-all duration-default ease-waya hover:bg-brand-hover hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-brand-primary"/>`
*   **Card Primitives:** `<div className="bg-bg-card rounded-lg border border-border-default p-6 transition-all duration-default ease-waya"/>`
*   **Input Primitives:** `<input className="w-full px-4 py-3 rounded-lg border border-border-default bg-bg-primary text-text-primary font-body text-body-lg transition-all duration-default ease-waya focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"/>`
*   **Toast System:** Fixed `bottom-6 left-1/2 -translate-x-1/2`. Charcoal fill (fixed, theme-independent), `text-text-inverse`, `label-sm`. Expiry: 4000ms. Max 1 active.
*   **XP Tracker:** Nav boundary, height 3px. Transition: `width 500ms`. Math: `((xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100`.
*   **Spatial Canvas Nodes:** Math (`bg-subject-math`), ScienceTech (`bg-subject-science`), HistoryCulture (`bg-subject-history`), CreativeArts (`bg-subject-arts`). Font titles: `font-heading text-title-lg`.

---

## 6. Prohibited Structural Patterns
*   ❌ No gradients on any surface or background container element.
*   ❌ No hardcoded hex strings directly written inside component styling frameworks.
*   ❌ No drop shadows or blurry background element filter matrices.
*   ❌ No interaction animations running outside the explicit 400ms to 500ms duration window.