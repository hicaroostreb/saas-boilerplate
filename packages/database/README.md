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

---

## Core Concepts

### 1. Automatic Multi-Tenancy

All 13 tables have `tenant_id`. The `DatabaseWrapper` (RLS wrapper) automatically injects filters in
**ALL queries**.

**You write:** const users = await repos.user.findAll();

**Generated SQL:** SELECT \* FROM users WHERE tenant_id = 'current-tenant-123';

---

### 2. Tenant Context (Required)

**Every request MUST set tenant context before accessing database.**

#### Next.js Middleware Example

import { tenantContext, type TenantContext } from '@workspace/database';

export async function middleware(request: NextRequest) { const session = await getSession(request);

const context: TenantContext = { tenantId: session.tenant_id, userId: session.user_id,
organizationId: session.organization_id, isSuperAdmin: session.is_super_admin, // ✅ Flag de
superadmin source: 'jwt', };

// All database queries inside this callback are automatically filtered return
tenantContext.runAsync(context, async () => { return NextResponse.next(); }); }

---

### 3. Database Access

#### ✅ CORRECT (Application Code)

import { getDb, createRepositories } from '@workspace/database';

const db = await getDb(); const repos = await createRepositories(db); const users = await
repos.user.findAll();

#### ❌ WRONG (Bypasses RLS)

import { getDbRaw } from '@workspace/database';

const db = await getDbRaw(); // ⚠️ Only for migrations/seeders

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

---

### 5. Transactions

const db = await getDb();

await db.transactionWithRLS(async (tx) => { // tenant_id context preserved inside transaction const
user = await tx.insert(users).values({...}).returning(); const org = await
tx.insert(organizations).values({...}).returning(); });

---

### 6. Permissions (RBAC)

import { AuthorizationGuard } from '@workspace/database';

const db = await getDb(); const guard = new AuthorizationGuard(db);

// Throws ForbiddenError if user lacks permission await guard.requirePermission(userId, orgId,
'can_manage_members'); await guard.requireMinimumRole(userId, orgId, 'admin'); await
guard.requireOwner(userId, orgId);

---

## Superadmin (Cross-Tenant Access)

### Creating Superadmin (CLI/Script Only)

**⚠️ Superadmins can ONLY be created via direct SQL or CLI scripts. Never via API.**

import { getDbRaw } from '@workspace/database'; import { users } from '@workspace/database/schemas';
import { hash } from 'bcryptjs';

const db = await getDbRaw();

await db.insert(users).values({ id: crypto.randomUUID(), tenant_id: 'system', email:
'admin@yourcompany.com', name: 'Super Admin', password_hash: await hash('SecurePassword123!', 10),
is_super_admin: true, is_active: true, is_email_verified: true, });

console.log('✅ Superadmin created');

**Run:** bun run scripts/create-superadmin.ts

---

## License

MIT
