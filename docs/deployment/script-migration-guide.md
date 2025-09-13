# NeonPro Deployment Scripts Migration Guide

## 🎯 Overview

This guide helps migrate from the existing multiple deployment scripts to the new unified `deploy-unified.sh` script that consolidates all deployment functionality.

## 📋 Script Consolidation Summary

### Scripts Being Replaced

| Old Script | Functionality | New Command |
|------------|---------------|-------------|
| `deploy.sh` | Healthcare-focused deployment | `deploy-unified.sh deploy` |
| `deploy-neonpro.sh` | Quick Bun deployment | `deploy-unified.sh deploy --strategy bun` |
| `neonpro-deploy.sh` | Unified orchestrator | `deploy-unified.sh` (enhanced) |
| `deploy-neonpro-turborepo.sh` | Turborepo deployment | `deploy-unified.sh deploy --strategy turbo` |
| `vercel-build.sh` | Basic build | `deploy-unified.sh build` |
| `vercel-build-optimized.sh` | Optimized build | `deploy-unified.sh build --clean` |
| `validate-deployment.sh` | Deployment validation | `deploy-unified.sh validate` |
| `deploy-api-separate.sh` | API deployment | *Maintained separately* |
| `smoke-test.sh` | Advanced smoke testing | `deploy-unified.sh validate --comprehensive` |
| `simple-smoke-test.sh` | Basic smoke testing | `deploy-unified.sh validate` |
| `verify-deployment-config.js` | Config verification | `deploy-unified.sh config` |

## 🔄 Command Migration Map

### Production Deployments

```bash
# OLD COMMANDS
./scripts/deploy.sh production
./scripts/deploy-neonpro.sh
./scripts/deploy-neonpro-turborepo.sh --production
./scripts/neonpro-deploy.sh deploy --production --strategy turbo

# NEW UNIFIED COMMAND
./scripts/deploy-unified.sh deploy --production --strategy turbo
```

### Preview Deployments

```bash
# OLD COMMANDS
./scripts/deploy.sh preview
./scripts/deploy-neonpro.sh --preview
./scripts/deploy-neonpro-turborepo.sh --preview
./scripts/neonpro-deploy.sh deploy --preview

# NEW UNIFIED COMMAND
./scripts/deploy-unified.sh deploy --preview
```

### Build Operations

```bash
# OLD COMMANDS
./scripts/vercel-build.sh
./scripts/vercel-build-optimized.sh
./scripts/neonpro-deploy.sh build --mode turbo

# NEW UNIFIED COMMANDS
./scripts/deploy-unified.sh build
./scripts/deploy-unified.sh build --strategy turbo --clean
```

### Testing and Validation

```bash
# OLD COMMANDS
./scripts/validate-deployment.sh
./scripts/smoke-test.sh https://neonpro.vercel.app
./scripts/simple-smoke-test.sh
node scripts/verify-deployment-config.js

# NEW UNIFIED COMMANDS
./scripts/deploy-unified.sh validate
./scripts/deploy-unified.sh validate --comprehensive
./scripts/deploy-unified.sh test compliance
./scripts/deploy-unified.sh config
```

### Monitoring and Logs

```bash
# OLD COMMANDS
./scripts/neonpro-deploy.sh logs <url> --follow
npx vercel logs --follow

# NEW UNIFIED COMMANDS
./scripts/deploy-unified.sh monitor logs
./scripts/deploy-unified.sh monitor health
./scripts/deploy-unified.sh monitor metrics
```

## 🏥 Healthcare Compliance Migration

The unified script maintains all healthcare compliance features from `deploy.sh`:

### LGPD Compliance Checks
```bash
# OLD: Built into deploy.sh
./scripts/deploy.sh production

# NEW: Available as separate test or during deployment
./scripts/deploy-unified.sh test compliance
./scripts/deploy-unified.sh deploy  # Includes compliance checks
```

### Audit Logging Validation
```bash
# OLD: Part of deploy.sh healthcare checks
# NEW: Integrated into compliance testing
./scripts/deploy-unified.sh test compliance
```

## 🚀 Enhanced Features

The unified script provides several enhancements over the existing scripts:

### 1. Intelligent Build Strategy Selection
```bash
# Automatically selects best available strategy
./scripts/deploy-unified.sh deploy

# Explicit strategy selection
./scripts/deploy-unified.sh deploy --strategy turbo
./scripts/deploy-unified.sh deploy --strategy bun
./scripts/deploy-unified.sh deploy --strategy npm
```

### 2. Comprehensive Error Handling
- Advanced error detection and reporting
- Automatic retry mechanisms
- Detailed error logging
- Recovery suggestions

### 3. Performance Monitoring
- Build time tracking
- Deployment duration monitoring
- Performance benchmarking
- Success rate reporting

### 4. Modular Testing
```bash
# Basic tests (type checking, linting)
./scripts/deploy-unified.sh test basic

# Full test suite (includes unit tests)
./scripts/deploy-unified.sh test full

# Healthcare compliance validation
./scripts/deploy-unified.sh test compliance
```

## 📦 Preserved Functionality

### All Original Features Maintained
- ✅ Bun package manager support
- ✅ Turborepo optimization
- ✅ npm fallback support
- ✅ Healthcare compliance checks
- ✅ LGPD validation
- ✅ Audit logging verification
- ✅ Performance benchmarking
- ✅ Security headers validation
- ✅ Rollback capabilities
- ✅ Environment variable validation

### Enhanced Capabilities
- ✅ Unified command interface
- ✅ Better error handling
- ✅ Comprehensive logging
- ✅ Modular testing options
- ✅ Configuration verification
- ✅ Health monitoring
- ✅ Performance tracking

## 🔧 Migration Steps

### Step 1: Test the Unified Script
```bash
# Test build functionality
./scripts/deploy-unified.sh build --strategy turbo

# Test validation
./scripts/deploy-unified.sh validate

# Test configuration
./scripts/deploy-unified.sh config
```

### Step 2: Update CI/CD Pipelines
Replace old script calls in your CI/CD configurations:

```yaml
# OLD GitHub Actions step
- name: Deploy to Vercel
  run: ./scripts/deploy-neonpro-turborepo.sh --production

# NEW GitHub Actions step
- name: Deploy to Vercel
  run: ./scripts/deploy-unified.sh deploy --production --strategy turbo
```

### Step 3: Update Documentation
Update any documentation that references the old scripts:

- README.md deployment instructions
- Developer onboarding guides
- Deployment runbooks
- Troubleshooting guides

### Step 4: Team Training
Ensure team members are familiar with the new commands:

```bash
# Show help
./scripts/deploy-unified.sh help

# Common workflows
./scripts/deploy-unified.sh deploy --preview
./scripts/deploy-unified.sh validate --comprehensive
./scripts/deploy-unified.sh monitor health
```

## 🗂️ Script Cleanup

After successful migration, consider archiving old scripts:

### Scripts to Archive
```bash
# Create archive directory
mkdir -p scripts/archive/

# Move old scripts
mv scripts/deploy.sh scripts/archive/
mv scripts/deploy-neonpro.sh scripts/archive/
mv scripts/deploy-neonpro-turborepo.sh scripts/archive/
mv scripts/vercel-build.sh scripts/archive/
mv scripts/vercel-build-optimized.sh scripts/archive/
mv scripts/validate-deployment.sh scripts/archive/
mv scripts/smoke-test.sh scripts/archive/
mv scripts/simple-smoke-test.sh scripts/archive/

# Keep these scripts (still needed)
# - deploy-api-separate.sh (API deployment)
# - verify-deployment-config.js (Node.js config verification)
```

### Update .gitignore
```bash
# Add to .gitignore if archiving
scripts/archive/
```

## 🚨 Rollback Plan

If issues arise with the unified script:

### Immediate Rollback
```bash
# Restore from archive
cp scripts/archive/deploy-neonpro-turborepo.sh scripts/

# Use original script
./scripts/deploy-neonpro-turborepo.sh --production
```

### Gradual Migration
```bash
# Use both scripts during transition
./scripts/deploy-unified.sh deploy --preview  # Test with preview
./scripts/deploy-neonpro-turborepo.sh --production  # Keep production stable
```

## 📊 Validation Checklist

Before completing migration, verify:

- [ ] All deployment scenarios work with unified script
- [ ] Healthcare compliance checks function correctly
- [ ] Performance metrics are collected
- [ ] Error handling works as expected
- [ ] Team members are trained on new commands
- [ ] CI/CD pipelines are updated
- [ ] Documentation is updated
- [ ] Rollback plan is tested

## 🔗 Related Documentation

- [Unified Deployment Guide](./unified-deployment-guide.md)
- [Vercel Deployment Specification](../../.github/prompts/vercel-deployment.prompt.md)
- [Architecture Documentation](../architecture/)
- [Troubleshooting Guide](../troubleshooting/)

---

**Note:** The unified script is designed to be a drop-in replacement that maintains all existing functionality while providing enhanced capabilities and better maintainability.
