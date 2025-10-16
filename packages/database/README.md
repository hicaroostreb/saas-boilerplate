# @workspace/database

Enterprise-grade multi-tenant database layer with automatic Row-Level Security (RLS).

## Stack

- **Drizzle ORM** (type-safe queries)
- **PostgreSQL** with Row-Level Security (RLS)
- **AsyncLocalStorage** (automatic tenant context propagation)
- **TypeScript** strict mode

---

## Quick Start

bun install bun run db:push # Apply schema bun run db:seed # Seed test data bun run db:studio # Open
Drizzle Studio

text

---

## Core Concepts

### 1. Automatic Multi-Tenancy

All 13 tables have `tenant_id`. The `DatabaseWrapper` (RLS wrapper) automatically injects filters in
**ALL queries**.

**You write:** const users = await repos.user.findAll();

text

**Generated SQL:** SELECT \* FROM users WHERE tenant_id = 'current-tenant-123'

text

---

### 2. Tenant Context (Required)

**Every request MUST set tenant context before accessing database.**

#### Next.js Middleware Example:

import { tenantContext, type TenantContext } from '@workspace/database';

export async function middleware(request: NextRequest) { const session = await getSession(request);

const context: TenantContext = { tenantId: session.tenant_id, userId: session.user_id,
organizationId: session.organization_id, isSuperAdmin: session.is_super_admin, // ✅ Flag de
superadmin source: 'jwt', };

// All database queries inside this callback are automatically filtered return
tenantContext.runAsync(context, async () => { return NextResponse.next(); }); }

text

---

### 3. Database Access

#### ✅ CORRECT (Application Code):

import { getDb, createRepositories } from '@workspace/database';

// Get RLS-wrapped database const db = await getDb();

// Create repositories const repos = await createRepositories(db);

// All queries automatically filtered by tenant_id const users = await repos.user.findAll();

text

#### ❌ WRONG (Bypasses RLS):

import { getDbRaw } from '@workspace/database';

const db = await getDbRaw(); // ⚠️ Only for migrations/seeders

text

---

### 4. Repository Usage

import { getDb, createRepositories } from '@workspace/database';

async function handler(request: Request) { const db = await getDb(); const repos = await
createRepositories(db);

// All automatically filtered by tenant_id from context const user = await
repos.user.findByEmail('user@example.com'); const orgs = await repos.organization.findAll();

// Create user (tenant_id injected automatically) const newUser = await
repos.user.createWithPassword({ email: 'new@example.com', name: 'New User', password:
'SecurePass123!', }); }

text

---

### 5. Transactions

const db = await getDb();

await db.transactionWithRLS(async (tx) => { // tenant_id context preserved inside transaction const
user = await tx.insert(users).values({...}).returning(); const org = await
tx.insert(organizations).values({...}).returning(); });

text

---

### 6. Permissions (RBAC)

import { AuthorizationGuard } from '@workspace/database';

const db = await getDb(); const guard = new AuthorizationGuard(db);

// Throws ForbiddenError if user lacks permission await guard.requirePermission(userId, orgId,
'can_manage_members'); await guard.requireMinimumRole(userId, orgId, 'admin'); await
guard.requireOwner(userId, orgId);

text

---

## Superadmin (Cross-Tenant Access)

### Creating Superadmin (CLI/Script Only)

**⚠️ Superadmins can ONLY be created via direct SQL or CLI scripts. Never via API.**

// scripts/create-superadmin.ts import { getDbRaw } from '@workspace/database'; import { users }
from '@workspace/database/schemas'; import { hash } from 'bcryptjs';

const db = await getDbRaw();

await db.insert(users).values({ id: crypto.randomUUID(), tenant_id: 'system', // Special tenant for
superadmins email: 'admin@yourcompany.com', name: 'Super Admin', password_hash: await
hash('SecurePassword123!', 10), is_super_admin: true, is_active: true, is_email_verified: true, //
⚠️ MFA required in production });

console.log('✅ Superadmin created');

text

**Run:** bun run scripts/create-superadmin.ts

text

---

### Using Superadmin Context

import { tenantContext, type TenantContext } from '@workspace/database';

// In middleware or API route const superadminContext: TenantContext = { tenantId: 'superadmin', //
Special tenant ID userId: adminUserId, isSuperAdmin: true, source: 'system', };

await tenantContext.runAsync(superadminContext, async () => { const db = await getDb(); const repos
= await createRepositories(db);

// Can access data from ANY tenant const allOrgs = await repos.organization.findAll();

// ⚠️ All actions logged in auth_audit_logs with risk_level: 'critical' });

text

---

### Superadmin Security

- ✅ Created ONLY via CLI/direct SQL (never via signup API)
- ✅ MFA mandatory in production
- ✅ All actions logged in `auth_audit_logs` with `risk_level: 'critical'`
- ✅ Bypasses RLS policies at both application and database level
- ✅ `AuthorizationGuard` automatically grants all permissions
- ✅ Cannot be created through normal application flows

**Database-level bypass:** -- RLS policy includes superadmin check CREATE POLICY
"users_tenant_isolation" ON "users" FOR ALL USING ( tenant_id = current_tenant_id() OR
current_user_is_super_admin() = true -- ✅ Bypass );

text

---

## Multi-Tenancy Patterns

### Automatic Filtering

// Context set once in middleware tenantContext.run({ tenantId: 'acme-corp' }, async () => { // ALL
queries filtered automatically await repos.user.findAll(); // WHERE tenant_id = 'acme-corp' await
repos.organization.findById(id); // WHERE tenant_id = 'acme-corp' AND id = ? });

text

---

### System Context (Migrations/Seeders)

// ⚠️ Use ONLY for admin operations tenantContext.runAsSystem(async () => { const db = await
getDbRaw(); const allUsers = await db.select().from(users); // No tenant filter });

text

---

## Security

- ✅ RLS enforced at application + database layer
- ✅ RBAC with 5 roles: `owner > admin > manager > member > viewer`
- ✅ Audit logs for all auth events
- ✅ Rate limiting per tenant/user/organization
- ✅ Quota validation (members, projects, storage)
- ✅ Soft delete with audit trail
- ✅ Superadmin bypass with full audit logging

---

## Environment Variables

Pooler connection (PgBouncer) - use in runtime DATABASE_URL=postgresql://user:pass@host:6543/db

Direct connection - use ONLY for migrations DIRECT_DATABASE_URL=postgresql://user:pass@host:5432/db

text

---

## Testing

NODE_ENV=development bun run db:seed

text

**Login credentials:** `test1@example.com` / `TestPass123`

---

## Examples

### Create User + Organization (Transaction)

const db = await getDb();

await db.transactionWithRLS(async (tx) => { const [user] = await tx.insert(users).values({ id:
crypto.randomUUID(), email: 'user@example.com', name: 'John Doe', password_hash: await
hash('password', 10), }).returning();

const [org] = await tx.insert(organizations).values({ id: crypto.randomUUID(), name: 'Acme Corp',
slug: 'acme-corp', owner_id: user.id, plan_type: 'free', }).returning();

return { user, org }; });

text

---

### Check Quota Before Action

const db = await getDb(); const repos = await createRepositories(db);

// Throws QuotaExceededError if limit reached await repos.organization.validateMemberQuota(orgId);

// Proceed with action await repos.membership.create({...});

text

---

## Architecture

src/ ├── connection/ │ ├── database.connection.ts # Connection manager │ ├── tenant-context.ts #
AsyncLocalStorage context │ └── config.ts ├── schemas/ # Drizzle schemas (13 tables) │ ├── auth/ #
users, sessions, accounts │ ├── business/ # organizations, memberships, projects │ └── security/ #
audit_logs, rate_limits ├── entities/ # Domain entities ├── repositories/ │ ├── contracts/ #
Repository interfaces │ ├── implementations/ # Drizzle repositories │ ├── rls-wrapper.ts # RLS
enforcement (internal) │ ├── authorization-guard.ts # RBAC │ └── factory.ts └── seeders/

text

---

## Best Practices

### ✅ DO

- Always use `await getDb()` (returns RLS-wrapped DB)
- Set tenant context in middleware
- Use `transactionWithRLS()` for multi-step operations
- Create repositories via `createRepositories(db)`
- Log superadmin actions in audit logs
- Use `isSuperAdmin: true` flag for cross-tenant access

### ❌ DON'T

- Never use `getDbRaw()` in application code
- Never bypass tenant context
- Never create `RLSRepositoryWrapper` manually (it's internal)
- Never hardcode tenant_id in queries
- Never create superadmin via API endpoints
- Never skip audit logging for superadmin actions

---

## Database Schema

### Multi-Tenant Tables (13 tables with `tenant_id`):

**Auth:**

- `users` - User accounts with superadmin flag
- `sessions` - Active sessions
- `accounts` - OAuth accounts
- `verification_tokens` - Email/phone verification

**Business:**

- `organizations` - Tenant organizations
- `memberships` - User-Organization relationships (RBAC)
- `invitations` - Pending invites
- `projects` - Projects per organization
- `contacts` - CRM contacts

**Security:**

- `auth_audit_logs` - Authentication events
- `password_reset_tokens` - Password reset requests
- `rate_limits` - Rate limiting per tenant
- `activity_logs` - Business activity audit trail

### Unique Constraints (Soft Delete Aware):

-- Email unique per tenant (ignores deleted) CREATE UNIQUE INDEX "users_tenant_email_unique" ON
"users"("tenant_id", "email") WHERE "deleted_at" IS NULL;

-- Slug unique per tenant in organizations CREATE UNIQUE INDEX "organizations_tenant_slug_unique" ON
"organizations"("tenant_id", "slug") WHERE "deleted_at" IS NULL;

-- Slug unique per organization in projects CREATE UNIQUE INDEX "projects_org_slug_unique" ON
"projects"("organization_id", "slug") WHERE "deleted_at" IS NULL;

text

---

## Troubleshooting

### Error: "TenantContext not set"

**Cause:** Accessing database without setting tenant context.

**Fix:** Set context in middleware before any database operation:

export async function middleware(request: NextRequest) { const session = await getSession(request);

return tenantContext.runAsync({ tenantId: session.tenant_id, userId: session.user_id, source: 'jwt',
}, async () => { return NextResponse.next(); }); }

text

---

### Error: "Result contains data from different tenant"

**Cause:** Manually bypassing RLS or incorrect tenant context.

**Fix:** Always use `getDb()` and never use `getDbRaw()` in application code.

---

### Superadmin Cannot Access Data

**Cause:** `isSuperAdmin` flag not set in tenant context.

**Fix:** const context: TenantContext = { tenantId: 'superadmin', userId: adminUserId, isSuperAdmin:
true, // ✅ Critical source: 'system', };

text

---

## Migration Guide (Breaking Changes)

### Before (v1.x - INSECURE):

import { getDb } from '@workspace/database';

const db = await getDb(); // Returned Database raw await db.select().from(users); // ❌ No RLS

text

### After (v2.x - SECURE):

import { getDb, createRepositories } from '@workspace/database';

const db = await getDb(); // Returns DatabaseWrapper const repos = await createRepositories(db);
await repos.user.findAll(); // ✅ RLS automatic

text

---

**Built for enterprise. Secure by default. Developer-friendly.** 🚀

---
