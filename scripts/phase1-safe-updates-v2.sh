#!/bin/bash

# Next.js Upgrade Script - Phase 1 Safe Updates
# Date: December 14, 2024
# This script performs safe, non-breaking updates

echo "================================================"
echo "Next.js Upgrade - Phase 1: Safe Updates"
echo "================================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check command success
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $1 successful${NC}"
    else
        echo -e "${RED}✗ $1 failed${NC}"
        exit 1
    fi
}

# Function to check command success (warning only, don't exit)
check_status_warn() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $1 successful${NC}"
    else
        echo -e "${YELLOW}⚠ $1 completed with warnings (this is expected for some security fixes)${NC}"
    fi
}

# Create backup
echo -e "${YELLOW}Creating backup...${NC}"
cp package.json package.json.backup
cp package-lock.json package-lock.json.backup
check_status "Backup creation"

# Show current versions
echo -e "\n${YELLOW}Current key versions:${NC}"
grep -E '"(next|react|react-dom|axios|zod)"' package.json | head -5

# Run security audit fix for non-breaking changes
echo -e "\n${YELLOW}Running npm audit fix (non-breaking)...${NC}"
echo -e "${YELLOW}Note: Next.js vulnerabilities require major version upgrade (Phase 3)${NC}"
npm audit fix
check_status_warn "Security audit fix"

# Update Radix UI components (all compatible)
echo -e "\n${YELLOW}Updating Radix UI components...${NC}"
npm install --save @radix-ui/react-accordion@latest \
            @radix-ui/react-alert-dialog@latest \
            @radix-ui/react-context-menu@latest \
            @radix-ui/react-dialog@latest \
            @radix-ui/react-dropdown-menu@latest \
            @radix-ui/react-navigation-menu@latest \
            @radix-ui/react-popover@latest \
            @radix-ui/react-tooltip@latest \
            @radix-ui/react-select@^1.2.2
check_status "Radix UI updates"

# Update other safe dependencies
echo -e "\n${YELLOW}Updating safe minor version dependencies...${NC}"
npm install --save react-hook-form@^7.62.0 \
            dayjs@latest \
            clsx@^2.1.1 \
            @tailwindcss/forms@latest \
            react-hot-toast@latest
check_status "Minor dependency updates"

# Update build tools
echo -e "\n${YELLOW}Updating build tools...${NC}"
npm install --save-dev autoprefixer@latest \
            postcss@latest
check_status "Build tools update"

# Update axios to fix critical vulnerability
echo -e "\n${YELLOW}Updating axios (security fix)...${NC}"
npm install --save axios@^1.7.0
check_status "Axios update"

# Update development dependencies
echo -e "\n${YELLOW}Updating development dependencies...${NC}"
npm install --save-dev @types/lodash.debounce@latest \
                       @types/react-beautiful-dnd@latest \
                       @types/prettier@latest
check_status "Dev dependency updates"

# Update zod to fix DoS vulnerability
echo -e "\n${YELLOW}Updating zod (security fix)...${NC}"
npm install --save zod@^3.23.8
check_status "Zod update"

# Update superjson
echo -e "\n${YELLOW}Updating superjson...${NC}"
npm install --save superjson@^2.2.1
check_status "Superjson update"

# Verify package.json was updated
echo -e "\n${YELLOW}Verifying package.json updates...${NC}"
if diff -q package.json package.json.backup > /dev/null; then
    echo -e "${RED}✗ package.json was not updated!${NC}"
    echo "Forcing updates with npm update..."
    npm update
else
    echo -e "${GREEN}✓ package.json has been updated${NC}"
    echo -e "\n${GREEN}Updated versions:${NC}"
    grep -E '"(axios|zod|clsx|superjson|dayjs|react-hook-form)"' package.json | head -10
fi

# Clean install to resolve any conflicts
echo -e "\n${YELLOW}Running clean install...${NC}"
rm -rf node_modules
npm install
check_status "Clean install"

# Run type checking
echo -e "\n${YELLOW}Running type check...${NC}"
npx tsc --noEmit
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Type checking passed${NC}"
else
    echo -e "${YELLOW}⚠ Type checking has errors (review needed)${NC}"
    echo "Common issues to check:"
    echo "  - React 18 type compatibility"
    echo "  - Zod schema updates"
    echo "  - Radix UI prop changes"
fi

# Run linting
echo -e "\n${YELLOW}Running linter...${NC}"
npm run lint
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Linting passed${NC}"
else
    echo -e "${YELLOW}⚠ Linting has warnings (review needed)${NC}"
fi

# Test build
echo -e "\n${YELLOW}Testing build...${NC}"
BUILD_START=$(date +%s)
npm run build
BUILD_RESULT=$?
BUILD_END=$(date +%s)
BUILD_TIME=$((BUILD_END - BUILD_START))

if [ $BUILD_RESULT -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful (${BUILD_TIME}s)${NC}"
    
    # Show build statistics
    echo -e "\n${GREEN}Build Statistics:${NC}"
    du -sh .next 2>/dev/null | awk '{print "  Build size: " $1}'
    echo "  Node modules: $(du -sh node_modules 2>/dev/null | awk '{print $1}')"
    echo "  Build time: ${BUILD_TIME} seconds"
    
else
    echo -e "${RED}✗ Build failed - reverting changes${NC}"
    mv package.json.backup package.json
    mv package-lock.json.backup package-lock.json
    npm install
    exit 1
fi

# Show what changed
echo -e "\n${YELLOW}================================================${NC}"
echo -e "${YELLOW}Summary of Changes:${NC}"
echo -e "${YELLOW}================================================${NC}"
echo "Comparing package.json changes:"
diff -u package.json.backup package.json | grep -E "^[+-].*\"" | head -20 || echo "No significant changes shown"

# Final security audit summary
echo -e "\n${YELLOW}================================================${NC}"
echo -e "${YELLOW}Security Audit Summary:${NC}"
echo -e "${YELLOW}================================================${NC}"
npm audit --production 2>/dev/null || true

echo -e "\n${GREEN}================================================${NC}"
echo -e "${GREEN}Phase 1 Safe Updates Complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "${GREEN}✓ Updated all Radix UI components${NC}"
echo -e "${GREEN}✓ Updated axios (fixed critical vulnerability)${NC}"
echo -e "${GREEN}✓ Updated zod (fixed DoS vulnerability)${NC}"
echo -e "${GREEN}✓ Updated minor dependencies${NC}"
echo -e "${GREEN}✓ Build tested successfully (${BUILD_TIME}s)${NC}"
echo ""
echo -e "${YELLOW}⚠ Remaining issues:${NC}"
echo -e "${YELLOW}  - Next.js vulnerabilities (requires v15 upgrade - Phase 3)${NC}"
echo -e "${YELLOW}  - Check and fix any TypeScript errors${NC}"
echo ""
echo "Next steps:"
echo "1. Review the changes: git diff package.json"
echo "2. Test the application thoroughly"
echo "3. Commit: git add -A && git commit -m 'Phase 1: Safe dependency updates'"
echo "4. Push: git push origin feature/nextjs-15-update"
echo "5. Proceed to Phase 2 for pre-compatibility fixes"
echo ""
echo -e "${YELLOW}Backup files saved as package.json.backup and package-lock.json.backup${NC}"
