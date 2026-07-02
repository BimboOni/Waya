---
trigger: always_on
---

# .agents/rules/code-style.md
Waya — Code Style Rules

## 1. Language & Tooling
* TypeScript strict mode is enforced globally. The `tsconfig.json` configuration file must actively contain `"strict": true`.
* ESLint paired with `eslint-config-next` is required. [cite_start]Zero compilation warnings are tolerated within production Vercel builds[cite: 144].
* Prettier configuration is enforced: single quotes, 2-space indentation depth, and strict trailing commas (`"trailingComma": "all"`).
* Use of `// @ts-ignore` or `// @ts-nocheck` is completely prohibited across all system components, except within auto-generated Prisma baseline migration headers.

## 2. File & Directory Naming
| Entity | Convention | Example |
| :--- | :--- | :--- |
| **React Components** | PascalCase | `SynthesisCard.tsx` |
| **Utility Functions** | camelCase | `formatXP.ts` |
| **API Route Groups** | kebab-case (Directories) | [cite_start]`app/api/validate-answer/route.ts` [cite: 158] |
| **Custom Hooks** | camelCase (prefixed with `use`) | `useStreakTimer.ts` |
| **Types & Interfaces** | PascalCase | `types/index.ts` |
| **Global Constants** | SCREAMING_SNAKE_CASE | [cite_start]`XP_PER_SYNTHESIS = 50` [cite: 115] |
| **CSS Modules** | camelCase | `synthesisCard.module.css` |

## 3. Strict Component Layout Order
Every interface component file must adhere rigidly to the following import, definition, and evaluation layout sequences to ensure clean maintainability:

```typescript
'use client'; // Applied only if direct browser execution context is required

// 1. Core React Engine Imports
import { useState, useEffect } from 'react';

// 2. Next.js Routing Framework Imports
import { useRouter } from 'next/navigation';

// 3. Third-Party Libraries (e.g., Framer Motion or React Flow primitives)
import { motion } from 'framer-motion';

// 4. Local Workspace Absolute Imports (Enforced via @/ alias mappings)
import { useWayaStore } from '@/store/useWayaStore';
import { Button } from '@/components/ui/Button';
import type { Session } from '@/types';

// 5. Explicit TypeScript Interfaces local to this specific file context
interface SynthesisCardProps {
  session: Session;
  onComplete: (answer: string) => void;
}

// 6. Local Block Constants
const TEXT_AURA_DELAY = 0.4;

// 7. Named Export Component Execution
export function SynthesisCard({ session, onComplete }: SynthesisCardProps) {
  // a. Global Zustand Store Action/Slices Hydration
  const { setToastMessage } = useWayaStore();

  // b. Local React Functional State Slots
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // c. Core Component Lifecycle Hooks
  useEffect(() => {
    // Component lifecycle init logic goes here
  }, []);

  // d. UI Scope Event Handlers (Must explicitly use 'handle' prefix nomenclature)
  const handleAnswerSubmission = async () => {
    if (answer.trim().length === 0) return;
    setIsSubmitting(true);
    // Execute server API route connection logic
  };

  // e. Local Derived Reactive Properties
  const isAnswerValid = answer.trim().length >= 3;

  // f. Clean Semantic JSX Block Render
  return (
    <div className="bento-card-surface">
      {/* Structural layout blocks go here */}
    </div>
  );
}

4. Error Boundary Configurations
Every page-level application directory router node must contain a co-located, client-safe error.tsx overlay to intercept file runtime crashes cleanly.

TypeScript
// app/study/error.tsx
'use client'; // Error boundaries MUST be client-side targets

import { useEffect } from 'react';

interface StudyErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// Next.js structural requirement exception: error boundaries MUST utilize default exports
export default function StudyError({ error, reset }: StudyErrorProps) {
  useEffect(() => {
    console.error('[STUDY_ROUTE_CRITICAL_FAULT]:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center bg-system-surface rounded-2xl border border-system-border">
      <h3 className="text-xl font-bold text-system-text-main mb-2">Something went wrong</h3>
      <p className="text-system-text-muted mb-4">Waya encountered an issue. Please try again.</p>
      <button 
        onClick={reset}
        className="px-4 py-2 bg-brand-primary text-white rounded-xl transition-all duration-400 ease-in-out hover:opacity-90"
      >
        Retry Action
      </button>
    </div>
  );
}
5. TypeScript Formatting Constraints
All component parameters and properties (props) must be explicitly typed. Banned usage of loose implicit any definitions.

All asynchronous backend payload structure maps must be stored inside centralized definitions within types/index.ts and explicitly imported. Inline schema definitions are disallowed.

Zod Integration: All backend /app/api/ handler entryways must pass incoming transaction payloads through a rigid schema validation layer:

TypeScript
// app/api/synthesis/route.ts
import { z } from 'zod';

const SynthesisRequestSchema = z.object({
  topic: z.string().min(3).max(200),
  userId: z.string().uuid(),
});

// Inside POST/PATCH HTTP handlers:
const parsedPayload = SynthesisRequestSchema.safeParse(body);
if (!parsedPayload.success) {
  return NextResponse.json(
    { error: parsedPayload.error.flatten() }, 
    { status: 400 }
  );
}
6. Async / Await Standards
Usage of classical programmatic callbacks or legacy .then() chaining methods is strictly forbidden. All asynchronous tasks must execute using native async/await syntax.

All asynchronous procedures running within server api endpoint files must be securely enclosed inside explicit try/catch logic boundaries.

Loop Optimization: NEVER execute block awaiting operations within iteration loops. Use parallel execution maps via Promise.all to save compute resources:

TypeScript
// ✅ CORRECT: Asynchronous tasks are initialized concurrently
const [userData, chronologicalSessions] = await Promise.all([
  prisma.user.findUnique({ where: { id: currentUserId } }),
  prisma.session.findMany({ where: { userId: currentUserId } }),
]);

// ❌ FORBIDDEN: Block execution triggers sequential request blocks (latency spikes)
const user = await prisma.user.findUnique({ where: { id: currentUserId } });
const sessions = await prisma.session.findMany({ where: { userId: currentUserId } });
7. Resolution Pathing & Imports
All file connections must execute using the clean absolute @/ root resolution alias declared inside tsconfig.json:

JSON
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
Deeply nested relative path lookups (e.g., ../../../../components/ui) are completely disallowed.

8. Consolidated Core Constants File
All programmatic parameters, configuration limitations, text blocks, and color definitions must reside strictly inside the utility layout file lib/constants.ts:

TypeScript
// lib/constants.ts

export const XP_PER_SYNTHESIS = 50;
export const XP_PER_LEVEL = 500;
export const MAX_TOPIC_LENGTH = 200;
export const MAX_ANSWER_LENGTH = 500;
export const AI_EXPLANATION_MAX_WORDS = 250;

export const SUBJECT_COLORS: Record<string, string> = {
  Mathematics: '#A855F7',      // Purple
  ScienceTech: '#06B6D4',      // Cyan
  HistoryCulture: '#10B981',   // Emerald/Mint
  CreativeArts: '#EC4899',     // Pink
  Other: '#6B7280',            // Muted Gray
};

export const LEVEL_NAMES: Record<number, string> = {
  1: 'Curious',
  2: 'Explorer',
  3: 'Connector',
  4: 'Architect',
  5: 'Polymath',
};

export const TOAST_MESSAGES = {
  AI_TIMEOUT: "Waya is currently gathering its thoughts. Please try your request again in a moment.",
  EMPTY_TOPIC: "Please enter a topic before asking Waya.",
  EMPTY_ANSWER: "Please write your synthesis answer before submitting.",
  XP_AWARDED: (amount: number) => `+${amount} XP earned!`,
  STREAK_INCREMENT: (days: number) => `${days}-day streak! Keep going!`,
} as const;
9. Forbidden Patterns (Absolute System Guardrails)
❌ Banned Declarations: Use of primitive var bindings is fully blocked. Enforce block-scoped variables via const and let.

❌ Banned Styling Overrides: Explicit inline component styling is barred, except when computing absolute coordinates for dynamic elements like React Flow layout map nodes.

❌ Logging Pollutions: Direct console.log executions are forbidden from passing production pipelines. Wrap operational issues inside explicit console.error logs within exception frames.

❌ Secret Leakage Vault: Storing structural private keys, encryption credentials, API connection blocks, or internal system URLs raw inside functional component code is completely banned. Use process environment setups.

❌ Component Core Exports: Layout UI files must avoid default functional context exports. Force named export declarations across views, except where structurally dictated by Next.js app layout paradigms (page.tsx, layout.tsx, error.tsx).

❌ State Mutations Bypass: Direct inline mutation writes targeting state variables outside explicit store action configurations are structurally blocked.