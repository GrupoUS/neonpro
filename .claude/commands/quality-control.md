---
title: "NeonPro Code Quality Control"
last_updated: 2025-09-30
form: reference
tags: [quality, healthcare, bun, oxlint, lgpd, compliance]
related:
  - ../architecture/tech-stack.md
  - ../architecture/frontend-architecture.md
  - frontend-testing.md
---

# 🔍 NeonPro Code Quality Control

**Production-validated quality control using Bun-powered toolchain for healthcare platforms**

## Tech Stack (2025-09-30)

- **Package Manager**: **Bun** (3-5x faster than pnpm/npm)
- **Frontend**: React 19 + Vite + TanStack Router/Query v5 + TypeScript strict
- **Backend**: **Hono (Edge-first)** + tRPC v11 + TypeScript strict
- **Data**: **Supabase** (Postgres + Auth + Realtime + RLS) + Audit logging
- **QA & Testing**: Vitest, Playwright, OXLint, Biome, TypeScript strict
- **Quality Tools**: **OXLint** (50-100x faster), Biome (formatter), Dprint, Sentry
- **LGPD Focus**: Healthcare compliance, data protection, security validation

## Performance Optimizations

### **Bun Package Manager Integration**
- **Installation**: 50%+ faster dependency resolution
- **Script Execution**: 3-5x faster npm scripts
- **Memory Usage**: 30% lower memory footprint
- **Type Safety**: Native TypeScript integration

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
# Quick quality check (Bun-optimized)
bun quality              # Run all quality gates
bun quality:fix         # Fix auto-correctable issues

# Development with testing
bun run dev              # Start development servers (2-3x faster)
bun test:watch           # Run tests in watch mode
bun lint                 # 50-100x faster OXLint linting
bun format               # Format code (biome)

# Type checking
bun type-check          # Verify TypeScript types (native support)
```

### **CI/CD Pipeline**

```bash
# Complete validation (Bun-optimized)
bun run test             # Run all tests (3-5x faster)
bun run test:e2e        # End-to-end tests
bun run test:coverage     # Coverage report
bun quality              # Full quality check
bun lint                 # OXLint 50-100x faster validation
```

### **Performance Optimization Commands**

```bash
# Bun-specific optimizations
bun run build:deps       # Build dependencies in parallel
bun run build:core       # Core packages with concurrency
bun run build:ui         # UI components optimized build
bun run build:apps       # Applications with edge optimization

# Performance benchmarking
bun run perf:baseline    # Baseline performance measurement
bun run perf:measure     # Performance testing and analysis
```

## Error Resolution Workflow

### **Step 1: Identify Issues (Bun-Optimized)**

```bash
# Comprehensive quality check
bun quality              # All quality gates
bun lint                 # 50-100x faster OXLint issues
bun lint:security        # Security vulnerabilities
bun type-check          # Type errors (native support)
```

### **Step 2: Fix Common Issues (Bun-Optimized)**

```bash
# Auto-fix issues (3-5x faster)
bun quality:fix         # Fix linting and formatting
bun lint:fix            # Fix OXLint issues (50-100x faster)
bun format              # Format with biome

# Security fixes
bunx audit --fix         # Fix dependency vulnerabilities
```

### **Step 3: Validate Fixes (Performance Optimized)**

```bash
# Verify fixes with speed improvements
bun quality              # Re-run quality checks (instant)
bun run test             # Ensure tests pass (3-5x faster)
bun run test:e2e        # E2E validation (parallel execution)
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

### **Bun-Optimized OXLint Configuration**

```json
// .oxlintrc.json - 50-100x faster with healthcare compliance + React 19 + TypeScript 5.9+
{
  "$schema": "https://raw.githubusercontent.com/oxc-project/oxc/main/npm/oxlint/configuration_schema.json",
  "plugins": [
    "unicorn", "typescript", "react", "jsx-a11y", "import", "promise", "jsdoc", "oxc", "node",
    "healthcare" // Custom healthcare compliance plugin
  ],
  "rules": {
    // React 19 specific rules
    "react/jsx-no-useless-fragment": "warn",
    "react/no-array-index-key": "error",
    "react/no-unstable-nested-components": "warn",
    
    // TypeScript 5.9+ with strict mode
    "typescript/no-unsafe-assignment": "warn",
    "typescript/no-unsafe-call": "error",
    "typescript/no-explicit-any": "error",
    "typescript/prefer-nullish-coalescing": "warn",
    
    // Healthcare compliance rules
    "healthcare/lgpd-data-protection": "error",
    "healthcare/anvisa-validation": "error",
    "healthcare/cfm-standards": "error",
    "healthcare/secure-data-handling": "error",
    "healthcare/audit-logging": "warn",
    
    // Modern JavaScript patterns
    "unicorn/no-array-reduce": "warn",
    "unicorn/prefer-node-event-listener": "error",
    "unicorn/no-lonely-if": "warn",
    
    // Import organization
    "import/order": "error",
    "import/no-duplicates": "error",
    "import/no-self-import": "error",
    
    // Code quality
    "no-console": ["warn", { "allow": ["warn", "error", "log"] }],
    "no-debugger": "error",
    "no-alert": "error"
  },
  "settings": {
    "healthcare": {
      "lgpdCompliance": true,
      "anvisaValidation": true,
      "cfmStandards": true,
      "edgeRuntime": true,
      "supabaseIntegration": true,
      "honoIntegration": true
    },
    "typescript": {
      "target": "ES2022",
      "moduleResolution": "bundler",
      "moduleDetection": "force"
    }
  }
}
```

### **Bun Runtime Integration**
```json
// .oxlintrc.json - Bun-specific optimizations
{
  "bun": {
    "useTypeCheck": true,
    "preferNativeESM": true,
    "allowJs": true
  },
  "performance": {
    "maxTasks": 8,
    "parallel": true,
    "cache": true
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

## 🏥 LGPD Compliance Templates (Supabase + Edge-First)

### **Data Protection Templates**

```typescript
// LGPD Compliance Template for Patient Data
interface LGPDCompliantPatient {
  // Required LGPD fields
  lgpdConsent: {
    timestamp: string
    ip: string
    deviceId: string
    consentType: 'treatment'|'consent'|'access'|'processing'|'profiling'
  }
  dataSubjectRights: {
    access: boolean
    rectification: boolean
    erasure: boolean
    portability: boolean
    objection: boolean
  }
  retentionPolicy: {
    retentionPeriod: number // days
    automaticDeletion: boolean
    auditRequired: boolean
  }
  
  // Healthcare specific fields
  professionalScope: 'professional'|'coordinator'|'admin'
  clinicId: string
  medicalRecords: {
    consentRequired: boolean
    encryption: 'at-rest'|'in-transit'|'both'
    auditLogging: boolean
  }
}

// LGPD Audit Trail Template
interface LGPDAuditTrail {
  timestamp: string
  userId: string
  action: 'create'|'read'|'update'|'delete'|'export'|'view'|'process'
  dataType: 'patient'|'appointment'|'financial'|'clinical'|'consent'
  dataId?: string
  ip: string
  userAgent: string
  success: boolean
  details?: Record<string, any>
}
```

### **Security Validation Templates**

```typescript
// Healthcare Input Validation Template
import { z } from 'zod'

const healthcareInputSchema = z.object({
  // LGPD compliance
  lgpdConsentId: z.string().uuid(),
  dataSubjectId: z.string().optional(),
  
  // Healthcare validation
  professionalLicense: z.string().regex(/^[A-Z]{2,}\d+\.[A-Z]{3,6}$/),
  clinicAuthorization: z.string().boolean(),
  
  // Input sanitization
  personalData: z.string().transform(val => 
    val.replace(/[<>]/g, '').trim()
  ),
  medicalData: z.string().transform(val => 
    val.replace(/[^\w\s\.]/g, '').trim()
  ),
  
  // Brazilian healthcare specifics
  cpf: z.string().regex(/^\d{3}\.?\d{3}\.?\d{3}-\d{2}$/),
  sus: z.string().optional(),
  rg: z.string().optional(),
  procedimento: z.string().optional()
})

// Edge Runtime Security Template
const edgeSecurityConfig = {
  headers: {
    'x-lgpd-compliant': 'true',
    'x-data-residency': 'brazil-only',
    'x-healthcare-audit': 'enabled'
  },
  middleware: ['lgpd-compliance', 'healthcare-logging']
}
```

### **Testing Templates for Healthcare**

```typescript
// LGPD Compliance Test Template
export const createLGDPAuditTrail = () => ({
  timestamp: new Date().toISOString(),
  userId: 'test-user-id',
  action: 'view',
  dataType: 'patient',
  dataId: 'test-patient-id',
  ip: '127.0.0.1',
  userAgent: 'Mozilla/5.0 (compatible; Healthcare Test Suite)',
  success: true,
  details: { validation: 'passed', compliance: 'LGPD' }
})

// Healthcare Compliance Test Suite Template
describe('Healthcare Compliance Validation', () => {
  test('LGPD Data Protection', () => {
    // Test patient data protection
    expect(patientDataProtection).toBeDefined()
    expect(auditTrailCreation).toBeDefined()
    expect(dataRetentionPolicy).toBeDefined()
  })
  
  test('Professional Scope Validation', () => {
    // Test professional license validation
    expect(professionalLicenseValidation).toBeDefined()
    expect(scopeEnforcement).toBeDefined()
  })
  
  test('Brazilian Healthcare Standards', () => {
    // Test SUS/TUSS integration
    expect(susIntegration).toBeDefined()
    expect(tuscCodesValidation).toBeDefined()
    expect(invoiceGeneration).toBeDefined()
  })
})
```

### **Configuration Templates**

```yaml
# Healthcare Compliance Configuration
healthcare:
  lgpd:
    consentManagement: true
    dataRetention: true
    auditLogging: true
    encryptionRequired: true
    brazilianDataResidency: true
  
  anvisa:
    deviceTracking: true
    qualityControl: true
    regulatoryReporting: true
    auditTrailGeneration: true
    
  cfm:
    professionalValidation: true
    scopeEnforcement: true
    ethicalCompliance: true
    auditReporting: true
    
  edgeRuntime:
    securityHardening: true
    dataResidency: 'brazil-only'
    complianceLogging: true
  ```

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