# Healthcare Database Migrations - Phase 3.3

## Overview

This directory contains migration scripts and documentation for the Brazilian healthcare compliance database implementation, including LGPD, CFM, and ANVISA requirements.

## Migration Order

### 1. Initial Healthcare Entities Migration

**File**: `20250918_healthcare_entities_migration.sql`
**Description**: Creates enhanced Patient, LGPDConsent, Appointment, and TelemedicineSession models with Brazilian compliance features.

### 2. Multi-Schema Support

**Schemas Created**:

- `public` - Main application data
- `audit` - Audit logging and compliance tracking
- `lgpd` - LGPD-specific compliance data

### 3. Row Level Security (RLS) Policies

**File**: `20250918_rls_policies.sql`
**Description**: Implements multi-tenant isolation with clinic-based RLS policies.

### 4. Performance Indexes

**File**: `20250918_performance_indexes.sql`
**Description**: Creates optimized indexes for healthcare workflows and compliance queries.

## Brazilian Compliance Features

### LGPD (Lei Geral de Proteção de Dados)

- Cryptographic consent proof with SHA-256 hashing
- Data retention and anonymization scheduling
- Granular consent management with withdrawal tracking
- Legal basis documentation per Art. 7º and 11º LGPD

### CFM (Conselho Federal de Medicina)

- CRM professional validation
- Resolution 2314/2022 telemedicine compliance
- Medical specialty code tracking
- Ethics compliance monitoring

### ANVISA Compliance

- Protocol number tracking
- Regulatory framework compliance
- Healthcare facility oversight

## Database Performance Optimizations

### Indexes Created

- Patient CPF and CNS unique constraints
- Appointment scheduling optimization
- No-show risk scoring queries
- Telemedicine session compliance tracking
- LGPD consent lifecycle management

### Connection Pooling

- Prisma Accelerate configuration ready
- Multi-tenant isolation support
- Healthcare-grade performance requirements

## Security Features

### NGS2 (Norma Geral de Segurança)

- Level 2 security standard compliance
- AES-256 encryption standards
- Key management protocols
- Access control matrices

### ICP-Brasil Integration

- Digital certificate validation
- Certificate chain verification
- Cryptographic proof storage

## Migration Execution

### Prerequisites

1. Supabase project with PostgreSQL 15+
2. Environment variables configured:
   ```bash
   DATABASE_URL="postgresql://..."
   DIRECT_URL="postgresql://..."
   ```

### Commands

```bash
# Generate Prisma client
bun run prisma:generate

# Apply migrations
bun run prisma:migrate

# Verify migration
bun run prisma:studio
```

### Post-Migration Verification

1. Verify multi-schema creation
2. Test RLS policies with clinic isolation
3. Validate LGPD consent cryptographic hashing
4. Test appointment no-show prediction fields
5. Verify telemedicine session CFM compliance

## Rollback Procedures

Each migration includes rollback SQL statements for safe deployment and testing.

## Compliance Audit Trail

All migrations create comprehensive audit logging for regulatory compliance and security monitoring.
