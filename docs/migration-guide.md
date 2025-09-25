# NeonPro Build System Migration Guide

## Overview

This guide provides step-by-step instructions for migrating from the previous build system to the new unified build system for the 8-package architecture.

## Migration Timeline

### Phase 1: Preparation (Week 1)
- [ ] Review current build system
- [ ] Plan migration strategy
- [ ] Backup current configuration
- [ ] Set up new build system

### Phase 2: Core Migration (Week 2)
- [ ] Update package.json files
- [ ] Configure Turbo settings
- [ ] Update CI/CD pipeline
- [ ] Test basic functionality

### Phase 3: Advanced Features (Week 3)
- [ ] Set up development server
- [ ] Configure testing infrastructure
- [ ] Implement deployment system
- [ ] Add development tooling

### Phase 4: Validation (Week 4)
- [ ] Run comprehensive tests
- [ ] Validate deployment
- [ ] Performance testing
- [ ] Documentation update

## Prerequisites

Before starting the migration, ensure you have:

1. **Node.js 20+** installed
2. **Bun** package manager installed
3. **Git** configured
4. **Access to repository** with write permissions
5. **Backup** of current configuration

## Step 1: Backup Current Configuration

```bash
# Create backup directory
mkdir -p ./migration-backup

# Backup current configuration files
cp package.json ./migration-backup/
cp turbo.json ./migration-backup/
cp .github/workflows/ci.yml ./migration-backup/
cp -r ./scripts ./migration-backup/

# Backup build artifacts
cp -r ./dist ./migration-backup/ 2>/dev/null || true
cp -r ./node_modules ./migration-backup/ 2>/dev/null || true
```

## Step 2: Install New Build System

```bash
# Clean existing dependencies
rm -rf node_modules
rm -rf dist
rm -rf .turbo

# Install fresh dependencies
bun install

# Initialize new build system
bun run build-system health
```

## Step 3: Update Package Configuration

### Root Package.json

Replace your existing `package.json` scripts with:

```json
{
  "scripts": {
    "build": "node scripts/build-system.js build",
    "build:packages": "node scripts/build-system.js build:packages",
    "build:apps": "node scripts/build-system.js build:apps",
    "build:production": "node scripts/build-system.js build:production",
    "dev": "node scripts/dev-server.js start",
    "test": "node scripts/testing-infrastructure.js test:all",
    "test:unit": "node scripts/testing-infrastructure.js test:unit",
    "test:integration": "node scripts/testing-infrastructure.js test:integration",
    "test:e2e": "node scripts/testing-infrastructure.js test:e2e",
    "test:coverage": "node scripts/testing-infrastructure.js coverage",
    "type-check": "node scripts/build-system.js type-check",
    "lint": "node scripts/build-system.js lint",
    "lint:fix": "node scripts/build-system.js lint:fix",
    "quality": "node scripts/build-system.js quality",
    "clean": "node scripts/build-system.js clean",
    "deploy": "node scripts/deployment.js deploy",
    "deploy:staging": "node scripts/deployment.js deploy staging",
    "deploy:production": "node scripts/deployment.js deploy production",
    "analyze": "node scripts/dev-tooling.js analyze",
    "monitor": "node scripts/dev-tooling.js monitor",
    "metrics": "node scripts/dev-tooling.js metrics"
  }
}
```

### Individual Package Updates

Update each package's `package.json` to use the new build system:

```json
{
  "name": "@neonpro/types",
  "scripts": {
    "build": "turbo run build --filter=@neonpro/types",
    "dev": "turbo run dev --filter=@neonpro/types",
    "test": "turbo run test --filter=@neonpro/types",
    "type-check": "turbo run type-check --filter=@neonpro/types",
    "lint": "turbo run lint --filter=@neonpro/types",
    "clean": "turbo run clean --filter=@neonpro/types"
  }
}
```

## Step 4: Update Turbo Configuration

Replace your `turbo.json` with:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local", "tsconfig.json", "tsconfig.*.json"],
  "globalEnv": ["NODE_ENV", "VERCEL", "VERCEL_ENV", "EDGE_RUNTIME", "CI"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**", "**/.tsbuildinfo/**"],
      "cache": true,
      "persistent": false,
      "env": ["NODE_ENV", "CI"],
      "inputs": ["tsconfig*.json", "package.json", "bun.lockb"]
    },
    "build:core": {
      "dependsOn": ["@neonpro/types#build", "@neonpro/shared#build", "@neonpro/security-compliance#build", "@neonpro/database#build", "@neonpro/ai-services#build", "@neonpro/healthcare-core#build", "@neonpro/api-gateway#build", "@neonpro/ui#build"],
      "outputs": ["dist/**", "**/.tsbuildinfo/**"],
      "cache": true,
      "persistent": false
    },
    "dev": {
      "cache": false,
      "persistent": true,
      "env": ["NODE_ENV=development"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"],
      "cache": true,
      "persistent": false
    },
    "lint": {
      "outputs": [],
      "cache": true,
      "persistent": false
    },
    "type-check": {
      "dependsOn": ["^build"],
      "outputs": [],
      "cache": true,
      "persistent": false
    },
    "clean": {
      "cache": false,
      "outputs": []
    }
  }
}
```

## Step 5: Update CI/CD Pipeline

### Backup Existing CI/CD

```bash
cp .github/workflows/ci.yml .github/workflows/ci-backup.yml
```

### Add New Enhanced CI/CD

Create `.github/workflows/ci-enhanced.yml` (provided in the new build system).

### Update Environment Variables

Add these to your repository secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `VERCEL_SCOPE`
- `TURBO_TOKEN`
- `TURBO_API`

## Step 6: Migrate Development Workflow

### Old Development Commands

```bash
# Old commands
npm run dev
npm run build
npm run test
npm run lint
```

### New Development Commands

```bash
# New commands
bun run dev-server start
bun run build-system build
bun run testing-infrastructure test:all
bun run build-system lint
```

### Development Server Migration

1. **Stop existing dev server**: `Ctrl+C`
2. **Start new dev server**: `bun run dev-server start`
3. **Verify hot reloading**: Make changes to see HMR in action
4. **Check package status**: `bun run dev-server status`

## Step 7: Migrate Testing

### Test Configuration

Update your test configuration files:

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test-setup.ts']
  },
  coverage: {
    reporter: ['text', 'lcov', 'html'],
    thresholds: {
      global: 75
    }
  }
});
```

### Test Commands Migration

```bash
# Old test commands
npm run test
npm run test:watch
npm run test:coverage

# New test commands
bun run testing-infrastructure test:all
bun run testing-infrastructure test --watch
bun run testing-infrastructure coverage
```

## Step 8: Migrate Deployment

### Deployment Commands

```bash
# Old deployment
npm run deploy
npm run deploy:staging

# New deployment
bun run deployment deploy production
bun run deployment deploy staging
```

### Deployment Configuration

Update your deployment configuration:

```json
{
  "deployment": {
    "environments": {
      "development": {
        "domain": "dev.neonpro.com.br",
        "provider": "vercel"
      },
      "staging": {
        "domain": "staging.neonpro.com.br",
        "provider": "vercel"
      },
      "production": {
        "domain": "neonpro.com.br",
        "provider": "vercel"
      }
    }
  }
}
```

## Step 9: Validate Migration

### Health Check

```bash
# Run comprehensive health check
bun run build-system health

# Check all systems
bun run build-system type-check
bun run build-system lint
bun run testing-infrastructure test:all
```

### Build Validation

```bash
# Test build process
bun run build-system clean
bun run build-system build

# Test production build
bun run build-system build:production
```

### Development Validation

```bash
# Start development server
bun run dev-server start

# Test hot reloading (make changes to files)
# Check package status
bun run dev-server status
```

### Deployment Validation

```bash
# Test deployment package creation
bun run deployment package staging

# Test deployment to staging
bun run deployment deploy staging

# Verify deployment
bun run deployment health staging
```

## Step 10: Performance Testing

### Build Performance

```bash
# Measure build times
time bun run build-system build

# Analyze build performance
bun run dev-tooling analyze --performance
```

### Test Performance

```bash
# Run performance tests
bun run testing-infrastructure test:performance

# Get test metrics
bun run dev-tooling metrics
```

### Development Performance

```bash
# Start performance monitoring
bun run dev-tooling monitor

# Monitor development server performance
```

## Common Migration Issues

### Issue 1: Build Failures

**Symptoms**: Build errors, missing dependencies

**Solutions**:
```bash
# Clean and reinstall
bun run build-system clean
rm -rf node_modules
bun install

# Check health
bun run build-system health

# Update dependencies
bun run dev-tooling deps update
```

### Issue 2: Hot Reloading Not Working

**Symptoms**: Changes not reflected, server not responding

**Solutions**:
```bash
# Restart development server
bun run dev-server stop
bun run dev-server start

# Check package status
bun run dev-server status

# Verify file watching
bun run dev-server info @neonpro/web
```

### Issue 3: Test Failures

**Symptoms**: Tests not running, coverage issues

**Solutions**:
```bash
# Initialize test environment
bun run testing-infrastructure init

# Run specific tests
bun run testing-infrastructure test:unit

# Check test configuration
bun run testing-infrastructure test --verbose
```

### Issue 4: Deployment Issues

**Symptoms**: Deployment fails, health checks fail

**Solutions**:
```bash
# Check deployment status
bun run deployment status production

# Run health checks
bun run deployment health production

# Create new deployment package
bun run deployment package production
```

## Rollback Plan

If migration fails, use this rollback procedure:

```bash
# Stop all services
bun run dev-server stop
bun run build-system clean

# Restore from backup
cp ./migration-backup/package.json ./
cp ./migration-backup/turbo.json ./
cp ./migration-backup/ci.yml .github/workflows/

# Reinstall dependencies
rm -rf node_modules
npm install

# Test restoration
npm run build
npm run test
```

## Post-Migration Tasks

### 1. Update Documentation

- Update README.md with new commands
- Update contribution guidelines
- Update team documentation

### 2. Team Training

- Conduct training sessions on new build system
- Share migration guide with team
- Update onboarding documentation

### 3. Monitoring Setup

- Set up build performance monitoring
- Configure deployment alerts
- Set up quality gate notifications

### 4. Optimization

- Analyze build performance
- Optimize dependency management
- Fine-tune CI/CD pipeline

## Migration Checklist

### Pre-Migration
- [ ] Create backup of current configuration
- [ ] Review new build system documentation
- [ ] Plan migration timeline
- [ ] Inform team about migration

### Migration Steps
- [ ] Install new build system
- [ ] Update package.json files
- [ ] Update Turbo configuration
- [ ] Update CI/CD pipeline
- [ ] Migrate development workflow
- [ ] Migrate testing infrastructure
- [ ] Migrate deployment system
- [ ] Validate all functionality

### Post-Migration
- [ ] Run comprehensive tests
- [ ] Validate deployment process
- [ ] Performance testing
- [ ] Update documentation
- [ ] Team training
- [ ] Monitoring setup

### Validation Checklist
- [ ] All packages build successfully
- [ ] Development server starts correctly
- [ ] Hot reloading works
- [ ] All tests pass
- [ ] Code coverage meets requirements
- [ ] Deployment works correctly
- [ ] Performance is acceptable
- [ ] Health checks pass

## Support and Resources

### Documentation
- [Build System Guide](./build-system-guide.md)
- [Development Workflow](./development-workflow.md)
- [Deployment Guide](./deployment-guide.md)

### Tools
- Build System: `scripts/build-system.js`
- Development Server: `scripts/dev-server.js`
- Testing Infrastructure: `scripts/testing-infrastructure.js`
- Deployment System: `scripts/deployment.js`
- Development Tooling: `scripts/dev-tooling.js`

### Troubleshooting
- Check logs in `dist/` directory
- Use debug mode: `DEBUG=true bun run <command>`
- Review GitHub Actions for CI/CD issues
- Check migration logs in `migration-backup/`

## Next Steps

After successful migration:

1. **Optimize**: Fine-tune build performance
2. **Extend**: Add custom scripts and tools
3. **Monitor**: Set up ongoing monitoring
4. **Document**: Update team documentation
5. **Train**: Conduct team training sessions

This migration guide provides a comprehensive approach to migrating to the new NeonPro build system. Follow the steps carefully and validate each stage before proceeding to the next.