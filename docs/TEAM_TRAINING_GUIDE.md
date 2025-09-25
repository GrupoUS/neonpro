# NeonPro Package Consolidation - Team Training Guide

**Version**: 1.0  
**Last Updated**: September 25, 2025  
**Audience**: Development Team  

## 🎯 Overview

This guide provides comprehensive training for the NeonPro package consolidation project. The project successfully consolidated 23 packages into a more efficient, maintainable architecture with **10 core packages** now production-ready.

## 📦 New Package Architecture

### Core Production Packages (Ready Now)

| Package | Purpose | Key Features | Usage |
|---------|---------|-------------|-------|
| `@neonpro/types` | Type definitions | Healthcare schemas, validation, Brazilian types | `import { PatientSchema } from '@neonpro/types'` |
| `@neonpro/shared` | Shared utilities | Logging, telemetry, session management | `import { healthcareLogger } from '@neonpro/shared'` |
| `@neonpro/config` | Configuration | AI providers, subscription plans, feature flags | `import { aiConfig } from '@neonpro/config'` |
| `@neonpro/utils` | Utility functions | Brazilian helpers, PII redaction, formatting | `import { formatCPF } from '@neonpro/utils'` |
| `@neonpro/validators` | Validation schemas | Valibot + Zod schemas for healthcare data | `import { patientValidator } from '@neonpro/validators'` |
| `@neonpro/domain` | Domain logic | Business rules, entities, domain services | `import { Patient } from '@neonpro/domain'` |
| `@neonpro/ai-providers` | AI integrations | OpenAI, Anthropic, Google AI providers | `import { aiProvider } from '@neonpro/ai-providers'` |
| `@neonpro/monitoring` | Monitoring | Telemetry, metrics, health checks | `import { telemetry } from '@neonpro/monitoring'` |
| `@neonpro/governance` | Governance | Compliance, audit trails, policies | `import { complianceChecker } from '@neonpro/governance'` |
| `@neonpro/cli-helpers` | CLI tools | Command-line utilities and helpers | `import { cliHelper } from '@neonpro/cli-helpers'` |

## 🚀 Quick Start Guide

### 1. Installation

```bash
# Install core packages
bun add @neonpro/types @neonpro/shared @neonpro/config @neonpro/utils

# Install validation and domain packages
bun add @neonpro/validators @neonpro/domain

# Install AI and monitoring packages
bun add @neonpro/ai-providers @neonpro/monitoring
```

### 2. Basic Usage

#### Types Package
```typescript
import { 
  PatientSchema, 
  AppointmentStatus,
  BrazilianPhoneSchema 
} from '@neonpro/types'

// Use Valibot schemas
const patientData = {
  name: "João Silva",
  phone: "+55 11 99999-9999",
  email: "joao@exemplo.com"
}

const result = PatientSchema(patientData)
if (result.success) {
  console.log("Valid patient data:", result.data)
}
```

#### Shared Package
```typescript
import { healthcareLogger } from '@neonpro/shared'

// Log with automatic PII redaction
healthcareLogger.info('Patient appointment scheduled', {
  patientId: '12345',
  appointmentTime: '2025-09-25T10:00:00Z'
  // PII data will be automatically redacted
})
```

#### Config Package
```typescript
import { aiConfig, getPreferredModel } from '@neonpro/config'

// Access AI configuration
const model = getPreferredModel('text-generation')
console.log('Using model:', model)

// Check feature access
if (aiConfig.features.advancedAi) {
  // Use advanced AI features
}
```

## 🔧 Development Workflow

### 1. Package Development

```bash
# Work on a specific package
cd packages/types

# Run development mode
bun run dev

# Build the package
bun run build

# Run tests
bun run test
```

### 2. Building Dependencies

```bash
# Build all core packages
bun run build:packages

# Build specific package
bun run build:types

# Build with dependencies
bun run build:core
```

### 3. Testing Integration

```bash
# Test package integration
bun run test:integration

# Test in API application
cd apps/api
bun run dev

# Test in Web application
cd apps/web
bun run dev
```

## 🏗️ Architecture Patterns

### 1. Package Dependencies

```
@neonpro/types (foundation)
├── @neonpro/utils
├── @neonpro/validators
├── @neonpro/config
└── @neonpro/domain

@neonpro/shared
├── @neonpro/types
├── @neonpro/utils
└── @neonpro/config

@neonpro/ai-providers
├── @neonpro/types
└── @neonpro/config

@neonpro/monitoring
├── @neonpro/types
└── @neonpro/shared

@neonpro/governance
├── @neonpro/types
└── @neonpro/shared
```

### 2. Import Patterns

```typescript
// Good: Specific imports
import { PatientSchema } from '@neonpro/types'
import { healthcareLogger } from '@neonpro/shared/services/structured-logging'

// Good: Subpath imports
import { brazilianValidators } from '@neonpro/validators/brazilian'

// Avoid: Star imports
// import * as Types from '@neonpro/types'
```

## 🔒 Security & Compliance

### 1. Data Protection

```typescript
import { piiRedactor } from '@neonpro/utils'

// Automatic PII redaction in logs
const safeLog = piiRedactor.redact({
  patientName: "Maria Santos",
  cpf: "123.456.789-00",
  phone: "+55 11 99999-9999"
})
// Output: { patientName: "[REDACTED]", cpf: "[REDACTED]", phone: "[REDACTED]" }
```

### 2. Healthcare Compliance

```typescript
import { 
  lgpdValidator, 
  cfmComplianceChecker 
} from '@neonpro/governance'

// Validate LGPD compliance
const lgpdResult = lgpdValidator.validate(patientData)

// Check CFM compliance
const cfmResult = cfmComplianceChecker.checkProcedure(procedureData)
```

## 🚀 Deployment Process

### 1. Package Publishing

```bash
# Validate packages before deployment
./scripts/deploy-core-packages.sh validate

# Deploy to staging
./scripts/deploy-core-packages.sh deploy staging

# Deploy to production (requires approval)
./scripts/deploy-core-packages.sh deploy production
```

### 2. CI/CD Pipeline

The GitHub Actions workflow automatically:
- Validates package structure
- Builds all packages
- Runs security audits
- Tests integration
- Deploys to staging on push
- Deploys to production on manual approval

## 🛠️ Common Tasks

### 1. Adding New Types

```typescript
// packages/types/src/new-entity.ts
export interface NewEntity {
  id: string
  name: string
  // ... other properties
}

// packages/types/src/index.ts
export * from './new-entity'
```

### 2. Adding Shared Utilities

```typescript
// packages/shared/src/utils/new-utility.ts
export const newUtility = (input: string) => {
  // Utility implementation
  return processedResult
}

// packages/shared/src/index.ts
export * from './utils/new-utility'
```

### 3. Updating Configuration

```typescript
// packages/config/src/new-config.ts
export const NEW_CONFIG = {
  enabled: process.env.NEW_FEATURE_ENABLED === 'true',
  // ... other config
}

// packages/config/src/index.ts
export { NEW_CONFIG } from './new-config'
```

## 🔍 Troubleshooting

### 1. Build Issues

```bash
# Clean all packages
bun run clean

# Rebuild from scratch
bun run build:packages

# Check TypeScript errors
bun run type-check:packages
```

### 2. Import Issues

```bash
# Check package exports
cd packages/types
node -e "console.log(Object.keys(require('./package.json').exports))"

# Test package resolution
cd apps/api
node -e "console.log(require.resolve('@neonpro/types'))"
```

### 3. Security Issues

```bash
# Run security audit
npm audit

# Check specific package
cd packages/shared
npm audit
```

## 📚 Additional Resources

### Documentation
- [Production Deployment Readiness Report](../PRODUCTION_DEPLOYMENT_READINESS_REPORT.md)
- [Package API Reference](./packages/API_REFERENCE.md)
- [Architecture Documentation](./architecture/)

### Tools & Scripts
- [Deployment Script](../scripts/deploy-core-packages.sh)
- [Build Validation](../scripts/validate-build.sh)
- [Security Audit](../scripts/security-audit.sh)

### Support Channels
- **Technical Lead**: Architecture and deployment questions
- **Security Team**: Compliance and vulnerability management
- **DevOps**: CI/CD and infrastructure support

## 🎓 Training Checklist

### New Developer Onboarding
- [ ] Read this training guide
- [ ] Set up local development environment
- [ ] Build and test core packages
- [ ] Create a simple feature using new packages
- [ ] Understand package dependency structure

### Existing Team Members
- [ ] Review new package structure
- [ ] Update existing code to use new packages
- [ ] Test integration with current applications
- [ ] Attend architecture review session

### DevOps Team
- [ ] Set up CI/CD pipeline
- [ ] Configure deployment scripts
- [ ] Set up monitoring and alerting
- [ ] Test rollback procedures

---

**Next Steps**: 
1. Complete this training checklist
2. Set up local development environment
3. Start migrating existing features to new packages
4. Attend Q&A session with technical lead

**Questions?** Contact the technical lead or raise issues in the project board.