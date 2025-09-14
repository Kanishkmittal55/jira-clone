#!/bin/bash

# Performance Baseline Script
# Captures current performance metrics before upgrade

echo "================================================"
echo "Performance Baseline Capture"
echo "Date: $(date)"
echo "================================================"
echo ""

OUTPUT_FILE="performance-baseline-$(date +%Y%m%d-%H%M%S).json"

# Function to time a command
time_command() {
    local start=$(date +%s%N)
    $1 > /dev/null 2>&1
    local end=$(date +%s%N)
    echo $((($end - $start) / 1000000))
}

echo "Building application..."
BUILD_START=$(date +%s)
npm run build > build.log 2>&1
BUILD_END=$(date +%s)
BUILD_TIME=$((BUILD_END - BUILD_START))

echo "Build completed in ${BUILD_TIME} seconds"

# Extract build stats
echo "Extracting build statistics..."

# Get .next directory size
NEXT_SIZE=$(du -sh .next 2>/dev/null | cut -f1)

# Count routes
API_ROUTES=$(find app/api -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l)
PAGE_ROUTES=$(find app -name "page.tsx" 2>/dev/null | wc -l)

# Get bundle stats from build log
FIRST_LOAD_JS=$(grep "First Load JS" build.log | head -1 | awk '{print $NF}')

# Create JSON output
cat > "$OUTPUT_FILE" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "build": {
    "time_seconds": $BUILD_TIME,
    "next_dir_size": "$NEXT_SIZE"
  },
  "routes": {
    "api_routes": $API_ROUTES,
    "page_routes": $PAGE_ROUTES
  },
  "bundle": {
    "first_load_js": "$FIRST_LOAD_JS"
  },
  "dependencies": {
    "total": $(npm ls --depth=0 2>/dev/null | wc -l),
    "production": $(npm ls --production --depth=0 2>/dev/null | wc -l)
  },
  "node_version": "$(node -v)",
  "npm_version": "$(npm -v)",
  "next_version": "$(npm ls next --depth=0 | grep next | awk '{print $2}')"
}
EOF

echo ""
echo "Performance baseline saved to: $OUTPUT_FILE"
echo ""
echo "Summary:"
echo "--------"
cat "$OUTPUT_FILE" | python3 -m json.tool 2>/dev/null || cat "$OUTPUT_FILE"

# Run Lighthouse if available
if command -v lighthouse &> /dev/null; then
    echo ""
    echo "Running Lighthouse audit..."
    npm run build && npm run start &
    SERVER_PID=$!
    sleep 10
    
    lighthouse http://localhost:3000 \
        --output=json \
        --output-path="./lighthouse-baseline-$(date +%Y%m%d-%H%M%S).json" \
        --chrome-flags="--headless" \
        --quiet
    
    kill $SERVER_PID
    echo "Lighthouse audit complete"
fi

echo ""
echo "================================================"
echo "Baseline capture complete!"
echo "================================================"
