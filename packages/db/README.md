# @neonpro/db - Healthcare Database Package

## Overview

Database package for NeonPro Healthcare management system containing Supabase configurations,
migrations, Edge Functions, and TypeScript type definitions.

## 🏥 Healthcare Compliance

This package maintains:

- **LGPD Compliance**: Brazilian data protection law compliance
- **ANVISA Regulations**: Medical device and procedure tracking
- **CFM Standards**: Medical professional standards and ethics
- **Multi-tenant Row Level Security**: Patient data isolation

## 📁 Structure

```
packages/db/
├── package.json              # Database package configuration
├── README.md                 # This file
├── types/                    # Generated TypeScript definitions
│   └── supabase.ts          # Supabase database types
└── supabase/                # Supabase project files
    ├── config.toml          # Supabase configuration
    ├── migrations/          # SQL migration files (70+ healthcare schemas)
    ├── functions/           # Edge Functions
    │   ├── stock-alerts-processor/
    │   ├── stock-reports-generator/
    │   └── subscription-billing-processor/
    └── seed.sql            # Database seed data
```

## 🚀 Commands

### Database Management

```bash
# Start local Supabase
pnpm --filter @neonpro/db db:start

# Stop local Supabase
pnpm --filter @neonpro/db db:stop

# Check status
pnpm --filter @neonpro/db db:status

# Reset database
pnpm --filter @neonpro/db db:reset
```

### Migrations

```bash
# Create new migration
pnpm --filter @neonpro/db db:migration:new "migration_name"

# Apply migrations
pnpm --filter @neonpro/db db:migration:up

# Squash migrations
pnpm --filter @neonpro/db db:migration:squash
```

### Edge Functions

```bash
# Deploy all functions
pnpm --filter @neonpro/db db:functions:deploy

# Serve functions locally
pnpm --filter @neonpro/db db:functions:serve

# Deploy specific function
supabase functions deploy stock-alerts-processor
```

### Type Generation

```bash
# Generate TypeScript types
pnpm --filter @neonpro/db db:generate:types
```

## 🔐 Security Features

- **Row Level Security (RLS)**: Multi-tenant patient data isolation
- **Audit Trails**: Comprehensive logging for healthcare compliance
- **Field-level Encryption**: Sensitive medical data protection
- **Session Management**: Secure healthcare professional authentication

## 🏥 Healthcare Schemas

### Core Healthcare Tables

- `patients`: Patient management with LGPD compliance
- `appointments`: Scheduling with conflict resolution
- `treatments`: Treatment tracking and protocols
- `medical_records`: Secure patient records
- `professionals`: CFM-compliant professional management

### Compliance Tables

- `lgpd_consent`: Granular consent management
- `audit_logs`: Comprehensive audit trails
- `anvisa_tracking`: Medical device/procedure compliance
- `cfm_validation`: Professional standards compliance

### AI & Analytics

- `treatment_predictions`: AI-driven treatment recommendations
- `patient_analytics`: Wellness intelligence and insights
- `demand_forecasting`: Predictive analytics for operations

## 🌐 Multi-tenant Architecture

All tables implement tenant isolation through:

- `tenant_id` columns with RLS policies
- Automatic tenant context injection
- Cross-tenant data prevention
- Compliance audit per tenant

## 📊 Performance Optimizations

- Optimized indexes for healthcare queries
- Materialized views for analytics
- Connection pooling configurations
- Query performance monitoring

## 🔄 Migration Strategy

Migrations are organized chronologically with healthcare-specific groupings:

- `001-003`: Core subscription and RLS foundation
- `20240115*`: LGPD compliance system
- `20240125*`: Brazilian tax and regulatory systems
- `20240130*`: Operational management systems
- `20240140*`: AI and analytics systems
- `20250815*`: Latest compliance automation

## 🎯 Usage in Monorepo

This package is used by:

- `apps/web`: Main healthcare application
- `apps/api`: Healthcare API services
- `packages/types`: Shared type definitions
- `packages/utils`: Database utilities

## 🔧 Development

1. Ensure Supabase CLI is installed: `npm install -g supabase`
2. Start local development: `pnpm --filter @neonpro/db db:start`
3. Apply migrations: `pnpm --filter @neonpro/db db:migration:up`
4. Generate types: `pnpm --filter @neonpro/db db:generate:types`

## 📝 License

Proprietary - NeonPro Healthcare System
