---
trigger: always_on
---

# .agents/rules/security.md
Waya — Security Rules

## 1. Authentication
*   All authentication is handled exclusively by Supabase Auth via the Google OAuth provider.
*   Never build a custom auth system, password fields, or JWT generation libraries.
*   Session state is read via the `@supabase/ssr` server client inside Server Components and API routes.
*   The Supabase anon key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) is safe for browser use.
*   The service role key (`SUPABASE_SERVICE_ROLE_KEY`) is server-only — never expose it to the browser bundle.

## 2. API Route Authentication
Every API route that reads or writes user data MUST verify the session before processing any downstream logic.

```typescript
// Canonical auth check — copy into every protected API route
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const supabase = createServerSupabaseClient();
const { data: { user }, error: authError } = await supabase.auth.getUser();

if (authError || !user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

Data Scoping Rule: Never trust a userId from the request body or parameters for data ownership decisions. Always derive the userId strictly from the authenticated server session.3. Supabase Row Level Security (RLS)RLS must be enabled on all tables. Apply these policies in the Supabase SQL editor after running your Prisma database migrations:SQL-- Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Badge" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "KnowledgeNode" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "KnowledgeEdge" ENABLE ROW LEVEL SECURITY;

-- User table: users can only read/update their own record
CREATE POLICY "Users: own record only"
  ON "User" FOR ALL
  USING (id = auth.uid()::text);

-- Session table
CREATE POLICY "Sessions: own sessions only"
  ON "Session" FOR ALL
  USING ("userId" = auth.uid()::text);

-- Badge table
CREATE POLICY "Badges: own badges only"
  ON "Badge" FOR ALL
  USING ("userId" = auth.uid()::text);

-- KnowledgeNode table
CREATE POLICY "KnowledgeNodes: own nodes only"
  ON "KnowledgeNode" FOR ALL
  USING ("userId" = auth.uid()::text);

-- KnowledgeEdge table
CREATE POLICY "KnowledgeEdges: own edges only"
  ON "KnowledgeEdge" FOR ALL
  USING ("userId" = auth.uid()::text);
Application-Layer Enforcement: Note that when using the Prisma service role client in API routes, RLS is bypassed at the database connection level. The application layer is entirely responsible for enforcing user data scoping via explicit where: { userId: user.id } queries.4. Client-Side Input ValidationAll user inputs must be fully validated on the client side BEFORE an API call network request is initiated. The API dispatch must be instantly aborted if any validation check fails.Validation RulesTopic Input: Required, min 3 characters, max 200 characters.Synthesis Answer: Required, min 3 characters, max 500 characters.Interest Selection: Minimum 2 items, maximum 3 items chosen.Implementation BlueprintTypeScriptconst handleSynthesisSubmission = () => {
  const normalizedTopic = topic.trim();
  
  if (normalizedTopic.length < 3) {
    setFieldError('topic', TOAST_MESSAGES.EMPTY_TOPIC);
    return; // Abort execution path before API invocation
  }
  if (normalizedTopic.length > MAX_TOPIC_LENGTH) {
    setFieldError('topic', `Topic must be under ${MAX_TOPIC_LENGTH} characters.`);
    return; // Abort
  }
  
  // Proceed with API network dispatch only after validation clears
  submitToAPI();
};
UI Directive: Render all client-side validation errors as red inline text explicitly positioned beneath the corresponding input field. Do not use toast notifications for local input errors.5. Server-Side Input ValidationAll API routes must parse and validate incoming request bodies using Zod as a strict second layer of defense:TypeScriptimport { NextResponse } from 'next/server';
import { z } from 'zod';

const SynthesisSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters long').max(200, 'Topic too long'),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = SynthesisSchema.safeParse(body);
  
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input parameters', details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  // Continue processing secure logic...
}
6. Environment Variable Security MatrixVariable NameExposure ProfileUsage ContextNEXT_PUBLIC_SUPABASE_URLBrowser-SafePublic client initializationNEXT_PUBLIC_SUPABASE_ANON_KEYBrowser-SafePublic client initializationSUPABASE_SERVICE_ROLE_KEYServer-OnlySupabase server client inside API routesDEEPSEEK_API_KEYServer-OnlyDeepSeek API client inside route handlersGEMINI_API_KEYServer-OnlyGemini API client inside route handlersDATABASE_URLServer-OnlyPrisma engine database client connectionSecurity EnforcementAny variable without the NEXT_PUBLIC_ prefix is automatically completely excluded from browser build bundles by Next.js.Never access DEEPSEEK_API_KEY or GEMINI_API_KEY inside a Client Component. Next.js will force these variables to return undefined and your functions will fail.Verification Verification Command: Run grep -r "DEEPSEEK_API_KEY" components/ in your environment terminal. This scanner query must return absolute zero results before code commits.7. AI API Error SuppressionRaw third-party AI API exceptions or timeout stack traces must never be exposed to the user interface. Always intercept errors on the server side and return the canonical token error code:TypeScript// app/api/synthesis/route.ts
try {
  const stream = await deepseek.chat.completions.create({ ... });
  // ... process streaming tokens downstream
} catch (err) {
  console.error('[CRITICAL_AI_ROUTING_EXCEPTION]:', err); // Log server-side only
  return NextResponse.json(
    { error: 'AI_TIMEOUT' }, // Structured error code for the client to map
    { status: 503 }
  );
}
The client application must catch the AI_TIMEOUT string and map it directly to TOAST_MESSAGES.AI_TIMEOUT.8. Supabase Storage SecurityBadge milestone assets are saved to a dedicated, isolated storage repository container named badges using the following boundaries:The storage bucket configuration must be private (not publicly accessible by default).File Pathway Structure: badges/{userId}/{badgeId}.pngClient assets are accessed exclusively via temporary, Supabase-signed URLs generated in the API route with a strict 1-hour expiration.Storage Access Control Policy:SQLCREATE POLICY "Badge storage: own files only"
  ON storage.objects FOR ALL
  USING (bucket_id = 'badges' AND (storage.foldername(name))[1] = auth.uid()::text);
9. Forbidden Security Patterns❌ Never trust client-supplied user parameters for identity choices; parse identities from verified session tokens only.❌ Never log, print, or expose user answers, AI system prompt inputs, or personal profiles within production error traces.❌ Never expose core administrative API keys inside client component script configurations.❌ Never drop, bypass, or mock PostgreSQL Row Level Security configurations within the production environment.❌ Never initialize or reference the SUPABASE_SERVICE_ROLE_KEY inside client-side modules.❌ Never persist sensitive personal learning details or profile variables inside local storage or session storage boxes.❌ Absolute ban on scaffolding financial processors, compliance systems, or checkout route verification scripts.