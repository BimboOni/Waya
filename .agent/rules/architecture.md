---
trigger: always_on
---

# .agents/rules/architecture.md
Waya — Architecture Rules

## 1. Framework: Next.js 14 App Router (STRICT)
*   Use the Next.js 14 App Router layout trees exclusively. The `pages/` directory is completely prohibited.
*   All routes live under `app/`. Page files are named `page.tsx`. Layout files are named `layout.tsx`.
*   Route groups use parentheses for organizational separation: `app/(auth)/login/page.tsx`.
*   Loading UI states use `loading.tsx` co-located with the route.
*   Error boundaries use custom `error.tsx` co-located with the target route.

### Server vs. Client Components
| Functional Scope | Rule Detail |
| :--- | :--- |
| **Default Paradigm** | Every single component is a Server Component unless it directly handles browser APIs, window events, or React state hooks. |
| **Client Component Scope** | Prepend the `'use client'` directive exclusively when executing states (`useState`, `useActionState`), lifecycle effects (`useEffect`), event listening, or state store hooks (`useWayaStore`). |
| **Data Fetching Workflow** | Server Components fetch directly from the database layer via Prisma. Pass the plain serialized data down as properties (`props`) to hydrated Client Components. |
| **Anti-Pattern Constraint** | NEVER execute API fetches to internal local `/app/api/` route handlers inside Server Components. Invoke server-side utility abstractions or Prisma database Singletons directly. |

## 2. API Routes
*   All backend server operations must reside strictly within `app/api/[route-name]/route.ts`.
*   Export named HTTP method handlers explicitly: `GET`, `POST`, `PATCH`, `DELETE`. Default exports are banned inside backend route trees.
*   Handlers must return strongly typed `NextResponse` objects wrapped with status payloads.
*   Always encapsulate the handler executable block inside a robust `try/catch` matrix, forcing standardized error JSON outputs on execution exceptions[cite: 3].

### Canonical API Route Skeleton
```typescript
// app/api/synthesis/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
    }

    const body = await req.json();
    if (!body.topic || body.topic.trim().length < 3) {
      return NextResponse.json({ error: 'Invalid input arguments' }, { status: 400 });
    }

    // Explicit user context binding enforced for all data transactions
    const result = await prisma.session.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (err) {
    console.error('[API_SYNTHESIS_ERROR]:', err);
    return NextResponse.json(
      { error: 'Internal system processing fault' },
      { status: 500 }
    );
  }
}

3. Service Layer (Decoupled Abstractions)
All external API, third-party libraries, and core AI systems are isolated in the /lib directory[cite: 3]. API routes import from wrappers; they never instantiate raw clients inline[cite: 3].

lib/
├── deepseek.ts          ← DeepSeek client init + stream helpers[cite: 3]
├── gemini.ts            ← Gemini client init + image generation helpers[cite: 3]
├── supabase/
│   ├── client.ts        ← Browser Supabase client (NEXT_PUBLIC keys only)[cite: 3]
│   └── server.ts        ← Server Supabase SSR client wrapper[cite: 3]
├── prisma.ts            ← Prisma database connection singleton[cite: 3]
└── utils.ts             ← Shared pure utility formatting functions[cite: 3]

Prisma Client Singleton (lib/prisma.ts)
TypeScript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: ['error'] });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
4. Client State Management: Zustand
Single Store Anchor: Managed entirely inside store/useWayaStore.ts[cite: 3].

Access Pattern: Imported exclusively inside client components[cite: 3].

Hydration Rule: Server components pass initialized database fields down as parameters[cite: 3]. The UI context hydrates local Zustand slices via an explicit lifecycle synchronization hook on mount[cite: 3].

Normalized State Interface Shape
TypeScript
interface WayaStore {
  // User Profile Properties
  user: any | null;
  xp: number;
  level: number;
  streak: number;
  setUser: (user: any | null) => void;
  syncGamification: (xp: number, level: number, streak: number) => void;

  // Active Conversational Session
  currentSession: any | null;
  setCurrentSession: (session: any | null) => void;

  // React Flow Spatial Nodes & Links
  knowledgeNodes: any[];
  knowledgeEdges: any[];
  setCanvasElements: (nodes: any[], edges: any[]) => void;
  addSpatialNode: (node: any) => void;
  addSpatialEdge: (edge: any) => void;

  // Reward Badges Array
  badges: any[];
  hydrateBadges: (badges: any[]) => void;

  // Reactive Global Global Layout States
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  toastMessage: string | null;
  setToastMessage: (msg: string | null) => void;
}
5. Database Layer: Prisma + Supabase PostgreSQL
Schema Schema File Configuration: Configured under prisma/schema.prisma[cite: 3].

Migration Rule: All mutations executed using terminal scripts: npx prisma migrate dev --name <migration-name>[cite: 3]. Manual direct updates to the live database or raw hand-coded files are completely banned[cite: 3].

Client Generation: Run npx prisma generate following schema alterations[cite: 3].

Production-Grade Prisma Schema Definition
Code snippet
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id         String    @id @default(uuid())
  email      String    @unique
  name       String?
  interests  String[]
  xp         Int       @default(0)
  level      Int       @default(1)
  streak     Int       @default(0)
  lastActive DateTime?
  createdAt  DateTime  @default(now())

  sessions       Session[]
  badges         Badge[]
  knowledgeNodes KnowledgeNode[]
  knowledgeEdges KnowledgeEdge[]
}

model Session {
  id          String   @id @default(uuid())
  userId      String
  topic       String
  subject     String
  aiResponse  String
  userAnswer  String?
  xpEarned    Int      @default(0)
  completed   Boolean  @default(false)
  createdAt   DateTime @default(now())

  user          User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  knowledgeNode KnowledgeNode?
}

model Badge {
  id        String   @id @default(uuid())
  userId    String
  badgeType String
  imageUrl  String
  earnedAt  DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model KnowledgeNode {
  id        String   @id @default(uuid())
  userId    String
  sessionId String   @unique
  topic     String
  subject   String
  positionX Float    @default(0)
  positionY Float    @default(0)
  createdAt DateTime @default(now())

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  session Session @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  sourceEdges KnowledgeEdge[] @relation("SourceEdge")
  targetEdges KnowledgeEdge[] @relation("TargetEdge")
}

model KnowledgeEdge {
  id           String @id @default(uuid())
  userId       String
  sourceNodeId String
  targetNodeId String

  user       User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  sourceNode KnowledgeNode @relation("SourceEdge", fields: [sourceNodeId], references: [id], onDelete: Cascade)
  targetNode KnowledgeNode @relation("TargetEdge", fields: [targetNodeId], references: [id], onDelete: Cascade)
}
6. Routing & Security Middleware
The server authentication middleware protects restricted visual application sub-trees at the project root folder context[cite: 3].

TypeScript
// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/study', '/profile', '/onboarding'];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll().map(({ name, value }) => ({ name, value }));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set({ name, value, ...options }));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set({ name, value, ...options }));
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const matchesProtected = PROTECTED_PATHS.some(path => request.nextUrl.pathname.startsWith(path));

  if (matchesProtected && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/study/:path*', '/profile/:path*', '/onboarding/:path*'],
};
7. Forbidden Architecture Anti-Patterns
❌ Banned Directories: Absolutely no code allocations mapping onto legacy Next.js pages/ directory targets[cite: 3].

❌ Banned Functions: Banned utilization of legacy SSR generation wrappers like getServerSideProps or getStaticProps[cite: 3].

❌ Data Leak Faults: Zero raw execution hooks referencing direct database infrastructure drivers or Prisma queries inside client browser component modules[cite: 3].

❌ AI Component Blurring: Direct structural instantiation of external AI service wrappers or API keys within functional interface views is fully prohibited[cite: 3]. All operations execute inside the route abstraction layer[cite: 3].

❌ Loose Typing Protocols: Usage of loose any property casting definitions is blocked, unless handling third-party external package models without typing interfaces (must match comment declaration: // TODO: Resolve explicit type fallback)[cite: 3].

❌ Monetization Code Bleed: Total prohibition on scaffolding billing packages, payment provider components, hook systems, or commerce modules[cite: 3].