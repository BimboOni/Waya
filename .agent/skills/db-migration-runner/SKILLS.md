# skills/db-migration-runner/SKILL.md
Database Migration Runner — Prisma + Supabase PostgreSQL

## Purpose
Governs all database schema changes. No raw SQL edits to production. All changes flow through Prisma migrations.

---

## 1. Initial Setup

### Step 1: Configure Environment Variables
Supabase requires **two** connection strings in `.env.local`. Both are required — Prisma uses them for different operations:

```bash
# .env.local

# Transaction Pooler (port 6543) — used at runtime by the Prisma Client
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Direct Connection (port 5432) — used by Prisma migrate commands ONLY
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@db.[project-ref].supabase.co:5432/postgres"
```

> **Why two URLs?** Supabase's connection pooler (PgBouncer) is incompatible with the DDL statements that Prisma migrations emit. `DATABASE_URL` handles pooled runtime queries; `DIRECT_URL` gives `prisma migrate` a raw connection for schema changes.

### Step 2: Configure `prisma/schema.prisma` datasource
Both variables must be wired into the datasource block:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### Step 3: Initialize Prisma (first-time only)
```bash
npx prisma init
```
This creates `prisma/schema.prisma` and appends `DATABASE_URL` to `.env`. Manually add `DIRECT_URL` afterwards.

---

## 2. Schema File
The canonical schema is in [architecture.md](file:///Users/mac/Documents/Waya/.agent/rules/architecture.md) under "Database Layer". Always work from that schema as the source of truth.

**File path:** `prisma/schema.prisma`

> **Note:** The `User` model in `architecture.md` currently defines `lastActive DateTime?`. The streak timezone feature (per `AGENTS.md` rule 6) requires a `lastLocalDate String?` field (`'YYYY-MM-DD'` format) to safely compare browser-local dates. This field must be added to the canonical schema via a migration before being used in any API route or component.

---

## 3. Migration Commands

| Action | Command |
| :--- | :--- |
| Create and apply a new migration | `npx prisma migrate dev --name <migration-name>` |
| Apply pending migrations (CI/production) | `npx prisma migrate deploy` |
| Reset database (dev only — DESTROYS DATA) | `npx prisma migrate reset` |
| Regenerate Prisma Client after schema change | `npx prisma generate` |
| Inspect current DB state | `npx prisma db pull` |
| Open Prisma Studio (dev only) | `npx prisma studio` |

**Migration naming convention:** `snake_case`, descriptive
- `add_user_interests_array`
- `add_last_local_date_to_user`
- `create_knowledge_edges_table`

---

## 4. Migration Workflow (Step-by-Step)
When making a schema change:

1. Edit `prisma/schema.prisma` — make the change.
2. Run: `npx prisma migrate dev --name describe_your_change`
   - Creates a new SQL file in `prisma/migrations/`
   - Applies the migration to your local dev database
   - Regenerates the Prisma Client automatically
3. Verify: `npx prisma studio` — confirm the schema looks correct.
4. Test the API routes that use the changed model.
5. Commit both `prisma/schema.prisma` and the new `prisma/migrations/` folder.

**For production (Vercel deployment):**
- The build command is `prisma generate && next build`
- Run `npx prisma migrate deploy` as a part of your automated pipeline workflow immediately preceding deployment.

---

## 5. Adding a Field — Example
**Goal:** Add `lastLocalDate` field to `User` for timezone-safe streak tracking.

### Step 1: Edit `prisma/schema.prisma`
```prisma
model User {
  id            String    @id @default(uuid())
  // ... existing fields
  lastLocalDate String?   // 'YYYY-MM-DD' browser local date string
}
```

### Step 2: Run migration
```bash
npx prisma migrate dev --name add_last_local_date_to_user
```

### Step 3: Generated SQL (Prisma auto-creates this — do NOT write manually)
```sql
-- prisma/migrations/[timestamp]_add_last_local_date_to_user/migration.sql
ALTER TABLE "User" ADD COLUMN "lastLocalDate" TEXT;
```

### Step 4
Update `lib/streak.ts` to read/write `lastLocalDate`.

---

## 6. RLS Policies After Migration
After running `prisma migrate deploy` on production, apply RLS policies via Supabase SQL Editor. The full policy set is in [security.md](file:///Users/mac/Documents/Waya/.agent/rules/security.md).

**Order of operations:**
1. `prisma migrate deploy` (creates tables)
2. Apply RLS policies via Supabase SQL Editor
3. Verify policies with:
```sql
SELECT * FROM pg_policies WHERE tablename = 'User';
```

---

## 7. Seeding (Dev Only)
File: `prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create a test user for development matching the local date constraints
  await prisma.user.upsert({
    where: { email: 'test@waya.dev' },
    update: {},
    create: {
      id: 'test-user-uuid-0000',
      email: 'test@waya.dev',
      name: 'Test Student',
      interests: ['Mathematics', 'ScienceTech'],
      xp: 0,
      level: 1,
      streak: 0,
      lastLocalDate: null,
    },
  });
}

(async () => {
  try {
    await main();
  } catch (err) {
    console.error('[SEED_EXECUTION_FAULT]:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
```

Add to `package.json`:
```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

Run:
```bash
npx prisma db seed
```

---

## 8. Forbidden Patterns
- ❌ Never edit files in `prisma/migrations/` by hand.
- ❌ Never run `prisma migrate reset` in production profiles.
- ❌ Never use `prisma db push` (bypasses migration history — restricted only for non-relational prototyping).
- ❌ Never write raw SQL that creates or alters tables in Supabase SQL Editor (except for Row Level Security policy scripts).
- ❌ Never commit `.env.local` or any file containing active `DATABASE_URL` or `DIRECT_URL` values.
- ❌ Never use `DATABASE_URL` alone without `DIRECT_URL` — `prisma migrate` will fail against Supabase's pooled connection.