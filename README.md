# SaaS Boilerplate

Monorepo Turborepo para desenvolvimento de aplicações SaaS enterprise.

## Stack

- **Runtime:** Bun 1.1.38
- **Framework:** Next.js 15 (App Router)
- **Database:** PostgreSQL + Drizzle ORM
- **Auth:** Auth.js v5
- **Payments:** Stripe
- **UI:** shadcn/ui + Tailwind CSS
- **Monorepo:** Turborepo

## Estrutura

```
saas-boilerplate/
├── apps/
│   ├── marketing/        # Landing page (localhost:3000)
│   └── dashboard/        # Dashboard (localhost:3001)
└── packages/
    ├── @workspace/auth
    ├── @workspace/billing
    ├── @workspace/database
    ├── @workspace/ui
    └── @workspace/common
```

## Quick Start

### Pré-requisitos

- Node.js 18+
- Bun 1.0+ ([Install](https://bun.sh))
- Docker (PostgreSQL)
- Stripe CLI ([Install](https://stripe.com/docs/stripe-cli))

### Setup

```bash
# Clone e instale
git clone <repo-url>
cd saas-boilerplate
bun install

# Configure ambiente (automatizado)
bun run scripts/setup.js

# Inicie o projeto
bun run dev
```

**Acesse:**

- Marketing: http://localhost:3000
- Dashboard: http://localhost:3001

**Login de teste:**

- Email: `test@test.com`
- Senha: `admin123`

## Comandos Principais

### Desenvolvimento

```bash
bun run dev              # Inicia todos os apps
bun run dev:marketing    # Só marketing
bun run dev:dashboard    # Só dashboard
```

### Qualidade (ordem obrigatória)

```bash
bun run format          # 1. Formata código
bun run lint            # 2. Verifica qualidade
bun run typecheck       # 3. Valida tipos
bun run test            # 4. Roda testes
bun run build           # 5. Build produção
```

### Atalhos QA

```bash
bun run qa:fix          # Auto-fix format + lint
bun run qa:build        # format + lint + typecheck + build
bun run qa:full         # Tudo + E2E tests
```

### Database

```bash
bun run db:generate     # Gera migração
bun run db:push         # Aplica schema
bun run db:seed         # Popula dados teste
bun run db:studio       # Abre Drizzle Studio
```

### Limpeza

```bash
bun run clean:safe      # Remove node_modules + cache
bun run clean:build     # Remove dist/ .next/
bun run reset           # clean:safe + install
bun run reset:full      # Limpa tudo + install
```

## Workflow Git

### Branches

Padrão: `type/scope/description`

Exemplos:

- `feat/auth/add-google-oauth`
- `fix/billing/stripe-webhook-error`
- `refactor/database/user-repository`

### Proteções

- **Pre-commit:** lint-staged (rápido, só arquivos alterados)
- **Pre-push:** qa:build (completo, ~30-60s)
- **CI:** qa:build + E2E tests (em main/develop)

### Pull Requests

- PRs para `main` exigem CI passando
- Linear history obrigatório
- Force push bloqueado

## Deployment

### Variáveis Obrigatórias

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="..."
AUTH_SECRET="..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### Steps

1. Configure variáveis no provider (Vercel/Railway)
2. Configure webhook Stripe: `https://yourdomain.com/api/stripe/webhook`
3. Deploy
4. Execute migrações: `bun run db:push`

## Troubleshooting

### Problemas de cache

```bash
bun run reset:full
```

### Erro de types/lint após pull

```bash
bun run qa:fix
```

### Banco de dados dessincronizado

```bash
bun run db:push
```

### Stripe webhook não funciona

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Suporte

- [Documentação Turborepo](https://turbo.build/repo/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [Auth.js Docs](https://authjs.dev)
