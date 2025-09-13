# NeonPro Unified Deployment Guide

## 🎯 Overview

The `deploy-unified.sh` script consolidates all deployment functionality from multiple existing scripts into a single, comprehensive solution. It follows the proven Turborepo + Bun approach documented in the Vercel deployment specification.

## 🚀 Quick Start

```bash
# Standard production deployment
./scripts/deploy-unified.sh deploy

# Preview deployment
./scripts/deploy-unified.sh deploy --preview

# Build only
./scripts/deploy-unified.sh build

# Validate deployment
./scripts/deploy-unified.sh validate
```

## 📋 Commands Reference

### Deployment Commands

#### `deploy [options]`
Deploy the application to Vercel with comprehensive validation.

**Options:**
- `--production` - Deploy to production (default)
- `--preview` - Deploy to preview environment
- `--strategy turbo|bun|npm` - Build strategy (default: auto)
- `--force` - Force deployment (bypass git checks)
- `--skip-tests` - Skip test execution
- `--skip-build-test` - Skip local build verification

**Examples:**
```bash
# Production deployment with Turborepo
./scripts/deploy-unified.sh deploy --strategy turbo

# Force preview deployment
./scripts/deploy-unified.sh deploy --preview --force

# Quick deployment without tests
./scripts/deploy-unified.sh deploy --skip-tests
```

### Build Commands

#### `build [options]`
Build the application locally for testing.

**Options:**
- `--strategy turbo|bun|npm` - Build strategy (default: auto)
- `--clean` - Clean previous build output

**Examples:**
```bash
# Build with Turborepo
./scripts/deploy-unified.sh build --strategy turbo

# Clean build with Bun
./scripts/deploy-unified.sh build --clean --strategy bun
```

### Testing Commands

#### `test [type]`
Run various types of tests and validations.

**Types:**
- `basic` - Type checking and linting (default)
- `full` - Include unit tests
- `compliance` - Include healthcare compliance checks

**Examples:**
```bash
# Basic tests
./scripts/deploy-unified.sh test

# Full test suite
./scripts/deploy-unified.sh test full

# Healthcare compliance validation
./scripts/deploy-unified.sh test compliance
```

### Validation Commands

#### `validate [options]`
Validate a deployed application.

**Options:**
- `--url URL` - URL to validate (default: production)
- `--comprehensive` - Run comprehensive validation including performance tests

**Examples:**
```bash
# Validate production deployment
./scripts/deploy-unified.sh validate

# Comprehensive validation of preview
./scripts/deploy-unified.sh validate --url https://neonpro-abc123.vercel.app --comprehensive
```

### Monitoring Commands

#### `monitor [action]`
Monitor deployment status and health.

**Actions:**
- `logs [url]` - Show deployment logs
- `health` - Check deployment health
- `metrics` - Show deployment metrics

**Examples:**
```bash
# Show recent logs
./scripts/deploy-unified.sh monitor logs

# Check deployment health
./scripts/deploy-unified.sh monitor health

# Show deployment metrics
./scripts/deploy-unified.sh monitor metrics
```

### Maintenance Commands

#### `rollback <url>`
Rollback to a previous deployment.

**Example:**
```bash
./scripts/deploy-unified.sh rollback https://neonpro-abc123.vercel.app
```

#### `config`
Verify deployment configuration.

**Example:**
```bash
./scripts/deploy-unified.sh config
```

## 🏥 Healthcare Compliance

The unified script includes comprehensive healthcare compliance checks:

### LGPD Compliance
- Validates presence of LGPD compliance markers in codebase
- Ensures data protection notices are implemented
- Checks for proper consent management

### Audit Logging
- Verifies audit logging implementation
- Validates audit trail functionality
- Ensures compliance with healthcare regulations

### Healthcare Components
- Checks for healthcare-specific components
- Validates medical data handling
- Ensures proper patient data protection

## 🔧 Build Strategies

### Turborepo (Recommended)
- **Command:** `bunx turbo build --filter=@neonpro/web`
- **Benefits:** Optimized caching, dependency-aware builds, remote caching
- **Requirements:** Bun package manager
- **Performance:** ~45 seconds average build time

### Bun Direct
- **Command:** `cd apps/web && bun install && bun run build`
- **Benefits:** Fast package installation, reliable builds
- **Requirements:** Bun package manager
- **Use Case:** Simple builds without Turborepo optimization

### npm Fallback
- **Command:** `npm install --legacy-peer-deps && npm run build`
- **Benefits:** Universal compatibility
- **Requirements:** Node.js and npm
- **Use Case:** Environments where Bun is not available

## 📊 Validation Tests

### Basic Validation
- Homepage accessibility (HTTP 200)
- Login page accessibility
- Dashboard accessibility
- API health endpoint
- Error handling (404 tests)

### Comprehensive Validation
- All basic tests
- Performance benchmarking (< 3s homepage load)
- Security headers validation
- Content validation
- API endpoint testing

## 🚨 Error Handling

The script includes comprehensive error handling:

### Pre-deployment Checks
- Node.js version validation (≥18)
- Package manager availability
- Vercel CLI authentication
- Git status validation
- Project structure verification

### Build Validation
- TypeScript compilation
- Build output verification
- Bundle size analysis
- Critical file presence

### Deployment Validation
- Post-deployment health checks
- Performance validation
- API endpoint testing
- Error response validation

## 🔄 Migration from Existing Scripts

### Replaced Scripts
The unified script replaces the following existing scripts:

1. `deploy.sh` - Healthcare-focused deployment
2. `deploy-neonpro.sh` - Quick Bun deployment
3. `deploy-neonpro-turborepo.sh` - Turborepo deployment
4. `vercel-build.sh` - Basic build
5. `vercel-build-optimized.sh` - Optimized build
6. `validate-deployment.sh` - Deployment validation
7. `smoke-test.sh` - Smoke testing
8. `simple-smoke-test.sh` - Basic smoke testing

### Migration Commands
```bash
# Old: ./scripts/deploy.sh production
# New: ./scripts/deploy-unified.sh deploy --production

# Old: ./scripts/deploy-neonpro-turborepo.sh --preview
# New: ./scripts/deploy-unified.sh deploy --preview --strategy turbo

# Old: ./scripts/validate-deployment.sh
# New: ./scripts/deploy-unified.sh validate

# Old: ./scripts/smoke-test.sh
# New: ./scripts/deploy-unified.sh validate --comprehensive
```

## 🛠️ Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check build locally
./scripts/deploy-unified.sh build --clean

# Verify configuration
./scripts/deploy-unified.sh config
```

#### Deployment Failures
```bash
# Force deployment
./scripts/deploy-unified.sh deploy --force

# Check logs
./scripts/deploy-unified.sh monitor logs
```

#### Validation Failures
```bash
# Check deployment health
./scripts/deploy-unified.sh monitor health

# Run comprehensive validation
./scripts/deploy-unified.sh validate --comprehensive
```

### Support Resources
- **Deployment Specification:** `.github/prompts/vercel-deployment.prompt.md`
- **Architecture Documentation:** `docs/architecture/`
- **Troubleshooting Guide:** `docs/troubleshooting/`

## 📈 Performance Metrics

### Expected Performance
- **Build Time:** ~45 seconds (Turborepo)
- **Deployment Time:** ~60 seconds total
- **Homepage Load:** <3 seconds
- **API Response:** <1 second
- **Success Rate:** 100% (with proper configuration)

### Monitoring
The script automatically collects and reports:
- Build duration
- Deployment duration
- Validation results
- Performance metrics
- Error rates

## 🔐 Security

### Security Checks
- Environment variable validation
- Security headers verification
- HTTPS enforcement
- CORS configuration validation

### Best Practices
- Never commit sensitive environment variables
- Use Vercel dashboard for production secrets
- Regularly rotate API keys
- Monitor deployment logs for security issues

---

**Note:** This unified script consolidates all deployment functionality while maintaining backward compatibility and following the proven Turborepo + Bun approach for optimal performance and reliability.
