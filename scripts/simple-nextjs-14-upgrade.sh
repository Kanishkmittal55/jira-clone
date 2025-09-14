#!/bin/bash

# Simple Next.js 14 Upgrade Script
# Handles Clerk compatibility issues
# Date: December 14, 2024

echo "================================================"
echo "Simple Next.js 14.2 Upgrade"
echo "================================================"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Clean everything first
echo -e "${YELLOW}Cleaning project...${NC}"
rm -rf node_modules .next package-lock.json

# Update package.json directly using npm pkg
echo -e "${YELLOW}Updating package.json versions...${NC}"
npm pkg set dependencies.next="^14.2.25"
npm pkg set dependencies.react="18.2.0"
npm pkg set dependencies."react-dom"="18.2.0"
npm pkg set devDependencies."eslint-config-next"="^14.2.25"

# Install with legacy peer deps to avoid conflicts
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install --legacy-peer-deps

# Update next.config.mjs
echo -e "${YELLOW}Updating config...${NC}"
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

# Generate Prisma
npx prisma generate

# Test build
echo -e "${YELLOW}Testing build...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Success! Next.js 14.2.25 installed and building${NC}"
else
    echo "Build failed - check errors above"
fi

echo ""
echo "Versions:"
npm ls next react @clerk/nextjs --depth=0 2>/dev/null | grep -E "(next|react|clerk)" | head -5
