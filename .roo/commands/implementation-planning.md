# Implementation Planning Workflow

## Description

Execute implementation planning workflow using plan template to generate design artifacts with constitutional compliance for NeonPro healthcare platform.

## Category

Specification

## Complexity

High

## MCP Tools Required

- desktop-commander
- archon

## Execution Flow

### Phase 1: Initialization

1. **Setup Script Execution**
   - Execute setup script: `.specify/scripts/bash/setup-plan.sh --json`
   - Parse JSON output for paths (FEATURE_SPEC, IMPL_PLAN, SPECS_DIR, BRANCH)
   - Validate all required paths exist and are accessible
   - Set up planning environment and logging

2. **Environment Validation**
   - Verify repository structure and permissions
   - Check template availability and completeness
   - Validate tool dependencies and configurations
   - Ensure constitutional documents are accessible

### Phase 2: Analysis and Preparation

1. **Feature Specification Analysis**
   - Read feature specification from FEATURE_SPEC path
   - Extract functional and non-functional requirements
   - Identify user stories and acceptance criteria
   - Map healthcare compliance requirements

2. **Constitutional Requirements Analysis**
   - Read constitution from `.specify/memory/constitution.md`
   - Extract constitutional commitments and constraints
   - Identify architectural and quality requirements
   - Map healthcare compliance obligations

3. **Template Preparation**
   - Load plan template from IMPL_PLAN path
   - Understand template structure and execution flow
   - Validate template completeness and integrity
   - Prepare for template execution

### Phase 3: Template Execution

1. **Template Phase Execution**
   - Execute template main function steps 1-10
   - Follow template's execution flow and error handling
   - Implement template's validation gates and checks
   - Ensure constitutional compliance throughout execution

2. **User-Provided Details Integration**
   - Incorporate user-provided implementation details from arguments
   - Update Technical Context section with specific details
   - Validate that user details align with requirements
   - Ensure healthcare compliance requirements are met

3. **Progress Tracking**
   - Update Progress Tracking as each phase completes
   - Follow template-defined progress tracking structure
   - Validate phase completion before proceeding
   - Log any issues or deviations

### Phase 4: Artifact Generation

1. **Phase 0 Artifact: Research**
   - Generate research.md with comprehensive research findings
   - Include technology analysis and justification
   - Document healthcare compliance research
   - Validate research completeness and accuracy

2. **Phase 1 Artifacts: Design Documents**
   - Generate data-model.md with complete data model design
   - Create contracts/ directory with API contracts
   - Generate quickstart.md with implementation guide
   - Validate all design artifacts for completeness

3. **Constitutional Compliance Validation**
   - Ensure all artifacts follow constitutional principles
   - Validate healthcare compliance requirements
   - Check architectural consistency and boundaries
   - Verify observability and monitoring considerations

### Phase 5: Verification and Validation

1. **Progress Tracking Verification**
   - Examine template's progress tracking section
   - Verify all phases are marked as complete
   - Validate that all quality gates passed
   - Check for any remaining issues or blockers

2. **Artifact Existence Verification**
   - Verify all required artifacts were generated
   - Check artifact locations and naming conventions
   - Validate artifact completeness and quality
   - Ensure artifacts meet constitutional requirements

3. **Error State Validation**
   - Examine template execution logs and progress tracking
   - Check for any ERROR states in execution
   - Validate that all error handling was appropriate
   - Ensure no critical issues remain unresolved

### Phase 6: Reporting and Documentation

1. **Completion Report Generation**
   - Generate completion report with outputs and status
   - Include branch name, file paths, and generated artifacts
   - Document execution status and any issues encountered
   - Provide recommendations for next steps

2. **Archon Integration**
   - Store implementation plan and artifacts in Archon
   - Create links to feature specification and related documents
   - Set up version control and knowledge management
   - Enable tracking and monitoring capabilities

## Input Parameters

- **implementation_details**: User-provided implementation details and requirements
- **compliance_level**: Healthcare compliance strictness level (standard, enhanced, strict)
- **architecture_constraints**: Specific architectural constraints and requirements
- **timeline_requirements**: Development timeline and milestone requirements

## Output Requirements

- **research.md**: Comprehensive research findings and analysis
- **data-model.md**: Complete data model design with relationships
- **contracts/**: API contracts and interface definitions
- **quickstart.md**: Implementation guide and getting started instructions
- **implementation_plan**: Complete implementation plan with technical context
- **validation_report**: Artifact completeness and compliance validation
- **completion_report**: Execution summary and next steps

## Quality Gates

- **Template Execution**: All template phases completed successfully
- **Artifact Generation**: All required artifacts generated in correct locations
- **Constitutional Compliance**: All artifacts follow constitutional principles
- **Healthcare Compliance**: All LGPD/ANVISA/CFM requirements addressed
- **Progress Tracking**: All phases marked as complete with proper validation
- **Error States**: No ERROR states in template execution
- **Documentation**: Complete documentation with clear guidance

## Error Handling

- **Setup Script Failure**: Abort with JSON parsing error and recovery steps
- **File Reading Failure**: Abort with file access error and specific file details
- **Template Execution Failure**: Follow template's error handling and gate checks
- **Artifact Generation Failure**: Abort with creation error and recovery steps
- **Constitutional Violations**: Report specific violations and require correction

## Success Criteria

- **Template Execution**: All template phases completed successfully with validation
- **Artifacts Generated**: All required design artifacts created and validated
- **Implementation Plan**: Complete implementation plan with technical context updated
- **Constitutional Compliance**: All constitutional principles followed in artifacts
- **Healthcare Compliance**: All LGPD/ANVISA/CFM requirements properly addressed
- **Readiness**: Ready for task generation phase with complete artifacts
- **Branch Management**: Development branch prepared and ready for implementation

## Constitutional Compliance

- **KISS/YAGNI**: Implementation plan is simple and necessary, no over-engineering
- **Test-First**: All components have test requirements and validation criteria
- **Architecture**: Design follows established monorepo patterns and boundaries
- **Healthcare**: LGPD/ANVISA/CFM compliance integrated into all design decisions
- **Observability**: Monitoring and logging requirements included in design

## Integration Points

- **Desktop Commander**: File system operations, script execution, and artifact generation
- **Archon**: Persistent storage of implementation plans and design artifacts
- **Serena**: Code analysis and validation for design completeness and compliance
