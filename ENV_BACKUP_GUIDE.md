# Environment Variables Backup Documentation

## Date: December 14, 2024

## Required Environment Variables

### Database Configuration
```env
# Prisma Database Connection
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA
DATABASE_URL=
```

### Authentication (Clerk)
```env
# Clerk Authentication Keys
# Get from: https://dashboard.clerk.com/
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Optional Clerk URLs (if customized)
# NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
# NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
# NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
# NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### Rate Limiting (Upstash)
```env
# Upstash Redis for Rate Limiting
# Get from: https://console.upstash.com/
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

### Environment Settings
```env
# Node Environment
NODE_ENV=development # or 'production' or 'test'

# Optional: Skip environment validation (for Docker builds)
# SKIP_ENV_VALIDATION=true
```

## Environment File Structure

1. **`.env`** - Local environment variables (gitignored)
2. **`.env.example`** - Template for environment variables (committed)
3. **`env.mjs`** - Zod schema for validation

## Backup Instructions

1. **Local Backup:**
   ```bash
   cp .env .env.backup.$(date +%Y%m%d)
   ```

2. **Secure Storage:**
   - Store production secrets in a password manager
   - Use environment variable services (Vercel, Railway, etc.)
   - Never commit actual values to Git

3. **Recovery:**
   ```bash
   cp .env.backup.YYYYMMDD .env
   ```

## Validation Schema (from env.mjs)

### Server-side variables:
- `DATABASE_URL`: Required, must be valid URL
- `NODE_ENV`: Required, enum ["development", "test", "production"]
- `CLERK_SECRET_KEY`: Required (added via Clerk)
- `UPSTASH_REDIS_REST_URL`: Required for rate limiting
- `UPSTASH_REDIS_REST_TOKEN`: Required for rate limiting

### Client-side variables:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Required for auth

## Migration Notes for Next.js 15

When updating to Next.js 15, check for:
1. Changes in environment variable handling
2. New required variables for Turbopack
3. Updates to Clerk environment variables
4. Potential changes in build-time vs runtime variables

## Testing Environment Variables

```bash
# Validate environment variables
npm run build

# Check missing variables
node -e "require('./env.mjs')"
```

## Common Issues

1. **Missing DATABASE_URL**: Prisma commands will fail
2. **Missing Clerk keys**: Authentication will not work
3. **Missing Upstash keys**: Rate limiting will fail
4. **Wrong NODE_ENV**: May affect build optimizations

## Resources

- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Clerk Environment Setup](https://clerk.com/docs/quickstarts/nextjs)
- [Prisma Connection URLs](https://www.prisma.io/docs/reference/database-reference/connection-urls)
- [Upstash Console](https://console.upstash.com/)
