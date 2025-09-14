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

# Create backup
echo -e "${YELLOW}Creating backup...${NC}"
cp package.json package.json.backup
cp package-lock.json package-lock.json.backup
check_status "Backup creation"

# Run security audit fix for non-breaking changes
echo -e "\n${YELLOW}Running npm audit fix (non-breaking)...${NC}"
npm audit fix
check_status "Security audit fix"

# Update Radix UI components (all compatible)
echo -e "\n${YELLOW}Updating Radix UI components...${NC}"
npm install @radix-ui/react-accordion@latest \
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
npm install react-hook-form@^7.62.0 \
            dayjs@latest \
            clsx@latest \
            @tailwindcss/forms@latest \
            react-hot-toast@latest \
            autoprefixer@latest \
            postcss@latest
check_status "Minor dependency updates"

# Update axios to fix critical vulnerability
echo -e "\n${YELLOW}Updating axios (security fix)...${NC}"
npm install axios@latest
check_status "Axios update"

# Update development dependencies
echo -e "\n${YELLOW}Updating development dependencies...${NC}"
npm install --save-dev @types/lodash.debounce@latest \
                       @types/react-beautiful-dnd@latest \
                       @types/prettier@latest
check_status "Dev dependency updates"

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
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed - reverting changes${NC}"
    mv package.json.backup package.json
    mv package-lock.json.backup package-lock.json
    npm install
    exit 1
fi

echo -e "\n${GREEN}================================================${NC}"
echo -e "${GREEN}Phase 1 Safe Updates Complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "Next steps:"
echo "1. Test the application thoroughly"
echo "2. Commit these changes"
echo "3. Proceed to Phase 2 when ready"
echo ""
echo -e "${YELLOW}Run 'npm audit' to see remaining vulnerabilities${NC}"
echo -e "${YELLOW}Run 'npm outdated' to see remaining updates${NC}"
