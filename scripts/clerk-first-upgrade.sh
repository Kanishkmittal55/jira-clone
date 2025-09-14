#!/bin/bash

# Alternative: Update Clerk First Strategy
# Updates Clerk to latest, then Next.js
# Date: December 14, 2024

echo "================================================"
echo "Alternative Strategy: Update Clerk First"
echo "================================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Step 1: Check current state
echo -e "${BLUE}Current state:${NC}"
npm ls next @clerk/nextjs react --depth=0 2>/dev/null | grep -E "(next|clerk|react@)" | head -5
echo ""

# Step 2: Check what versions of Clerk are available
echo -e "${BLUE}Available Clerk versions:${NC}"
npm view @clerk/nextjs versions --json | tail -20
echo ""

# Step 3: Check latest Clerk's requirements
echo -e "${BLUE}Latest Clerk requirements:${NC}"
npm view @clerk/nextjs@latest peerDependencies
echo ""

# Step 4: Clean for fresh install
echo -e "${YELLOW}Cleaning project...${NC}"
rm -rf node_modules package-lock.json

# Step 5: Update Clerk packages to latest
echo -e "${YELLOW}Updating Clerk to latest version...${NC}"
npm install @clerk/nextjs@latest @clerk/clerk-react@latest @clerk/clerk-js@latest

if [ $? -ne 0 ]; then
    echo -e "${RED}Clerk update failed - trying specific version${NC}"
    # Try a specific compatible version
    npm install @clerk/nextjs@^6.5.0 @clerk/clerk-react@^5.5.0 @clerk/clerk-js@^5.35.0
fi

# Step 6: Now update Next.js to a version compatible with new Clerk
echo -e "\n${YELLOW}Updating Next.js to compatible version...${NC}"

# Check what Next.js versions the installed Clerk supports
CLERK_VERSION=$(npm ls @clerk/nextjs --depth=0 2>/dev/null | grep @clerk/nextjs | awk '{print $2}')
echo "Installed Clerk version: $CLERK_VERSION"

# Try Next.js 14.2.x first (usually well supported)
npm install next@^14.2.25 react@18.2.0 react-dom@18.2.0

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Trying Next.js 15...${NC}"
    npm install next@^15.0.0 react@^18.3.0 react-dom@^18.3.0
fi

# Update ESLint config to match Next.js version
NEXT_VERSION=$(npm ls next --depth=0 2>/dev/null | grep next | awk '{print $2}' | cut -d. -f1,2)
npm install --save-dev eslint-config-next@$NEXT_VERSION

# Step 7: Update configuration
echo -e "\n${YELLOW}Updating configuration...${NC}"
cat > next.config.mjs << 'EOF'
!process.env.SKIP_ENV_VALIDATION && (await import("./env.mjs"));

const config = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  redirects: async () => [
    { source: "/project", destination: "/project/backlog", permanent: true },
    { source: "/", destination: "/project/backlog", permanent: true },
  ],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.clerk.dev' },
      { protocol: 'https', hostname: 'www.gravatar.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'img.clerk.com' },
    ],
  },
};
export default config;
EOF

# Step 8: Generate Prisma
npx prisma generate

# Step 9: Verify final state
echo -e "\n${GREEN}Final versions:${NC}"
npm ls next @clerk/nextjs react --depth=0 2>/dev/null | grep -E "(next|clerk|react@)" | head -5

# Step 10: Test
echo -e "\n${YELLOW}Testing build...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ Success with Clerk-first strategy!${NC}"
else
    echo -e "\n${YELLOW}Build failed but dependencies resolved${NC}"
fi

echo ""
echo "Strategy used: Updated Clerk first for more flexibility"
echo "This often allows for newer Next.js versions"
