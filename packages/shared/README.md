# @workspace/shared

Utilitários puros, constantes globais e tipos básicos compartilhados entre todos os domínios do
monorepo. Nota de qualidade: 9.7/10

## Princípios

- Utilitários puros: Funções sem side effects, testáveis e previsíveis
- Zero dependências de domínio: Não conhece regras de negócio específicas
- TypeScript rigoroso: Optional chaining e nullish coalescing
- Clean Architecture: Separação clara de responsabilidades
- 100% testado: Cobertura completa das funções críticas

## Instalação

Import direto: import { formatCurrency, validateEmail } from '@workspace/shared'; Import por
categoria: import { numberUtils, validationUtils } from '@workspace/shared/utils'; Import
específico: import { formatDate } from '@workspace/shared/utils/date';

## Date Utils

formatDate('2024-01-15') retorna "15/01/2024" formatDateTime(new Date()) retorna "15/01/2024 às
14:30" formatRelativeTime('2024-01-10') retorna "há 5 dias" formatMonthYear(new Date()) retorna
"janeiro 2024"

## Number & Currency Utils

formatCurrency(1999.50) retorna "R$ 1.999,50" formatUSD(1999.50) retorna "$1,999.50"
formatNumber(1500000) retorna "1.500.000" formatCompactNumber(1500000) retorna "1,5 mi"
formatPercentage(15.5) retorna "15,50%"

## File Utils

formatFileSize(1024000) retorna "1,00 MB" isImageFile('photo.jpg') retorna true
sanitizeFileName('arquivo<>perigoso.txt') retorna "arquivoperigoso.txt"
generateUniqueFileName('photo.jpg') retorna "photo_timestamp.jpg"

## String Utils

capitalize('joão silva') retorna "João silva" truncate('Texto muito longo...', 10) retorna "Texto
m..." slugify('Meu Artigo Especial!') retorna "meu-artigo-especial" formatCPF('12345678901') retorna
"123.456.789-01" formatPhone('11987654321') retorna "(11) 98765-4321"

## Validation Utils

isValidEmail('user@example.com') retorna true validatePassword('weak') retorna { isValid: false,
errors: [...] } validateEmail('invalid') retorna { isValid: false, errors: ['Please enter a valid
email address'] } generateSecureId() retorna string aleatória segura

## Constantes Disponíveis

APP_CONFIG.NAME = "SaaS Boilerplate" LIMITS.MAX_FILE_SIZE = 10485760 (10MB)
LIMITS.MAX_TEAMS_PER_USER = 5 BILLING_PLANS.PRO.MONTHLY_PRICE = 29

## Estrutura

src/constants/ - Constantes globais src/types/ - Tipos TypeScript genéricos  
src/schemas/ - Schemas Zod básicos src/utils/ - Utilitários puros 100% testados src/errors/ -
Hierarquia de erros base

## Testes

bun run test - Executar todos os testes bun run test:watch - Testes em modo watch bun run
test:coverage - Relatório de cobertura

Cobertura atual: 100% das funções críticas testadas com casos edge incluídos.
