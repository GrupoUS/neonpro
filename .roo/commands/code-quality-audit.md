# Code Quality Audit Workflow

## Description

Comprehensive code quality audit and integration validation for NeonPro healthcare platform with LGPD compliance.

## Category

Development

## Complexity

High

## MCP Tools Required

- sequential-thinking
- archon
- serena
- desktop-commander
- supabase

## Execution Flow

### Phase 1: Setup and Configuration

1. **Load Architecture Documents**
   - Read docs/AGENTS.md
   - Read docs/architecture/AGENTS.md
   - Read docs/architecture/source-tree.md
   - Read docs/architecture/tech-stack.md
   - Read docs/rules/coding-standards.md

2. **Initialize Audit Environment**
   - Create timestamped audit directory
   - Set up logging for audit operations
   - Load configuration and constraints

### Phase 2: Repository Analysis

1. **Repository Structure Validation**
   - Verify monorepo structure compliance
   - Check package.json and workspace configurations
   - Validate source-tree.md alignment
   - Extract app and package counts dynamically

2. **Code Quality Assessment**
   - Analyze code structure and patterns
   - Check for architectural violations
   - Validate coding standards compliance
   - Assess maintainability and complexity

### Phase 3: Integration Testing

1. **Backend-Database Integration**
   - Test Supabase connection and schema
   - Validate RLS policies and security
   - Check database migration consistency
   - Verify data access patterns

2. **API-Database Integration**
   - Test API endpoints with database
   - Validate data transformation and validation
   - Check error handling and edge cases
   - Verify performance and scalability

### Phase 4: LGPD Compliance Validation

1. **Data Protection Assessment**
   - Scan for PHI/PII exposure risks
   - Validate data encryption and masking
   - Check audit trail implementation
   - Verify data retention policies

2. **Compliance Documentation**
   - Generate LGPD compliance report
   - Document data processing activities
   - Validate consent management
   - Check breach notification procedures

### Phase 5: Testing Analysis

1. **Test Coverage Assessment**
   - Analyze test coverage across all layers
   - Check unit, integration, and E2E tests
   - Validate test quality and effectiveness
   - Identify coverage gaps and recommendations

2. **Test Strategy Validation**
   - Verify testing pyramid compliance
   - Check mutation testing effectiveness
   - Validate performance testing
   - Assess security testing coverage

### Phase 6: Reporting and Documentation

1. **Generate Audit Report**
   - Create comprehensive quality report
   - Document findings and recommendations
   - Generate compliance certification
   - Create action plan for improvements

2. **Archive Audit Results**
   - Store audit artifacts in Archon
   - Create versioned audit documentation
   - Update knowledge base with findings
   - Set up monitoring for identified issues

## Input Parameters

- **audit_scope**: Repository scope (full or specific paths)
- **compliance_level**: LGPD compliance strictness level
- **test_coverage_threshold**: Minimum test coverage percentage
- **performance_threshold**: Performance benchmark thresholds

## Output Requirements

- **quality_report.txt**: Comprehensive audit results
- **compliance_certificate.md**: LGPD compliance certification
- **test_coverage_report.json**: Test coverage analysis
- **action_plan.md**: Prioritized improvement recommendations
- **archon_documents**: Persistent audit documentation

## Quality Gates

- **Architecture Compliance**: 100% alignment with source-tree.md
- **LGPD Compliance**: No PHI/PII exposure risks identified
- **Test Coverage**: Minimum 80% coverage across all critical paths
- **Integration Health**: All backend-database integrations functional
- **Code Quality**: No critical violations of coding standards

## Error Handling

- **Architecture Mismatch**: Abort with detailed divergence report
- **Database Connection Issues**: Provide diagnostic and recovery steps
- **Compliance Violations**: Generate detailed violation reports
- **Test Failures**: Provide specific failure analysis and fixes

## Success Criteria

- **Repository Health**: Clean architecture with no structural violations
- **Integration Reliability**: All backend-database connections validated
- **Compliance Status**: Full LGPD compliance with documented evidence
- **Test Coverage**: Comprehensive coverage across all critical components
- **Documentation**: Complete audit trail with actionable recommendations

## Constitutional Compliance

- **KISS/YAGNI**: Simplify complex code structures, remove unnecessary abstractions
- **Test-First**: Ensure all components have adequate test coverage
- **Architecture**: Follow established monorepo patterns and boundaries
- **Healthcare**: Maintain LGPD/ANVISA/CFM compliance in all components
- **Observability**: Implement proper logging and monitoring for audit trail

## Integration Points

- **Archon**: Persistent storage of audit results and compliance documentation
- **Serena**: Code analysis and validation capabilities
- **Supabase**: Database integration testing and schema validation
- **Desktop Commander**: File system operations and repository analysis
