#!/bin/bash

# Fix adapters/repositories imports
sed -i 's|../types|../../types|g' packages/auth/src/adapters/repositories/*.ts

# Fix core/services imports - tipos
find packages/auth/src/core/services -name "*.ts" -exec sed -i 's|../types|../../types|g' {} \;

# Fix core/services imports - repositories
find packages/auth/src/core/services -name "*.ts" -exec sed -i 's|../repositories/|../../adapters/repositories/|g' {} \;

# Fix core/services imports - password/security/audit (agora são services)
find packages/auth/src/core/services -name "*.ts" -exec sed -i 's|../password|./password.service|g' {} \;
find packages/auth/src/core/services -name "*.ts" -exec sed -i 's|../security|./security.service|g' {} \;
find packages/auth/src/core/services -name "*.ts" -exec sed -i 's|../audit|./audit.service|g' {} \;

# Fix gateways (agora em adapters ou utils)
find packages/auth/src/core/services -name "*.ts" -exec sed -i 's|../gateways/device-info.gateway|../../utils/device-info.utils|g' {} \;

# Fix lib/nextauth imports
find packages/auth/src/lib/nextauth -name "*.ts" -exec sed -i 's|\.config|.ts|g' {} \;
find packages/auth/src/lib/nextauth -name "*.ts" -exec sed -i 's|../services/|../../core/services/|g' {} \;
find packages/auth/src/lib/nextauth -name "*.ts" -exec sed -i 's|../types|../../types|g' {} \;

# Fix config imports dentro do nextauth
find packages/auth/src/lib/nextauth -name "*.ts" -exec sed -i 's|./adapter.config|./adapter|g' {} \;
find packages/auth/src/lib/nextauth -name "*.ts" -exec sed -i 's|./callbacks.config|./callbacks|g' {} \;
find packages/auth/src/lib/nextauth -name "*.ts" -exec sed -i 's|./pages.config|./pages|g' {} \;
find packages/auth/src/lib/nextauth -name "*.ts" -exec sed -i 's|./providers.config|./providers|g' {} \;

echo "✅ Imports corrigidos!"
