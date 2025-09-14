#!/bin/bash

# ESLint Fix Script for Phase 1
# Fixes common TypeScript and linting issues

echo "================================================"
echo "Fixing ESLint and TypeScript Errors"
echo "================================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Auto-fix what can be fixed
echo -e "${YELLOW}Running ESLint auto-fix...${NC}"
npx eslint . --fix

# Count remaining errors
ERRORS=$(npx eslint . --format json | grep -o '"errorCount":[0-9]*' | grep -o '[0-9]*' | awk '{sum+=$1} END {print sum}')
WARNINGS=$(npx eslint . --format json | grep -o '"warningCount":[0-9]*' | grep -o '[0-9]*' | awk '{sum+=$1} END {print sum}')

echo -e "${YELLOW}Remaining issues after auto-fix:${NC}"
echo "  Errors: $ERRORS"
echo "  Warnings: $WARNINGS"

if [ "$ERRORS" -gt 0 ]; then
    echo -e "\n${YELLOW}Manual fixes needed for:${NC}"
    npx eslint . --quiet | head -30
    
    echo -e "\n${YELLOW}Most common fixes needed:${NC}"
    echo "1. Replace 'any' types with proper types"
    echo "2. Remove unused imports and variables"
    echo "3. Add proper type annotations for Clerk user objects"
    echo "4. Fix unsafe assignments from API responses"
fi

echo -e "\n${GREEN}Auto-fix complete!${NC}"
echo "Run 'npm run lint' to see remaining issues"
