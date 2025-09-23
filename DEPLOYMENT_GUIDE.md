# 🚀 NEONPRO VERCEL DEPLOYMENT GUIDE

## 🔐 AUTHENTICATION SETUP (Required)

### Option 1: Interactive Login

```bash
vercel login
# Visit: https://vercel.com/oauth/device?user_code=KGVP-TNNH
# Follow browser authentication flow
```

### Option 2: Token-based Authentication

1. Create Vercel account at https://vercel.com
2. Generate API token: https://vercel.com/account/tokens
3. Set environment variable:

```bash
export VERCEL_TOKEN="your_token_here"
# Or add to .env.local:
echo "VERCEL_TOKEN=your_token_here" >> .env.local
```

## 📦 DEPLOYMENT COMMANDS

### Turbo-Optimized Deploy (Recommended for Monorepo)

```bash
pnpm dlx vercel deploy --yes --local-config vercel-turbo.json --archive=tgz
```

### Standard Deploy (Fallback)

```bash
pnpm dlx vercel deploy --yes --archive=tgz
```

### Production Deploy

```bash
pnpm dlx vercel deploy --prod --yes --local-config vercel-turbo.json --archive=tgz
```

## ⚙️ BUILD VERIFICATION

Before deployment, verify build success:

```bash
# Dry run to check dependencies
bunx turbo build --filter=@neonpro/web --dry-run

# Full build test
bunx turbo build --filter=@neonpro/web
```

## 🔧 CONFIGURATION FILES

### vercel-turbo.json (Optimized)

- Uses `bun install` (faster)
- Monorepo-optimized build command
- Minimal security headers for development

### vercel.json (Production)

- Uses `bun install --no-frozen-lockfile`
- Comprehensive security headers
- Production-ready configuration

## 📋 BUILD SEQUENCE

```
@neonpro/types#build
├── @neonpro/database#build (depends on types)
│   └── @neonpro/utils#build (depends on database + types)
│       └── @neonpro/web#build (depends on utils + ui)
└── @neonpro/ui#build (independent)
```

## 🛠️ TROUBLESHOOTING

### Authentication Issues

```bash
# Clear existing auth
vercel logout
vercel login

# Or use token
export VERCEL_TOKEN="your_token"
```

### Build Failures

```bash
# Clear build cache
bunx turbo build --filter=@neonpro/web --force

# Check dependencies
bun install
```

### Environment Variables

Required for deployment:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `NODE_ENV=production`

## 🚨 CURRENT STATUS

**DEPLOYMENT BLOCKED**: Vercel authentication required
**ACTION NEEDED**: Complete authentication using Option 1 or 2 above
**BUILD STATUS**: ✅ Verified - all dependencies resolved correctly
