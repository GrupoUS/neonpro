# Vercel Deployment Workflow

## Description

Unified Vercel deployment system with healthcare compliance validation for NeonPro platform. Supports CLI-first approach with unified script fallback.

## Category

Operations

## Complexity

Medium

## MCP Tools Required

- desktop-commander

## Execution Flow

### Phase 1: Pre-Deployment Validation

1. **Environment Setup Verification**
   - Check Bun version (v1.2.21+ required)
   - Verify Node.js version (v18.0.0+ required)
   - Validate Vercel CLI version (v47.0.0+ required)
   - Ensure all dependencies are properly installed

2. **Local Build Testing**
   - Execute local build with unified script: `./scripts/deploy-unified.sh build --strategy turbo`
   - Validate build success and output generation
   - Check for build errors or warnings
   - Ensure build artifacts are correctly generated

3. **Environment Variables Validation**
   - Verify required environment variables are present:
     - VITE_SUPABASE_URL
     - VITE_SUPABASE_ANON_KEY
     - VITE_APP_ENV
     - VITE_API_URL
     - VITE_SITE_URL
     - VITE_GOOGLE_CLIENT_ID
   - Validate variable formats and values
   - Ensure frontend-only exposure (VITE\_ prefixed variables)

### Phase 2: Deployment Strategy Selection

1. **CLI-First Approach (Primary)**
   - Link project: `npx vercel link --project neonpro --org <org>`
   - Verify environment variables: `npx vercel env ls`
   - Deploy preview: `npx vercel`
   - Deploy production: `npx vercel --prod`
   - Monitor logs: `npx vercel logs --follow`

2. **Unified Script Fallback**
   - Standard production: `./scripts/deploy-unified.sh deploy --production --strategy turbo`
   - Preview with validation: `./scripts/deploy-unified.sh deploy --preview --strategy turbo && ./scripts/deploy-unified.sh validate --comprehensive`
   - Emergency deployment: `./scripts/deploy-unified.sh deploy --production --force --skip-tests`

### Phase 3: Build Strategy Execution

1. **Turborepo Strategy (Default)**
   - Execute: `bunx turbo build --filter=@neonpro/web`
   - Expected build time: ~45s
   - Cache hit rate: 85%
   - Success rate: 100%

2. **Alternative Strategies**
   - **Bun Strategy**: `bun install && bun run build` (~60s, 70% cache hit)
   - **NPM Strategy**: `npm install && npm run build` (~90s, 60% cache hit)
   - **Auto Recovery**: Handle dependency resolution, build failures, network issues, cache corruption

### Phase 4: Healthcare Compliance Validation

1. **Compliance Testing**
   - Execute: `./scripts/deploy-unified.sh test compliance`
   - Validate LGPD compliance markers
   - Check audit logging implementation
   - Verify healthcare component compliance
   - Ensure Brazilian regulatory compliance

2. **Data Protection Validation**
   - Scan for PHI/PII exposure in deployed application
   - Validate data encryption and masking
   - Check audit trail preservation
   - Verify data retention policies

### Phase 5: Post-Deployment Verification

1. **Automated Validation**
   - **Basic Validation**: `./scripts/deploy-unified.sh validate --url https://neonpro.vercel.app`
     - Homepage loads successfully
     - Login page accessible
     - API connections work
     - Healthcare compliance verified
   - **Comprehensive Validation**: `./scripts/deploy-unified.sh validate --comprehensive --url https://neonpro.vercel.app`
     - Performance testing included
     - Healthcare compliance validation
     - Complete functionality verification

2. **Manual Verification**
   - Access homepage: https://neonpro.vercel.app
   - Test login functionality at /login
   - Verify dashboard loads after authentication
   - Validate API connections (Supabase integration)
   - Confirm healthcare compliance (LGPD markers)

### Phase 6: Monitoring and Reporting

1. **Performance Monitoring**
   - Check LCP (<2.5s)
   - Verify INP (<200ms)
   - Validate CLS (<0.1)
   - Ensure bundle size (<1MB)

2. **Health Monitoring**
   - Monitor deployment health status
   - Check error rates and performance metrics
   - Validate healthcare compliance status
   - Ensure system availability and reliability

## Input Parameters

- **deployment_mode**: Deployment mode (preview, production, emergency)
- **build_strategy**: Build strategy (turbo, bun, npm, auto)
- **compliance_level**: Healthcare compliance strictness (standard, enhanced, strict)
- **validation_level**: Post-deployment validation level (basic, comprehensive, full)
- **rollback_enabled**: Enable rollback capability (true/false)

## Output Requirements

- **deployment_manifest**: Detailed deployment configuration and status
- **compliance_report**: Healthcare compliance validation results
- **performance_metrics**: Deployment performance and health metrics
- **validation_results**: Post-deployment verification outcomes
- **rollback_information**: Rollback capability and procedures (if enabled)

## Quality Gates

- **Environment Compliance**: All environment variables present and valid
- **Build Success**: Local build passes without errors
- **Deployment Success**: Application deployed successfully to target environment
- **Compliance Validation**: All healthcare compliance requirements met
- **Performance Metrics**: All performance benchmarks achieved
- **Functionality Verification**: All critical features working correctly

## Error Handling

- **Environment Issues**: Provide specific environment setup errors and fixes
- **Build Failures**: Offer alternative build strategies and recovery steps
- **Deployment Errors**: Provide deployment error details and retry procedures
- **Compliance Violations**: Report specific violations and mitigation strategies
- **Performance Issues**: Identify performance bottlenecks and optimization recommendations

## Success Criteria

- **Deployment Success**: Application successfully deployed to target environment
- **Build Reliability**: Build process completes successfully with chosen strategy
- **Compliance Status**: Full healthcare compliance with documented evidence
- **Performance Achievement**: All performance benchmarks met or exceeded
- **Functionality Verified**: All critical features working as expected
- **Monitoring Ready**: Deployment monitoring and alerting properly configured

## Constitutional Compliance

- **KISS/YAGNI**: Deployment process is simple and necessary, no over-engineering
- **Test-First**: Comprehensive validation and testing before and after deployment
- **Architecture**: Deployment follows established monorepo patterns and boundaries
- **Healthcare**: LGPD/ANVISA/CFM compliance integrated into deployment process
- **Observability**: Complete monitoring and logging of deployment operations

## Build Strategies

- **Turborepo (Default)**:
  - Build time: ~45s
  - Cache hit: 85%
  - Success rate: 100%
  - Command: `bunx turbo build --filter=@neonpro/web`

- **Bun (Fallback)**:
  - Build time: ~60s
  - Cache hit: 70%
  - Success rate: 100%
  - Command: `bun install && bun run build`

- **NPM (Compatibility)**:
  - Build time: ~90s
  - Cache hit: 60%
  - Success rate: 98%
  - Command: `npm install && npm run build`

## Healthcare Compliance Features

- **Automatic Validation**: LGPD compliance markers and audit logging
- **Healthcare Components**: Validation of healthcare-specific functionality
- **Brazilian Regulatory**: ANVISA and CFM compliance verification
- **Data Privacy**: PHI/PII protection and data retention policies
- **Audit Trail**: Complete logging of deployment operations for compliance

## Configuration Files

- **Primary**: vercel.json (Bun + Turborepo monorepo configuration)
- **Linking Metadata**: .vercel/project.json (created by npx vercel link)
- **Backup Files**: vercel-bun.json, vercel-turbo.json
- **Deployment Script**: scripts/deploy-unified.sh
- **Archived Scripts**: scripts/archive/

## Integration Points

- **Desktop Commander**: File system operations, script execution, and deployment management
- **Vercel CLI**: Direct platform integration and deployment operations
- **Unified Script**: Fallback deployment system with enhanced error handling
