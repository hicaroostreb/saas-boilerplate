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

- **Node.js v18+**
- **Bun v1.0+** (`curl -fsSL https://bun.sh/install | bash`)
- **Docker** (Para banco de dados PostgreSQL local)
- **Stripe CLI** (Para webhooks locais)

### 1. Instalação e Configuração

O script de setup automatizado é o método recomendado. Ele validará os pré-requisitos, configurará o banco de dados, chaves de API e gerará os arquivos `.env`.

```
# Clone o repositório
git clone <your-repo-url>
cd saas-boilerplate

# Execute o setup automatizado
bun run scripts/setup.js
```

### 2. Rodando Localmente

Após o setup, inicie todos os aplicativos e pacotes em modo de desenvolvimento.

```
bun run dev
```

- **Marketing App**: `http://localhost:3000`
- **Dashboard App**: `http://localhost:3001`

### Credenciais de Teste Padrão

- **Email**: `test@test.com`
- **Password**: `admin123`

***

## Comandos de Limpeza Enterprise

O projeto utiliza scripts padronizados para limpeza em diferentes níveis:

### Level 1: Safe Clean
```bash
bun run clean:safe
```
**Remove**: dependencies e cache Turborepo  
**Quando usar**: Problemas de cache ou troca de package manager  
**Seguro**: Preserva builds e código fonte

### Level 2: Build Clean
```bash
bun run clean:build
```
**Remove**: Apenas outputs compilados (dist/, .next/)  
**Quando usar**: Após mudanças de config TypeScript/Next.js  
**Seguro**: Mantém dependencies instaladas

### Level 3: Cache Clean
```bash
bun run clean:cache
```
**Remove**: Caches de ferramentas (Babel, ESLint, Bun)  
**Quando usar**: Falhas misteriosas de lint/test/dev  
**Seguro**: Não afeta código ou builds

### Level 4: Full Clean
```bash
bun run clean:full
```
**Remove**: Tudo dos níveis 1+2+3  
**Quando usar**: Migração de tools ou corrupção profunda  
**Cuidado**: Remove tudo menos código fonte

### Level 5: Reset
```bash
bun run reset
```
**Executa**: Safe clean + bun install  
**Quando usar**: Recuperação rápida após clean:safe

### Level 6: Full Reset
```bash
bun run reset:full
```
**Executa**: Full clean + bun install  
**Quando usar**: Reset completo do ambiente

***

## Fluxo de Trabalho e Padrões de Qualidade

Este projeto segue padrões enterprise rigorosos para garantir a qualidade e a manutenibilidade do código.

### 1. Nomenclatura de Branches

Siga o padrão `type/scope/short-description` para todas as branches.

- **`type`**: `refactor`, `feat`, `fix`, `chore`, `docs`.
- **`scope`**: Nome do pacote ou área afetada (`database`, `auth`, `ui`, `ci`).
- **`short-description`**: Descrição curta em kebab-case (ex: `create-user-repository`).

**Exemplos:**

- `refactor/database/create-user-repository`
- `feat/billing/implement-subscription-cancel`
- `fix/ui/correct-button-variant-color`

### 2. Ciclo de Verificação de Qualidade (Ordem Obrigatória)

Todos os Pull Requests **devem passar** nos seguintes checks. Execute-os localmente para validar seu trabalho antes do push.

```
# 1. Formata todo o código (o mais rápido)
bun run format

# 2. Encontra erros de qualidade de código
bun run lint

# 3. Valida os tipos do TypeScript
bun run typecheck

# 4. Roda testes unitários/integração
bun run test

# 5. Compila a aplicação para produção (o mais lento)
bun run build
```

O pipeline de CI/CD executará esta sequência exata. Código que não passa em qualquer uma dessas etapas não será mesclado.

---

## Comandos Úteis

### Comandos Gerais (via Turborepo)

```
# Iniciar todos os apps em modo de desenvolvimento
bun run dev

# Construir todos os pacotes e apps para produção
bun run build

# Rodar todos os testes
bun run test

# Limpar todos os artefatos de build (node_modules, .turbo, dist)
bun run clean
```

### Operações de Banco de Dados (`@workspace/database`)

```
# Gerar um novo arquivo de migração a partir das mudanças no schema
bun run --filter "@workspace/database" generate

# Aplicar as migrações e empurrar o schema para o banco de dados
bun run --filter "@workspace/database" push

# Popular o banco de dados com dados de teste (idempotente)
bun run --filter "@workspace/database" seed

# Abrir o Drizzle Studio para visualizar e editar os dados
bun run --filter "@workspace/database" studio
```

### Webhooks do Stripe

O setup automatizado lida com isso. Para rodar manualmente, use o comando fornecido pelo Stripe CLI após o login, encaminhando para a porta da sua aplicação (neste caso, `3000` para a API route).

```
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

***

## Deployment em Produção

1. **Variáveis de Ambiente:** Crie um arquivo `.env.production.local` ou configure as seguintes variáveis no seu provedor de hosting (Vercel, Railway, etc.):
   ```
   DATABASE_URL="postgres://user:pass@host:port/db"
   NEXTAUTH_URL="https://yourdomain.com"
   NEXTAUTH_SECRET="gere_uma_chave_segura_com_openssl"
   AUTH_SECRET="use_a_mesma_chave_acima"
   STRIPE_SECRET_KEY="sk_live_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   # ... outras variáveis necessárias
   ```
2. **Configurar Webhook de Produção:** No dashboard do Stripe, aponte o webhook para `https://yourdomain.com/api/stripe/webhook`.
3. **Deploy:** Faça o deploy para a sua plataforma de preferência.
4. **Setup do Banco de Dados em Produção:** Execute os comandos de push e seed no ambiente de produção (a maioria das plataformas permite rodar comandos de build/release).
   ```
   bun run --filter "@workspace/database" push
   # bun run --filter "@workspace/database" seed  // Opcional, se precisar de dados iniciais
   ```