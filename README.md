# SaaS Boilerplate - Guia Técnico do Desenvolvedor

Este repositório é um monorepo Turborepo para o desenvolvimento de aplicações SaaS.

## Estrutura do Monorepo

```
saas-boilerplate/
├── packages/
│   ├── @workspace/auth          # Lógica de autenticação (Auth.js v5)
│   ├── @workspace/billing       # Integração com Stripe
│   ├── @workspace/database      # Schema (Drizzle ORM), migrações e queries
│   ├── @workspace/ui            # Componentes de UI compartilhados (shadcn/ui)
│   ├── @workspace/common        # Utilitários e tipos compartilhados
│   └── tooling/
│       ├── eslint-config        # Configuração do ESLint
│       ├── prettier-config      # Configuração do Prettier
│       ├── tailwind-config      # Configuração do Tailwind CSS
│       └── typescript-config    # Configuração do TypeScript
└── apps/
    ├── dashboard/               # Aplicação principal (localhost:3001)
    └── marketing/               # Landing page (localhost:3000)
```

## Setup do Ambiente

### Pré-requisitos

*   **Node.js v18+**
*   **pnpm** (`npm install -g pnpm`)
*   **Docker** (Para banco de dados PostgreSQL local)
*   **Stripe CLI** (Para webhooks locais)

### 1. Instalação e Configuração

O script de setup automatizado é o método recomendado. Ele validará os pré-requisitos, configurará o banco de dados, chaves de API e gerará os arquivos `.env`.

```bash
# Clone o repositório
git clone <your-repo-url>
cd saas-boilerplate

# Execute o setup automatizado
node scripts/setup.js
```

### 2. Rodando Localmente

Após o setup, inicie todos os aplicativos e pacotes em modo de desenvolvimento.

```bash
pnpm dev
```
*   **Marketing App**: `http://localhost:3000`
*   **Dashboard App**: `http://localhost:3001`

### Credenciais de Teste Padrão

*   **Email**: `test@test.com`
*   **Password**: `admin123`

---

## Fluxo de Trabalho e Padrões de Qualidade

Este projeto segue padrões enterprise rigorosos para garantir a qualidade e a manutenibilidade do código.

### 1. Nomenclatura de Branches

Siga o padrão `type/scope/short-description` para todas as branches.

*   **`type`**: `refactor`, `feat`, `fix`, `chore`, `docs`.
*   **`scope`**: Nome do pacote ou área afetada (`database`, `auth`, `ui`, `ci`).
*   **`short-description`**: Descrição curta em kebab-case (ex: `create-user-repository`).

**Exemplos:**
*   `refactor/database/create-user-repository`
*   `feat/billing/implement-subscription-cancel`
*   `fix/ui/correct-button-variant-color`

### 2. Ciclo de Verificação de Qualidade (Ordem Obrigatória)

Todos os Pull Requests **devem passar** nos seguintes checks. Execute-os localmente para validar seu trabalho antes do push.

```bash
# 1. Formata todo o código (o mais rápido)
pnpm format

# 2. Encontra erros de qualidade de código
pnpm lint

# 3. Valida os tipos do TypeScript
pnpm typecheck

# 4. Roda testes unitários/integração
pnpm test

# 5. Compila a aplicação para produção (o mais lento)
pnpm build
```

O pipeline de CI/CD executará esta sequência exata. Código que não passa em qualquer uma dessas etapas não será mesclado.

---

## Comandos Úteis

### Comandos Gerais (via Turborepo)
```bash
# Iniciar todos os apps em modo de desenvolvimento
pnpm dev

# Construir todos os pacotes e apps para produção
pnpm build

# Rodar todos os testes
pnpm test

# Limpar todos os artefatos de build (node_modules, .turbo, dist)
pnpm clean
```

### Operações de Banco de Dados (`@workspace/database`)
```bash
# Gerar um novo arquivo de migração a partir das mudanças no schema
pnpm --filter "@workspace/database" run generate

# Aplicar as migrações e empurrar o schema para o banco de dados
pnpm --filter "@workspace/database" run push

# Popular o banco de dados com dados de teste (idempotente)
pnpm --filter "@workspace/database" run seed

# Abrir o Drizzle Studio para visualizar e editar os dados
pnpm --filter "@workspace/database" run studio
```

### Webhooks do Stripe
O setup automatizado lida com isso. Para rodar manualmente, use o comando fornecido pelo Stripe CLI após o login, encaminhando para a porta da sua aplicação (neste caso, `3000` para a API route).
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## Deployment em Produção

1.  **Variáveis de Ambiente:** Crie um arquivo `.env.production.local` ou configure as seguintes variáveis no seu provedor de hosting (Vercel, Railway, etc.):
    ```env
    DATABASE_URL="postgres://user:pass@host:port/db"
    NEXTAUTH_URL="https://yourdomain.com"
    NEXTAUTH_SECRET="gere_uma_chave_segura_com_openssl"
    AUTH_SECRET="use_a_mesma_chave_acima"
    STRIPE_SECRET_KEY="sk_live_..."
    STRIPE_WEBHOOK_SECRET="whsec_..."
    # ... outras variáveis necessárias
    ```
2.  **Configurar Webhook de Produção:** No dashboard do Stripe, aponte o webhook para `https://yourdomain.com/api/stripe/webhook`.
3.  **Deploy:** Faça o deploy para a sua plataforma de preferência.
4.  **Setup do Banco de Dados em Produção:** Execute os comandos de push e seed no ambiente de produção (a maioria das plataformas permite rodar comandos de build/release).
    ```bash
    pnpm --filter "@workspace/database" run push
    # pnpm --filter "@workspace/database" run seed  // Opcional, se precisar de dados iniciais
    ```