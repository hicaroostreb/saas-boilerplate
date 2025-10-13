# @workspace/shared

Utilitários puros, constantes globais e tipos básicos compartilhados entre todos os domínios do
monorepo.

## Princípios

- **Utilitários puros**: Funções sem side effects
- **Zero dependências de domínio**: Não deve conhecer regras de negócio específicas
- **TypeScript rigoroso**: Optional chaining (?.) e nullish coalescing (??)
- **Clean Architecture**: Separação clara de responsabilidades

## Estrutura

src/ ├── constants/ # Constantes globais (APP_CONFIG, LIMITS, HTTP_STATUS) ├── types/ # Tipos
TypeScript genéricos ├── schemas/ # Schemas Zod básicos reutilizáveis ├── utils/ # Utilitários puros
│ ├── date.ts # Formatação de datas │ ├── number.ts # Formatação de números e moedas │ ├──
string.ts # Manipulação de strings │ ├── file.ts # Utilitários de arquivo │ └── validation.ts #
Validações genéricas └── errors/ # Hierarquia de erros base

text

## Uso

// Utilitários de formatação import { formatCurrency, formatDate } from '@workspace/shared/utils';

// Constantes globais import { APP_CONFIG, LIMITS } from '@workspace/shared/constants';

// Schemas básicos import { PaginationSchema, SignInSchema } from '@workspace/shared/schemas';

// Erros base import { ValidationError, BaseError } from '@workspace/shared/errors';

text

## Guidelines

### ✅ O que DEVE estar no shared:

- Utilitários de formatação (datas, números, strings)
- Constantes globais da aplicação
- Tipos TypeScript genéricos
- Schemas Zod básicos reutilizáveis
- Classes de erro base

### ❌ O que NÃO deve estar no shared:

- Lógica de negócio específica
- Schemas de domínio específico
- Acesso a database ou APIs
- Configurações de ambiente específicas
- Componentes React

## Migração

Utilitários migrados de `@workspace/common`:

- `shared/formatters/*` → `utils/date.ts`, `utils/number.ts`
- `shared/utils/*` → `utils/file.ts`
- `domain/common/constants/*` → `constants/app.constants.ts`
- `domain/common/errors/*` → `errors/`
