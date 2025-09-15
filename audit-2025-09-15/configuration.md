# NeonPro Code Quality Audit Configuration
**Created**: 2025-09-15 19:47:11 (America/Sao_Paulo, UTC-3:00)
**Audit ID**: NPA-2025-09-15-001

## Audit Parameters

### Scope Definition
- **Repository**: Full NeonPro monorepo
- **Branch**: main (fb753333d6be594c1ad9d04a8a72df18e93ae476)
- **Exclusions**: None (comprehensive audit)
- **Focus Areas**: Architecture, Security, Compliance, Performance, Testing

### Compliance Requirements
- **LGPD**: Strict compliance (Lei Geral de Proteção de Dados)
- **ANVISA**: Medical device software compliance
- **CFM**: Federal Medical Council regulations
- **Data Residency**: Brazilian data center requirements

### Quality Thresholds
- **Architecture**: 100% compliance with documented patterns
- **Security**: Zero critical vulnerabilities, PHI/PII protection
- **Performance**: 
  - Web: FCP <1.5s, LCP <2.5s, CLS <0.1
  - API: <100ms response (95th percentile)
  - Database: <100ms query response
- **Testing**: ≥80% coverage across all critical paths
- **Code Quality**: ≥9.5/10 score based on standards

## Technology Stack Validation

### Expected Technologies (from docs/architecture/tech-stack.md)
- **Monorepo**: Turborepo v2.5.6, PNPM v8.15.0
- **Frontend**: React 19.1.1, TypeScript 5.7.2, TanStack Router, Vite 5.2.0
- **Backend**: Hono.dev v4.5.8, Node.js 20+, Supabase v2.45.1
- **Database**: PostgreSQL 15+, Row Level Security
- **Testing**: Vitest v3.2.0, Playwright v1.40.0
- **Quality**: Oxlint v1.13.0, dprint v0.50.0

### Version Compliance Check
- All versions should match documented specifications
- Security patches should be up-to-date
- Dependencies should be properly pinned

## Architecture Validation

### Expected Structure (from docs/architecture/source-tree.md)
```
neonpro/
├── apps/ (2 applications)
│   ├── api/ (Backend API)
│   └── web/ (Frontend Application)
├── packages/ (7 shared packages)
│   ├── types/ (TypeScript definitions)
│   ├── database/ (Supabase schemas)
│   ├── shared/ (Common utilities)
│   ├── utils/ (Utility functions)
│   ├── security/ (Security utilities)
│   ├── core-services/ (Business logic)
│   └── config/ (Shared configurations)
├── tools/ (Development tools)
├── docs/ (Documentation)
└── Root configuration files
```

### Package Dependency Chain
- **Foundation**: types (no dependencies)
- **Infrastructure**: database, shared, utils, security (depend on types)
- **Service**: core-services (depends on infrastructure)
- **Applications**: api, web (depend on packages as needed)

## Security & Compliance Validation

### LGPD Requirements
- **Data Minimization**: Collect only necessary data
- **Purpose Limitation**: Clear data processing purposes
- **Consent Management**: Explicit user consent
- **Data Rights**: Access, portability, deletion
- **Audit Trail**: Complete data access logging
- **Breach Notification**: 72-hour notification requirement

### Healthcare Security
- **PHI/PII Protection**: Encrypted storage and transmission
- **Access Control**: Role-based access with audit logs
- **Data Masking**: Sensitive data display protection
- **Authentication**: Multi-factor authentication support
- **Authorization**: Row-level security implementation

## Testing Strategy Validation

### Testing Pyramid (from docs/testing/)
- **Unit Tests**: 70% of test coverage (Vitest)
- **Integration Tests**: 20% of test coverage (Vitest)
- **E2E Tests**: 10% of test coverage (Playwright)
- **Mutation Testing**: Quality validation
- **Performance Testing**: Load and stress testing
- **Security Testing**: Vulnerability assessment

### Coverage Requirements
- **Critical Paths**: 90% minimum coverage
- **Business Logic**: 85% minimum coverage
- **UI Components**: 80% minimum coverage
- **Utilities**: 95% minimum coverage
- **Overall**: 80% minimum coverage

## Output Requirements

### Deliverables
1. **quality_report.txt**: Comprehensive audit results
2. **compliance_certificate.md**: LGPD compliance certification
3. **test_coverage_report.json**: Test coverage analysis
4. **action_plan.md**: Prioritized improvement recommendations
5. **audit_artifacts/**: Supporting evidence and documentation

### Report Structure
- **Executive Summary**: Key findings and recommendations
- **Architecture Analysis**: Structure compliance and violations
- **Security Assessment**: Vulnerability findings and compliance status
- **Performance Analysis**: Benchmark results and optimization opportunities
- **Testing Analysis**: Coverage metrics and quality assessment
- **Compliance Status**: LGPD/ANVISA/CFM compliance certification
- **Action Plan**: Prioritized improvement roadmap

## Error Handling Protocols

### Critical Issues (Immediate Failure)
- **Architecture Mismatch**: >10% deviation from documented structure
- **Security Vulnerabilities**: Critical severity vulnerabilities
- **Compliance Violations**: LGPD/ANVISA non-compliance
- **Data Exposure**: PHI/PII data leaks or insufficient protection

### Warning Conditions (Continue with Documentation)
- **Performance Degradation**: Below threshold but functional
- **Test Coverage Gaps**: Below 80% but above 70%
- **Code Quality Issues**: Minor violations of standards
- **Documentation Gaps**: Missing or outdated documentation

### Success Criteria
- **Repository Health**: Clean architecture with no structural violations
- **Integration Reliability**: All backend-database connections validated
- **Compliance Status**: Full LGPD compliance with documented evidence
- **Test Coverage**: Comprehensive coverage across all critical components
- **Documentation**: Complete audit trail with actionable recommendations

## Audit Tools Configuration

### MCP Tools Usage
- **sequential-thinking**: Requirement complexity assessment
- **serena**: Codebase semantic analysis and pattern recognition
- **desktop-commander**: File operations and system validation
- **supabase**: Database integration and security testing
- **archon**: Task management and knowledge storage

### Analysis Methods
- **Static Analysis**: Code structure, patterns, and standards compliance
- **Dynamic Analysis**: Runtime behavior, performance, and integration testing
- **Security Analysis**: Vulnerability scanning and compliance validation
- **Compliance Analysis**: Regulatory requirement mapping and validation

## Next Steps
Proceeding with Phase 2: Repository Analysis using Serena MCP for comprehensive codebase analysis and validation against documented architecture patterns.
