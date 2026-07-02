# workflows/new-component.md
Workflow: Creating a New Component

Follow every step in sequence. Do not skip steps.

---

## Step 1 — Determine Component Type
Question: Does this component need `useState`, `useActionState`, `useEffect`, event handlers, browser APIs, or Zustand store access?
* **YES** → Client Component (`'use client'` directive required at the absolute top of the file)
* **NO** → Server Component (no directive, can fetch data directly via Prisma singletons)

---

## Step 2 — Determine Directory Placement

| Component Category | Target Repository Directory |
| :--- | :--- |
| Reusable primitive items (Button, Input, Modal, Card) | `components/ui/` |
| Synthesis Engine interaction modules | `components/synthesis/` |
| Knowledge Map React Flow canvas and custom layout elements | `components/knowledge-map/` |
| XP, streaks, badges, level up display frames | `components/gamification/` |
| First-login onboarding affinity quiz selections | `components/onboarding/` |

---

## Step 3 — Check for Existing Primitives
Before building a net-new element, explicitly search `components/ui/` to re-use core foundational abstractions:
* `Button.tsx` — use before creating any new button element
* `Input.tsx` — use before creating any new input text field
* `Card.tsx` — use before creating any new card bento panel layout
* `Modal.tsx` — use before creating any new dialogue overlay
* `Toast.tsx` — use before creating any new notification snackbar

If the primitive option does not exist but is highly reusable across domains, design it in `components/ui/` first.

---

## Step 4 — Create the File
File path: `components/[domain]/[ComponentName].tsx`

Utilize the uncompressed standard layout template from `skills/component-builder/SKILL.md` Section 3. 
Required structure format order (strict):
1. `'use client'` directive hook (if and only if client-side execution parameters are met)
2. Core React hooks imports
3. Next.js routing ecosystem imports
4. Third-party graphic/canvas library imports (e.g., Lucide React or React Flow primitives)
5. Internal workspace absolute `@/` root resolution alias imports
6. Explicit local TypeScript interface/type definitions
7. Local constant strings or specific frame configurations
8. Component function block (Enforce named export structures — zero default exports allowed)
9. Sub-components (allowed only if exceptionally small and tightly coupled to the primary structural layout view)

---

## Step 5 — Implement Props Interface
```typescript
interface [ComponentName]Props {
  // Every single component parameter must be explicitly typed
  // Complete structural prohibition on loose implicit 'any' types
  // Optional parameters must be clearly flagged using the '?' operator modifier
  // Callback parameter functions use unified action-driven nomenclature like 'onAction'
}
Step 6 — Implement State & Handlers
For every asynchronous user action event handler method, follow this exact defensive process pattern:

TypeScript
const handleAction = async () => {
  setFieldError(null);
  const normalizedText = value.trim();

  // 1. Client-side systemic threshold check (abort task execution instantly if under limits)
  if (normalizedText.length < 3) {
    setFieldError('Input parameter must be at least 3 characters long.');
    return;
  }

  // 2. Instantiate loading state feedback parameters
  setIsLoading(true);
  try {
    // 3. Dispatch backend network asynchronous operation
    await apiCall(normalizedText);
  } catch (executionFault) {
    // 4. Surface controlled user-facing error via toast state assignment handles
    setToastMessage(TOAST_MESSAGES.AI_TIMEOUT);
  } finally {
    // 5. Always clear internal layout loading parameters when execution lifecycle finishes
    setIsLoading(false);
  }
};
Step 7 — Apply Design System Classes
Reference skills/design-system.md parameters explicitly:

Consume correct Tailwind semantic placeholder custom parameters (bg-bg-card, text-text-primary, border-border-default).

Core micro-interaction speeds match defined standard constraints exactly: transition-all duration-default ease-waya.

Bento radius properties match abstract scales: rounded-md, rounded-lg, rounded-xl.

Absolute Restriction: Zero inline hexadecimal values or explicit color definitions can live inside className strings. Use the designated custom variable abstraction hooks.

Step 8 — Add Error Boundary (Page-Level Layout Trees Only)
If the component target is an absolute routing node container instance (app/[route]/page.tsx), also construct its companion file controls:

app/[route]/error.tsx    ← Secure fallback error interceptor interface view

app/[route]/loading.tsx  ← Layout framework baseline loading overlay panel

Step 9 — Export Style Enforcement
Named functional exports only across structural UI views:

TypeScript
// ✅ CORRECT — Transparent name lookup traceability for compiling agents
export function SynthesisCard({ session, onAction }: SynthesisCardProps) { ... }

// ❌ FORBIDDEN — Default anonymous routing layouts break structural system parsing rules
export default function SynthesisCard() { ... }
Step 10 — Verification Checklist
Prior to marking a task component allocation lifecycle as closed or complete, audit it against these parameters:

[ ] 'use client' is declared only if the file directly reads state hooks or browser parameters.

[ ] Props interfaces contain explicit type parameters (absolute zero any allocations).

[ ] All user-facing exception dialogue lookups reference properties inside TOAST_MESSAGES within lib/constants.ts.

[ ] Input length validation guardrails (length >= 3) run securely prior to initiating network dispatch processes.

[ ] Async execution loading animations toggle on and off without leaking loop pipelines.

[ ] Micro-interaction animation speeds stay locked inside the non-negotiable 0.4s to 0.5s frame window.

[ ] Component styles feature absolute zero dark mode utility markers (dark: utility prefixes are barred).

[ ] Component layout styling maps explicitly onto CSS custom variable tokens (zero hardcoded raw hex lines).

[ ] Accessibility constraints pass: explicit input labels exist, interactive touch target sizes measure a minimum area footprint of 44px by 44px.

[ ] The element exports via explicitly named parameter syntax definitions (zero component default exports).