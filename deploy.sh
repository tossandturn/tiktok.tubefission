#!/bin/bash

# TikTok Intelligence Deployment Script
# Usage: ./deploy.sh [production|preview]

set -e

ENVIRONMENT=${1:-preview}
echo "🚀 Starting deployment to $ENVIRONMENT..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}Error: Vercel CLI is not installed${NC}"
    echo "Install it with: npm i -g vercel"
    exit 1
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}Please login to Vercel first...${NC}"
    vercel login
fi

# Check environment variables
echo "🔍 Checking environment variables..."
required_vars=(
    "DATABASE_URL"
    "APIFY_API_TOKEN"
    "NEXTAUTH_SECRET"
    "NEXTAUTH_URL"
    "GOOGLE_CLIENT_ID"
    "GOOGLE_CLIENT_SECRET"
    "CRON_SECRET_KEY"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}Warning: $var is not set${NC}"
    fi
done

# Run type check
echo "🔍 Running type check..."
npm run type-check || {
    echo -e "${RED}Type check failed${NC}"
    exit 1
}

# Run lint
echo "🔍 Running linter..."
npm run lint || {
    echo -e "${YELLOW}Lint warnings found${NC}"
}

# Build the project
echo "🔨 Building project..."
npm run build || {
    echo -e "${RED}Build failed${NC}"
    exit 1
}

echo -e "${GREEN}✅ Build successful!${NC}"

# Deploy to Vercel
if [ "$ENVIRONMENT" == "production" ]; then
    echo "🚀 Deploying to production..."
    vercel --prod --confirm
else
    echo "🚀 Deploying to preview..."
    vercel --confirm
fi

# Run database migrations if deploying to production
if [ "$ENVIRONMENT" == "production" ]; then
    echo "🔄 Running database migrations..."
    npx prisma migrate deploy || {
        echo -e "${YELLOW}Migration warnings (may be already up to date)${NC}"
    }
fi

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Check the deployment URL above"
echo "2. Verify all pages load correctly"
echo "3. Run smoke tests: npm run test:e2e"
echo "4. Monitor error logs: vercel logs --tail"
