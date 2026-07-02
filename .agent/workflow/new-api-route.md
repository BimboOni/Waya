# workflows/new-api-route.md
Workflow: Creating a New API Route

Follow every step in sequence. Do not skip steps.

---

## Step 1 — Confirm It Belongs in `app/api/`
API routes are strictly reserved for:
* Upstream generative AI API integrations (`deepseek-chat`, `gemini-2.5-flash`).
* Database modifications and writes (`PrismaClient` write operations).
* Administrative operations requiring the secure server-only service role key.
* Complex backend business operations that cannot execute directly within native Next.js Server Components.

*Rule:* If the task is a standard database read and you are already computing inside a Next.js Server Component page layer, invoke the Prisma client singleton directly—bypassing an external network endpoint fetch completely.

---

## Step 2 — Determine the Route Path
* **Convention Tree:** `app/api/[resource-name]/route.ts`
* Resource names must be written as kebab-case plural nouns or semantic descriptors.
* *Examples:* `synthesis`, `validate-answer`, `badge`, `knowledge-map`, `session`
* *Sub-resources:* `app/api/session/[id]/route.ts`

Always audit your active workspace mapping in `skills/api-route-scaffolder/SKILL.md` Section 1 before initializing a net-new file to prevent duplicating existing endpoint operations.

---

## Step 3 — Create the File
File Path: `app/api/[resource-name]/route.ts`

Extract and instantiate the baseline architecture layout skeleton from `skills/api-route-scaffolder/SKILL.md` Section 2.

---

## Step 4 — Define the Zod Schema
At the top of the file, define a strict runtime Zod validation schema for every HTTP method handler block that accepts an incoming payload request body:

```typescript
const PostRequestSchema = z.object({
  topic: z.string().min(3, 'Input parameter must be at least 3 characters long').max(200, 'Input exceeds max buffer capacity'),
  optionalField: z.string().optional(),
  uuidField: z.string().uuid('Must be a valid, structurally secure UUID v4 string'),
});
Constraints to always apply:

String Data Fields: .min(3) for required parameters to safeguard backend endpoints from single-character spam; use character length bounds parameters from lib/constants.ts for max capacities.

Identification Keys: Enforce strict .uuid() structural lookups.

Enumerated Arrays: Capture parameters via explicit string tokens using z.enum([...]).

Numeric Fields: Enforce integer typing parameters using z.number().int().min(0).

Step 5 — Implement Auth Check
This is the absolute FIRST executable operation inside your internal routing handler logic try block wrapper:

TypeScript
const supabase = createServerSupabaseClient();
const { data: { user }, error: authError } = await supabase.auth.getUser();

if (authError || !user) {
  return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
}
NEVER allow any downstream code executions to proceed prior to resolving this user identity block on endpoints managing personal student details or metric logs.

Step 6 — Parse and Validate the Request Body
TypeScript
let requestBodyPayload: unknown;
try {
  requestBodyPayload = await req.json();
} catch {
  return NextResponse.json({ error: 'Malformed JSON payload structure error' }, { status: 400 });
}

const parseVettingResult = PostRequestSchema.safeParse(requestBodyPayload);
if (!parseVettingResult.success) {
  return NextResponse.json(
    { error: 'Input argument criteria vetting failure', details: parseVettingResult.error.flatten() },
    { status: 400 }
  );
}

const { topic } = parseVettingResult.data;
Step 7 — Implement Business Logic
Rules:

Every single database transaction query MUST include a strict multi-tenant context logical filter: where: { userId: user.id }. Never trust user IDs provided inside request arguments.

Route actions call utility wrapper structures inside lib/deepseek.ts or lib/gemini.ts for AI tasks—direct inline client SDK configurations inside routing file handlers are barred.

Isolate asynchronous generative engine operations inside secondary local try/catch wrappers, throwing an explicit 503 service unavailable status on exception.

Encapsulate output records securely within structural payload success objects: { data: result } (never return plain un-wrapped Postgres row records directly to the network wire).

Integration Constraint: Cross-skill milestones (like achievement badge generation workflows) triggered during answer validation blocks must run via internal server utility function maps—do NOT fire recursive fetch requests back to your own /api/badge paths to protect serverless instances from network timeouts.

Step 8 — Return Typed Response
TypeScript
// Success Resolutions
return NextResponse.json({ data: operationalResult }, { status: 200 }); // GET Data Resolution
return NextResponse.json({ data: operationalResult }, { status: 201 }); // POST Data Creation Committed

// Handled Failure Anomalies
return NextResponse.json({ error: 'Canonical human-readable token string' }, { status: 400 | 401 | 403 | 404 | 500 | 503 });
Step 9 — Wrap Everything in Try/Catch
The absolute entire execution engine path (immediately following authentication checking) must execute wrapped inside a unified exception handling perimeter block:

TypeScript
export async function POST(req: NextRequest) {
  try {
    // 1. Session check validation parameters
    // 2. Body schema formatting parse
    // 3. Isolated business logic execution
    // 4. Return success wrappers
  } catch (err) {
    console.error('[ROUTE_CRITICAL_EXECUTION_EXCEPTION:POST] Unhandled failure anomaly on resource:', err);
    return NextResponse.json({ error: 'Internal system processing failure' }, { status: 500 });
  }
}
Step 10 — Verification Checklist
Prior to pushing any backend routing code change live or closing your pipeline task, confirm these criteria:

[ ] Routing file system mapping path matches the kebab-case schema: app/api/[resource-name]/route.ts.

[ ] A strict Zod interface parsing schema validates input arguments on all body-accepting handlers.

[ ] The server authentication check stands as the absolute first logical operation inside try blocks.

[ ] The resolving user's identification parameters come strictly from the server session token context (user.id), never request bodies.

[ ] Every single database mutation query includes a secure relational filter mapping: where: { userId: user.id }.

[ ] Third-party AI executions loop through structural singletons exported from /lib abstractions.

[ ] Upstream generative API timeouts are intercepted safely, returning status 503 with an { error: 'AI_TIMEOUT' } packet.

[ ] Successful query operations return clean wrapper shapes matching the signature: { data: result }.

[ ] The entire executable handler routine stays enclosed inside an automated try/catch safety net.

[ ] Handled catch paths log error indicators to stdout prefixed with clear route contextual names.

[ ] Complete systemic absence of financial integrations, e-commerce webhooks, or compliance billing packages.

[ ] Zero inline string references or accidental environment key leak structures pointing to private token keys (DEEPSEEK_API_KEY, GEMINI_API_KEY).