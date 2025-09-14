#!/bin/bash

# Manual package.json updater for Phase 1
# This ensures all versions are correctly set in package.json

echo "Manually updating package.json with safe versions..."

# Using npm pkg to directly set versions in package.json
npm pkg set dependencies.axios="^1.7.7"
npm pkg set dependencies.zod="^3.23.8"
npm pkg set dependencies.clsx="^2.1.1"
npm pkg set dependencies.dayjs="^1.11.13"
npm pkg set dependencies.superjson="^2.2.1"
npm pkg set dependencies."react-hook-form"="^7.53.2"
npm pkg set dependencies."react-hot-toast"="^2.4.1"
npm pkg set dependencies."@tailwindcss/forms"="^0.5.9"

# Update all Radix UI packages
npm pkg set dependencies."@radix-ui/react-accordion"="^1.2.1"
npm pkg set dependencies."@radix-ui/react-alert-dialog"="^1.1.2"
npm pkg set dependencies."@radix-ui/react-context-menu"="^2.2.2"
npm pkg set dependencies."@radix-ui/react-dialog"="^1.1.2"
npm pkg set dependencies."@radix-ui/react-dropdown-menu"="^2.1.2"
npm pkg set dependencies."@radix-ui/react-navigation-menu"="^1.2.1"
npm pkg set dependencies."@radix-ui/react-popover"="^1.1.2"
npm pkg set dependencies."@radix-ui/react-tooltip"="^1.1.3"
npm pkg set dependencies."@radix-ui/react-select"="^1.2.2"

# Update dev dependencies
npm pkg set devDependencies.autoprefixer="^10.4.20"
npm pkg set devDependencies.postcss="^8.4.47"
npm pkg set devDependencies."@types/lodash.debounce"="^4.0.9"
npm pkg set devDependencies."@types/react-beautiful-dnd"="^13.1.8"
npm pkg set devDependencies."@types/prettier"="^2.7.3"

echo "package.json updated. Now running npm install..."
npm install

echo "Done! Check the changes with: git diff package.json"
