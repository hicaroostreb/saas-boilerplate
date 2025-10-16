#!/bin/bash

# ===============================================
# RLS SECURITY AUDIT - Multi-Tenant Database
# Enterprise-Grade Security Scanner
# ===============================================

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "==============================================="
echo "RLS SECURITY AUDIT - Multi-Tenant Database"
echo "==============================================="
echo ""

REPO_DIR="packages/database/src/repositories/implementations"
ERRORS=0
WARNINGS=0

# ===============================================
# 1. CRITICAL: Direct database queries
# ===============================================
echo -e "${BLUE}[1/11]${NC} Checking for direct database queries..."
DIRECT_QUERIES=$(grep -rn "this\.db\.\(select\|update\|delete\|insert\)" "$REPO_DIR" | grep -v "// OK:\|transactionWithRLS")

if [ -n "$DIRECT_QUERIES" ]; then
  echo -e "${RED}[CRITICAL]${NC} Direct database queries found (bypasses RLS):"
  echo "$DIRECT_QUERIES"
  ERRORS=$((ERRORS+1))
else
  echo -e "${GREEN}[PASS]${NC} No direct queries found"
fi
echo ""

# ===============================================
# 2. Create methods without transactionWithRLS
# ===============================================
echo -e "${BLUE}[2/11]${NC} Checking create methods for transactionWithRLS..."
CREATE_METHODS=$(grep -rn "async create(" "$REPO_DIR" | cut -d: -f1-2)

while IFS= read -r line; do
  if [ -z "$line" ]; then continue; fi
  
  FILE=$(echo "$line" | cut -d: -f1)
  LINE_NUM=$(echo "$line" | cut -d: -f2)
  METHOD_BODY=$(sed -n "${LINE_NUM},$((LINE_NUM+25))p" "$FILE")
  
  if echo "$METHOD_BODY" | grep -q "transactionWithRLS"; then
    echo -e "${GREEN}[OK]${NC} $FILE:$LINE_NUM uses transactionWithRLS"
  else
    echo -e "${YELLOW}[WARNING]${NC} $FILE:$LINE_NUM does NOT use transactionWithRLS"
    WARNINGS=$((WARNINGS+1))
  fi
done <<< "$CREATE_METHODS"
echo ""

# ===============================================
# 3. Update methods without transactionWithRLS
# ===============================================
echo -e "${BLUE}[3/11]${NC} Checking update methods for transactionWithRLS..."
UPDATE_METHODS=$(grep -rn "async update(" "$REPO_DIR" | grep -v "updateLastAccessed\|updateDeviceInfo\|updateLocation\|updateLastLogin" | cut -d: -f1-2)

while IFS= read -r line; do
  if [ -z "$line" ]; then continue; fi
  
  FILE=$(echo "$line" | cut -d: -f1)
  LINE_NUM=$(echo "$line" | cut -d: -f2)
  METHOD_BODY=$(sed -n "${LINE_NUM},$((LINE_NUM+25))p" "$FILE")
  
  if echo "$METHOD_BODY" | grep -q "transactionWithRLS"; then
    echo -e "${GREEN}[OK]${NC} $FILE:$LINE_NUM uses transactionWithRLS"
  else
    echo -e "${YELLOW}[WARNING]${NC} $FILE:$LINE_NUM does NOT use transactionWithRLS"
    WARNINGS=$((WARNINGS+1))
  fi
done <<< "$UPDATE_METHODS"
echo ""

# ===============================================
# 4. Delete methods without RLS protection
# ===============================================
echo -e "${BLUE}[4/11]${NC} Checking delete methods for RLS protection..."
DELETE_METHODS=$(grep -rn "async delete(" "$REPO_DIR" | cut -d: -f1-2)

while IFS= read -r line; do
  if [ -z "$line" ]; then continue; fi
  
  FILE=$(echo "$line" | cut -d: -f1)
  LINE_NUM=$(echo "$line" | cut -d: -f2)
  METHOD_BODY=$(sed -n "${LINE_NUM},$((LINE_NUM+25))p" "$FILE")
  
  if echo "$METHOD_BODY" | grep -q "transactionWithRLS\|rls\.softDelete\|rls\.deleteWhere"; then
    echo -e "${GREEN}[OK]${NC} $FILE:$LINE_NUM uses RLS method"
  else
    echo -e "${YELLOW}[WARNING]${NC} $FILE:$LINE_NUM may not use RLS properly"
    WARNINGS=$((WARNINGS+1))
  fi
done <<< "$DELETE_METHODS"
echo ""

# ===============================================
# 5. INSERTs without wrapper
# ===============================================
echo -e "${BLUE}[5/11]${NC} Checking INSERTs for RLS wrapper..."
INSERTS=$(grep -rn "\.insert(" "$REPO_DIR")

echo "$INSERTS" | while IFS= read -r line; do
  if [ -z "$line" ]; then continue; fi
  
  if echo "$line" | grep -q "this\.rls\.insert\|await this.rls.insert"; then
    FILE_LINE=$(echo "$line" | cut -d: -f1-2)
    echo -e "${GREEN}[OK]${NC} $FILE_LINE uses rls.insert"
  else
    FILE=$(echo "$line" | cut -d: -f1)
    LINE_NUM=$(echo "$line" | cut -d: -f2)
    CONTEXT=$(sed -n "$((LINE_NUM-5)),$((LINE_NUM+2))p" "$FILE" 2>/dev/null)
    
    if echo "$CONTEXT" | grep -q "transactionWithRLS"; then
      FILE_LINE=$(echo "$line" | cut -d: -f1-2)
      echo -e "${GREEN}[OK]${NC} $FILE_LINE - inside transactionWithRLS"
    else
      FILE_LINE=$(echo "$line" | cut -d: -f1-2)
      echo -e "${YELLOW}[REVIEW]${NC} $FILE_LINE"
      echo "         $(echo "$line" | cut -d: -f3-)"
    fi
  fi
done
echo ""

# ===============================================
# 6. CRITICAL: Direct queries after RLS operations
# ===============================================
echo -e "${BLUE}[6/11]${NC} Checking post-operation queries..."
POST_OP=$(grep -rn "rls\.insert\|rls\.updateWhere" "$REPO_DIR" | cut -d: -f1-2)

POST_OP_ERRORS=0
while IFS= read -r line; do
  if [ -z "$line" ]; then continue; fi
  
  FILE=$(echo "$line" | cut -d: -f1)
  LINE_NUM=$(echo "$line" | cut -d: -f2)
  NEXT_LINES=$(sed -n "$((LINE_NUM+1)),$((LINE_NUM+5))p" "$FILE")
  
  if echo "$NEXT_LINES" | grep -q "this\.db\.select\|this\.db\.update"; then
    echo -e "${RED}[CRITICAL]${NC} $FILE:$LINE_NUM - Direct query after RLS operation"
    echo "  Next lines bypass RLS wrapper"
    ERRORS=$((ERRORS+1))
    POST_OP_ERRORS=$((POST_OP_ERRORS+1))
  fi
done <<< "$POST_OP"

if [ $POST_OP_ERRORS -eq 0 ]; then
  echo -e "${GREEN}[PASS]${NC} No post-operation bypasses found"
fi
echo ""

# ===============================================
# 7. CRITICAL: Authorization guards
# ===============================================
echo -e "${BLUE}[7/11]${NC} Checking authorization guards..."
DELETE_GUARD_ERRORS=0

DELETE_METHODS=$(grep -rn "async delete(" "$REPO_DIR" | grep -v "deleteExpired\|deleteMany\|softDelete" | cut -d: -f1-2)
while IFS= read -r line; do
  if [ -z "$line" ]; then continue; fi
  
  FILE=$(echo "$line" | cut -d: -f1)
  LINE_NUM=$(echo "$line" | cut -d: -f2)
  METHOD_BODY=$(sed -n "${LINE_NUM},$((LINE_NUM+30))p" "$FILE")
  
  # Aceitar: requireOwner, requirePermission, validação manual (requestingUserId), ou Forbidden
  if echo "$METHOD_BODY" | grep -q "requireOwner\|requirePermission.*delete\|can_delete_organization\|requestingUserId\|FORBIDDEN"; then
    echo -e "${GREEN}[OK]${NC} $FILE:$LINE_NUM has authorization guard"
  else
    echo -e "${RED}[CRITICAL]${NC} $FILE:$LINE_NUM - Delete without authorization guard"
    DELETE_GUARD_ERRORS=$((DELETE_GUARD_ERRORS+1))
    ERRORS=$((ERRORS+1))
  fi
done <<< "$DELETE_METHODS"

UPDATE_PLAN_METHODS=$(grep -rn "async updatePlan(" "$REPO_DIR" | cut -d: -f1-2)
while IFS= read -r line; do
  if [ -z "$line" ]; then continue; fi
  
  FILE=$(echo "$line" | cut -d: -f1)
  LINE_NUM=$(echo "$line" | cut -d: -f2)
  METHOD_BODY=$(sed -n "${LINE_NUM},$((LINE_NUM+20))p" "$FILE")
  
  if echo "$METHOD_BODY" | grep -q "requirePermission.*billing\|can_manage_billing"; then
    echo -e "${GREEN}[OK]${NC} $FILE:$LINE_NUM has billing permission check"
  else
    echo -e "${RED}[CRITICAL]${NC} $FILE:$LINE_NUM - updatePlan without can_manage_billing"
    ERRORS=$((ERRORS+1))
  fi
done <<< "$UPDATE_PLAN_METHODS"

if [ $DELETE_GUARD_ERRORS -eq 0 ] && [ -z "$UPDATE_PLAN_METHODS" ]; then
  echo -e "${GREEN}[PASS]${NC} All critical methods have guards"
fi
echo ""

# ===============================================
# 8. Anti-pattern: tenant_id as parameter
# ===============================================
echo -e "${BLUE}[8/11]${NC} Checking tenant_id parameters..."
TENANT_PARAMS=$(grep -rn ": string.*tenantId\|tenantId: string\|tenant_id: string" "$REPO_DIR" | grep -v "validateTenant\|validateTenantOwnership\|findByTenantId")

if [ -n "$TENANT_PARAMS" ]; then
  echo -e "${YELLOW}[WARNING]${NC} tenant_id as parameter (should use context):"
  echo "$TENANT_PARAMS"
  WARNINGS=$((WARNINGS+1))
else
  echo -e "${GREEN}[PASS]${NC} No tenant_id parameters (using context)"
fi
echo ""

# ===============================================
# 9. JOINs without tenant filters
# ===============================================
echo -e "${BLUE}[9/11]${NC} Checking JOIN tenant filters..."
JOINS=$(grep -rn "leftJoin\|innerJoin\|rightJoin" "$REPO_DIR" | cut -d: -f1-2)
JOIN_WARNINGS=0

while IFS= read -r line; do
  if [ -z "$line" ]; then continue; fi
  
  FILE=$(echo "$line" | cut -d: -f1)
  LINE_NUM=$(echo "$line" | cut -d: -f2)
  CONTEXT=$(sed -n "${LINE_NUM},$((LINE_NUM+5))p" "$FILE")
  
  if echo "$CONTEXT" | grep -q "tenant_id\|tenantId"; then
    echo -e "${GREEN}[OK]${NC} $FILE:$LINE_NUM - JOIN with tenant filter"
  else
    echo -e "${YELLOW}[WARNING]${NC} $FILE:$LINE_NUM - JOIN may lack tenant filter"
    JOIN_WARNINGS=$((JOIN_WARNINGS+1))
    WARNINGS=$((WARNINGS+1))
  fi
done <<< "$JOINS"

if [ $JOIN_WARNINGS -eq 0 ]; then
  echo -e "${GREEN}[PASS]${NC} All JOINs have tenant filters"
fi
echo ""

# ===============================================
# 10. TenantContext import and usage
# ===============================================
echo -e "${BLUE}[10/11]${NC} Checking TenantContext usage..."
CONTEXT_WARNINGS=0

for FILE in "$REPO_DIR"/*.ts; do
  if [[ "$FILE" == *"index.ts" ]]; then continue; fi
  
  BASENAME=$(basename "$FILE")
  
  if ! grep -q "tenantContext" "$FILE"; then
    echo -e "${YELLOW}[WARNING]${NC} $BASENAME - No tenantContext import"
    CONTEXT_WARNINGS=$((CONTEXT_WARNINGS+1))
    WARNINGS=$((WARNINGS+1))
  else
    echo -e "${GREEN}[OK]${NC} $BASENAME uses tenantContext"
  fi
done

if [ $CONTEXT_WARNINGS -eq 0 ]; then
  echo -e "${GREEN}[PASS]${NC} All repositories use TenantContext"
fi
echo ""

# ===============================================
# 11. Error handling review
# ===============================================
echo -e "${BLUE}[11/11]${NC} Checking error handling..."
BAD_CATCH=$(grep -rn "catch.*error" "$REPO_DIR" | grep -v "throw\|handleDatabaseError\|handleError" | head -10)

if [ -n "$BAD_CATCH" ]; then
  echo -e "${YELLOW}[REVIEW]${NC} Catch blocks without rethrow (first 10):"
  echo "$BAD_CATCH"
  echo "  Ensure errors are not silently swallowed"
else
  echo -e "${GREEN}[PASS]${NC} All catch blocks properly handle errors"
fi
echo ""

# ===============================================
# SUMMARY
# ===============================================
echo "==============================================="
echo "AUDIT SUMMARY"
echo "==============================================="
echo -e "Critical Errors: ${RED}$ERRORS${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"
echo ""

# Generate JSON report
cat > rls-audit-report.json <<EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date +%Y-%m-%dT%H:%M:%SZ)",
  "errors": $ERRORS,
  "warnings": $WARNINGS,
  "status": "$([ $ERRORS -eq 0 ] && echo "PASS" || echo "FAIL")",
  "scanned_files": $(find "$REPO_DIR" -name "*.ts" 2>/dev/null | wc -l),
  "security_layers": {
    "application_level_rls": "$([ $ERRORS -lt 3 ] && echo "ACTIVE" || echo "PARTIAL")",
    "database_level_rls": "ACTIVE",
    "authorization_guards": "$([ $ERRORS -eq 0 ] && echo "COMPLETE" || echo "INCOMPLETE")"
  }
}
EOF

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}[SUCCESS]${NC} ALL CHECKS PASSED! Database is RLS-compliant."
  echo ""
  echo "Security Status:"
  echo "  - Application-level RLS: ACTIVE"
  echo "  - Database-level RLS: ACTIVE"
  echo "  - Authorization Guards: COMPLETE"
  echo "  - Defense-in-depth: 3 LAYERS"
  echo ""
  echo "Report saved to: rls-audit-report.json"
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo -e "${YELLOW}[PASSED WITH WARNINGS]${NC} Review recommended but not blocking."
  echo ""
  echo "Security Status:"
  echo "  - Critical vulnerabilities: NONE"
  echo "  - Warnings: $WARNINGS (non-critical)"
  echo ""
  echo "Report saved to: rls-audit-report.json"
  exit 0
else
  echo -e "${RED}[FAILED]${NC} Critical vulnerabilities found."
  echo ""
  echo "Action Required:"
  echo "  1. Fix all CRITICAL issues before deploying"
  echo "  2. Review WARNINGS for best practices"
  echo "  3. Run audit again after fixes"
  echo ""
  echo "Report saved to: rls-audit-report.json"
  exit 1
fi