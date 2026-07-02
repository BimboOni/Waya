# AGENTS.md — Waya Relational Study Partner
## Agent Orchestration & Environment Configuration

---

## 1. Project Identity

**Product:** Waya — AI-Powered Relational Study Partner
**Version:** 1.0 (MVP)
**Build Target:** Next.js 14 App Router · Supabase · Prisma · Tailwind CSS · Vercel
**Primary Demographic:** Ages 10–16 (Gen Alpha)
**MVP Scope Constraint:** NO payment workflows, NO monetization, NO webhooks tied to billing systems.

---

## 2. Agent Mission

You are the engineering intelligence for Waya. Your role is to scaffold, implement, and maintain a production-grade Next.js 14 application that:

1. Authenticates users via Google OAuth through Supabase.
2. Captures user interest profiles on first login.
3. Runs a Synthesis Engine: streams personalized topic explanations → poses a cross-disciplinary synthesis question → validates the user's answer.
4. Awards XP, updates streaks (browser-local timezone), and builds a React Flow Knowledge Map node on each successful synthesis.
5. Invokes Gemini image generation on milestone events to produce flat-UI badges stored in Supabase Storage.

Every decision you make must be traceable to the PRD, these rules, or an explicit user instruction. Do not invent features.

---

## 3. Repository Structure (Canonical)

```
waya/
├── AGENTS.md
├── .agents/
│   └── rules/
│       ├── architecture.md
│       ├── code-style.md
│       ├── design-system.md
│       └── security.md
├── skills/
│   ├── deepseek-chat-integration/SKILL.md
│   ├── gemini-image-generation/SKILL.md
│   ├── react-flow-builder/SKILL.md
│   ├── gamification-logic/SKILL.md
│   ├── component-builder/SKILL.md
│   ├── api-route-scaffolder/SKILL.md
│   └── db-migration-runner/SKILL.md
├── workflows/
│   ├── new-component.md
│   └── new-api-route.md
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── onboarding/
│   │   └── page.tsx
│   ├── study/
│   │   └── page.tsx
│   ├── profile/
│   │   └── page.tsx
│   ├── api/
│   │   ├── synthesis/
│   │   │   └── route.ts
│   │   ├── validate-answer/
│   │   │   └── route.ts
│   │   ├── badge/
│   │   │   └── route.ts
│   │   └── session/
│   │       └── route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   ├── synthesis/
│   ├── knowledge-map/
│   ├── gamification/
│   └── onboarding/
├── lib/
│   ├── deepseek.ts
│   ├── gemini.ts
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── prisma.ts
│   └── utils.ts
├── store/
│   └── useWayaStore.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── types/
│   └── index.ts
├── .env.local          ← NEVER commit
├── .env.example        ← Always keep updated
└── next.config.js
```

---

## 4. Dual-API Architecture — CRITICAL

Waya runs two entirely separate AI systems. The agent MUST NEVER mix these responsibilities.

### 4.1 DeepSeek — Text / Conversational Intelligence

| Property | Value |
|---|---|
| SDK | `openai` npm package (OpenAI Node SDK) |
| Base URL Override | `https://api.deepseek.com/v1` |
| Model | `deepseek-chat` |
| Env Variable | `DEEPSEEK_API_KEY` |
| Usage Scope | Synthesis Engine explanations, Socratic follow-up questions, answer validation feedback |
| Streaming | YES — use `stream: true` with `for await` loop |

**Initialization (canonical — `lib/deepseek.ts`):**
```typescript
import OpenAI from 'openai';

export const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY!,
  baseURL: 'https://api.deepseek.com/v1',
});
```

### 4.2 Gemini — Image / Visual Asset Generation

| Property | Value |
|---|---|
| SDK | `@google/generative-ai` npm package |
| Model | `gemini-2.5-flash` (image-capable) |
| Env Variable | `GEMINI_API_KEY` |
| Usage Scope | Badge generation on milestone events ONLY |
| Streaming | NO — single-shot generation |
| Storage Target | Supabase Storage bucket: `badges` |

**Initialization (canonical — `lib/gemini.ts`):**
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

export const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
```

---

## 5. Environment Variables

### `.env.example` (always keep in sync)
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# DeepSeek (Text AI)
DEEPSEEK_API_KEY=

# Gemini (Image AI)
GEMINI_API_KEY=

# Database (Prisma)
DATABASE_URL=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Rules:**
- `NEXT_PUBLIC_*` variables are safe to expose to the browser.
- `DEEPSEEK_API_KEY`, `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `DATABASE_URL` are SERVER-ONLY. Never reference them in client components.
- All API calls using these keys MUST originate from `app/api/` route handlers.

---

## 6. Authentication Model

- Provider: Google OAuth via Supabase Auth
- Session management: Supabase SSR client (`@supabase/ssr`)
- New user detection: Check `users` table in Prisma on first OAuth callback; if no record exists, redirect to `/onboarding`
- Returning users: Redirect to `/study`
- Middleware file: `middleware.ts` at project root — protects `/study`, `/profile`, `/onboarding` routes

---

## 7. State Management

- Library: **Zustand**
- Store file: `store/useWayaStore.ts`
- Store holds: `user`, `currentSession`, `knowledgeNodes`, `knowledgeEdges`, `xp`, `level`, `streak`, `badges`
- Server state (DB reads/writes) flows through API routes, not directly from the store
- The store is the single source of truth for UI state

---

## 8. Database

- ORM: **Prisma**
- Database: **Supabase PostgreSQL**
- Connection: `DATABASE_URL` from `.env.local` (Supabase connection pooling URL)
- All schema changes go through `prisma migrate dev` — no raw SQL edits to production
- Data Scoping Rule: While Prisma implements calls in backend routes utilizing the SUPABASE_SERVICE_ROLE_KEY to cross-verify structural actions, all user mutations/queries MUST explicitly enforce a where: { userId } parameter fetched via the verified Supabase session token to maintain true multi-tenant RLS isolation.

---

## 9. Deployment Target

- Platform: **Vercel**
- All `app/api/` routes deploy as Vercel Serverless Functions
- Environment variables are set in Vercel project dashboard — never in `vercel.json`
- Build command: `prisma generate && next build`

---

## 10. Hard Constraints (Never Violate)

1. **No payments.** Do not scaffold Stripe, LemonSqueezy, or any billing provider.
2. **No dark mode.** UI is locked to Light Mode only.
3. **No email notifications.** All alerts are UI snackbars/toasts only.
4. **DeepSeek handles text. Gemini handles images.** No cross-contamination.
5. **All AI API keys are server-only.** Zero client-side exposure.
6. **Streaks use browser local timezone.** Never raw UTC for streak comparison.
7. **Empty inputs never reach the API.** Client-side validation blocks the request first.