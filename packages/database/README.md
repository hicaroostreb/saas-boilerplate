# @workspace/database

Multi-tenant database layer com Row-Level Security automático. Built with Drizzle ORM + PostgreSQL +
Supabase.

## Stack

- Drizzle ORM (type-safe queries)
- PostgreSQL/Supabase
- AsyncLocalStorage (tenant context)
- TypeScript strict mode

## Install & Setup

```
bun install
bun run db:push     # Aplica schema no Supabase
bun run db:seed     # Popula dados de teste
bun run db:studio   # Abre Drizzle Studio
```

## Como Funciona

Todas as 13 tabelas têm `tenant_id`. O `RLSRepositoryWrapper` injeta filtros automaticamente em
TODAS as queries.

Você escreve:

```
const users = await userRepo.findAll();
```

SQL gerado:

```
SELECT * FROM users WHERE tenant_id = 'current-tenant-123'
```

## Usage

### 1. Connection

```
import { createConnection } from '@workspace/database/connection';
const db = await createConnection();
```

### 2. Tenant Context (Middleware Next.js)

```
import { tenantContext } from '@workspace/database/connection';

export function middleware(request: NextRequest) {
  const tenantId = request.user.tenant_id; // Do session

  return tenantContext.runAsync({
    tenantId,
    userId: request.user.id
  }, () => {
    return NextResponse.next();
  });
}
```

### 3. Repositories (RLS automático)

```
import { DrizzleUserRepository } from '@workspace/database/repositories';

const userRepo = new DrizzleUserRepository(db);

// Todas automaticamente filtradas por tenant_id
const users = await userRepo.findAll();
const user = await userRepo.findByEmail('user@example.com');
const newUser = await userRepo.createWithPassword({
  email: 'new@example.com',
  name: 'New User',
  password: 'SecurePass123!',
});
```

### 4. Entities (Domain Logic)

```
import { UserEntity } from '@workspace/database/entities';

const userEntity = UserEntity.fromDatabase(dbUser);
const profile = userEntity.toPublicProfile();
const canLogin = userEntity.canLogin(); // business logic
```

### 5. Permissions (RBAC)

```
import { AuthorizationGuard } from '@workspace/database/repositories';

const guard = new AuthorizationGuard(db);
await guard.requirePermission(userId, orgId, 'can_manage_members');
```

## Estrutura

```
src/
├── connection/          # DB setup + TenantContext
├── schemas/             # 13 tabelas Drizzle (todas com tenant_id)
│   ├── auth/            # users, sessions, accounts
│   ├── business/        # organizations, memberships, projects, contacts
│   └── security/        # audit_logs, rate_limits
├── entities/            # UserEntity, OrganizationEntity, MembershipEntity
├── repositories/
│   ├── contracts/       # Interfaces
│   ├── implementations/ # Drizzle repos (User, Session, Org, Audit, RateLimit)
│   ├── rls-wrapper.ts   # Row-Level Security automático
│   └── authorization-guard.ts # RBAC permissions
└── seeders/             # production, testing, development
```

## Multi-Tenancy

### Automatic Filtering

```
// Context definido uma vez no middleware
tenantContext.run({ tenantId: 'acme-corp' }, () => {

  // TODAS as queries filtram automaticamente
  await userRepo.findAll();        // WHERE tenant_id = 'acme-corp'
  await orgRepo.findById(orgId);   // WHERE tenant_id = 'acme-corp' AND id = ?
  await sessionRepo.create({...}); // INSERT com tenant_id = 'acme-corp'
});
```

### System Context (sem RLS)

```
// Para admin operations cross-tenant
tenantContext.runAsSystem(() => {
  const allUsers = await db.select().from(users); // Sem filtro
});
```

## Security

- RLS automático em application layer
- RBAC com 4 roles: owner > admin > member > guest
- Audit logs para todos eventos de autenticação
- Rate limiting por tenant/user/organization
- Validação de quotas (members, projects, storage)

## Environment Variables

```
DATABASE_URL=postgresql://user:pass@host:5432/db
DATABASE_MAX_CONNECTIONS=10
DATABASE_LOGGING=false
```

## Testing

```
NODE_ENV=development bun run db:seed
```

Login: `test1@example.com` / `TestPass123`

## Scripts

```
bun run build          # Compila TypeScript
bun run db:push        # Aplica schema
bun run db:studio      # Visual editor
bun run db:seed        # Popula dados
```

## Examples

### Create User + Organization

```
await db.transaction(async (tx) => {
  const userRepo = new DrizzleUserRepository(tx);
  const orgRepo = new DrizzleOrganizationRepository(tx);

  const user = await userRepo.createWithPassword({
    email: data.email,
    name: data.name,
    password: data.password,
  });

  const org = await orgRepo.create({
    id: crypto.randomUUID(),
    name: data.companyName,
    slug: slugify(data.companyName),
    owner_id: user.id,
    plan_type: 'free',
  });

  return { user, org };
});
```

### Check Quota Before Action

```
const orgRepo = new DrizzleOrganizationRepository(db);
await orgRepo.validateMemberQuota(orgId); // Throws se excedeu

await memberRepo.create({ ... });
```

---

Dev-friendly, type-safe, multi-tenant by default. 🚀

```



```
