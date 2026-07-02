# skills/api-route-scaffolder/SKILL.md
API Route Scaffolder — Next.js 14 App Router

## Purpose
Governs how every API route in app/api/ is created, structured, and validated.

---

## 1. Route Inventory
All routes that exist or will exist in Waya:

| Route Path | HTTP Method | Structural Operational Purpose |
| :--- | :--- | :--- |
| `app/api/synthesis/route.ts` | `POST` | Streams dynamic interest-flavored DeepSeek explanations. |
| `app/api/validate-answer/route.ts` | `POST` | Evaluates answers, commits database records, awards user progression telemetry. |
| `app/api/badge/route.ts` | `POST` | Invokes server module to construct asset rewards upon milestone events. |
| `app/api/session/route.ts` | `GET` | Fetches historical contextual learning sessions for current authenticated profile. |
| `app/api/user/route.ts` | `GET`, `PATCH` | Retrieves or mutates state parameters for user profiles. |
| `app/api/knowledge-map/route.ts` | `GET` | Pulls spatial node datasets and edge linkage records for canvas instantiation. |
| `app/api/onboarding/route.ts` | `POST` | Commits user affinity interest matrices on primary system lifecycle initialization. |

---

## 2. Scaffold Template
File: `app/api/[route-name]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

// ── Request Body Validation Schema ─────────────────────────
const PostRequestSchema = z.object({
  // Enforce global system minimum constraint boundaries directly on schema parameters
  topic: z.string().min(3, 'Minimum threshold length is 3 characters').max(200, 'Maximum constraint cap is 200 characters'),
});

// ── GET Request Handler Method ────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
    }

    // Force strict user identity data isolation parameters on queries
    const datasets = await prisma.session.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ data: datasets }, { status: 200 });
  } catch (err) {
    console.error('[ROUTE_EXECUTION_FAULT:GET]:', err);
    return NextResponse.json({ error: 'Internal system processing failure' }, { status: 500 });
  }
}

// ── POST Request Handler Method ───────────────────────────
export async function POST(req: NextRequest) {
  try {
    // 1. Authenticated state context check
    const supabase = createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
    }

    // 2. Encapsulate structural body JSON extraction actions
    let requestPayload: unknown;
    try {
      requestPayload = await req.json();
    } catch {
      return NextResponse.json({ error: 'Malformed JSON payload syntax error' }, { status: 400 });
    }

    const verificationResult = PostRequestSchema.safeParse(requestPayload);
    if (!verificationResult.success) {
      return NextResponse.json(
        { error: 'Input argument criteria vetting failure', details: verificationResult.error.flatten() },
        { status: 400 }
      );
    }
    
    const { topic } = verificationResult.data;

    // 3. Dynamic operational context query
    const committedRecord = await prisma.session.create({
      data: {
        userId: user.id,
        topic,
        subject: 'Other',
        aiResponse: '',
        completed: false
      }
    });

    return NextResponse.json({ data: committedRecord }, { status: 201 });
  } catch (err) {
    console.error('[ROUTE_EXECUTION_FAULT:POST]:', err);
    return NextResponse.json({ error: 'Internal system processing failure' }, { status: 500 });
  }
}
```

---

## 3. Standard HTTP Status Code Table

| Operational Scenario Context | Target Code | Return Interface Behavior |
| :--- | :--- | :--- |
| Success (Standard data retrieval query resolution) | 200 | Delivered via payload data wrappers. |
| Success (Database data row allocation committed) | 201 | Returns the instantiated schema node object. |
| Input Fault (Validation parameters error or syntax check failure) | 400 | Interrupts processing loop before DB calls. |
| Authentication Deficit (Missing or expired login cookie token) | 401 | Middleware redirects client path back to `/login`. |
| Access Restriction (Context token present but unauthorized target request) | 403 | Rejects mutation task instantly. |
| Data Absence (Target primary row key not matching active instances) | 404 | Standard data-not-found route response. |
| Service Outage (External upstream AI service connection timeout) | 503 | Triggered via explicit try/catch handlers inside loop. |
| Unhandled Processing Exception (Runtime framework catch block) | 500 | Returns un-leaked generic structural exception flag. |

---

## 4. Normalized Response Topography

### Unified Error Payload Interface
```typescript
interface OperationalErrorResponse {
  error: string;          // Human-readable clear systemic token error message
  details?: unknown;      // Structural Zod formatting flattening array payload (400 Only)
}
```

### Unified Success Payload Interface
```typescript
interface StructuralSuccessResponse<T> {
  data: T;                // Generic structural return argument matrix wrapper
  meta?: {                // Optional pagination context tokens
    total: number;
    page: number;
    limit: number;
  };
}
```

---

## 5. Client-Side Fetch Resolution Pattern

Generic typed fetcher execution abstraction for deployment across functional Client Components:

```typescript
async function resolveApplicationAPIDispatch<T>(
  apiEndpointPath: string, 
  payloadBody?: unknown,
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' = 'POST'
): Promise<T> {
  const options: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };

  if (payloadBody && method !== 'GET') {
    options.body = JSON.stringify(payloadBody);
  }

  const serverResponse = await fetch(apiEndpointPath, options);

  if (!serverResponse.ok) {
    const errorBodyPayload = await serverResponse.json().catch(() => ({}));
    throw new Error(errorBodyPayload.error ?? 'System process transaction sequence failed');
  }

  const structuralJSON = await serverResponse.json();
  return structuralJSON.data as T;
}
```

---

## 6. Streaming Network Routes (Special Exceptions)
Streaming interface controllers (e.g., Synthesis Engine paths) bypass standard structured `NextResponse.json()` responses, delivering a native fluid `ReadableStream` construct back to client connection frames. Exact token emission configurations are locked under rules set out in [deepseek-chat-integration/SKILL.md](file:///Users/mac/Documents/Waya/.agent/skills/deepseek-chat-integration/SKILL.md).

---

## 7. Automated Route Scaffolding Checklist
Prior to finalizing or committing any custom backend routing script, verify the following conditions:
- [ ] The application server authentication check is positioned as the absolute FIRST logical operation inside execution blocks.
- [ ] A strict Zod interface schema maps and parses incoming body parameters to block loose injection.
- [ ] User identification attributes for all queries are read from verified token session items (`user.id`), never from request arguments.
- [ ] Every single database interaction (find, create, edit) features an explicit multi-tenant isolation parameter logic filter: `where: { userId: user.id }`.
- [ ] Unhandled exceptions match structural definitions and return typed status code JSON shapes.
- [ ] Zero direct instantiations or key extractions from AI models exist inline; operations import functions directly from `/lib` models.
- [ ] Absolute ban on writing payment links, processing configurations, or financial checkout webhooks.