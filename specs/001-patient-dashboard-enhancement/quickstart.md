# Quickstart Guide: Patient Dashboard Enhancement

**Feature**: Patient Dashboard Enhancement with Modern UI Components  
**Development Guide**: Step-by-step implementation and testing  
**Target Audience**: Developers, QA Engineers, Project Managers  
**Estimated Setup Time**: 45-60 minutes

## Overview

This quickstart guide provides a complete development workflow for implementing the patient dashboard enhancement with Brazilian healthcare compliance, AI features, and mobile-first design. Follow this guide to set up your development environment and validate the implementation.

## Prerequisites

### System Requirements
- **Node.js**: 20.x or later
- **Bun**: 1.x (preferred package manager for 3-5x performance)
- **PostgreSQL**: 14.x or later (or Supabase account)
- **Git**: Latest version
- **VS Code**: With recommended extensions

### Required Tools
```bash
# Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash

# Verify installation
node --version    # Should be >= 20.x
bun --version     # Should be >= 1.x
psql --version    # Should be >= 14.x
```

### Environment Setup
```bash
# Clone the repository
git clone https://github.com/GrupoUS/neonpro.git
cd neonpro

# Switch to feature branch
git checkout 001-patient-dashboard-enhancement

# Install dependencies
bun install

# Copy environment template
cp .env.example .env.local
```

## Development Environment Configuration

### 1. Database Setup (Supabase)

**Option A: Use Supabase Cloud (Recommended)**
```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase
supabase init

# Start local development
supabase start

# Apply migrations
supabase db push
```

**Option B: Local PostgreSQL**
```bash
# Create database
createdb neonpro_dev

# Run migrations
bun run db:migrate

# Seed with test data
bun run db:seed
```

### 2. Environment Variables

Edit `.env.local` with your configuration:

```env
# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Configuration
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
NEXT_PUBLIC_AI_MODEL_DEFAULT=gpt-4-turbo

# Application
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Brazilian Services
VIACEP_API_URL=https://viacep.com.br/ws
NEXT_PUBLIC_BRAZILIAN_TIMEZONE=America/Sao_Paulo

# Performance Monitoring
NEXT_PUBLIC_PERFORMANCE_MONITORING=true
NEXT_PUBLIC_LOG_LEVEL=debug

# LGPD Compliance
NEXT_PUBLIC_LGPD_ENABLED=true
NEXT_PUBLIC_COOKIE_CONSENT_REQUIRED=true
```

### 3. Development Scripts

Add these scripts to your development workflow:

```json
{
  "scripts": {
    "dev": "bun run dev:web",
    "dev:web": "cd apps/web && bun run dev",
    "dev:api": "cd apps/api && bun run dev",
    "dev:full": "concurrently \"bun run dev:web\" \"bun run dev:api\"",
    "build": "bun run build:web && bun run build:api",
    "test": "bun run test:unit && bun run test:integration",
    "test:unit": "vitest run",
    "test:integration": "playwright test",
    "test:e2e": "cypress run",
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit",
    "db:migrate": "supabase db push",
    "db:seed": "bun run scripts/seed-database.ts",
    "db:reset": "supabase db reset",
    "generate:types": "supabase gen types typescript --local > packages/types/src/database.ts"
  }
}
```

## Step-by-Step Implementation Guide

### Phase 1: Core Infrastructure Setup (Est. 20 minutes)

#### 1.1 Verify Project Structure
```bash
# Ensure correct structure exists
ls -la apps/web/src/components/patient/
ls -la apps/api/src/models/
ls -la packages/types/src/
ls -la packages/config/src/
```

#### 1.2 Install shadcn/ui with experiment-01 Registry
```bash
# Navigate to web app
cd apps/web

# Initialize shadcn/ui with experiment-01
npx shadcn-ui@latest init

# Update components.json for experiment-01 registry
cat > components.json << 'EOF'
{
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/styles/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  },
  "registries": {
    "experiment-01": {
      "url": "https://experiment-01.vercel.app/registry",
      "description": "Advanced UI components for healthcare applications"
    }
  }
}
EOF

# Install core components
npx shadcn-ui@latest add button input table card form dialog
```

#### 1.3 Set Up Type System
```bash
# Generate database types
bun run generate:types

# Verify types are generated
ls -la packages/types/src/database.ts
```

### Phase 2: Patient Data Models (Est. 15 minutes)

#### 2.1 Create Patient Model
```bash
# Create patient model file
touch apps/api/src/models/patient.ts

# Verify file structure
ls -la apps/api/src/models/
```

#### 2.2 Run Model Tests
```bash
# Run patient model tests
bun test apps/api/src/models/patient.test.ts

# Expected output: Tests should fail initially (RED phase)
# This is correct - we implement tests first, then make them pass
```

### Phase 3: API Implementation (Est. 20 minutes)

#### 3.1 Patient API Routes
```bash
# Create API route structure
mkdir -p apps/api/src/api/patients
touch apps/api/src/api/patients/index.ts
touch apps/api/src/api/patients/[id].ts

# Verify API structure
tree apps/api/src/api/
```

#### 3.2 Test API Endpoints
```bash
# Start API server
cd apps/api && bun run dev

# In another terminal, test endpoints
curl -X GET http://localhost:3001/v2/patients \
  -H "Authorization: Bearer your_test_token" \
  -H "Content-Type: application/json"

# Expected: Should return empty array or test data
```

### Phase 4: Frontend Components (Est. 25 minutes)

#### 4.1 Patient Dashboard Components
```bash
# Create component structure
mkdir -p apps/web/src/components/patient
touch apps/web/src/components/patient/PatientList.tsx
touch apps/web/src/components/patient/PatientForm.tsx
touch apps/web/src/components/patient/PatientSearch.tsx

# Create data table component
npx shadcn-ui@latest add data-table
```

#### 4.2 Navigation Components
```bash
# Create navigation components
mkdir -p apps/web/src/components/navigation
touch apps/web/src/components/navigation/Sidebar.tsx
touch apps/web/src/components/navigation/Breadcrumbs.tsx

# Install navigation dependencies
bun add @tanstack/react-router
```

#### 4.3 Start Development Server
```bash
# Start web development server
cd apps/web && bun run dev

# Open browser to http://localhost:3000
# Expected: Should see basic layout with navigation
```

## Testing Workflow

### 1. Unit Tests
```bash
# Run all unit tests
bun run test:unit

# Run specific test file
bun test apps/web/src/components/patient/PatientForm.test.tsx

# Run tests in watch mode
bun test --watch
```

### 2. Integration Tests
```bash
# Run integration tests
bun run test:integration

# Run specific integration test
bunx playwright test tests/integration/patient-crud.spec.ts

# Run with UI
bunx playwright test --ui
```

### 3. End-to-End Tests
```bash
# Start all services
bun run dev:full

# In another terminal, run E2E tests
bun run test:e2e

# Run specific E2E scenario
bunx cypress run --spec "cypress/e2e/patient-registration.cy.ts"
```

## Validation Checklist

### ✅ Core Functionality Validation

#### Database & Models
- [ ] **Database Connection**: Supabase connection successful
- [ ] **Migrations Applied**: All database tables created
- [ ] **RLS Policies**: Row Level Security policies active
- [ ] **Type Generation**: Database types generated successfully

#### API Endpoints
- [ ] **Health Check**: `/v2/health` returns 200
- [ ] **Patient List**: `GET /v2/patients` returns data
- [ ] **Patient Create**: `POST /v2/patients` accepts valid data
- [ ] **Patient Update**: `PUT /v2/patients/{id}` updates record
- [ ] **Patient Delete**: `DELETE /v2/patients/{id}` soft deletes

#### Frontend Components
- [ ] **Patient List**: Displays patients in table format
- [ ] **Patient Search**: Search functionality works
- [ ] **Patient Form**: Multi-step form validates Brazilian data
- [ ] **Navigation**: Sidebar and breadcrumbs functional
- [ ] **Mobile Responsive**: Works on 320px+ screen width

### ✅ Brazilian Compliance Validation

#### LGPD Compliance
- [ ] **Consent Forms**: LGPD consent collection working
- [ ] **Data Encryption**: CPF/RG fields encrypted
- [ ] **Audit Trails**: All data access logged
- [ ] **Cookie Consent**: Cookie banner functional
- [ ] **Data Export**: Patient data export available

#### Brazilian Data Validation
- [ ] **CPF Validation**: CPF algorithm validation working
- [ ] **Phone Formatting**: Brazilian phone format applied
- [ ] **CEP Lookup**: Address auto-completion from CEP
- [ ] **Portuguese UI**: All interface text in Portuguese
- [ ] **Timezone**: America/Sao_Paulo timezone applied

### ✅ Performance Validation

#### Response Times
- [ ] **Page Load**: <500ms on mobile networks
- [ ] **API Response**: <300ms for patient search
- [ ] **AI Chat**: <2 seconds for AI responses
- [ ] **Database Queries**: <100ms for optimized queries

#### Mobile Performance
- [ ] **Touch Targets**: Minimum 44px touch targets
- [ ] **Offline Support**: Basic offline functionality
- [ ] **PWA Features**: Progressive Web App installable
- [ ] **Accessibility**: WCAG 2.1 AA+ compliance

### ✅ Security Validation

#### Authentication & Authorization
- [ ] **JWT Tokens**: Token validation working
- [ ] **Role Permissions**: Role-based access control
- [ ] **Session Security**: Secure session management
- [ ] **API Rate Limiting**: Rate limits enforced

#### Data Protection
- [ ] **HTTPS Enforcement**: All traffic over HTTPS
- [ ] **Input Sanitization**: XSS protection active
- [ ] **SQL Injection**: Parameterized queries used
- [ ] **File Upload Security**: Secure file handling

## Common Issues & Solutions

### 1. Database Connection Issues
```bash
# Check Supabase status
supabase status

# Reset database if needed
supabase db reset

# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 2. Type Generation Errors
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache
rm -rf apps/web/.next
rm -rf apps/api/dist

# Reinstall dependencies
bun install

# Regenerate types
bun run generate:types
```

### 3. Component Import Errors
```bash
# Check shadcn/ui installation
npx shadcn-ui@latest list

# Reinstall missing components
npx shadcn-ui@latest add missing-component-name

# Verify import paths in components.json
cat apps/web/components.json
```

### 4. API Endpoint Not Found
```bash
# Check API server is running
curl http://localhost:3001/v2/health

# Verify route registration
grep -r "patients" apps/api/src/api/

# Check middleware and CORS configuration
```

### 5. LGPD Compliance Warnings
```bash
# Verify consent collection
curl -X GET http://localhost:3001/v2/patients/test-id/consent

# Check audit logging
grep "AUDIT" logs/application.log

# Validate data encryption
psql -d neonpro_dev -c "SELECT encrypt_cpf('12345678901');"
```

## Development Best Practices

### 1. Code Quality
```bash
# Run all quality checks
bun run lint && bun run format && bun run type-check

# Pre-commit validation
git add . && git commit -m "feat: patient dashboard implementation"
```

### 2. Testing Strategy
- **Write tests first** (TDD approach)
- **Test Brazilian data validation** thoroughly
- **Include LGPD compliance tests**
- **Validate mobile responsiveness**

### 3. Performance Monitoring
```bash
# Monitor bundle size
bun run build && bunx bundlesize

# Check Core Web Vitals
npm install -g lighthouse
lighthouse http://localhost:3000 --only-categories=performance
```

### 4. Security Checklist
- [ ] **Sensitive data encrypted** in database
- [ ] **API endpoints protected** with authentication
- [ ] **Input validation** on all forms
- [ ] **LGPD compliance** implemented
- [ ] **Security headers** configured

## Next Steps

After completing this quickstart:

1. **Run Full Test Suite**: Ensure all tests pass
2. **Performance Audit**: Validate performance targets
3. **Security Review**: Complete security checklist
4. **User Acceptance Testing**: Test with real clinic workflows
5. **Production Deployment**: Deploy to staging environment

## Support & Resources

### Documentation
- [NeonPro Architecture Guide](../../../docs/architecture/AGENTS.md)
- [LGPD Compliance Guidelines](../../../docs/compliance/lgpd.md)
- [Brazilian Healthcare Regulations](../../../docs/compliance/anvisa-cfm.md)

### Development Tools
- [Supabase Dashboard](https://app.supabase.com)
- [shadcn/ui Components](https://ui.shadcn.com)
- [TanStack Router Docs](https://tanstack.com/router)

### Testing Resources
- [Vitest Documentation](https://vitest.dev)
- [Playwright Testing](https://playwright.dev)
- [Cypress E2E Testing](https://cypress.io)

### Support Channels
- **Technical Issues**: Create GitHub issue
- **LGPD Questions**: Contact compliance team
- **Performance Issues**: Monitor performance dashboard

---

**Quickstart Status**: ✅ READY FOR IMPLEMENTATION  
**Estimated Completion Time**: 1.5-2 hours for full setup  
**Quality Gate**: All validation checks must pass before production  
**Constitutional Compliance**: ✅ LGPD, ANVISA, CFM requirements covered