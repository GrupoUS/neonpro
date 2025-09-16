# Task Generation Workflow

## Description
Generate atomic tasks from PRDs and implementation plans with TDD enforcement, constitutional compliance, and healthcare validation for NeonPro platform.

## Category
Development

## Complexity
Medium

## MCP Tools Required
- archon
- serena

## Execution Flow

### Phase 1: Input Analysis and Preparation
1. **PRD and Plan Loading**
   - Load Product Requirements Document from Archon
   - Read implementation plan and technical specifications
   - Extract feature requirements and acceptance criteria
   - Identify healthcare compliance requirements

2. **Constitutional Analysis**
   - Read constitution from .specify/memory/constitution.md
   - Extract constitutional commitments and requirements
   - Identify testing and quality requirements
   - Map healthcare compliance constraints

### Phase 2: Task Analysis and Design
1. **Feature Breakdown**
   - Analyze feature components and modules
   - Identify data models and entities
   - Map API endpoints and contracts
   - Define user scenarios and workflows

2. **Task Categorization**
   - Setup tasks (environment, tooling, configuration)
   - Model tasks (data models, validation, relationships)
   - Service tasks (business logic, API endpoints)
   - Test tasks (unit, integration, E2E, compliance)
   - Integration tasks (frontend-backend, API-database)
   - Polish tasks (optimization, documentation, monitoring)

### Phase 3: TDD-First Task Generation
1. **Test Task Creation**
   - Create contract test tasks for all endpoints
   - Generate model validation test tasks
   - Design integration test scenarios
   - Plan compliance validation tests
   - Ensure all tests written first (RED state)

2. **Implementation Task Design**
   - Create implementation tasks after corresponding tests
   - Follow TDD order (RED → GREEN → REFACTOR)
   - Include acceptance criteria for each task
   - Define task dependencies and sequencing

### Phase 4: Constitutional Compliance Integration
1. **Testing Commitments**
   - Add tasks for RED first development
   - Include contract and integration test tasks
   - Plan test coverage validation
   - Ensure TDD compliance throughout

2. **Observability Commitments**
   - Add structured logging setup tasks
   - Include error context enrichment
   - Plan log routing and monitoring
   - Ensure observability for all components

3. **Versioning Commitments**
   - Include version bump tasks
   - Plan changelog updates
   - Document migration requirements
   - Ensure version management compliance

4. **Architecture Commitments**
   - Add import boundary audit tasks
   - Include library enforcement tasks
   - Plan architecture validation
   - Ensure structural compliance

5. **Simplicity Commitments**
   - Add complexity mitigation tasks
   - Include unnecessary abstraction removal
   - Plan simplicity validation
   - Ensure KISS/YAGNI compliance

### Phase 5: Parallelization and Optimization
1. **Task Dependency Analysis**
   - Identify independent tasks that can run in parallel
   - Mark parallelizable tasks with [P] annotation
   - Define task groups for concurrent execution
   - Ensure no file conflicts in parallel execution

2. **Resource Optimization**
   - Balance task distribution across team members
   - Optimize for critical path execution
   - Identify bottlenecks and mitigation strategies
   - Plan for resource constraints

### Phase 6: Validation and Quality Assurance
1. **Task Completeness Validation**
   - Verify all PRD requirements have corresponding tasks
   - Check all implementation plan components are covered
   - Ensure all compliance requirements are addressed
   - Validate test coverage for all components

2. **Quality Gate Validation**
   - Check TDD compliance (tests before implementation)
   - Verify constitutional commitments are enforced
   - Validate healthcare compliance requirements
   - Ensure architectural boundaries are respected

3. **Dependency Validation**
   - Verify task dependencies are correct and complete
   - Check for circular dependencies
   - Validate parallelization safety
   - Ensure critical path is optimized

### Phase 7: Documentation and Integration
1. **Task Documentation**
   - Create comprehensive tasks.md file
   - Include task descriptions, dependencies, and acceptance criteria
   - Document parallel execution groups
   - Provide clear execution guidance

2. **Archon Integration**
   - Store task list in Archon for persistence
   - Link tasks to corresponding PRD and plan
   - Create task tracking and monitoring setup
   - Enable knowledge base integration

## Input Parameters
- **prd_id**: Archon document ID for the Product Requirements Document
- **plan_id**: Archon document ID for the implementation plan
- **feature_directory**: Path to the feature specification directory
- **complexity_threshold**: Maximum allowed complexity per task

## Output Requirements
- **tasks.md**: Comprehensive task list with numbering and dependencies
- **task_dependencies.json**: Machine-readable task dependency graph
- **parallel_groups.json**: Groups of tasks that can be executed in parallel
- **validation_report.md**: Task completeness and quality validation report
- **archon_tasks**: Tasks created in Archon with proper metadata and links

## Quality Gates
- **Contract Coverage**: Every endpoint in contracts/ has a preceding contract test task
- **Model Coverage**: Every entity in data-model.md has a model creation + validation test task
- **Scenario Coverage**: Every PRD user scenario → integration test task (RED first)
- **TDD Order**: No implementation task appears before all its prerequisite test tasks
- **Parallel Safety**: All [P] tasks operate on disjoint file paths
- **Acceptance Criteria**: Each task lists ≥1 explicit, testable criterion
- **Constitutional Commitments**: For each commitment category at least one task enforces it
- **Gates Passed**: Both Constitution gates in plan.md are PASS
- **No Unknowns**: Zero remaining 'NEEDS CLARIFICATION' tokens
- **Complexity Mitigation**: For every row in Complexity Tracking table, a matching mitigation task exists
- **Structure Consistency**: All task paths align with the resolved Structure Decision
- **Compliance**: Any task touching PHI/PII includes LGPD/ANVISA acceptance criteria note
- **Versioning**: If version bump required (commitment), a task updates version + changelog
- **Observability**: Logging / tracing setup tasks exist for new code areas
- **JSON Summary Integrity**: Summary arrays lengths match number of tasks & IDs sequential (T001..Tnn)

## Error Handling
- **Missing PRD/Plan**: Abort with error indicating required input documents
- **Constitutional Violations**: Report specific violations and halt execution
- **Complexity Threshold Exceeded**: Split complex tasks or adjust threshold
- **Dependency Conflicts**: Resolve conflicts and adjust task sequencing
- **Parallelization Conflicts**: Identify file conflicts and adjust [P] markings

## Success Criteria
- **Complete Coverage**: All PRD requirements and plan components have corresponding tasks
- **TDD Compliance**: All implementation tasks have corresponding test tasks defined first
- **Constitutional Compliance**: All constitutional commitments are enforced through specific tasks
- **Healthcare Compliance**: All LGPD/ANVISA/CFM requirements are addressed in appropriate tasks
- **Executable Plan**: Task list is clear, actionable, and ready for team execution
- **Optimized Execution**: Parallelization opportunities identified and documented
- **Quality Assurance**: All quality gates passed with validation evidence

## Constitutional Compliance
- **KISS/YAGNI**: Tasks are simple and necessary, no over-engineering
- **Test-First**: All implementation tasks have corresponding test tasks (RED before GREEN)
- **Architecture**: Tasks respect architectural boundaries and library constraints
- **Healthcare**: LGPD/ANVISA/CFM compliance integrated into all relevant tasks
- **Observability**: Logging and monitoring tasks included for all new components

## Usage Examples
```bash
# Generate tasks for a feature
cline workflow execute task-generation --prd_id prd-123 --plan_id plan-456 --feature_directory specs/001-feature

# Generate tasks with custom complexity threshold
cline workflow execute task-generation --prd_id prd-789 --plan_id plan-012 --complexity_threshold 5
```

## Integration Points
- **Archon**: Persistent storage of task lists and linking to PRDs/plans
- **Serena**: Code analysis and validation for task dependencies and complexity
- **Desktop Commander**: File system operations for task documentation and validation
