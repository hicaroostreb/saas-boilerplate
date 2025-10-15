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
    ├── @workspace/common
    ├── @workspace/database
    ├── @workspace/e2e
    ├── @workspace/rate-limiter
    ├── @workspace/routes
    ├── @workspace/ui
    └── @workspace/webhooks
```

Comando para ver estrutura

```
find . \( -name node_modules -o -name .next -o -name dist -o -name .turbo -o -name .cache -o -name .git -o -name coverage \) -prune -o -print | sort
```

## Quick Start

### Pré-requisitos

- Node.js 18+
- Bun 1.0+ ([Install](https://bun.sh))
- Docker (PostgreSQL)
- Stripe CLI ([Install](https://stripe.com/docs/stripe-cli))

### Setup

```
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

```
bun run dev              # Inicia todos os apps
bun run dev:marketing    # Só marketing
bun run dev:dashboard    # Só dashboard
```

### Qualidade (ordem obrigatória)

```
bun run format          # 1. Formata código
bun run lint            # 2. Verifica qualidade
bun run typecheck       # 3. Valida tipos
bun run test            # 4. Roda testes
bun run build           # 5. Build produção
```

### Atalhos QA

```
bun run qa:fix          # Auto-fix format + lint
bun run qa:build        # format + lint + typecheck + build
bun run qa:full         # Tudo + E2E tests
```

### Database

```
bun run db:generate     # Gera migração
bun run db:push         # Aplica schema
bun run db:seed         # Popula dados teste
bun run db:studio       # Abre Drizzle Studio
```

### Limpeza (8 Níveis)

```bash
# Nível 1-2: Diário (1-5s)
bun run clean:cache     # .turbo + .eslintcache + .next/cache
bun run clean:outputs   # .next + dist

# Nível 3-4: Troubleshooting (5-30s)
bun run clean:builds    # cache + outputs
bun run clean:deps      # node_modules raiz

# Nível 5-6: Deep Clean (30-60s)
bun run clean:deps:all  # todos node_modules
bun run reset           # node_modules raiz + install

# Nível 7-8: Emergency (60-120s)
bun run reset:full      # tudo + todos node_modules + install
bun run reset:nuclear   # ☢️ tudo + bun.lockb + install
```

**Quando usar:**

- `clean:cache` → hot reload travado
- `clean:builds` → rebuild limpo
- `clean:deps` → limpar deps sem reinstalar
- `clean:deps:all` → limpar tudo sem reinstalar
- `reset` → após git pull, deps quebradas
- `reset:full` → "nada funciona"
- `reset:nuclear` → corrupção, migração (⚠️ muda lockfile)

**Utilitários:**
```bash
bun run clean:check     # ver tamanhos
bun run reset:cache     # rebuild com --force
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

```
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

| Problema              | Comando                                                        | Tempo |
| --------------------- | -------------------------------------------------------------- | ----- |
| Cache desatualizado   | `bun run clean:cache`                                          | ~2s   |
| Build inconsistente   | `bun run clean:outputs`                                        | ~5s   |
| Deps após pull        | `bun run reset`                                                | ~30s  |
| "Nada funciona"       | `bun run reset:full`                                           | ~60s  |
| Types/lint após pull  | `bun run qa:fix`                                               | ~10s  |
| Banco dessincronizado | `bun run db:push`                                              | ~5s   |
| Stripe webhook        | `stripe listen --forward-to localhost:3000/api/stripe/webhook` | -     |

## Suporte

- [Documentação Turborepo](https://turbo.build/repo/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [Auth.js Docs](https://authjs.dev)
