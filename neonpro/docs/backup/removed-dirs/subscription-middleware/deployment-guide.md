# Production Deployment Guide

## Prerequisites

### Environment Requirements
- Node.js 18+ 
- pnpm 8+
- PostgreSQL 14+ (via Supabase)
- Redis 6+ (optional, for caching)
- Domain with SSL certificate

### Required Environment Variables
```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/neonpro
DIRECT_URL=postgresql://postgres:password@localhost:5432/neonpro

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Authentication
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_random_secret_key

# Performance & Monitoring
PERFORMANCE_MONITORING_ENABLED=true
PERFORMANCE_THRESHOLD_MS=100
CACHE_TTL_SECONDS=3600

# Security
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
RATE_LIMIT_PER_MINUTE=100
```## Deployment Steps

### 1. Database Setup
```bash
# Run migration scripts
pnpm run db:migrate

# Seed initial data
pnpm run db:seed

# Verify database schema
pnpm run db:verify
```

### 2. Build Application
```bash
# Install dependencies
pnpm install --frozen-lockfile

# Build for production
pnpm run build

# Verify build
pnpm run build:verify
```

### 3. Security Configuration
```bash
# Enable RLS policies
pnpm run db:enable-rls

# Configure CORS
pnpm run security:configure-cors

# Set up rate limiting
pnpm run security:configure-rate-limits
```

### 4. Performance Optimization
```bash
# Initialize caching
pnpm run cache:init

# Configure monitoring
pnpm run monitoring:setup

# Run performance tests
pnpm run test:performance
```