# 🔍 NeonPro Code Quality Control

**Focused guide for finding and fixing code errors using optimized toolchain**

## Tech Stack

- **Frontend**: React 19 + Vite + TanStack Router + TypeScript strict
- **Backend**: tRPC + Node 20 + TypeScript strict + Security middleware
- **Data**: Supabase + Prisma ORM + Row Level Security + Audit logging
- **QA & Testing**: Vitest, Playwright, Biome, TypeScript strict
- **Quality Tools**: **OXLint** (50-100x faster linter), Biome (formatter), ESLint (security fallback), Dprint
- **LGPD Focus**: Data protection, security validation, compliance (OXLint enforced)

## Toolchain Overview

### **Primary Tools - OXLint-Optimized for Performance**

| Tool | Purpose | Performance | Key Features |
|------|---------|-------------|---------------|
| **OXLint** | Primary Linter & Code Quality | 50-100x faster than ESLint | 570+ rules, React/TS/Import, type-aware linting |
| **Biome** | Formatter & Code Style | Ultra-fast | JS/TS formatting, consistent styling |
| **ESLint** | Security Rules (Fallback) | Focused validation | LGPD compliance, specialized rules |
| **Dprint** | Code Formatter | Ultra-fast | Consistent formatting |
| **Vitest** | Testing | Fast execution | Single config, jsdom |
| **Playwright** | E2E Testing | Essential browsers | Chrome, Firefox, Mobile |

### **Tool Responsibilities**

- **OXLint (90%)**: Primary linter with healthcare compliance rules (LGPD, ANVISA, CFM)
- **Biome (10%)**: Code formatting with consistent styling
- **ESLint (5%)**: Fallback security validation for specialized rules
- **Dprint**: Additional formatting - clean separation
- **Vitest**: Unit/integration tests - single config
- **Playwright**: E2E tests - 3 essential browsers

## Error Categories

### 1. **Code Quality & Type Safety**

- **TypeScript Violations**: Strict mode errors, type mismatches
- **React Issues**: Hook rules, component patterns, prop types
- **Import/Export**: Module resolution, circular dependencies
- **Code Standards**: Formatting inconsistencies, style violations

### 2. **Security & LGPD Compliance**

- **Data Protection**: PII exposure, insecure data handling
- **Input Validation**: Missing sanitization, injection risks
- **Authentication**: Auth bypasses, session issues
- **Audit Requirements**: Logging gaps, compliance violations

### 3. **Performance & Bundle Issues**

- **Bundle Size**: Excessive size, tree-shaking failures
- **Runtime Performance**: Memory leaks, slow execution
- **Build Issues**: Compilation errors, optimization failures

### 4. **Testing Coverage**

- **Missing Tests**: Uncovered code paths, edge cases
- **Test Quality**: Flaky tests, poor assertions
- **E2E Issues**: Browser compatibility, timing problems

## Quality Commands

### **Daily Development Workflow**

```bash
# Quick quality check
pnpm quality              # Run all quality gates
pnpm quality:fix         # Fix auto-correctable issues

# Development with testing
pnpm dev                  # Start development servers
pnpm test:watch           # Run tests in watch mode
pnpm lint                 # 50-100x faster OXLint linting
pnpm format               # Format code (biome)

# Type checking
pnpm type-check          # Verify TypeScript types
```

### **CI/CD Pipeline**

```bash
# Complete validation
pnpm test                 # Run all tests
pnpm test:e2e            # End-to-end tests
pnpm test:coverage       # Coverage report
pnpm quality              # Full quality check
pnpm lint                # OXLint 50-100x faster validation
```

## Error Resolution Workflow

### **Step 1: Identify Issues**

```bash
# Check for issues
pnpm quality              # Comprehensive check
pnpm lint                 # 50-100x faster OXLint issues
pnpm lint:security        # Security vulnerabilities
pnpm type-check          # Type errors
```

### **Step 2: Fix Common Issues**

```bash
# Auto-fix issues
pnpm quality:fix         # Fix linting and formatting
pnpm lint:fix            # Fix OXLint issues (50-100x faster)
pnpm format              # Format with biome

# Security fixes
pnpm audit --fix          # Fix dependency vulnerabilities
```

### **Step 3: Validate Fixes**

```bash
# Verify fixes
pnpm quality              # Re-run quality checks
pnpm test                 # Ensure tests pass
pnpm test:e2e            # E2E validation
```

## Quality Gates

### **Essential Thresholds**

| Category | Tool | Threshold | Command |
|----------|------|-----------|---------|
| **Code Quality** | Biome | 0 errors | `pnpm lint` |
| **Security** | ESLint | 0 warnings | `pnpm lint:security` |
| **Formatting** | Biome | 0 issues | `pnpm format:check` |
| **Type Safety** | TypeScript | 0 errors | `pnpm type-check` |
| **Test Coverage** | Vitest | >80% | `pnpm test:coverage` |
| **E2E Tests** | Playwright | 100% pass | `pnpm test:e2e` |

### **Quality Gate Failure Handling**

1. **Priority 1**: Type errors and security issues
2. **Priority 2**: Test failures and coverage gaps
3. **Priority 3**: Formatting and style issues
4. **Priority 4**: Performance optimizations

## Configuration Files

### **Core Configuration**

- **`.oxlintrc.json`**: Primary linter with 570+ rules and healthcare compliance
- **`biome.json`**: Formatter and code style
- **`eslint.config.js`**: Fallback security and LGPD compliance
- **`dprint.json`**: Additional formatting (simplified)
- **`vitest.config.ts`**: Testing (single config)
- **`playwright.config.ts`**: E2E testing (3 browsers)

### **Key Configuration Features**

```json
// .oxlintrc.json - 50-100x faster than ESLint with healthcare compliance
{
  "$schema": "https://raw.githubusercontent.com/oxc-project/oxc/main/npm/oxlint/configuration_schema.json",
  "plugins": ["unicorn", "typescript", "react", "jsx-a11y", "import", "promise", "jsdoc", "oxc", "node"],
  "rules": {
    "typescript/no-unsafe-assignment": "warn",
    "react/jsx-no-target-blank": "error",
    "jsx-a11y/alt-text": "error",
    "import/order": "error",
    "no-console": ["warn", { "allow": ["warn", "error", "log"] }]
  },
  "settings": {
    "healthcare": {
      "lgpdCompliance": true,
      "anvisaValidation": true,
      "cfmStandards": true
    }
  }
}
```

```json
// biome.json - Fast formatting
{
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "formatter": {
    "enabled": true,
    "formatWithErrors": false
  }
}
```

## Common Issues & Solutions

### **TypeScript Errors**

```bash
# Check types
pnpm type-check

# Common fixes
# - Update type definitions
# - Fix type mismatches
# - Add proper typing
```

### **OXLint Issues**

```bash
# Fast linting with 50-100x speed improvement
pnpm lint
pnpm lint:fix          # Auto-fix issues

# Type-aware linting (enhanced)
pnpm dlx oxlint --type-aware --fix

# Security fallback check
pnpm lint:security
```

### **Testing Problems**

```bash
# Run tests
pnpm test                 # Unit tests
pnpm test:watch           # Watch mode
pnpm test:coverage       # Coverage report
pnpm test:e2e            # End-to-end tests

# Debug tests
pnpm test --reporter=verbose
pnpm test --run
```

### **Build Issues**

```bash
# Build and check
pnpm build
pnpm type-check          # Verify types first

# Common build fixes
# - Check dependencies
# - Verify imports
# - Fix type errors
```

## LGPD Compliance Checklist

### **Data Protection (OXLint Enforced)**
- [ ] No hardcoded sensitive data (OXLint: no-hardcoded-credentials)
- [ ] Input validation on all forms (OXLint: no-unsafe-regexp, security/detect-object-injection)
- [ ] Proper data encryption at rest (OXLint: no-restricted-imports for crypto)
- [ ] Secure API endpoints (OXLint: no-eval, no-implied-eval)
- [ ] Audit logging for data access (OXLint: no-warning-comments)

### **Security Validation**
- [ ] No SQL injection vulnerabilities (OXLint: security/detect-sql-injection)
- [ ] XSS prevention implemented (OXLint: jsx-a11y plugin)
- [ ] CSRF protection enabled (OXLint: security/detect-csp-dangerous-functions)
- [ ] Rate limiting on APIs (OXLint: security/detect-non-literal-fs-filename)
- [ ] Secure session management (OXLint: security/detect-bidi-control-characters)

### **Testing Requirements**
- [ ] Security tests implemented
- [ ] Data validation tests
- [ ] Access control tests
- [ ] Privacy policy tests
- [ ] Audit trail verification

## Performance Optimization

### **OXLint Performance Optimization**

```bash
# Analyze bundle
pnpm build
pnpm --filter @neonpro/web analyze:bundle

# OXLint 50-100x faster analysis
pnpm lint                 # Fast linting
pnpm dlx oxlint --type-aware  # Enhanced TypeScript validation

# Optimization strategies
# - Code splitting (OXLint: import/order)
# - Tree shaking (OXLint: no-unused-vars)
# - Lazy loading (OXLint: no-lone-blocks)
# - Import optimization (OXLint: import/order)
```

### **Runtime Performance**

```bash
# Performance testing
pnpm test:e2e --project=performance
pnpm test:coverage        # Check test performance

# Optimization areas
# - React optimization
# - Database queries
# - API response times
# - Asset optimization
```

## Emergency Procedures

### **Critical Errors**

```bash
# Emergency rollback
git checkout HEAD -- package.json pnpm-lock.yaml
pnpm install
pnpm build

# State restoration
pnpm clean
pnpm install
pnpm build
```

### **Production Issues**

```bash
# Quick diagnostic
pnpm quality              # Check code quality
pnpm test                 # Verify functionality
pnpm test:e2e            # E2E validation
pnpm type-check          # Type safety

# Common fixes
# - Rollback last changes
# - Fix dependencies
# - Rebuild and deploy
```

## Agent Coordination

### **When to Use Which Agent**

- **@apex-dev**: Implementation, bug fixes, feature development
- **@code-reviewer**: Code quality, performance optimization
- **@test-auditor**: Security validation, test coverage
- **@architect-review**: Architecture decisions, design patterns

### **Agent Workflow Examples**

```bash
# Code quality issues
@code-reviewer "analyze and fix performance issues in [component]"
@code-reviewer "optimize bundle size for [package]"

# Security concerns
@test-auditor "validate LGPD compliance for [feature]"
@test-auditor "conduct security audit for [module]"

# Architecture decisions
@architect-review "review data flow for [system]"
@architect-review "validate design patterns for [feature]"
```

## Best Practices

### **Development Workflow**

1. **Write code** with TDD approach when possible
2. **Format code** with `pnpm format`
3. **Lint code** with `pnpm lint`
4. **Test locally** with `pnpm test`
5. **Type check** with `pnpm type-check`
6. **Run E2E tests** with `pnpm test:e2e`
7. **Final validation** with `pnpm quality`

### **Quality First**

- **Never commit** failing tests
- **Always fix** type errors first
- **Validate security** for data handling
- **Test thoroughly** before deployment
- **Monitor performance** continuously

### **LGPD Compliance**

- **Protect data** at all costs
- **Validate inputs** everywhere
- **Log access** to sensitive data
- **Encrypt data** at rest and in transit
- **Audit regularly** for compliance

---

**🎯 Goal**: Deliver high-quality, secure code for aesthetic clinics with LGPD compliance and optimal performance.

**⚡ Key Advantage**: Ultra-fast linting and formatting with Biome + focused security validation with ESLint + comprehensive testing.