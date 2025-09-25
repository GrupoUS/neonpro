# @neonpro/types Migration Guide

## Overview

This guide documents the consolidation and migration of type definitions from multiple packages into a unified `@neonpro/types` package as part of Phase 1.1 of the architecture restructuring.

## What Was Consolidated

### Source Packages
- **`packages/types`** - Core types and interfaces
- **`packages/schemas`** - Zod and Valibot validation schemas
- **`packages/validators`** - Brazilian healthcare validators
- **`packages/domain`** - Domain-driven design entities and value objects

### Consolidated Structure

```
packages/types/src/
├── core/                          # Foundation types and utilities
│   ├── base.ts                    # BaseEntity, Auditable, API responses
│   ├── primitives.ts              # Branded types, type guards, utilities
│   └── index.ts                   # Core module exports
├── domain/                        # Domain-driven design types
│   ├── entities/                  # Domain entities (Patient, Appointment, Consent)
│   │   ├── patient.ts             # Complete patient entity with validators
│   │   ├── appointment.ts         # Appointment entity with scheduling logic
│   │   ├── consent.ts             # LGPD consent management
│   │   └── index.ts               # Entity exports
│   ├── value-objects/             # Domain value objects
│   │   ├── gender.ts              # Brazilian healthcare enums
│   │   ├── address.ts             # Address with CEP validation
│   │   ├── healthcare.ts          # Healthcare-specific types
│   │   └── lgpd.ts                # LGPD compliance types
│   ├── repositories/               # Repository interfaces
│   │   └── patient-repository.ts  # Patient data access interface
│   ├── errors/                    # Domain errors
│   │   └── domain-errors.ts       # Comprehensive error hierarchy
│   ├── events/                    # Domain events
│   │   └── domain-events.ts       # Event-driven architecture types
│   └── index.ts                   # Domain module exports
├── validation/                    # Validation schemas and utilities
│   ├── validators.ts              # Brazilian healthcare validators (CPF, CNPJ, etc.)
│   ├── zod/                       # Zod schemas
│   │   ├── patient.ts             # Patient validation schemas
│   │   └── index.ts               # Zod exports
│   ├── valibot/                   # Valibot schemas
│   │   ├── patient.ts             # Patient validation schemas
│   │   ├── appointment.ts         # Appointment validation schemas
│   │   └── index.ts               # Valibot exports
│   └── index.ts                   # Validation module exports
└── index.ts                       # Main package exports
```

## New Features and Enhancements

### 1. Core Foundation Types
- **Branded Types**: Type-safe primitives (`NonEmptyString`, `EmailString`, etc.)
- **Base Entities**: `BaseEntity`, `Auditable`, `SoftDeletable` interfaces
- **API Patterns**: Standardized API response and pagination types
- **Event System**: Comprehensive event-driven architecture types

### 2. Enhanced Domain Model
- **Complete Patient Entity**: Brazilian healthcare compliance (CPF, LGPD)
- **Appointment Management**: Full scheduling logic with conflict detection
- **Consent Management**: LGPD-compliant consent tracking and audit trails
- **Error Hierarchy**: Domain-specific errors with proper inheritance

### 3. Brazilian Healthcare Validators
- **Document Validation**: CPF, CNPJ, CNS, TUSS validation
- **Professional Licenses**: CRM, COREN, CFF, CNEP validation
- **Address Validation**: CEP formatting and validation
- **Batch Processing**: Efficient validation of multiple records

### 4. Validation Schemas
- **Zod Integration**: Comprehensive Zod schemas for all entities
- **Valibot Support**: Alternative validation framework support
- **Type Inference**: Full TypeScript type inference from schemas

## Migration Instructions

### For Existing Projects

#### 1. Update Package Dependencies
```bash
# Remove old packages
bun remove @neonpro/schemas @neonpro/validators @neonpro/domain

# Add enhanced types package
bun add @neonpro/types@latest
```

#### 2. Update Import Statements

**Before:**
```typescript
import { Patient } from '@neonpro/domain'
import { validateCPF } from '@neonpro/validators'
import { BasePatientSchema } from '@neonpro/schemas'
```

**After:**
```typescript
import { Patient } from '@neonpro/types/domain'
import { validateCPF } from '@neonpro/types/validation'
import { BasePatientSchema } from '@neonpro/types/validation/zod'
```

#### 3. Selective Imports (Recommended)

**Core Types:**
```typescript
import { 
  BaseEntity, 
  Auditable, 
  PaginatedResponse 
} from '@neonpro/types/core'
```

**Domain Types:**
```typescript
import { 
  Patient, 
  Appointment, 
  PatientValidator 
} from '@neonpro/types/domain'
```

**Validation:**
```typescript
import { 
  validateCPF, 
  validateCNPJ 
} from '@neonpro/types/validation'

import { 
  BasePatientSchema 
} from '@neonpro/types/validation/zod'
```

### For New Projects

#### 1. Installation
```bash
bun add @neonpro/types
```

#### 2. Basic Usage
```typescript
// Import what you need
import { 
  Patient, 
  PatientFactory, 
  validateCPF,
  BasePatientSchema 
} from '@neonpro/types'

// Create a patient
const patient = PatientFactory.createMinimal({
  clinicId: 'clinic_123',
  medicalRecordNumber: 'MRN001',
  givenNames: ['João'],
  familyName: 'Silva'
})

// Validate CPF
const isValidCPF = validateCPF('123.456.789-09')

// Validate with Zod
const validationResult = BasePatientSchema.safeParse(patientData)
```

## Package Exports

### Main Export
```typescript
import * as NeonProTypes from '@neonpro/types'
// Includes all types and utilities
```

### Submodule Exports
```typescript
// Core foundation types
import { BaseEntity } from '@neonpro/types/core'

// Domain entities and value objects
import { Patient } from '@neonpro/types/domain'

// Validation utilities
import { validateCPF } from '@neonpro/types/validation'

// Specific validation frameworks
import { BasePatientSchema } from '@neonpro/types/validation/zod'
import { PatientSchema } from '@neonpro/types/validation/valibot'
```

### Wildcard Exports
```typescript
// Domain submodules
import { Gender, BloodType } from '@neonpro/types/domain/value-objects'
import { PatientNotFoundError } from '@neonpro/types/domain/errors'

// Validation submodules
import { validateCPF } from '@neonpro/types/validation/validators'
```

## TypeScript Configuration

The package includes proper TypeScript configuration for optimal development experience:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

## Breaking Changes

### 1. Package Structure
- Removed `@neonpro/schemas`, `@neonpro/validators`, `@neonpro/domain` packages
- Consolidated into `@neonpro/types` with organized submodules

### 2. Import Paths
- All import paths need to be updated to use the new package structure
- Some types have been enhanced with additional fields and validation

### 3. Type Enhancements
- Patient entity now includes comprehensive LGPD compliance fields
- Appointment entity includes full scheduling logic and calendar integration
- Enhanced error handling with proper domain error hierarchy

## Benefits of the Consolidation

### 1. Simplified Dependencies
- Single package for all type definitions
- Reduced dependency management overhead
- Consistent versioning across all types

### 2. Better Organization
- Logical separation of concerns (core, domain, validation)
- Clear import paths and module structure
- Easier discovery of available types

### 3. Enhanced Type Safety
- Branded types for primitive validation
- Comprehensive domain modeling
- Full validation framework integration

### 4. Brazilian Healthcare Compliance
- Built-in LGPD compliance types
- Brazilian document validation
- Healthcare-specific domain entities

### 5. Developer Experience
- Better IDE support with organized imports
- Comprehensive documentation
- Type inference from validation schemas

## Testing the Migration

1. **Update Package Dependencies**
   ```bash
   bun remove @neonpro/schemas @neonpro/validators @neonpro/domain
   bun add @neonpro/types@latest
   ```

2. **Update Import Statements**
   - Find and replace all import statements
   - Test compilation in development mode

3. **Run Type Checking**
   ```bash
   bun x tsc --noEmit
   ```

4. **Run Tests**
   ```bash
   bun test
   ```

5. **Validate Runtime Behavior**
   - Test all CRUD operations
   - Validate all business logic
   - Check error handling scenarios

## Support

For migration issues or questions:
- Check the comprehensive type definitions in `/packages/types/src/`
- Review existing usage patterns in the codebase
- Consult the domain-driven design principles applied
- Verify Brazilian healthcare compliance requirements

## Future Enhancements

The consolidated package structure enables:
- Easy addition of new domain entities
- Expansion of validation frameworks
- Enhanced type safety features
- Better tooling integration
- Improved documentation generation