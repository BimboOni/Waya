# skills/component-builder/SKILL.md
Component Builder — React/TypeScript UI Components

## Purpose
Governs how every React component in Waya is scaffolded, structured, and maintained.

---

## 1. Pre-Build Checklist
Before writing any component, answer:
1. Is this a Server or Client Component? Default to Server unless it needs state, effects, or browser APIs.
2. Where does it live? Match the directory to its domain (see directory map below).
3. Does a similar component already exist? Check `components/ui/` before creating net-new primitives.
4. Is this a page-scope component? If so, scaffold a co-located `error.tsx` in the same route directory to satisfy the `architecture.md §1` error boundary requirement.

---

## 2. Directory Map
```
components/
├── ui/                    ← Primitive, reusable building blocks
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Toast.tsx
│   ├── Modal.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── XPBar.tsx
│   └── LoadingSpinner.tsx
├── synthesis/             ← Synthesis Engine specific
│   ├── SynthesisEngine.tsx
│   ├── TopicInput.tsx
│   ├── ExplanationStream.tsx
│   └── AnswerInput.tsx
├── knowledge-map/         ← React Flow canvas
│   ├── KnowledgeMap.tsx
│   └── KnowledgeMapNode.tsx
├── gamification/          ← XP, streaks, badges
│   ├── XPDisplay.tsx
│   ├── StreakCounter.tsx
│   ├── BadgeGrid.tsx
│   └── LevelUpModal.tsx
└── onboarding/            ← First-login interest selection
    ├── InterestCard.tsx
    └── InterestSelector.tsx
```

---

## 3. Component Template
File: `components/[domain]/ComponentName.tsx`

```typescript
'use client'; // ONLY if needed

import { useState } from 'react';

import { TOAST_MESSAGES } from '@/lib/constants';
import type { Session } from '@/types';
import { useWayaStore } from '@/store/useWayaStore';

interface ComponentNameProps {
  requiredProp: Session;
  optionalProp?: string;
  onAction: (result: string) => void;
}

export function ComponentName({ requiredProp, optionalProp, onAction }: ComponentNameProps) {
  // 1. Store hooks (only if client component)
  const { setToastMessage } = useWayaStore();

  // 2. Local state
  const [value, setValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  // 3. Handlers
  const handleAction = async () => {
    setFieldError(null);
    const normalizedValue = value.trim();

    if (normalizedValue.length < 3) {
      setFieldError('Input value must be at least 3 characters long.');
      return;
    }
    
    setIsLoading(true);
    try {
      // ... async logic processing
      onAction(normalizedValue);
    } catch {
      setToastMessage(TOAST_MESSAGES.AI_TIMEOUT);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. JSX
  return (
    <div className="bg-bg-card border border-border-default rounded-lg p-6 font-body transition-all duration-default ease-waya">
      {/* Component content layout blocks */}
      {fieldError && (
        <p className="mt-1.5 text-sm text-error font-medium animate-pulse">{fieldError}</p>
      )}
    </div>
  );
}
```

---

## 4. UI Primitive Specifications

### Button Component (`components/ui/Button.tsx`)
```typescript
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit';
  className?: string;
}

// Shared base classes applied to every variant — covers disabled UX and keyboard focus states
const baseClasses =
  'inline-flex items-center justify-center font-body transition-all duration-default ease-waya ' +
  'hover:-translate-y-0.5 active:translate-y-0 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed ' +
  'focus-visible:outline-2 focus-visible:outline-brand-primary';

const variantClasses = {
  primary: 'bg-brand-primary text-brand-on-primary hover:bg-brand-hover',
  secondary: 'bg-bg-secondary text-text-primary border border-border-default hover:border-brand-primary',
  ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-secondary',
};

// Font scale uses design-system Tailwind tokens (text-label-*), NOT raw text-sm / text-base
const sizeClasses = {
  sm: 'px-3 py-1.5 text-label-sm rounded-sm',
  md: 'px-5 py-2.5 text-label-md rounded-md',
  lg: 'px-6 py-3 text-label-lg rounded-lg',
};
```

### Input Component (`components/ui/Input.tsx`)
```typescript
interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string | null;
  maxLength?: number;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
}
```

### Toast Component (`components/ui/Toast.tsx`)
- **Store Subscriptions:** Reads from Zustand store parameters: `toastMessage` / `setToastMessage`.
- **Operational Lifecycles:** Auto-dismisses after a clean 4000ms window.
- **Fixed Coordinates Position:** Bound strictly to `bottom-6 left-1/2 -translate-x-1/2`.
- **Animations Layout:** Slides up on viewport mounting via 0.4s curves, slides down cleanly on expiration context.
- **Constraint:** Maximum of one active toast allowed inside the interface viewport at a single time.

### XPBar Component (`components/ui/XPBar.tsx`)
```typescript
interface XPBarProps {
  currentXP: number;        // Total global user XP accumulation points
  animated?: boolean;       // Animate line width on initial layout component mount
}
// Renders the horizontal top navigation XP progress bar module
// Structural Width Equation: (currentXP % XP_PER_LEVEL) / XP_PER_LEVEL * 100%
// Interpolation Curve Style: transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1)
```

---

## 5. Loading States Execution Rules
Every single background asynchronous client transaction sequence must feature an explicit, tactile loading UI feedback layer:

- **Button Actions:** Inject the `<LoadingSpinner size="sm" />` element directly inside the active layout frame, set button status attributes to disabled, and drop visibility alpha to a flat 70% opacity.
- **Conversational Streams:** Inject a custom pulsing cursor text marker element (`animate-pulse`) at the terminal text coordinate node of the active streaming text field block.
- **Page Routing Nodes:** Bind centered spinning feedback patterns via specialized co-located Next.js `loading.tsx` sub-tree router frames.

```typescript
// components/ui/LoadingSpinner.tsx
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return (
    <div
      className={`${sizeMap[size]} rounded-full border-2 border-border-strong border-t-brand-primary animate-spin`}
      style={{ animationDuration: '0.6s' }}
    />
  );
}
```

---

## 6. Accessibility & Demographic Constraints
- All interactive element click regions must feature explicit description parameters via `aria-label` fields when handling raw graphics or icon-only structures.
- All data `<input>` elements must track structural focus bindings to associated `<label>` or string text tags.
- Interactive element visual highlights must use standard `focus-visible:` Tailwind modifier attributes. Banned utilization of raw unstructured `focus:` class overwrites.
- **Demographic Physical Touch Limit:** Minimum tap target footprint bounding box constraint is locked to a non-negotiable size threshold of **44px by 44px** for all operational elements.
- Chromatic variables or color parameters must never handle data states in solo paths. Pair visual variables with explicit textual indicators or graphic vector assets.
- React Flow node components require explicit semantic layout parsing parameters: `aria-label={`${data.topic} - ${data.subject}`}`.