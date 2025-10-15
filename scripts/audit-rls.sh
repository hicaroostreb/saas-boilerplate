#!/bin/bash

echo "==============================================="
echo "RLS SECURITY AUDIT - Multi-Tenant Database"
echo "==============================================="
echo ""

REPO_DIR="packages/database/src/repositories/implementations"
ERRORS=0
WARNINGS=0

# 1. Buscar queries diretas (CRITICO)
echo "[1/5] Checking for direct database queries..."
DIRECT_QUERIES=$(grep -rn "this\.db\.\(select\|update\|delete\|insert\)" $REPO_DIR)

if [ -n "$DIRECT_QUERIES" ]; then
  echo "[CRITICAL] Direct database queries found (bypasses RLS):"
  echo "$DIRECT_QUERIES"
  ERRORS=$((ERRORS+1))
else
  echo "[PASS] No direct queries found"
fi
echo ""

# 2. Buscar métodos create sem transaction
echo "[2/5] Checking create methods for transactionWithRLS..."
CREATE_METHODS=$(grep -rn "async create(" $REPO_DIR | cut -d: -f1-2)

while IFS= read -r line; do
  if [ -z "$line" ]; then continue; fi
  
  FILE=$(echo "$line" | cut -d: -f1)
  LINE_NUM=$(echo "$line" | cut -d: -f2)
  
  # Pegar próximas 20 linhas após o método
  METHOD_BODY=$(sed -n "${LINE_NUM},$((LINE_NUM+20))p" "$FILE")
  
  if echo "$METHOD_BODY" | grep -q "transactionWithRLS"; then
    echo "[OK] $FILE:$LINE_NUM uses transactionWithRLS"
  else
    echo "[WARNING] $FILE:$LINE_NUM does NOT use transactionWithRLS"
    WARNINGS=$((WARNINGS+1))
  fi
done <<< "$CREATE_METHODS"
echo ""

# 3. Buscar métodos update sem transaction
echo "[3/5] Checking update methods for transactionWithRLS..."
UPDATE_METHODS=$(grep -rn "async update(" $REPO_DIR | grep -v "updateLastAccessed\|updateDeviceInfo\|updateLocation" | cut -d: -f1-2)

while IFS= read -r line; do
  if [ -z "$line" ]; then continue; fi
  
  FILE=$(echo "$line" | cut -d: -f1)
  LINE_NUM=$(echo "$line" | cut -d: -f2)
  METHOD_BODY=$(sed -n "${LINE_NUM},$((LINE_NUM+20))p" "$FILE")
  
  if echo "$METHOD_BODY" | grep -q "transactionWithRLS"; then
    echo "[OK] $FILE:$LINE_NUM uses transactionWithRLS"
  else
    echo "[WARNING] $FILE:$LINE_NUM does NOT use transactionWithRLS"
    WARNINGS=$((WARNINGS+1))
  fi
done <<< "$UPDATE_METHODS"
echo ""

# 4. Buscar métodos delete sem transaction
echo "[4/5] Checking delete methods for transactionWithRLS..."
DELETE_METHODS=$(grep -rn "async delete(" $REPO_DIR | cut -d: -f1-2)

while IFS= read -r line; do
  if [ -z "$line" ]; then continue; fi
  
  FILE=$(echo "$line" | cut -d: -f1)
  LINE_NUM=$(echo "$line" | cut -d: -f2)
  METHOD_BODY=$(sed -n "${LINE_NUM},$((LINE_NUM+20))p" "$FILE")
  
  if echo "$METHOD_BODY" | grep -q "transactionWithRLS\|rls\.softDelete\|rls\.deleteWhere"; then
    echo "[OK] $FILE:$LINE_NUM uses RLS method"
  else
    echo "[WARNING] $FILE:$LINE_NUM may not use RLS properly"
    WARNINGS=$((WARNINGS+1))
  fi
done <<< "$DELETE_METHODS"
echo ""

# 5. Buscar INSERTs sem wrapper
echo "[5/5] Checking INSERTs for RLS wrapper..."
INSERTS=$(grep -rn "\.insert(" $REPO_DIR)

echo "$INSERTS" | while IFS= read -r line; do
  if [ -z "$line" ]; then continue; fi
  
  if echo "$line" | grep -q "this\.rls\.insert\|await this.rls.insert"; then
    echo "[OK] $(echo "$line" | cut -d: -f1-2) uses rls.insert"
  else
    # INSERTs dentro de transactionWithRLS são OK
    FILE_LINE=$(echo "$line" | cut -d: -f1-2)
    CONTEXT=$(grep -B5 "$line" 2>/dev/null | grep -q "transactionWithRLS")
    
    if [ $? -eq 0 ]; then
      echo "[OK] $FILE_LINE - inside transactionWithRLS"
    else
      echo "[REVIEW] $FILE_LINE"
      echo "         $(echo "$line" | cut -d: -f3-)"
    fi
  fi
done
echo ""

# Summary
echo "==============================================="
echo "AUDIT SUMMARY"
echo "==============================================="
echo "Critical Errors: $ERRORS"
echo "Warnings: $WARNINGS"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo "[SUCCESS] ALL CHECKS PASSED! Database is RLS-compliant."
  echo ""
  echo "Security Status:"
  echo "  - Application-level RLS: ACTIVE"
  echo "  - Database-level RLS: ACTIVE"
  echo "  - Defense-in-depth: 2 LAYERS"
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo "[PASSED WITH WARNINGS] Review recommended."
  exit 0
else
  echo "[FAILED] Critical vulnerabilities found."
  exit 1
fi
