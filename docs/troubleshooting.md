---
title: "Development Troubleshooting Guide"
last_updated: 2025-09-24
form: reference
tags: [troubleshooting, development, ci, automation, testing]
related:
  - ../AGENTS.md
  - ../rules/coding-standards.md
  - ../testing/coverage-policy.md
---

# Development Troubleshooting Guide — Reference

## Summary

Common development issues and solutions for the NeonPro project, including CI/CD problems, testing issues, and deployment challenges.

## CI/CD Issues

### pnpm Version Mismatch in GitHub Actions

**Problem**: Workflow fails when pnpm version is specified in both GitHub Actions and package.json

**Solution**:

```yaml
# ❌ Wrong - don't specify version in both places
- uses: pnpm/action-setup@v4
  with:
    version: 8.15.0  # Remove this

# ✅ Correct - let action read from package.json
- uses: pnpm/action-setup@v4
```

**Prevention**: Keep pnpm version pinned only in `package.json` via `packageManager` field.

### TypeScript Errors in CI

**Problem**: Local builds pass but CI fails with TypeScript errors

**Solution**:

```bash
# Check TypeScript configuration
pnpm type-check
pnpm lint

# Verify workspace dependencies
pnpm install --frozen-lockfile
```

## Component Development Issues

### Card Component Regression

**Problem**: Base UI components inherit page-specific styling

**Solution**:

- Keep base components (`ui/card.tsx`) minimal and generic
- Create animated wrappers (`molecules/card.tsx`) for enhanced features
- Use composition over modification

```typescript
// ❌ Wrong - modifying base component
export const Card = styled(BaseCard)`
  background: gradient(...);
`

// ✅ Correct - using composition
export const AnimatedCard = ({ magic, ...props }) => (
  <BaseCard>
    {magic && <MagicEffects />}
    {children}
  </BaseCard>
)
```

## Testing Issues

### Automation Tracking Gaps

**Problem**: Audit tasks closed without proper documentation

**Solution**:

1. Log every test run in Archon with run ID
2. Attach CLI output before moving to review
3. Schedule 48h follow-up for documentation updates

```bash
# Record test runs
pnpm test:healthcare -- --regression
pnpm test:healthcare -- --audit-only

# Document results in Archon with:
# - Run ID and timestamp
# - Artifact links
# - Anonymization confirmation
```

### Vitest ESM/Require Issues

**Problem**: Mixed ES modules and CommonJS causing test failures

**Solution**:

```javascript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
})
```

## Database Issues

### Migration Failures

**Problem**: Database migrations fail in production

**Solution**:

```bash
# Backup before migration
./scripts/backup-database.sh production

# Run migration with validation
bunx prisma migrate deploy --preview-feature
bunx prisma db validate

# Rollback if needed
./scripts/rollback-database.sh
```

### Query Performance Issues

**Problem**: Slow database queries affecting performance

**Solution**:

1. Use query optimization tools
2. Add appropriate indexes
3. Implement caching strategies
4. Monitor query execution plans

## Deployment Issues

### Build Failures

**Problem**: Production builds fail with out-of-memory errors

**Solution**:

```bash
# Increase Node memory limit
NODE_OPTIONS="--max-old-space-size=4096" pnpm build

# Use build optimization
pnpm build:optimized
```

### Environment Configuration

**Problem**: Environment variables not loading correctly

**Solution**:

1. Verify `.env` file structure
2. Check variable naming conventions
3. Validate environment-specific configurations

```bash
# Check environment loading
pnpm env:validate
pnpm config:check
```

## Security Issues

### LGPD Compliance Validation

**Problem**: Compliance checks failing in production

**Solution**:

```bash
# Run compliance validation
curl -f https://api.neonpro.aesthetic/api/compliance/lgpd/status

# Check audit logs
curl -s https://api.neonpro.aesthetic/api/audit/recent | jq '.events'

# Validate data protection measures
./scripts/compliance-check.sh
```

## Performance Issues

### Slow API Responses

**Problem**: API endpoints responding slowly

**Solution**:

1. Check database query performance
2. Verify caching configuration
3. Monitor memory usage
4. Review connection pooling

```bash
# Performance monitoring
curl -f https://api.neonpro.aesthetic/api/performance/metrics
./monitoring/scripts/performance-check.sh
```

## Prevention Strategies

### Code Quality

- Run pre-commit hooks
- Use TypeScript strict mode
- Implement comprehensive testing
- Follow coding standards

### Documentation

- Update documentation with code changes
- Maintain troubleshooting guides
- Document architecture decisions
- Keep API documentation current

### Monitoring

- Set up alerting for critical issues
- Monitor performance metrics
- Track error rates
- Implement health checks

## Emergency Procedures

### Production Issues

1. **Assess Impact**: Determine scope and severity
2. **Immediate Containment**: Stop the problem from spreading
3. **Communicate**: Notify stakeholders
4. **Restore Service**: Implement temporary fix
5. **Root Cause Analysis**: Investigate and document
6. **Prevention**: Update processes to prevent recurrence

### Contact Information

- **Technical Team**: `tech@neonpro.aesthetic`
- **Security Team**: `security@neonpro.aesthetic`
- **On-call Engineer**: Available 24/7

## See Also

- [Coding Standards](../rules/coding-standards.md)
- [Testing Strategy](../testing/coverage-policy.md)
- [Deployment Guide](../deployment/operations-guide.md)
- [Security Guidelines](../security/security-hardening-summary.md)
